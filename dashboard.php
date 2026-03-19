<?php
require_once 'config.php';
ensureDefaults();
requireAuth();
$user = currentUser();
$pdo = db();
$saved = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_bill'])) {
    $items_json = $_POST['items_json'] ?? '[]';
    $stmt = $pdo->prepare('INSERT INTO bills (user_id, invoice, bill_date, customer, shop_name, shop_id, discount, tax, total, items) VALUES (?,?,?,?,?,?,?,?,?,?)');
    $stmt->execute([$user['id'], $_POST['invoice'], $_POST['bill_date'], $_POST['customer'], $_POST['shop'], $_POST['shop_id'], $_POST['discount'] + 0, $_POST['tax'] + 0, $_POST['payable'] + 0, $items_json]);
    $saved = true;
}

$allBillsStmt = $pdo->query('SELECT b.*, u.username FROM bills b JOIN users u ON b.user_id=u.id ORDER BY b.id DESC');
$allBills = $allBillsStmt->fetchAll(PDO::FETCH_ASSOC);
$myBillsStmt = $pdo->prepare('SELECT * FROM bills WHERE user_id=? ORDER BY id DESC');
$myBillsStmt->execute([$user['id']]);
$myBills = $myBillsStmt->fetchAll(PDO::FETCH_ASSOC);
$usersStmt = $pdo->query('SELECT id,username,role FROM users ORDER BY id');
$users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_user']) && $user['role'] === 'admin') {
    $un = trim($_POST['new_username'] ?? '');
    $pw = trim($_POST['new_password'] ?? '');
    $role = $_POST['new_role'] ?? 'user';
    if ($un && $pw) {
        $check = $pdo->prepare('SELECT id FROM users WHERE username=?');
        $check->execute([$un]);
        if (!$check->fetch()) {
            $h = password_hash($pw, PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO users (username,password,role) VALUES (?,?,?)');
            $ins->execute([$un, $h, $role]);
            header('Location: dashboard.php');
            exit;
        }
    }
}
?>
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dashboard</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="bg-light"><div class="container py-3">
<nav class="navbar navbar-expand-lg navbar-dark bg-success rounded mb-3"><div class="container-fluid"><a class="navbar-brand" href="#">Dairy</a><div class="text-white"><?= htmlspecialchars($user['username']) ?> (<?= htmlspecialchars($user['role']) ?>)</div><a class="btn btn-light btn-sm" href="logout.php">Logout</a></div></nav>
<div class="row"><div class="col-lg-8"><div class="card mb-3"><div class="card-body"><h4>New Bill</h4><?php if ($saved): ?><div class="alert alert-success">Bill saved.</div><?php endif; ?>
<form id="billForm" method="post" action="dashboard.php"><input type="hidden" name="save_bill" value="1"><input type="hidden" id="itemsJson" name="items_json" value="[]">
<div class="row g-2"><div class="col-md-4"><label class="form-label">Invoice</label><input class="form-control" name="invoice" id="invoice" value="INV-001"></div><div class="col-md-4"><label class="form-label">Date</label><input class="form-control" type="date" name="bill_date" id="billDate" value="<?= date('Y-m-d') ?>"></div><div class="col-md-4"><label class="form-label">Customer</label><input class="form-control" name="customer" id="customer"></div></div>
<div class="row g-2 mt-2"><div class="col-md-4"><label class="form-label">Shop</label><input class="form-control" name="shop" id="shop"></div><div class="col-md-4"><label class="form-label">Shop ID</label><input class="form-control" name="shop_id" id="shopId"></div><div class="col-md-2"><label class="form-label">Discount %</label><input class="form-control" type="number" id="discount" value="0"></div><div class="col-md-2"><label class="form-label">Tax %</label><input class="form-control" type="number" id="tax" value="0"></div></div>
<div class="table-responsive mt-2"><table class="table table-bordered"><thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th><th></th></tr></thead><tbody id="itemBody"></tbody></table></div>
<button type="button" class="btn btn-sm btn-success" onclick="addRow()">Add Item</button>
<div class="row mt-2"><div class="col-md-4"><strong>Sub Total:</strong> ₹<span id="subTotal">0.00</span></div><div class="col-md-4"><strong>Tax:</strong> ₹<span id="taxAmt">0.00</span></div><div class="col-md-4"><strong>Payable:</strong> ₹<span id="payable">0.00</span><input type="hidden" name="payable" id="payableInput"></div></div>
<div class="mt-3"><button class="btn btn-primary">Save Bill</button> <button type="button" class="btn btn-secondary" onclick="printInvoice()">Print</button></div></form>
</div></div></div>
<div class="col-lg-4"><div class="card mb-3"><div class="card-body"><h5>My Bills</h5><ul class="list-group">
<?php if ($myBills): foreach ($myBills as $b): ?><li class="list-group-item"><strong><?= htmlspecialchars($b['invoice']) ?></strong><br>₹<?= number_format($b['total'],2) ?> <small><?= htmlspecialchars($b['created_at']) ?></small></li><?php endforeach; else: ?><li class="list-group-item">No bills yet.</li><?php endif; ?></ul></div></div>
<?php if ($user['role'] === 'admin'): ?><div class="card"><div class="card-body"><h5>Add User</h5><form method="post" class="row g-2"><div class="col-4"><input name="new_username" class="form-control" placeholder="username"></div><div class="col-4"><input name="new_password" class="form-control" type="password" placeholder="password"></div><div class="col-2"><select name="new_role" class="form-select"><option value="user">user</option><option value="admin">admin</option></select></div><div class="col-2"><button name="add_user" class="btn btn-primary btn-sm">Add</button></div></form></div></div><?php endif; ?></div></div>
<?php if ($user['role'] === 'admin'): ?><div class="card mt-3"><div class="card-body"><h4>Admin Reports</h4><div class="row"><div class="col-md-6"><h6>Users</h6><table class="table table-sm"><thead><tr><th>User</th><th>Role</th></tr></thead><tbody><?php foreach ($users as $u): ?><tr><td><?= htmlspecialchars($u['username']) ?></td><td><?= htmlspecialchars($u['role']) ?></td></tr><?php endforeach; ?></tbody></table></div><div class="col-md-6"><h6>Bills</h6><table class="table table-sm"><thead><tr><th>Invoice</th><th>User</th><th>Total</th><th>Date</th></tr></thead><tbody><?php foreach ($allBills as $b): ?><tr><td><?= htmlspecialchars($b['invoice']) ?></td><td><?= htmlspecialchars($b['username']) ?></td><td>₹<?= number_format($b['total'],2) ?></td><td><?= htmlspecialchars($b['created_at']) ?></td></tr><?php endforeach; ?></tbody></table></div></div></div></div><?php endif; ?>
</div>
<script>
const defaultProducts=['Milk 200ml','Milk 500ml','Milk 1L','Curd 200g','Curd 500g','Butter Milk 500ml','Ghee 500ml','Paneer 500g'];
function addRow(product='Milk 200ml', qty=1, unit='pcs', rate=0){ const tbody=document.getElementById('itemBody'); const tr=document.createElement('tr'); tr.innerHTML=`<td></td><td><select class='form-select product'>${defaultProducts.map(p=>`<option${p===product?' selected':''}>${p}</option>`).join('')}</select></td><td><input class='form-control qty' type='number' min='0' value='${qty}'></td><td><input class='form-control unit' value='${unit}'></td><td><input class='form-control rate' type='number' min='0' step='0.01' value='${rate}'></td><td class='amount'>0.00</td><td><button type='button' class='btn btn-sm btn-danger' onclick='this.closest("tr").remove();recalc();'>x</button></td>`; tbody.appendChild(tr); tr.querySelectorAll('.qty,.rate').forEach(i=>i.addEventListener('input', recalc)); recalc(); }
function recalc(){ let total=0; document.querySelectorAll('#itemBody tr').forEach((tr,i)=>{ tr.children[0].innerText=i+1; const q=parseFloat(tr.querySelector('.qty').value)||0; const r=parseFloat(tr.querySelector('.rate').value)||0; const a=q*r; tr.querySelector('.amount').innerText=a.toFixed(2); total += a; }); const discount=parseFloat(document.getElementById('discount').value)||0; const tax=parseFloat(document.getElementById('tax').value)||0; const after=total - total*(discount/100); const taxAmt=after*(tax/100); const payable=after+taxAmt; document.getElementById('subTotal').innerText=total.toFixed(2); document.getElementById('taxAmt').innerText=taxAmt.toFixed(2); document.getElementById('payable').innerText=payable.toFixed(2); document.getElementById('payableInput').value=payable.toFixed(2); const items=[...document.querySelectorAll('#itemBody tr')].map(tr=>({product:tr.querySelector('.product').value,qty:tr.querySelector('.qty').value,unit:tr.querySelector('.unit').value,rate:tr.querySelector('.rate').value,amount:tr.querySelector('.amount').innerText})); document.getElementById('itemsJson').value=JSON.stringify(items); }
function printInvoice(){ let html='<h3>Invoice</h3>'; html+='<div>Invoice: '+document.getElementById('invoice').value+'</div>'; html+='<div>Date: '+document.getElementById('billDate').value+'</div>'; html+='<div>Customer: '+document.getElementById('customer').value+'</div>'; html+='<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%"><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr>'; document.querySelectorAll('#itemBody tr').forEach((tr,idx)=>{ html+='<tr><td>'+(idx+1)+'</td><td>'+tr.querySelector('.product').value+'</td><td>'+tr.querySelector('.qty').value+'</td><td>'+tr.querySelector('.unit').value+'</td><td>'+tr.querySelector('.rate').value+'</td><td>'+tr.querySelector('.amount').innerText+'</td></tr>'; }); html+='</table><div>Total ₹'+document.getElementById('payable').innerText+'</div>'; const w=window.open('','_blank'); w.document.write('<html><head><title>Invoice</title></head><body>'+html+'</body></html>'); w.document.close(); w.print(); }
addRow(); addRow(); recalc(); document.getElementById('discount').addEventListener('input', recalc); document.getElementById('tax').addEventListener('input', recalc);
</script>
</body></html>