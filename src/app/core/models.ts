// ============ PRODUCT ============
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  materials?: string;
  category_id: number;
  category_name?: string;
  photos: string[];
  video_url?: string;
  badge?: 'new' | 'bestseller' | 'featured' | null;
  in_stock: boolean;
  home_display?: 'none' | 'hero' | 'last_section';
  created_at?: string;
}

// ============ CATEGORY ============
export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  product_count?: number;
}

// ============ CART ============
export interface CartItem {
  product: Product;
  quantity: number;
}

// ============ ORDER ============
export interface OrderForm {
  full_name: string;
  phone: string;
  address: string;
  pincode: string;
  note?: string;
}

export interface OrderSubmissionPayload extends OrderForm {}

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  customer_id?: number;
  customer_name: string;
  customer_email?: string;
  phone: string;
  address: string;
  pincode: string;
  note?: string;
  status: 'new' | 'confirmed' | 'delivered';
  created_at: string;
}

// ============ AUTH ============
export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  address?: string;
  created_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthOtpResponse {
  message: string;
  dev_otp?: string;
}

// ============ ADMIN ============
export interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_categories: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recent_orders: Order[];
  recent_products: Product[];
}

// ============ SETTINGS ============
export interface SiteSettings {
  whatsapp_number: string;
  contact_email?: string;
  instagram_url?: string;
  facebook_url?: string;
  studio_address?: string;
}

// ============ PAGINATION ============
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ============ FILTER ============
export interface ProductFilter {
  category_id?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
  featured?: boolean;
  exclude_id?: number;
}

// ============ CONTACT ============
export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// ============ API ============
export interface MessageResponse {
  message: string;
}

export interface OrderSubmissionResponse {
  order: Order;
  whatsapp_number: string;
}
