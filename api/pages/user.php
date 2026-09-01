<?php
// api/user.php
// Get current user profile and stats

require_once __DIR__ . '/../includes/header.php';

if (!isLoggedIn()) {
    jsonError('Authentication required', 401);
}

$userId = $_SESSION['user_id'];

$user = getUserInfo($userId, $conn);

if (!$user) {
    jsonError('User not found', 404);
}

$stmt = $conn->prepare("SELECT COUNT(*) as total_products FROM products WHERE user_id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$totalProducts = $stmt->get_result()->fetch_assoc()['total_products'];

$stmt = $conn->prepare("SELECT COUNT(*) as sold FROM products WHERE user_id = ? AND status = 'sold'");
$stmt->bind_param("i", $userId);
$stmt->execute();
$soldProducts = $stmt->get_result()->fetch_assoc()['sold'];

jsonResponse([
    'id' => (int)$user['user_id'],
    'name' => $user['full_name'],
    'email' => $user['email'],
    'campus' => $user['campus'] ?? '',
    'joinDate' => date('M Y', strtotime($user['created_at'])),
    'totalProducts' => (int)$totalProducts,
    'soldProducts' => (int)$soldProducts
]);
