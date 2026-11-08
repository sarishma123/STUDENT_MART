<?php
// api/products.php
// CRUD operations for products

require_once __DIR__ . '/../includes/header.php';

function ensurePurchaseColumns(mysqli $conn): void {
    $columns = $conn->query("SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'");
    $existing = array_column($columns->fetch_all(MYSQLI_ASSOC), 'COLUMN_NAME');

    if (!in_array('buyer_id', $existing, true)) {
        $conn->query('ALTER TABLE products ADD COLUMN buyer_id INT NULL AFTER status');
        $conn->query('ALTER TABLE products ADD CONSTRAINT fk_products_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE SET NULL');
        $conn->query('CREATE INDEX idx_buyer_id ON products(buyer_id)');
    }

    if (!in_array('sold_at', $existing, true)) {
        $conn->query('ALTER TABLE products ADD COLUMN sold_at DATETIME NULL AFTER buyer_id');
    }
}

ensurePurchaseColumns($conn);

function removeUploadedProductImage(?string $image): void {
    if (!is_string($image)
        || !preg_match('#^/api/upload\.php\?file=([a-f0-9]{32}\.(?:jpg|png|webp))$#', $image, $matches)) {
        return;
    }

    $uploadDirectory = realpath(dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads');
    $imagePath = $uploadDirectory === false
        ? false
        : realpath($uploadDirectory . DIRECTORY_SEPARATOR . $matches[1]);
    if ($imagePath !== false
        && str_starts_with($imagePath, $uploadDirectory . DIRECTORY_SEPARATOR)
        && is_file($imagePath)) {
        unlink($imagePath);
    }
}

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

    if ($image === '') {
        $image = null;
    }

    $isUploadedImage = is_string($image)
        && preg_match('/^\/api\/upload\.php\?file=[a-f0-9]{32}\.(jpg|png|webp)$/', $image);
    $imageIsValid = $image === null || $isUploadedImage || (
        strlen($image) <= 255
        && filter_var($image, FILTER_VALIDATE_URL)
        && in_array(parse_url($image, PHP_URL_SCHEME), ['http', 'https'], true)
    );

    if ($title === '' || strlen($title) > 150 || preg_match('/[\x00-\x1F\x7F]/', $title)
        || $description === '' || strlen($description) > 5000 || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $description)
        || $condition === '' || strlen($condition) > 20 || preg_match('/[\x00-\x1F\x7F]/', $condition)
        || $categoryId === false || $categoryId < 1
        || !is_numeric($price) || !is_finite((float)$price) || (float)$price <= 0 || (float)$price > 99999999.99
        || !$imageIsValid) {
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
    $contactProductId = positiveInteger($_GET['contact_product_id'] ?? null);
    if ($contactProductId > 0) {
        if (!isLoggedIn()) {
            jsonError('Authentication required', 401);
        }

        $stmt = $conn->prepare("SELECT p.user_id, p.buyer_id, u.full_name, u.email, u.campus
                                FROM products p JOIN users u ON u.user_id = p.user_id
                                WHERE p.product_id = ? AND p.status = 'sold'");
        $stmt->bind_param('i', $contactProductId);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        if (!$product || (int)$product['buyer_id'] !== (int)$_SESSION['user_id']) {
            jsonError('Seller contact is available only to the recorded buyer.', 403);
        }

        jsonResponse(['seller' => [
            'name' => $product['full_name'],
            'email' => $product['email'],
            'campus' => $product['campus'] ?? '',
        ]]);
    }

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
                'category_name' => $row['category_name'],
                'user_id' => (int)$row['user_id']
            ];
        }
        jsonResponse(['products' => $products]);
    }

    if (isset($_GET['purchases'])) {
        if (!isLoggedIn()) {
            jsonError('Authentication required', 401);
        }

        $buyerId = $_SESSION['user_id'];
        $stmt = $conn->prepare("SELECT p.*, u.full_name, c.category_name
                                FROM products p
                                JOIN users u ON p.user_id = u.user_id
                                JOIN categories c ON p.category_id = c.category_id
                                WHERE p.buyer_id = ? AND p.status = 'sold'
                                ORDER BY p.sold_at DESC");
        $stmt->bind_param('i', $buyerId);
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
                'sold_at' => $row['sold_at'],
                'user_id' => (int)$row['user_id'],
                'buyer_id' => (int)$row['buyer_id'],
                'full_name' => $row['full_name'],
                'category_name' => $row['category_name'],
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

    if (($input['type'] ?? '') === 'purchase') {
        $productId = positiveInteger($input['product_id'] ?? null);
        if ($productId <= 0) {
            jsonError('Invalid product ID.', 422);
        }

        $stmt = $conn->prepare("UPDATE products
            SET status = 'sold', buyer_id = ?, sold_at = NOW()
            WHERE product_id = ? AND user_id <> ? AND status = 'active'");
        $stmt->bind_param('iii', $userId, $productId, $userId);
        $stmt->execute();

        if ($stmt->affected_rows !== 1) {
            jsonError('This listing is no longer available.', 409);
        }

        jsonResponse(['success' => true, 'message' => 'Purchase recorded successfully.']);
    }

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

    $check = $conn->prepare("SELECT product_id, image FROM products WHERE product_id = ? AND user_id = ?");
    $check->bind_param("ii", $productId, $userId);
    $check->execute();
    $existingProduct = $check->get_result()->fetch_assoc();
    if (!$existingProduct) {
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
        if ($existingProduct['image'] !== $image) {
            removeUploadedProductImage($existingProduct['image']);
        }
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
        removeUploadedProductImage($product['image']);
        jsonResponse(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        jsonError('Failed to delete product');
    }
}

jsonError('Method not allowed', 405);
