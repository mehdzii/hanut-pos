export interface Product {
  id?: string;
  name: string;
  name_ar: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  times_sold_total: number;
  times_sold_recent: number;
  last_sold_at?: string;
  created_at: string;
}

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  total_owed: number;
  created_at: string;
  last_activity: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  product_name_ar: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id?: string;
  items: SaleItem[];
  total_amount: number;
  payment_method: 'paid' | 'credit';
  customer_id?: string;
  customer_name?: string;
  created_at: string;
}

export interface CreditPayment {
  id?: string;
  customer_id: string;
  amount: number;
  created_at: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HoldCart {
  id: string;
  label: string;
  label_ar: string;
  items: CartItem[];
  customer_id?: string;
}

export interface DailySummary {
  date: string;
  total_revenue: number;
  total_sales_count: number;
  cash_revenue: number;
  credit_given: number;
  debt_collected: number;
  items_sold_count: number;
  top_products: { name: string; name_ar: string; quantity: number; total: number }[];
}
