<?php

require_once __DIR__ . '/../includes/header.php';

$conn->query("CREATE TABLE IF NOT EXISTS product_reports (
    report_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    reporter_user_id INT NOT NULL,
    reason ENUM('spam', 'scam', 'prohibited', 'inappropriate', 'other') NOT NULL,
    details VARCHAR(1000) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_product_reporter (product_id, reporter_user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_user_id) REFERENCES users(user_id) ON DELETE CASCADE
)");

if (!isLoggedIn()) {
    jsonError('Authentication required.', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$productId = filter_var($input['product_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
$reason = is_string($input['reason'] ?? null) ? trim($input['reason']) : '';
$details = is_string($input['details'] ?? null) ? trim($input['details']) : '';
$allowedReasons = ['spam', 'scam', 'prohibited', 'inappropriate', 'other'];

if ($productId === false || $productId === null || !in_array($reason, $allowedReasons, true) || strlen($details) > 1000) {
    jsonError('Invalid report details.', 422);
}

$ownerCheck = $conn->prepare('SELECT user_id FROM products WHERE product_id = ?');
$ownerCheck->bind_param('i', $productId);
$ownerCheck->execute();
$product = $ownerCheck->get_result()->fetch_assoc();
if (!$product) {
    jsonError('Listing not found.', 404);
}
if ((int)$product['user_id'] === (int)$_SESSION['user_id']) {
    jsonError('You cannot report your own listing.', 422);
}

$stmt = $conn->prepare('INSERT INTO product_reports (product_id, reporter_user_id, reason, details) VALUES (?, ?, ?, ?)');
$stmt->bind_param('iiss', $productId, $_SESSION['user_id'], $reason, $details);
try {
    $stmt->execute();
} catch (mysqli_sql_exception $error) {
    jsonError('You have already reported this listing.', 409);
}

jsonResponse(['success' => true, 'message' => 'Thank you. Your report has been sent to the moderators.'], 201);
