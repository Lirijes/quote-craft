import type { QuoteData } from "@/types/quote";

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
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
  doc.text("READYMADE AB", margin, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Offertnr: ${data.quoteNumber}`, pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text(`Datum: ${data.date}`, pageWidth - margin, y, { align: "right" });
  y += 12;

  // Customer
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Kund:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName, margin + 22, y);
  y += 10;

  // Summary
  doc.setFont("helvetica", "bold");
  doc.text("Sammanfattning", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 8;

  // Product table header
  const colX = {
    qty: margin,
    desc: margin + 12,
    img: margin + 80,
    price: pageWidth - margin - 50,
    total: pageWidth - margin - 20,
  };

  doc.setFillColor(240, 240, 243);
  doc.rect(margin, y - 4, contentWidth, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Antal", colX.qty, y);
  doc.text("Beskrivning", colX.desc, y);
  doc.text("Bild", colX.img, y);
  doc.text("Á-pris", colX.price, y);
  doc.text("Summa", colX.total, y);
  y += 7;

  // Product rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Pre-load all images
  const imageDataUrls: (string | null)[] = await Promise.all(
    data.products.map((p) => (p.imageUrl ? loadImageAsDataUrl(p.imageUrl) : Promise.resolve(null)))
  );

  const imgSize = 18; // mm

  for (let i = 0; i < data.products.length; i++) {
    const product = data.products[i];
    const hasImage = !!imageDataUrls[i];
    const rowHeight = hasImage ? imgSize + 2 : 6;

    if (y + rowHeight > 270) {
      doc.addPage();
      y = 25;
    }

    const textY = hasImage ? y + imgSize / 2 + 1 : y;

    doc.text(String(product.quantity), colX.qty, textY);
    doc.text(product.description.substring(0, 35), colX.desc, textY);
    doc.text(`${product.price.toLocaleString("sv-SE")}`, colX.price, textY);
    doc.text(`${(product.quantity * product.price).toLocaleString("sv-SE")} kr`, colX.total, textY);

    if (imageDataUrls[i]) {
      try {
        doc.addImage(imageDataUrls[i]!, "JPEG", colX.img, y - 2, imgSize, imgSize);
      } catch {
        // skip if image format not supported
      }
    }

    y += rowHeight;
  }

  // Products subtotal
  const productTotal = data.products.reduce((s, p) => s + p.quantity * p.price, 0);
  y += 2;
  doc.setDrawColor(180);
  doc.line(colX.price, y - 4, pageWidth - margin, y - 4);
  doc.setFontSize(9);
  doc.text("Produkter delsumma:", colX.price - 5, y);
  doc.text(`${productTotal.toLocaleString("sv-SE")} kr`, colX.total, y);
  y += 7;

  // Additional charges
  for (const charge of data.charges) {
    if (y > 260) {
      doc.addPage();
      y = 25;
    }

    let amount = typeof charge.amount === "number" ? charge.amount : parseFloat(String(charge.amount).replace(/[^0-9.\-]/g, "")) || 0;

    if (charge.id === "discount") {
      amount = -Math.abs(amount);
    }

    const label = String(charge.label || "—");
    const amountStr = amount.toLocaleString("sv-SE") + " kr";

    doc.text(label, colX.qty, y);
    doc.text(amountStr, colX.total, y);

    y += 6;
  }

  // Grand total
  const chargesTotal = data.charges.reduce((s, c) => {
    const a = typeof c.amount === "number" ? c.amount : parseFloat(String(c.amount).replace(/[^0-9.\-]/g, "")) || 0;
    return s + (c.id === "discount" ? -Math.abs(a) : a);
  }, 0);
  const grandTotal = productTotal + chargesTotal;
  y += 2;
  doc.setDrawColor(100);
  doc.line(colX.price, y - 4, pageWidth - margin, y - 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total (ex. Moms):", colX.price - 5, y);
  doc.text(`${grandTotal.toLocaleString("sv-SE")} kr`, colX.total, y);
  y += 14;

  // Offert text
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
