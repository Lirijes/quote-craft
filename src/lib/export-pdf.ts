import type { QuoteData } from "@/types/quote";

export async function exportQuotePdf(data: QuoteData) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTE", margin, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Quote #: ${data.quoteNumber}`, pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text(`Date: ${data.date}`, pageWidth - margin, y, { align: "right" });
  y += 12;

  // Customer
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Customer:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName, margin + 22, y);
  y += 10;

  // Summary
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 8;

  // Product table header
  const colX = {
    qty: margin,
    name: margin + 15,
    desc: margin + 55,
    price: pageWidth - margin - 50,
    total: pageWidth - margin - 22,
  };

  doc.setFillColor(240, 240, 243);
  doc.rect(margin, y - 4, contentWidth, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("QTY", colX.qty, y);
  doc.text("PRODUCT", colX.name, y);
  doc.text("DESCRIPTION", colX.desc, y);
  doc.text("PRICE", colX.price, y);
  doc.text("TOTAL", colX.total, y);
  y += 7;

  // Product rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const product of data.products) {
    if (y > 260) {
      doc.addPage();
      y = 25;
    }
    doc.text(String(product.quantity), colX.qty, y);
    doc.text(product.name.substring(0, 20), colX.name, y);
    doc.text(product.description.substring(0, 30), colX.desc, y);
    doc.text(`${product.price.toLocaleString("sv-SE")}`, colX.price, y);
    doc.text(`${(product.quantity * product.price).toLocaleString("sv-SE")} kr`, colX.total, y);
    y += 6;
  }

  // Products subtotal
  const productTotal = data.products.reduce((s, p) => s + p.quantity * p.price, 0);
  y += 2;
  doc.setDrawColor(180);
  doc.line(colX.price, y - 4, pageWidth - margin, y - 4);
  doc.setFontSize(9);
  doc.text("Products subtotal:", colX.price, y);
  doc.text(`${productTotal.toLocaleString("sv-SE")} kr`, colX.total, y);
  y += 7;

  // Additional charges
  for (const charge of data.charges) {
    if (y > 260) {
      doc.addPage();
      y = 25;
    }
    doc.text(charge.label || "—", colX.price, y);
    doc.text(`${charge.amount.toLocaleString("sv-SE")} kr`, colX.total, y);
    y += 6;
  }

  // Grand total
  const chargesTotal = data.charges.reduce((s, c) => s + c.amount, 0);
  const grandTotal = productTotal + chargesTotal;
  y += 2;
  doc.setDrawColor(100);
  doc.line(colX.price, y - 4, pageWidth - margin, y - 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total (excl. VAT):", colX.price, y);
  doc.text(`${grandTotal.toLocaleString("sv-SE")} kr`, colX.total, y);
  y += 14;

  // Quote text
  if (y > 230) {
    doc.addPage();
    y = 25;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const quoteLines = doc.splitTextToSize(data.quoteText, contentWidth);
  doc.text(quoteLines, margin, y);

  doc.save(`${data.quoteNumber}.pdf`);
}
