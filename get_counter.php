<?php
header('Content-Type: application/json');

// Path to counter file
$counter_file = 'counter.txt';

// Create if it doesn't exist
if (!file_exists($counter_file)) {
    file_put_contents($counter_file, '0');
}

// Get current count
$current_count = (int)file_get_contents($counter_file);

// Increment count only for new visitors (check if increment param is set)
if (isset($_GET['increment']) && $_GET['increment'] === '1') {
    $current_count++;
    file_put_contents($counter_file, $current_count);
}

// Return the count
echo json_encode(['count' => $current_count]);
?>