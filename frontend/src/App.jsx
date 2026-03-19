import { useEffect, useState } from "react";
import { LoginScreen, Sidebar } from "./components/Layout.jsx";
import { AnalyticsView, CustomersView, PaymentsView, ProductsView, SuppliersView, SupportView, TrackingView } from "./components/AdminViews.jsx";
import { BillingView, DashboardView } from "./components/Views.jsx";
import { api, defaultInvoiceForm, makeCustomerForm, makePaymentForm, makeProductForm, makeSupplierForm, makeSupplyForm, printInvoice } from "./utils.js";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState("dashboard");
  const [dashboard, setDashboard] = useState({ cards: [], recentInvoices: [], recentSupply: [], recentPayments: [], routeAnalytics: { routes: [], zones: [] } });
  const [report, setReport] = useState({ topProducts: [], routeAnalytics: { routes: [], zones: [] }, paymentSummary: { customers: [], methods: [] } });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [milkSupplies, setMilkSupplies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState(defaultInvoiceForm);
  const [customerForm, setCustomerForm] = useState(makeCustomerForm());
  const [supplierForm, setSupplierForm] = useState(makeSupplierForm());
  const [productForm, setProductForm] = useState(makeProductForm());
  const [supplyForm, setSupplyForm] = useState(makeSupplyForm());
  const [paymentForm, setPaymentForm] = useState(makePaymentForm());
  const [editingCustomerId, setEditingCustomerId] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  const isAdmin = session?.user?.role === "admin";

  async function loadAllData() {
    const [dashboardData, reportData, productData, customerData, supplierData, supplyData, invoiceData, paymentData] = await Promise.all([
      api("/dashboard"),
      api("/reports/sales"),
      api("/products"),
      api("/customers"),
      api("/suppliers"),
      api("/milk-supplies"),
      api("/invoices"),
      api("/payments")
    ]);
    setDashboard(dashboardData);
    setReport(reportData);
    setProducts(productData);
    setCustomers(customerData);
    setSuppliers(supplierData);
    setMilkSupplies(supplyData);
    setInvoices(invoiceData);
    setPayments(paymentData);
  }

  useEffect(() => {
    if (session) loadAllData().catch((error) => setMessage(error.message));
  }, [session]);

  async function handleLogin(credentials) {
    setLoading(true);
    setLoginError("");
    try {
      setSession(await api("/auth/login", { method: "POST", body: JSON.stringify(credentials) }));
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveCustomer(event) {
    event.preventDefault();
    if (editingCustomerId) {
      await api(`/customers/${editingCustomerId}`, { method: "PUT", body: JSON.stringify(customerForm) });
      setMessage("Customer updated.");
    } else {
      await api("/customers", { method: "POST", body: JSON.stringify(customerForm) });
      setMessage("Customer added.");
    }
    setCustomerForm(makeCustomerForm());
    setEditingCustomerId("");
    await loadAllData();
  }

  async function saveSupplier(event) {
    event.preventDefault();
    if (editingSupplierId) {
      await api(`/suppliers/${editingSupplierId}`, { method: "PUT", body: JSON.stringify(supplierForm) });
      setMessage("Supplier updated.");
    } else {
      await api("/suppliers", { method: "POST", body: JSON.stringify(supplierForm) });
      setMessage("Supplier added.");
    }
    setSupplierForm(makeSupplierForm());
    setEditingSupplierId("");
    await loadAllData();
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (editingProductId) {
      await api(`/products/${editingProductId}`, { method: "PUT", body: JSON.stringify(productForm) });
      setMessage("Product updated.");
    } else {
      await api("/products", { method: "POST", body: JSON.stringify(productForm) });
      setMessage("Product added.");
    }
    setProductForm(makeProductForm());
    setEditingProductId("");
    await loadAllData();
  }

  async function addSupply(event) {
    event.preventDefault();
    await api("/milk-supplies", { method: "POST", body: JSON.stringify(supplyForm) });
    setSupplyForm(makeSupplyForm());
    setMessage("Milk supply entry added.");
    await loadAllData();
  }

  async function savePayment(event) {
    event.preventDefault();
    await api("/payments", { method: "POST", body: JSON.stringify(paymentForm) });
    setPaymentForm(makePaymentForm());
    setMessage("Payment saved.");
    await loadAllData();
  }

  async function deleteCustomer(id) {
    await api(`/customers/${id}`, { method: "DELETE" });
    setMessage("Customer deleted.");
    await loadAllData();
  }

  async function deleteSupplier(id) {
    await api(`/suppliers/${id}`, { method: "DELETE" });
    setMessage("Supplier deleted.");
    await loadAllData();
  }

  async function createInvoice(event) {
    event.preventDefault();
    const payload = {
      ...invoiceForm,
      items: invoiceForm.items
        .filter((item) => item.name && Number(item.quantity || 0) > 0)
        .map((item) => ({ ...item, total: Number(item.quantity || 0) * Number(item.price || 0) })),
      subtotal: invoiceForm.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0)
    };
    const invoice = await api("/invoices", { method: "POST", body: JSON.stringify(payload) });
    setInvoiceForm(defaultInvoiceForm);
    setMessage("Milk sale saved.");
    await loadAllData();
    printInvoice(invoice);
  }

  function editCustomer(customer) {
    if (!customer) return (setEditingCustomerId(""), setCustomerForm(makeCustomerForm()));
    setEditingCustomerId(customer.id);
    setCustomerForm({ ...customer, balance: String(customer.balance ?? "") });
  }

  function editSupplier(supplier) {
    if (!supplier) return (setEditingSupplierId(""), setSupplierForm(makeSupplierForm()));
    setEditingSupplierId(supplier.id);
    setSupplierForm({ ...supplier, ratePerLitre: String(supplier.ratePerLitre ?? "") });
  }

  function editProduct(product) {
    if (!product) return (setEditingProductId(""), setProductForm(makeProductForm()));
    setEditingProductId(product.id);
    setProductForm({ ...product, price: String(product.price ?? ""), stock: String(product.stock ?? ""), fat: String(product.fat ?? "") });
  }

  if (!session) return <LoginScreen onLogin={handleLogin} error={loginError} loading={loading} />;

  return (
    <div className="app-shell">
      <div className="live-bg">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="sky-glow sky-glow-a" />
        <div className="sky-glow sky-glow-b" />
        <div className="cloud cloud-a" />
        <div className="cloud cloud-b" />
      </div>
      <Sidebar user={session.user} view={view} setView={setView} onLogout={() => setSession(null)} />
      <main className="content-area">
        <div className="page-header">
          <div>
            <div className="small text-uppercase text-secondary fw-semibold">Dairy System</div>
            <h1 className="page-title">Operations, records, analytics, and payments</h1>
          </div>
          {message ? <div className="alert alert-success py-2 px-3 mb-0 glow-panel">{message}</div> : null}
        </div>

        {view === "dashboard" ? <DashboardView dashboard={dashboard} report={report} onPrintLast={invoices[0] ? () => printInvoice(invoices[0]) : null} /> : null}
        {view === "billing" ? <BillingView products={products} customers={customers} invoices={invoices} invoiceForm={invoiceForm} setInvoiceForm={setInvoiceForm} onCreate={createInvoice} /> : null}
        {view === "customers" ? <CustomersView customers={customers} form={customerForm} setForm={setCustomerForm} onSave={saveCustomer} onDelete={deleteCustomer} isAdmin={isAdmin} search={customerSearch} setSearch={setCustomerSearch} editingId={editingCustomerId} onEdit={editCustomer} /> : null}
        {view === "suppliers" ? <SuppliersView suppliers={suppliers} supplyEntries={milkSupplies} form={supplierForm} setForm={setSupplierForm} supplyForm={supplyForm} setSupplyForm={setSupplyForm} onSave={saveSupplier} onDelete={deleteSupplier} onSaveSupply={addSupply} isAdmin={isAdmin} search={supplierSearch} setSearch={setSupplierSearch} editingId={editingSupplierId} onEdit={editSupplier} /> : null}
        {view === "products" ? <ProductsView products={products} form={productForm} setForm={setProductForm} onSave={saveProduct} isAdmin={isAdmin} editingId={editingProductId} onEdit={editProduct} /> : null}
        {view === "tracking" ? <TrackingView supplies={milkSupplies} invoices={invoices} report={report} /> : null}
        {view === "payments" ? <PaymentsView payments={payments} customers={customers} form={paymentForm} setForm={setPaymentForm} onSave={savePayment} isAdmin={isAdmin} /> : null}
        {view === "analytics" ? <AnalyticsView report={report} /> : null}
        {view === "support" ? <SupportView customers={customers} suppliers={suppliers} /> : null}
      </main>
    </div>
  );
}

export default App;
