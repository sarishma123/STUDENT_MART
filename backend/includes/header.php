<?php
session_start();

header("Content-Type: application/json");

require_once __DIR__ . "/../config/db.php";

function jsonResponse($data) {
    echo json_encode($data);
    exit();
}

function jsonError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        "success" => false,
        "message" => $message
    ]);
    exit();
}

function sanitize($value) {
    return htmlspecialchars(trim($value), ENT_QUOTES, "UTF-8");
}

function isLoggedIn() {
    return isset($_SESSION["user_id"]);
}
?>