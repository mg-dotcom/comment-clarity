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

export interface ProductSentiment {
  'positive (%)': number;
  'negative (%)': number;
  'neutral (%)': number;
  'none (%)': number;
}

export interface CategorySentiment {
  [category: string]: ProductSentiment;
}

export interface ProductSentimentResponse {
  success: boolean;
  data: CategorySentiment;
  message?: string;
}

export interface CommentCategorySentiment {
  commentId: number;
  date: string;
  ratings: number;
  text: string;
  userName: string;
}

export interface SentimentComments {
  comments: CommentCategorySentiment[];
}

export interface ProductSentimentCommentsData {
  positive?: SentimentComments;
  negative?: SentimentComments;
  neutral?: SentimentComments;
  none?: SentimentComments;
}

export interface ProductSentimentCommentsResponse {
  data: ProductSentimentCommentsData;
  success: boolean;
}
