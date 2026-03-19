<?php
require_once 'config.php';
ensureDefaults();
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = trim($_POST['username'] ?? '');
    $p = $_POST['password'] ?? '';
    if (!$u || !$p) {
        $errors[] = 'Enter username and password.';
    } else {
        $pdo = db();
        $stmt = $pdo->prepare('SELECT id,username,password,role FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$u]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || !password_verify($p, $user['password'])) {
            $errors[] = 'Invalid username or password.';
        } else {
            $_SESSION['user'] = ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']];
            redirect('dashboard.php');
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dairy Login</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-5">
      <div class="card shadow-sm">
        <div class="card-body">
          <h3 class="card-title mb-3">Dairy Billing Login</h3>
          <p class="small text-muted">Default: admin/admin or user/user</p>
          <?php if ($errors): ?>
            <div class="alert alert-danger">
              <?php foreach ($errors as $e): ?><div><?= htmlspecialchars($e) ?></div><?php endforeach; ?>
            </div>
          <?php endif; ?>
          <form method="post" action="index.php">
            <div class="mb-2"><label class="form-label">Username</label><input class="form-control" name="username"></div>
            <div class="mb-2"><label class="form-label">Password</label><input class="form-control" type="password" name="password"></div>
            <button class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
