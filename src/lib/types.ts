export interface User {
  name: string;
  avatar: string;
}

export interface CommentData {
  id: string;
  user: User;
  comment: string;
}

export interface GiftData {
  id:string;
  user: User;
  giftName: string;
  amount: number;
}

export interface StatsData {
  viewers: number;
  likes: number;
  shares: number;
}

export type TikTokEvent = 
  | { type: 'comment'; data: CommentData }
  | { type: 'gift'; data: GiftData }
  | { type: 'stats'; data: StatsData }
  | { type: 'error', data: { message: string } };
