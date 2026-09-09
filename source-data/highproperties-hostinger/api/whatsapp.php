<?php
/**
 * WhatsApp Business Cloud API helper (Meta Graph API).
 *
 * Configure in .env:
 *   WA_PHONE_NUMBER_ID   numeric id of your WhatsApp Business number
 *   WA_ACCESS_TOKEN      permanent system-user token
 *   WA_OWNER_MSISDN      where internal new-lead alerts go (default: business number)
 *   WA_TEMPLATE_LEAD     approved template name for the customer auto-reply
 *   WA_VERIFY_TOKEN      any random string; must match the value set in Meta's webhook UI
 *
 * With none of these set every function no-ops safely, so the site still works
 * and the front-end keeps using its click-to-chat fallback.
 */
declare(strict_types=1);
require_once __DIR__ . '/config.php';

function hp_wa_ready(): bool {
    return (bool)hp_env('WA_PHONE_NUMBER_ID') && (bool)hp_env('WA_ACCESS_TOKEN');
}

function hp_wa_post(array $payload): array {
    if (!hp_wa_ready()) return ['ok' => false, 'skipped' => 'whatsapp not configured'];

    $url = sprintf('https://graph.facebook.com/%s/%s/messages',
                   hp_env('WA_API_VERSION', 'v21.0'), hp_env('WA_PHONE_NUMBER_ID'));

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . hp_env('WA_ACCESS_TOKEN'),
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        error_log('[highproperties] WA curl error: ' . $err);
        return ['ok' => false, 'error' => $err];
    }
    $json = json_decode((string)$body, true) ?: [];
    if ($code >= 300) error_log('[highproperties] WA API ' . $code . ': ' . $body);
    return ['ok' => $code < 300, 'status' => $code, 'response' => $json];
}

/** Free-form text — only delivered inside an open 24-hour customer service window. */
function hp_wa_text(string $to, string $text): array {
    $to = hp_normalise_phone($to);
    if (!$to) return ['ok' => false, 'error' => 'invalid number'];
    return hp_wa_post([
        'messaging_product' => 'whatsapp',
        'to'                => $to,
        'type'              => 'text',
        'text'              => ['preview_url' => false, 'body' => $text],
    ]);
}

/** Approved template — the only way to open a conversation with a new lead. */
function hp_wa_template(string $to, string $template, array $bodyParams = [], string $lang = 'en'): array {
    $to = hp_normalise_phone($to);
    if (!$to) return ['ok' => false, 'error' => 'invalid number'];

    $payload = [
        'messaging_product' => 'whatsapp',
        'to'                => $to,
        'type'              => 'template',
        'template'          => ['name' => $template, 'language' => ['code' => $lang]],
    ];
    if ($bodyParams) {
        $payload['template']['components'] = [[
            'type'       => 'body',
            'parameters' => array_map(fn($p) => ['type' => 'text', 'text' => (string)$p], $bodyParams),
        ]];
    }
    return hp_wa_post($payload);
}

/** Internal alert to the owner when a new lead lands. */
function hp_wa_notify_owner(array $lead): array {
    $to = hp_env('WA_OWNER_MSISDN', HP_BUSINESS['whatsapp']);
    $lines = [
        '🔔 New website enquiry',
        'Name: '   . ($lead['name']  ?? '—'),
        'Phone: '  . ($lead['phone'] ?? '—'),
        'Email: '  . ($lead['email'] ?? '—'),
        'Looking for: ' . trim(($lead['propertyType'] ?? '') . ' ' . ($lead['budget'] ?? '')),
        'Area: '   . ($lead['location'] ?? '—'),
        'Note: '   . ($lead['message'] ?? '—'),
        'Ref: '    . ($lead['id'] ?? '—'),
    ];
    return hp_wa_text((string)$to, implode("\n", $lines));
}
