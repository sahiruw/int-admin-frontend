export type box = {
  breeder_id: number;
  size: string;
  length_cm: number;
  width_cm: number;
  thickness_cm: number;
  breeder: Breeder;
}

export type Varity = {
  id: number;
  variety: string;
  woo_variety: string;
}

export type Breeder = {
  id: number;
  name: string;
}

export type Customer = {
  id: number;
  name: string;
}

export type Location = {
  id: number;
  name: string;
}

export interface KoiInfo {
  timestamp: Date;
  picture_id: string;
  koi_id: number;
  sex: string;
  breeder_id: number;
  pcs: number;
  size_cm: string;
  age: number;
  jpy_cost: number | null;
  jpy_total: number | null;
  usd_cost: number | null;
  usd_total: number | null;
  breeder_name: string;
  variety_name: string;
  customer_name: string;
  date: string;
  box_count: number;
  box_size: string;
  weight_of_box: number;
  total_weight: number;
  grouping: string | null;
  shipped: boolean;
  location_name: string;
  sale_price_jpy: number | null;
  comm_jpy: number | null;
  total_jpy_sales: number | null;
  sale_price_usd: number | null;
  comm_usd: number | null;
  total_usd_sales: number | null;
}

export type KoiSaleRecord = {
  picture_id: string;
  pcs: number;
  jpy_cost: number;
  rate: number;
  size_cm: string;
  age: number;
  breeder_name: string;
  variety_name: string;
  customer_name: string;
  date: string;
  box_count: number;
  weight_of_box: number;
  grouping: string | null;
  shipped: string | null;
  location_name: string;
  sale_price_jpy: number | null;
  sale_price_usd: number | null;
  comm: number;
  jpy_total_cost: number;
  jpy_total_sale: number;
  jpy_profit_total: number;
  usd_total_sale: number;
  usd_total_cost: number;
  usd_profit_total: number;
};


export interface ShippingData {
  picture_id: string;
  date: string;
  box_count: number;
  box_size: number;
  weight_of_box: number;
}
