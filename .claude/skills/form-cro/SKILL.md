# Order Form Optimization — CRO Principles & Ideas

> **Skill:** Analyze and improve order forms, checkout flows, and conversion rates for Bakes by Coral.
>
> **Depends on:** `product-marketing-context` for product catalog, pricing, and order flows.

---

## Existing Order Forms & Components

### Form Pages

| Path                  | Type                | Payment Flow                |
|-----------------------|---------------------|-----------------------------|
| `/order/cookies`      | Small Cookie Order  | Full payment via Stripe Checkout |
| `/order/cookies-large`| Large Cookie Order  | 50% deposit via Stripe Invoice   |
| `/order/cake`         | Custom Cake Inquiry | 50% deposit via Stripe Invoice   |
| `/order/wedding`      | Wedding Inquiry     | 50% deposit via Stripe Invoice   |
| `/order/tasting`      | Tasting Box Order   | Full payment via Stripe Checkout |
| `/contact`            | Contact Form        | No payment                       |

### Form Components (in `/src/components/forms/`)

| Component            | Purpose                                    |
|----------------------|--------------------------------------------|
| `Input.tsx`          | Text fields                                |
| `Select.tsx`         | Dropdown select                            |
| `Textarea.tsx`       | Multi-line text input                      |
| `Checkbox.tsx`       | Single checkbox                            |
| `FormSection.tsx`    | Section wrapper with heading               |
| `FormError.tsx`      | Error message display                      |
| `Honeypot.tsx`       | Spam prevention (hidden field)             |
| `TimeSlotPicker.tsx` | Pickup time slot selection                 |
| `CouponInput.tsx`    | Discount code input                        |

### Planned Components (not yet built)

- `MultiSelect.tsx`
- `CheckboxGroup.tsx`
- `DatePicker.tsx`
- `TimePicker.tsx`
- `FileUpload.tsx`

---

## CRO Principles for Bakes by Coral

### 1. Reduce Friction

- **Minimize fields:** Only ask for what's truly needed at each step
- **Smart defaults:** Pre-select the most popular options (e.g., most popular cookie flavor, standard dozen quantity)
- **Progressive disclosure:** Show advanced options only when relevant (e.g., show filling options after cake flavor is selected)
- **Autofill support:** Ensure form fields have correct `autocomplete` attributes (name, email, tel)
- **Mobile-first:** 60%+ of traffic is mobile — large touch targets, single-column layout, easy scrolling

### 2. Build Trust at Key Moments

- **Before the form:** Show product photos, reviews, and "100% gluten-free kitchen" badge
- **During the form:** Display pricing clearly, show lead time expectations, include Coralyn's photo
- **At payment:** Show Stripe security badge, display order summary, confirm pickup details
- **After submission:** Immediate confirmation email, clear next-steps messaging

### 3. Clear Value Proposition

Every order page should answer in the first viewport:
1. What am I ordering?
2. How much does it cost?
3. When will I get it?
4. Why should I trust this baker?

---

## Trust Signal Placement

### Header / Above the Form

- "100% Dedicated Gluten-Free Kitchen" badge
- Star rating or customer quote
- Coralyn's photo (personal trust)
- "Cincinnati Pickup Only" (sets expectations)

### Within the Form

- Pricing transparency — show running total as options are selected
- Lead time reminder — "Orders need [X] days advance notice"
- Helper text under complex fields — "Not sure about size? Here's a serving guide"
- Progress indicator for multi-step forms

### Near the Submit Button

- Order summary / review section
- "You'll receive a confirmation email within minutes"
- Secure payment badge (Stripe / SSL)
- "Questions? Text me at (513) 633-7850"
- Cancellation / modification policy link

### Post-Submission

- Confirmation page with order reference number
- Confirmation email with all order details
- Clear next steps ("I'll reach out within 24–48 hours")
- Social sharing prompt or "Add to Calendar" for pickup

---

## Form-Specific Improvement Ideas

### Small Cookie Order (`/order/cookies`)

| Area              | Current State         | Suggestion                                        |
|-------------------|-----------------------|---------------------------------------------------|
| Flavor selection  | Multi-select          | Add flavor descriptions + photos inline           |
| Quantity          | Dropdown (1-3 dz)    | Visual quantity selector with price update         |
| Pickup date       | Date + time slot      | Show available dates first, filter by lead time    |
| Price display     | After form completion | Show running total as quantity/flavors change      |
| Trust signals     | Minimal               | Add "X cookies ordered this month" social proof    |

### Custom Cake Inquiry (`/order/cake`)

| Area              | Current State         | Suggestion                                        |
|-------------------|-----------------------|---------------------------------------------------|
| Size selection    | Dropdown              | Visual size comparison with serving counts         |
| Design style      | Text dropdown         | Image examples for Simple/Moderate/Intricate       |
| Inspiration       | Text links field      | Add image upload for inspiration photos            |
| Price estimate    | Not shown until quote | Show "starting at $X" estimate as size/design selected |
| Form length       | Long single page      | Break into steps: 1) Basics 2) Design 3) Details  |

### Wedding Inquiry (`/order/wedding`)

| Area              | Current State         | Suggestion                                        |
|-------------------|-----------------------|---------------------------------------------------|
| Form length       | Very long             | Multi-step wizard with progress bar                |
| First impression  | Form-heavy            | Lead with wedding gallery + testimonials           |
| Trust building    | Minimal               | Add wedding-specific testimonials, past wedding photos |
| Tasting upsell    | Not prominent         | Add tasting box CTA: "Not sure about flavors? Try a tasting box!" |
| Timeline clarity  | Lead time mention     | Add a "Planning Timeline" section (when to order by) |

### Large Cookie Order (`/order/cookies-large`)

| Area              | Current State         | Suggestion                                        |
|-------------------|-----------------------|---------------------------------------------------|
| Volume pricing    | Text mention          | Visual pricing table (4dz, 6dz, 10dz+ with discount) |
| Event context     | Text field            | Structured fields: Event type, date, guest count   |
| Packaging         | Individual wrap option| Show packaging photos                              |
| Social proof      | None                  | "Perfect for: corporate events, weddings, parties" |

---

## A/B Testing Suggestions

### High-Impact Tests

1. **CTA Button Text**
   - Control: "Place Order"
   - Variant A: "Start My Order"
   - Variant B: "Order My Cookies"
   - Hypothesis: First-person possessive ("My") increases ownership and conversion

2. **Price Anchoring on Cake Page**
   - Control: Show all sizes equally
   - Variant: Highlight 6" cake as "Most Popular" with visual emphasis
   - Hypothesis: Social proof anchor increases average order value

3. **Trust Badge Placement**
   - Control: Trust signals in footer
   - Variant: "100% GF Kitchen" badge directly above the order form
   - Hypothesis: Proximity to decision point increases form starts

4. **Form Length (Cake Inquiry)**
   - Control: Single long form
   - Variant: 3-step wizard (Basics → Design → Contact)
   - Hypothesis: Perceived shorter steps increase completion rate

5. **Tasting Box Upsell (Wedding Page)**
   - Control: Tasting mentioned in text
   - Variant: Prominent tasting CTA card before the inquiry form
   - Hypothesis: Lower-commitment first step increases overall wedding conversions

### Lower-Lift Quick Wins

- Add placeholder text to all form fields showing expected format
- Add field validation on blur (not just on submit)
- Add "Saved!" micro-interactions when selecting options
- Show pickup slot availability in real-time
- Add "Text me if you have questions" near complex form sections

---

## Conversion Metrics to Track

| Metric                        | Where to Measure                |
|-------------------------------|---------------------------------|
| Form start rate               | % of page visitors who interact with form |
| Form completion rate          | % of form starts that submit     |
| Drop-off field                | Which field causes most abandonment |
| Time to complete              | Average seconds from first interaction to submit |
| Mobile vs desktop completion  | Completion rate by device type    |
| Payment conversion            | % of form submissions that complete payment |
| Repeat order rate             | % of customers who order again   |

### Tracking Implementation

- Cloudflare Web Analytics for page-level metrics
- Form interaction events (custom events for field focus, blur, submit)
- Stripe dashboard for payment conversion
- Admin dashboard (`/admin/(dashboard)/analytics`) for order analytics
