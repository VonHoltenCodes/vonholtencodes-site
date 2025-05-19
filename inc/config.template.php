<?php
// Configuration template file
// Copy this to config.php and update with your actual values

// Define secure data paths
define('SECURE_DATA_PATH', '/path/to/secure/data/');
define('USERS_PATH', SECURE_DATA_PATH . 'users/');
define('MESSAGES_PATH', SECURE_DATA_PATH . 'messages/');
define('LOGS_PATH', SECURE_DATA_PATH . 'logs/');
define('SESSIONS_PATH', SECURE_DATA_PATH . 'sessions/');

// Define file paths
define('USERS_FILE', USERS_PATH . 'users.json');
define('MISSION_USERS_FILE', USERS_PATH . 'mission_users.json');
define('MESSAGES_FILE', MESSAGES_PATH . 'messages.json');
define('ADMIN_USERS_FILE', USERS_PATH . 'admin_users.json');

// Security settings
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes
define('SESSION_TIMEOUT', 1800); // 30 minutes
define('CSRF_TOKEN_LENGTH', 32);

// API Keys (move these to environment variables in production)
define('WEATHER_API_KEY', 'your_api_key_here');

// Database settings (for future use)
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', LOGS_PATH . 'php_errors.log');