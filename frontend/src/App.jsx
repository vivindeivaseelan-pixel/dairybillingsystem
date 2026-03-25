import { useEffect, useState } from "react";
import { LoginScreen, Sidebar } from "./components/Layout.jsx";
import { AnalyticsView, CustomersView, PaymentsView, ProductsView, SettingsView, SuppliersView, SupportView } from "./components/AdminViews.jsx";
import { BillingView, DashboardView } from "./components/Views.jsx";
import {
  api,
  defaultInvoiceForm,
  makeCustomerForm,
  makePaymentForm,
  makeProductForm,
  makeSettingsForm,
  makeSupplierForm,
  makeSupportForm,
  makeSupplyForm,
  loadRazorpayScript,
  printInvoice
} from "./utils.js";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState("dashboard");
  const [dashboard, setDashboard] = useState({ cards: [], recentInvoices: [], recentSupply: [], recentPayments: [], recentTickets: [] });
  const [report, setReport] = useState({ topProducts: [], routeAnalytics: { routes: [], zones: [] }, paymentSummary: { customers: [], methods: [] } });
  const [settings, setSettings] = useState({});
  const [gatewayConfig, setGatewayConfig] = useState({ gateway: "razorpay", enabled: false, keyId: "" });
  const [settingsForm, setSettingsForm] = useState(makeSettingsForm());
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [milkSupplies, setMilkSupplies] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState(defaultInvoiceForm);
  const [customerForm, setCustomerForm] = useState(makeCustomerForm());
  const [supplierForm, setSupplierForm] = useState(makeSupplierForm());
  const [productForm, setProductForm] = useState(makeProductForm());
  const [supplyForm, setSupplyForm] = useState(makeSupplyForm());
  const [paymentForm, setPaymentForm] = useState(makePaymentForm());
  const [supportForm, setSupportForm] = useState(makeSupportForm());
  const [editingCustomerId, setEditingCustomerId] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  const isAdmin = session?.user?.role === "admin";

  async function loadAllData() {
    const [dashboardData, reportData, settingsData, gatewayData, productData, customerData, supplierData, supplyData, invoiceData, paymentData, ticketData] = await Promise.all([
      api("/dashboard"),
      api("/reports/sales"),
      api("/settings"),
      api("/payments/config"),
      api("/products"),
      api("/customers"),
      api("/suppliers"),
      api("/milk-supplies"),
      api("/invoices"),
      api("/payments"),
      api("/support-tickets")
    ]);
    setDashboard(dashboardData);
    setReport(reportData);
    setSettings(settingsData);
    setGatewayConfig(gatewayData);
    setSettingsForm(makeSettingsForm(settingsData));
    setProducts(productData);
    setCustomers(customerData);
    setSuppliers(supplierData);
    setMilkSupplies(supplyData);
    setInvoices(invoiceData);
    setPayments(paymentData);
    setSupportTickets(ticketData);
  }

  useEffect(() => {
    if (session) {
      loadAllData().catch((error) => setMessage(error.message));
    }
  }, [session]);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = setTimeout(() => setMessage(""), 2600);
    return () => clearTimeout(timeout);
  }, [message]);

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
      setMessage("User updated.");
    } else {
      await api("/customers", { method: "POST", body: JSON.stringify(customerForm) });
      setMessage("User added.");
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
    setMessage("Milk intake saved.");
    await loadAllData();
  }

  async function savePayment(event) {
    event.preventDefault();
    await api("/payments", { method: "POST", body: JSON.stringify(paymentForm) });
    setPaymentForm(makePaymentForm());
    setMessage("Payment saved with cashback handling.");
    await loadAllData();
  }

  async function startGatewayPayment() {
    const amount = Number(paymentForm.amount || 0);
    if (!paymentForm.customerName.trim() || amount <= 0) {
      setMessage("Enter customer name and amount before starting live payment.");
      return;
    }

    if (!gatewayConfig.enabled || !gatewayConfig.keyId) {
      setMessage("Razorpay is not configured yet on the server.");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setMessage("Unable to load Razorpay checkout.");
      return;
    }

    const order = await api("/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify(paymentForm)
    });

    const razorpay = new window.Razorpay({
      key: gatewayConfig.keyId,
      amount: order.amount,
      currency: order.currency,
      name: settings.companyName || "GK Dairy Company",
      description: `Payment from ${paymentForm.customerName}`,
      order_id: order.id,
      prefill: {
        name: paymentForm.customerName,
        contact: paymentForm.phone
      },
      notes: {
        route: paymentForm.route || "",
        zone: paymentForm.zone || ""
      },
      theme: {
        color: "#14213d"
      },
      handler: async (response) => {
        await api("/payments/razorpay/verify", {
          method: "POST",
          body: JSON.stringify({
            ...paymentForm,
            amount,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        setPaymentForm(makePaymentForm());
        setMessage("Live payment verified and recorded.");
        await loadAllData();
      }
    });

    razorpay.on("payment.failed", () => {
      setMessage("Razorpay payment was not completed.");
    });

    razorpay.open();
  }

  async function saveSupport(event) {
    event.preventDefault();
    await api("/support-tickets", { method: "POST", body: JSON.stringify(supportForm) });
    setSupportForm(makeSupportForm());
    setMessage("Support ticket created.");
    await loadAllData();
  }

  async function saveSettings(event) {
    event.preventDefault();
    const payload = {
      ...settingsForm,
      invoiceSequenceStart: Number(settingsForm.invoiceSequenceStart || 1),
      cashbackValue: Number(settingsForm.cashbackValue || 0),
      cashbackMinimumSpend: Number(settingsForm.cashbackMinimumSpend || 0)
    };
    const updated = await api("/settings", { method: "PUT", body: JSON.stringify(payload) });
    setSettings(updated);
    setSettingsForm(makeSettingsForm(updated));
    setMessage("Admin invoice settings updated.");
  }

  async function updateTicket(id, patch) {
    await api(`/support-tickets/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    setMessage("Support ticket updated.");
    await loadAllData();
  }

  async function deleteCustomer(id) {
    await api(`/customers/${id}`, { method: "DELETE" });
    setMessage("User deleted.");
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
    setMessage("Commercial bill saved.");
    await loadAllData();
    printInvoice(invoice, settings);
  }

  function editCustomer(customer) {
    if (!customer) {
      setEditingCustomerId("");
      setCustomerForm(makeCustomerForm());
      return;
    }
    setEditingCustomerId(customer.id);
    setCustomerForm({
      ...customer,
      balance: String(customer.balance ?? ""),
      cashbackBalance: String(customer.cashbackBalance ?? "")
    });
  }

  function editSupplier(supplier) {
    if (!supplier) {
      setEditingSupplierId("");
      setSupplierForm(makeSupplierForm());
      return;
    }
    setEditingSupplierId(supplier.id);
    setSupplierForm({ ...supplier, ratePerLitre: String(supplier.ratePerLitre ?? "") });
  }

  function editProduct(product) {
    if (!product) {
      setEditingProductId("");
      setProductForm(makeProductForm());
      return;
    }
    setEditingProductId(product.id);
    setProductForm({ ...product, price: String(product.price ?? ""), stock: String(product.stock ?? ""), fat: String(product.fat ?? "") });
  }

  if (!session) return <LoginScreen onLogin={handleLogin} error={loginError} loading={loading} />;

  return (
    <div className="app-shell">
      <Sidebar user={session.user} view={view} setView={setView} onLogout={() => setSession(null)} isAdmin={isAdmin} />
      <main className="content-area">
        <div className="page-header">
          <div>
            <div className="small text-uppercase text-secondary fw-semibold">GK Dairy Company</div>
            <h1 className="page-title">Commercial dairy operations system</h1>
          </div>
          {message ? <div className="alert alert-success py-2 px-3 mb-0 glow-panel">{message}</div> : null}
        </div>

        {view === "dashboard" ? <DashboardView dashboard={dashboard} report={report} customers={customers} payments={payments} supportTickets={supportTickets} settings={settings} onPrintLast={invoices[0] ? () => printInvoice(invoices[0], settings) : null} /> : null}
        {view === "billing" ? <BillingView products={products} customers={customers} invoices={invoices} invoiceForm={invoiceForm} setInvoiceForm={setInvoiceForm} settings={settings} onCreate={createInvoice} /> : null}
        {view === "customers" ? <CustomersView customers={customers} form={customerForm} setForm={setCustomerForm} onSave={saveCustomer} onDelete={deleteCustomer} isAdmin={isAdmin} search={customerSearch} setSearch={setCustomerSearch} editingId={editingCustomerId} onEdit={editCustomer} /> : null}
        {view === "suppliers" ? <SuppliersView suppliers={suppliers} supplyEntries={milkSupplies} form={supplierForm} setForm={setSupplierForm} supplyForm={supplyForm} setSupplyForm={setSupplyForm} onSave={saveSupplier} onDelete={deleteSupplier} onSaveSupply={addSupply} isAdmin={isAdmin} search={supplierSearch} setSearch={setSupplierSearch} editingId={editingSupplierId} onEdit={editSupplier} /> : null}
        {view === "products" ? <ProductsView products={products} form={productForm} setForm={setProductForm} onSave={saveProduct} isAdmin={isAdmin} editingId={editingProductId} onEdit={editProduct} /> : null}
        {view === "payments" ? <PaymentsView payments={payments} customers={customers} form={paymentForm} setForm={setPaymentForm} onSave={savePayment} onGatewayPay={startGatewayPayment} isAdmin={isAdmin} settings={settings} gatewayConfig={gatewayConfig} /> : null}
        {view === "analytics" ? <AnalyticsView report={report} /> : null}
        {view === "support" ? <SupportView customers={customers} suppliers={suppliers} supportTickets={supportTickets} supportForm={supportForm} setSupportForm={setSupportForm} onSaveSupport={saveSupport} isAdmin={isAdmin} onUpdateTicket={updateTicket} /> : null}
        {view === "settings" && isAdmin ? <SettingsView form={settingsForm} setForm={setSettingsForm} onSave={saveSettings} /> : null}
      </main>
    </div>
  );
}

export default App;
