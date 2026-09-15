import { Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import { CartProvider } from "./context/CartContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import CustomerLayout from "./components/CustomerLayout";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import SareesListing from "./pages/SareesListing";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { PrivacyPolicy, Terms, Returns } from "./pages/Legal";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminWhatsAppLog from "./pages/admin/AdminWhatsAppLog";
import AdminBackup from "./pages/admin/AdminBackup";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogForm from "./pages/admin/AdminBlogForm";
import AdminCustomers from "./pages/admin/AdminCustomers";
import Wishlist from "./pages/Wishlist";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import DrapingGuide from "./pages/DrapingGuide";
import Cart from "./pages/Cart";
import AdminWhatsAppTemplates from "./pages/admin/AdminWhatsAppTemplates";

export default function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AdminAuthProvider>
          <CustomerAuthProvider>
            <WishlistProvider>
          <RecentlyViewedProvider>
            <CartProvider>
            <Routes>
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/sarees" element={<SareesListing />} />
                <Route path="/sarees/:slug" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/guide" element={<DrapingGuide />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Route>

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="whatsapp-log" element={<AdminWhatsAppLog />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/new" element={<AdminBlogForm />} />
                <Route path="blog/:id/edit" element={<AdminBlogForm />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="backup" element={<AdminBackup />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="whatsapp-templates" element={<AdminWhatsAppTemplates />} />
              </Route>
            </Routes>
            </CartProvider>
          </RecentlyViewedProvider>
            </WishlistProvider>
          </CustomerAuthProvider>
        </AdminAuthProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}
