export interface ProductImage {
  id: string;
  url: string;
  label?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  fabric: string;
  color: string;
  pattern: string;
  occasion: string;
  sareeLength: string;
  blouseLength: string;
  images: ProductImage[];
  videoUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  isPublished: boolean;
  inventoryStatus: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
  tags: string[];
  views: number;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  order: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  images: string[];
  approved: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  city?: string;
  wishlist: string[];
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  logo: string;
  description: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  address: string;
  city: string;
  businessHours: string;
  aboutText: string;
  yearsOfExperience: string;
  heroImage: string;
  heroHeading: string;
  heroSubheading: string;
  heroTagline: string;
  footerText: string;
  ownerImage: string;
  ownerName: string;
  announcementText: string;
  announcementLink: string;
  announcementColor: string;
  announcementEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  googleAnalyticsId: string;
  lowStockThreshold: number;
  adminNotificationEmail: string;
  googleBusinessUrl: string;
  homepageSections: { id: string; type: string; enabled: boolean; order: number }[];
}

export interface AnalyticsEvent {
  id: string;
  type:
    | "product_view"
    | "search"
    | "category_click"
    | "whatsapp_click"
    | "product_share";
  productId?: string;
  query?: string;
  categoryId?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  message: string;
  order: number;
  createdAt: string;
}

export interface DBShape {
  products: Product[];
  categories: Category[];
  settings: BusinessSettings;
  events: AnalyticsEvent[];
  admins: AdminUser[];
  reviews: Review[];
  testimonials: Testimonial[];
  customers: Customer[];
  coupons: Coupon[];
  blog: BlogPost[];
  whatsappTemplates: WhatsAppTemplate[];
}
