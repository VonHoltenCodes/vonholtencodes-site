<?php
// Start session
session_start();

// File to store users
$users_file = 'users.json';

// Check if user is already logged in
if (isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) {
    header("Location: index.html");
    exit;
}

// Initialize users array
if (file_exists($users_file)) {
    $users = json_decode(file_get_contents($users_file), true);
    if (!is_array($users)) {
        $users = [];
    }
} else {
    $users = [];
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
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);
    $captcha_answer = trim($_POST["captcha"]);

    // Validate CAPTCHA
    if ($captcha_answer != $_SESSION['captcha_answer']) {
        $error = "Incorrect answer to the math question. Try again.";
    } else {
        // Check credentials
        $user_found = false;
        foreach ($users as $user) {
            if ($user['username'] === $username && password_verify($password, $user['password'])) {
                $user_found = true;
                break;
            }
        }
        
        if ($user_found) {
            // Set session variables
            $_SESSION['user_logged_in'] = true;
            $_SESSION['username'] = $username;
            
            // Redirect to homepage
            header("Location: index.html");
            exit;
        } else {
            $error = "Invalid username or password.";
        }
        
        // Reset CAPTCHA
        $num1 = rand(1, 10);
        $num2 = rand(1, 10);
        $_SESSION['captcha_answer'] = $num1 + $num2;
        $_SESSION['captcha_question'] = "What is $num1 + $num2?";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - VonHoltenCodes</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #000;
            color: #00ff00;
            background-image: radial-gradient(circle, #111 1px, transparent 1px);
            background-size: 15px 15px;
        }
        .login-container {
            background-color: rgba(0, 0, 0, 0.7);
            border: 1px solid #ff4500;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(255, 69, 0, 0.5);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        input[type="text"], input[type="password"], input[type="number"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ff4500;
            border-radius: 4px;
            box-sizing: border-box;
            background-color: #111;
            color: #00ff00;
            font-family: 'Courier New', monospace;
        }
        button {
            padding: 10px 20px;
            background-color: #ff4500;
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
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
            font-size: 0.9em;
            margin: 10px 0;
        }
        h2 {
            color: #ff4500;
            text-shadow: 0 0 5px rgba(255, 69, 0, 0.5);
        }
        p {
            margin: 10px 0;
        }
        a {
            color: #ff4500;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
            text-shadow: 0 0 5px rgba(255, 69, 0, 0.5);
        }
        .terminal {
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            font-size: 12px;
            color: rgba(0, 255, 0, 0.7);
            display: flex;
            justify-content: space-between;
            border-top: 1px solid rgba(0, 255, 0, 0.3);
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>LOGIN</h2>
        <form action="login.php" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <p><?php echo htmlspecialchars($_SESSION['captcha_question']); ?></p>
            <input type="number" name="captcha" placeholder="Enter the answer" required>
            <button type="submit">LOGIN</button>
        </form>
        <?php
        if ($error) {
            echo "<p class='error'>" . htmlspecialchars($error) . "</p>";
        }
        ?>
        <p>Don't have an account? <a href="register.php">Create one</a></p>
    </div>
    
    <div class="terminal">
        <span>VHC-LOGIN // <?php echo date('Y-m-d H:i:s'); ?></span>
        <span>IP: <?php echo $_SERVER['REMOTE_ADDR']; ?> // Session: <?php echo session_id(); ?></span>
    </div>
</body>
</html>