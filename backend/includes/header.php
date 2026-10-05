<?php
$isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$csrfToken = isset($_SESSION['csrf_token']) ? $_SESSION['csrf_token'] : bin2hex(random_bytes(32));
$_SESSION['csrf_token'] = $csrfToken;
$csrfCookieOptions = [
    'expires' => time() + 86400,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => false,
    'samesite' => 'Lax',
];
setcookie('student_mart_csrf', $csrfToken, $csrfCookieOptions);

/* ---------- CORS ---------- */
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
header("Access-Control-Expose-Headers: X-CSRF-Token");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("X-CSRF-Token: " . $csrfToken);
header("Content-Type: application/json");

/* Handle browser preflight request */
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    $providedToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($providedToken) || !hash_equals($csrfToken, $providedToken)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid CSRF token'
        ]);
        exit();
    }
}

/* ---------- Database ---------- */
require_once __DIR__ . "/../config/db.php";

if (isset($_SESSION['user_id'])) {
    $columnCheck = $conn->query("SELECT COUNT(*) AS column_exists
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'session_version'");
    $hasSessionVersion = (int)$columnCheck->fetch_assoc()['column_exists'] > 0;

    if ($hasSessionVersion) {
        $sessionCheck = $conn->prepare('SELECT session_version FROM users WHERE user_id = ?');
        $sessionCheck->bind_param('i', $_SESSION['user_id']);
        $sessionCheck->execute();
        $sessionUser = $sessionCheck->get_result()->fetch_assoc();

        if (!$sessionUser || (int)($_SESSION['session_version'] ?? 0) !== (int)$sessionUser['session_version']) {
            $_SESSION = [];
            session_regenerate_id(true);
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            $csrfToken = $_SESSION['csrf_token'];
            setcookie('student_mart_csrf', $csrfToken, $csrfCookieOptions);
            header("X-CSRF-Token: " . $csrfToken, true);
        }
    }
}

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