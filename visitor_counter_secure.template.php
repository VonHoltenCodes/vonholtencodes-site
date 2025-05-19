<?php
// Secure visitor counter template
// Copy this to visitor_counter_secure.php and update paths

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Include configuration
require_once 'inc/config.php';

// Use configuration constants instead of hardcoded paths
$counter_file = STATS_PATH . 'counter.txt';
$backup_file = STATS_PATH . 'counter_backup.txt';
$debug_mode = false;
$log_file = STATS_PATH . 'counter_log.txt';

// Rest of the visitor counter code follows...
// [Include the rest without hardcoded paths]