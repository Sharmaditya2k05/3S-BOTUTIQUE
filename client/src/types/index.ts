export interface ProductImage {
  id: string;
  url: string;
  thumbnail?: string;
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
  videoUrl?: string;
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
  productCount?: number;
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

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  createdAt: string;
}
