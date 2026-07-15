// Receipt printing for the till / thermal printer.
//
// Staff click "Print receipt" on an order in the admin dashboard. We render an
// 80mm-wide receipt into a hidden iframe and call print() on it, which opens the
// browser/OS print dialog. That means it works with any printer the machine can
// see (thermal till roll, A4, or "Save as PDF") with no drivers, SDKs or local
// print server — the staff member just picks the till printer once and it's
// remembered.
//
// The money rules here (deal-of-2 pricing, discount, 10% service charge) MUST
// stay in sync with the totals shown on the dashboard order card
// (app/admin/page.tsx) so the printed total matches what staff see on screen.

export type ReceiptItem = {
  id: number;
  name: string;
  quantity: number;
  price: number; // pence
  parentId?: number;
  uid?: string;
  parentUid?: string;
  dealOf2Price?: number;
};

export type ReceiptOrder = {
  id: number;
  table_number: number;
  items: ReceiptItem[];
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  discount_percent?: number;
  discount_reason?: string | null;
};

const PUB = {
  name: "The Marsh Harrier",
  addressLines: ["40 Marsh Road", "Cowley, Oxford", "OX4 2HH"],
  phone: "01865 718225",
};

const SERVICE_CHARGE_RATE = 0.1; // 10% — matches app/admin/page.tsx

function itemLineTotal(item: ReceiptItem): number {
  if (item.dealOf2Price && item.quantity >= 2) {
    const pairs = Math.floor(item.quantity / 2);
    const remainder = item.quantity % 2;
    return pairs * item.dealOf2Price + remainder * item.price;
  }
  return item.price * item.quantity;
}

function penceToGBP(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDateTime(iso: string): string {
  // Stored timestamps are UTC without a zone marker (see app/admin/page.tsx).
  const d = new Date(iso + "Z");
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Flatten the order's items into printed rows, nesting modifiers/toppings under
// their parent line — the same parent/child logic the dashboard uses.
function renderItemRows(items: ReceiptItem[]): string {
  const hasUid = items.some((it) => it.uid);
  const parentIds = new Set(items.map((it) => it.id));
  const isTopLevel = (it: ReceiptItem) =>
    hasUid ? !it.parentUid : it.parentId === undefined || !parentIds.has(it.parentId);

  const rows: string[] = [];
  for (const item of items.filter(isTopLevel)) {
    rows.push(
      `<div class="row">` +
        `<span class="name">${item.quantity}× ${escapeHtml(item.name)}</span>` +
        `<span class="amt">${penceToGBP(itemLineTotal(item))}</span>` +
        `</div>`,
    );
    const children = items.filter((c) =>
      hasUid ? c.parentUid !== undefined && c.parentUid === item.uid : c.parentId === item.id,
    );
    for (const c of children) {
      rows.push(
        `<div class="row child">` +
          `<span class="name">+ ${c.quantity}× ${escapeHtml(c.name)}</span>` +
          `<span class="amt">${penceToGBP(itemLineTotal(c))}</span>` +
          `</div>`,
      );
    }
  }
  return rows.join("");
}

export function buildReceiptHTML(order: ReceiptOrder): string {
  const grossSubtotal = order.items.reduce((s, i) => s + itemLineTotal(i), 0);
  const discountPct = Number(order.discount_percent ?? 0);
  const discountAmount = Math.round((grossSubtotal * discountPct) / 100);
  const subtotal = grossSubtotal - discountAmount;
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const total = subtotal + serviceCharge;

  const heading =
    order.table_number === 0 ? "Takeaway" : `Table ${order.table_number}`;

  const customerBlock =
    order.customer_name || order.customer_phone
      ? `<div class="meta">${
          order.customer_name ? escapeHtml(order.customer_name) : ""
        }${order.customer_phone ? ` · ${escapeHtml(order.customer_phone)}` : ""}</div>`
      : "";

  const discountRow =
    discountPct > 0
      ? `<div class="row"><span class="name">Discount (${discountPct}%)${
          order.discount_reason ? ` ${escapeHtml(order.discount_reason)}` : ""
        }</span><span class="amt">−${penceToGBP(discountAmount)}</span></div>`
      : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt — Order #${order.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 80mm;
    padding: 4mm 3mm 6mm;
    font-family: "Courier New", ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.35;
    color: #000;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .pub-name { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
  .pub-addr { font-size: 11px; }
  .heading { font-size: 15px; font-weight: 700; margin-top: 2mm; }
  .meta { font-size: 11px; }
  .rule { border-top: 1px dashed #000; margin: 2mm 0; }
  .row { display: flex; justify-content: space-between; gap: 6px; }
  .row .name { flex: 1; word-break: break-word; }
  .row .amt { white-space: nowrap; text-align: right; }
  .row.child .name { padding-left: 3mm; font-size: 11px; }
  .row.child .amt { font-size: 11px; }
  .total { font-size: 15px; font-weight: 700; }
  .muted { font-size: 11px; }
  .footer { margin-top: 3mm; font-size: 11px; }
</style>
</head>
<body>
  <div class="center pub-name">${escapeHtml(PUB.name)}</div>
  <div class="center pub-addr">${PUB.addressLines.map(escapeHtml).join("<br/>")}</div>
  <div class="center pub-addr">Tel ${escapeHtml(PUB.phone)}</div>

  <div class="rule"></div>

  <div class="center heading">${heading}</div>
  <div class="center meta">Order #${order.id} · ${formatDateTime(order.created_at)}</div>
  ${customerBlock ? `<div class="center">${customerBlock}</div>` : ""}

  <div class="rule"></div>

  ${renderItemRows(order.items)}

  <div class="rule"></div>

  <div class="row"><span class="name">Subtotal</span><span class="amt">${penceToGBP(grossSubtotal)}</span></div>
  ${discountRow}
  <div class="row muted"><span class="name">Service charge (10%)</span><span class="amt">${penceToGBP(serviceCharge)}</span></div>

  <div class="rule"></div>

  <div class="row total"><span class="name">TOTAL</span><span class="amt">${penceToGBP(total)}</span></div>

  <div class="rule"></div>

  <div class="center footer">Thank you — see you again soon.</div>
</body>
</html>`;
}

// Print the receipt via a hidden iframe. Using an iframe (rather than a popup
// window) avoids pop-up blockers and keeps the main dashboard untouched.
export function printReceipt(order: ReceiptOrder): void {
  if (typeof window === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const cleanup = () => {
    // Delay removal so the print dialog has fully taken over the document.
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    cleanup();
    return;
  }

  doc.open();
  doc.write(buildReceiptHTML(order));
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    cleanup();
    return;
  }

  const triggerPrint = () => {
    win.focus();
    // onafterprint fires whether the user prints or cancels, so it's a safe
    // place to tear down the iframe.
    win.onafterprint = cleanup;
    try {
      win.print();
    } catch {
      cleanup();
    }
  };

  // Give the browser a tick to lay out the written document before printing.
  if (doc.readyState === "complete") {
    setTimeout(triggerPrint, 50);
  } else {
    win.onload = () => setTimeout(triggerPrint, 50);
  }
}
