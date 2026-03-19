import { useMemo } from "react";
import { currency, dairyImages, defaultInvoiceForm, metricValue, printInvoice, sanitizeDecimal, sanitizePhone } from "../utils.js";
import { SectionHeader } from "./Layout.jsx";

export function DashboardView({ dashboard, report, onPrintLast }) {
  const hasData = dashboard.recentInvoices.length || dashboard.recentSupply.length || (dashboard.recentPayments || []).length;

  return (
    <>
      <section className="hero-banner glow-panel" style={{ backgroundImage: `url(${dairyImages.hero})` }}>
        <div className="hero-overlay" />
        <div className="hero-copy">
          <div className="glass-tag mb-3">Dashboard</div>
          <h2 className="display-5 fw-bold">Daily dairy operations</h2>
          <p className="mb-0 text-white-50">Saved records, milk movement, collections, and bills.</p>
        </div>
      </section>

      {hasData ? (
        <>
          <div className="row g-3 mt-1">
            {dashboard.cards.map((card) => (
              <div className="col-md-6 col-xl-3" key={card.label}>
                <div className="card stat-card border-0 h-100 hover-rise glow-panel">
                  <div className="card-body">
                    <div className="small text-secondary text-uppercase">{card.label}</div>
                    <div className="display-6 fw-bold mt-2">{metricValue(card)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mt-1">
            <div className="col-lg-7">
              <div className="card border-0 section-card h-100 glow-panel">
                <div className="card-body">
                  <SectionHeader title="Sales" subtitle="Saved invoices" action={onPrintLast ? <button className="btn btn-outline-success premium-button" onClick={onPrintLast}>Print Last Bill</button> : null} />
                  <div className="table-responsive">
                    <table className="table align-middle premium-table">
                      <thead><tr><th>Invoice</th><th>Customer</th><th>Route</th><th>Total</th></tr></thead>
                      <tbody>{dashboard.recentInvoices.map((invoice) => <tr key={invoice.id}><td>{invoice.invoiceNumber}</td><td>{invoice.customerName}</td><td>{invoice.route}</td><td>{currency(invoice.total)}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card border-0 section-card h-100 glow-panel">
                <div className="card-body">
                  <SectionHeader title="Products" subtitle="Top sales by product" />
                  <div className="d-grid gap-3">
                    {report.topProducts.map((product) => (
                      <div className="list-panel hover-rise" key={product.name}>
                        <div><div className="fw-semibold">{product.name}</div><div className="small text-secondary">{product.quantity} sold</div></div>
                        <span className="badge text-bg-success px-3 py-2">{currency(product.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card border-0 section-card h-100 glow-panel">
                <div className="card-body">
                  <SectionHeader title="Collections" subtitle="Recent payment entries" />
                  <div className="table-responsive">
                    <table className="table align-middle premium-table">
                      <thead><tr><th>Date</th><th>Customer</th><th>Method</th><th>Collected By</th><th>Amount</th></tr></thead>
                      <tbody>
                        {(dashboard.recentPayments || []).map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.date}</td>
                            <td>{payment.customerName}</td>
                            <td>{payment.method}</td>
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
        </>
      ) : (
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="No saved data" subtitle="Add records to start the dashboard, analytics, and predictions." />
          </div>
        </div>
      )}
    </>
  );
}

export function BillingView({ products, customers, invoices, invoiceForm, setInvoiceForm, onCreate }) {
  const subtotal = useMemo(() => invoiceForm.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0), [invoiceForm.items]);
  const total = subtotal - Number(invoiceForm.discount || 0) + Number(invoiceForm.tax || 0);
  const received = Number(invoiceForm.receivedAmount || 0);
  const balance = Math.max(total - received, 0);

  function syncCustomer(name) {
    const match = customers.find((customer) => customer.name.toLowerCase() === name.toLowerCase());
    if (!match) return setInvoiceForm({ ...invoiceForm, customerName: name });
    setInvoiceForm({ ...invoiceForm, customerId: match.id, customerName: match.name, customerPhone: match.phone, route: match.route || invoiceForm.route, zone: match.zone || invoiceForm.zone });
  }

  function updateItem(index, field, value) {
    const nextItems = invoiceForm.items.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (field === "name") {
        const match = products.find((product) => product.name.toLowerCase() === value.toLowerCase());
        return { ...item, name: value, productId: match?.id || "", unit: match?.unit || item.unit, price: match?.price ?? item.price };
      }
      return { ...item, [field]: value };
    });
    setInvoiceForm({ ...invoiceForm, items: nextItems });
  }

  const draftInvoice = {
    ...invoiceForm,
    subtotal,
    total,
    receivedAmount: received,
    balanceAmount: balance,
    invoiceNumber: "DRAFT",
    items: invoiceForm.items.map((item) => ({ ...item, total: Number(item.quantity || 0) * Number(item.price || 0) }))
  };

  return (
    <div className="row g-4">
      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Billing" subtitle="Enter bill details and print the invoice." action={<button className="btn btn-outline-success premium-button" onClick={() => printInvoice(draftInvoice)}>Preview & Print</button>} />
            <datalist id="customer-list">{customers.map((customer) => <option key={customer.id} value={customer.name} />)}</datalist>
            <datalist id="product-list">{products.map((product) => <option key={product.id} value={product.name} />)}</datalist>
            <form onSubmit={onCreate}>
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label">Customer Name</label><input className="form-control premium-input" list="customer-list" value={invoiceForm.customerName} onChange={(e) => syncCustomer(e.target.value)} /></div>
                <div className="col-md-4"><label className="form-label">Customer Phone</label><input className="form-control premium-input" value={invoiceForm.customerPhone} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: sanitizePhone(e.target.value) })} /></div>
                <div className="col-md-4"><label className="form-label">Date</label><input type="date" className="form-control premium-input" value={invoiceForm.date} onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Route</label><input className="form-control premium-input" value={invoiceForm.route} onChange={(e) => setInvoiceForm({ ...invoiceForm, route: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Zone</label><input className="form-control premium-input" value={invoiceForm.zone} onChange={(e) => setInvoiceForm({ ...invoiceForm, zone: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Payment Mode</label><input className="form-control premium-input" value={invoiceForm.paymentMode} onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMode: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Delivery Slot</label><input className="form-control premium-input" value={invoiceForm.deliverySlot} onChange={(e) => setInvoiceForm({ ...invoiceForm, deliverySlot: e.target.value })} /></div>
              </div>

              <div className="table-responsive mt-4">
                <table className="table align-middle premium-table invoice-table">
                  <thead><tr><th>Item Name</th><th>Litre / Qty</th><th>Unit</th><th>Rate</th><th>Total</th><th></th></tr></thead>
                  <tbody>
                    {invoiceForm.items.map((item, index) => (
                      <tr key={index}>
                        <td><input className="form-control premium-input" list="product-list" value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} /></td>
                        <td><input className="form-control premium-input" inputMode="decimal" value={item.quantity} onChange={(e) => updateItem(index, "quantity", sanitizeDecimal(e.target.value))} /></td>
                        <td><input className="form-control premium-input" value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} /></td>
                        <td><input className="form-control premium-input" inputMode="decimal" value={item.price} onChange={(e) => updateItem(index, "price", sanitizeDecimal(e.target.value))} /></td>
                        <td>{currency(Number(item.quantity || 0) * Number(item.price || 0))}</td>
                        <td><button type="button" className="btn btn-outline-danger btn-sm premium-button" onClick={() => setInvoiceForm({ ...invoiceForm, items: invoiceForm.items.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline-success premium-button" onClick={() => setInvoiceForm({ ...invoiceForm, items: [...invoiceForm.items, { productId: "", name: "", quantity: "", unit: "litre", price: "" }] })}>Add Item</button>
                <button type="button" className="btn btn-outline-dark premium-button" onClick={() => setInvoiceForm({ ...defaultInvoiceForm, date: invoiceForm.date })}>Clear Bill</button>
              </div>

              <div className="row g-3 mt-3">
                <div className="col-md-3"><label className="form-label">Discount</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.discount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-3"><label className="form-label">GST</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.tax} onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-3"><label className="form-label">Received Amount</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.receivedAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, receivedAmount: sanitizeDecimal(e.target.value), balanceAmount: sanitizeDecimal(String(Math.max(total - Number(sanitizeDecimal(e.target.value) || 0), 0))) })} /></div>
                <div className="col-md-3"><label className="form-label">Balance Amount</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.balanceAmount || balance.toFixed(2)} onChange={(e) => setInvoiceForm({ ...invoiceForm, balanceAmount: sanitizeDecimal(e.target.value) })} /></div>
                <div className="col-md-12"><label className="form-label">Notes</label><input className="form-control premium-input" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} /></div>
              </div>

              <div className="invoice-summary mt-4">
                <div>Subtotal: {currency(subtotal)}</div>
                <div>Net Amount: {currency(total)}</div>
              </div>
              <button className="btn btn-success btn-lg mt-4 premium-button">Save Bill</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-4">
        <div className="card border-0 section-card h-100 glow-panel">
          <div className="card-body">
            <div className="support-visual rounded-4 mb-3" style={{ backgroundImage: `url(${dairyImages.milk})` }} />
            <SectionHeader title="Saved Bills" subtitle="Print any saved bill." />
            <div className="d-grid gap-3">
              {invoices.slice(0, 4).map((invoice) => (
                <div className="list-panel hover-rise" key={invoice.id}>
                  <div><div className="fw-semibold">{invoice.customerName}</div><div className="small text-secondary">{invoice.invoiceNumber} - {invoice.date}</div></div>
                  <button className="btn btn-outline-success btn-sm premium-button" onClick={() => printInvoice(invoice)}>Print</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
