<?php
// api/browse.php
// Get all active products (optionally filtered)

require_once __DIR__ . '/../includes/header.php';

$search = isset($_GET['search']) && is_string($_GET['search']) ? trim($_GET['search']) : '';
$category = isset($_GET['category']) && is_string($_GET['category']) ? trim($_GET['category']) : '';
$page = filter_var($_GET['page'] ?? 1, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1]
]);
$limit = filter_var($_GET['limit'] ?? 20, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 100]
]);

if ($page === false || $limit === false || strlen($search) > 150 || strlen($category) > 50) {
    jsonError('Invalid browse parameters.', 422);
}

$offset = ($page - 1) * $limit;

$where = ["p.status = 'active'"];
$params = [];
$types = "";

if (!empty($search)) {
    $where[] = "(p.title LIKE ? OR p.description LIKE ?)";
    $searchTerm = "%{$search}%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= "ss";
}

if (!empty($category)) {
    $where[] = "c.category_name = ?";
    $params[] = $category;
    $types .= "s";
}

$whereClause = implode(" AND ", $where);

$countSql = "SELECT COUNT(*) as total FROM products p 
             JOIN users u ON p.user_id = u.user_id
             JOIN categories c ON p.category_id = c.category_id
             WHERE $whereClause";

$countStmt = $conn->prepare($countSql);
if (!empty($params)) {
    $countStmt->bind_param($types, ...$params);
}
$countStmt->execute();
$total = $countStmt->get_result()->fetch_assoc()['total'];

    $sql = "SELECT p.product_id, p.title, p.description, p.price, p.`condition`, p.image, p.status, p.created_at,
               u.full_name, u.campus, c.category_name
        FROM products p
        JOIN users u ON p.user_id = u.user_id
        JOIN categories c ON p.category_id = c.category_id
        WHERE $whereClause
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?";

$stmt = $conn->prepare($sql);
$params[] = $limit;
$params[] = $offset;
$types .= "ii";
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = [
        'product_id' => (int)$row['product_id'],
        'title' => $row['title'],
        'description' => $row['description'],
        'price' => (float)$row['price'],
        'condition' => $row['condition'],
        'image' => $row['image'],
        'status' => $row['status'],
        'created_at' => $row['created_at'],
        'full_name' => $row['full_name'],
        'campus' => $row['campus'],
        'category_name' => $row['category_name'],
    ];
}

jsonResponse([
    'products' => $products,
    'total' => (int)$total,
    'page' => $page,
    'limit' => $limit
]);
