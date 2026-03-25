import { useMemo } from "react";
import { currency, dairyImages, defaultInvoiceForm, metricValue, printInvoice, sanitizeDecimal, sanitizePhone } from "../utils.js";
import { SectionHeader } from "./Layout.jsx";

function StatusBadge({ children, tone = "neutral" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function DashboardView({ dashboard, report, customers, payments, supportTickets, settings, onPrintLast }) {
  const pendingCustomers = customers.filter((customer) => Number(customer.balance || 0) > 0).slice(0, 5);

  return (
    <>
      <section className="hero-banner premium-hero glow-panel" style={{ backgroundImage: `url(${dairyImages.hero})` }}>
        <div className="hero-overlay" />
        <div className="hero-copy">
          <div className="glass-tag mb-3">GK Dairy Company</div>
          <h2 className="display-5 fw-bold">Commercial dairy command center</h2>
          <p className="mb-0 text-white-50">Billing, collections, support, cashback control, and route-ready operations from one premium workspace.</p>
        </div>
      </section>

      <div className="row g-3 mt-1">
        {dashboard.cards.map((card) => (
          <div className="col-md-6 col-xl-4 col-xxl-3" key={card.label}>
            <div className="card stat-card border-0 h-100 hover-rise glow-panel">
              <div className="card-body">
                <div className="small text-uppercase text-secondary fw-semibold">{card.label}</div>
                <div className="display-6 fw-bold mt-2">{metricValue(card)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mt-1">
        <div className="col-xl-7">
          <div className="card border-0 section-card h-100 glow-panel">
            <div className="card-body">
              <SectionHeader title="Recent Bills" subtitle={`${settings.companyName} invoice records ready for reprint`} action={onPrintLast ? <button className="btn btn-outline-dark premium-button" onClick={onPrintLast}>Print Latest</button> : null} />
              <div className="table-responsive">
                <table className="table align-middle premium-table">
                  <thead><tr><th>Invoice</th><th>Customer</th><th>Type</th><th>Payment</th><th>Total</th></tr></thead>
                  <tbody>
                    {dashboard.recentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.customerName}</td>
                        <td>{invoice.orderType || "Retail"}</td>
                        <td>{invoice.paymentMode}</td>
                        <td>{currency(invoice.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="card border-0 section-card h-100 glow-panel">
            <div className="card-body">
              <SectionHeader title="Top Products" subtitle="Best-selling dairy lines" />
              <div className="d-grid gap-3">
                {report.topProducts.map((product) => (
                  <div className="list-panel hover-rise" key={product.name}>
                    <div>
                      <div className="fw-semibold">{product.name}</div>
                      <div className="small text-secondary">{product.quantity} sold</div>
                    </div>
                    <span className="badge text-bg-dark px-3 py-2">{currency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 section-card glow-panel h-100">
            <div className="card-body">
              <SectionHeader title="Collections Desk" subtitle="Latest payment activity with cashback impact" />
              <div className="d-grid gap-3">
                {payments.slice(0, 5).map((payment) => (
                  <div className="split-row" key={payment.id}>
                    <div>
                      <div className="fw-semibold">{payment.customerName}</div>
                      <div className="small text-secondary">{payment.method} | {payment.date}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">{currency(payment.amount)}</div>
                      <div className="small text-secondary">Cashback {currency(payment.cashbackAmount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 section-card glow-panel h-100">
            <div className="card-body">
              <SectionHeader title="Support Queue" subtitle="Customer issues and admin follow-up" />
              <div className="d-grid gap-3">
                {supportTickets.slice(0, 5).map((ticket) => (
                  <div className="split-row" key={ticket.id}>
                    <div>
                      <div className="fw-semibold">{ticket.subject}</div>
                      <div className="small text-secondary">{ticket.name} | {ticket.assignedTo}</div>
                    </div>
                    <StatusBadge tone={ticket.status === "Closed" ? "success" : ticket.priority === "High" ? "danger" : "warning"}>
                      {ticket.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 section-card glow-panel">
            <div className="card-body">
              <SectionHeader title="Pending Collection Follow-up" subtitle="Users with outstanding balance and cashback wallet" />
              <div className="table-responsive">
                <table className="table align-middle premium-table">
                  <thead><tr><th>User</th><th>Route</th><th>Plan</th><th>Due</th><th>Cashback Wallet</th></tr></thead>
                  <tbody>
                    {pendingCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{customer.route || "-"}</td>
                        <td>{customer.plan || "-"}</td>
                        <td>{currency(customer.balance)}</td>
                        <td>{currency(customer.cashbackBalance)}</td>
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
  );
}

export function BillingView({ products, customers, invoices, invoiceForm, setInvoiceForm, settings, onCreate }) {
  const subtotal = useMemo(
    () => invoiceForm.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
    [invoiceForm.items]
  );
  const total = subtotal - Number(invoiceForm.discount || 0) + Number(invoiceForm.tax || 0);
  const received = Number(invoiceForm.receivedAmount || 0);
  const balance = Math.max(total - received, 0);

  function syncCustomer(name) {
    const match = customers.find((customer) => customer.name.toLowerCase() === name.toLowerCase());
    if (!match) {
      setInvoiceForm({ ...invoiceForm, customerName: name });
      return;
    }
    setInvoiceForm({
      ...invoiceForm,
      customerId: match.id,
      customerName: match.name,
      customerPhone: match.phone,
      route: match.route || invoiceForm.route,
      zone: match.zone || invoiceForm.zone
    });
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
    invoiceNumber: "DRAFT",
    subtotal,
    total,
    receivedAmount: received,
    balanceAmount: balance,
    items: invoiceForm.items.map((item) => ({ ...item, total: Number(item.quantity || 0) * Number(item.price || 0) }))
  };

  return (
    <div className="row g-4">
      <div className="col-xl-8">
        <div className="card border-0 section-card glow-panel">
          <div className="card-body">
            <SectionHeader title="Billing Cart" subtitle="Commercial checkout with editable cart, delivery mode, and premium invoice preview" action={<button className="btn btn-dark premium-button" onClick={() => printInvoice(draftInvoice, settings)}>Preview Bill</button>} />
            <datalist id="customer-list">{customers.map((customer) => <option key={customer.id} value={customer.name} />)}</datalist>
            <datalist id="product-list">{products.map((product) => <option key={product.id} value={product.name} />)}</datalist>
            <form onSubmit={onCreate}>
              <div className="checkout-grid">
                <div><label className="form-label">Customer Name</label><input className="form-control premium-input" list="customer-list" value={invoiceForm.customerName} onChange={(e) => syncCustomer(e.target.value)} /></div>
                <div><label className="form-label">Phone</label><input className="form-control premium-input" value={invoiceForm.customerPhone} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: sanitizePhone(e.target.value) })} /></div>
                <div><label className="form-label">Date</label><input type="date" className="form-control premium-input" value={invoiceForm.date} onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })} /></div>
                <div><label className="form-label">Route</label><input className="form-control premium-input" value={invoiceForm.route} onChange={(e) => setInvoiceForm({ ...invoiceForm, route: e.target.value })} /></div>
                <div><label className="form-label">Zone</label><input className="form-control premium-input" value={invoiceForm.zone} onChange={(e) => setInvoiceForm({ ...invoiceForm, zone: e.target.value })} /></div>
                <div><label className="form-label">Payment Mode</label><select className="form-select premium-input" value={invoiceForm.paymentMode} onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMode: e.target.value })}><option>UPI</option><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Credit</option></select></div>
                <div><label className="form-label">Delivery Slot</label><select className="form-select premium-input" value={invoiceForm.deliverySlot} onChange={(e) => setInvoiceForm({ ...invoiceForm, deliverySlot: e.target.value })}><option>Morning</option><option>Evening</option><option>Pickup</option></select></div>
                <div><label className="form-label">Order Type</label><select className="form-select premium-input" value={invoiceForm.orderType} onChange={(e) => setInvoiceForm({ ...invoiceForm, orderType: e.target.value })}><option>Retail</option><option>Subscription</option><option>Wholesale</option></select></div>
              </div>

              <div className="table-responsive mt-4">
                <table className="table align-middle premium-table invoice-table">
                  <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Total</th><th /></tr></thead>
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
                <button type="button" className="btn btn-outline-dark premium-button" onClick={() => setInvoiceForm({ ...invoiceForm, items: [...invoiceForm.items, { productId: "", name: "", quantity: "", unit: "litre", price: "" }] })}>Add Product</button>
                <button type="button" className="btn btn-outline-secondary premium-button" onClick={() => setInvoiceForm({ ...defaultInvoiceForm, date: invoiceForm.date })}>Clear Cart</button>
              </div>

              <div className="checkout-grid mt-4">
                <div><label className="form-label">Discount</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.discount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: sanitizeDecimal(e.target.value) })} /></div>
                <div><label className="form-label">GST</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.tax} onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: sanitizeDecimal(e.target.value) })} /></div>
                <div><label className="form-label">Received Amount</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.receivedAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, receivedAmount: sanitizeDecimal(e.target.value) })} /></div>
                <div><label className="form-label">Balance Amount</label><input className="form-control premium-input" inputMode="decimal" value={invoiceForm.balanceAmount || balance.toFixed(2)} onChange={(e) => setInvoiceForm({ ...invoiceForm, balanceAmount: sanitizeDecimal(e.target.value) })} /></div>
              </div>

              <div className="mt-3"><label className="form-label">Invoice Notes</label><textarea className="form-control premium-input" rows="3" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} /></div>

              <div className="invoice-summary mt-4">
                <div>Subtotal: {currency(subtotal)}</div>
                <div>Net Amount: {currency(total)}</div>
                <div>Due: {currency(balance)}</div>
              </div>
              <button className="btn btn-dark btn-lg mt-4 premium-button">Save Bill</button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-xl-4">
        <div className="card border-0 section-card h-100 glow-panel">
          <div className="card-body d-flex flex-column gap-4">
            <div className="support-visual rounded-4" style={{ backgroundImage: `url(${dairyImages.milk})` }} />
            <div className="bill-preview-card">
              <div className="small text-uppercase text-secondary fw-semibold">{settings.companyName}</div>
              <div className="h5 fw-bold mt-2">{settings.invoiceTitle}</div>
              <div className="small text-secondary">{settings.invoiceSubtitle}</div>
              <div className="small text-secondary mt-3">UPI: {settings.upiId}</div>
              <div className="small text-secondary">Support: {settings.supportPhone}</div>
            </div>
            <div>
              <SectionHeader title="Saved Bills" subtitle="Quick reprint for dispatch and accounts" />
              <div className="d-grid gap-3">
                {invoices.slice(0, 5).map((invoice) => (
                  <div className="list-panel hover-rise" key={invoice.id}>
                    <div>
                      <div className="fw-semibold">{invoice.customerName}</div>
                      <div className="small text-secondary">{invoice.invoiceNumber} | {invoice.date}</div>
                    </div>
                    <button className="btn btn-outline-dark btn-sm premium-button" onClick={() => printInvoice(invoice, settings)}>Print</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
