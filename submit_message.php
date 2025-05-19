<?php
session_start();

// Verify user is authenticated
if (!isset($_SESSION['mission_control_user'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit;
}

// Verify form data is provided
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST['type']) || empty($_POST['message'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request. Missing required data.'
    ]);
    exit;
}

// Get message data
$type = filter_var($_POST['type'], FILTER_SANITIZE_STRING);
$message = $_POST['message']; // Don't filter too aggressively as this might be code
$username = $_SESSION['mission_control_user'];

// Valid message types
$validTypes = ['edits', 'neuralink', 'proton'];
if (!in_array($type, $validTypes)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Invalid message type'
    ]);
    exit;
}

// Define message type labels
$typeLabels = [
    'edits' => 'Code Tweak',
    'neuralink' => 'Idea Neuralink',
    'proton' => 'Proton Beam Message'
];

// Create logs directory if it doesn't exist
$logsDir = __DIR__ . '/logs';
if (!file_exists($logsDir)) {
    mkdir($logsDir, 0755, true);
}

// Prepare log file path
$logFile = $logsDir . '/mission_control_messages.log';

// Format message for log
$timestamp = date('Y-m-d H:i:s');
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';

$logEntry = "=== NEW MESSAGE ===\n";
$logEntry .= "Time: {$timestamp}\n";
$logEntry .= "User: {$username}\n";
$logEntry .= "Type: {$typeLabels[$type]}\n";
$logEntry .= "IP: {$ipAddress}\n";
$logEntry .= "Browser: {$userAgent}\n";
$logEntry .= "Message:\n{$message}\n";
$logEntry .= "==================\n\n";

// Write to log file
$success = file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

// Prepare response
if ($success !== false) {
    $successMessages = [
        'edits' => 'Code tweak received and logged. The changes will be reviewed soon!',
        'neuralink' => 'Idea successfully transmitted to the Neuralink system. Thanks for your innovative thinking!',
        'proton' => 'Proton beam message successfully sent to destination. Expect a response soon!'
    ];
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => $successMessages[$type]
    ]);
} else {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save message. Please try again.'
    ]);
}
?>