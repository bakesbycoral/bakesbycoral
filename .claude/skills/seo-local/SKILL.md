# Local SEO & Schema — Technical SEO for Bakes by Coral

> **Skill:** Optimize local search visibility, structured data, metadata, and technical SEO for Bakes by Coral.
>
> **Depends on:** `product-marketing-context` for business details, sitemap, and tech stack.

---

## Existing Schema & SEO Setup

### Current JSON-LD (in `(bakery)/layout.tsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "Bakery",
  "name": "Bakes by Coral",
  "description": "Handcrafted gluten-free cookies and custom cakes made with love in Cincinnati, OH. 100% dedicated gluten-free kitchen.",
  "url": "https://bakesbycoral.com",
  "logo": "https://bakesbycoral.com/logo.png",
  "image": "https://bakesbycoral.com/og-image.jpg",
  "telephone": "+1-513-633-7850",
  "email": "hello@bakesbycoral.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cincinnati",
    "addressRegion": "OH",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.1031,
    "longitude": -84.5120
  },
  "areaServed": { "@type": "City", "name": "Cincinnati" },
  "priceRange": "$$",
  "servesCuisine": ["Gluten-Free", "Bakery", "Desserts"],
  "hasMenu": "https://bakesbycoral.com/menu",
  "acceptsReservations": true,
  "sameAs": [
    "https://www.instagram.com/bakesbycoral",
    "https://www.facebook.com/bakesbycoral"
  ]
}
```

### Current Metadata Setup

- **Title template:** `%s | Bakes by Coral`
- **Canonical:** Self-referencing
- **Robots.txt:** Allow `/`, Disallow `/admin/`, `/api/`, `/order/success`
- **Sitemap:** `https://bakesbycoral.com/sitemap.xml`
- **Framework:** Next.js App Router (metadata export pattern)

---

## Schema Improvement Recommendations

### 1. Add Product Schema to Menu/Product Pages

Add `Product` schema to `/menu`, `/cakes`, `/cookies`, `/cookie-cups`:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Gluten-Free Chocolate Chip Cookies",
  "description": "Classic chocolate chip cookies with sea salt, baked in a 100% dedicated gluten-free kitchen.",
  "image": "https://bakesbycoral.com/choco-chip.jpg",
  "brand": { "@type": "Brand", "name": "Bakes by Coral" },
  "offers": {
    "@type": "Offer",
    "price": "30.00",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "30.00",
      "priceCurrency": "USD",
      "referenceQuantity": { "@type": "QuantitativeValue", "value": "12", "unitText": "cookies" }
    },
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Bakes by Coral" }
  },
  "category": "Gluten-Free Cookies",
  "additionalProperty": {
    "@type": "PropertyValue",
    "name": "Dietary",
    "value": "Gluten-Free"
  }
}
```

### 2. Add FAQ Schema to /faq

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is everything really gluten-free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Everything I bake is 100% gluten-free. My kitchen is a dedicated gluten-free space — no gluten ever enters it."
      }
    }
  ]
}
```

### 3. Add BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bakesbycoral.com" },
    { "@type": "ListItem", "position": 2, "name": "Menu", "item": "https://bakesbycoral.com/menu" }
  ]
}
```

### 4. Add Blog Post Schema (Article/BlogPosting)

For each blog post:
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[Post Title]",
  "author": { "@type": "Person", "name": "Coralyn" },
  "publisher": { "@type": "Organization", "name": "Bakes by Coral", "logo": "https://bakesbycoral.com/logo.png" },
  "datePublished": "[ISO date]",
  "image": "[featured image URL]"
}
```

### 5. Enhance Existing Bakery Schema

Add to existing schema:
```json
{
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "09:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday","Wednesday","Thursday"], "opens": "09:00", "closes": "12:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "09:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday","Sunday"], "opens": "09:00", "closes": "12:00" }
  ],
  "paymentAccepted": "Credit Card",
  "currenciesAccepted": "USD",
  "keywords": "gluten-free bakery, gluten-free cookies, custom cakes, Cincinnati bakery, celiac-safe"
}
```

---

## Target Keyword Map by Page

| Page          | Primary Keyword                            | Secondary Keywords                                              |
|---------------|--------------------------------------------|-----------------------------------------------------------------|
| `/` (Home)    | gluten-free bakery Cincinnati              | GF bakery Cincinnati, celiac-safe bakery Ohio                   |
| `/menu`       | gluten-free cakes and cookies Cincinnati   | GF menu, gluten-free desserts Cincinnati                        |
| `/cakes`      | custom gluten-free cakes Cincinnati        | GF birthday cake, gluten-free custom cake Ohio                  |
| `/cookies`    | gluten-free cookies Cincinnati             | GF cookies for sale, celiac-safe cookies Ohio                   |
| `/cookie-cups`| gluten-free cookie cups                    | mini cookie cups, GF party desserts                             |
| `/weddings`   | gluten-free wedding cake Cincinnati        | GF wedding desserts, celiac-safe wedding cake Ohio              |
| `/about`      | gluten-free baker Cincinnati               | home baker Cincinnati, Bakes by Coral                           |
| `/tasting`    | cake tasting Cincinnati                    | gluten-free cake tasting, wedding tasting box                   |
| `/gallery`    | gluten-free cake gallery                   | custom cake photos, GF dessert gallery                          |
| `/faq`        | gluten-free bakery FAQ                     | celiac bakery questions, GF baking FAQ                          |
| `/contact`    | contact gluten-free bakery Cincinnati      | order GF cakes Cincinnati                                       |
| `/blog/*`     | (varies by post — see content skill)       | gluten-free baking tips, GF recipes, Cincinnati food            |

---

## Local SEO Checklist

### Google Business Profile

- [ ] Claim and verify Google Business Profile
- [ ] Business name: "Bakes by Coral"
- [ ] Category: Primary "Bakery", Secondary "Gluten-Free Restaurant", "Custom Cake Shop"
- [ ] Address: Cincinnati, OH 45245 (home-based — use service area instead of exact address if preferred)
- [ ] Phone: (513) 633-7850
- [ ] Website: https://bakesbycoral.com
- [ ] Hours: Match pickup hours from the site
- [ ] Description: Include "gluten-free," "Cincinnati," "custom cakes," "cookies," "celiac-safe"
- [ ] Photos: Upload 10+ high-quality product photos, updated monthly
- [ ] Posts: Create Google Business posts weekly (promotions, new flavors, seasonal offers)
- [ ] Reviews: Actively request reviews from happy customers

### Local Citations

Ensure consistent NAP (Name, Address, Phone) across:
- [ ] Google Business Profile
- [ ] Facebook Business Page
- [ ] Yelp
- [ ] Apple Maps
- [ ] Bing Places
- [ ] Yellow Pages / local directories
- [ ] Cincinnati-specific food directories
- [ ] Celiac/GF community directories

### On-Site Local Signals

- [ ] Cincinnati mentioned in homepage H1 or H2
- [ ] "Cincinnati, OH" in footer on every page
- [ ] Local schema markup (geo coordinates, areaServed)
- [ ] Cincinnati-related blog content
- [ ] "Pickup in Cincinnati" messaging on order pages
- [ ] Embed or link to Google Maps on contact page

---

## Next.js Metadata Patterns

### Page-Level Metadata (App Router)

```typescript
// Example: /cakes/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Custom Gluten-Free Cakes | Bakes by Coral',
  description: 'Order custom gluten-free cakes in Cincinnati. 3-layer cakes starting at $60, baked in a 100% dedicated GF kitchen. Celiac-safe, handcrafted, delicious.',
  keywords: ['gluten-free cakes', 'custom cakes Cincinnati', 'celiac-safe cake', 'GF birthday cake'],
  openGraph: {
    title: 'Custom Gluten-Free Cakes | Bakes by Coral',
    description: 'Order custom gluten-free cakes in Cincinnati. Starting at $60.',
    images: [{ url: '/og-cakes.jpg', width: 1200, height: 630 }],
    type: 'website',
    locale: 'en_US',
    siteName: 'Bakes by Coral',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Gluten-Free Cakes | Bakes by Coral',
    description: 'Order custom gluten-free cakes in Cincinnati.',
    images: ['/og-cakes.jpg'],
  },
  alternates: {
    canonical: 'https://bakesbycoral.com/cakes',
  },
}
```

### Dynamic Metadata for Blog Posts

```typescript
// /blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: `${post.title} | Bakes by Coral Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.featuredImage }],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Coralyn'],
    },
  }
}
```

---

## Technical SEO Audit Checklist

### Performance & Core Web Vitals

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Image optimization (Next.js `<Image>` component, WebP/AVIF)
- [ ] Font loading strategy (font-display: swap for Google Fonts)
- [ ] Bundle size audit (check for unnecessary imports)

### Crawlability & Indexing

- [ ] Sitemap at `/sitemap.xml` is accurate and up to date
- [ ] Robots.txt correctly blocks `/admin/`, `/api/`, `/order/success`
- [ ] All public pages return 200 status
- [ ] No orphaned pages (every page linked from at least one other page)
- [ ] Canonical tags on all pages (self-referencing)
- [ ] No duplicate content issues

### On-Page Elements

- [ ] Every page has a unique `<title>` tag (under 60 chars)
- [ ] Every page has a unique `<meta description>` (150–160 chars)
- [ ] Every page has one `<h1>` tag
- [ ] Images have descriptive `alt` text
- [ ] Internal linking between related pages
- [ ] External links to authoritative sources (e.g., celiac.org)

### Mobile & Accessibility

- [ ] Mobile-responsive on all pages
- [ ] Touch targets at least 44x44px
- [ ] Text readable without zooming
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA standards
