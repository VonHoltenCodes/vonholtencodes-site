<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *'); // Allow cross-origin requests

// Configuration
$counter_file = 'counter.txt';
$backup_file = 'counter_backup.txt';
$debug_mode = false; // Set to true for debugging
$log_file = 'logs/counter_log.txt';

// Initialize response
$response = [
    'success' => true,
    'count' => 0,
    'timestamp' => time()
];

// Create logs directory if it doesn't exist
if (!file_exists('logs') && !is_dir('logs')) {
    mkdir('logs', 0755, true);
}

// Helper function to log messages
function log_message($message) {
    global $log_file, $debug_mode;
    if ($debug_mode) {
        $timestamp = date('Y-m-d H:i:s');
        $log_entry = "[$timestamp] $message\n";
        file_put_contents($log_file, $log_entry, FILE_APPEND);
    }
}

try {
    // Create counter file if it doesn't exist
    if (!file_exists($counter_file)) {
        log_message("Counter file does not exist. Creating new file.");
        file_put_contents($counter_file, '320');
        chmod($counter_file, 0644);
    }
    
    // Read current count
    $file_contents = file_get_contents($counter_file);
    if ($file_contents === false) {
        throw new Exception("Could not read counter file");
    }
    
    // Parse current count
    $current_count = (int)trim($file_contents);
    log_message("Current count: $current_count");
    
    // Backup counter value (once per day)
    $today = date('Y-m-d');
    $backup_info = [];
    
    if (file_exists($backup_file)) {
        $backup_contents = file_get_contents($backup_file);
        if ($backup_contents) {
            $backup_info = json_decode($backup_contents, true) ?: [];
        }
    }
    
    // If we haven't done a backup today, do one now
    if (!isset($backup_info['last_backup']) || $backup_info['last_backup'] !== $today) {
        $backup_info = [
            'last_backup' => $today,
            'count' => $current_count,
            'timestamp' => time()
        ];
        file_put_contents($backup_file, json_encode($backup_info));
        log_message("Created backup: count = $current_count");
    }
    
    // Increment counter if requested
    if (isset($_GET['increment']) && $_GET['increment'] === '1') {
        // Get visitor info
        $visitor_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $referer = $_SERVER['HTTP_REFERER'] ?? 'direct';
        
        // Should we increment?
        $should_increment = true;
        
        // Check if this visitor was already counted today
        $ip_log_file = "logs/ip_visitors_$today.log";
        if (file_exists($ip_log_file)) {
            $ip_log = file_get_contents($ip_log_file);
            if (strpos($ip_log, $visitor_ip) !== false) {
                // IP already logged today
                $should_increment = false;
                log_message("IP $visitor_ip already counted today");
            }
        }
        
        if ($should_increment) {
            // Increment the counter
            $current_count++;
            
            // Write back to file with exclusive lock
            if (file_put_contents($counter_file, $current_count, LOCK_EX) === false) {
                throw new Exception("Failed to update counter file");
            }
            
            // Log the visitor
            $timestamp = date('Y-m-d H:i:s');
            $log_entry = "$timestamp|$visitor_ip|" . substr($user_agent, 0, 150) . "|$referer\n";
            file_put_contents($ip_log_file, $log_entry, FILE_APPEND | LOCK_EX);
            
            log_message("Counter incremented to $current_count");
        }
    }
    
    // Set response data
    $response['count'] = $current_count;
    
} catch (Exception $e) {
    // Handle errors
    log_message("Error: " . $e->getMessage());
    $response['success'] = false;
    $response['error'] = $e->getMessage();
    
    // Try to read backup if available
    if (file_exists($backup_file)) {
        $backup_contents = file_get_contents($backup_file);
        if ($backup_contents) {
            $backup_info = json_decode($backup_contents, true);
            if (isset($backup_info['count'])) {
                $response['count'] = $backup_info['count'];
                log_message("Using backup count: " . $backup_info['count']);
            }
        }
    }
    
    // Default fallback count
    if ($response['count'] == 0) {
        $response['count'] = 320;
        log_message("Using hardcoded fallback count: 320");
    }
}

// Add debug info if in debug mode
if ($debug_mode) {
    $response['debug'] = true;
    $response['browser'] = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $response['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $response['timestamp'] = date('Y-m-d H:i:s');
}

// Return JSON response
echo json_encode($response);
?>