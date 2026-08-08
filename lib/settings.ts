import { supabase } from '@/lib/supabase';

export type SiteSettings = {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_badge: string;
  stat_customers: number;
  stat_years: number;
  stat_frames: number;
  stat_happy: number;
  about_title: string;
  about_subtitle: string;
  about_image: string;
  about_mission: string;
  about_vision: string;
  contact_phone: string;
  contact_phone_alt: string;
  contact_email: string;
  contact_email_alt: string;
  contact_address: string;
  contact_map_lat: number;
  contact_map_lng: number;
  business_hours: string;
  whatsapp_number: string;
  developer_name: string;
  developer_photo: string;
  developer_whatsapp: string;
  developer_bio: string;
  developer_title: string;
  logo_url: string;
  favicon_url: string;
  site_name: string;
  updated_at: string;
};

const FALLBACK: SiteSettings = {
  id: 1,
  hero_title: 'See the world in perfect clarity',
  hero_subtitle: 'Expert eye examinations, designer eyewear, and personalized care — all under one roof at Amir Optical Center.',
  hero_image: 'https://images.pexels.com/photos/2772531/pexels-photo-2772531.jpeg?auto=compress&cs=tinysrgb&w=1000',
  hero_badge: 'Premium eye care since 2010',
  stat_customers: 15000,
  stat_years: 15,
  stat_frames: 500,
  stat_happy: 98,
  about_title: 'A legacy of clear vision',
  about_subtitle: 'For over 15 years, Amir Optical Center has been the trusted name in eye care, combining advanced technology with a warm, personal touch.',
  about_image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1000',
  about_mission: 'To make exceptional eye care accessible to everyone, using the latest diagnostic technology and a genuinely caring approach.',
  about_vision: 'To be the region\'s leading optical center — where every patient leaves seeing the world more clearly and confidently.',
  contact_phone: '+92 300 1234567',
  contact_phone_alt: '+92 42 111 222 333',
  contact_email: 'info@amiroptical.com',
  contact_email_alt: 'support@amiroptical.com',
  contact_address: '123 Main Boulevard, Gulberg III, Lahore, Pakistan',
  contact_map_lat: 31.5249,
  contact_map_lng: 74.3496,
  business_hours: 'Fri–Sun: 10am–9pm · Mon–Thu: 11am–7pm',
  whatsapp_number: '923001234567',
  developer_name: 'Muhammad Sultan Ul Arifeen',
  developer_photo: '',
  developer_whatsapp: '',
  developer_bio: 'Passionate full-stack developer & designer creating beautiful, functional business websites.',
  developer_title: 'Developer & Designer',
  logo_url: '',
  favicon_url: '',
  site_name: 'Amir Optical',
  updated_at: new Date().toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  return (data as SiteSettings) ?? FALLBACK;
}

export { FALLBACK };
