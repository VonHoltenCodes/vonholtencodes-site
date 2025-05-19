<?php
header('Content-Type: application/json');

// Basic authentication
if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    strtolower($_SERVER['PHP_AUTH_USER']) !== 'traxx' || $_SERVER['PHP_AUTH_PW'] !== 'VonHolten2025') {
    echo json_encode(['error' => 'Authentication required', 'count' => 0, 'new' => false]);
    exit;
}

// Log file path
$logFile = __DIR__ . '/logs/mission_control_messages.log';

// Get message count
$count = 0;
$lastCheckFile = __DIR__ . '/logs/last_check.txt';
$lastCheckTime = 0;
$newMessages = false;

// Get current count
if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $count = substr_count($content, '=== NEW MESSAGE ===');
    
    // Check last modified time of log file
    $lastModified = filemtime($logFile);
    
    // Get last check time
    if (file_exists($lastCheckFile)) {
        $lastCheckTime = (int)file_get_contents($lastCheckFile);
    }
    
    // Check if there are new messages since last check
    if ($lastModified > $lastCheckTime) {
        $newMessages = true;
    }
    
    // Update last check time
    file_put_contents($lastCheckFile, time());
}

// Return data
echo json_encode([
    'count' => $count,
    'new' => $newMessages,
    'last_check' => date('Y-m-d H:i:s', $lastCheckTime),
    'current_time' => date('Y-m-d H:i:s')
]);
?>