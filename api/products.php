<?php
// api/products.php
// CRUD operations for products

require_once __DIR__ . '/includes/header.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id > 0) {
        $stmt = $conn->prepare("SELECT p.*, u.full_name, u.email, u.campus, c.category_name 
                                FROM products p
                                JOIN users u ON p.user_id = u.user_id
                                JOIN categories c ON p.category_id = c.category_id
                                WHERE p.product_id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        
        if (!$product) {
            jsonError('Product not found', 404);
        }

        jsonResponse([
            'product_id' => (int)$product['product_id'],
            'title' => $product['title'],
            'description' => $product['description'],
            'price' => (float)$product['price'],
            'condition' => $product['condition'],
            'image' => $product['image'],
            'status' => $product['status'],
            'created_at' => $product['created_at'],
            'full_name' => $product['full_name'],
            'email' => $product['email'],
            'campus' => $product['campus'],
            'category_name' => $product['category_name'],
            'user_id' => (int)$product['user_id']
        ]);
    }

    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($userId > 0) {
        $stmt = $conn->prepare("SELECT p.*, c.category_name FROM products p 
                                JOIN categories c ON p.category_id = c.category_id
                                WHERE p.user_id = ? ORDER BY p.created_at DESC");
        $stmt->bind_param("i", $userId);
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
                'category_name' => $row['category_name']
            ];
        }
        jsonResponse(['products' => $products]);
    }

    jsonError('Missing id or user_id parameter', 400);
}

if ($method === 'POST') {
    if (!isLoggedIn()) {
        jsonError('Authentication required', 401);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $_SESSION['user_id'];

    $title = isset($input['title']) ? sanitize($input['title']) : '';
    $categoryId = isset($input['category_id']) ? intval($input['category_id']) : 0;
    $description = isset($input['description']) ? sanitize($input['description']) : '';
    $price = isset($input['price']) ? floatval($input['price']) : 0;
    $condition = isset($input['condition']) ? sanitize($input['condition']) : '';
    $image = isset($input['image']) ? sanitize($input['image']) : null;

    if (empty($title) || $categoryId <= 0 || empty($description) || $price <= 0 || empty($condition)) {
        jsonError('All fields are required');
    }

    $stmt = $conn->prepare("INSERT INTO products (user_id, title, category_id, description, price, condition, image, status) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
    $stmt->bind_param("isisdss", $userId, $title, $categoryId, $description, $price, $condition, $image);

    if ($stmt->execute()) {
        jsonResponse([
            'success' => true,
            'product_id' => $stmt->insert_id,
            'message' => 'Product created successfully'
        ], 201);
    } else {
        jsonError('Failed to create product');
    }
}

if ($method === 'PUT') {
    if (!isLoggedIn()) {
        jsonError('Authentication required', 401);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $productId = isset($input['product_id']) ? intval($input['product_id']) : 0;
    $userId = $_SESSION['user_id'];

    if ($productId <= 0) {
        jsonError('Invalid product ID');
    }

    $check = $conn->prepare("SELECT product_id FROM products WHERE product_id = ? AND user_id = ?");
    $check->bind_param("ii", $productId, $userId);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        jsonError('Product not found or unauthorized', 403);
    }

    $title = isset($input['title']) ? sanitize($input['title']) : '';
    $categoryId = isset($input['category_id']) ? intval($input['category_id']) : 0;
    $description = isset($input['description']) ? sanitize($input['description']) : '';
    $price = isset($input['price']) ? floatval($input['price']) : 0;
    $condition = isset($input['condition']) ? sanitize($input['condition']) : '';
    $image = isset($input['image']) ? sanitize($input['image']) : null;

    $stmt = $conn->prepare("UPDATE products SET title = ?, category_id = ?, description = ?, price = ?, condition = ?, image = ? 
                            WHERE product_id = ? AND user_id = ?");
    $stmt->bind_param("sisdsiii", $title, $categoryId, $description, $price, $condition, $image, $productId, $userId);

    if ($stmt->execute()) {
        jsonResponse(['success' => true, 'message' => 'Product updated successfully']);
    } else {
        jsonError('Failed to update product');
    }
}

if ($method === 'DELETE') {
    if (!isLoggedIn()) {
        jsonError('Authentication required', 401);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $productId = isset($input['product_id']) ? intval($input['product_id']) : 0;
    $userId = $_SESSION['user_id'];

    if ($productId <= 0) {
        jsonError('Invalid product ID');
    }

    $check = $conn->prepare("SELECT image FROM products WHERE product_id = ? AND user_id = ?");
    $check->bind_param("ii", $productId, $userId);
    $check->execute();
    $product = $check->get_result()->fetch_assoc();

    if (!$product) {
        jsonError('Product not found or unauthorized', 403);
    }

    $stmt = $conn->prepare("DELETE FROM products WHERE product_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $productId, $userId);

    if ($stmt->execute()) {
        if (!empty($product['image'])) {
            $imagePath = __DIR__ . '/uploads/' . $product['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        jsonResponse(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        jsonError('Failed to delete product');
    }
}

jsonError('Method not allowed', 405);
