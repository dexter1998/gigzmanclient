<?php
/**
 * High Properties — configuration loader.
 *
 * Real secrets live in  ../.env  (outside the web root if your host allows it).
 * Nothing sensitive is ever hardcoded here, and .env is blocked by .htaccess.
 */
declare(strict_types=1);

/* Warnings and deprecations must never leak into a JSON/CSV response body.
   They go to the error log instead. */
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
error_reporting(E_ALL);

function hp_env_load(): array {
    static $env = null;
    if ($env !== null) return $env;
    $env = [];
    foreach ([__DIR__ . '/../.env', __DIR__ . '/../../.env'] as $path) {
        if (!is_readable($path)) continue;
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            $pos = strpos($line, '=');
            if ($pos === false) continue;
            $k = trim(substr($line, 0, $pos));
            $v = trim(substr($line, $pos + 1));
            if (strlen($v) > 1 && ($v[0] === '"' || $v[0] === "'") && $v[0] === substr($v, -1)) {
                $v = substr($v, 1, -1);
            }
            $env[$k] = $v;
        }
        break;
    }
    return $env;
}

function hp_env(string $key, ?string $default = null): ?string {
    $env = hp_env_load();
    if (array_key_exists($key, $env) && $env[$key] !== '') return $env[$key];
    $v = getenv($key);
    return ($v !== false && $v !== '') ? $v : $default;
}

/** Business constants — safe to keep in source control. */
const HP_BUSINESS = [
    'name'     => 'High Properties',
    'tagline'  => 'Building Future',
    'phone'    => '+919821553693',
    'whatsapp' => '919821553693',
    'email'    => 'highproperties9@gmail.com',
    'city'     => 'Gurugram',
    'region'   => 'Haryana',
    'country'  => 'IN',
];

/** Storage paths (used when MySQL is not configured). */
const HP_STORAGE   = __DIR__ . '/../storage';
const HP_SEED_JSON = __DIR__ . '/../data/listings.json';

/* ── shared helpers ─────────────────────────────────────────────────────── */

function hp_json(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function hp_fail(string $message, int $status = 400, array $extra = []): never {
    hp_json(['ok' => false, 'error' => $message] + $extra, $status);
}

function hp_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    if ($raw !== '') {
        $j = json_decode($raw, true);
        if (is_array($j)) return $j;
    }
    return $_POST ?: [];
}

function hp_client_ip(): string {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $k) {
        if (!empty($_SERVER[$k])) return trim(explode(',', $_SERVER[$k])[0]);
    }
    return '0.0.0.0';
}

/** Simple file-based rate limiter — no extensions required. */
function hp_rate_limit(string $bucket, int $max, int $windowSeconds): bool {
    if (!is_dir(HP_STORAGE)) @mkdir(HP_STORAGE, 0775, true);
    $file = HP_STORAGE . '/rl_' . preg_replace('/[^a-z0-9_]/i', '_', $bucket) . '.json';
    $now  = time();
    $hits = is_readable($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
    $hits = array_values(array_filter($hits, fn($t) => ($now - (int)$t) < $windowSeconds));
    if (count($hits) >= $max) return false;
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return true;
}

/** Normalise an Indian mobile number to E.164 (91XXXXXXXXXX) or null. */
function hp_normalise_phone(string $raw): ?string {
    $d = preg_replace('/\D+/', '', $raw) ?? '';
    if (strlen($d) === 10 && $d[0] >= '6') return '91' . $d;
    if (strlen($d) === 12 && str_starts_with($d, '91')) return $d;
    if (strlen($d) === 13 && str_starts_with($d, '091')) return substr($d, 1);
    return null;
}


/** Render paise-free Indian currency: 14500000 -> "₹1.45 Cr". */
function hp_price_label(?int $n): string {
    if ($n === null || $n <= 0) return '';
    if ($n >= 10000000) return '₹' . rtrim(rtrim(number_format($n / 10000000, 2, '.', ''), '0'), '.') . ' Cr';
    if ($n >= 100000)   return '₹' . rtrim(rtrim(number_format($n / 100000, 2, '.', ''), '0'), '.') . ' L';
    return '₹' . number_format($n, 0, '.', ',');
}
