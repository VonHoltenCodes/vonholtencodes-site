<?php
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
    // Create with default users
    $users = [
        'Cullen' => ['password' => password_hash('Faith', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Conor' => ['password' => password_hash('Faith', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Daisy' => ['password' => password_hash('VonHolten', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Bentley' => ['password' => password_hash('TESLA', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')],
        'Chance' => ['password' => password_hash('TESLA', PASSWORD_DEFAULT), 'created_at' => date('Y-m-d H:i:s')]
    ];
    file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
}

$auth_error = '';

// Generate CAPTCHA if not already set
if (!isset($_SESSION['captcha_answer'])) {
    $num1 = rand(1, 10);
    $num2 = rand(1, 10);
    $_SESSION['captcha_answer'] = $num1 + $num2;
    $_SESSION['captcha_question'] = "What is $num1 + $num2?";
}

// Handle login attempt
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username']) && isset($_POST['password'])) {
    $submitted_username = $_POST['username'];
    $submitted_password = $_POST['password'];
    $submitted_captcha = isset($_POST['captcha']) ? $_POST['captcha'] : '';
    
    // Validate CAPTCHA first
    if ($submitted_captcha != $_SESSION['captcha_answer']) {
        $auth_error = 'Incorrect security verification. Try again.';
    } else {
        // Reset CAPTCHA after attempt
        $num1 = rand(1, 10);
        $num2 = rand(1, 10);
        $_SESSION['captcha_answer'] = $num1 + $num2;
        $_SESSION['captcha_question'] = "What is $num1 + $num2?";
        
        // Check user credentials
        if (isset($users[$submitted_username]) && password_verify($submitted_password, $users[$submitted_username]['password'])) {
            $_SESSION['mission_control_user'] = $submitted_username;
        } else {
            $auth_error = 'Invalid credentials. Access denied.';
        }
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    unset($_SESSION['mission_control_user']);
    session_regenerate_id(true);
    header('Location: mission_control.php');
    exit;
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
    <title>VonHoltenCodes - Mission Control</title>
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
        
        /* Login Form */
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
        
        /* Mission Control Panel */
        .control-panel {
            background-color: var(--bg-secondary);
            border: 2px solid var(--border-color);
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 30px;
            position: relative;
        }
        
        .control-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, transparent, var(--accent-color), transparent);
        }
        
        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 69, 0, 0.3);
        }
        
        .panel-header h2 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 1px;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .user-badge {
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 3px;
            padding: 5px 10px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .logout-btn {
            background: none;
            border: none;
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            font-size: 14px;
            cursor: pointer;
            text-decoration: underline;
            padding: 5px;
        }
        
        .logout-btn:hover {
            color: var(--accent-color);
        }
        
        /* Communication Options */
        .comm-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .comm-option {
            border: 2px solid var(--border-color);
            background-color: var(--bg-color);
            padding: 15px;
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .comm-option::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(to right, transparent, var(--accent-color), transparent);
        }
        
        .comm-option:hover {
            transform: translateY(-3px);
            box-shadow: 0 0 15px var(--shadow-color);
        }
        
        .comm-option.active {
            background-color: rgba(255, 69, 0, 0.2);
        }
        
        body.night-mode .comm-option.active {
            background-color: rgba(0, 255, 0, 0.2);
        }
        
        .comm-option .icon {
            margin-bottom: 15px;
            width: 48px;
            height: 48px;
        }
        
        .comm-option .pixel-icon {
            width: 40px;
            height: 40px;
            display: flex;
            flex-direction: column;
            margin: 0 auto 10px;
        }
        
        .comm-option .pixel-row {
            display: flex;
            height: 5px;
        }
        
        .comm-option .pixel {
            width: 5px;
            height: 5px;
        }
        
        .comm-option .label {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Message Form */
        .message-form {
            display: none;
            margin-top: 20px;
        }
        
        .message-form.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
        }
        
        .message-textarea {
            width: 100%;
            height: 150px;
            padding: 12px;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            font-family: 'Courier New', monospace;
            font-size: 14px;
            resize: vertical;
            transition: border-color 0.3s ease;
        }
        
        .message-textarea:focus {
            border-color: var(--accent-color);
            outline: none;
            box-shadow: 0 0 5px var(--shadow-color);
        }
        
        .message-submit {
            background-color: var(--bg-secondary);
            color: var(--text-color);
            border: 2px solid var(--border-color);
            padding: 10px 20px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .message-submit:hover {
            background-color: var(--border-color);
            color: var(--bg-color);
            box-shadow: 0 0 10px var(--shadow-color);
        }
        
        .message-feedback {
            font-size: 14px;
            margin-top: 10px;
            padding: 10px;
            border-left: 3px solid var(--accent-color);
            background-color: rgba(0, 0, 0, 0.2);
            display: none;
        }
        
        .feedback-success {
            color: var(--success-color);
            border-left-color: var(--success-color);
        }
        
        .feedback-error {
            color: var(--error-color);
            border-left-color: var(--error-color);
        }
        
        /* Back Button */
        .back-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: var(--bg-secondary);
            color: var(--text-color);
            text-decoration: none;
            border: 2px solid var(--border-color);
            border-radius: 5px;
            font-weight: bold;
            text-transform: uppercase;
            transition: all 0.3s ease;
        }
        
        .back-button:hover {
            background-color: var(--border-color);
            color: var(--bg-color);
            box-shadow: 0 0 10px var(--shadow-color);
        }
        
        /* Footer */
        footer {
            text-align: center;
            margin-top: auto;
            padding: 20px;
            border-top: 1px solid rgba(255, 69, 0, 0.3);
            font-size: 14px;
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
        
        /* Loading Animation */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 69, 0, 0.2);
            border-radius: 50%;
            border-top-color: var(--accent-color);
            animation: spin 1s linear infinite;
            margin-right: 10px;
            display: none;
        }
        
        @keyframes spin {
            to {transform: rotate(360deg);}
        }
        
        body.night-mode .loading {
            border: 2px solid rgba(0, 255, 0, 0.2);
            border-top-color: var(--accent-color);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            h1 {
                font-size: 22px;
            }
            
            .container {
                padding: 15px;
            }
            
            .comm-options {
                grid-template-columns: 1fr;
            }
            
            .auth-container,
            .control-panel {
                padding: 15px;
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
            <h1>MISSION CONTROL</h1>
            <nav class="main-nav">
                <a href="index.html" class="home-button">
                    <span class="home-icon">⌂</span>
                    RETURN TO BASE
                </a>
            </nav>
        </div>
    </header>

    <div class="container">
        <?php if (!isset($_SESSION['mission_control_user'])): ?>
            <!-- Authentication Form -->
            <div class="auth-container">
                <h2>Access Authorization</h2>
                <?php if ($auth_error): ?>
                    <div class="error-message"><?php echo $auth_error; ?></div>
                <?php endif; ?>
                <form method="POST" action="mission_control.php">
                    <div class="form-row">
                        <label for="username">Callsign:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-row">
                        <label for="password">Access Code:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-row">
                        <label for="captcha"><?php echo htmlspecialchars($_SESSION['captcha_question']); ?></label>
                        <input type="number" id="captcha" name="captcha" required placeholder="Security verification">
                    </div>
                    <div class="form-row" style="text-align: center;">
                        <a href="mission_register.php" style="color: var(--text-color); font-size: 0.9em; text-decoration: none;">Register new access code</a>
                    </div>
                    <button type="submit" class="auth-submit">Authenticate</button>
                </form>
            </div>
        <?php else: ?>
            <!-- Mission Control Panel -->
            <div class="control-panel">
                <div class="panel-header">
                    <h2>Secure Communication Channel</h2>
                    <div class="user-info">
                        <div class="user-badge">
                            <span class="user-icon">◉</span>
                            <span class="user-name"><?php echo htmlspecialchars($_SESSION['mission_control_user']); ?></span>
                        </div>
                        <a href="mission_control.php?logout=1" class="logout-btn">Disconnect</a>
                    </div>
                </div>
                
                <div class="comm-options">
                    <!-- Edits & Code Option -->
                    <div class="comm-option" data-type="edits" onclick="selectCommType('edits')">
                        <div class="pixel-icon">
                            <!-- Wrench Pixel Art -->
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #A9A9A9"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: #C0C0C0"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                        </div>
                        <div class="label">Code Tweaks</div>
                    </div>
                    
                    <!-- New Idea Option -->
                    <div class="comm-option" data-type="neuralink" onclick="selectCommType('neuralink')">
                        <div class="pixel-icon">
                            <!-- Brain Pixel Art -->
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF1493"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: #FF69B4"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                        </div>
                        <div class="label">Idea Neuralink</div>
                    </div>
                    
                    <!-- Direct Message Option -->
                    <div class="comm-option" data-type="proton" onclick="selectCommType('proton')">
                        <div class="pixel-icon">
                            <!-- Rocket Pixel Art -->
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #FFFFFF"></div>
                                <div class="pixel" style="background-color: #FFFFFF"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #FFFFFF"></div>
                                <div class="pixel" style="background-color: #808080"></div>
                                <div class="pixel" style="background-color: #808080"></div>
                                <div class="pixel" style="background-color: #FFFFFF"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: #FF0000"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #FFA500"></div>
                                <div class="pixel" style="background-color: #FFA500"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #800000"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                            <div class="pixel-row">
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: #FFA500"></div>
                                <div class="pixel" style="background-color: #FFA500"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                                <div class="pixel" style="background-color: transparent"></div>
                            </div>
                        </div>
                        <div class="label">Proton Beam</div>
                    </div>
                </div>
                
                <!-- Message Forms -->
                <div id="edits-form" class="message-form">
                    <div class="form-group">
                        <label for="edits-message">Enter code tweak or edit suggestion:</label>
                        <textarea id="edits-message" class="message-textarea" placeholder="Describe the code changes you'd like to see..."></textarea>
                    </div>
                    <button type="button" class="message-submit" onclick="submitMessage('edits')">
                        <span class="loading" id="edits-loading"></span>
                        Transmit Code Tweak
                    </button>
                    <div id="edits-feedback" class="message-feedback"></div>
                </div>
                
                <div id="neuralink-form" class="message-form">
                    <div class="form-group">
                        <label for="neuralink-message">Share your new idea:</label>
                        <textarea id="neuralink-message" class="message-textarea" placeholder="Describe your brilliant new idea for the site..."></textarea>
                    </div>
                    <button type="button" class="message-submit" onclick="submitMessage('neuralink')">
                        <span class="loading" id="neuralink-loading"></span>
                        Neural Transfer
                    </button>
                    <div id="neuralink-feedback" class="message-feedback"></div>
                </div>
                
                <div id="proton-form" class="message-form">
                    <div class="form-group">
                        <label for="proton-message">Direct message through proton beam:</label>
                        <textarea id="proton-message" class="message-textarea" placeholder="Type your direct message here..."></textarea>
                    </div>
                    <button type="button" class="message-submit" onclick="submitMessage('proton')">
                        <span class="loading" id="proton-loading"></span>
                        Launch Message
                    </button>
                    <div id="proton-feedback" class="message-feedback"></div>
                </div>
            </div>
        <?php endif; ?>
        
    </div>

    <div class="terminal-line">
        <span>VHC-MISSION-CONTROL // <?php echo date('Y-m-d H:i:s'); ?></span>
        <span>STATUS: <?php echo isset($_SESSION['mission_control_user']) ? 'AUTHENTICATED' : 'AWAITING AUTHENTICATION'; ?></span>
    </div>
    
    <footer>
        VonHoltenCodes - Secure Mission Control &copy; 2025
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
        
        // Select communication type
        function selectCommType(type) {
            // Reset all options and forms
            document.querySelectorAll('.comm-option').forEach(option => {
                option.classList.remove('active');
            });
            
            document.querySelectorAll('.message-form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Activate selected option and form
            document.querySelector(`.comm-option[data-type="${type}"]`).classList.add('active');
            document.getElementById(`${type}-form`).classList.add('active');
        }
        
        // Submit message
        async function submitMessage(type) {
            const messageElement = document.getElementById(`${type}-message`);
            const feedbackElement = document.getElementById(`${type}-feedback`);
            const loadingElement = document.getElementById(`${type}-loading`);
            
            const message = messageElement.value.trim();
            
            if (!message) {
                feedbackElement.textContent = 'Message cannot be empty. Please enter a message.';
                feedbackElement.className = 'message-feedback feedback-error';
                feedbackElement.style.display = 'block';
                return;
            }
            
            // Show loading indicator
            loadingElement.style.display = 'inline-block';
            
            try {
                // Create form data
                const formData = new FormData();
                formData.append('type', type);
                formData.append('message', message);
                formData.append('user', '<?php echo isset($_SESSION['mission_control_user']) ? htmlspecialchars($_SESSION['mission_control_user']) : ''; ?>');
                
                const response = await fetch('submit_message.php', {
                    method: 'POST',
                    body: formData
                });
                
                // Add a small delay to make the loading animation visible
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (response.ok) {
                    const result = await response.json();
                    
                    if (result.success) {
                        feedbackElement.textContent = result.message || 'Message successfully transmitted!';
                        feedbackElement.className = 'message-feedback feedback-success';
                        messageElement.value = '';
                    } else {
                        feedbackElement.textContent = result.message || 'Failed to transmit message. Please try again.';
                        feedbackElement.className = 'message-feedback feedback-error';
                    }
                } else {
                    feedbackElement.textContent = 'Network error. Please check your connection and try again.';
                    feedbackElement.className = 'message-feedback feedback-error';
                }
            } catch (error) {
                console.error('Error:', error);
                feedbackElement.textContent = 'An unexpected error occurred. Please try again later.';
                feedbackElement.className = 'message-feedback feedback-error';
            } finally {
                loadingElement.style.display = 'none';
                feedbackElement.style.display = 'block';
            }
        }
        
        // Initialize first form when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // If authenticated, select first communication option
            <?php if (isset($_SESSION['mission_control_user'])): ?>
                selectCommType('edits');
            <?php endif; ?>
        });
    </script>
</body>
</html>