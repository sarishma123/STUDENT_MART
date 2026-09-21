<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = "127.0.0.1";      // Don't use localhost
$user = "root";
$password = "";           // XAMPP default password is empty
$database = "on_campus_mart";
$port = 3306;

try {
    $conn = new mysqli($host, $user, $password, $database, $port);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "error" => "Database connection failed",
        "details" => $e->getMessage()
    ]));
}