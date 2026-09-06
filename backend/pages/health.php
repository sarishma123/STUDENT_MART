<?php
// api/health.php
// Basic health check for PHP runtime, DB connectivity, and session state.

require_once __DIR__ . '/../includes/header.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$dbOk = false;
$stmt = $conn->prepare('SELECT 1 as ok');
if ($stmt && $stmt->execute()) {
    $row = $stmt->get_result()->fetch_assoc();
    $dbOk = isset($row['ok']) && (int)$row['ok'] === 1;
}

jsonResponse([
    'success' => true,
    'service' => 'student_mart_api',
    'php_version' => PHP_VERSION,
    'database' => [
        'connected' => $dbOk,
        'name' => 'on_campus_mart'
    ],
    'session' => [
        'active' => session_status() === PHP_SESSION_ACTIVE,
        'logged_in' => isLoggedIn(),
        'user_id' => isLoggedIn() ? (int)$_SESSION['user_id'] : null
    ],
    'timestamp' => date('c')
]);
