<?php
// Start session for CAPTCHA
session_start();

// File to store mission control users
$users_file = 'mission_users.json';

// Initialize users array
if (file_exists($users_file)) {
    $users = json_decode(file_get_contents($users_file), true);
    if (!is_array($users)) {
        $users = [];
    }
} else {
    // Create with default users from mission_control.php
    $users = [
        'Cullen' => ['password' => password_hash('Faith', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Conor' => ['password' => password_hash('Faith', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Daisy' => ['password' => password_hash('VonHolten', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Bentley' => ['password' => password_hash('TESLA', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Chance' => ['password' => password_hash('TESLA', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')]
    ];
    file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
}

// Generate CAPTCHA if not already set
if (!isset($_SESSION['captcha_answer'])) {
    $num1 = rand(1, 10);
    $num2 = rand(1, 10);
    $_SESSION['captcha_answer'] = $num1 + $num2;
    $_SESSION['captcha_question'] = "What is $num1 + $num2?";
}

// Process form submission
$error = '';
$success = '';
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);
    $captcha_answer = trim($_POST["captcha"]);

    // Validate CAPTCHA
    if ($captcha_answer != $_SESSION['captcha_answer']) {
        $error = "Incorrect answer to the math question. Try again.";
    } else {
        // Validate input
        if (empty($username) || empty($password)) {
            $error = "Username and password are required.";
        } elseif (strlen($username) > 50) {
            $error = "Username must be 50 characters or less.";
        } elseif (strlen($password) < 5) {
            $error = "Password must be at least 5 characters.";
        } elseif (!preg_match("/^[a-zA-Z0-9_]+$/", $username)) {
            $error = "Username can only contain letters, numbers, and underscores.";
        } else {
            // Check if username exists
            if (isset($users[$username])) {
                $error = "Username is already taken.";
            } else {
                // Hash password and add user
                $users[$username] = [
                    'password' => password_hash($password, PASSWORD_DEFAULT),
                    'created_at' => date('Y-m-d H:i:s')
                ];
                
                // Save users to file
                file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
                
                $success = "Mission Control access created! You can now log in.";
                
                // Reset CAPTCHA
                $num1 = rand(1, 10);
                $num2 = rand(1, 10);
                $_SESSION['captcha_answer'] = $num1 + $num2;
                $_SESSION['captcha_question'] = "What is $num1 + $num2?";
            }
        }
    }
}

// Function to check if night mode is active
function isNightMode() {
    return isset($_COOKIE['night_mode']) && $_COOKIE['night_mode'] === 'true';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mission Control - New User Registration</title>
    <style>
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary-color: #ff4500;
            --accent-color: #ff4500;
            --bg-color: #000000;
            --bg-secondary: #111111;
            --text-color: #ff4500;
            --border-color: #ff4500;
            --shadow-color: rgba(255, 69, 0, 0.5);
            --success-color: #00ff00;
            --error-color: #ff0000;
        }
        
        body.night-mode {
            --primary-color: #00ff00;
            --accent-color: #00ff00;
            --bg-color: #000000;
            --bg-secondary: #0a0a0a;
            --text-color: #00ff00;
            --border-color: #00ff00;
            --shadow-color: rgba(0, 255, 0, 0.5);
        }
        
        body {
            font-family: 'Courier New', monospace;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            background-image: radial-gradient(circle, #111 1px, transparent 1px);
            background-size: 15px 15px;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            overflow-x: hidden;
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ff4500' stroke-width='2' fill='none'/%3E%3Ccircle cx='12' cy='12' r='2' fill='%23ff4500'/%3E%3Cline x1='12' y1='2' x2='12' y2='4' stroke='%23ff4500' stroke-width='2'/%3E%3Cline x1='12' y1='20' x2='12' y2='22' stroke='%23ff4500' stroke-width='2'/%3E%3Cline x1='2' y1='12' x2='4' y2='12' stroke='%23ff4500' stroke-width='2'/%3E%3Cline x1='20' y1='12' x2='22' y2='12' stroke='%23ff4500' stroke-width='2'/%3E%3C/svg%3E"), auto;
        }
        
        body.night-mode {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%2300ff00' stroke-width='2' fill='none'/%3E%3Ccircle cx='12' cy='12' r='2' fill='%2300ff00'/%3E%3Cline x1='12' y1='2' x2='12' y2='4' stroke='%2300ff00' stroke-width='2'/%3E%3Cline x1='12' y1='20' x2='12' y2='22' stroke='%2300ff00' stroke-width='2'/%3E%3Cline x1='2' y1='12' x2='4' y2='12' stroke='%2300ff00' stroke-width='2'/%3E%3Cline x1='20' y1='12' x2='22' y2='12' stroke='%2300ff00' stroke-width='2'/%3E%3C/svg%3E"), auto;
        }
        
        /* Header with Animation */
        header {
            position: relative;
            height: 120px;
            border-bottom: 2px solid var(--border-color);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 40px;
            padding: 0 20px;
        }
        
        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        h1 {
            font-size: 28px;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 10px var(--shadow-color);
            margin-bottom: 10px;
        }
        
        .main-nav {
            margin-top: 10px;
        }
        
        .home-button {
            display: inline-flex;
            align-items: center;
            background-color: var(--bg-secondary);
            color: var(--text-color);
            text-decoration: none;
            padding: 8px 15px;
            border: 2px solid var(--border-color);
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            transition: all 0.3s ease;
            gap: 8px;
        }
        
        .home-button:hover {
            background-color: var(--border-color);
            color: var(--bg-color);
            box-shadow: 0 0 10px var(--shadow-color);
            transform: translateY(-2px);
        }
        
        .home-icon {
            font-size: 18px;
        }
        
        /* Container Styles */
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            flex-grow: 1;
        }
        
        /* Registration Form */
        .auth-container {
            background-color: var(--bg-secondary);
            border: 2px solid var(--border-color);
            border-radius: 5px;
            padding: 30px;
            margin: 40px auto;
            max-width: 400px;
            position: relative;
            overflow: hidden;
        }
        
        .auth-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, transparent, var(--accent-color), transparent);
        }
        
        .auth-container h2 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 20px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .form-row {
            margin-bottom: 15px;
        }
        
        .form-row label {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
            text-transform: uppercase;
        }
        
        .form-row input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            background-color: rgba(0, 0, 0, 0.3);
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            font-size: 16px;
        }
        
        .error-message {
            color: var(--error-color);
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
        }
        
        .success-message {
            color: var(--success-color);
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
        }
        
        .auth-submit {
            background-color: var(--bg-secondary);
            color: var(--text-color);
            border: 2px solid var(--border-color);
            padding: 10px 20px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            text-transform: uppercase;
            cursor: pointer;
            display: block;
            margin: 20px auto 0;
            transition: all 0.3s ease;
        }
        
        .auth-submit:hover {
            background-color: var(--border-color);
            color: var(--bg-color);
            box-shadow: 0 0 10px var(--shadow-color);
        }
        
        .login-link {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
        }
        
        .login-link a {
            color: var(--text-color);
            text-decoration: none;
        }
        
        .login-link a:hover {
            text-decoration: underline;
        }
        
        /* Night mode toggle button */
        .night-mode-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            font-size: 14px;
            cursor: pointer;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 100;
        }
        
        .night-mode-toggle:hover {
            text-decoration: underline;
        }
        
        /* Terminal Effect */
        .terminal-line {
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            font-size: 12px;
            color: var(--text-color);
            opacity: 0.7;
            display: flex;
            justify-content: space-between;
        }
        
        /* Footer */
        footer {
            text-align: center;
            margin-top: auto;
            padding: 20px;
            border-top: 1px solid rgba(255, 69, 0, 0.3);
            font-size: 14px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .auth-container {
                padding: 20px;
                margin: 20px;
                width: auto;
            }
            
            h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body class="<?php echo isNightMode() ? 'night-mode' : ''; ?>">
    <button class="night-mode-toggle" onclick="toggleNightMode()">
        <span id="mode-text"><?php echo isNightMode() ? 'DAY MODE' : 'NIGHT MODE'; ?></span>
    </button>

    <header>
        <div class="header-content">
            <h1>MISSION CONTROL REGISTRATION</h1>
            <nav class="main-nav">
                <a href="index.html" class="home-button">
                    <span class="home-icon">⌂</span>
                    RETURN TO BASE
                </a>
            </nav>
        </div>
    </header>

    <div class="container">
        <div class="auth-container">
            <h2>New Operative Registration</h2>
            
            <?php if ($error): ?>
                <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="success-message"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
            
            <form method="POST" action="mission_register.php">
                <div class="form-row">
                    <label for="username">Callsign:</label>
                    <input type="text" id="username" name="username" required maxlength="50" autocomplete="off">
                </div>
                
                <div class="form-row">
                    <label for="password">Access Code:</label>
                    <input type="password" id="password" name="password" required minlength="5">
                </div>
                
                <div class="form-row">
                    <label for="captcha"><?php echo htmlspecialchars($_SESSION['captcha_question']); ?></label>
                    <input type="number" id="captcha" name="captcha" required placeholder="Security verification">
                </div>
                
                <button type="submit" class="auth-submit">REGISTER CREDENTIALS</button>
            </form>
            
            <div class="login-link">
                <p>Already have access? <a href="mission_control.php">Return to Mission Control</a></p>
            </div>
        </div>
    </div>

    <div class="terminal-line">
        <span>VHC-REGISTER // <?php echo date('Y-m-d H:i:s'); ?></span>
        <span>STATUS: SECURE // IP: <?php echo $_SERVER['REMOTE_ADDR']; ?></span>
    </div>
    
    <footer>
        VonHoltenCodes - Secure Mission Control Registration &copy; 2025
    </footer>

    <script>
        // Toggle night mode
        function toggleNightMode() {
            document.body.classList.toggle('night-mode');
            updateModeText();
            
            // Store night mode preference in a cookie
            const isNightMode = document.body.classList.contains('night-mode');
            document.cookie = `night_mode=${isNightMode}; path=/; max-age=${60*60*24*365}`;
        }
        
        // Update mode text on the toggle button
        function updateModeText() {
            const modeText = document.getElementById('mode-text');
            if (document.body.classList.contains('night-mode')) {
                modeText.textContent = 'DAY MODE';
            } else {
                modeText.textContent = 'NIGHT MODE';
            }
        }
    </script>
</body>
</html>