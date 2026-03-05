# Bakes by Coral — Brand Bible & Marketing Context

> **Purpose:** Foundational brand context for all marketing skills. Every other marketing skill references this file.

---

## Business Overview

- **Business Name:** Bakes by Coral
- **Owner:** Coralyn (solo founder, home baker)
- **Type:** Home-based, 100% dedicated gluten-free bakery
- **Location:** Cincinnati, Ohio 45245
- **Service Area:** Greater Cincinnati (pickup only — no delivery)
- **Website:** https://bakesbycoral.com
- **Email (primary):** coral@bakesbycoral.com
- **Email (admin):** hello@bakesbycoral.com
- **Phone:** (513) 633-7850 (SMS preferred)
- **Tagline:** "Gluten-Free Baking You'll Actually Crave"

### Social Media

| Platform  | Handle            | URL                                      |
|-----------|-------------------|------------------------------------------|
| Instagram | @bakesbycoral     | https://www.instagram.com/bakesbycoral   |
| Facebook  | Bakes by Coral    | https://www.facebook.com/bakesbycoral    |
| TikTok    | @bakes.by.coral   | https://www.tiktok.com/@bakes.by.coral   |
| Pinterest | bakesbycoral      | https://www.pinterest.com/bakesbycoral   |

---

## Brand Voice & Tone

### Core Principles

1. **First-person singular** — Always "I" and "my", never "we" or "our." Coralyn IS the brand.
2. **Warm & personal** — Like talking to a friend who happens to be an incredible baker.
3. **Celebratory** — Every order is someone's special moment. Honor that.
4. **Confident but approachable** — Proud of the craft without being pretentious.
5. **Inclusive** — Celiac-safe doesn't mean compromise. Everyone deserves amazing baked goods.

### Voice Attributes

| Attribute      | Description                                                    |
|----------------|----------------------------------------------------------------|
| Warm           | Like a kitchen that smells like fresh cookies                  |
| Personal       | Coralyn's story and passion are always present                 |
| Reassuring     | "Yes, it really IS gluten-free — and it tastes incredible"     |
| Joyful         | Celebrating life's moments through baking                      |
| Authentic      | No corporate speak, no jargon, real talk                       |

### Do / Don't

| Do                                        | Don't                                           |
|-------------------------------------------|--------------------------------------------------|
| "I bake every single item by hand"        | "Our team produces artisanal goods"              |
| "made in my dedicated GF kitchen"         | "manufactured in a certified facility"           |
| "tastes just like the classics"           | "gluten-free alternative"                        |
| "your celebration deserves this"          | "order now before it's too late"                 |
| "I'd love to make something special"      | "submit your inquiry for processing"             |
| Reference Cincinnati, local pride         | Generic "we serve the area"                      |

### Words to Use

celebration, handcrafted, from scratch, dedicated gluten-free kitchen, made with love, celiac-safe, Cincinnati, homemade, custom, your special day, crave-worthy, classic flavors

### Words to Avoid

alternative, substitute, free-from (as primary descriptor), processed, mass-produced, facility, corporate, diet, restriction, limitation, cheap, discount (use "savings" or "value" instead)

---

## Product Catalog & Pricing

### Cookies — Small Orders (1–3 dozen)

- **Price:** $30/dozen
- **Payment:** Full upfront via Stripe Checkout
- **Lead Time:** 7 days minimum
- **Order Path:** `/order/cookies`

**Core Flavors:**
| Flavor                | Description                        |
|-----------------------|------------------------------------|
| Chocolate Chip        | Classic with sea salt finish       |
| Vanilla Bean Sugar    | Buttery vanilla bean sugar cookie  |
| Cherry Almond         | Sweet cherry with toasted almond   |
| Espresso Butterscotch | Rich espresso meets butterscotch   |
| Lemon Sugar           | Bright, tangy lemon sugar cookie   |

**Seasonal Flavors (available March 16, 2026+):**
- Key Lime Pie
- Blueberry Muffin
- Lemon Sugar Sandwiches
- White Chocolate Raspberry

### Cookies — Large Orders (4+ dozen)

- **Price:** $30/dozen (10+ dozen = 5% off)
- **Payment:** 50% deposit via Stripe Invoice
- **Lead Time:** 14 days minimum
- **Order Path:** `/order/cookies-large`
- **Flow:** Inquiry → Quote → Invoice → Deposit

### Custom Cakes

All cakes are 3-layer. Payment is 50% deposit via Stripe Invoice. Lead time: 14 days minimum.

**Sizes & Base Pricing:**

| Size        | Shape Options    | Serves  | Starting Price |
|-------------|------------------|---------|----------------|
| 4" cake     | Heart or Round   | 2–4     | $60            |
| 6" cake     | Heart or Round   | 6–12    | $100           |
| 8" cake     | Heart or Round   | 14–20   | $140           |
| 10" cake    | Round            | 24–30   | $180           |

**Design Complexity Multipliers:**
- Simple: 1.0x base price
- Moderate: 1.25x base price
- Intricate: 1.5x base price

**Cake Flavors:** Vanilla Bean, Chocolate, Confetti, Red Velvet, Lemon, Vanilla Latte, Marble

**Cake Fillings:** Chocolate Ganache, Cookies & Cream, Vanilla Bean Ganache, Fresh Strawberries, Lemon Ganache, Raspberry

**Order Path:** `/order/cake`

### Cookie Cups

- Mini chocolate chip cookie cups with vanilla buttercream
- Customizable with colors and designs
- **Pricing:** 1 dz ($30) · 2 dz ($60) · 3 dz ($90) · 4 dz ($120)
- **Add-ons:** +$4/dozen each (chocolate molds, edible glitter)
- **Page:** `/cookie-cups`

### Wedding & Event Cakes

- 50% deposit required
- Lead time: 30 days minimum
- Custom pricing based on size, complexity, and services
- Services: setup, delivery discussion, consultation calls
- **Order Path:** `/order/wedding`

### Tasting Boxes

| Type           | Price | Lead Time |
|----------------|-------|-----------|
| Cake tasting   | $70   | 3 days    |
| Cookie tasting | $30   | 3 days    |
| Both tastings  | $100  | 3 days    |

**Order Path:** `/order/tasting`

---

## Pickup Hours

| Day              | Hours              |
|------------------|--------------------|
| Monday           | 9:00 AM – 7:00 PM |
| Tuesday–Thursday | 9:00 AM – 12:00 PM|
| Friday           | 9:00 AM – 7:00 PM |
| Saturday–Sunday  | 9:00 AM – 12:00 PM|

- 30-minute pickup slots, max 2 pickups per slot
- All orders are pickup only — no delivery

---

## Design System

### Color Palette

| Name        | Hex       | Usage                                |
|-------------|-----------|--------------------------------------|
| Primary     | `#541409` | Headers, buttons, primary accents    |
| Accent      | `#EAD6D6` | Soft backgrounds, highlights, cards  |
| Background  | `#F7F3ED` | Page backgrounds, light sections     |
| Dark Text   | `#4A2C21` | Body text, dark UI elements          |

### Typography

| Role        | Font             | Weights          |
|-------------|------------------|------------------|
| Headings    | Playfair Display | 400, 500, 600, 700 (+ italic) |
| Body        | PT Serif         | 400 (+ italic)   |
| UI/Labels   | Inter            | Various           |
| Script      | Great Vibes      | Decorative accents|

### Visual Style

- Warm, bakery-inspired aesthetic — cream and mauve tones
- Striped background gradients (alternating #F7F3ED and #EAD6D6)
- Rounded corners, soft shadows on cards
- Photography-forward — real product photos, natural lighting
- Logo: `/logo.png` (header), `/logo-footer.png` (footer)
- OG Image: `/og-image.jpg`

---

## Target Audiences

### Primary Personas

1. **Celiac/GF Community** — People with celiac disease or gluten sensitivity who are tired of mediocre GF options. They need to TRUST the kitchen is fully dedicated.
2. **Celebration Seekers** — Anyone in Cincinnati planning birthdays, anniversaries, showers, or parties who wants a custom cake or cookie order.
3. **Brides & Event Planners** — Couples planning weddings who want gluten-free (or just amazing) wedding cakes and dessert tables.
4. **Gift Givers** — People ordering cookie boxes or tasting boxes as gifts for GF friends/family.
5. **Local Foodies** — Cincinnati food lovers who follow local food accounts and try new spots.

### Key Demographics

- Primary: Women 25–45 in Greater Cincinnati
- Secondary: Parents of children with celiac/gluten sensitivity
- Tertiary: Wedding-age couples (25–35)

---

## Key Differentiators

1. **100% dedicated gluten-free kitchen** — Not a bakery that "also offers GF options." Everything is gluten-free, always. Celiac-safe.
2. **Tastes like the classics** — The #1 complaint about GF baking is taste/texture. Bakes by Coral solves this.
3. **Personal, maker-brand experience** — You're ordering from Coralyn, not a faceless company.
4. **Custom everything** — Cakes designed for YOUR occasion, not generic templates.
5. **Cincinnati local** — Supporting a local home baker, part of the community.

---

## Seasonal Calendar

| Month     | Theme / Opportunity                    |
|-----------|----------------------------------------|
| January   | New Year, "treat yourself"             |
| February  | Valentine's Day, Galentine's           |
| March     | Spring flavors launch, St. Patrick's   |
| April     | Easter, spring celebrations            |
| May       | Mother's Day, graduation season        |
| June      | Wedding season peak, Pride             |
| July      | Summer flavors, 4th of July            |
| August    | Back to school, end-of-summer          |
| September | Fall flavors launch, Labor Day         |
| October   | Halloween, pumpkin/spice season        |
| November  | Thanksgiving, holiday pre-orders open  |
| December  | Christmas, holiday gift boxes          |

---

## Website Sitemap

### Public Pages

| Path                | Page              | Priority |
|---------------------|-------------------|----------|
| `/`                 | Home              | 1.0      |
| `/menu`             | Menu & Pricing    | 0.9      |
| `/cakes`            | Custom Cakes      | 0.9      |
| `/cookies`          | Cookies           | 0.9      |
| `/cookie-cups`      | Cookie Cups       | 0.8      |
| `/weddings`         | Weddings & Events | 0.8      |
| `/about`            | About Coralyn     | 0.8      |
| `/gallery`          | Gallery           | 0.7      |
| `/tasting`          | Tasting Boxes     | 0.7      |
| `/contact`          | Contact           | 0.7      |
| `/faq`              | FAQ               | 0.6      |
| `/policies`         | Policies          | 0.3      |
| `/collection/easter`| Easter Collection | 0.8      |

### Order Pages

| Path                | Form Type          |
|---------------------|--------------------|
| `/order`            | Order Hub          |
| `/order/cookies`    | Small Cookie Order |
| `/order/cookies-large` | Large Cookie Order |
| `/order/cake`       | Custom Cake Inquiry|
| `/order/wedding`    | Wedding Inquiry    |
| `/order/tasting`    | Tasting Box Order  |

---

## Technical Stack (for marketing-adjacent work)

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Hosting:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Payments:** Stripe (Checkout + Invoices)
- **Email:** Resend (from: hello@bakesbycoral.com)
- **Analytics:** Cloudflare Web Analytics
- **Blog:** Built-in CMS with TipTap editor
- **Newsletter:** Built-in subscriber system with campaign management
- **Gallery:** Built-in gallery management
- **Coupons:** Built-in coupon system (% or fixed, min order, usage limits, date ranges)
