import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteData } from "@/types/quote";
import sv from "@/i18n/sv.json";

const t = sv;

interface QuoteHeaderProps {
  data: Pick<QuoteData, "customerName" | "date" | "quoteNumber">;
  onChange: (field: "customerName" | "date" | "quoteNumber", value: string) => void;
}

export function QuoteHeader({ data, onChange }: QuoteHeaderProps) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="customerName" className="text-xs text-muted-foreground">{t.header.customer}</Label>
        <Input id="customerName" value={data.customerName} onChange={(e) => onChange("customerName", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date" className="text-xs text-muted-foreground">{t.header.date}</Label>
        <Input id="date" type="date" value={data.date} onChange={(e) => onChange("date", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quoteNumber" className="text-xs text-muted-foreground">{t.header.quoteNumber}</Label>
        <Input id="quoteNumber" value={data.quoteNumber} onChange={(e) => onChange("quoteNumber", e.target.value)} />
      </div>
    </div>
  );
}
