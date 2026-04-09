import { useState } from "react";
import { RequestInput } from "@/components/quote/RequestInput";
import { QuoteResult } from "@/components/quote/QuoteResult";
import type { QuoteData } from "@/types/quote";
import { FileText } from "lucide-react";
import sv from "@/i18n/sv.json";

const t = sv;

const emptyQuoteData: QuoteData = {
  customerName: "",
  date: new Date().toISOString().split("T")[0],
  quoteNumber: "",
  summary: "",
  products: [{ id: "p0", name: "", description: "", quantity: 1, price: 0, imageUrl: "" }],
  charges: [
    { id: "shipping", label: "Frakt", amount: 0 },
    { id: "installation", label: "Installation / Montage", amount: 0 },
    { id: "discount", label: "Rabatt", amount: 0 },
  ],
  quoteText: "",
};

export default function Index() {
  const [quoteData, setQuoteData] = useState<QuoteData>(emptyQuoteData);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (text: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/generate-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText: text }),
      });
      if (!response.ok) throw new Error('Failed to generate quote');
      const apiData = await response.json();
      const mappedQuoteData: QuoteData = {
        customerName: 'Customer',
        date: new Date().toISOString().split('T')[0],
        quoteNumber: `Q${Date.now()}`,
        summary: apiData.summary,
        products: apiData.products.map((p: any, index: number) => ({
          id: `p${index}`,
          name: p.name,
          description: '',
          quantity: p.quantity,
          price: p.price,
        })),
        charges: [
          { id: 'shipping', label: 'Frakt', amount: apiData.shipping },
          { id: 'installation', label: 'Installation / Montage', amount: apiData.installation },
          { id: 'discount', label: 'Rabatt', amount: apiData.discount },
        ],
        quoteText: text,
      };
      setQuoteData(mappedQuoteData);
    } catch (error) {
      console.error('Error generating quote:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground">{t.app.title}</h1>
          <span className="text-xs text-muted-foreground ml-1">{t.app.subtitle}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <RequestInput onGenerate={handleGenerate} isGenerating={isGenerating} />
        <QuoteResult initialData={quoteData} />
      </main>
    </div>
  );
}
