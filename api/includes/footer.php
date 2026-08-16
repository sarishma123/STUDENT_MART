<?php
// API Footer - close connection if needed
if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}
?>
