<?php
// Set appropriate headers
header('Content-Type: application/json');

// Get client IP address
$ip = $_SERVER['REMOTE_ADDR'];

// Sanitize IP address (simple sanitization)
$ip = preg_replace('/[^0-9.]/', '', $ip);

// Storage directory with proper permissions
$storageDir = '../../data/avatars/';

// Create directory if it doesn't exist
if (!file_exists($storageDir)) {
    mkdir($storageDir, 0755, true);
}

// Define the file path for this IP
$filePath = $storageDir . md5($ip) . '.json';

// Process the request based on method
$method = $_SERVER['REQUEST_METHOD'];

// Response array
$response = [
    'success' => false,
    'message' => 'Unknown error'
];

try {
    if ($method === 'POST') {
        // Get the avatar data from POST
        $jsonData = file_get_contents('php://input');
        
        // Validate JSON
        $data = json_decode($jsonData);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data');
        }
        
        // Write to file
        if (file_put_contents($filePath, $jsonData)) {
            $response['success'] = true;
            $response['message'] = 'Avatar saved successfully!';
        } else {
            throw new Exception('Could not write to file');
        }
    } else if ($method === 'GET') {
        // Check if file exists
        if (file_exists($filePath)) {
            // Read the avatar data
            $jsonData = file_get_contents($filePath);
            
            // Validate JSON
            $data = json_decode($jsonData);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid saved data');
            }
            
            $response['success'] = true;
            $response['message'] = 'Avatar loaded successfully!';
            $response['data'] = $data;
        } else {
            throw new Exception('No saved avatar found');
        }
    } else {
        throw new Exception('Unsupported request method');
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Send JSON response
echo json_encode($response);
?>