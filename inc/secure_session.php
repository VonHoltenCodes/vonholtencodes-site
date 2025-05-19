<?php
// Secure session configuration

// Set secure session parameters
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', 1800); // 30 minutes
ini_set('session.cookie_lifetime', 0); // Session cookie
ini_set('session.use_strict_mode', 1);
ini_set('session.regenerate_id', 1);

// Custom session save path
$session_path = '/mnt/websites/vonholtencodes.com/secure_data/sessions';
if (!is_dir($session_path)) {
    @mkdir($session_path, 0700, true);
}
// Only set custom path if directory exists and is writable
if (is_dir($session_path) && is_writable($session_path)) {
    session_save_path($session_path);
}

// Start secure session
function secure_session_start() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 300) { // 5 minutes
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
        
        // Check for session timeout
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > 1800) {
            session_destroy();
            session_start();
        }
        $_SESSION['last_activity'] = time();
    }
}

// Enhanced session destruction
function secure_session_destroy() {
    $_SESSION = array();
    
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    session_destroy();
}