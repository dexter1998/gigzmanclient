<?php
/** GET /api/listings.php — public catalogue. Optional ?id= or ?slug= for one. */
declare(strict_types=1);
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=120');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') hp_fail('Method not allowed', 405);

$rows = hp_listings_all(true);

$id   = trim((string)($_GET['id']   ?? ''));
$slug = trim((string)($_GET['slug'] ?? ''));
if ($id !== '' || $slug !== '') {
    foreach ($rows as $r) {
        if (($id !== '' && ($r['id'] ?? '') === $id) || ($slug !== '' && ($r['slug'] ?? '') === $slug)) {
            hp_json(['ok' => true, 'listing' => $r]);
        }
    }
    hp_fail('Listing not found', 404);
}

hp_json([
    'ok'       => true,
    'updated'  => gmdate('c'),
    'count'    => count($rows),
    'listings' => array_values($rows),
]);
