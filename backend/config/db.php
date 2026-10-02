<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$configPath = getenv('STUDENT_MART_CONFIG')
    ?: dirname(__DIR__, 4) . DIRECTORY_SEPARATOR . 'student_mart_config' . DIRECTORY_SEPARATOR . 'db.php';

if (!is_file($configPath)) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'Database configuration is unavailable']));
}

$config = require $configPath;
$host = $config['host'];
$user = $config['user'];
$password = $config['password'];
$database = $config['database'];
$port = $config['port'];

try {
    $conn = new mysqli($host, $user, $password, $database, $port);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "error" => "Database connection failed"
    ]));
}