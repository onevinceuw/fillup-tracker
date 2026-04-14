export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  fuel_type: FuelType;
  color: string;
  created_at: string;
}

export interface Fillup {
  id: string;
  vehicle_id: string;
  date: string;
  odometer: number;
  quantity: number;
  price_per_unit: number;
  total_cost: number;
  is_partial: boolean;
  station: string | null;
  notes: string | null;
  charge_level_before: number | null;
  charge_level_after: number | null;
  created_at: string;
  // computed
  mpg?: number | null;
  cost_per_mile?: number | null;
}
