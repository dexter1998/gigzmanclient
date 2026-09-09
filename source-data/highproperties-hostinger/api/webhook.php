<?php
/**
 * WhatsApp Cloud API webhook.
 *
 * GET  — Meta's subscription handshake (hub.challenge).
 * POST — inbound messages and delivery statuses; each inbound message is logged
 *        as a CRM conversation entry and can trigger a keyword auto-reply.
 *
 * Set this URL in Meta → WhatsApp → Configuration → Callback URL:
 *   https://www.highproperties.in/api/webhook.php
 * Verify token: whatever you put in WA_VERIFY_TOKEN.
 */
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/whatsapp.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

/* ── 1. subscription handshake ──────────────────────────────────────────── */
if ($method === 'GET') {
    $mode      = $_GET['hub_mode']         ?? $_GET['hub.mode']         ?? '';
    $token     = $_GET['hub_verify_token'] ?? $_GET['hub.verify_token'] ?? '';
    $challenge = $_GET['hub_challenge']    ?? $_GET['hub.challenge']    ?? '';
    $expected  = hp_env('WA_VERIFY_TOKEN');

    if ($mode === 'subscribe' && $expected && hash_equals((string)$expected, (string)$token)) {
        header('Content-Type: text/plain'); echo $challenge; exit;
    }
    http_response_code(403); echo 'Verification failed'; exit;
}

if ($method !== 'POST') { http_response_code(405); exit; }

/* ── 2. verify Meta's payload signature ─────────────────────────────────── */
$raw = file_get_contents('php://input') ?: '';
$appSecret = hp_env('WA_APP_SECRET');
if ($appSecret) {
    $sig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
    $mine = 'sha256=' . hash_hmac('sha256', $raw, $appSecret);
    if (!$sig || !hash_equals($mine, $sig)) {
        error_log('[highproperties] webhook signature mismatch');
        http_response_code(403); exit;
    }
}

// Always ack fast — Meta retries aggressively on non-200.
http_response_code(200);
header('Content-Type: application/json');
echo '{"ok":true}';
if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();

/* ── 3. process ─────────────────────────────────────────────────────────── */
$payload = json_decode($raw, true) ?: [];
$events  = [];

foreach ($payload['entry'] ?? [] as $entry) {
    foreach ($entry['changes'] ?? [] as $change) {
        $value    = $change['value'] ?? [];
        $contacts = [];
        foreach ($value['contacts'] ?? [] as $c) {
            $contacts[$c['wa_id'] ?? ''] = $c['profile']['name'] ?? '';
        }

        foreach ($value['messages'] ?? [] as $m) {
            $from = (string)($m['from'] ?? '');
            $text = $m['text']['body']
                 ?? $m['button']['text']
                 ?? $m['interactive']['list_reply']['title']
                 ?? $m['interactive']['button_reply']['title']
                 ?? ('[' . ($m['type'] ?? 'message') . ']');

            $events[] = [
                'id'         => 'WA-' . ($m['id'] ?? bin2hex(random_bytes(4))),
                'direction'  => 'in',
                'wa_id'      => $from,
                'name'       => $contacts[$from] ?? '',
                'text'       => $text,
                'type'       => $m['type'] ?? 'text',
                'created_at' => gmdate('c', (int)($m['timestamp'] ?? time())),
            ];

            hp_wa_auto_reply($from, (string)$text, $contacts[$from] ?? '');
        }

        foreach ($value['statuses'] ?? [] as $s) {
            $events[] = [
                'id'         => 'WS-' . ($s['id'] ?? bin2hex(random_bytes(4))),
                'direction'  => 'status',
                'wa_id'      => (string)($s['recipient_id'] ?? ''),
                'text'       => (string)($s['status'] ?? ''),
                'created_at' => gmdate('c', (int)($s['timestamp'] ?? time())),
            ];
        }
    }
}

if ($events) {
    $log = hp_store_read('wa_conversations');
    foreach ($events as $e) $log[] = $e;
    hp_store_write('wa_conversations', array_slice($log, -2000));
}

/**
 * Keyword auto-reply. Runs inside the 24h service window opened by the
 * customer's own message, so plain text is allowed here (no template needed).
 */
function hp_wa_auto_reply(string $from, string $text, string $name): void {
    if (!hp_wa_ready()) return;
    if (!hp_rate_limit('wa_reply_' . $from, 4, 900)) return;   // don't spam loops

    $t     = mb_strtolower(trim($text));
    $first = $name ? (' ' . explode(' ', trim($name))[0]) : '';
    $reply = null;

    if (preg_match('/\b(hi|hello|hey|namaste)\b/u', $t)) {
        $reply = "Hello$first! 👋 This is High Properties — Building Future.\n\n"
               . "Reply with a number:\n1️⃣ Buy a property\n2️⃣ Sell / list my property\n"
               . "3️⃣ Rent or lease\n4️⃣ Construction & collaboration\n\n"
               . "Or just tell us the location and budget you have in mind.";
    } elseif (preg_match('/^1\b|\bbuy\b|\bpurchase\b/u', $t)) {
        $reply = "Great — what's your budget range and preferred sector? "
               . "We cover Dwarka Expressway, Golf Course Extension, New Gurugram and the wider NCR.";
    } elseif (preg_match('/^2\b|\bsell\b|\blist\b/u', $t)) {
        $reply = "We can help you sell. Share the property type, sector and approximate size — "
               . "we'll send a free valuation and a pricing plan.";
    } elseif (preg_match('/^3\b|\brent\b|\blease\b/u', $t)) {
        $reply = "Noted — rental. Please share your budget, preferred locality and move-in date.";
    } elseif (preg_match('/^4\b|\bconstruct|\bcollab/u', $t)) {
        $reply = "We do turnkey construction and land collaboration. "
               . "Share the plot size and location and our team will call you.";
    } elseif (preg_match('/\b(price|rate|cost|kitna|value)\b/u', $t)) {
        $reply = "Happy to help with pricing. Which sector and property type are you asking about?";
    }

    if ($reply) hp_wa_text($from, $reply);
}
