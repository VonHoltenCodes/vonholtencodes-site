<?php
// Basic authentication for security
$auth_username = 'traxx';
$auth_password = 'VonHolten2025'; // Correct password

// Check if authentication is provided
if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW']) ||
    strtolower($_SERVER['PHP_AUTH_USER']) !== strtolower($auth_username) || $_SERVER['PHP_AUTH_PW'] !== $auth_password) {
    header('WWW-Authenticate: Basic realm="Mission Control Messages"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Authentication required';
    exit;
}

// Define log file path
$logFile = __DIR__ . '/logs/mission_control_messages.log';

// Get message count if requested
if (isset($_GET['count'])) {
    $count = 0;
    if (file_exists($logFile)) {
        $content = file_get_contents($logFile);
        $count = substr_count($content, '=== NEW MESSAGE ===');
    }
    header('Content-Type: application/json');
    echo json_encode(['count' => $count]);
    exit;
}

// Reset logs if requested
if (isset($_GET['reset']) && $_GET['reset'] === 'confirm') {
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
    }
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Format for output
$format = isset($_GET['format']) ? $_GET['format'] : 'html';

// Get log content
$messages = [];
if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $messageBlocks = explode('=== NEW MESSAGE ===', $content);
    
    // Skip the first empty block
    array_shift($messageBlocks);
    
    foreach ($messageBlocks as $block) {
        if (empty(trim($block))) continue;
        
        $message = [];
        $lines = explode("\n", trim($block));
        
        foreach ($lines as $line) {
            if (strpos($line, 'Time: ') === 0) {
                $message['time'] = trim(substr($line, 6));
            } elseif (strpos($line, 'User: ') === 0) {
                $message['user'] = trim(substr($line, 6));
            } elseif (strpos($line, 'Type: ') === 0) {
                $message['type'] = trim(substr($line, 6));
            } elseif (strpos($line, 'IP: ') === 0) {
                $message['ip'] = trim(substr($line, 4));
            } elseif (strpos($line, 'Browser: ') === 0) {
                $message['browser'] = trim(substr($line, 9));
            } elseif (strpos($line, 'Message:') === 0) {
                $messageContent = '';
                $messageStarted = false;
                foreach ($lines as $msgLine) {
                    if (strpos($msgLine, 'Message:') === 0) {
                        $messageStarted = true;
                        continue;
                    }
                    if ($messageStarted && strpos($msgLine, '==================') === 0) {
                        break;
                    }
                    if ($messageStarted) {
                        $messageContent .= $msgLine . "\n";
                    }
                }
                $message['message'] = trim($messageContent);
                break;
            }
        }
        
        if (!empty($message)) {
            $messages[] = $message;
        }
    }
    
    // Reverse array to show newest messages first
    $messages = array_reverse($messages);
}

// Output based on format
if ($format === 'json') {
    header('Content-Type: application/json');
    echo json_encode($messages);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mission Control Messages</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background-color: #121212;
            color: #00ff00;
            padding: 20px;
            margin: 0;
        }
        h1 {
            text-align: center;
            border-bottom: 2px solid #00ff00;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .controls {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background: rgba(0,80,0,0.2);
            border-radius: 5px;
        }
        .controls a {
            color: #00ff00;
            text-decoration: none;
            background: rgba(0,0,0,0.5);
            padding: 5px 10px;
            border-radius: 3px;
            border: 1px solid #00ff00;
        }
        .controls a:hover {
            background: rgba(0,50,0,0.5);
        }
        .message {
            border: 1px solid #00ff00;
            margin-bottom: 20px;
            padding: 10px;
            border-radius: 5px;
            background: rgba(0,0,0,0.5);
        }
        .message-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #00ff00;
            padding-bottom: 5px;
            margin-bottom: 10px;
            font-size: 0.9em;
        }
        .message-content {
            white-space: pre-wrap;
            padding: 10px;
            background: rgba(0,30,0,0.3);
            border-radius: 3px;
        }
        .message-type {
            font-weight: bold;
            color: #ff3e00;
        }
        .empty {
            text-align: center;
            padding: 20px;
            background: rgba(0,0,0,0.5);
            border: 1px dashed #00ff00;
        }
        .reset-btn {
            color: #ff3e00 !important;
            border-color: #ff3e00 !important;
        }
        @media (max-width: 600px) {
            .message-header {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <h1>MISSION CONTROL MESSAGES</h1>
    
    <div class="controls">
        <div>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>">Refresh</a>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>?format=json">View as JSON</a>
            <a href="/index.html">Back to Main</a>
        </div>
        <a href="<?php echo $_SERVER['PHP_SELF']; ?>?reset=confirm" class="reset-btn" onclick="return confirm('Are you sure you want to clear all messages?')">Clear All Messages</a>
    </div>
    
    <?php if (empty($messages)): ?>
        <div class="empty">No messages found</div>
    <?php else: ?>
        <?php foreach ($messages as $message): ?>
            <div class="message">
                <div class="message-header">
                    <div>
                        <span class="message-type"><?php echo htmlspecialchars($message['type']); ?></span> 
                        from <strong><?php echo htmlspecialchars($message['user']); ?></strong>
                    </div>
                    <div>
                        <?php echo htmlspecialchars($message['time']); ?>
                    </div>
                </div>
                <div class="message-content"><?php echo htmlspecialchars($message['message']); ?></div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
    
    <script>
        // Check for new messages every 30 seconds
        setInterval(() => {
            fetch('<?php echo $_SERVER['PHP_SELF']; ?>?count=1', {
                headers: {
                    'Authorization': 'Basic ' + btoa('<?php echo $auth_username; ?>:<?php echo $auth_password; ?>')
                }
            })
            .then(response => response.json())
            .then(data => {
                const currentCount = <?php echo count($messages); ?>;
                if (data.count > currentCount) {
                    // Alert user of new messages
                    const newMessages = data.count - currentCount;
                    const notification = new Notification('Mission Control Alert', {
                        body: `You have ${newMessages} new message${newMessages > 1 ? 's' : ''}!`,
                        icon: '/favicon.ico'
                    });
                    
                    // Flash title to attract attention
                    let originalTitle = document.title;
                    let intervalId = setInterval(() => {
                        document.title = document.title === originalTitle ? 
                            '🔔 NEW MESSAGE!' : originalTitle;
                    }, 1000);
                    
                    // Clear interval when tab becomes visible again
                    document.addEventListener('visibilitychange', function() {
                        if (!document.hidden) {
                            clearInterval(intervalId);
                            document.title = originalTitle;
                        }
                    });
                }
            });
        }, 30000);
        
        // Request permission for notifications
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    </script>
</body>
</html>