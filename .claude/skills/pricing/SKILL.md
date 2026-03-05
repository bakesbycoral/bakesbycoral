# Pricing Strategy — Frameworks & Psychology

> **Skill:** Analyze pricing, recommend adjustments, create bundles, and apply pricing psychology for Bakes by Coral.
>
> **Depends on:** `product-marketing-context` for current product catalog and pricing.

---

## Current Pricing Reference

### Cookies

| Product                  | Price         | Notes                        |
|--------------------------|---------------|------------------------------|
| Cookies (1–3 dozen)     | $30/dozen     | Full payment upfront         |
| Cookies (4–9 dozen)     | $30/dozen     | 50% deposit                  |
| Cookies (10+ dozen)     | $28.50/dozen  | 5% volume discount, 50% deposit |

### Custom Cakes (3-layer)

| Size     | Base Price | Moderate (1.25x) | Intricate (1.5x) |
|----------|------------|-------------------|-------------------|
| 4" cake  | $60        | $75               | $90               |
| 6" cake  | $100       | $125              | $150              |
| 8" cake  | $140       | $175              | $210              |
| 10" cake | $180       | $225              | $270              |

### Cookie Cups

| Quantity | Price  | Add-ons           |
|----------|--------|--------------------|
| 1 dozen  | $30    | +$4/dz per add-on |
| 2 dozen  | $60    | +$4/dz per add-on |
| 3 dozen  | $90    | +$4/dz per add-on |
| 4 dozen  | $120   | +$4/dz per add-on |

### Tasting Boxes

| Type           | Price |
|----------------|-------|
| Cake tasting   | $70   |
| Cookie tasting | $30   |
| Both tastings  | $100  |

### Wedding & Event Cakes

- Custom pricing based on size, complexity, and services
- 50% deposit required
- 30-day minimum lead time

### Payment & Deposits

- Small orders (cookies 1–3 dozen, tastings): Full payment upfront via Stripe Checkout
- Large orders, cakes, weddings: 50% deposit via Stripe Invoice, balance before pickup
- Stripe fees: 2.9% + $0.30 per transaction (absorbed by business)

---

## Pricing Frameworks

### Cost-Plus Pricing

**Formula:** `Price = (Ingredient Cost + Labor + Overhead) × Markup`

**Typical Bakery Cost Structure:**

| Cost Component    | % of Revenue | Notes                                    |
|-------------------|--------------|------------------------------------------|
| Ingredients       | 25–35%       | GF ingredients cost 2–3x more than regular |
| Labor             | 25–35%       | Coralyn's time (baking, decorating, admin) |
| Overhead          | 10–15%       | Kitchen supplies, packaging, utilities    |
| Marketing/Tech    | 5–10%        | Website, ads, packaging, Stripe fees      |
| Profit margin     | 15–30%       | Target: 20%+ net profit                  |

**When to use:** Setting base prices for new products, ensuring profitability.

**Key consideration for GF baking:**
- GF flour blends cost 3–5x more than all-purpose flour
- Specialty ingredients (almond flour, xanthan gum) add significant cost
- Smaller batch sizes mean less economies of scale
- This justifies premium pricing vs. conventional bakeries

### Value-Based Pricing

**Formula:** `Price = What the customer perceives the value to be`

**Value drivers for Bakes by Coral:**

| Value Factor              | Price Impact | Why Customers Pay More          |
|---------------------------|--------------|----------------------------------|
| Dedicated GF kitchen      | +20–30%      | Trust, safety, peace of mind     |
| Celiac-safe guarantee     | +15–25%      | Can't get this at most bakeries  |
| Custom design             | +25–50%      | Personalized to their occasion   |
| "Tastes like the real thing" | +15–20%   | Rare in GF baking               |
| Personal maker brand      | +10–15%      | Supporting a real person          |
| Local / handcrafted       | +10–15%      | Community value                  |

**When to use:** Positioning premium products (wedding cakes, intricate designs), justifying prices to cost-conscious customers.

**Comparison anchors:**
- Conventional custom cakes: $4–$6 per serving
- Bakes by Coral cakes: $5–$10 per serving (justified by GF + custom + quality)
- Grocery store GF cookies: $6–$8 for 8–10 cookies ($9–$12/dozen equivalent)
- Bakes by Coral cookies: $30/dozen = $2.50/cookie (premium but handcrafted + fresh)

---

## Bundle Strategy

### Current Bundle

- **Both Tastings:** $100 (vs. $70 + $30 = $100 separately — currently no savings)
- **Recommendation:** Price "Both" at $90 to create a real incentive: "Save $10 when you try both!"

### Recommended New Bundles

#### 1. Cookie Party Pack

```
3 dozen cookies (any mix of flavors) + 1 dozen cookie cups
Regular: $90 + $30 = $120
Bundle: $110 (Save $10)
```
**Use case:** Birthday parties, office events
**Why:** Increases average order value, introduces cookie cups to cookie buyers

#### 2. Celebration Bundle

```
6" custom cake + 1 dozen cookies
Regular: $100+ (cake) + $30 = $130+
Bundle: $120+ (Save $10)
```
**Use case:** Small birthday celebrations, intimate gatherings
**Why:** Upsells cookie buyers to cakes and vice versa

#### 3. Wedding Tasting + Booking Credit

```
Both tastings ($100) → Credit $50 toward wedding cake order
Net cost of tasting: $50 if they book
```
**Use case:** Wedding funnel conversion
**Why:** Reduces perceived risk of tasting investment, increases booking rate

#### 4. Cookie Gift Box (Pre-Packaged)

```
1 dozen assorted cookies in gift packaging
Regular: $30 + packaging
Bundle: $35 (includes gift box + ribbon)
```
**Use case:** Holidays, gifts, thank-you's
**Why:** Higher margin per unit, easy gifting option, reduces decision paralysis

#### 5. Monthly Cookie Club (Future)

```
1 dozen cookies delivered monthly
Regular: $30/month
Subscription: $27/month (10% off, 3-month commitment)
```
**Use case:** Recurring revenue, customer retention
**Why:** Predictable income, reduces acquisition cost for repeat orders

---

## Coupon & Promotion Tactics

### Existing Coupon System Features

The admin dashboard (`/admin/(dashboard)/coupons`) supports:
- Percentage or fixed dollar discounts
- Minimum order amounts
- Usage limits (per coupon and per customer)
- Validity date ranges
- Order type restrictions
- Coupon input field: `CouponInput.tsx` component in order forms

### Recommended Coupon Strategies

#### Welcome / First-Time Buyer

```
Code: FIRSTBAKE
Discount: 10% off first order
Min order: None
Limit: 1 per customer
Expiry: Rolling (always active)
Channel: Welcome email, social media bio link
```

#### Referral Program

```
Referrer code: FRIEND-[NAME]
Referrer reward: $5 off next order
New customer: $5 off first order
Min order: $30
Limit: 1 per new customer
```

#### Seasonal Launch

```
Code: SPRING2026
Discount: Free add-on (e.g., free edible glitter on cookie cups)
Min order: $60
Limit: 50 uses total
Expiry: 2 weeks after launch
Channel: Newsletter subscribers only (exclusive)
```

#### Holiday Deadline Push

```
Code: EARLYBIRD
Discount: 10% off
Min order: $50
Limit: 30 uses
Expiry: 2 weeks before holiday
Channel: Email + social
Note: Creates urgency to order early (helps with production planning)
```

#### Post-Purchase Repeat

```
Code: COMEBACK
Discount: $5 off
Min order: $30
Limit: 1 per customer
Expiry: 60 days from purchase
Channel: Post-purchase follow-up email (14 days after pickup)
```

### Promotion Rules

- **Never discount more than 15%** — protect brand value and margins
- **Never say "discount"** — use "savings," "special," or "thank you"
- **Time-limited always** — every coupon has an expiration date
- **Track performance** — measure redemption rate, average order value with/without coupon
- **Exclusive channels** — give newsletter subscribers and repeat customers priority access

---

## Price Psychology Principles

### 1. Charm Pricing

- Use $30 instead of $29.99 — the brand is premium and approachable, not bargain-hunting
- Round numbers signal quality for handcrafted goods
- **Exception:** Online ads with "$30/dozen" reads cleaner and more transparent

### 2. Price Anchoring

- Always show cake prices from largest (most expensive) to smallest on the menu page
- Display "starting at $60" for cakes — anchors the price as accessible
- Show the intricate design multiplier to make simple/moderate feel like great value
- On the wedding page, don't show prices — the value proposition (custom, personal) comes first

### 3. Decoy Effect

The 3-tier cake design pricing naturally creates a decoy:
```
Simple:    1.0x ($100 for 6")  ← Some choose this
Moderate:  1.25x ($125 for 6") ← MOST choose this (best "value")
Intricate: 1.5x ($150 for 6")  ← Anchors the moderate as reasonable
```

### 4. Bundle Value Perception

- Always show "Regular price: $X" next to bundle price
- Quantify savings: "Save $10" not "Save 8%"
- Position bundles as "perfect for [occasion]" — the convenience is part of the value

### 5. Loss Aversion in Seasonal Pricing

- "Spring flavors available through May" — creates natural urgency without being pushy
- "I can only take [X] holiday orders" — genuine capacity limitation
- Post "SOLD OUT" on past seasonal items — builds demand for next time

### 6. Payment Framing

- "$2.50 per cookie" feels more accessible than "$30 per dozen" for some contexts
- "$5 per serving" for cakes frames value well (compare to restaurant desserts at $8–$15)
- "50% deposit now, balance before pickup" — feels manageable

---

## When to Raise Prices

### Signals It's Time

1. **Consistently fully booked** — 90%+ of pickup slots filled, turning away orders
2. **Ingredient costs increase** — GF ingredients are volatile; monitor quarterly
3. **Skill/quality improvement** — as designs get more complex, pricing should reflect that
4. **Market comparison** — if competitors charge more for inferior GF products
5. **Time pressure** — if Coralyn is working unsustainable hours at current pricing

### How to Raise Prices

1. **Announce in advance** — "Starting [date], my pricing will be updated"
2. **Explain with value** — "I've invested in [better ingredients / new techniques / expanded menu]"
3. **Grandfather existing orders** — Honor current prices for orders already placed
4. **Start with new products** — Introduce new items at higher price points first
5. **Raise the most underpriced items first** — often custom cakes, where the labor is highest
6. **Small increments** — $5 increases feel invisible; $20 increases feel dramatic

### Price Increase Communication Template

```
Subject: A little update from my kitchen 💛

Hi [Name]!

I wanted to share a small update. Starting [date], I'll be
adjusting my pricing to reflect [rising ingredient costs /
expanded offerings / improved quality].

[Specific changes — e.g., "Cookies will be $33/dozen,
and cake base prices will increase by $10 per size."]

I want to keep bringing you the same quality — the real butter,
premium chocolate, specialty GF flours — that makes Bakes by Coral
special. This adjustment helps me keep doing that.

Any orders placed before [date] will be honored at current pricing.

Thank you so much for your support. It means everything.

— Coralyn
```

---

## Competitive Positioning

### Price Position: Premium-Accessible

Bakes by Coral sits between grocery-store GF products and high-end patisseries:

```
Budget GF ← ─ ─ ─ ─ [Bakes by Coral] ─ ─ ─ ─ → Luxury Patisserie
(low price,          (premium quality,          (highest price,
 low quality)         fair price,                exclusive)
                      personal experience)
```

- **Above:** Grocery-store GF cookies/cakes (Udi's, Simple Mills)
- **At level:** Other home bakers, small bakeries
- **Below:** High-end bakeries with storefronts and full staff
- **Key advantage:** Dedicated GF kitchen + custom + personal — at a home-bakery price point
