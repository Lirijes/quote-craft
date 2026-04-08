import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { QuoteCharge } from "@/types/quote";
import { useI18n } from "@/i18n/I18nProvider";

interface ChargesTableProps {
  charges: QuoteCharge[];
  onChange: (charges: QuoteCharge[]) => void;
  productTotal: number;
}

export function ChargesTable({ charges, onChange, productTotal }: ChargesTableProps) {
  const { t } = useI18n();

  const updateCharge = (id: string, field: keyof QuoteCharge, value: string | number) => {
  onChange(
      charges.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]:
                field === "amount"
                  ? Number(value) || 0
                  : value,
            }
          : c
      )
    );
  };

  const addCharge = () => {
    onChange([...charges, { id: crypto.randomUUID(), label: "", amount: 0 }]);
  };

  const removeCharge = (id: string) => {
    onChange(charges.filter((c) => c.id !== id));
  };

  const chargesTotal = charges.reduce((sum, c) => sum + c.amount, 0);
  const grandTotal = productTotal + chargesTotal;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.charges.heading}</h3>
        <Button variant="outline" size="sm" onClick={addCharge}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t.charges.addRow}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground text-xs">
              <th className="text-left p-3 font-medium">{t.charges.descriptionCol}</th>
              <th className="text-right p-3 font-medium w-36">{t.charges.amountCol}</th>
              <th className="w-10 p-3" />
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border bg-muted/20">
              <td className="p-3 text-muted-foreground">{t.charges.subtotal}</td>
              <td className="p-3 text-right font-medium tabular-nums">{productTotal.toLocaleString("sv-SE")} kr</td>
              <td />
            </tr>
            {charges.map((charge) => (
              <tr key={charge.id} className="border-t border-border">
                <td className="p-2">
                  <Input className="h-8 text-sm" value={charge.label} onChange={(e) => updateCharge(charge.id, "label", e.target.value)} placeholder={t.charges.placeholder} />
                </td>
                <td className="p-2">
                  <Input type="number" className="w-36 h-8 text-sm text-right" value={charge.amount} onChange={(e) => updateCharge(charge.id, "amount", parseFloat(e.target.value) || 0)} />
                </td>
                <td className="p-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCharge(charge.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-foreground/20">
              <td className="p-3 text-right text-sm font-semibold text-muted-foreground">{t.charges.grandTotal}</td>
              <td className="p-3 text-right font-bold text-base tabular-nums">{grandTotal.toLocaleString("sv-SE")} kr</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
