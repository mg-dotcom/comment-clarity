export interface Product {
  productId: number;
  productName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ProductResponse {
  response: Product;
  data: Product[];
  success: boolean;
}

export interface ProductResponseWithComments {
  success: boolean;
  message: string;
  data: {
    productId: number;
    commentCount: number;
  };
}

// Rating
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

// Sentiment
export interface ProductSentiment {
  'negative (%)': number;
  'neutral (%)': number;
  'positive (%)': number;
  [key: string]: number;
}

export const DefaultSentiment: ProductSentiment = {
  'negative (%)': 0,
  'neutral (%)': 0,
  'positive (%)': 0,
};

export const SentimentColors: { [key: string]: string } = {
  'negative (%)': '#FF5252',
  'neutral (%)': '#FFCA28',
  'positive (%)': '#4CAF50',
};

export interface ProductSentimentResponse {
  success: boolean;
  data: ProductSentiment;
  message?: string;
}
