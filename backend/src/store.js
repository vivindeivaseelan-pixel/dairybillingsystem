import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_STORE_PATH = path.join(__dirname, "..", "data", "store.json");
const STORE_PATH = process.env.STORE_PATH || DEFAULT_STORE_PATH;

const defaultSettings = () => ({
  companyName: "GK Dairy Company",
  companyTagline: "Premium milk, dairy retail, distribution, and billing operations",
  invoicePrefix: "GKD",
  invoiceSequenceStart: 1,
  invoiceTitle: "Bill of Supply",
  invoiceSubtitle: "Original / Duplicate / Triplicate",
  companyAddress: "Madurai, Tamil Nadu",
  companyPhone: "98948 28604",
  companyEmail: "billing@gkdairy.local",
  gstin: "33AAAAA0000A1ZZ",
  fssai: "10012022000000",
  bankName: "GK Dairy Collections",
  accountName: "GK Dairy Company",
  accountNumber: "176200001234",
  ifsc: "GKDC0001762",
  upiId: "gkdairy@upi",
  qrText: "UPI: gkdairy@upi",
  invoiceFooter: "Computer generated invoice. Thank you for choosing GK Dairy Company.",
  invoiceNotes: "Goods once sold will not be taken back.",
  supportPhone: "98948 28604",
  supportEmail: "support@gkdairy.local",
  cashbackEnabled: true,
  cashbackType: "percentage",
  cashbackValue: 2,
  cashbackMinimumSpend: 500
});

const EMPTY_STORE = {
  users: [
    { id: "u1", name: "Admin", username: "admin", password: "admin123", role: "admin" },
    { id: "u2", name: "Staff", username: "staff", password: "staff123", role: "staff" }
  ],
  products: [],
  suppliers: [],
  customers: [],
  milkSupplies: [],
  payments: [],
  invoices: [],
  supportTickets: [],
  settings: defaultSettings()
};

function ensureStoreFile() {
  const storeDir = path.dirname(STORE_PATH);
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2));
  }
}

function normalizeStore(store) {
  return {
    ...EMPTY_STORE,
    ...store,
    payments: Array.isArray(store.payments) ? store.payments : [],
    invoices: Array.isArray(store.invoices) ? store.invoices : [],
    customers: Array.isArray(store.customers) ? store.customers : [],
    suppliers: Array.isArray(store.suppliers) ? store.suppliers : [],
    products: Array.isArray(store.products) ? store.products : [],
    milkSupplies: Array.isArray(store.milkSupplies) ? store.milkSupplies : [],
    supportTickets: Array.isArray(store.supportTickets) ? store.supportTickets : [],
    settings: {
      ...defaultSettings(),
      ...(store.settings || {})
    }
  };
}

export function readStore() {
  ensureStoreFile();
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return normalizeStore(JSON.parse(raw));
}

export function writeStore(store) {
  ensureStoreFile();
  fs.writeFileSync(STORE_PATH, JSON.stringify(normalizeStore(store), null, 2));
}

export function findUserByCredentials(username, password) {
  const store = readStore();
  return store.users.find(
    (user) => user.username === String(username || "").trim() && user.password === String(password || "")
  );
}

export function nextInvoiceNumber(invoices, settings = defaultSettings()) {
  const prefix = settings.invoicePrefix || "INV";
  const baseline = Number(settings.invoiceSequenceStart || 1);
  const maxExisting = invoices.reduce((max, invoice) => {
    const matched = String(invoice.invoiceNumber || "").match(/(\d+)$/);
    return matched ? Math.max(max, Number(matched[1])) : max;
  }, baseline - 1);
  return `${prefix}-${String(maxExisting + 1).padStart(4, "0")}`;
}

export function calculateTotals(store) {
  const totalRevenue = store.invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalMilkPurchased = store.milkSupplies.reduce((sum, entry) => sum + Number(entry.litres || 0), 0);
  const totalMilkSold = store.invoices.reduce(
    (sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0),
    0
  );
  const procurementCost = store.milkSupplies.reduce((sum, entry) => sum + Number(entry.totalCost || 0), 0);
  const lowStockCount = store.products.filter((product) => Number(product.stock || 0) <= 20).length;
  const pendingBalance = store.customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0);
  const grossProfit = totalRevenue - procurementCost;
  const totalCollections = store.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalCashback = store.payments.reduce((sum, payment) => sum + Number(payment.cashbackAmount || 0), 0);
  const openTickets = store.supportTickets.filter((ticket) => ticket.status !== "Closed").length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysCollections = store.payments.reduce(
    (sum, payment) => sum + (payment.date === today ? Number(payment.amount || 0) : 0),
    0
  );

  return {
    totalRevenue,
    totalMilkPurchased,
    totalMilkSold,
    procurementCost,
    lowStockCount,
    pendingBalance,
    grossProfit,
    totalCollections,
    todaysCollections,
    totalCashback,
    openTickets
  };
}

export function buildPaymentSummary(store) {
  const byCustomer = new Map();
  const byMethod = new Map();
  const byStatus = new Map();

  for (const payment of store.payments) {
    const customerKey = payment.customerName || "Direct";
    const methodKey = payment.method || "Cash";
    const statusKey = payment.status || "Received";

    const customerStats = byCustomer.get(customerKey) || { customer: customerKey, amount: 0, entries: 0, cashback: 0 };
    customerStats.amount += Number(payment.amount || 0);
    customerStats.entries += 1;
    customerStats.cashback += Number(payment.cashbackAmount || 0);
    byCustomer.set(customerKey, customerStats);

    const methodStats = byMethod.get(methodKey) || { method: methodKey, amount: 0, entries: 0 };
    methodStats.amount += Number(payment.amount || 0);
    methodStats.entries += 1;
    byMethod.set(methodKey, methodStats);

    const statusStats = byStatus.get(statusKey) || { status: statusKey, entries: 0, amount: 0 };
    statusStats.entries += 1;
    statusStats.amount += Number(payment.amount || 0);
    byStatus.set(statusKey, statusStats);
  }

  return {
    customers: [...byCustomer.values()].sort((a, b) => b.amount - a.amount),
    methods: [...byMethod.values()].sort((a, b) => b.amount - a.amount),
    statuses: [...byStatus.values()].sort((a, b) => b.amount - a.amount)
  };
}

export function buildRouteAnalytics(store) {
  const routes = new Map();
  const zones = new Map();

  for (const invoice of store.invoices) {
    const routeKey = invoice.route || "Unassigned";
    const zoneKey = invoice.zone || "Unassigned";
    const litres = invoice.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const routeStats = routes.get(routeKey) || { route: routeKey, litres: 0, revenue: 0, invoices: 0 };
    routeStats.litres += litres;
    routeStats.revenue += Number(invoice.total || 0);
    routeStats.invoices += 1;
    routes.set(routeKey, routeStats);

    const zoneStats = zones.get(zoneKey) || { zone: zoneKey, litres: 0, revenue: 0, invoices: 0 };
    zoneStats.litres += litres;
    zoneStats.revenue += Number(invoice.total || 0);
    zoneStats.invoices += 1;
    zones.set(zoneKey, zoneStats);
  }

  return {
    routes: [...routes.values()].sort((a, b) => b.revenue - a.revenue),
    zones: [...zones.values()].sort((a, b) => b.revenue - a.revenue)
  };
}

export function buildSalesReport(store) {
  const productSales = new Map();

  for (const invoice of store.invoices) {
    for (const item of invoice.items) {
      const current = productSales.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.total || 0);
      productSales.set(item.name, current);
    }
  }

  const topProducts = [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const totals = calculateTotals(store);
  const routeAnalytics = buildRouteAnalytics(store);
  const openTickets = store.supportTickets.filter((ticket) => ticket.status !== "Closed").slice(0, 5);

  return {
    totalRevenue: totals.totalRevenue,
    totalInvoices: store.invoices.length,
    totalCustomers: store.customers.length,
    totalSuppliers: store.suppliers.length,
    totalMilkPurchased: totals.totalMilkPurchased,
    totalMilkSold: totals.totalMilkSold,
    procurementCost: totals.procurementCost,
    grossProfit: totals.grossProfit,
    totalCollections: totals.totalCollections,
    todaysCollections: totals.todaysCollections,
    totalCashback: totals.totalCashback,
    openTicketsCount: totals.openTickets,
    topProducts,
    routeAnalytics,
    paymentSummary: buildPaymentSummary(store),
    openTickets
  };
}

export function buildDashboardStats(store) {
  const totals = calculateTotals(store);
  const routeAnalytics = buildRouteAnalytics(store);
  const recentInvoices = [...store.invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentSupply = [...store.milkSupplies].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentPayments = [...store.payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentTickets = [...store.supportTickets].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).slice(0, 5);

  return {
    cards: [
      { label: "Revenue", value: totals.totalRevenue, type: "currency" },
      { label: "Gross Profit", value: totals.grossProfit, type: "currency" },
      { label: "Collections", value: totals.totalCollections, type: "currency" },
      { label: "Cashback Issued", value: totals.totalCashback, type: "currency" },
      { label: "Today Collections", value: totals.todaysCollections, type: "currency" },
      { label: "Milk Purchased", value: totals.totalMilkPurchased, type: "litre" },
      { label: "Milk Sold", value: totals.totalMilkSold, type: "litre" },
      { label: "Pending Balance", value: totals.pendingBalance, type: "currency" },
      { label: "Open Support", value: totals.openTickets, type: "number" }
    ],
    recentInvoices,
    recentSupply,
    recentPayments,
    recentTickets,
    topProducts: buildSalesReport(store).topProducts,
    routeAnalytics
  };
}
