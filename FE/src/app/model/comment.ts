export interface Comment {
  commentId: number;
  customerName: string;
  text: string;
  timestamp: string;
  sentimentId: number;
  userId: number;
  productId: number;
  commentCategoryId: number;
}

export interface CommentCategory {
  commentCategoryId: number;
  commentCategoryName: string;
}

export interface CommentsResponse {
  status: string;
  data: Comment[];
}
