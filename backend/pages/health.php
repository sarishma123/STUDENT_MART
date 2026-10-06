<?php
// Basic health check for API availability and database connectivity.

ini_set('display_errors', '0');
ini_set('log_errors', '1');
require_once __DIR__ . '/../includes/header.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$dbOk = false;
try {
    $stmt = $conn->prepare('SELECT 1');
    $dbOk = $stmt !== false && $stmt->execute();
} catch (Throwable $e) {
    error_log('Health check database probe failed: ' . $e->getMessage());
}

if (!$dbOk) {
    jsonError('Service unavailable', 503);
}

jsonResponse([
    'success' => true,
    'status' => 'healthy'
]);
?>
