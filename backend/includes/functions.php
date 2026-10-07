<?php

function jsonResponse(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function jsonError(string $message, int $statusCode = 400): void
{
    jsonResponse(['success' => false, 'message' => $message], $statusCode);
}

function sanitize(string $value): string
{
    return trim($value);
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']);
}

function requireRole(string ...$roles): void
{
    if (!isLoggedIn()) {
        jsonError('Authentication required', 401);
    }

    if (!in_array($_SESSION['role'] ?? 'user', $roles, true)) {
        jsonError('Forbidden', 403);
    }
}

function getUserInfo(int $userId, mysqli $conn): ?array
{
    $stmt = $conn->prepare('SELECT user_id, full_name, email, campus, created_at FROM users WHERE user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    return $user ?: null;
}
