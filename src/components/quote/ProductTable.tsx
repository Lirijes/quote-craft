import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { QuoteProduct } from "@/types/quote";

interface ProductTableProps {
  products: QuoteProduct[];
  onChange: (products: QuoteProduct[]) => void;
}

export function ProductTable({ products, onChange }: ProductTableProps) {
  const updateProduct = (id: string, field: keyof QuoteProduct, value: string | number) => {
    onChange(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addProduct = () => {
    onChange([
      ...products,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
  };

  const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Products</h3>
        <Button variant="outline" size="sm" onClick={addProduct}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add row
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs">
                <th className="text-left p-3 font-medium w-16">Qty</th>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Description</th>
                <th className="text-right p-3 font-medium w-28">Unit Price</th>
                <th className="text-right p-3 font-medium w-28">Total</th>
                <th className="w-10 p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="p-2">
                    <Input
                      type="number"
                      min={1}
                      className="w-16 h-8 text-sm text-center"
                      value={product.quantity}
                      onChange={(e) =>
                        updateProduct(product.id, "quantity", parseInt(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      className="h-8 text-sm"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                      placeholder="Product name"
                    />
                  </td>
                  <td className="p-2 hidden sm:table-cell">
                    <Input
                      className="h-8 text-sm"
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      className="w-28 h-8 text-sm text-right"
                      value={product.price}
                      onChange={(e) =>
                        updateProduct(product.id, "price", parseFloat(e.target.value) || 0)
                      }
                    />
                  </td>
                  <td className="p-3 text-right font-medium tabular-nums">
                    {(product.quantity * product.price).toLocaleString("sv-SE")} kr
                  </td>
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/20">
                <td colSpan={3} />
                <td className="p-3 text-right text-sm font-semibold text-muted-foreground">Total</td>
                <td className="p-3 text-right font-bold text-base tabular-nums">
                  {total.toLocaleString("sv-SE")} kr
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
