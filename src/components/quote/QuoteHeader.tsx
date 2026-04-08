import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteData } from "@/types/quote";

interface QuoteHeaderProps {
  data: Pick<QuoteData, "customerName" | "date" | "quoteNumber">;
  onChange: (field: "customerName" | "date" | "quoteNumber", value: string) => void;
}

export function QuoteHeader({ data, onChange }: QuoteHeaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="customerName" className="text-xs text-muted-foreground">Customer</Label>
        <Input
          id="customerName"
          value={data.customerName}
          onChange={(e) => onChange("customerName", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
        <Input
          id="date"
          type="date"
          value={data.date}
          onChange={(e) => onChange("date", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quoteNumber" className="text-xs text-muted-foreground">Quote #</Label>
        <Input
          id="quoteNumber"
          value={data.quoteNumber}
          onChange={(e) => onChange("quoteNumber", e.target.value)}
        />
      </div>
    </div>
  );
}
