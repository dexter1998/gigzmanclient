<?php
/**
 * Server-side staff authentication.
 *
 * Replaces the previous client-side credential list, which shipped the admin
 * passcode to every visitor in the page source. Credentials now live as
 * password hashes in .env and are never sent to the browser.
 *
 *   .env:  HP_USERS='[{"u":"yogesh","role":"admin","hash":"$2y$..."}]'
 *   Generate a hash:  php -r 'echo password_hash("your-password", PASSWORD_DEFAULT);'
 */
declare(strict_types=1);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

function hp_session_start(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('hp_staff');
    session_start();
}

function hp_users(): array {
    $out = [];
    $j = json_decode((string)hp_env('HP_USERS', '[]'), true);
    if (is_array($j)) $out = $j;
    // staff created at runtime from Manage Access
    foreach (hp_store_read('staff') as $u) $out[] = $u;
    return $out;
}

function hp_staff_save(array $rows): bool { return hp_store_write('staff', $rows); }

function hp_current_user(): ?array {
    hp_session_start();
    $u = $_SESSION['hp_user'] ?? null;
    return is_array($u) ? $u : null;
}

function hp_require_role(string ...$roles): array {
    $u = hp_current_user();
    if (!$u) hp_fail('Not signed in', 401);
    if ($roles && !in_array($u['role'] ?? '', $roles, true)) hp_fail('Forbidden', 403);
    return $u;
}

/* ── routes ─────────────────────────────────────────────────────────────── */
if (basename((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === 'auth.php') {
    header('Content-Type: application/json');
    $action = $_GET['action'] ?? 'me';

    if ($action === 'me') {
        $u = hp_current_user();
        hp_json(['ok' => true, 'user' => $u ? ['username' => $u['username'], 'role' => $u['role']] : null]);
    }

    if ($action === 'logout') {
        hp_session_start();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            setcookie(session_name(), '', time() - 42000, '/');
        }
        session_destroy();
        hp_json(['ok' => true]);
    }

    if ($action === 'login') {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') hp_fail('Method not allowed', 405);
        if (!hp_rate_limit('login_' . hp_client_ip(), 8, 900)) {
            hp_fail('Too many attempts. Try again in 15 minutes.', 429);
        }
        $in   = hp_body();
        $user = strtolower(trim((string)($in['username'] ?? '')));
        $pass = (string)($in['password'] ?? $in['passcode'] ?? '');

        $users = hp_users();
        if (!$users) hp_fail('No staff accounts configured. Set HP_USERS in .env.', 503);

        foreach ($users as $u) {
            if (strtolower((string)($u['u'] ?? '')) !== $user) continue;
            if (!password_verify($pass, (string)($u['hash'] ?? ''))) break;

            hp_session_start();
            session_regenerate_id(true);
            $_SESSION['hp_user'] = ['username' => $u['u'], 'role' => $u['role'] ?? 'staff'];
            hp_json(['ok' => true, 'user' => $_SESSION['hp_user']]);
        }
        usleep(random_int(150000, 400000));      // blunt timing/brute-force signal
        hp_fail('Invalid username or password', 401);
    }

    if ($action === 'staff_list') {
        hp_require_role('admin');
        $rows = array_map(
            fn($u) => ['username' => $u['u'] ?? '', 'role' => $u['role'] ?? 'staff', 'managed' => true],
            hp_store_read('staff')
        );
        $seed = json_decode((string)hp_env('HP_USERS', '[]'), true) ?: [];
        foreach ($seed as $u) {
            $rows[] = ['username' => $u['u'] ?? '', 'role' => $u['role'] ?? 'staff', 'managed' => false];
        }
        hp_json(['ok' => true, 'staff' => $rows]);
    }

    if ($action === 'staff_add') {
        hp_require_role('admin');
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') hp_fail('Method not allowed', 405);
        $in   = hp_body();
        $u    = strtolower(trim((string)($in['username'] ?? '')));
        $pass = (string)($in['password'] ?? '');
        $role = ($in['role'] ?? 'staff') === 'admin' ? 'admin' : 'staff';

        if (!preg_match('/^[a-z0-9._-]{3,32}$/', $u)) {
            hp_fail('Username must be 3–32 characters: letters, numbers, dot, dash or underscore.');
        }
        if (strlen($pass) < 10) hp_fail('Password must be at least 10 characters.');
        foreach (hp_users() as $x) {
            if (strtolower((string)($x['u'] ?? '')) === $u) hp_fail('That username already exists.');
        }
        $rows   = hp_store_read('staff');
        $rows[] = ['u' => $u, 'role' => $role, 'hash' => password_hash($pass, PASSWORD_DEFAULT)];
        hp_staff_save($rows);
        hp_json(['ok' => true, 'username' => $u, 'role' => $role]);
    }

    if ($action === 'staff_remove') {
        hp_require_role('admin');
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') hp_fail('Method not allowed', 405);
        $u    = strtolower(trim((string)(hp_body()['username'] ?? '')));
        $me   = hp_current_user();
        if ($u === strtolower((string)($me['username'] ?? ''))) hp_fail('You cannot remove your own account.');
        $rows = array_values(array_filter(hp_store_read('staff'),
                    fn($x) => strtolower((string)($x['u'] ?? '')) !== $u));
        hp_staff_save($rows);
        hp_json(['ok' => true]);
    }

    hp_fail('Unknown action', 404);
}
