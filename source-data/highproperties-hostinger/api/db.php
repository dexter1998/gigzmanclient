<?php
/**
 * Storage layer.
 *
 * Uses MySQL when DB_* is configured in .env (Hostinger gives you this), and
 * transparently falls back to a JSON file so the site keeps working before the
 * database is set up. Same API either way.
 */
declare(strict_types=1);
require_once __DIR__ . '/config.php';

function hp_db(): ?PDO {
    static $pdo = null, $tried = false;
    if ($tried) return $pdo;
    $tried = true;

    $host = hp_env('DB_HOST');
    $name = hp_env('DB_NAME');
    $user = hp_env('DB_USER');
    if (!$host || !$name || !$user) return null;   // not configured -> JSON mode

    try {
        $pdo = new PDO(
            sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                    $host, hp_env('DB_PORT', '3306'), $name),
            $user, (string)hp_env('DB_PASS', ''),
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (Throwable $e) {
        error_log('[highproperties] DB connect failed: ' . $e->getMessage());
        $pdo = null;
    }
    return $pdo;
}

/* ── JSON fallback store ────────────────────────────────────────────────── */

function hp_store_path(string $name): string {
    if (!is_dir(HP_STORAGE)) @mkdir(HP_STORAGE, 0775, true);
    return HP_STORAGE . '/' . $name . '.json';
}

function hp_store_read(string $name, array $default = []): array {
    $p = hp_store_path($name);
    if (!is_readable($p)) return $default;
    $j = json_decode((string)file_get_contents($p), true);
    return is_array($j) ? $j : $default;
}

function hp_store_write(string $name, array $rows): bool {
    return (bool)@file_put_contents(
        hp_store_path($name),
        json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
}

/* ── listings ───────────────────────────────────────────────────────────── */

function hp_listings_all(bool $activeOnly = true): array {
    $pdo = hp_db();
    if ($pdo) {
        try {
            $sql  = 'SELECT * FROM listings' . ($activeOnly ? ' WHERE active = 1' : '')
                  . ' ORDER BY featured DESC, price DESC';
            $rows = $pdo->query($sql)->fetchAll();
            return array_map('hp_listing_hydrate', $rows);
        } catch (Throwable $e) {
            error_log('[highproperties] listings query failed: ' . $e->getMessage());
        }
    }

    // JSON mode: admin-managed file first, then the shipped seed.
    $rows = hp_store_read('listings');
    if (!$rows && is_readable(HP_SEED_JSON)) {
        $seed = json_decode((string)file_get_contents(HP_SEED_JSON), true);
        $rows = $seed['listings'] ?? [];
    }
    if ($activeOnly) {
        $rows = array_values(array_filter($rows, fn($r) => ($r['active'] ?? true) !== false));
    }
    return $rows;
}

/** Turn a DB row into the shape the front-end expects. */
function hp_listing_hydrate(array $r): array {
    foreach (['purpose', 'specs', 'amenities', 'images'] as $k) {
        if (isset($r[$k]) && is_string($r[$k])) {
            $d = json_decode($r[$k], true);
            $r[$k] = is_array($d) ? $d : array_values(array_filter(array_map('trim', explode(',', $r[$k]))));
        }
    }
    foreach (['price', 'area', 'beds', 'baths'] as $k) {
        if (isset($r[$k]) && $r[$k] !== null && $r[$k] !== '') $r[$k] = $r[$k] + 0;
    }
    $r['featured'] = !empty($r['featured']);
    $r['active']   = !isset($r['active']) || (bool)$r['active'];
    return $r;
}

function hp_listing_save(array $d): array {
    $pdo = hp_db();
    $id  = trim((string)($d['id'] ?? '')) ?: 'HP-' . strtoupper(bin2hex(random_bytes(3)));
    $row = [
        'id'          => $id,
        'slug'        => (string)($d['slug'] ?? hp_slug((string)($d['title'] ?? $id))),
        'title'       => (string)($d['title'] ?? ''),
        'type'        => (string)($d['type'] ?? ''),
        'category'    => (string)($d['category'] ?? 'residential'),
        'purpose'     => (array)($d['purpose'] ?? ['buy']),
        'price'       => isset($d['price']) && $d['price'] !== '' ? (int)$d['price'] : null,
        'priceLabel'  => trim((string)($d['priceLabel'] ?? '')) !== ''
                         ? (string)$d['priceLabel']
                         : hp_price_label(isset($d['price']) && $d['price'] !== '' ? (int)$d['price'] : null),
        'city'        => (string)($d['city'] ?? 'Gurugram'),
        'sector'      => (string)($d['sector'] ?? ''),
        'locality'    => (string)($d['locality'] ?? ''),
        'location'    => (string)($d['location'] ?? ''),
        'beds'        => isset($d['beds']) && $d['beds'] !== '' ? (int)$d['beds'] : null,
        'baths'       => isset($d['baths']) && $d['baths'] !== '' ? (int)$d['baths'] : null,
        'area'        => isset($d['area']) && $d['area'] !== '' ? (float)$d['area'] : null,
        'areaUnit'    => (string)($d['areaUnit'] ?? 'sq.ft'),
        'status'      => (string)($d['status'] ?? ''),
        'badge'       => (string)($d['badge'] ?? ''),
        'featured'    => !empty($d['featured']),
        'icon'        => (string)($d['icon'] ?? ''),
        'gradient'    => (string)($d['gradient'] ?? ''),
        'specs'       => (array)($d['specs'] ?? []),
        'amenities'   => (array)($d['amenities'] ?? []),
        'description' => (string)($d['description'] ?? ''),
        'rera'        => (string)($d['rera'] ?? ''),
        'postedOn'    => (string)($d['postedOn'] ?? date('Y-m-d')),
        'active'      => !isset($d['active']) || (bool)$d['active'],
    ];

    if ($pdo) {
        $cols = array_keys($row);
        $sql  = 'REPLACE INTO listings (`' . implode('`,`', $cols) . '`) VALUES ('
              . implode(',', array_fill(0, count($cols), '?')) . ')';
        $vals = array_map(
            fn($k) => is_array($row[$k]) ? json_encode($row[$k], JSON_UNESCAPED_UNICODE)
                    : (is_bool($row[$k]) ? (int)$row[$k] : $row[$k]),
            $cols
        );
        $pdo->prepare($sql)->execute($vals);
        return $row;
    }

    $rows = hp_store_read('listings');
    if (!$rows && is_readable(HP_SEED_JSON)) {
        $seed = json_decode((string)file_get_contents(HP_SEED_JSON), true);
        $rows = $seed['listings'] ?? [];
    }
    $found = false;
    foreach ($rows as $i => $r) {
        if (($r['id'] ?? '') === $id) { $rows[$i] = $row; $found = true; break; }
    }
    if (!$found) $rows[] = $row;
    hp_store_write('listings', $rows);
    return $row;
}

function hp_listing_delete(string $id): bool {
    $pdo = hp_db();
    if ($pdo) {
        return $pdo->prepare('DELETE FROM listings WHERE id = ?')->execute([$id]);
    }
    $rows = array_values(array_filter(hp_store_read('listings'), fn($r) => ($r['id'] ?? '') !== $id));
    return hp_store_write('listings', $rows);
}

function hp_slug(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-') ?: 'listing';
}

/* ── leads ──────────────────────────────────────────────────────────────── */

function hp_lead_save(array $lead): array {
    $lead['id']         = $lead['id'] ?? ('LD-' . strtoupper(bin2hex(random_bytes(4))));
    $lead['created_at'] = $lead['created_at'] ?? gmdate('c');
    $lead['ip']         = $lead['ip'] ?? hp_client_ip();
    $lead['stage']      = $lead['stage'] ?? 'new';

    $pdo = hp_db();
    if ($pdo) {
        try {
            $pdo->prepare(
                'INSERT INTO leads (id, name, phone, email, role, property_type, budget,
                                    location, message, source, stage, ip, created_at)
                 VALUES (:id,:name,:phone,:email,:role,:property_type,:budget,
                         :location,:message,:source,:stage,:ip,:created_at)'
            )->execute([
                ':id' => $lead['id'], ':name' => $lead['name'] ?? '',
                ':phone' => $lead['phone'] ?? '', ':email' => $lead['email'] ?? '',
                ':role' => $lead['role'] ?? '', ':property_type' => $lead['propertyType'] ?? '',
                ':budget' => $lead['budget'] ?? '', ':location' => $lead['location'] ?? '',
                ':message' => $lead['message'] ?? '', ':source' => $lead['source'] ?? 'website',
                ':stage' => $lead['stage'], ':ip' => $lead['ip'],
                ':created_at' => date('Y-m-d H:i:s'),
            ]);
            return $lead;
        } catch (Throwable $e) {
            error_log('[highproperties] lead insert failed: ' . $e->getMessage());
        }
    }
    $rows = hp_store_read('leads');
    $rows[] = $lead;
    hp_store_write('leads', $rows);
    return $lead;
}

function hp_leads_all(int $limit = 500): array {
    $pdo = hp_db();
    if ($pdo) {
        try {
            $st = $pdo->prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT ?');
            $st->bindValue(1, $limit, PDO::PARAM_INT);
            $st->execute();
            return $st->fetchAll();
        } catch (Throwable $e) {
            error_log('[highproperties] leads query failed: ' . $e->getMessage());
        }
    }
    $rows = hp_store_read('leads');
    return array_slice(array_reverse($rows), 0, $limit);
}
