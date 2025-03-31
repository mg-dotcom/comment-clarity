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

export interface ProductRatings {
  '1-star': number;
  '2-star': number;
  '3-star': number;
  '4-star': number;
  '5-star': number;
}

export interface ProductRatingResponse {
  data: {
    ratings: ProductRatings;
  };
  success: boolean;
}
