<?php
/**
 * POST /api/leads.php — capture an enquiry, store it, and fire WhatsApp CRM automation.
 * Responds with a wa.me fallback URL so the front-end still works if WhatsApp is unconfigured.
 */
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/whatsapp.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') hp_fail('Method not allowed', 405);

if (!hp_rate_limit('lead_' . hp_client_ip(), 6, 600)) {
    hp_fail('Too many submissions. Please call us instead.', 429);
}

$in = hp_body();

// honeypot — bots fill hidden fields
if (!empty($in['company'])) hp_json(['ok' => true, 'id' => 'skipped']);

$name  = trim((string)($in['name']  ?? ''));
$phone = trim((string)($in['phone'] ?? ''));
$email = trim((string)($in['email'] ?? ''));

if ($name === '' || mb_strlen($name) > 120)      hp_fail('Please enter your name.');
$msisdn = hp_normalise_phone($phone);
if (!$msisdn)                                     hp_fail('Please enter a valid Indian mobile number.');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) hp_fail('Please enter a valid email.');
if (empty($in['consent']))                        hp_fail('Please accept the consent notice to proceed.');

$lead = hp_lead_save([
    'name'         => $name,
    'phone'        => $msisdn,
    'email'        => $email,
    'role'         => trim((string)($in['role'] ?? '')),
    'propertyType' => trim((string)($in['propertyType'] ?? '')),
    'budget'       => trim((string)($in['budget'] ?? '')),
    'location'     => trim((string)($in['location'] ?? '')),
    'message'      => mb_substr(trim((string)($in['message'] ?? '')), 0, 2000),
    'source'       => trim((string)($in['source'] ?? 'website')),
]);

// ── CRM automation ────────────────────────────────────────────────────────
$automation = ['owner' => null, 'customer' => null];
if (hp_wa_ready()) {
    $automation['owner'] = hp_wa_notify_owner($lead);
    $tpl = hp_env('WA_TEMPLATE_LEAD');
    if ($tpl) {
        $automation['customer'] = hp_wa_template($msisdn, $tpl, [$name, HP_BUSINESS['name']]);
    }
}

// Always give the browser a click-to-chat URL as a guaranteed path to a human.
$text = rawurlencode(sprintf(
    "New enquiry from the High Properties website\n\nName: %s\nPhone: +%s%s%s\nRef: %s",
    $name, $msisdn,
    $email ? "\nEmail: $email" : '',
    !empty($in['message']) ? "\nRequirement: " . $in['message'] : '',
    $lead['id']
));

hp_json([
    'ok'         => true,
    'id'         => $lead['id'],
    'automation' => $automation,
    'whatsapp'   => 'https://wa.me/' . HP_BUSINESS['whatsapp'] . '?text=' . $text,
    'message'    => 'Thanks — our team will call you shortly.',
]);
