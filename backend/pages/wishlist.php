<?php

require_once __DIR__ . '/../includes/header.php';

$conn->query("CREATE TABLE IF NOT EXISTS wishlists (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
)");

if (!isLoggedIn()) {
    jsonError('Authentication required.', 401);
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT product_id FROM wishlists WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $productIds = [];
    while ($row = $result->fetch_assoc()) {
        $productIds[] = (int)$row['product_id'];
    }
    jsonResponse(['product_ids' => $productIds]);
}

$input = json_decode(file_get_contents('php://input'), true);
$productId = filter_var($input['product_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($productId === false || $productId === null) {
    jsonError('Invalid product ID.', 422);
}

if ($method === 'POST') {
    $check = $conn->prepare("SELECT product_id FROM products WHERE product_id = ? AND status = 'active'");
    $check->bind_param('i', $productId);
    $check->execute();
    if (!$check->get_result()->fetch_assoc()) {
        jsonError('Only active listings can be saved.', 422);
    }

    $stmt = $conn->prepare('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)');
    $stmt->bind_param('ii', $userId, $productId);
    $stmt->execute();
    jsonResponse(['success' => true]);
}

if ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?');
    $stmt->bind_param('ii', $userId, $productId);
    $stmt->execute();
    jsonResponse(['success' => true]);
}

jsonError('Method not allowed.', 405);
