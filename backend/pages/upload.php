<?php

require_once __DIR__ . '/../includes/header.php';

const MAX_IMAGE_BYTES = 5242880;
const IMAGE_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

function uploadDirectory(): string
{
    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads';
}

function validUploadFilename(mixed $filename): string
{
    if (!is_string($filename) || !preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/', $filename)) {
        return '';
    }

    return $filename;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $filename = validUploadFilename($_GET['file'] ?? null);
    $path = $filename === '' ? false : uploadDirectory() . DIRECTORY_SEPARATOR . $filename;

    if ($path === false || !is_file($path)) {
        http_response_code(404);
        exit;
    }

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($path);
    if (!array_key_exists($mimeType, IMAGE_TYPES)) {
        http_response_code(404);
        exit;
    }

    header_remove('Content-Type');
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: public, max-age=31536000, immutable');
    readfile($path);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

if (!isLoggedIn()) {
    jsonError('Authentication required.', 401);
}

if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
    jsonError('Choose an image to upload.', 422);
}

$image = $_FILES['image'];
if (($image['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    jsonError('The image upload failed.', 422);
}

if (!is_uploaded_file($image['tmp_name']) || $image['size'] <= 0 || $image['size'] > MAX_IMAGE_BYTES) {
    jsonError('Image files must be no larger than 5 MB.', 422);
}

$mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($image['tmp_name']);
if (!array_key_exists($mimeType, IMAGE_TYPES) || getimagesize($image['tmp_name']) === false) {
    jsonError('Only valid JPEG, PNG, and WebP images are accepted.', 422);
}

$directory = uploadDirectory();
if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
    jsonError('Image storage is unavailable.', 500);
}

$filename = bin2hex(random_bytes(16)) . '.' . IMAGE_TYPES[$mimeType];
$destination = $directory . DIRECTORY_SEPARATOR . $filename;
if (!move_uploaded_file($image['tmp_name'], $destination)) {
    jsonError('Could not save the image.', 500);
}

jsonResponse([
    'success' => true,
    'image' => '/api/upload.php?file=' . rawurlencode($filename),
], 201);
