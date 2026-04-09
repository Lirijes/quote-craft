import type { QuoteData } from "@/types/quote";

const VAT_RATE = 0.25;

// Safely coerce any runtime value (string, quoted string, "0 kr", etc.) to a
// finite number. TypeScript types charge amounts as `number`, but the AI
// backend can return strings.
function toNum(v: unknown): number {
  if (typeof v === "number" && isFinite(v)) return v;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? n : 0;
}

// jsPDF's built-in fonts (helvetica, etc.) only support Latin-1 (0x00–0xFF).
// toLocaleString("sv-SE") emits:
//   U+2212 MINUS SIGN           for negative numbers  → outside Latin-1 → corruption
//   U+202F NARROW NO-BREAK SPACE as thousands sep     → outside Latin-1 → corruption
// Replace both with their plain-ASCII equivalents before passing to doc.text().
function fmt(n: number): string {
  return n
    .toLocaleString("sv-SE")
    .replace(/\u2212/g, "-")           // Unicode minus → hyphen-minus
    .replace(/[\u00a0\u202f]/g, " ");  // Any non-breaking space → regular space
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null; // graceful 404 / error fallback
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportQuotePdf(data: QuoteData, showVat = false) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();  // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm (A4)
  const margin     = 20;
  const rightEdge  = pageWidth - margin;               // 190mm
  const contentWidth = pageWidth - margin * 2;         // 170mm
  const lineH      = 4.5;                              // baseline-to-baseline (mm)
  let y = 18;

  // ── LOGO / HEADER ──────────────────────────────────────────────────────────
  // Load /logo.png from the public folder. Returns null on 404 → falls back
  // to the company name as text. Place a logo.png in /public to activate it.
  const logoData = await loadImageAsDataUrl("/rm-logo104923.png");
  const headerTopY = y;

  if (logoData) {
    try {
      // Scale proportionally to 45mm wide
      const imgProps = doc.getImageProperties(logoData);
      const logoW = 45;
      const logoH = (imgProps.height * logoW) / imgProps.width;
      doc.addImage(logoData, imgProps.fileType || "PNG", margin, headerTopY - 3, logoW, logoH);
    } catch {
      // Unsupported format – fall through to text
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("READYMADE AB", margin, headerTopY + 6);
    }
  } else {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("READYMADE AB", margin, headerTopY + 6);
  }

  // Right-aligned info block: Offertnr, Datum, Kund – all at rightEdge
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Offertnr: ${data.quoteNumber}`, rightEdge, headerTopY,      { align: "right" });
  doc.text(`Datum: ${data.date}`,           rightEdge, headerTopY + 5,  { align: "right" });
  doc.text(`Kund: ${data.customerName}`,    rightEdge, headerTopY + 10, { align: "right" });

  y = headerTopY + 22;

  // ── SUMMARY TEXT ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Sammanfattning", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * lineH + 8;

  // ── PRODUCT TABLE ──────────────────────────────────────────────────────────
  // 6 columns across the full 170mm content width:
  //   Littra 18 | Antal 12 | Beskrivning 57 | Bild 22 | Á-pris 31 | Summa 30
  //   18 + 12 + 57 + 22 + 31 + 30 = 170mm ✓
  //
  // littraL / qtyL / descL / imgL are LEFT edges.
  // priceR / totalR are RIGHT edges (text rendered with { align: "right" }).
  const col = {
    littraL: margin + 2,         // 22mm
    qtyL:    margin + 18,    // 38mm
    descL:   margin + 30,    // 50mm
    descW:   57,             // max text width for description wrapping
    imgL:    margin + 87,    // 107mm
    priceR:  margin + 140,   // 160mm  ← right edge of Á-pris column
    totalR:  rightEdge -5,      // 195mm  ← right edge of Summa column
  };

  // Table header background + column labels
  doc.setFillColor(60, 91, 113); // dark blue
  doc.rect(margin, y - 4, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Littra",      col.littraL, y);
  doc.text("Antal",       col.qtyL,    y);
  doc.text("Beskrivning", col.descL,   y);
  doc.text("Bild",        col.imgL,    y);
  doc.text("A-pris",      col.priceR,  y, { align: "right" });
  doc.text("Summa",       col.totalR,  y, { align: "right" });
  y += 7;

  doc.setTextColor(0, 0, 0);

  // Pre-load all product images in parallel
  const imageDataUrls: (string | null)[] = await Promise.all(
    data.products.map((p) => (p.imageUrl ? loadImageAsDataUrl(p.imageUrl) : Promise.resolve(null)))
  );

  const imgSize = 18; // mm

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (let i = 0; i < data.products.length; i++) {
    const product  = data.products[i];
    const hasImage = !!imageDataUrls[i];

    // Wrap the description to fit the column; row height adapts to the taller
    // of the wrapped text or the image.
    const descLines = doc.splitTextToSize(product.description || "", col.descW);
    const textH     = descLines.length * lineH;
    const rowHeight  = hasImage ? Math.max(imgSize + 4, textH + 4) : textH + 4;

    if (y + rowHeight > 270) { doc.addPage(); y = 25; }

    // First text baseline inside the row
    const baseY = y + lineH;

    doc.text(product.littra ?? "",                          col.littraL, baseY);
    doc.text(String(product.quantity),                      col.qtyL,    baseY);
    doc.text(descLines,                                     col.descL,   baseY);
    doc.text(fmt(product.price),                            col.priceR,  baseY, { align: "right" });
    doc.text(fmt(product.quantity * product.price) + " kr", col.totalR,  baseY, { align: "right" });

    if (imageDataUrls[i]) {
      try {
        doc.addImage(imageDataUrls[i]!, "JPEG", col.imgL, y + 1, imgSize, imgSize);
      } catch { /* skip unsupported image format */ }
    }

    y += rowHeight;
  }

  // ── SUMMARY BLOCK ──────────────────────────────────────────────────────────
  // All rows share the same two X positions:
  //   sumL = left edge of the label   (~85mm of space for label + value)
  //   sumR = right edge of the value  (= rightEdge = 190mm)
  const sumL = pageWidth - margin - 85; // 105mm
  const sumR = rightEdge;               // 190mm

  const productTotal = data.products.reduce((s, p) => s + p.quantity * p.price, 0);

  // Separator line + subtotal row
  y += 2;
  doc.setDrawColor(180);
  doc.line(sumL, y - 3, sumR, y - 3);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Produkter delsumma:", sumL, y);
  doc.text(fmt(productTotal) + " kr", sumR, y, { align: "right" });
  y += 6;

  // One row per charge (Frakt, Installation / Montage, Rabatt, …)
  for (const charge of data.charges) {
    if (y > 260) { doc.addPage(); y = 25; }
    const raw    = toNum(charge.amount);
    const amount = charge.id === "discount" ? -Math.abs(raw) : raw;
    doc.text(charge.label || "-",  sumL, y);
    doc.text(fmt(amount) + " kr",  sumR, y, { align: "right" });
    y += 6;
  }

  // Grand total (excl. VAT)
  const chargesTotal = data.charges.reduce((s, c) => {
    const a = toNum(c.amount);
    return s + (c.id === "discount" ? -Math.abs(a) : a);
  }, 0);
  const grandTotal = productTotal + chargesTotal;

  y += 1;
  doc.setDrawColor(100);
  doc.line(sumL, y - 3, sumR, y - 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total (ex. Moms):", sumL, y);
  doc.text(fmt(grandTotal) + " kr", sumR, y, { align: "right" });
  y += 8;

  // Optional VAT rows
  if (showVat) {
    const vatAmount    = grandTotal * VAT_RATE;
    const totalInclVat = grandTotal + vatAmount;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Moms (25%):",        sumL, y);
    doc.text(fmt(vatAmount) + " kr", sumR, y, { align: "right" });
    y += 6;

    doc.setDrawColor(100);
    doc.line(sumL, y - 2, sumR, y - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total (inkl. Moms):",     sumL, y + 4);
    doc.text(fmt(totalInclVat) + " kr", sumR, y + 4, { align: "right" });
    y += 12;
  } else {
    y += 6;
  }

  // ── QUOTE TEXT ─────────────────────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 25; }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const quoteLines = doc.splitTextToSize(data.quoteText, contentWidth);
  doc.text(quoteLines, margin, y);

  // ── FOOTER (stamped on every page after all content is drawn) ─────────────
  // Drawing footers last means y-position tracking is never affected.
  const totalPages = doc.getNumberOfPages();
  const footerY    = pageHeight - 10;

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(150);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 3, rightEdge, footerY - 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "Web: lekplats.se | Tel: 031 - 550 700 | info@lekplats.se | Org.nr: 556871 7960",
      margin,
      footerY
    );
    doc.text(`Sida ${p}`, rightEdge, footerY, { align: "right" });
  }

  doc.save(`${data.quoteNumber}.pdf`);
}
