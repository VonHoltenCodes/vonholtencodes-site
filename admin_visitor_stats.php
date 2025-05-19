<?php
// Admin-only visitor statistics page
require_once 'inc/secure_session.php';
secure_session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: admin_secure.php");
    exit;
}

// Configuration
define('SECURE_DATA_PATH', '/mnt/websites/vonholtencodes.com/secure_data/');
define('STATS_PATH', SECURE_DATA_PATH . 'stats/');
$counter_file = STATS_PATH . 'counter.txt';
$logs_path = STATS_PATH . 'logs/';

// Read current count
$current_count = 0;
if (file_exists($counter_file)) {
    $current_count = (int)trim(file_get_contents($counter_file));
}

// Get today's visitors
$today = date('Y-m-d');
$today_log_file = $logs_path . "ip_visitors_$today.log";
$today_visitors = [];
if (file_exists($today_log_file)) {
    $log_contents = file_get_contents($today_log_file);
    $lines = explode("\n", trim($log_contents));
    foreach ($lines as $line) {
        if (!empty($line)) {
            $parts = explode('|', $line);
            $today_visitors[] = [
                'time' => $parts[0] ?? '',
                'ip' => $parts[1] ?? '',
                'agent' => $parts[2] ?? '',
                'referer' => $parts[3] ?? ''
            ];
        }
    }
}

// Get recent log files for historical data
$log_files = glob($logs_path . "ip_visitors_*.log");
$daily_stats = [];
foreach ($log_files as $file) {
    preg_match('/ip_visitors_(\d{4}-\d{2}-\d{2})\.log/', $file, $matches);
    if (isset($matches[1])) {
        $date = $matches[1];
        $count = count(file($file, FILE_SKIP_EMPTY_LINES));
        $daily_stats[$date] = $count;
    }
}
krsort($daily_stats);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Visitor Statistics - Admin</title>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #fff; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .stats-box { background: #2a2a2a; padding: 20px; border-radius: 10px; margin: 20px 0; }
        h1 { color: #4caf50; }
        h2 { color: #66bb6a; }
        .big-number { font-size: 48px; color: #4caf50; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #444; }
        th { background: #333; }
        tr:hover { background: #333; }
        .back-btn { background: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .chart { margin: 20px 0; }
        .bar { background: #4caf50; height: 20px; margin: 5px 0; position: relative; }
        .bar-label { position: absolute; right: 5px; top: 0; line-height: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Visitor Statistics</h1>
        <a href="admin_secure.php" class="back-btn">ê Back to Admin Panel</a>
        
        <div class="stats-box">
            <h2>Total Visitors</h2>
            <div class="big-number"><?php echo number_format($current_count); ?></div>
        </div>
        
        <div class="stats-box">
            <h2>Today's Visitors</h2>
            <div class="big-number"><?php echo count($today_visitors); ?></div>
            
            <?php if (!empty($today_visitors)): ?>
            <h3>Recent Visits</h3>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>IP Address</th>
                        <th>Browser</th>
                        <th>Referrer</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach (array_reverse($today_visitors) as $visitor): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($visitor['time']); ?></td>
                        <td><?php echo htmlspecialchars($visitor['ip']); ?></td>
                        <td><?php echo htmlspecialchars(substr($visitor['agent'], 0, 50)) . '...'; ?></td>
                        <td><?php echo htmlspecialchars($visitor['referer']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </div>
        
        <div class="stats-box">
            <h2>Daily Stats (Last 30 Days)</h2>
            <div class="chart">
                <?php 
                $max_count = max($daily_stats ?: [1]);
                $display_days = array_slice($daily_stats, 0, 30, true);
                foreach ($display_days as $date => $count): 
                    $percentage = ($count / $max_count) * 100;
                ?>
                <div>
                    <strong><?php echo $date; ?>:</strong>
                    <div class="bar" style="width: <?php echo $percentage; ?>%;">
                        <span class="bar-label"><?php echo $count; ?> visitors</span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</body>
</html>