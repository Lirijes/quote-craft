import { I18nProvider } from "@/i18n/I18nProvider";
import { useState } from "react";
import { RequestInput } from "@/components/quote/RequestInput";
import { QuoteResult } from "@/components/quote/QuoteResult";
import { generateMockQuote } from "@/lib/mock-data";
import type { QuoteData } from "@/types/quote";
import { FileText } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";

function IndexContent() {
  const { t } = useI18n();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (text: string) => {
    setIsGenerating(true);
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
          <h1 className="text-base font-semibold text-foreground">{t.app.title}</h1>
          <span className="text-xs text-muted-foreground ml-1">{t.app.subtitle}</span>
          <div className="flex-1" />
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <RequestInput onGenerate={handleGenerate} isGenerating={isGenerating} />
        {quoteData && <QuoteResult initialData={quoteData} />}
      </main>
    </div>
  );
}

const Index = () => (
  <I18nProvider>
    <IndexContent />
  </I18nProvider>
);

export default Index;
