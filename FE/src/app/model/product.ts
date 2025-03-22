export interface Product {
  productId: string;
  productName: string;
}

export interface ProductResponse {
  data: Product[];
  status: string;
}
