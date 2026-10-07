<?php
// api/products.php
// CRUD operations for products

require_once __DIR__ . '/../includes/header.php';

function readProductInput(): array {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        jsonError('Request body must be valid JSON.', 400);
    }

    return $input;
}

function validateProductInput(array $input, bool $allowStatus = false): array {
    $title = isset($input['title']) && is_string($input['title']) ? trim($input['title']) : '';
    $description = isset($input['description']) && is_string($input['description']) ? trim($input['description']) : '';
    $condition = isset($input['condition']) && is_string($input['condition']) ? trim($input['condition']) : '';
    $image = isset($input['image']) && is_string($input['image']) ? trim($input['image']) : null;
    $categoryId = filter_var($input['category_id'] ?? null, FILTER_VALIDATE_INT);
    $price = $input['price'] ?? null;

    if ($title === '' || strlen($title) > 150 || preg_match('/[\x00-\x1F\x7F]/', $title)
        || $description === '' || strlen($description) > 5000 || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $description)
        || $condition === '' || strlen($condition) > 20 || preg_match('/[\x00-\x1F\x7F]/', $condition)
        || $categoryId === false || $categoryId < 1
        || !is_numeric($price) || !is_finite((float)$price) || (float)$price <= 0 || (float)$price > 99999999.99
        || ($image !== null && (strlen($image) > 255 || preg_match('/[\\\/]/', $image)))) {
        jsonError('Invalid product fields.', 422);
    }

    $status = 'active';
    if ($allowStatus) {
        $status = isset($input['status']) && is_string($input['status']) ? trim($input['status']) : 'active';
        if (!in_array($status, ['active', 'sold'], true)) {
            jsonError('Invalid product status.', 422);
        }
    }

    return [$title, $categoryId, $description, (float)$price, $condition, $image, $status];
}

function categoryExists(mysqli $conn, int $categoryId): bool {
    $stmt = $conn->prepare('SELECT category_id FROM categories WHERE category_id = ?');
    $stmt->bind_param('i', $categoryId);
    $stmt->execute();
    return $stmt->get_result()->num_rows === 1;
}

function positiveInteger($value): int {
    if (is_int($value) && $value > 0) {
        return $value;
    }

    if (!is_string($value) || !preg_match('/^[1-9][0-9]*$/', $value)) {
        return 0;
    }

    $parsed = filter_var($value, FILTER_VALIDATE_INT);
    return $parsed !== false && $parsed > 0 ? $parsed : 0;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = positiveInteger($_GET['id'] ?? null);
    
    if ($id > 0) {
        $stmt = $conn->prepare("SELECT p.*, u.full_name, u.campus, c.category_name 
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
            'campus' => $product['campus'],
            'category_name' => $product['category_name'],
            'user_id' => (int)$product['user_id']
        ]);
    }

    $userId = positiveInteger($_GET['user_id'] ?? null);
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

    $input = readProductInput();
    $userId = $_SESSION['user_id'];

    [$title, $categoryId, $description, $price, $condition, $image] = validateProductInput($input);
    if (!categoryExists($conn, $categoryId)) {
        jsonError('Invalid category.', 422);
    }

    $stmt = $conn->prepare("INSERT INTO products (user_id, title, category_id, description, price, `condition`, image, status)
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

    $input = readProductInput();
    $productId = positiveInteger($input['product_id'] ?? null);
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

    [$title, $categoryId, $description, $price, $condition, $image, $status] = validateProductInput($input, true);
    if (!categoryExists($conn, $categoryId)) {
        jsonError('Invalid category.', 422);
    }

    $stmt = $conn->prepare("UPDATE products SET title = ?, category_id = ?, description = ?, price = ?, `condition` = ?, image = ?, status = ?
                            WHERE product_id = ? AND user_id = ?");
    $stmt->bind_param("sisdsissi", $title, $categoryId, $description, $price, $condition, $image, $status, $productId, $userId);

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

    $input = readProductInput();
    $productId = positiveInteger($input['product_id'] ?? null);
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
            $uploadDirectory = realpath(__DIR__ . '/uploads');
            $imagePath = $uploadDirectory === false
                ? false
                : realpath($uploadDirectory . DIRECTORY_SEPARATOR . $product['image']);
            $isUploadFile = $uploadDirectory !== false
                && $imagePath !== false
                && str_starts_with($imagePath, $uploadDirectory . DIRECTORY_SEPARATOR)
                && is_file($imagePath);
            if ($isUploadFile) {
                unlink($imagePath);
            }
        }
        jsonResponse(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        jsonError('Failed to delete product');
    }
}

jsonError('Method not allowed', 405);
