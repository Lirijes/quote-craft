import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import type { QuoteProduct } from "@/types/quote";
import { useI18n } from "@/i18n/I18nProvider";

interface ProductTableProps {
  products: QuoteProduct[];
  onChange: (products: QuoteProduct[]) => void;
}

export function ProductTable({ products, onChange }: ProductTableProps) {
  const { t } = useI18n();

  const updateProduct = (id: string, field: keyof QuoteProduct, value: string | number) => {
    onChange(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addProduct = () => {
    onChange([...products, { id: crypto.randomUUID(), name: "", description: "", quantity: 1, price: 0 }]);
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
  };

  const handleImageUpload = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    onChange(products.map((p) => (p.id === id ? { ...p, imageUrl: url } : p)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.products.heading}</h3>
        <Button variant="outline" size="sm" onClick={addProduct}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t.products.addRow}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs">
                <th className="text-left p-3 font-medium w-16">{t.products.qty}</th>
                <th className="text-left p-3 font-medium">{t.products.product}</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">{t.products.description}</th>
                <th className="text-center p-3 font-medium w-20">{t.products.image}</th>
                <th className="text-right p-3 font-medium w-28">{t.products.unitPrice}</th>
                <th className="text-right p-3 font-medium w-28">{t.products.total}</th>
                <th className="w-10 p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onImageUpload={handleImageUpload}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onUpdate,
  onRemove,
  onImageUpload,
}: {
  product: QuoteProduct;
  onUpdate: (id: string, field: keyof QuoteProduct, value: string | number) => void;
  onRemove: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <tr className="border-t border-border">
      <td className="p-2">
        <Input type="number" min={1} className="w-16 h-8 text-sm text-center" value={product.quantity} onChange={(e) => onUpdate(product.id, "quantity", parseInt(e.target.value) || 0)} />
      </td>
      <td className="p-2">
        <Input className="h-8 text-sm" value={product.name} onChange={(e) => onUpdate(product.id, "name", e.target.value)} placeholder={t.products.productName} />
      </td>
      <td className="p-2 hidden sm:table-cell">
        <Input className="h-8 text-sm" value={product.description} onChange={(e) => onUpdate(product.id, "description", e.target.value)} placeholder={t.products.description} />
      </td>
      <td className="p-2 text-center">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) onImageUpload(product.id, file); }} />
        {product.imageUrl ? (
          <button type="button" onClick={() => fileRef.current?.click()} className="mx-auto block rounded overflow-hidden border border-border hover:border-primary transition-colors">
            <img src={product.imageUrl} alt="" className="h-10 w-10 object-cover" />
          </button>
        ) : (
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
          </Button>
        )}
      </td>
      <td className="p-2">
        <Input type="number" min={0} className="w-28 h-8 text-sm text-right" value={product.price} onChange={(e) => onUpdate(product.id, "price", parseFloat(e.target.value) || 0)} />
      </td>
      <td className="p-3 text-right font-medium tabular-nums">
        {(product.quantity * product.price).toLocaleString("sv-SE")} kr
      </td>
      <td className="p-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemove(product.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}
