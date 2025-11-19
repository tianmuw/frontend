// types/index.ts

export interface ApiUser {
  id: number;
  username: string;
  avatar?: string | null;
}

export interface ApiTopic {
  id: number;
  name: string;
  slug: string;
  
  description?: string; // 既然有时候可能没有，我们设为可选 (?)
  created_at?: string;  // 同上
  subscribers_count?: number; // 我们也可以顺便加上这个

  is_subscribed?: boolean;

  posts_count?: number;

  icon?: string | null;

  banner?: string | null;
}

export interface ApiProduct {
  original_url: string;
  product_title: string | null;
  product_image_url: string | null;
  product_price: string | null;
  scrape_status: "PROCESSING" | "SUCCESS" | "FAILED";
}

export interface ApiPost {
  id: number;
  title: string;
  content: string;
  view_count: number;
  created_at: string; // 这是一个 ISO 日期字符串
  author: ApiUser;
  topic: ApiTopic;
  product: ApiProduct;
  score: number;
  user_vote: number | null; // 可能是 1, -1, 或 null
  comments_count: number;
}

export interface ApiComment {
  id: number;
  content: string;
  author: ApiUser;    // 复用我们已有的 ApiUser
  created_at: string; // ISO 日期字符串

  // 递归
  // "replies" 字段是一个 ApiComment 数组
  replies: ApiComment[]; 
}

export interface ApiProfile {
  id: number;
  username: string;
  date_joined: string;
  followers_count: number;
  following_count: number;
  is_followed: boolean; // 我是否关注了他
  avatar?: string | null;
}

export interface ApiNotification {
  id: number;
  notification_type: 'follow' | 'comment' | 'reply' | 'vote';
  actor: ApiUser;    // 触发者 (Mike)
  post_id?: number;  // 关联帖子 (可选)
  is_read: boolean;
  created_at: string;
}