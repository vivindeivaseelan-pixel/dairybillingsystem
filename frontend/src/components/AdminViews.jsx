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

export function SuppliersView({ suppliers, supplyEntries, form, setForm, supplyForm, setSupplyForm, onSave, onDelete, onSaveSupply, isAdmin, search, setSearch, editingId, onEdit }) {
  const filteredSuppliers = suppliers.filter((supplier) =>
    [supplier.name, supplier.farmName, supplier.location, supplier.zone, supplier.phone].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="row g-4">
      <div className="col-xl-4">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title={editingId ? "Edit Supplier" : "Add Supplier"} subtitle="Supplier details and location." />
            <form onSubmit={onSave}>
              <div className="mb-3"><label className="form-label">Supplier Name</label><input className="form-control premium-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Phone</label><input className="form-control premium-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })} /></div>
              <div className="mb-3"><label className="form-label">Farm Name</label><input className="form-control premium-input" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label">Location</label><input className="form-control premium-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Zone</label><input className="form-control premium-input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Rate / Litre</label><input className="form-control premium-input" inputMode="decimal" value={form.ratePerLitre} onChange={(e) => setForm({ ...form, ratePerLitre: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Latitude</label><input className="form-control premium-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Longitude</label><input className="form-control premium-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
              </div>
              <div className="mt-3"><label className="form-label">Map Link</label><input className="form-control premium-input" value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} /></div>
              <div className="mt-3"><label className="form-label">Farm Photo URL</label><input className="form-control premium-input" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} /></div>
              <div className="mt-3"><label className="form-label">Notes</label><textarea className="form-control premium-input" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-success premium-button">{editingId ? "Update Supplier" : "Save Supplier"}</button>
                {editingId ? <button type="button" className="btn btn-outline-dark premium-button" onClick={() => onEdit(null)}>Cancel</button> : null}
              </div>
            </form>
          </div>
        </div>

        <div className="card border-0 section-card glow-panel mt-4">
          <div className="card-body">
            <SectionHeader title="Milk Supply Entry" subtitle="Milk collection from suppliers." />
            <form onSubmit={onSaveSupply}>
              <div className="mb-3"><label className="form-label">Supplier ID</label><input className="form-control premium-input" value={supplyForm.supplierId} onChange={(e) => setSupplyForm({ ...supplyForm, supplierId: e.target.value })} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Date</label><input type="date" className="form-control premium-input" value={supplyForm.date} onChange={(e) => setSupplyForm({ ...supplyForm, date: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Zone</label><input className="form-control premium-input" value={supplyForm.zone} onChange={(e) => setSupplyForm({ ...supplyForm, zone: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Litres</label><input className="form-control premium-input" inputMode="decimal" value={supplyForm.litres} onChange={(e) => setSupplyForm({ ...supplyForm, litres: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Fat %</label><input className="form-control premium-input" inputMode="decimal" value={supplyForm.fat} onChange={(e) => setSupplyForm({ ...supplyForm, fat: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Rate</label><input className="form-control premium-input" inputMode="decimal" value={supplyForm.ratePerLitre} onChange={(e) => setSupplyForm({ ...supplyForm, ratePerLitre: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Latitude</label><input className="form-control premium-input" value={supplyForm.latitude} onChange={(e) => setSupplyForm({ ...supplyForm, latitude: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Longitude</label><input className="form-control premium-input" value={supplyForm.longitude} onChange={(e) => setSupplyForm({ ...supplyForm, longitude: e.target.value })} /></div>
              </div>
              <button className="btn btn-success premium-button mt-3">Save Entry</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel mb-4">
          <div className="card-body">
            <SectionHeader title="Suppliers" subtitle="Saved supplier records." action={<input className="form-control premium-input premium-search" placeholder="Search suppliers" value={search} onChange={(e) => setSearch(e.target.value)} />} />
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
                      <div className="small text-secondary mt-2">{supplier.location} - {supplier.zone}</div>
                      <div className="small text-secondary mt-1">{supplier.latitude || "-"} / {supplier.longitude || "-"}</div>
                      <div className="fw-semibold mt-2">Rate: {currency(supplier.ratePerLitre)} / litre</div>
                      <p className="small text-secondary mt-2 mb-3">{supplier.notes}</p>
                      <div className="d-flex gap-2 flex-wrap">
                        <a className="btn btn-success btn-sm premium-button" href={`tel:${supplier.phone}`}>Call</a>
                        <a className="btn btn-outline-success btn-sm premium-button" href={`sms:${supplier.phone}`}>SMS</a>
                        <a className="btn btn-outline-dark btn-sm premium-button" href={`https://wa.me/${supplier.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        {mapHref(supplier) ? <a className="btn btn-outline-primary btn-sm premium-button" href={mapHref(supplier)} target="_blank" rel="noreferrer">Map</a> : null}
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
            <SectionHeader title="Milk Supply Records" subtitle="Saved milk collection entries." />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Date</th><th>Supplier</th><th>Zone</th><th>Location</th><th>Litres</th><th>Cost</th></tr></thead>
                <tbody>
                  {supplyEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{entry.supplierName}</td>
                      <td>{entry.zone}</td>
                      <td>{entry.latitude && entry.longitude ? `${entry.latitude}, ${entry.longitude}` : entry.location}</td>
                      <td>{Number(entry.litres).toFixed(1)} L</td>
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
            <SectionHeader title={editingId ? "Edit Customer" : "Add Customer"} subtitle="Customer details and location." />
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
                <div className="col-md-6"><label className="form-label">Latitude</label><input className="form-control premium-input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Longitude</label><input className="form-control premium-input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
                <div className="col-12"><label className="form-label">Map Link</label><input className="form-control premium-input" value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} /></div>
                <div className="col-12"><label className="form-label">Balance</label><input className="form-control premium-input" inputMode="decimal" value={form.balance} onChange={(e) => setForm({ ...form, balance: sanitizeDecimal(e.target.value) })} /></div>
              </div>
              <div className="mt-3"><label className="form-label">Notes</label><textarea className="form-control premium-input" rows="3" value={form.supportNotes} onChange={(e) => setForm({ ...form, supportNotes: e.target.value })} /></div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-success premium-button">{editingId ? "Update Customer" : "Save Customer"}</button>
                {editingId ? <button type="button" className="btn btn-outline-dark premium-button" onClick={() => onEdit(null)}>Cancel</button> : null}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Customers" subtitle="Saved customer records." action={<input className="form-control premium-input premium-search" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} />} />
            <div className="row g-4">
              {filteredCustomers.map((customer) => (
                <div className="col-md-6" key={customer.id}>
                  <div className="card border-0 customer-card h-100 hover-rise">
                    <div className="card-body">
                      <div className="d-flex justify-content-between gap-2">
                        <div>
                          <h4 className="h5 fw-bold mb-1">{customer.name}</h4>
                          <div className="small text-secondary">{customer.area} - {customer.plan}</div>
                        </div>
                        {isAdmin ? <button className="btn btn-sm btn-outline-dark premium-button" onClick={() => onEdit(customer)}>Edit</button> : null}
                      </div>
                      <div className="customer-meta mt-3">
                        <span>{customer.route}</span>
                        <span>{customer.zone}</span>
                        <span>{currency(customer.balance)}</span>
                      </div>
                      <div className="small text-secondary mt-3">
                        <div>Phone: {customer.phone}</div>
                        {customer.alternatePhone ? <div>Alt: {customer.alternatePhone}</div> : null}
                        {customer.locationName ? <div>Location: {customer.locationName}</div> : null}
                      </div>
                      <p className="small text-secondary mt-3 mb-3">{customer.supportNotes}</p>
                      <div className="d-flex gap-2 flex-wrap">
                        <a className="btn btn-success btn-sm premium-button" href={`tel:${customer.phone}`}>Call</a>
                        <a className="btn btn-outline-success btn-sm premium-button" href={`sms:${customer.phone}`}>SMS</a>
                        <a className="btn btn-outline-dark btn-sm premium-button" href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                        {mapHref(customer) ? <a className="btn btn-outline-primary btn-sm premium-button" href={mapHref(customer)} target="_blank" rel="noreferrer">Map</a> : null}
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
            <SectionHeader title={editingId ? "Edit Product" : "Add Product"} subtitle="Milk and dairy product setup." />
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
                <button className="btn btn-success premium-button">{editingId ? "Update Product" : "Save Product"}</button>
                {editingId ? <button type="button" className="btn btn-outline-dark premium-button" onClick={() => onEdit(null)}>Cancel</button> : null}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Products" subtitle="Saved product records." />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Fat</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{currency(product.price)}</td>
                      <td>{product.stock} {product.unit}</td>
                      <td>{product.fat}%</td>
                      <td><span className={`badge ${Number(product.stock || 0) <= 20 ? "text-bg-danger" : "text-bg-success"}`}>{Number(product.stock || 0) <= 20 ? "Low Stock" : "Available"}</span></td>
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

export function TrackingView({ supplies, invoices, report }) {
  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="card border-0 section-card glow-panel h-100">
          <div className="card-body">
            <div className="tracking-image rounded-4 mb-3" style={{ backgroundImage: `url(${dairyImages.field})` }} />
            <SectionHeader title="Milk Flow" subtitle="Supply, sales, and cost." />
            <div className="tracking-metric mt-3"><span>Milk Purchased</span><strong>{Number(report.totalMilkPurchased).toFixed(1)} L</strong></div>
            <div className="tracking-metric"><span>Milk Sold</span><strong>{Number(report.totalMilkSold).toFixed(1)} L</strong></div>
            <div className="tracking-metric"><span>Difference</span><strong>{(Number(report.totalMilkPurchased) - Number(report.totalMilkSold)).toFixed(1)} L</strong></div>
            <div className="tracking-metric"><span>Procurement Cost</span><strong>{currency(report.procurementCost)}</strong></div>
            <div className="tracking-metric"><span>Gross Profit</span><strong>{currency(report.grossProfit)}</strong></div>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Supply and Sales" subtitle="Saved milk movement records." />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Type</th><th>Date</th><th>Name</th><th>Zone/Route</th><th>Litres</th><th>Value</th></tr></thead>
                <tbody>
                  {supplies.slice(0, 5).map((entry) => (
                    <tr key={entry.id}>
                      <td><span className="badge text-bg-primary">Supply</span></td>
                      <td>{entry.date}</td>
                      <td>{entry.supplierName}</td>
                      <td>{entry.zone}</td>
                      <td>{Number(entry.litres).toFixed(1)} L</td>
                      <td>{currency(entry.totalCost)}</td>
                    </tr>
                  ))}
                  {invoices.slice(0, 5).map((invoice) => {
                    const litres = invoice.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                    return (
                      <tr key={invoice.id}>
                        <td><span className="badge text-bg-success">Sale</span></td>
                        <td>{invoice.date}</td>
                        <td>{invoice.customerName}</td>
                        <td>{invoice.route}</td>
                        <td>{litres.toFixed(1)} L</td>
                        <td>{currency(invoice.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentsView({ payments, customers, form, setForm, onSave, isAdmin }) {
  const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

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
            <SectionHeader title="Payment Entry" subtitle="Record customer payment." />
            <datalist id="payment-customer-list">{customers.map((customer) => <option key={customer.id} value={customer.name} />)}</datalist>
            <form onSubmit={onSave}>
              <div className="mb-3"><label className="form-label">Customer Name</label><input className="form-control premium-input" list="payment-customer-list" value={form.customerName} onChange={(e) => syncCustomer(e.target.value)} /></div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control premium-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Amount</label><input className="form-control premium-input" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-6"><label className="form-label">Date</label><input type="date" className="form-control premium-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Method</label><input className="form-control premium-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Route</label><input className="form-control premium-input" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Zone</label><input className="form-control premium-input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Reference</label><input className="form-control premium-input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Collected By</label><input className="form-control premium-input" value={form.collectedBy} onChange={(e) => setForm({ ...form, collectedBy: e.target.value })} /></div>
              </div>
              <div className="mt-3"><label className="form-label">Notes</label><textarea className="form-control premium-input" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <button className="btn btn-success premium-button mt-3">Save Payment</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-8">
        <div className="row g-4">
          <div className="col-md-4"><div className="mini-stat glow-panel hover-rise"><span>Total Collected</span><strong>{currency(totalCollected)}</strong></div></div>
          <div className="col-md-4"><div className="mini-stat glow-panel hover-rise"><span>Entries</span><strong>{payments.length}</strong></div></div>
          <div className="col-md-4"><div className="mini-stat glow-panel hover-rise"><span>Pending Balance</span><strong>{currency(customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0))}</strong></div></div>
        </div>

        <div className="card border-0 section-card glow-panel mt-4">
          <div className="card-body">
            <SectionHeader title={isAdmin ? "Payment Tracking" : "Saved Payments"} subtitle={isAdmin ? "Collections, methods, and staff entries." : "Payment records entered by staff."} />
            <div className="table-responsive">
              <table className="table align-middle premium-table">
                <thead><tr><th>Date</th><th>Customer</th><th>Method</th><th>Route</th><th>Collected By</th><th>Amount</th></tr></thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.date}</td>
                      <td>{payment.customerName}</td>
                      <td>{payment.method}</td>
                      <td>{payment.route}</td>
                      <td>{payment.collectedBy}</td>
                      <td>{currency(payment.amount)}</td>
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
    return <div className="card border-0 section-card glow-panel"><div className="card-body"><SectionHeader title="Analytics" subtitle="Analytics and predictions will appear after records are saved." /></div></div>;
  }

  const routeBarData = {
    labels: report.routeAnalytics.routes.map((route) => route.route),
    datasets: [{ label: "Revenue", data: report.routeAnalytics.routes.map((route) => route.revenue), backgroundColor: ["#1d5e42", "#2c7a56", "#d3a35b", "#82b98f"] }]
  };

  const zoneDoughnutData = {
    labels: report.routeAnalytics.zones.map((zone) => zone.zone),
    datasets: [{ data: report.routeAnalytics.zones.map((zone) => zone.litres), backgroundColor: ["#143f2c", "#2d6a4f", "#6ca77d", "#d3a35b", "#9dc9aa"] }]
  };

  const flowLineData = {
    labels: ["Purchased", "Sold", "Difference"],
    datasets: [{ label: "Milk Flow", data: [report.totalMilkPurchased, report.totalMilkSold, report.totalMilkPurchased - report.totalMilkSold], borderColor: "#1d5e42", backgroundColor: "rgba(29,94,66,0.18)", fill: true, tension: 0.35 }]
  };

  const collectionBarData = {
    labels: report.paymentSummary.methods.map((method) => method.method),
    datasets: [{ label: "Collections", data: report.paymentSummary.methods.map((method) => method.amount), backgroundColor: ["#d3a35b", "#3d7f5b", "#7ebd94", "#244737"] }]
  };

  return (
    <div className="row g-4">
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Route Sales" subtitle="Route totals from saved invoices." /><div className="table-responsive"><table className="table align-middle premium-table"><thead><tr><th>Route</th><th>Invoices</th><th>Litres</th><th>Revenue</th></tr></thead><tbody>{report.routeAnalytics.routes.map((route) => <tr key={route.route}><td>{route.route}</td><td>{route.invoices}</td><td>{route.litres.toFixed(1)} L</td><td>{currency(route.revenue)}</td></tr>)}</tbody></table></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Zone Sales" subtitle="Zone totals from saved invoices." /><div className="table-responsive"><table className="table align-middle premium-table"><thead><tr><th>Zone</th><th>Invoices</th><th>Litres</th><th>Revenue</th></tr></thead><tbody>{report.routeAnalytics.zones.map((zone) => <tr key={zone.zone}><td>{zone.zone}</td><td>{zone.invoices}</td><td>{zone.litres.toFixed(1)} L</td><td>{currency(zone.revenue)}</td></tr>)}</tbody></table></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Route Chart" subtitle="Revenue by route" /><div className="chart-shell"><Bar data={routeBarData} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Zone Chart" subtitle="Milk sold by zone" /><div className="chart-shell"><Doughnut data={zoneDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Collection Chart" subtitle="Collections by method" /><div className="chart-shell"><Bar data={collectionBarData} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-lg-6"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><SectionHeader title="Collection Summary" subtitle="Customer payment totals" /><div className="table-responsive"><table className="table align-middle premium-table"><thead><tr><th>Customer</th><th>Entries</th><th>Amount</th></tr></thead><tbody>{report.paymentSummary.customers.map((customer) => <tr key={customer.customer}><td>{customer.customer}</td><td>{customer.entries}</td><td>{currency(customer.amount)}</td></tr>)}</tbody></table></div></div></div></div>
      <div className="col-12"><div className="card border-0 section-card glow-panel"><div className="card-body"><SectionHeader title="Milk Flow Chart" subtitle="Purchased, sold, and difference" /><div className="chart-shell chart-shell-wide"><Line data={flowLineData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div></div></div>
      <div className="col-12"><div className="row g-3">{[["Revenue", currency(report.totalRevenue)], ["Collections", currency(report.totalCollections)], ["Procurement Cost", currency(report.procurementCost)], ["Gross Profit", currency(report.grossProfit)]].map(([label, value]) => <div className="col-md-3" key={label}><div className="mini-stat glow-panel hover-rise"><span>{label}</span><strong>{value}</strong></div></div>)}</div></div>
    </div>
  );
}

export function SupportView({ customers, suppliers }) {
  const contacts = [
    ...customers.map((entry) => ({ ...entry, type: "Customer", locationLabel: `${entry.area} - ${entry.route}`, notesText: entry.supportNotes })),
    ...suppliers.map((entry) => ({ ...entry, type: "Supplier", locationLabel: `${entry.location} - ${entry.zone}`, notesText: entry.notes }))
  ];

  return (
    <div className="row g-4">
      <div className="col-xl-4"><div className="card border-0 section-card glow-panel h-100"><div className="card-body"><div className="support-visual rounded-4 mb-3" style={{ backgroundImage: `url(${dairyImages.milk})` }} /><SectionHeader title="Support" subtitle="Call and message saved contacts." /></div></div></div>
      <div className="col-xl-8"><div className="row g-4">{contacts.map((contact, index) => <div className="col-md-6" key={`${contact.type}-${contact.id || index}`}><div className="card border-0 contact-card h-100 hover-rise glow-panel"><div className="card-body"><div className="contact-type">{contact.type}</div><h4 className="h5 fw-bold mt-3 mb-1">{contact.name}</h4><div className="small text-secondary">{contact.locationLabel}</div>{contact.notesText ? <p className="small text-secondary mt-3 mb-2">{contact.notesText}</p> : null}<div className="small fw-semibold mt-3">{contact.phone}</div><div className="d-flex gap-2 flex-wrap mt-3"><a className="btn btn-success btn-sm premium-button" href={`tel:${contact.phone}`}>Call</a><a className="btn btn-outline-success btn-sm premium-button" href={`sms:${contact.phone}`}>SMS</a><a className="btn btn-outline-dark btn-sm premium-button" href={`https://wa.me/${contact.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>{mapHref(contact) ? <a className="btn btn-outline-primary btn-sm premium-button" href={mapHref(contact)} target="_blank" rel="noreferrer">Map</a> : null}</div></div></div></div>)}</div></div>
    </div>
  );
}
