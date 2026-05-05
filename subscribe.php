<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// ── Nastavení ──────────────────────────────────────
$API_KEY = 'DOPLNIT_ECOMAIL_API_KLIC';
$LIST_ID = '2';
// ──────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$name  = htmlspecialchars(trim($_POST['name'] ?? ''), ENT_QUOTES, 'UTF-8');

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Neplatný e-mail']);
    exit;
}

$payload = json_encode([
    'subscriber_data' => [
        'email' => $email,
        'name'  => $name,
    ],
    'trigger_autoresponders' => true,
    'resubscribe'            => true,
]);

$ch = curl_init("https://api2.ecomail.cz/lists/{$LIST_ID}/subscribers");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'key: ' . $API_KEY,
    ],
]);

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status === 201 || $status === 200) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Chyba při přihlášení', 'detail' => $response]);
}
