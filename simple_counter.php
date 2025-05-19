<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Simple counter file
$counter_file = 'counter.txt';

// Ensure the file exists with proper permissions
if (!file_exists($counter_file)) {
    file_put_contents($counter_file, '1000');
    chmod($counter_file, 0666); // Make writable by web server
}

try {
    // Get current count
    $current_count = (int)file_get_contents($counter_file);
    
    // Increment if requested
    if (isset($_GET['increment']) && $_GET['increment'] == '1') {
        $current_count++;
        
        // Write the new count
        if (file_put_contents($counter_file, $current_count) === false) {
            throw new Exception("Failed to write counter file");
        }
    }
    
    // Return the count
    echo json_encode([
        'success' => true,
        'count' => $current_count,
        'status' => 'ok'
    ]);
} catch (Exception $e) {
    // Return error with fallback count
    echo json_encode([
        'success' => false,
        'count' => 1000, // Fallback count
        'error' => $e->getMessage(),
        'status' => 'error'
    ]);
}
?>