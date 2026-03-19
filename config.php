<?php
session_start();

$DB_HOST = 'localhost';
$DB_NAME = 'dairy_db';
$DB_USER = 'root';
$DB_PASS = '';

function db() {
    static $pdo = null;
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    if ($pdo === null) {
        $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }
    return $pdo;
}

function ensureDefaults() {
    $pdo = db();
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role ENUM('admin','user') NOT NULL DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS bills (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, invoice VARCHAR(80), bill_date DATE, customer VARCHAR(150), shop_name VARCHAR(150), shop_id VARCHAR(60), discount DECIMAL(8,2), tax DECIMAL(8,2), total DECIMAL(12,2), items TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    foreach (['admin' => 'admin', 'user' => 'user'] as $u => $p) {
        $stmt->execute([$u]);
        if (!$stmt->fetch()) {
            $h = password_hash($p, PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO users (username,password,role) VALUES (?,?,?)');
            $ins->execute([$u, $h, $u === 'admin' ? 'admin' : 'user']);
        }
    }
}

function currentUser() {
    return $_SESSION['user'] ?? null;
}

function requireAuth() {
    if (!currentUser()) {
        header('Location: index.php');
        exit;
    }
}

function redirect($url) {
    header('Location: ' . $url);
    exit;
}
