export interface Store {
  id: string;
  store_name: string;
  store_url: string;
  subscription_tier: string;
  status: string;
  created_at: string;
  shopify_domain?: string;
}

export interface Promo {
  id: string;
  title: string;
  prize_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  store_id: string;
}

export interface Entry {
  id: string;
  customer_email: string;
  entry_count: number;
  source: string;
  is_manual: boolean;
  created_at: string;
  promo_id: string;
}

export interface Winner {
  id: string;
  customer_email: string;
  customer_name: string;
  prize_description: string;
  drawn_at: string;
  promo_id: string;
  store_id: string;
}

export interface AdminStats {
  totalStores: number;
  totalPromos: number;
  totalEntries: number;
  totalWinners: number;
  activePromos: number;
  uniqueEmails: number;
}
