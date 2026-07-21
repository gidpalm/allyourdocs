// lib/feedback-schema.ts
export interface Feedback {
  name?: string;
  email?: string;
  message: string;
  feedbackType: 'suggestion' | 'bug' | 'compliment' | 'feature' | 'question' | 'other';
  rating: number;
  pageUrl?: string;
  timestamp: string;
}

export function validateFeedback(data: any): data is Feedback {
  return (
    data.message &&
    typeof data.message === 'string' &&
    data.message.trim().length > 0 &&
    data.feedbackType &&
    ['suggestion', 'bug', 'compliment', 'feature', 'question', 'other'].includes(data.feedbackType) &&
    data.rating &&
    typeof data.rating === 'number' &&
    data.rating >= 1 &&
    data.rating <= 5
  );
}