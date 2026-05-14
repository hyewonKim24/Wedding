import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type GuestbookRow = {
  id: number;
  name: string;
  text: string;
  font_idx: number;
  accent_idx: number;
  created_at: string;
};

export type RsvpRow = {
  id: number;
  name: string;
  attending: 'yes' | 'no';
  guests: number;
  message: string;
  created_at: string;
};

export type SnapRow = {
  id: number;
  uploader_name: string;
  image_url: string;
  created_at: string;
};
