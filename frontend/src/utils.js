const configuredApiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");
export const API_BASE = configuredApiBase ? `${configuredApiBase}/api` : "/api";

export const dairyImages = {
  hero: "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1600&q=80",
  field: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80",
  milk: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=1400&q=80"
};

export const defaultInvoiceForm = {
  customerId: "",
  customerName: "",
  customerPhone: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMode: "",
  deliverySlot: "",
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
    method: "",
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    collectedBy: "",
    status: "Received",
    notes: ""
  };
}

export function sanitizeDecimal(value) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function sanitizePhone(value) {
  return value.replace(/[^\d+]/g, "");
}

function toWords(number) {
  const num = Math.round(Number(number || 0));
  if (!num) return "Zero Rupees Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const underThousand = (n) => {
    let str = "";
    if (n >= 100) {
      str += `${ones[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 20) {
      str += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    }
    if (n > 0) str += `${ones[n]} `;
    return str.trim();
  };

  const units = [["Crore", 10000000], ["Lakh", 100000], ["Thousand", 1000], ["", 1]];
  let remaining = num;
  let out = "";
  for (const [label, amount] of units) {
    if (remaining >= amount) {
      const part = Math.floor(remaining / amount);
      remaining %= amount;
      out += `${underThousand(part)}${label ? ` ${label}` : ""} `;
    }
  }
  return `${out.trim()} Rupees Only`;
}

export function printInvoice(invoiceLike) {
  const rows = (invoiceLike.items || [])
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name || ""}</td>
        <td>${Number(item.quantity || 0).toFixed(2)}</td>
        <td>${item.unit || ""}</td>
        <td>${Number(item.price || 0).toFixed(2)}</td>
        <td>${Number(item.total || Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const subtotal = Number(invoiceLike.subtotal || 0);
  const discount = Number(invoiceLike.discount || 0);
  const gst = Number(invoiceLike.tax || 0);
  const total = Number(invoiceLike.total || subtotal - discount + gst);
  const received = Number(invoiceLike.receivedAmount || 0);
  const balance = Number(invoiceLike.balanceAmount || total - received);

  const popup = window.open("", "_blank", "width=1000,height=800");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1d2d23; }
          .shell { max-width: 920px; margin: 0 auto; }
          .top { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
          .title { font-size: 24px; font-weight: 800; color: #13462f; }
          .meta { font-size: 13px; color: #4f6358; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d6e4d8; padding: 8px; text-align: left; font-size: 13px; }
          th { background: #eff6f0; }
          .summary-box { margin-top: 14px; border: 1px solid #cddfd0; border-radius: 10px; overflow: hidden; }
          .summary-row { display: grid; grid-template-columns: 1fr 140px 140px; }
          .summary-row div { padding: 8px 10px; border-top: 1px solid #dce8de; font-size: 13px; }
          .summary-row:first-child div { border-top: 0; }
          .amount-box { margin-top: 16px; border: 1px solid #cddfd0; border-radius: 12px; padding: 12px; }
          .amount-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
          .amount-cell { border: 1px solid #dce8de; border-radius: 10px; padding: 10px; min-height: 60px; }
          .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
          .sign-box { border-top: 1px solid #90a99a; padding-top: 10px; text-align: center; min-height: 40px; }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="top">
            <div>
              <div class="title">Dairy Invoice</div>
              <div class="meta">Customer: ${invoiceLike.customerName || "-"}</div>
              <div class="meta">Phone: ${invoiceLike.customerPhone || "-"}</div>
              <div class="meta">Route: ${invoiceLike.route || "-"} | Zone: ${invoiceLike.zone || "-"}</div>
            </div>
            <div class="meta">
              <div>Invoice No: ${invoiceLike.invoiceNumber || "DRAFT"}</div>
              <div>Date: ${invoiceLike.date || ""}</div>
              <div>Payment: ${invoiceLike.paymentMode || "-"}</div>
            </div>
          </div>

          <table>
            <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="summary-box">
            <div class="summary-row"><div>Subtotal</div><div></div><div>${subtotal.toFixed(2)}</div></div>
            <div class="summary-row"><div>Discount</div><div></div><div>${discount.toFixed(2)}</div></div>
            <div class="summary-row"><div>GST</div><div></div><div>${gst.toFixed(2)}</div></div>
            <div class="summary-row"><div>Net Amount</div><div></div><div>${total.toFixed(2)}</div></div>
          </div>

          <div class="amount-box">
            <div><strong>Amount in Words:</strong> ${toWords(total)}</div>
            <div class="amount-grid">
              <div class="amount-cell"><strong>Received Amount</strong><br>${received.toFixed(2)}</div>
              <div class="amount-cell"><strong>Balance Amount</strong><br>${balance.toFixed(2)}</div>
              <div class="amount-cell"><strong>Notes</strong><br>${invoiceLike.notes || "-"}</div>
            </div>
          </div>

          <div class="sign-grid">
            <div class="sign-box">Customer Signature</div>
            <div class="sign-box">Authorized Signature</div>
          </div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
}
