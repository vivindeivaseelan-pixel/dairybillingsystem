import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { currency, dairyImages, sanitizeDecimal, sanitizePhone } from "../utils.js";
import { SectionHeader } from "./Layout.jsx";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip);

function mapHref(entry) {
  if (entry.mapLink) return entry.mapLink;
  if (entry.latitude && entry.longitude) return `https://maps.google.com/?q=${entry.latitude},${entry.longitude}`;
  if (entry.locationName) return `https://maps.google.com/?q=${encodeURIComponent(entry.locationName)}`;
  if (entry.location) return `https://maps.google.com/?q=${encodeURIComponent(entry.location)}`;
  return "";
}

function StatusBadge({ children, tone = "neutral" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function SuppliersView({ suppliers, supplyEntries, form, setForm, supplyForm, setSupplyForm, onSave, onDelete, onSaveSupply, isAdmin, search, setSearch, editingId, onEdit }) {
  const filteredSuppliers = suppliers.filter((supplier) =>
    [supplier.name, supplier.farmName, supplier.location, supplier.zone, supplier.phone].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="row g-4">
      <div className="col-xl-4">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title={editingId ? "Edit Supplier" : "Add Supplier"} subtitle="Procurement and farm partner records" />
            <form onSubmit={onSave}>
              <div className="mb-3"><label className="form-label">Supplier Name</label><input className="form-control premium-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Phone</label><input className="form-control premium-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })} /></div>
              <div className="mb-3"><label className="form-label">Farm Name</label><input className="form-control premium-input" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Location</label><input className="form-control premium-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Zone</label><input className="form-control premium-input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Rate / Litre</label><input className="form-control premium-input" inputMode="decimal" value={form.ratePerLitre} onChange={(e) => setForm({ ...form, ratePerLitre: sanitizeDecimal(e.target.value) })} /></div>
              </div>
              <div className="mt-3"><label className="form-label">Map Link</label><input className="form-control premium-input" value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} /></div>
              <div className="mt-3"><label className="form-label">Farm Photo URL</label><input className="form-control premium-input" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} /></div>
              <div className="mt-3"><label className="form-label">Notes</label><textarea className="form-control premium-input" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-dark premium-button">{editingId ? "Update Supplier" : "Save Supplier"}</button>
                {editingId ? <button type="button" className="btn btn-outline-secondary premium-button" onClick={() => onEdit(null)}>Cancel</button> : null}
              </div>
            </form>
          </div>
        </div>

        <div className="card border-0 section-card glow-panel mt-4">
          <div className="card-body">
            <SectionHeader title="Milk Intake" subtitle="Auto-cost supply entry" />
            <form onSubmit={onSaveSupply}>
              <div className="mb-3"><label className="form-label">Supplier ID</label><input className="form-control premium-input" value={supplyForm.supplierId} onChange={(e) => setSupplyForm({ ...supplyForm, supplierId: e.target.value })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Date</label><input type="date" className="form-control premium-input" value={supplyForm.date} onChange={(e) => setSupplyForm({ ...supplyForm, date: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Zone</label><input className="form-control premium-input" value={supplyForm.zone} onChange={(e) => setSupplyForm({ ...supplyForm, zone: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Litres</label><input className="form-control premium-input" inputMode="decimal" value={supplyForm.litres} onChange={(e) => setSupplyForm({ ...supplyForm, litres: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Fat %</label><input className="form-control premium-input" inputMode="decimal" value={supplyForm.fat} onChange={(e) => setSupplyForm({ ...supplyForm, fat: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Rate</label><input className="form-control premium-input" inputMode="decimal" value={supplyForm.ratePerLitre} onChange={(e) => setSupplyForm({ ...supplyForm, ratePerLitre: sanitizeDecimal(e.target.value) })} /></div>
              </div>
              <button className="btn btn-dark premium-button mt-3">Save Intake</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel mb-4">
          <div className="card-body">
            <SectionHeader title="Suppliers" subtitle="Farm network and procurement contacts" action={<input className="form-control premium-input premium-search" placeholder="Search suppliers" value={search} onChange={(e) => setSearch(e.target.value)} />} />
            <div className="row g-4">
              {filteredSuppliers.map((supplier) => (
                <div className="col-md-6" key={supplier.id}>
                  <div className="card border-0 supplier-card h-100 hover-rise">
                    <div className="supplier-photo" style={{ backgroundImage: `url(${supplier.photoUrl || dairyImages.field})` }} />
                    <div className="card-body">
                      <div className="small text-secondary">ID: {supplier.id}</div>
                      <div className="d-flex justify-content-between gap-2 mt-1">
                        <div>
                          <h4 className="h5 fw-bold mb-1">{supplier.name}</h4>
                          <div className="small text-secondary">{supplier.farmName}</div>
                        </div>
                        {isAdmin ? <button className="btn btn-sm btn-outline-light admin-action premium-button" onClick={() => onEdit(supplier)}>Edit</button> : null}
                      </div>
                      <div className="small text-secondary mt-2">{supplier.location} | {supplier.zone}</div>
                      <div className="fw-semibold mt-2">Rate: {currency(supplier.ratePerLitre)} / litre</div>
                      <p className="small text-secondary mt-2 mb-3">{supplier.notes}</p>
                      <div className="d-flex gap-2 flex-wrap">
                        <a className="btn btn-dark btn-sm premium-button" href={`tel:${supplier.phone}`}>Call</a>
                        <a className="btn btn-outline-dark btn-sm premium-button" href={`sms:${supplier.phone}`}>SMS</a>
                        <a className="btn btn-outline-primary btn-sm premium-button" href={`https://wa.me/${supplier.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        {mapHref(supplier) ? <a className="btn btn-outline-secondary btn-sm premium-button" href={mapHref(supplier)} target="_blank" rel="noreferrer">Map</a> : null}
                        {isAdmin ? <button className="btn btn-outline-danger btn-sm premium-button" onClick={() => onDelete(supplier.id)}>Delete</button> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Supply Records" subtitle="Daily milk intake, cost, and zone movement" />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Date</th><th>Supplier</th><th>Zone</th><th>Litres</th><th>Fat</th><th>Cost</th></tr></thead>
                <tbody>
                  {supplyEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{entry.supplierName}</td>
                      <td>{entry.zone}</td>
                      <td>{Number(entry.litres).toFixed(1)} L</td>
                      <td>{Number(entry.fat || 0).toFixed(1)}%</td>
                      <td>{currency(entry.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomersView({ customers, form, setForm, onSave, onDelete, isAdmin, search, setSearch, editingId, onEdit }) {
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.area, customer.route, customer.zone, customer.phone, customer.locationName].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="row g-4">
      <div className="col-xl-4">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title={editingId ? "Edit User" : "Add User"} subtitle="Commercial buyer and household account setup" />
            <form onSubmit={onSave}>
              <div className="mb-3"><label className="form-label">Customer Name</label><input className="form-control premium-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Phone</label><input className="form-control premium-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })} /></div>
              <div className="mb-3"><label className="form-label">Alternate Phone</label><input className="form-control premium-input" value={form.alternatePhone} onChange={(e) => setForm({ ...form, alternatePhone: sanitizePhone(e.target.value) })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Area</label><input className="form-control premium-input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Plan</label><input className="form-control premium-input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Route</label><input className="form-control premium-input" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Zone</label><input className="form-control premium-input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></div>
                <div className="col-12"><label className="form-label">Location Name</label><input className="form-control premium-input" value={form.locationName} onChange={(e) => setForm({ ...form, locationName: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Balance</label><input className="form-control premium-input" inputMode="decimal" value={form.balance} onChange={(e) => setForm({ ...form, balance: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Cashback Wallet</label><input className="form-control premium-input" inputMode="decimal" value={form.cashbackBalance} onChange={(e) => setForm({ ...form, cashbackBalance: sanitizeDecimal(e.target.value) })} /></div>
              </div>
              <div className="mt-3"><label className="form-label">Notes</label><textarea className="form-control premium-input" rows="3" value={form.supportNotes} onChange={(e) => setForm({ ...form, supportNotes: e.target.value })} /></div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-dark premium-button">{editingId ? "Update User" : "Save User"}</button>
                {editingId ? <button type="button" className="btn btn-outline-secondary premium-button" onClick={() => onEdit(null)}>Cancel</button> : null}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Users" subtitle="Customer, retail, and subscription accounts" action={<input className="form-control premium-input premium-search" placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />} />
            <div className="row g-4">
              {filteredCustomers.map((customer) => (
                <div className="col-md-6" key={customer.id}>
                  <div className="card border-0 customer-card h-100 hover-rise">
                    <div className="card-body">
                      <div className="d-flex justify-content-between gap-2">
                        <div>
                          <h4 className="h5 fw-bold mb-1">{customer.name}</h4>
                          <div className="small text-secondary">{customer.area} | {customer.plan}</div>
                        </div>
                        {isAdmin ? <button className="btn btn-sm btn-outline-dark premium-button" onClick={() => onEdit(customer)}>Edit</button> : null}
                      </div>
                      <div className="customer-meta mt-3">
                        <span>{customer.route}</span>
                        <span>{customer.zone}</span>
                        <span>Due {currency(customer.balance)}</span>
                      </div>
                      <div className="small text-secondary mt-3">
                        <div>Phone: {customer.phone}</div>
                        <div>Cashback: {currency(customer.cashbackBalance)}</div>
                      </div>
                      <p className="small text-secondary mt-3 mb-3">{customer.supportNotes}</p>
                      <div className="d-flex gap-2 flex-wrap">
                        <a className="btn btn-dark btn-sm premium-button" href={`tel:${customer.phone}`}>Call</a>
                        <a className="btn btn-outline-dark btn-sm premium-button" href={`sms:${customer.phone}`}>SMS</a>
                        <a className="btn btn-outline-primary btn-sm premium-button" href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        {mapHref(customer) ? <a className="btn btn-outline-secondary btn-sm premium-button" href={mapHref(customer)} target="_blank" rel="noreferrer">Map</a> : null}
                        {isAdmin ? <button className="btn btn-outline-danger btn-sm premium-button" onClick={() => onDelete(customer.id)}>Delete</button> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsView({ products, form, setForm, onSave, isAdmin, editingId, onEdit }) {
  return (
    <div className="row g-4">
      <div className="col-xl-4">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title={editingId ? "Edit Product" : "Add Product"} subtitle="Retail and wholesale catalog setup" />
            <form onSubmit={onSave}>
              <div className="mb-3"><label className="form-label">Product Name</label><input className="form-control premium-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Category</label><input className="form-control premium-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Unit</label><input className="form-control premium-input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Price</label><input className="form-control premium-input" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Stock</label><input className="form-control premium-input" inputMode="decimal" value={form.stock} onChange={(e) => setForm({ ...form, stock: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Fat %</label><input className="form-control premium-input" inputMode="decimal" value={form.fat} onChange={(e) => setForm({ ...form, fat: sanitizeDecimal(e.target.value) })} /></div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-dark premium-button">{editingId ? "Update Product" : "Save Product"}</button>
                {editingId ? <button type="button" className="btn btn-outline-secondary premium-button" onClick={() => onEdit(null)}>Cancel</button> : null}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Catalog" subtitle="Milk, curd, paneer, and value-added dairy products" />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Fat</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{currency(product.price)}</td>
                      <td>{product.stock} {product.unit}</td>
                      <td>{product.fat}%</td>
                      <td><StatusBadge tone={Number(product.stock || 0) <= 20 ? "danger" : "success"}>{Number(product.stock || 0) <= 20 ? "Low Stock" : "Ready"}</StatusBadge></td>
                      <td>{isAdmin ? <button className="btn btn-sm btn-outline-dark premium-button" onClick={() => onEdit(product)}>Edit</button> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentsView({ payments, customers, form, setForm, onSave, onGatewayPay, isAdmin, settings, gatewayConfig }) {
  const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalCashback = payments.reduce((sum, payment) => sum + Number(payment.cashbackAmount || 0), 0);

  function syncCustomer(name) {
    const match = customers.find((customer) => customer.name.toLowerCase() === name.toLowerCase());
    if (!match) {
      setForm({ ...form, customerId: "", customerName: name });
      return;
    }
    setForm({
      ...form,
      customerId: match.id,
      customerName: match.name,
      phone: match.phone,
      route: match.route,
      zone: match.zone
    });
  }

  return (
    <div className="row g-4">
      <div className="col-xl-4">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title={isAdmin ? "Payment Posting" : "Payment Module"} subtitle={isAdmin ? "Reconcile payments with cashback automation" : "Accept user payments with receipt-ready details"} />
            <datalist id="payment-customer-list">{customers.map((customer) => <option key={customer.id} value={customer.name} />)}</datalist>
            <form onSubmit={onSave}>
              <div className="mb-3"><label className="form-label">Customer Name</label><input className="form-control premium-input" list="payment-customer-list" value={form.customerName} onChange={(e) => syncCustomer(e.target.value)} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control premium-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Amount</label><input className="form-control premium-input" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Date</label><input type="date" className="form-control premium-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Method</label><select className="form-select premium-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}><option>GPay QR Code</option><option>Cash</option><option>Card</option></select></div>
                <div className="col-md-6"><label className="form-label">Reference</label><input className="form-control premium-input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Collected By</label><input className="form-control premium-input" value={form.collectedBy} onChange={(e) => setForm({ ...form, collectedBy: e.target.value })} /></div>
              </div>
              <div className="mt-3"><label className="form-label">Notes</label><textarea className="form-control premium-input" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="soft-note mt-3">Cashback rule: {settings.cashbackEnabled ? `${settings.cashbackType === "flat" ? currency(settings.cashbackValue) : `${settings.cashbackValue}%`} on payments above ${currency(settings.cashbackMinimumSpend)}` : "Disabled"}</div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <button className="btn btn-dark premium-button">Save Payment</button>
                <button type="button" className="btn btn-outline-dark premium-button" disabled={!gatewayConfig.enabled || form.method === "Cash"} onClick={onGatewayPay}>
                  {gatewayConfig.enabled ? "Open GPay / Card Checkout" : "Checkout Not Configured"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="row g-4">
          <div className="col-md-4"><div className="mini-stat glow-panel hover-rise"><span>Total Collected</span><strong>{currency(totalCollected)}</strong></div></div>
          <div className="col-md-4"><div className="mini-stat glow-panel hover-rise"><span>Entries</span><strong>{payments.length}</strong></div></div>
          <div className="col-md-4"><div className="mini-stat glow-panel hover-rise"><span>Cashback Issued</span><strong>{currency(totalCashback)}</strong></div></div>
        </div>

        <div className="card border-0 section-card glow-panel mt-4">
          <div className="card-body">
            <SectionHeader title={isAdmin ? "Payment Tracking" : "Payment Records"} subtitle={isAdmin ? "Collections, references, reconciliation, and cashback" : "User payment history and collection proof"} />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Date</th><th>Customer</th><th>Method</th><th>Reference</th><th>Status</th><th>Amount</th><th>Cashback</th></tr></thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.date}</td>
                      <td>{payment.customerName}</td>
                      <td>{payment.method}</td>
                      <td>{payment.reference || "-"}</td>
                      <td><StatusBadge tone={payment.status === "Received" ? "success" : "warning"}>{payment.status}</StatusBadge></td>
                      <td>{currency(payment.amount)}</td>
                      <td>{currency(payment.cashbackAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsView({ report }) {
  const hasData = report.totalRevenue || report.totalMilkPurchased || report.totalMilkSold || report.totalCollections;
  if (!hasData) {
    return <div className="card border-0 section-card glow-panel"><div className="card-body"><SectionHeader title="Analytics" subtitle="Analytics will appear after bills, intake, and collections are saved." /></div></div>;
  }

  const routeBarData = {
    labels: report.routeAnalytics.routes.map((route) => route.route),
    datasets: [{ label: "Revenue", data: report.routeAnalytics.routes.map((route) => route.revenue), backgroundColor: ["#1d3557", "#457b9d", "#e09f3e", "#2a9d8f"] }]
  };
  const zoneDoughnutData = {
    labels: report.routeAnalytics.zones.map((zone) => zone.zone),
    datasets: [{ data: report.routeAnalytics.zones.map((zone) => zone.litres), backgroundColor: ["#0b3c49", "#2a9d8f", "#84a59d", "#f4a261", "#e76f51"] }]
  };
  const flowLineData = {
    labels: ["Purchased", "Sold", "Difference"],
    datasets: [{ label: "Milk Flow", data: [report.totalMilkPurchased, report.totalMilkSold, report.totalMilkPurchased - report.totalMilkSold], borderColor: "#0b3c49", backgroundColor: "rgba(11,60,73,0.15)", fill: true, tension: 0.35 }]
  };
  const collectionBarData = {
    labels: report.paymentSummary.methods.map((method) => method.method),
    datasets: [{ label: "Collections", data: report.paymentSummary.methods.map((method) => method.amount), backgroundColor: ["#1d3557", "#f4a261", "#2a9d8f", "#e76f51"] }]
  };

  return (
    <div className="row g-4">
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Route Sales" subtitle="Revenue and invoice count by route" /><div className="table-responsive"><table className="table align-middle premium-table"><thead><tr><th>Route</th><th>Invoices</th><th>Litres</th><th>Revenue</th></tr></thead><tbody>{report.routeAnalytics.routes.map((route) => <tr key={route.route}><td>{route.route}</td><td>{route.invoices}</td><td>{route.litres.toFixed(1)} L</td><td>{currency(route.revenue)}</td></tr>)}</tbody></table></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Zone Sales" subtitle="Zone totals from customer bills" /><div className="table-responsive"><table className="table align-middle premium-table"><thead><tr><th>Zone</th><th>Invoices</th><th>Litres</th><th>Revenue</th></tr></thead><tbody>{report.routeAnalytics.zones.map((zone) => <tr key={zone.zone}><td>{zone.zone}</td><td>{zone.invoices}</td><td>{zone.litres.toFixed(1)} L</td><td>{currency(zone.revenue)}</td></tr>)}</tbody></table></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Route Chart" subtitle="Revenue by route" /><div className="chart-shell"><Bar data={routeBarData} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Zone Chart" subtitle="Milk sold by zone" /><div className="chart-shell"><Doughnut data={zoneDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Collection Chart" subtitle="Collections by payment mode" /><div className="chart-shell"><Bar data={collectionBarData} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Customer Collections" subtitle="Top customers by payment value" /><div className="table-responsive"><table className="table align-middle premium-table"><thead><tr><th>Customer</th><th>Entries</th><th>Amount</th><th>Cashback</th></tr></thead><tbody>{report.paymentSummary.customers.map((customer) => <tr key={customer.customer}><td>{customer.customer}</td><td>{customer.entries}</td><td>{currency(customer.amount)}</td><td>{currency(customer.cashback)}</td></tr>)}</tbody></table></div></div></div></div>
      <div className="col-12"><div className="card border-0 section-card glow-panel"><div className="card-body"><SectionHeader title="Milk Flow Chart" subtitle="Purchased versus sold movement" /><div className="chart-shell chart-shell-wide"><Line data={flowLineData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-12"><div className="row g-3">{[["Revenue", currency(report.totalRevenue)], ["Collections", currency(report.totalCollections)], ["Cashback", currency(report.totalCashback)], ["Gross Profit", currency(report.grossProfit)]].map(([label, value]) => <div className="col-md-3" key={label}><div className="mini-stat glow-panel hover-rise"><span>{label}</span><strong>{value}</strong></div></div>)}</div></div>
    </div>
  );
}

export function SupportView({ customers, suppliers, supportTickets, supportForm, setSupportForm, onSaveSupport, isAdmin, onUpdateTicket }) {
  const contacts = [
    ...customers.map((entry) => ({ ...entry, type: "Customer", locationLabel: `${entry.area} | ${entry.route}`, notesText: entry.supportNotes })),
    ...suppliers.map((entry) => ({ ...entry, type: "Supplier", locationLabel: `${entry.location} | ${entry.zone}`, notesText: entry.notes }))
  ];

  return (
    <div className="row g-4">
      <div className="col-xl-4">
        <div className="card border-0 section-card glow-panel h-100">
          <div className="card-body">
            <div className="support-visual rounded-4 mb-3" style={{ backgroundImage: `url(${dairyImages.milk})` }} />
            <SectionHeader title="Support Desk" subtitle="Create service tickets for delivery, billing, or quality issues" />
            <form onSubmit={onSaveSupport}>
              <div className="mb-3"><label className="form-label">Name</label><input className="form-control premium-input" value={supportForm.name} onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Phone</label><input className="form-control premium-input" value={supportForm.phone} onChange={(e) => setSupportForm({ ...supportForm, phone: sanitizePhone(e.target.value) })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Type</label><select className="form-select premium-input" value={supportForm.type} onChange={(e) => setSupportForm({ ...supportForm, type: e.target.value })}><option>Customer</option><option>Supplier</option><option>Internal</option></select></div>
                <div className="col-md-6"><label className="form-label">Priority</label><select className="form-select premium-input" value={supportForm.priority} onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></div>
              </div>
              <div className="mt-3"><label className="form-label">Subject</label><input className="form-control premium-input" value={supportForm.subject} onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })} /></div>
              <div className="mt-3"><label className="form-label">Message</label><textarea className="form-control premium-input" rows="4" value={supportForm.message} onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })} /></div>
              <button className="btn btn-dark premium-button mt-3">Create Ticket</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel mb-4">
          <div className="card-body">
            <SectionHeader title="Open Tickets" subtitle="Operational follow-up, service recovery, and dispatch support" />
            <div className="d-grid gap-3">
              {supportTickets.map((ticket) => (
                <div className="ticket-card" key={ticket.id}>
                  <div className="d-flex justify-content-between gap-3 flex-wrap">
                    <div>
                      <div className="fw-semibold">{ticket.subject}</div>
                      <div className="small text-secondary">{ticket.name} | {ticket.phone || "No phone"} | {ticket.assignedTo}</div>
                      <div className="small text-secondary mt-2">{ticket.message}</div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap align-items-start">
                      <StatusBadge tone={ticket.priority === "High" ? "danger" : ticket.priority === "Medium" ? "warning" : "success"}>{ticket.priority}</StatusBadge>
                      <StatusBadge tone={ticket.status === "Closed" ? "success" : "warning"}>{ticket.status}</StatusBadge>
                      {isAdmin ? <button className="btn btn-sm btn-outline-dark premium-button" onClick={() => onUpdateTicket(ticket.id, { status: ticket.status === "Closed" ? "Open" : "Closed" })}>{ticket.status === "Closed" ? "Reopen" : "Close"}</button> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Support Contacts" subtitle="Quick access to users and supplier contacts" />
            <div className="row g-4">
              {contacts.map((contact, index) => (
                <div className="col-md-6" key={`${contact.type}-${contact.id || index}`}>
                  <div className="card border-0 contact-card h-100 hover-rise glow-panel">
                    <div className="card-body">
                      <div className="contact-type">{contact.type}</div>
                      <h4 className="h5 fw-bold mt-3 mb-1">{contact.name}</h4>
                      <div className="small text-secondary">{contact.locationLabel}</div>
                      {contact.notesText ? <p className="small text-secondary mt-3 mb-2">{contact.notesText}</p> : null}
                      <div className="small fw-semibold mt-3">{contact.phone}</div>
                      <div className="d-flex gap-2 flex-wrap mt-3">
                        <a className="btn btn-dark btn-sm premium-button" href={`tel:${contact.phone}`}>Call</a>
                        <a className="btn btn-outline-dark btn-sm premium-button" href={`sms:${contact.phone}`}>SMS</a>
                        <a className="btn btn-outline-primary btn-sm premium-button" href={`https://wa.me/${contact.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        {mapHref(contact) ? <a className="btn btn-outline-secondary btn-sm premium-button" href={mapHref(contact)} target="_blank" rel="noreferrer">Map</a> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsView({ form, setForm, onSave }) {
  return (
    <div className="row g-4">
      <div className="col-xl-7">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Admin Studio" subtitle="Control invoice brand, payment defaults, support contacts, and cashback rules" />
            <form onSubmit={onSave}>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Company Name</label><input className="form-control premium-input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Tagline</label><input className="form-control premium-input" value={form.companyTagline} onChange={(e) => setForm({ ...form, companyTagline: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Invoice Prefix</label><input className="form-control premium-input" value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Invoice Title</label><input className="form-control premium-input" value={form.invoiceTitle} onChange={(e) => setForm({ ...form, invoiceTitle: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Subtitle</label><input className="form-control premium-input" value={form.invoiceSubtitle} onChange={(e) => setForm({ ...form, invoiceSubtitle: e.target.value })} /></div>
                <div className="col-12"><label className="form-label">Company Address</label><textarea className="form-control premium-input" rows="2" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Phone</label><input className="form-control premium-input" value={form.companyPhone} onChange={(e) => setForm({ ...form, companyPhone: sanitizePhone(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Email</label><input className="form-control premium-input" value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">GSTIN</label><input className="form-control premium-input" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">FSSAI</label><input className="form-control premium-input" value={form.fssai} onChange={(e) => setForm({ ...form, fssai: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">GPay UPI ID</label><input className="form-control premium-input" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">QR Text</label><input className="form-control premium-input" value={form.qrText} onChange={(e) => setForm({ ...form, qrText: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Bank Name</label><input className="form-control premium-input" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Account Name</label><input className="form-control premium-input" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Account Number</label><input className="form-control premium-input" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">IFSC</label><input className="form-control premium-input" value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Support Phone</label><input className="form-control premium-input" value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: sanitizePhone(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Support Email</label><input className="form-control premium-input" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></div>
                <div className="col-12"><label className="form-label">Invoice Footer</label><textarea className="form-control premium-input" rows="2" value={form.invoiceFooter} onChange={(e) => setForm({ ...form, invoiceFooter: e.target.value })} /></div>
                <div className="col-12"><label className="form-label">Invoice Notes</label><textarea className="form-control premium-input" rows="2" value={form.invoiceNotes} onChange={(e) => setForm({ ...form, invoiceNotes: e.target.value })} /></div>
              </div>
              <div className="card border-0 subpanel mt-4">
                <div className="card-body">
                  <div className="fw-semibold mb-3">Cashback Automation</div>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3 form-check ms-2">
                      <input className="form-check-input" type="checkbox" checked={form.cashbackEnabled} onChange={(e) => setForm({ ...form, cashbackEnabled: e.target.checked })} />
                      <label className="form-check-label">Enable Cashback</label>
                    </div>
                    <div className="col-md-3"><label className="form-label">Type</label><select className="form-select premium-input" value={form.cashbackType} onChange={(e) => setForm({ ...form, cashbackType: e.target.value })}><option value="percentage">Percentage</option><option value="flat">Flat</option></select></div>
                    <div className="col-md-3"><label className="form-label">Value</label><input className="form-control premium-input" inputMode="decimal" value={form.cashbackValue} onChange={(e) => setForm({ ...form, cashbackValue: sanitizeDecimal(e.target.value) })} /></div>
                    <div className="col-md-3"><label className="form-label">Min Spend</label><input className="form-control premium-input" inputMode="decimal" value={form.cashbackMinimumSpend} onChange={(e) => setForm({ ...form, cashbackMinimumSpend: sanitizeDecimal(e.target.value) })} /></div>
                  </div>
                </div>
              </div>
              <button className="btn btn-dark premium-button mt-4">Save Admin Settings</button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-xl-5">
        <div className="card border-0 section-card glow-panel h-100">
          <div className="card-body">
            <SectionHeader title="Invoice Preview Rules" subtitle="This controls what billing staff prints from the billing cart" />
            <div className="bill-preview-card">
              <div className="small text-uppercase text-secondary fw-semibold">{form.companyName}</div>
              <div className="h4 fw-bold mt-2">{form.invoiceTitle}</div>
              <div className="small text-secondary">{form.invoiceSubtitle}</div>
              <hr />
              <div className="small text-secondary">GSTIN: {form.gstin || "-"}</div>
              <div className="small text-secondary">FSSAI: {form.fssai || "-"}</div>
              <div className="small text-secondary">GPay QR: {form.upiId || "-"}</div>
              <div className="small text-secondary">Support: {form.supportPhone || "-"}</div>
              <div className="soft-note mt-3">{form.invoiceFooter}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
