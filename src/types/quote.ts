export interface QuoteProduct {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface QuoteData {
  customerName: string;
  date: string;
  quoteNumber: string;
  summary: string;
  products: QuoteProduct[];
  quoteText: string;
}
