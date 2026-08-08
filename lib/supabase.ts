import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  type: string;
  brand: string;
  material: string;
  frame_shape: string;
  frame_size: string;
  lens_size: string;
  frame_color: string;
  price: number;
  discount_price: number | null;
  currency: string;
  stock: number;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  warranty: string;
  sku: string;
  barcode: string;
  supplier: string;
  purchase_cost: number;
  expiry: string | null;
  images: string[];
  description: string;
  features: string[];
  prescription_ready: boolean;
  lens_type: string;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  created_at: string;
};

export type Doctor = {
  id: string;
  name: string;
  qualification: string;
  experience_years: number;
  specialization: string;
  bio: string;
  photo: string;
  available_days: string[];
  rating: number;
  reviews_count: number;
  work_start: string;
  work_end: string;
  slot_duration_mins: number;
  off_days: string[];
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  price: number;
  duration_mins: number;
};

export type Appointment = {
  id: string;
  user_id: string | null;
  patient_name: string;
  phone: string;
  email: string;
  age: number | null;
  gender: string | null;
  reason: string | null;
  service_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  prescription_url: string | null;
  notes: string | null;
  created_at: string;
};

export type Prescription = {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  reviewed: boolean;
  notes: string | null;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  order_number: string;
  items: OrderItem[] | Record<string, unknown>[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  channel: 'online' | 'whatsapp';
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_until: string;
  is_active: boolean;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  published_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  avatar: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'owner' | 'receptionist' | 'doctor' | 'sales';
  created_at: string;
};

export type LensType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  features: string[];
  image: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type LensOrder = {
  id: string;
  user_id: string | null;
  lens_type_id: string;
  frame: string | null;
  frame_product_id: string | null;
  frame_name: string | null;
  frame_price: number;
  frame_image: string | null;
  lens_price: number;
  right_sphere: string;
  right_cylinder: string;
  right_axis: string;
  left_sphere: string;
  left_cylinder: string;
  left_axis: string;
  pd_distance: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
};

export const CATEGORIES = [
  'Men', 'Women', 'Kids', 'Luxury', 'Sports',
  'Reading Glasses', 'Prescription Glasses', 'Sunglasses',
  'Blue Light Glasses', 'Contact Lenses', 'Accessories',
];

export const SERVICES_SEED: Omit<Service, 'id'>[] = [
  { name: 'Complete Eye Examination', slug: 'complete-eye-examination', description: 'A full diagnostic check of your vision and eye health using modern equipment.', icon: 'Eye', price: 1500, duration_mins: 45 },
  { name: 'Vision Testing', slug: 'vision-testing', description: 'Accurate refraction test to determine your exact prescription.', icon: 'Glasses', price: 800, duration_mins: 20 },
  { name: 'Computer Vision Syndrome', slug: 'computer-vision-syndrome', description: 'Relief and guidance for digital eye strain from screens.', icon: 'Monitor', price: 1200, duration_mins: 30 },
  { name: "Children Eye Checkup", slug: 'children-eye-checkup', description: 'Gentle, child-friendly vision screening for young eyes.', icon: 'Baby', price: 1000, duration_mins: 25 },
  { name: 'Near Sighted', slug: 'near-sighted', description: 'Diagnosis and correction for myopia (difficulty seeing far).', icon: 'Telescope', price: 800, duration_mins: 20 },
  { name: 'Far Sighted', slug: 'far-sighted', description: 'Diagnosis and correction for hyperopia (difficulty seeing close).', icon: 'Search', price: 800, duration_mins: 20 },
  { name: 'Astigmatism', slug: 'astigmatism', description: 'Detection and lens correction for distorted vision.', icon: 'Aperture', price: 900, duration_mins: 25 },
  { name: 'Color Blindness', slug: 'color-blindness', description: 'Ishihara-based color vision deficiency testing.', icon: 'Palette', price: 600, duration_mins: 15 },
  { name: 'Eye Pressure Testing', slug: 'eye-pressure-testing', description: 'Tonometry to screen for glaucoma risk.', icon: 'Gauge', price: 700, duration_mins: 15 },
  { name: 'Diabetic Eye Screening', slug: 'diabetic-eye-screening', description: 'Retinal check for diabetes-related eye complications.', icon: 'Activity', price: 1800, duration_mins: 40 },
  { name: 'Cataract Consultation', slug: 'cataract-consultation', description: 'Evaluation and surgical planning for cataracts.', icon: 'Cloud', price: 2000, duration_mins: 45 },
  { name: 'Operation Consultation', slug: 'operation-consultation', description: 'Pre and post-operative eye surgery consultation.', icon: 'Stethoscope', price: 2500, duration_mins: 60 },
];
