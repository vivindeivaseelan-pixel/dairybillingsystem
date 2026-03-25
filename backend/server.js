import express from "express";
import cors from "cors";
import { createHmac, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readStore,
  writeStore,
  findUserByCredentials,
  buildDashboardStats,
  buildSalesReport,
  nextInvoiceNumber,
  buildRouteAnalytics
} from "./src/store.js";

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.join(__dirname, "..", "frontend", "dist");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function calculateCashback(settings, amount) {
  if (!settings.cashbackEnabled) return 0;
  if (amount < Number(settings.cashbackMinimumSpend || 0)) return 0;
  if (settings.cashbackType === "flat") return Number(settings.cashbackValue || 0);
  return Number(((amount * Number(settings.cashbackValue || 0)) / 100).toFixed(2));
}

function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    enabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  };
}

async function createRazorpayOrder({ amount, receipt, notes }) {
  const { keyId, keySecret, enabled } = getRazorpayConfig();
  if (!enabled) {
    throw new Error("Razorpay is not configured on the server.");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount || 0) * 100),
      currency: "INR",
      receipt,
      payment_capture: 1,
      notes
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.description || "Unable to create Razorpay order.");
  }

  return data;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "gk-dairy-api" });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const user = findUserByCredentials(username, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  return res.json({
    token: randomUUID(),
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      username: user.username
    }
  });
});

app.get("/api/dashboard", (_req, res) => {
  res.json(buildDashboardStats(readStore()));
});

app.get("/api/settings", (_req, res) => {
  res.json(readStore().settings);
});

app.put("/api/settings", (req, res) => {
  const store = readStore();
  store.settings = {
    ...store.settings,
    ...req.body
  };
  writeStore(store);
  res.json(store.settings);
});

app.get("/api/products", (_req, res) => {
  res.json(readStore().products);
});

app.post("/api/products", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  const product = {
    id: randomUUID(),
    name: payload.name?.trim(),
    category: payload.category?.trim() || "Milk",
    unit: payload.unit?.trim() || "litre",
    price: Number(payload.price || 0),
    stock: Number(payload.stock || 0),
    fat: Number(payload.fat || 0),
    status: payload.status?.trim() || "Active"
  };

  if (!product.name) {
    return res.status(400).json({ message: "Product name is required." });
  }

  store.products.unshift(product);
  writeStore(store);
  res.status(201).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const store = readStore();
  const product = store.products.find((entry) => entry.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const payload = req.body ?? {};
  product.name = payload.name?.trim() || product.name;
  product.category = payload.category?.trim() || product.category;
  product.unit = payload.unit?.trim() || product.unit;
  product.price = Number(payload.price ?? product.price);
  product.stock = Number(payload.stock ?? product.stock);
  product.fat = Number(payload.fat ?? product.fat);
  product.status = payload.status?.trim() || product.status;
  writeStore(store);
  res.json(product);
});

app.get("/api/customers", (_req, res) => {
  res.json(readStore().customers);
});

app.post("/api/customers", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  const customer = {
    id: randomUUID(),
    name: payload.name?.trim(),
    phone: payload.phone?.trim() || "",
    alternatePhone: payload.alternatePhone?.trim() || "",
    area: payload.area?.trim() || "",
    zone: payload.zone?.trim() || "",
    route: payload.route?.trim() || "",
    plan: payload.plan?.trim() || "Retail",
    locationName: payload.locationName?.trim() || "",
    latitude: payload.latitude?.trim() || "",
    longitude: payload.longitude?.trim() || "",
    mapLink: payload.mapLink?.trim() || "",
    balance: Number(payload.balance || 0),
    joinedOn: payload.joinedOn || new Date().toISOString().slice(0, 10),
    supportNotes: payload.supportNotes?.trim() || "",
    cashbackBalance: Number(payload.cashbackBalance || 0)
  };

  if (!customer.name) {
    return res.status(400).json({ message: "Customer name is required." });
  }

  store.customers.unshift(customer);
  writeStore(store);
  res.status(201).json(customer);
});

app.put("/api/customers/:id", (req, res) => {
  const store = readStore();
  const customer = store.customers.find((entry) => entry.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const payload = req.body ?? {};
  customer.name = payload.name?.trim() || customer.name;
  customer.phone = payload.phone?.trim() ?? customer.phone;
  customer.alternatePhone = payload.alternatePhone?.trim() ?? customer.alternatePhone;
  customer.area = payload.area?.trim() ?? customer.area;
  customer.zone = payload.zone?.trim() ?? customer.zone;
  customer.route = payload.route?.trim() ?? customer.route;
  customer.plan = payload.plan?.trim() ?? customer.plan;
  customer.locationName = payload.locationName?.trim() ?? customer.locationName;
  customer.latitude = payload.latitude?.trim() ?? customer.latitude;
  customer.longitude = payload.longitude?.trim() ?? customer.longitude;
  customer.mapLink = payload.mapLink?.trim() ?? customer.mapLink;
  customer.balance = Number(payload.balance ?? customer.balance);
  customer.cashbackBalance = Number(payload.cashbackBalance ?? customer.cashbackBalance ?? 0);
  customer.supportNotes = payload.supportNotes?.trim() ?? customer.supportNotes;
  writeStore(store);
  res.json(customer);
});

app.delete("/api/customers/:id", (req, res) => {
  const store = readStore();
  const before = store.customers.length;
  store.customers = store.customers.filter((customer) => customer.id !== req.params.id);
  if (store.customers.length === before) {
    return res.status(404).json({ message: "Customer not found." });
  }
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/suppliers", (_req, res) => {
  res.json(readStore().suppliers);
});

app.post("/api/suppliers", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  const supplier = {
    id: randomUUID(),
    name: payload.name?.trim(),
    phone: payload.phone?.trim() || "",
    farmName: payload.farmName?.trim() || "",
    location: payload.location?.trim() || "",
    zone: payload.zone?.trim() || "",
    latitude: payload.latitude?.trim() || "",
    longitude: payload.longitude?.trim() || "",
    mapLink: payload.mapLink?.trim() || "",
    ratePerLitre: Number(payload.ratePerLitre || 0),
    photoUrl: payload.photoUrl?.trim() || "",
    notes: payload.notes?.trim() || ""
  };

  if (!supplier.name) {
    return res.status(400).json({ message: "Supplier name is required." });
  }

  store.suppliers.unshift(supplier);
  writeStore(store);
  res.status(201).json(supplier);
});

app.put("/api/suppliers/:id", (req, res) => {
  const store = readStore();
  const supplier = store.suppliers.find((entry) => entry.id === req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found." });
  }

  const payload = req.body ?? {};
  supplier.name = payload.name?.trim() || supplier.name;
  supplier.phone = payload.phone?.trim() ?? supplier.phone;
  supplier.farmName = payload.farmName?.trim() ?? supplier.farmName;
  supplier.location = payload.location?.trim() ?? supplier.location;
  supplier.zone = payload.zone?.trim() ?? supplier.zone;
  supplier.latitude = payload.latitude?.trim() ?? supplier.latitude;
  supplier.longitude = payload.longitude?.trim() ?? supplier.longitude;
  supplier.mapLink = payload.mapLink?.trim() ?? supplier.mapLink;
  supplier.ratePerLitre = Number(payload.ratePerLitre ?? supplier.ratePerLitre);
  supplier.photoUrl = payload.photoUrl?.trim() ?? supplier.photoUrl;
  supplier.notes = payload.notes?.trim() ?? supplier.notes;
  writeStore(store);
  res.json(supplier);
});

app.delete("/api/suppliers/:id", (req, res) => {
  const store = readStore();
  const before = store.suppliers.length;
  store.suppliers = store.suppliers.filter((supplier) => supplier.id !== req.params.id);
  if (store.suppliers.length === before) {
    return res.status(404).json({ message: "Supplier not found." });
  }
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/milk-supplies", (_req, res) => {
  res.json(readStore().milkSupplies);
});

app.post("/api/milk-supplies", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  if (!payload.supplierId || !Number(payload.litres || 0)) {
    return res.status(400).json({ message: "Supplier and litres are required." });
  }

  const supplier = store.suppliers.find((entry) => entry.id === payload.supplierId);
  if (!supplier) {
    return res.status(404).json({ message: "Supplier not found." });
  }

  const litres = Number(payload.litres || 0);
  const ratePerLitre = Number(payload.ratePerLitre || supplier.ratePerLitre || 0);
  const entry = {
    id: randomUUID(),
    supplierId: supplier.id,
    supplierName: supplier.name,
    farmName: supplier.farmName,
    location: supplier.location,
    latitude: payload.latitude?.trim() || supplier.latitude || "",
    longitude: payload.longitude?.trim() || supplier.longitude || "",
    zone: payload.zone?.trim() || supplier.zone || "",
    date: payload.date || new Date().toISOString().slice(0, 10),
    litres,
    fat: Number(payload.fat || 0),
    ratePerLitre,
    totalCost: litres * ratePerLitre
  };

  store.milkSupplies.unshift(entry);
  writeStore(store);
  res.status(201).json(entry);
});

app.get("/api/invoices", (_req, res) => {
  res.json(readStore().invoices);
});

app.post("/api/invoices", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!payload.customerName?.trim() || items.length === 0) {
    return res.status(400).json({ message: "Customer name and invoice items are required." });
  }

  const customer = store.customers.find((entry) => entry.id === payload.customerId);
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  const discount = Number(payload.discount || 0);
  const tax = Number(payload.tax || 0);
  const total = subtotal - discount + tax;
  const receivedAmount = Number(payload.receivedAmount || 0);
  const balanceAmount = Number(payload.balanceAmount || Math.max(total - receivedAmount, 0));
  const orderType = payload.orderType?.trim() || "Retail";

  const invoice = {
    id: randomUUID(),
    invoiceNumber: payload.invoiceNumber?.trim() || nextInvoiceNumber(store.invoices, store.settings),
    date: payload.date || new Date().toISOString().slice(0, 10),
    customerId: payload.customerId || "",
    customerName: payload.customerName.trim(),
    customerPhone: payload.customerPhone?.trim() || customer?.phone || "",
    route: payload.route?.trim() || customer?.route || "Direct",
    zone: payload.zone?.trim() || customer?.zone || "Local",
    paymentMode: payload.paymentMode?.trim() || "Cash",
    deliverySlot: payload.deliverySlot?.trim() || "Morning",
    orderType,
    notes: payload.notes?.trim() || "",
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: Number(item.quantity || 0),
      unit: item.unit || "litre",
      price: Number(item.price || 0),
      total: Number(item.quantity || 0) * Number(item.price || 0)
    })),
    subtotal,
    discount,
    tax,
    receivedAmount,
    balanceAmount,
    total
  };

  store.invoices.unshift(invoice);

  if (customer) {
    customer.balance = Math.max(0, Number(customer.balance || 0) + balanceAmount);
  }

  for (const item of invoice.items) {
    const product = store.products.find((entry) => entry.id === item.productId);
    if (product) {
      product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 0));
    }
  }

  writeStore(store);
  res.status(201).json(invoice);
});

app.get("/api/payments", (_req, res) => {
  res.json(readStore().payments);
});

app.get("/api/payments/config", (_req, res) => {
  const { keyId, enabled } = getRazorpayConfig();
  res.json({
    gateway: "razorpay",
    enabled,
    keyId: enabled ? keyId : ""
  });
});

app.post("/api/payments/razorpay/order", async (req, res) => {
  try {
    const payload = req.body ?? {};
    const amount = Number(payload.amount || 0);
    if (!payload.customerName?.trim() || amount <= 0) {
      return res.status(400).json({ message: "Customer name and a valid amount are required." });
    }

    const order = await createRazorpayOrder({
      amount,
      receipt: `gk-${Date.now()}`,
      notes: {
        customerName: payload.customerName.trim(),
        phone: payload.phone?.trim() || "",
        route: payload.route?.trim() || "",
        zone: payload.zone?.trim() || ""
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(503).json({ message: error.message || "Unable to create Razorpay order." });
  }
});

app.post("/api/payments/razorpay/verify", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  const { keySecret, enabled } = getRazorpayConfig();

  if (!enabled) {
    return res.status(503).json({ message: "Razorpay is not configured on the server." });
  }

  const orderId = payload.razorpay_order_id?.trim();
  const paymentId = payload.razorpay_payment_id?.trim();
  const signature = payload.razorpay_signature?.trim();
  const amount = Number(payload.amount || 0);

  if (!orderId || !paymentId || !signature || amount <= 0 || !payload.customerName?.trim()) {
    return res.status(400).json({ message: "Payment verification payload is incomplete." });
  }

  const generatedSignature = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  if (generatedSignature !== signature) {
    return res.status(400).json({ message: "Razorpay signature verification failed." });
  }

  const existing = store.payments.find((entry) => entry.reference === paymentId);
  if (existing) {
    return res.json(existing);
  }

  const customer = store.customers.find((entry) => entry.id === payload.customerId) ||
    store.customers.find((entry) => entry.name.toLowerCase() === payload.customerName.trim().toLowerCase());
  const cashbackAmount = calculateCashback(store.settings, amount);

  const payment = {
    id: randomUUID(),
    customerId: customer?.id || payload.customerId || "",
    customerName: payload.customerName.trim(),
    phone: payload.phone?.trim() || customer?.phone || "",
    route: payload.route?.trim() || customer?.route || "",
    zone: payload.zone?.trim() || customer?.zone || "",
    amount,
    method: payload.method?.trim() || "GPay QR Code",
    date: payload.date || new Date().toISOString().slice(0, 10),
    reference: paymentId,
    notes: `Razorpay order ${orderId}`,
    collectedBy: "Razorpay Checkout",
    status: "Verified",
    cashbackAmount
  };

  if (customer) {
    customer.balance = Math.max(0, Number(customer.balance || 0) - amount);
    customer.cashbackBalance = Number(customer.cashbackBalance || 0) + cashbackAmount;
  }

  store.payments.unshift(payment);
  writeStore(store);
  res.status(201).json(payment);
});

app.post("/api/payments", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  const amount = Number(payload.amount || 0);

  if (!payload.customerName?.trim() || !amount) {
    return res.status(400).json({ message: "Customer name and amount are required." });
  }

  const customer = store.customers.find((entry) => entry.id === payload.customerId) ||
    store.customers.find((entry) => entry.name.toLowerCase() === payload.customerName.trim().toLowerCase());

  const cashbackAmount = calculateCashback(store.settings, amount);
  const payment = {
    id: randomUUID(),
    customerId: customer?.id || payload.customerId || "",
    customerName: payload.customerName.trim(),
    phone: payload.phone?.trim() || customer?.phone || "",
    route: payload.route?.trim() || customer?.route || "",
    zone: payload.zone?.trim() || customer?.zone || "",
    amount,
    method: payload.method?.trim() || "Cash",
    date: payload.date || new Date().toISOString().slice(0, 10),
    reference: payload.reference?.trim() || "",
    notes: payload.notes?.trim() || "",
    collectedBy: payload.collectedBy?.trim() || "Staff",
    status: payload.status?.trim() || "Received",
    cashbackAmount
  };

  if (customer) {
    customer.balance = Math.max(0, Number(customer.balance || 0) - amount);
    customer.cashbackBalance = Number(customer.cashbackBalance || 0) + cashbackAmount;
  }

  store.payments.unshift(payment);
  writeStore(store);
  res.status(201).json(payment);
});

app.get("/api/support-tickets", (_req, res) => {
  res.json(readStore().supportTickets);
});

app.post("/api/support-tickets", (req, res) => {
  const store = readStore();
  const payload = req.body ?? {};
  if (!payload.name?.trim() || !payload.subject?.trim()) {
    return res.status(400).json({ message: "Name and subject are required." });
  }

  const ticket = {
    id: randomUUID(),
    name: payload.name.trim(),
    phone: payload.phone?.trim() || "",
    type: payload.type?.trim() || "Customer",
    priority: payload.priority?.trim() || "Medium",
    subject: payload.subject.trim(),
    message: payload.message?.trim() || "",
    status: payload.status?.trim() || "Open",
    assignedTo: payload.assignedTo?.trim() || "Support Desk",
    createdAt: new Date().toISOString()
  };

  store.supportTickets.unshift(ticket);
  writeStore(store);
  res.status(201).json(ticket);
});

app.put("/api/support-tickets/:id", (req, res) => {
  const store = readStore();
  const ticket = store.supportTickets.find((entry) => entry.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: "Support ticket not found." });
  }

  ticket.status = req.body?.status?.trim() || ticket.status;
  ticket.priority = req.body?.priority?.trim() || ticket.priority;
  ticket.assignedTo = req.body?.assignedTo?.trim() || ticket.assignedTo;
  writeStore(store);
  res.json(ticket);
});

app.get("/api/reports/sales", (_req, res) => {
  res.json(buildSalesReport(readStore()));
});

app.get("/api/reports/routes", (_req, res) => {
  res.json(buildRouteAnalytics(readStore()));
});

app.use(express.static(FRONTEND_DIST));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`GK Dairy API listening on http://localhost:${PORT}`);
});
