# Email & Newsletter — Sequences & Templates

> **Skill:** Create email campaigns, newsletter content, automated sequences, and subject lines for Bakes by Coral.
>
> **Depends on:** `product-marketing-context` for brand details and catalog; `copywriting` for voice and tone rules.

---

## Existing Email System

Bakes by Coral uses **Resend** for transactional and marketing emails.

- **From address:** hello@bakesbycoral.com (display: "Bakes by Coral")
- **Personal address:** coral@bakesbycoral.com (for direct replies)
- **Free tier:** 3,000 emails/month
- **Newsletter system:** Built-in at `/admin/(dashboard)/newsletter/`
- **Subscriber management:** `/admin/(dashboard)/newsletter/subscribers`
- **Campaign creation:** `/admin/(dashboard)/newsletter/campaigns`
- **Subscribe API:** `/api/newsletter/subscribe`
- **Unsubscribe API:** `/api/newsletter/unsubscribe`
- **Email templates:** `/src/lib/email/templates/`

### Existing Transactional Emails

| Email                | Trigger                    | Subject                                      |
|----------------------|----------------------------|----------------------------------------------|
| Order Confirmation   | Payment received           | "Your Bakes by Coral order is confirmed!"    |
| Inquiry Confirmation | Form submitted             | "We received your inquiry!"                  |
| Invoice Sent         | Admin sends invoice        | "Your invoice from Bakes by Coral"           |
| Pickup Reminder      | 3–5 days before pickup     | "Reminder: Your pickup is coming up!"        |
| Pickup Confirmed     | Pickup time confirmed      | "Your pickup time is confirmed"              |

---

## Email Voice Rules

All emails should feel like a personal note from Coralyn, not an automated system.

- First person ("I" / "my") always
- Warm greeting — "Hi [Name]!" not "Dear Customer"
- Short paragraphs (2–3 sentences max)
- One clear CTA per email
- Sign off as "Coralyn" or "— Coralyn, Bakes by Coral"
- Include contact info in footer (email, phone, Instagram)

---

## Email Sequence Templates

### 1. Welcome Sequence (New Newsletter Subscriber)

**Email 1 — Instant (Welcome)**
```
Subject: Welcome to Bakes by Coral! 🍪
Preview: So glad you're here.

Hi [Name]!

I'm Coralyn, and I'm so happy you're here.

I started Bakes by Coral because I believe everyone deserves
amazing baked goods — especially if you're gluten-free. Everything
I make is 100% gluten-free, baked from scratch in my dedicated
home kitchen right here in Cincinnati.

Here's what you can expect from me:
• First look at new flavors and seasonal launches
• Behind-the-scenes of my baking life
• Exclusive subscriber-only offers

In the meantime, check out my menu to see what I'm baking:
[CTA: See the Menu → /menu]

Talk soon,
Coralyn
```

**Email 2 — Day 3 (Story + Products)**
```
Subject: How Bakes by Coral started
Preview: It began in my kitchen with a mission...

Hi [Name]!

I get asked all the time — "Why gluten-free?"

[Short origin story — personal connection to GF baking,
why she's passionate about it]

Today I bake custom cakes, cookies, cookie cups, and more —
all from my dedicated gluten-free kitchen. No cross-contamination,
ever. Just real, delicious baked goods.

Here are my most popular items:
• Chocolate Chip Cookies — $30/dozen
• Custom 3-Layer Cakes — starting at $60
• Cookie Cups — $30/dozen

[CTA: Start Your Order → /order]

— Coralyn
```

**Email 3 — Day 7 (Social Proof + CTA)**
```
Subject: "Best gluten-free cake I've ever had"
Preview: Don't take my word for it...

Hi [Name]!

I let my customers do the talking on this one. 😊

[2-3 customer testimonials / quotes]

Ready to try it for yourself?

[CTA: Order Cookies → /order/cookies]
[CTA: Get a Custom Cake Quote → /order/cake]

— Coralyn
```

### 2. Seasonal Flavor Launch

```
Subject: NEW: [Season] flavors are here! 🌸
Preview: [Flavor 1], [Flavor 2], and more...

Hi [Name]!

I've been working on something special, and I'm SO excited to share —
my [season] flavors are officially available!

🆕 Here's what's new:
• [Flavor 1] — [1-sentence sensory description]
• [Flavor 2] — [1-sentence sensory description]
• [Flavor 3] — [1-sentence sensory description]

These are available for a limited time, so don't wait too long!

[CTA: Order [Season] Flavors → /order/cookies]

Available through [end date]. Lead time: [X] days.

— Coralyn
```

### 3. Holiday Promotion

```
Subject: [Holiday] orders are open! 🎄
Preview: Let me bake something special for your [holiday]...

Hi [Name]!

[Holiday] is coming up, and I'd love to be part of your celebration!

Here's what I'm offering:
• [Product 1] — [price]
• [Product 2] — [price]
• [Special bundle if applicable]

⏰ Order by [deadline] to guarantee your [holiday] pickup.

[CTA: Place Your [Holiday] Order → /order]

Happy [holiday]!
— Coralyn
```

### 4. Re-engagement (60+ days inactive)

```
Subject: I miss baking for you! 💛
Preview: It's been a while...

Hi [Name]!

It's been a little while since your last order, and I just wanted
to say hi! I've been busy in the kitchen with some new flavors
and designs I think you'd love.

Here's what's new since your last visit:
• [New product or flavor]
• [Seasonal update]
• [Any new feature — tasting boxes, cookie cups, etc.]

I'd love to bake for you again. Use code [CODE] for [discount]
on your next order!

[CTA: See What's New → /menu]

— Coralyn
```

### 5. Post-Purchase Follow-Up

**Email 1 — Day after pickup**
```
Subject: How was everything? 😊
Preview: I hope you loved it!

Hi [Name]!

I hope you're enjoying your [product type]! I'd love to hear
how everything turned out.

If you have a moment, it would mean the world if you could:
📸 Share a photo and tag me @bakesbycoral
⭐ Leave a review on Google or Facebook

Your support helps other people find my little bakery,
and I'm so grateful for every order.

Thank you for choosing Bakes by Coral!

— Coralyn
```

**Email 2 — 14 days after pickup**
```
Subject: Ready for your next celebration?
Preview: I'm here when you need me!

Hi [Name]!

Just a friendly reminder — whenever your next birthday, party,
or "just because" moment comes around, I'm here and ready to bake!

Quick reorder links:
• [Cookies → /order/cookies]
• [Custom Cake → /order/cake]
• [Cookie Cups → /cookie-cups]

— Coralyn
```

### 6. Wedding Funnel

**Email 1 — After wedding inquiry**
```
Subject: I'd love to be part of your big day! 💍
Preview: Let's talk about your wedding cake...

Hi [Name]!

Thank you so much for reaching out about your wedding!
I'm honored you're considering Bakes by Coral.

I've received your inquiry and I'm already thinking about ideas.
I'll be in touch within 24–48 hours to discuss your vision.

In the meantime, here are a few things that might be helpful:
• View my gallery for inspiration → /gallery
• Learn about tasting boxes → /tasting
• My wedding page → /weddings

I can't wait to hear more about your plans!

— Coralyn
```

**Email 2 — Tasting invite (after initial conversation)**
```
Subject: Let's book your tasting! 🎂
Preview: Try before you decide...

Hi [Name]!

Now that we've chatted about your vision, I'd love for you to
try my flavors in person with a tasting box!

🎂 Cake Tasting — $70 (6 flavor samples)
🍪 Cookie Tasting — $30
🎂🍪 Both — $100

Tastings need just 3 days lead time and are picked up at
my kitchen in Cincinnati.

[CTA: Book Your Tasting → /order/tasting]

— Coralyn
```

---

## Subject Line Formulas

| Formula                          | Example                                        |
|----------------------------------|------------------------------------------------|
| NEW: [Product/Flavor]            | "NEW: Key Lime Pie cookies are here!"          |
| Your [occasion] deserves this    | "Your birthday deserves a custom cake"         |
| [Number] reasons to [benefit]    | "3 reasons my cookies taste like the classics" |
| I made something new...          | "I made something new for spring 🌸"           |
| [Holiday] orders are open!       | "Valentine's Day orders are open!"             |
| [Emoji] + [Short hook]           | "🍪 Fresh batch alert"                         |
| Question format                  | "Have you tried my cookie cups yet?"           |
| Personal + Casual                | "I'm SO excited about this one"                |

### Subject Line Rules

- Keep under 50 characters when possible
- Use 1 emoji max (at the start or end)
- Personalize with [Name] when the system supports it
- A/B test 2 subject lines per campaign when possible
- Preview text is just as important — write it intentionally

---

## Newsletter Content Ideas (Monthly Rotation)

| Month     | Newsletter Theme                           |
|-----------|--------------------------------------------|
| January   | New Year, behind-the-scenes kitchen tour   |
| February  | Valentine's/Galentine's special orders     |
| March     | Spring flavor launch                       |
| April     | Easter collection + spring celebrations    |
| May       | Mother's Day + graduation orders           |
| June      | Wedding season spotlight                   |
| July      | Summer flavors + 4th of July              |
| August    | Back-to-school treats                      |
| September | Fall flavor launch                         |
| October   | Halloween + pumpkin spice season           |
| November  | Holiday pre-order announcement             |
| December  | Christmas gift boxes + year in review      |

---

## Email Design Guidelines

- **Header:** Logo + warm greeting
- **Body:** Short paragraphs, clear hierarchy, one primary CTA
- **Images:** Real product photos (not stock), warm lighting
- **Colors:** Use brand palette (#541409 primary, #EAD6D6 accent, #F7F3ED background)
- **Font:** Sans-serif for email body (email-safe), Playfair Display in image headers
- **Footer:** Contact info, social links, unsubscribe link, Cincinnati OH
- **Mobile-first:** All emails must look great on mobile (60%+ of opens)
