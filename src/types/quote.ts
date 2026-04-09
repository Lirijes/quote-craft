export interface QuoteProduct {
  id: string;
  description: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface QuoteCharge {
  id: string;
  label: string;
  amount: number;
}

export interface QuoteData {
  customerName: string;
  date: string;
  quoteNumber: string;
  summary: string;
  products: QuoteProduct[];
  charges: QuoteCharge[];
  quoteText: string;
}
