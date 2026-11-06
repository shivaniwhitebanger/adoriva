# ADORIVA — Luxury Gifting E-Commerce Maison

**Adoriva** is an editorial, full-stack gifting e-commerce platform crafted with strict fidelity to the reference luxury visual brand. It reproduces the warm ivory, muted dusty rose (`#D8A6A2`), soft blush (`#EBD0CB`), and muted sage green (`#D9DED2`) palette, serif typography, bespoke engravings, and luxury gift hamper curation.

---

## 🌸 Key Visual Design & Palette

- **Muted Dusty Rose / Pink**: `#D8A6A2` (Announcement bar, promotional buttons, accent stars)
- **Soft Blush Pink**: `#EBD0CB` (Banners, badge highlights, luxury cards)
- **Warm Ivory Background**: `#FFF9F5` (Storefront canvas, navigation background)
- **Muted Sage Green**: `#D9DED2` (Promotional arrival banners)
- **Soft Beige & Borders**: `#F1E6DE` (Subtle dividers and card framing)
- **Charcoal Text**: `#37312F` (Editorial headlines, primary buttons)
- **Soft Grey Text**: `#77716E` (Subtitles, metadata, captions)
- **Metallic Gold Accents**: `#D4AF37` / `#C5A059` (Monogram ribbon logo, star dividers)

---

## 🎁 Implemented Storefront Features

1. **Dusty-Pink Announcement Bar**:
   - Displays configurable promotions, returns policy, and first-order discount codes (`WELCOME10`).
   - Includes quick-switch buttons for grading/reviewing between Customer and Admin views.
2. **Editorial Navigation & Header**:
   - Intertwined "A" ribbon bow gold monogram emblem matching the reference visual.
   - Dropdown menus for *Shop by Category* and *Occasions*.
   - Direct links for *Personalized Gifts*, *Best Sellers*, *New Arrivals*, and *Sale*.
   - Live Search Overlay, Wishlist counter, User Profile dropdown, and Shopping Bag with live count.
3. **Editorial Split Hero Section**:
   - Left: Eyebrow `"THOUGHTFUL GIFTS"`, headline *"Made with love, meant to be cherished."*, supporting copy, and `"SHOP NOW"` / `"EXPLORE COLLECTION"` CTAs.
   - Right: High-res photography of luxury hampers, ribbons, candles, and cards with floating gift badge.
   - Functional slide indicator dots and carousel controls.
4. **Benefits Strip**:
   - Free Shipping (orders > $75), Secure Payments, Premium Quality, Easy Returns, Customer Support.
5. **Shop by Category**:
   - Softly rounded circular category presentation with item counts for *Birthday Gifts*, *Personalized Gifts*, *Home & Living*, *Gifts for Her*, *Gifts for Him*, *Flowers & Hampers*, *Kids & Toys*, and *Gift Cards*.
6. **Best Sellers & New Arrivals**:
   - Responsive cards with photo zoom hover, star ratings, sales badges, and Quick Add to Cart.
7. **Two Adjacent Promotional Banners**:
   - Banner 1 (Soft Blush `#EBD0CB`): `"LIMITED TIME OFFER"`, `"UP TO 20% OFF ON SELECTED GIFTS"`, `"SHOP THE DEALS"`.
   - Banner 2 (Muted Sage `#D9DED2`): `"NEW ARRIVALS"`, `"DISCOVER OUR NEW COLLECTION"`, `"SHOP NEW ARRIVALS"`.
8. **Newsletter Signup**:
   - Instant validation, duplicate prevention, and welcome coupon code generation.
9. **Interactive Slide-Out Shopping Bag Drawer**:
   - Quantity decrement/increment/remove, personalization inscription preview, signature gift packaging checkbox (`+$4.99`), real-time coupon calculation (`WELCOME10`, `CHERISH20`), and free shipping progress bar.
10. **Full Product Detail Page**:
    - Image gallery thumbnails, live variant selection (e.g. Deluxe vs Grand Opulence, ribbon silk tones), custom engraving input (up to 45 chars), signature gift box + card note, estimated delivery range, customer reviews list, and review submission modal.
11. **Comprehensive Checkout & Order Confirmation**:
    - Multi-step customer info, shipping addresses, delivery speed selection, payment method simulation (Credit Card, Stripe sandbox, Razorpay, UPI, COD), and server-side order generation.
    - Confetti celebration, order reference (`ADR-XXXX`), parcel tracking code, and timeline.
12. **Patron Account & Wishlist**:
    - Order tracking history, status badges, saved shipping address, and wishlist items.
13. **Full Protected Store Administrator Portal (`/admin`)**:
    - Real-time KPIs: Gross revenue, order counts, AOV, low-stock warnings.
    - Product catalog CRUD: add/edit/delete gifts, update stock, set bestsellers.
    - Order management: update order statuses (*Pending*, *Processing*, *Shipped*, *Delivered*, *Cancelled*).
    - Coupon manager: create/delete promotional discount codes.
    - Homepage CMS: update announcement bar text, hero slides, and promotional banners.
    - Newsletter subscribers list.

---

## 🔑 Pre-Configured Test Credentials

For evaluation, use the one-click switch buttons on the header or the credentials below:

- **Store Administrator**:
  - Email: `admin@adoriva.com`
  - Password: `adoriva123`
- **Demo Customer**:
  - Email: `demo@adoriva.com`
  - Password: `adoriva123`

---

## 🛠 Local Development & Testing

```bash
# Install dependencies
npm install

# Start Express full-stack development server with Vite
npm run dev

# Run typecheck / lint
npm run lint

# Production build
npm run build
npm start
```
