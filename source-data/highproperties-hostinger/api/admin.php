<?php
/**
 * Authenticated admin API — listings CRUD, lead export, CSV import.
 * Every route requires a signed-in staff session (see auth.php).
 */
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json');
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($action) {

    case 'listings':                       // GET — includes inactive
        hp_require_role('admin', 'staff');
        hp_json(['ok' => true, 'listings' => hp_listings_all(false)]);

    case 'save':                           // POST — create or update
        hp_require_role('admin');
        if ($method !== 'POST') hp_fail('Method not allowed', 405);
        $in = hp_body();
        if (trim((string)($in['title'] ?? '')) === '') hp_fail('Title is required.');
        hp_json(['ok' => true, 'listing' => hp_listing_save($in)]);

    case 'delete':                         // POST
        hp_require_role('admin');
        if ($method !== 'POST') hp_fail('Method not allowed', 405);
        $id = trim((string)(hp_body()['id'] ?? ''));
        if ($id === '') hp_fail('id is required.');
        hp_json(['ok' => hp_listing_delete($id)]);

    case 'leads':                          // GET
        hp_require_role('admin', 'staff');
        hp_json(['ok' => true, 'leads' => hp_leads_all(1000)]);

    case 'conversations':                  // GET — WhatsApp inbox
        hp_require_role('admin', 'staff');
        hp_json(['ok' => true, 'conversations' => array_reverse(hp_store_read('wa_conversations'))]);

    case 'export':                         // GET — leads as CSV
        hp_require_role('admin');
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="highproperties-leads-' . date('Y-m-d') . '.csv"');
        $out  = fopen('php://output', 'w');
        $rows = hp_leads_all(5000);
        $cols = ['id','name','phone','email','role','property_type','budget','location','message','source','stage','created_at'];
        fputcsv($out, $cols, ',', '"', '');
        // JSON mode stores camelCase for a couple of fields; MySQL uses snake_case.
        $alias = ['property_type' => 'propertyType', 'created_at' => 'createdAt'];
        foreach ($rows as $r) {
            $line = [];
            foreach ($cols as $c) {
                $line[] = (string)($r[$c] ?? $r[$alias[$c] ?? $c] ?? '');
            }
            fputcsv($out, $line, ',', '"', '');
        }
        fclose($out);
        exit;

    case 'import':                         // POST — bulk listings via CSV upload
        hp_require_role('admin');
        if ($method !== 'POST') hp_fail('Method not allowed', 405);
        if (empty($_FILES['file']['tmp_name'])) hp_fail('Upload a CSV file as "file".');

        $fh = fopen($_FILES['file']['tmp_name'], 'r');
        if (!$fh) hp_fail('Could not read the upload.');
        $head = fgetcsv($fh, 0, ',', '"', '');
        if (!$head) hp_fail('The CSV appears to be empty.');
        $head = array_map(fn($h) => strtolower(trim((string)$h)), $head);

        $saved = 0; $errors = [];
        while (($row = fgetcsv($fh, 0, ',', '"', '')) !== false) {
            if (count(array_filter($row, fn($v) => trim((string)$v) !== '')) === 0) continue;
            $d = [];
            foreach ($head as $i => $key) $d[$key] = $row[$i] ?? '';
            foreach (['purpose', 'specs', 'amenities'] as $k) {
                if (!empty($d[$k]) && is_string($d[$k])) {
                    $d[$k] = array_values(array_filter(array_map('trim', explode('|', $d[$k]))));
                }
            }
            if (isset($d['featured'])) $d['featured'] = in_array(strtolower((string)$d['featured']), ['1','yes','true','y'], true);
            if (isset($d['active']))   $d['active']   = !in_array(strtolower((string)$d['active']), ['0','no','false','n'], true);
            try { hp_listing_save($d); $saved++; }
            catch (Throwable $e) { $errors[] = ($d['title'] ?? '?') . ': ' . $e->getMessage(); }
        }
        fclose($fh);
        hp_json(['ok' => true, 'imported' => $saved, 'errors' => $errors]);

    default:
        hp_fail('Unknown action', 404);
}
