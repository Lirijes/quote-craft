import { useState } from "react";
import { RequestInput } from "@/components/quote/RequestInput";
import { QuoteResult } from "@/components/quote/QuoteResult";
import { generateMockQuote } from "@/lib/mock-data";
import type { QuoteData } from "@/types/quote";
import { FileText } from "lucide-react";

const Index = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (text: string) => {
    setIsGenerating(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));
    const data = generateMockQuote(text);
    setQuoteData(data);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground">Quote Builder</h1>
          <span className="text-xs text-muted-foreground ml-1">Internal Tool</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <RequestInput onGenerate={handleGenerate} isGenerating={isGenerating} />
        {quoteData && <QuoteResult initialData={quoteData} />}
      </main>
    </div>
  );
};

export default Index;
