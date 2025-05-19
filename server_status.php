<?php
$output = array();

// Check PHP version
$output['php_version'] = PHP_VERSION;

// Check if common extensions are loaded
$output['extensions'] = array(
    'mysqli' => extension_loaded('mysqli') ? 'Loaded' : 'Not loaded',
    'gd' => extension_loaded('gd') ? 'Loaded' : 'Not loaded',
    'curl' => extension_loaded('curl') ? 'Loaded' : 'Not loaded',
    'json' => extension_loaded('json') ? 'Loaded' : 'Not loaded'
);

// Check server software
$output['server_software'] = $_SERVER['SERVER_SOFTWARE'];

// Check document root
$output['document_root'] = $_SERVER['DOCUMENT_ROOT'];

// Check PHP handler
$handlers = array('mod_php', 'php-fpm', 'cgi', 'fastcgi');
$handler = 'Unknown';
foreach ($handlers as $h) {
    if (stripos($_SERVER['SERVER_SOFTWARE'] . ' ' . php_sapi_name(), $h) !== false) {
        $handler = $h;
        break;
    }
}
$output['php_handler'] = $handler . ' (' . php_sapi_name() . ')';

// Check file permissions
$output['permissions'] = array(
    'admin.php' => file_exists('admin.php') ? substr(sprintf('%o', fileperms('admin.php')), -4) : 'File not found',
    'get_counter.php' => file_exists('get_counter.php') ? substr(sprintf('%o', fileperms('get_counter.php')), -4) : 'File not found',
    'counter.txt' => file_exists('counter.txt') ? substr(sprintf('%o', fileperms('counter.txt')), -4) : 'File not found'
);

// Check owner/group
$output['ownership'] = array(
    'admin.php' => file_exists('admin.php') ? 
        posix_getpwuid(fileowner('admin.php'))['name'] . ':' . posix_getgrgid(filegroup('admin.php'))['name'] : 
        'File not found',
    'get_counter.php' => file_exists('get_counter.php') ? 
        posix_getpwuid(fileowner('get_counter.php'))['name'] . ':' . posix_getgrgid(filegroup('get_counter.php'))['name'] : 
        'File not found',
    'counter.txt' => file_exists('counter.txt') ? 
        posix_getpwuid(fileowner('counter.txt'))['name'] . ':' . posix_getgrgid(filegroup('counter.txt'))['name'] : 
        'File not found'
);

// Output as JSON
header('Content-Type: application/json');
echo json_encode($output, JSON_PRETTY_PRINT);
?>