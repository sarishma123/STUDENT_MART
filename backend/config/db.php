<?php
// backend/config/db.php

$host = "localhost";
$username = "root";
$password = "";
$database = "student_mart";

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die("Database connection failed.");
}

// Character encoding
$conn->set_charset("utf8mb4");
?>

<?php
require_once __DIR__ . "/../config/db.php";
?>