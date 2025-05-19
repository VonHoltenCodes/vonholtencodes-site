<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Counter file
$counter_file = 'counter.txt';

// Debug mode (set to false in production)
$debug = false;
$debug_log = [];

try {
    // Make sure counter file exists with correct permissions
    if (!file_exists($counter_file)) {
        $debug_log[] = "Counter file doesn't exist, creating it";
        file_put_contents($counter_file, '320'); // Start with current count
        chmod($counter_file, 0666); // Make writable by web server
    }
    
    // Check if counter file is readable
    if (!is_readable($counter_file)) {
        throw new Exception("Counter file is not readable");
    }
    
    // Get current count with error handling
    $file_contents = file_get_contents($counter_file);
    if ($file_contents === false) {
        throw new Exception("Failed to read counter file");
    }
    
    $current_count = (int)trim($file_contents);
    $debug_log[] = "Current count: $current_count";
    
    // Store IP addresses to prevent double counting
    $ip_log_file = 'logs/ip_counter.log';
    $visitor_ip = $_SERVER['REMOTE_ADDR'];
    $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown';
    
    // Create logs directory if it doesn't exist
    if (!file_exists('logs')) {
        mkdir('logs', 0777, true);
    }
    
    // Increment counter if requested and not already counted for this IP today
    if (isset($_GET['increment']) && $_GET['increment'] == '1') {
        $debug_log[] = "Increment requested";
        
        // Check if we already counted this IP today
        $counted_today = false;
        
        if (file_exists($ip_log_file)) {
            $ip_log = file_get_contents($ip_log_file);
            $today = date('Y-m-d');
            
            // Check if IP + date exists in log
            if (strpos($ip_log, "$visitor_ip|$today") !== false) {
                $counted_today = true;
                $debug_log[] = "IP already counted today";
            }
        }
        
        if (!$counted_today) {
            // Increment counter
            $current_count++;
            $debug_log[] = "Incrementing to: $current_count";
            
            // Write to counter file with exclusive lock
            $result = file_put_contents($counter_file, $current_count, LOCK_EX);
            if ($result === false) {
                throw new Exception("Failed to write counter file");
            }
            
            // Log the IP with timestamp
            $timestamp = date('Y-m-d H:i:s');
            $log_entry = "$visitor_ip|$today|$timestamp|$user_agent\n";
            file_put_contents($ip_log_file, $log_entry, FILE_APPEND);
            
            $debug_log[] = "Logged IP: $visitor_ip";
        }
    }
    
    // Return the count along with debug info if enabled
    $response = [
        'success' => true,
        'count' => $current_count,
        'status' => 'ok'
    ];
    
    if ($debug) {
        $response['debug'] = $debug_log;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // Return error with fallback count
    $response = [
        'success' => false,
        'count' => 320, // Fallback to current count
        'error' => $e->getMessage(),
        'status' => 'error'
    ];
    
    if ($debug) {
        $response['debug'] = $debug_log;
    }
    
    echo json_encode($response);
}
?>