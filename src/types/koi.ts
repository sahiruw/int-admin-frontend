export interface KoiInfo {
  koi_id: string;
  variety: string;
  sex: string;
  age: number;
  size_cm: number;
  breeder: string;
  bre_id: string;
  pcs: number;
  jpy_cost: number;
  jpy_total: number;
  sold_to?: string;
  ship_to?: string;
  sales_jpy?: number;
  sales_usd?: number;
  comm_jpy?: number;
  comm_usd?: number;
  total_jpy?: number;
  total_usd?: number;
  num_of_box?: number;
  box_size?: string;
  total_kg?: number;
  shipped_yn?: string;
  ship_date?: string;
  timestamp: Date
}