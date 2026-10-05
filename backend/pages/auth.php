<?php
// api/auth.php
// Handle login and register
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . "/../includes/header.php";
require_once __DIR__ . "/../includes/mailer.php";

// Keeps existing installations compatible; the same statement is also in db.sql.
$conn->query("CREATE TABLE IF NOT EXISTS password_resets (
    reset_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)");

$action = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

if ($action === 'POST') {
    if (isLoggedIn() && !empty($input['logout'])) {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        setcookie('student_mart_csrf', $_SESSION['csrf_token'], [
            'expires' => time() + 86400,
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => false,
            'samesite' => 'Lax',
        ]);
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

        session_regenerate_id(true);
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

    } elseif ($type === 'change-password') {
        if (!isLoggedIn()) {
            jsonError('Authentication required', 401);
        }

        $currentPassword = isset($input['current_password']) ? $input['current_password'] : '';
        $newPassword = isset($input['new_password']) ? $input['new_password'] : '';

        if (empty($currentPassword) || strlen($newPassword) < 6) {
            jsonError('Current password and a new password of at least 6 characters are required.');
        }

        $stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user || !password_verify($currentPassword, $user['password'])) {
            jsonError('Current password is incorrect.', 401);
        }

        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $update = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
        $update->bind_param("si", $newPasswordHash, $_SESSION['user_id']);
        $update->execute();

        jsonResponse(['success' => true, 'message' => 'Password changed successfully.']);

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
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;

            sendAppEmail(
                $email,
                'Welcome to StudentMart',
                '<h2>Welcome to StudentMart, ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '!</h2>' .
                '<p>Your account has been created successfully. You can now browse and share study materials with your campus community.</p>'
            );

            jsonResponse([
                'success' => true,
                'message' => 'Account created. A welcome email has been sent.',
                'user' => [
                    'id' => $userId,
                    'name' => $name,
                    'email' => $email
                ]
            ]);
        } else {
            jsonError('Registration failed. Please try again.');
        }

    } elseif ($type === 'forgot-password') {
        $email = isset($input['email']) ? strtolower(trim($input['email'])) : '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Please enter a valid email address.');
        }

        $stmt = $conn->prepare("SELECT user_id, full_name, email FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        // Keep this response identical for known and unknown addresses.
        if ($user) {
            $token = bin2hex(random_bytes(32));
            $tokenHash = hash('sha256', $token);
            $expiresAt = date('Y-m-d H:i:s', time() + 3600);

            $delete = $conn->prepare("DELETE FROM password_resets WHERE user_id = ? OR expires_at < NOW()");
            $delete->bind_param("i", $user['user_id']);
            $delete->execute();

            $insert = $conn->prepare("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)");
            $insert->bind_param("iss", $user['user_id'], $tokenHash, $expiresAt);
            $insert->execute();

            $resetUrl = appUrl('/?reset=' . urlencode($token));
            sendAppEmail(
                $user['email'],
                'Reset your StudentMart password',
                '<h2>Password reset request</h2>' .
                '<p>Hello ' . htmlspecialchars($user['full_name'], ENT_QUOTES, 'UTF-8') . ',</p>' .
                '<p>Use the link below within one hour to choose a new password:</p>' .
                '<p><a href="' . htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8') . '">Reset my password</a></p>' .
                '<p>If you did not request this, you can safely ignore this email.</p>'
            );
        }

        jsonResponse(['success' => true, 'message' => 'If that email is registered, a password reset link has been sent.']);

    } elseif ($type === 'reset-password') {
        $token = isset($input['token']) ? trim($input['token']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (!preg_match('/^[a-f0-9]{64}$/', $token) || strlen($password) < 6) {
            jsonError('A valid reset token and a password of at least 6 characters are required.');
        }

        $tokenHash = hash('sha256', $token);
        $stmt = $conn->prepare("SELECT reset_id, user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()");
        $stmt->bind_param("s", $tokenHash);
        $stmt->execute();
        $reset = $stmt->get_result()->fetch_assoc();

        if (!$reset) {
            jsonError('This reset link is invalid or has expired.', 400);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $conn->begin_transaction();
        try {
            $updateUser = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
            $updateUser->bind_param("si", $hashedPassword, $reset['user_id']);
            $updateUser->execute();

            $useToken = $conn->prepare("UPDATE password_resets SET used_at = NOW() WHERE reset_id = ? AND used_at IS NULL");
            $useToken->bind_param("i", $reset['reset_id']);
            $useToken->execute();
            $conn->commit();
        } catch (Throwable $error) {
            $conn->rollback();
            jsonError('Could not reset your password. Please request a new link.', 500);
        }

        jsonResponse(['success' => true, 'message' => 'Password updated. You can now sign in.']);

    } else {
        jsonError('Invalid action.');
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
