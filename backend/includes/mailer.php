<?php

function sendAppEmail(string $to, string $subject, string $htmlBody): bool
{
    $from = getenv('STUDENT_MART_MAIL_FROM') ?: 'no-reply@localhost';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: StudentMart <' . $from . '>',
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . PHP_VERSION,
    ];

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return mail($to, $encodedSubject, $htmlBody, implode("\r\n", $headers));
}

function appUrl(string $path = ''): string
{
    $baseUrl = rtrim(getenv('STUDENT_MART_APP_URL') ?: 'http://localhost:5173', '/');
    return $baseUrl . $path;
}
