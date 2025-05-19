<?php
// Enhanced security admin panel template
// Copy this to admin_secure.php and update configuration

require_once 'inc/secure_session.php';
secure_session_start();

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");

// Include configuration
require_once 'inc/config.php';

// Initialize admin users file if it doesn't exist
if (!file_exists(ADMIN_USERS_FILE)) {
    // First run - create default admin user
    // IMPORTANT: Change these credentials immediately after first login!
    $default_admin = [
        'admin' => [
            'password' => password_hash('changeme', PASSWORD_DEFAULT),
            'created_at' => date('Y-m-d H:i:s'),
            'last_login' => null,
            'failed_attempts' => 0,
            'locked_until' => null
        ]
    ];
    file_put_contents(ADMIN_USERS_FILE, json_encode($default_admin, JSON_PRETTY_PRINT));
    chmod(ADMIN_USERS_FILE, 0640);
}

// Rest of the admin panel code follows...
// [Include the rest of the admin_secure.php code here without sensitive data]