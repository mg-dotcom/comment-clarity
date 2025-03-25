export interface Product {
  productId: number;
  productName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ProductResponse {
  data: Product[];
  status: string;
}
