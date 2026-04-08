import type { QuoteData } from "@/types/quote";

export function generateMockQuote(inputText: string): QuoteData {
  const today = new Date();
  const quoteNumber = `QR-${today.getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  return {
    customerName: "Sundsvalls Kommun",
    date: today.toISOString().split("T")[0],
    quoteNumber,
    summary:
      "The customer is requesting playground equipment for a new outdoor area targeting children ages 3–12. They need durable, safety-certified products suitable for Nordic climate conditions.",
    products: [
      {
        id: crypto.randomUUID(),
        name: "Adventure Climbing Frame",
        description: "Multi-level climbing structure with slides and rope bridges, ages 6–12",
        quantity: 1,
        price: 28500,
      },
      {
        id: crypto.randomUUID(),
        name: "Toddler Swing Set (4-seat)",
        description: "Safety-harness swing set for ages 1–5, galvanized steel frame",
        quantity: 2,
        price: 8900,
      },
      {
        id: crypto.randomUUID(),
        name: "Sandbox with Canopy",
        description: "Large sandbox with UV-protective canopy, includes cover",
        quantity: 1,
        price: 4200,
      },
      {
        id: crypto.randomUUID(),
        name: "Rubber Safety Surfacing (m²)",
        description: "Impact-absorbing rubber tiles, EN 1177 certified",
        quantity: 60,
        price: 350,
      },
    ],
    quoteText: `Dear Customer,

Thank you for your inquiry regarding playground equipment. Based on your requirements, we have prepared the following quote for your consideration.

All products listed are EN 1176 safety-certified and designed for Nordic weather conditions. Installation and delivery are included in the pricing. A 2-year warranty applies to all structural components.

We are happy to arrange a site visit to discuss placement and customization options. Please do not hesitate to reach out with any questions.

Best regards,
Playground Solutions Team`,
  };
}
