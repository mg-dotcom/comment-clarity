export interface Product {
  productId: number;
  productName: string;
}

export interface ProductResponse {
  data: Product[];
  status: string;
}
