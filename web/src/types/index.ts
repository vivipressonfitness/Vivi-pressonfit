// Tipos alineados con database/schema.sql (regenerar con `supabase gen types typescript`)
export type PlanStatus = 'active' | 'canceled' | 'past_due' | 'inactive' | 'trial';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_admin: boolean;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  plan_status: PlanStatus;
  plan_tier: string;
  current_period_end: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipContent {
  id: string;
  cycle_date: string;
  category: string;
  title: string;
  description: string | null;
  bunny_video_id: string | null;
  storage_path: string | null;
  content_url: string | null;
  target_mode: string; // 'Ambos' | ...
  class_type: string | null;
  month_year: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingConfigValue {
  price?: number;
  currency?: string;
  whatsapp_number?: string;
  program_title?: string;
}

export interface BunnyTokenResponse {
  videoId: string;
  token: string;
  expires: number; // epoch seconds
  hlsUrl: string;
  embedUrl: string;
}

export interface VideoProgress {
  user_id: string;
  video_id: string;
  position_seconds: number;
  duration_seconds: number;
  completed: boolean;
  updated_at: string;
}
