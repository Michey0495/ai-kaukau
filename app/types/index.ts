export interface ProductInput {
  category: string;
  keyword?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  reviews: { author: string; rating: number; comment: string }[];
  category: string;
  keyword?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  price: number;
  buyerName: string;
  receipt: string;
  createdAt: string;
}
