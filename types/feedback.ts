export interface OrderFeedback {
  id: string;
  orderId: string;
  rating: number; // 1 a 5
  comment?: string | null;
  createdAt: string;
}

export interface FeedbackCreateInput {
  rating: number;
  comment?: string;
}

export interface FeedbackWithOrder extends OrderFeedback {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    createdAt: string;
  };
}

export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}
