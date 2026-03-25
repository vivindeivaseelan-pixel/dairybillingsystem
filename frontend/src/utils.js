const configuredApiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");
export const API_BASE = configuredApiBase ? `${configuredApiBase}/api` : "/api";

export const dairyImages = {
  hero: "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1600&q=80",
  field: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80",
  milk: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=1400&q=80"
};

export const defaultInvoiceForm = {
  customerId: "",
  customerName: "",
  customerPhone: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMode: "GPay QR Code",
  deliverySlot: "Morning",
  orderType: "Retail",
  route: "",
  zone: "",
  notes: "",
  discount: "",
  tax: "",
  receivedAmount: "",
  balanceAmount: "",
  items: [{ productId: "", name: "", quantity: "", unit: "litre", price: "" }]
};

export function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function metricValue(card) {
  if (card.type === "currency") return currency(card.value);
  if (card.type === "litre") return `${Number(card.value || 0).toFixed(1)} L`;
  return card.value;
}

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function makeCustomerForm() {
  return {
    name: "",
    phone: "",
    alternatePhone: "",
    area: "",
    zone: "",
    route: "",
    plan: "",
    locationName: "",
    latitude: "",
    longitude: "",
    mapLink: "",
    balance: "",
    cashbackBalance: "",
    supportNotes: ""
  };
}

export function makeSupplierForm() {
  return {
    name: "",
    phone: "",
    farmName: "",
    location: "",
    zone: "",
    latitude: "",
    longitude: "",
    mapLink: "",
    ratePerLitre: "",
    photoUrl: "",
    notes: ""
  };
}

export function makeProductForm() {
  return {
    name: "",
    category: "",
    unit: "",
    price: "",
    stock: "",
    fat: ""
  };
}

export function makeSupplyForm() {
  return {
    supplierId: "",
    date: new Date().toISOString().slice(0, 10),
    zone: "",
    latitude: "",
    longitude: "",
    litres: "",
    fat: "",
    ratePerLitre: ""
  };
}

export function makePaymentForm() {
  return {
    customerId: "",
    customerName: "",
    phone: "",
    route: "",
    zone: "",
    amount: "",
    method: "GPay QR Code",
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    collectedBy: "",
    status: "Received",
    notes: ""
  };
}

export function makeSupportForm() {
  return {
    name: "",
    phone: "",
    type: "Customer",
    priority: "Medium",
    subject: "",
    message: ""
  };
}

export function makeSettingsForm(settings = {}) {
  return {
    companyName: settings.companyName || "GK Dairy Company",
    companyTagline: settings.companyTagline || "",
    invoicePrefix: settings.invoicePrefix || "GKD",
    invoiceSequenceStart: String(settings.invoiceSequenceStart ?? 1),
    invoiceTitle: settings.invoiceTitle || "Bill of Supply",
    invoiceSubtitle: settings.invoiceSubtitle || "",
    companyAddress: settings.companyAddress || "",
    companyPhone: settings.companyPhone || "",
    companyEmail: settings.companyEmail || "",
    gstin: settings.gstin || "",
    fssai: settings.fssai || "",
    bankName: settings.bankName || "",
    accountName: settings.accountName || "",
    accountNumber: settings.accountNumber || "",
    ifsc: settings.ifsc || "",
    upiId: settings.upiId || "",
    qrText: settings.qrText || "",
    invoiceFooter: settings.invoiceFooter || "",
    invoiceNotes: settings.invoiceNotes || "",
    supportPhone: settings.supportPhone || "",
    supportEmail: settings.supportEmail || "",
    cashbackEnabled: Boolean(settings.cashbackEnabled),
    cashbackType: settings.cashbackType || "percentage",
    cashbackValue: String(settings.cashbackValue ?? 0),
    cashbackMinimumSpend: String(settings.cashbackMinimumSpend ?? 0)
  };
}

export function sanitizeDecimal(value) {
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function sanitizePhone(value) {
  return String(value).replace(/[^\d+]/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toWords(number) {
  const num = Math.round(Number(number || 0));
  if (!num) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const underThousand = (n) => {
    let text = "";
    if (n >= 100) {
      text += `${ones[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 20) {
      text += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    }
    if (n > 0) text += `${ones[n]} `;
    return text.trim();
  };

  const units = [["Crore", 10000000], ["Lakh", 100000], ["Thousand", 1000], ["", 1]];
  let remaining = num;
  let output = "";
  for (const [label, amount] of units) {
    if (remaining >= amount) {
      const part = Math.floor(remaining / amount);
      remaining %= amount;
      output += `${underThousand(part)}${label ? ` ${label}` : ""} `;
    }
  }
  return `${output.trim()} Rupees Only`;
}

export function printInvoice(invoiceLike, settings = {}) {
  const rows = (invoiceLike.items || []).map((item, index) => {
    const quantity = Number(item.quantity || 0).toFixed(2);
    const unitPrice = Number(item.price || 0).toFixed(2);
    const total = Number(item.total || Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2);
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.name || "")}</td>
        <td>${quantity}</td>
        <td>${escapeHtml(item.unit || "")}</td>
        <td>${unitPrice}</td>
        <td>${total}</td>
      </tr>
    `;
  }).join("");

  const subtotal = Number(invoiceLike.subtotal || 0);
  const discount = Number(invoiceLike.discount || 0);
  const gst = Number(invoiceLike.tax || 0);
  const total = Number(invoiceLike.total || subtotal - discount + gst);
  const received = Number(invoiceLike.receivedAmount || 0);
  const balance = Number(invoiceLike.balanceAmount || total - received);

  const popup = window.open("", "_blank", "width=1100,height=900");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>${escapeHtml(settings.companyName || "GK Dairy Company")} Invoice</title>
        <style>
          body { font-family: "Arial", sans-serif; margin: 18px; color: #241d16; }
          .sheet { max-width: 980px; margin: 0 auto; border: 1.5px solid #6a5647; }
          .row { display: grid; grid-template-columns: 1.1fr 1fr 1fr; border-bottom: 1px solid #8b7866; }
          .cell { padding: 10px 12px; border-right: 1px solid #8b7866; min-height: 48px; }
          .cell:last-child { border-right: 0; }
          .title-block { text-align: center; padding: 16px 12px; border-bottom: 1.5px solid #6a5647; }
          .brand { font-size: 34px; font-weight: 800; letter-spacing: 1px; }
          .subtitle { font-size: 13px; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1.4fr 1fr; border-bottom: 1.5px solid #6a5647; }
          .meta-grid > div { padding: 10px 12px; border-right: 1px solid #8b7866; }
          .meta-grid > div:last-child { border-right: 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #8b7866; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #efe5db; }
          .totals { width: 100%; border-top: 0; }
          .totals td { font-weight: 700; }
          .footer-grid { display: grid; grid-template-columns: 1.2fr .8fr; border-top: 1.5px solid #6a5647; }
          .footer-grid > div { padding: 12px; border-right: 1px solid #8b7866; min-height: 150px; }
          .footer-grid > div:last-child { border-right: 0; }
          .tiny { font-size: 11px; line-height: 1.5; }
          .signature { display: flex; justify-content: flex-end; align-items: flex-end; min-height: 130px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="title-block">
            <div class="brand">${escapeHtml(settings.companyName || "GK Dairy Company")}</div>
            <div class="subtitle">${escapeHtml(settings.invoiceTitle || "Bill of Supply")} (${escapeHtml(settings.invoiceSubtitle || "Original / Duplicate / Triplicate")})</div>
            <div class="subtitle">GSTIN: ${escapeHtml(settings.gstin || "-")} | FSSAI: ${escapeHtml(settings.fssai || "-")}</div>
            <div class="subtitle">${escapeHtml(settings.companyAddress || "-")} | ${escapeHtml(settings.companyPhone || "-")}</div>
          </div>

          <div class="meta-grid">
            <div>
              <strong>Bill To</strong><br>
              ${escapeHtml(invoiceLike.customerName || "-")}<br>
              ${escapeHtml(invoiceLike.customerPhone || "-")}<br>
              Route: ${escapeHtml(invoiceLike.route || "-")} | Zone: ${escapeHtml(invoiceLike.zone || "-")}
            </div>
            <div>
              <strong>Invoice No:</strong> ${escapeHtml(invoiceLike.invoiceNumber || "DRAFT")}<br>
              <strong>Date:</strong> ${escapeHtml(invoiceLike.date || "")}<br>
              <strong>Payment:</strong> ${escapeHtml(invoiceLike.paymentMode || "-")}<br>
              <strong>Delivery:</strong> ${escapeHtml(invoiceLike.deliverySlot || "-")}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Gross Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <table class="totals">
            <tr><td style="width:70%">Subtotal</td><td>${subtotal.toFixed(2)}</td></tr>
            <tr><td>Discount</td><td>${discount.toFixed(2)}</td></tr>
            <tr><td>GST</td><td>${gst.toFixed(2)}</td></tr>
            <tr><td>Total Invoice Amount</td><td>${total.toFixed(2)}</td></tr>
            <tr><td>Received Amount</td><td>${received.toFixed(2)}</td></tr>
            <tr><td>Balance Amount</td><td>${balance.toFixed(2)}</td></tr>
          </table>

          <div class="row">
            <div class="cell"><strong>Amount in Words</strong><br>${escapeHtml(toWords(total))}</div>
            <div class="cell"><strong>Payment Details</strong><br>GPay QR: ${escapeHtml(settings.upiId || "-")}<br>A/C: ${escapeHtml(settings.accountNumber || "-")}</div>
            <div class="cell"><strong>Bank</strong><br>${escapeHtml(settings.bankName || "-")}<br>IFSC: ${escapeHtml(settings.ifsc || "-")}</div>
          </div>

          <div class="footer-grid">
            <div class="tiny">
              ${escapeHtml(settings.invoiceNotes || "Goods once sold will not be taken back.").replace(/\n/g, "<br>")}<br><br>
              ${escapeHtml(invoiceLike.notes || settings.invoiceFooter || "").replace(/\n/g, "<br>")}
            </div>
            <div class="signature">For ${escapeHtml(settings.companyName || "GK Dairy Company")}</div>
          </div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
}
