<?php
// Basic Authentication - This is a secondary layer behind .htaccess protection
session_start();

// Handle logout
if (isset($_POST['logout'])) {
    $_SESSION['admin_logged_in'] = false;
    session_destroy();
    header("Location: ".$_SERVER['PHP_SELF']);
    exit;
}

// Check if already logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Handle login attempts
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = isset($_POST['username']) ? $_POST['username'] : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        
        // Check credentials
        if ($username === 'REDACTED_USERNAME' && $password === 'REDACTED_PASSWORD') {
            $_SESSION['admin_logged_in'] = true;
            // Redirect to the same page to display admin content
            header("Location: ".$_SERVER['PHP_SELF']);
            exit;
        } else {
            $error_message = "Invalid credentials";
        }
    }
    
    // Show login form
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Access</title>
        <style>
            body {
                font-family: 'Courier New', monospace;
                background-color: #000;
                color: #ff4500;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-image: radial-gradient(circle, #111 1px, transparent 1px);
                background-size: 15px 15px;
            }
            .login-container {
                background-color: rgba(0, 0, 0, 0.7);
                border: 1px solid #ff4500;
                padding: 30px;
                border-radius: 5px;
                width: 300px;
                box-shadow: 0 0 20px rgba(255, 69, 0, 0.5);
            }
            h1 {
                text-align: center;
                margin-bottom: 20px;
                color: #ff4500;
                text-shadow: 0 0 5px #ff4500;
            }
            form {
                display: flex;
                flex-direction: column;
            }
            label {
                margin-bottom: 5px;
                color: #ff4500;
            }
            input {
                padding: 8px;
                margin-bottom: 15px;
                border: 1px solid #ff4500;
                background-color: #111;
                color: #ff4500;
                font-family: 'Courier New', monospace;
            }
            button {
                padding: 10px;
                background-color: #ff4500;
                color: #000;
                border: none;
                cursor: pointer;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                transition: all 0.3s;
            }
            button:hover {
                background-color: #ff6a33;
                box-shadow: 0 0 10px #ff4500;
            }
            .error {
                color: #ff0000;
                margin-bottom: 15px;
                text-align: center;
            }
            .terminal {
                position: fixed;
                bottom: 10px;
                right: 10px;
                font-size: 10px;
                color: rgba(255, 69, 0, 0.5);
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>ADMIN ACCESS</h1>
            <?php if (isset($error_message)): ?>
                <div class="error"><?php echo $error_message; ?></div>
            <?php endif; ?>
            <form method="post">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required autocomplete="off">
                
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                
                <button type="submit">AUTHENTICATE</button>
            </form>
        </div>
        <div class="terminal">
            VHC-ADMIN // <?php echo date('Y-m-d H:i:s'); ?>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// If we get here, the user is logged in

// Handle counter reset if requested
if (isset($_POST['reset_counter'])) {
    $new_value = isset($_POST['counter_value']) ? (int)$_POST['counter_value'] : 0;
    file_put_contents('counter.txt', $new_value);
    header("Location: ".$_SERVER['PHP_SELF']."?counter_reset=1");
    exit;
}

// Read counter value
$counter_value = file_exists('counter.txt') ? file_get_contents('counter.txt') : 'N/A';

// Get server info
$server_info = [
    'Server Software' => $_SERVER['SERVER_SOFTWARE'],
    'PHP Version' => phpversion(),
    'Server Protocol' => $_SERVER['SERVER_PROTOCOL'],
    'HTTP Host' => $_SERVER['HTTP_HOST'],
    'Remote Address' => $_SERVER['REMOTE_ADDR'],
    'Server Admin' => $_SERVER['SERVER_ADMIN'] ?? 'N/A',
    'Document Root' => $_SERVER['DOCUMENT_ROOT'],
    'Server Time' => date('Y-m-d H:i:s'),
    'Free Disk Space' => round(disk_free_space($_SERVER['DOCUMENT_ROOT']) / (1024*1024*1024), 2) . ' GB',
    'Total Disk Space' => round(disk_total_space($_SERVER['DOCUMENT_ROOT']) / (1024*1024*1024), 2) . ' GB'
];

// Get recent visitors (from counter.txt's modification time)
$counter_mod_time = file_exists('counter.txt') ? date('Y-m-d H:i:s', filemtime('counter.txt')) : 'N/A';

// Check HTTP access logs if available (limited to last 10 entries)
$access_log = '';
$log_path = '/var/log/apache2/access.log';
if (file_exists($log_path) && is_readable($log_path)) {
    $access_log = shell_exec("tail -n 10 $log_path");
} else {
    $access_log = "Log file not accessible";
}

// Get memory usage
$memory_usage = [
    'Current Script' => round(memory_get_usage() / 1024 / 1024, 2) . ' MB',
    'Peak Usage' => round(memory_get_peak_usage() / 1024 / 1024, 2) . ' MB'
];

// Display admin dashboard
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VHC Admin Dashboard</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background-color: #000;
            color: #00ff00;
            margin: 0;
            padding: 20px;
            background-image: radial-gradient(circle, #111 1px, transparent 1px);
            background-size: 15px 15px;
        }
        .admin-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #00ff00;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        h1, h2, h3 {
            color: #ff4500;
            text-shadow: 0 0 5px rgba(255, 69, 0, 0.5);
        }
        .logout {
            background-color: #ff4500;
            color: #000;
            border: none;
            padding: 8px 15px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        .logout:hover {
            background-color: #ff6a33;
            box-shadow: 0 0 10px #ff4500;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
        }
        .panel {
            background-color: rgba(0, 0, 0, 0.7);
            border: 1px solid #00ff00;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
        }
        .label {
            color: #ff4500;
            font-weight: bold;
        }
        pre {
            background-color: #111;
            color: #00ff00;
            padding: 10px;
            overflow: auto;
            max-height: 300px;
            border: 1px solid #333;
            margin-top: 10px;
        }
        .counter-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .counter-display {
            font-size: 2.5rem;
            font-weight: bold;
            color: #ff4500;
            padding: 10px 15px;
            background-color: #111;
            border: 1px solid #ff4500;
            letter-spacing: 5px;
        }
        .blink {
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0.5; }
        }
        .terminal-line {
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: rgba(0, 255, 0, 0.7);
            border-top: 1px solid rgba(0, 255, 0, 0.3);
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <header>
            <h1>VHC ADMIN DASHBOARD</h1>
            <form method="post">
                <input type="hidden" name="logout" value="1">
                <button type="submit" class="logout">LOGOUT</button>
            </form>
        </header>
        
        <?php if (isset($_GET['counter_reset'])): ?>
        <div class="panel" style="border-color: #ff4500; margin-bottom: 20px;">
            <p style="color: #00ff00; margin: 0;">✓ Counter has been updated successfully</p>
        </div>
        <?php endif; ?>
        
        <div class="dashboard-grid">
            <div class="panel">
                <h2>Visitor Counter</h2>
                <div class="counter-info">
                    <div class="counter-display"><?php echo str_pad($counter_value, 5, '0', STR_PAD_LEFT); ?></div>
                    <div>
                        <p>Last updated: <?php echo $counter_mod_time; ?></p>
                        <form method="post" style="display: flex; gap: 10px; align-items: center;">
                            <input type="hidden" name="reset_counter" value="1">
                            <input type="number" name="counter_value" value="<?php echo $counter_value; ?>" style="width: 100px; background-color: #111; color: #00ff00; border: 1px solid #00ff00; padding: 5px;">
                            <button type="submit" class="logout">UPDATE COUNTER</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="panel">
                <h2>Server Information</h2>
                <div class="info-grid">
                    <?php foreach ($server_info as $key => $value): ?>
                    <div class="label"><?php echo $key; ?>:</div>
                    <div><?php echo $value; ?></div>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <div class="panel">
                <h2>PHP Memory Usage</h2>
                <div class="info-grid">
                    <?php foreach ($memory_usage as $key => $value): ?>
                    <div class="label"><?php echo $key; ?>:</div>
                    <div><?php echo $value; ?></div>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <div class="panel">
                <h2>Recent Access Logs</h2>
                <pre><?php echo htmlspecialchars($access_log); ?></pre>
            </div>
        </div>
    </div>
    
    <div class="terminal-line">
        <span>VHC-ADMIN // <?php echo date('Y-m-d H:i:s'); ?></span>
        <span>User: <?php echo $_SERVER['REMOTE_ADDR']; ?> // Session: <?php echo session_id(); ?></span>
    </div>
    
    <script>
        // Add blinking effect to the counter
        const counterDisplay = document.querySelector('.counter-display');
        setInterval(() => {
            counterDisplay.classList.toggle('blink');
        }, 1000);
        
        // Auto-refresh the page every 60 seconds
        setTimeout(() => {
            window.location.reload();
        }, 60000);
    </script>
</body>
</html>