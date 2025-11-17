// types/index.ts

export interface ApiUser {
  id: number;
  username: string;
}

export interface ApiTopic {
  id: number;
  name: string;
  slug: string;
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
}