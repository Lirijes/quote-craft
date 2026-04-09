import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { QuoteHeader } from "./QuoteHeader";
import { ProductTable } from "./ProductTable";
import { ChargesTable } from "./ChargesTable";
import type { QuoteData } from "@/types/quote";
import { exportQuotePdf } from "@/lib/export-pdf";
import sv from "@/i18n/sv.json";

const t = sv;

interface QuoteResultProps {
  initialData: QuoteData;
}

export function QuoteResult({ initialData }: QuoteResultProps) {
  const [data, setData] = useState<QuoteData>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const updateField = <K extends keyof QuoteData>(field: K, value: QuoteData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const productTotal = data.products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{t.result.heading}</h2>
        <Button onClick={() => exportQuotePdf(data)} variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          {t.result.exportPdf}
        </Button>
      </div>

      <QuoteHeader data={data} onChange={(field, value) => updateField(field, value)} />

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t.result.summaryLabel}</Label>
        <Textarea
          className="text-sm resize-y min-h-[80px]"
          value={data.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          placeholder="Skriv en sammanfattning av förfrågan..."
        />
      </div>

      <ProductTable products={data.products} onChange={(products) => updateField("products", products)} />

      <ChargesTable charges={data.charges} onChange={(charges) => updateField("charges", charges)} productTotal={productTotal} />

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t.result.quoteMessageLabel}</Label>
        <Textarea
          className="text-sm resize-y min-h-[160px]"
          value={data.quoteText}
          onChange={(e) => updateField("quoteText", e.target.value)}
          placeholder="Skriv offertmeddelande här..."
        />
      </div>
    </Card>
  );
}
