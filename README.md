# 3S Saree — Boutique Website & Admin Dashboard

**Satyam Shivam Sundaram** — a premium online saree catalog with WhatsApp ordering, AI chat assistant, and a full-featured admin dashboard for a home-based saree boutique.

---

## What's Inside

```
3s-saree-boutique/
├── client/     React 19 + TypeScript + Vite 8 + Tailwind CSS 4
└── server/     Express 5 + TypeScript API (JSON-file database, JWT auth, image uploads)
```

### Customer Site
- Saree catalog with search, filter, sort, and category navigation
- Product detail pages with image gallery, full-screen zoom/lightbox, and video support
- Shopping cart with WhatsApp checkout (formatted order message)
- Wishlist with WhatsApp share
- Recently viewed products
- Photo reviews (up to 5 images per review)
- Blog/Lookbook with slug-based URLs
- Size & Draping Guide (lengths, blouse measurements, draping styles, fabric care)
- Multi-language support (Hindi/English toggle)
- AI Chat Assistant (powered by Grok/xAI with RAG context)
- Coupon/discount code validation
- Screenshot protection on product images
- Ambient video background
- Announcement bar

### Admin Dashboard
- Product CRUD with bulk actions, inventory status, tags, video URLs
- Category management with image uploads
- Blog/Lookbook editor
- Business analytics dashboard (views, enquiries, search terms, conversion)
- WhatsApp enquiry log with product details
- WhatsApp message templates (CRUD with copy/send)
- Coupon management (percentage/flat, min order, max uses, expiry)
- Customer management
- Homepage layout manager (reorder and toggle sections)
- Announcement bar controls
- SEO settings (title, description, keywords, Google Analytics ID)
- Low stock alerts and notifications
- Google Business Profile integration
- Full database backup & restore (JSON export/import)

---

## Tech Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4       |
| Backend  | Express 5, TypeScript, JSON file database           |
| Auth     | JWT with httpOnly cookies (admin + customer)        |
| Uploads  | Multer + Sharp (image processing & optimization)    |
| AI Chat  | Grok API (xAI) with RAG context from store data    |
| Icons    | Lucide React                                        |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (required for built-in `fetch` used by AI chat)
- npm

### 1. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in your values:

| Variable         | Required | Description                                              |
| ---------------- | -------- | -------------------------------------------------------- |
| `PORT`           | No       | API server port (default: 4000)                          |
| `CLIENT_ORIGIN`  | No       | CORS origin (default: http://localhost:5173)              |
| `JWT_SECRET`     | Yes      | Long random string for signing JWTs                      |
| `NODE_ENV`       | No       | `development` or `production`                            |
| `ADMIN_EMAIL`    | Yes      | Admin login email                                        |
| `ADMIN_PASSWORD` | Yes      | Admin login password                                     |
| `ADMIN_NAME`     | Yes      | Admin display name                                       |
| `GROK_API_KEY`   | No       | xAI API key for AI chat ([console.x.ai](https://console.x.ai)) |

### 3. Seed or Reset Database

```bash
cd server
npm run seed      # fills catalog with 16 demo sarees + 10 categories
# OR
npm run reset     # empty catalog + starter categories (for real products)
```

Run **one** of `seed` or `reset` — whichever runs last is what's in the catalog. Both rewrite `server/data/db.json` without touching code.

### 4. Start Development Servers

Terminal 1 — API server:
```bash
cd server
npm run dev       # runs on http://localhost:4000
```

Terminal 2 — Client:
```bash
cd client
npm run dev       # runs on http://localhost:5173
```

Open **http://localhost:5173** for the customer site.

### 5. Admin Login

Go to **http://localhost:5173/admin/login** and sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` file.

---

## AI Chat Assistant

The floating chat widget uses the **Grok API** (xAI) with RAG to answer customer questions about products, pricing, fabrics, availability, ordering, and delivery.

**How it works:**
1. On each message, the server reads current store data (products, categories, settings)
2. Builds a context prompt with the full catalog and store information
3. Sends the conversation to Grok (`grok-3-mini-fast` model) with context
4. Returns a concise answer; redirects to WhatsApp for complex queries

**Setup:** Add your xAI API key to `server/.env`:
```
GROK_API_KEY=xai-your-key-here
```

Get a key at [console.x.ai](https://console.x.ai). Without a key, the chat gracefully falls back to directing customers to WhatsApp.

---

## Multi-Language Support (Hindi/English)

The site supports Hindi and English via a toggle button in the header. Translations cover:

- Navigation links
- Homepage section headings and content
- Footer links and headings
- Cart page (title, empty state, checkout button)
- Wishlist page (title, empty state, share button)
- Product page labels
- Common UI strings

Translations are in `client/src/lib/translations.ts`. Language preference is saved in localStorage.

---

## WhatsApp Integration

WhatsApp is the primary ordering channel:

- **Product enquiry** — Each product page has an "Enquire on WhatsApp" button with pre-filled message (name, SKU, price, link)
- **Cart checkout** — Cart page generates a formatted order message with all items, quantities, and total
- **Wishlist sharing** — Share your entire wishlist via WhatsApp
- **Message templates** — Admin can create reusable WhatsApp message templates
- **Analytics** — Every WhatsApp click is logged for the admin dashboard

The WhatsApp number is configured in Admin → Settings and used everywhere automatically.

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Public

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| GET    | `/health`                 | Health check                 |
| GET    | `/products`               | List products (filterable)   |
| GET    | `/products/:slug`         | Product detail + related     |
| GET    | `/categories`             | List categories              |
| GET    | `/settings`               | Store settings               |
| GET    | `/reviews/:productId`     | Product reviews + ratings    |
| POST   | `/reviews/:productId`     | Submit a review              |
| POST   | `/reviews/upload`         | Upload review photos         |
| GET    | `/testimonials`           | Site testimonials            |
| GET    | `/blog`                   | Published blog posts         |
| GET    | `/blog/:slug`             | Single blog post             |
| POST   | `/coupons/validate`       | Validate a coupon code       |
| POST   | `/chat`                   | AI chat message              |

### Auth

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| POST   | `/auth/admin/login`       | Admin login                  |
| POST   | `/auth/admin/logout`      | Admin logout                 |
| GET    | `/auth/admin/me`          | Current admin session        |
| POST   | `/auth/customer/register` | Customer registration        |
| POST   | `/auth/customer/login`    | Customer login               |
| GET    | `/auth/customer/me`       | Current customer             |

### Admin (requires authentication)

| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| POST   | `/products`                | Create product                |
| PUT    | `/products/:id`            | Update product                |
| DELETE | `/products/:id`            | Delete product                |
| POST   | `/products/bulk-action`    | Bulk publish/delete/feature   |
| CRUD   | `/categories`              | Category management           |
| PUT    | `/settings`                | Update store settings         |
| POST   | `/upload`                  | Upload images                 |
| GET    | `/analytics/overview`      | Dashboard stats               |
| GET    | `/analytics/top-products`  | Most viewed products          |
| GET    | `/analytics/top-enquiries` | Most enquired products        |
| GET    | `/analytics/search-terms`  | Popular search terms          |
| GET    | `/analytics/whatsapp-log`  | WhatsApp click log            |
| CRUD   | `/reviews`                 | Review moderation             |
| CRUD   | `/testimonials`            | Testimonial management        |
| GET    | `/customers`               | Customer list                 |
| CRUD   | `/coupons`                 | Coupon management             |
| CRUD   | `/blog`                    | Blog post management          |
| CRUD   | `/whatsapp-templates`      | Message templates             |
| GET    | `/notifications/low-stock` | Low stock alerts              |
| GET    | `/backup/export`           | Export database                |
| POST   | `/backup/import`           | Import database backup         |

---

## Project Structure

```
client/src/
├── components/
│   ├── Header.tsx              # Nav with search, wishlist, cart, language toggle
│   ├── Footer.tsx              # Links, contact, social, legal
│   ├── ProductCard.tsx         # Product grid card with add-to-cart
│   ├── ChatWidget.tsx          # AI chat floating widget
│   ├── ImageLightbox.tsx       # Full-screen zoom with pinch/swipe
│   ├── VideoBackground.tsx     # Ambient video background
│   ├── AnnouncementBar.tsx     # Dismissible top banner
│   ├── ReviewSection.tsx       # Photo reviews with lightbox
│   ├── AdminSidebar.tsx        # Admin navigation
│   └── ...
├── context/
│   ├── CartContext.tsx          # Shopping cart (localStorage)
│   ├── WishlistContext.tsx      # Wishlist (localStorage)
│   ├── LanguageContext.tsx      # Hindi/English i18n
│   ├── RecentlyViewedContext.tsx
│   ├── SettingsContext.tsx      # Store settings from API
│   ├── AdminAuthContext.tsx
│   └── CustomerAuthContext.tsx
├── lib/
│   ├── api.ts                  # Fetch wrapper with credentials
│   ├── translations.ts         # en/hi translation dictionary
│   └── whatsapp.ts             # Message generators + wa.me links
├── pages/
│   ├── Home.tsx                # Dynamic homepage sections
│   ├── SareesListing.tsx       # Catalog with filters
│   ├── ProductDetail.tsx       # Gallery, zoom, video, reviews
│   ├── Cart.tsx                # Cart with WhatsApp checkout
│   ├── Wishlist.tsx            # Wishlist with WhatsApp share
│   ├── DrapingGuide.tsx        # Size & draping guide
│   ├── Blog.tsx / BlogPost.tsx
│   └── admin/                  # All admin pages
├── types/index.ts
└── App.tsx                     # Routes & provider tree

server/src/
├── index.ts                    # Express app + route registration
├── db.ts                       # JSON file database (swap for Prisma later)
├── auth.ts                     # JWT middleware
├── types.ts                    # All TypeScript interfaces
├── seed.ts / reset.ts          # Database seeding/reset scripts
└── routes/
    ├── products.ts             # CRUD + bulk actions + analytics events
    ├── categories.ts           # CRUD + reorder
    ├── settings.ts             # Store configuration
    ├── auth.ts                 # Admin + customer login/register
    ├── reviews.ts              # Reviews + photo upload
    ├── analytics.ts            # Dashboard analytics
    ├── blog.ts                 # Blog CRUD with slugs
    ├── coupons.ts              # Coupon CRUD + validation
    ├── customers.ts            # Customer list
    ├── chat.ts                 # AI chat with Grok API + RAG
    ├── whatsapp-templates.ts   # Message template CRUD
    ├── notifications.ts        # Low stock alerts
    ├── backup.ts               # Export/import database
    ├── upload.ts               # Image upload (multer + sharp)
    └── testimonials.ts         # Testimonial CRUD
```

---

## Scripts

### Server (`cd server`)

| Script    | Command           | Description                              |
| --------- | ----------------- | ---------------------------------------- |
| `dev`     | `npm run dev`     | Start dev server with hot reload         |
| `seed`    | `npm run seed`    | Seed database with sample data           |
| `reset`   | `npm run reset`   | Reset to empty launch-ready state        |
| `build`   | `npm run build`   | Build client + compile server TypeScript |
| `start`   | `npm start`       | Run production server                    |

### Client (`cd client`)

| Script    | Command           | Description                              |
| --------- | ----------------- | ---------------------------------------- |
| `dev`     | `npm run dev`     | Vite dev server (port 5173)              |
| `build`   | `npm run build`   | TypeScript check + production build      |
| `lint`    | `npm run lint`    | Run oxlint                               |
| `preview` | `npm run preview` | Preview production build locally         |

---

## Configuring the Business (No Code Required)

Once logged into the admin dashboard, go to **Settings** to configure:

- **Announcement Bar** — top banner with custom text, color, and link
- **Business Info** — name, logo, description, address, hours, Google Business URL
- **Contact & WhatsApp** — WhatsApp number, phone, email, social media links
- **About Us** — owner photo, name, about text
- **Homepage Hero** — heading, subheading, tagline, hero image
- **Homepage Sections** — reorder and enable/disable sections (hero, categories, featured, new arrivals, story, testimonials, CTA)
- **Footer** — custom footer text
- **Notifications** — low stock threshold, admin notification email
- **SEO** — meta title, description, keywords, Google Analytics ID

---

## Deploying to Production

### Production Build

```bash
cd client && npm run build    # outputs to server/public/
cd ../server && npm run build # compiles TypeScript to dist/
npm start                     # serves both API and client on one port
```

The server serves the built client as static files with API routes under `/api`. One deployed service, one URL.

### Recommended: Oracle Cloud (Free Forever)

A one-command deployment script is included for Oracle Cloud's Always Free tier:

```bash
ssh ubuntu@<VM_PUBLIC_IP>
git clone <your-repo-url> /opt/3s-saree
cd /opt/3s-saree && chmod +x deploy/*.sh
sudo deploy/setup.sh
```

The script installs Node.js, nginx, PM2, certbot, builds everything, and sets up daily backups.

### Alternative Platforms

- **Railway** — deploy from GitHub, attach persistent volume at `/app/data` and `/app/uploads`
- **Render** — Web Service + persistent disk
- **Fly.io** — free tier with persistent volumes
- **Any Ubuntu VPS** — `deploy/setup.sh` works on DigitalOcean, Hetzner, Linode, AWS Lightsail

### Won't Work On

**Vercel, Netlify, Cloudflare Pages** — serverless platforms wipe disk between requests. Would need migration to Postgres + Cloudinary.

---

## Architecture Notes

### JSON File Database
`server/src/db.ts` reads/writes `server/data/db.json`. Every route only calls `readDB()` / `writeDB()`, so migrating to Postgres (via Prisma) means rewriting one file. The data shapes already match Prisma model patterns.

### Local Disk Storage
`server/src/routes/upload.ts` saves to `server/uploads/`. Swapping for Cloudinary means replacing one route's internals; the client displays whatever URL it receives.

### Auth
Admin and customer auth use bcrypt-hashed passwords with JWTs in httpOnly cookies (separate cookies for admin vs customer). The `requireAdmin` middleware protects all write routes.

---

## Go-Live Checklist

1. Change admin password to something strong
2. Set `JWT_SECRET` to a long random string
3. Fill in Settings: WhatsApp number, phone, email, address, business hours
4. Upload hero image and owner photo
5. Add real sarees with photos
6. Add your Grok API key for the AI chat assistant
7. Test WhatsApp enquiry flow on your phone
8. Set up SSL with certbot if self-hosting

---

## License

Private — All rights reserved.
