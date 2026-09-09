<?php
// api/auth.php
// Handle login and register
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../includes/header.php';
$action = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

if ($action === 'POST') {
    if (isLoggedIn() && !empty($input['logout'])) {
        $_SESSION = [];
        session_destroy();
        jsonResponse(['success' => true, 'message' => 'Logged out']);
    }

    $type = isset($input['type']) ? sanitize($input['type']) : (isset($_GET['type']) ? sanitize($_GET['type']) : '');

    if ($type === 'login') {
        $email = isset($input['email']) ? sanitize($input['email']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (empty($email) || empty($password)) {
            jsonError('Email and password are required');
        }

        $stmt = $conn->prepare("SELECT user_id, full_name, email, password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            jsonError('Invalid email or password', 401);
        }

        $user = $result->fetch_assoc();

        if (!password_verify($password, $user['password'])) {
            jsonError('Invalid email or password', 401);
        }

        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_name'] = $user['full_name'];
        $_SESSION['user_email'] = $user['email'];

        jsonResponse([
            'success' => true,
            'user' => [
                'id' => (int)$user['user_id'],
                'name' => $user['full_name'],
                'email' => $user['email']
            ]
        ]);

    } elseif ($type === 'register') {
        $name = isset($input['name']) ? sanitize($input['name']) : '';
        $email = isset($input['email']) ? sanitize($input['email']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (empty($name) || empty($email) || empty($password)) {
            jsonError('All fields are required');
        }

        if (strlen($password) < 6) {
            jsonError('Password must be at least 6 characters');
        }

        $check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
        $check->bind_param("s", $email);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            jsonError('Email already registered', 409);
        }

        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $email, $hashed);

        if ($stmt->execute()) {
            $userId = $stmt->insert_id;
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;

            jsonResponse([
                'success' => true,
                'user' => [
                    'id' => $userId,
                    'name' => $name,
                    'email' => $email
                ]
            ]);
        } else {
            jsonError('Registration failed. Please try again.');
        }

    } else {
        jsonError('Invalid action. Use type=login or type=register');
    }
}

if ($action === 'GET' && isLoggedIn()) {
    jsonResponse([
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
        ]
    ]);
}

if ($action === 'GET') {
    jsonError('No active session', 401);
}

jsonError('Method not allowed', 405);
