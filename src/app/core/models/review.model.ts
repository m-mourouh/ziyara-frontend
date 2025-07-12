export interface Review {
    id: number;
    destinationId: number;
    userId?: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateReviewRequest {
    destinationId: number;
    rating: number;
    comment: string;
    userName: string;
  }
  