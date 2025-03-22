export interface Comment {
  comments: never[];
  commentId: number;
  customerName: string;
  text: string;
  timestamp: string;
  sentimentId: number;
  userId: number;
  productId: number;
  commentCategoryId: number;
}

export interface ProductCommentsResponse {
  productId: number;
  productName: string;
  comments: Comment[]; // Ensure this exists
}

export interface ApiResponse {
  data: ProductCommentsResponse[];
  status: string;
}

export interface CommentCategory {
  commentCategoryId: number;
  commentCategoryName: string;
}

export interface CommentsResponse {
  status: string;
  data: Comment[];
}
