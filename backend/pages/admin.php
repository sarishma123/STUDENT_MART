<?php

require_once __DIR__ . '/../includes/header.php';

requireRole('admin');

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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $usersResult = $conn->query(
        'SELECT user_id, full_name, email, campus, role, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 100'
    );
    $users = [];
    while ($user = $usersResult->fetch_assoc()) {
        $users[] = [
            'id' => (int)$user['user_id'],
            'name' => $user['full_name'],
            'email' => $user['email'],
            'campus' => $user['campus'] ?? '',
            'role' => $user['role'],
            'created_at' => $user['created_at'],
        ];
    }

    $productsResult = $conn->query(
        'SELECT p.product_id, p.title, p.status, p.price, p.created_at,
                u.full_name, u.email, c.category_name
         FROM products p
         INNER JOIN users u ON u.user_id = p.user_id
         INNER JOIN categories c ON c.category_id = p.category_id
         ORDER BY p.created_at DESC
         LIMIT 100'
    );
    $products = [];
    while ($product = $productsResult->fetch_assoc()) {
        $products[] = [
            'id' => (int)$product['product_id'],
            'title' => $product['title'],
            'status' => $product['status'],
            'price' => (float)$product['price'],
            'created_at' => $product['created_at'],
            'seller' => $product['full_name'],
            'seller_email' => $product['email'],
            'category' => $product['category_name'],
        ];
    }

    $reportsResult = $conn->query(
        'SELECT r.report_id, r.reason, r.details, r.created_at, p.product_id, p.title,
                reporter.full_name AS reporter_name
         FROM product_reports r
         INNER JOIN products p ON p.product_id = r.product_id
         INNER JOIN users reporter ON reporter.user_id = r.reporter_user_id
         ORDER BY r.created_at DESC
         LIMIT 100'
    );
    $reports = [];
    while ($report = $reportsResult->fetch_assoc()) {
        $reports[] = [
            'id' => (int)$report['report_id'],
            'product_id' => (int)$report['product_id'],
            'title' => $report['title'],
            'reason' => $report['reason'],
            'details' => $report['details'],
            'reporter' => $report['reporter_name'],
            'created_at' => $report['created_at'],
        ];
    }

    $statsResult = $conn->query(
        "SELECT
            (SELECT COUNT(*) FROM users) AS users,
            (SELECT COUNT(*) FROM products) AS products,
            (SELECT COUNT(*) FROM products WHERE status = 'active') AS active_products,
            (SELECT COUNT(*) FROM products WHERE status = 'sold') AS sold_products,
            (SELECT COUNT(*) FROM product_reports) AS reports"
    );
    $stats = $statsResult->fetch_assoc();

    jsonResponse([
        'stats' => [
            'users' => (int)$stats['users'],
            'products' => (int)$stats['products'],
            'active_products' => (int)$stats['active_products'],
            'sold_products' => (int)$stats['sold_products'],
            'reports' => (int)$stats['reports'],
        ],
        'users' => $users,
        'products' => $products,
        'reports' => $reports,
    ]);
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $productId = filter_var($input['product_id'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);

    if ($productId === false || $productId === null) {
        jsonError('Invalid product ID.', 422);
    }

    $stmt = $conn->prepare('DELETE FROM products WHERE product_id = ?');
    $stmt->bind_param('i', $productId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        jsonError('Product not found.', 404);
    }

    jsonResponse(['success' => true, 'message' => 'Product removed by administrator.']);
}

jsonError('Method not allowed', 405);
