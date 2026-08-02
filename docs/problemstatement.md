# Problem Statement — BlinkClone: Quick Commerce Platform with AI Mission Intelligence

## 1. Background

Quick-commerce (q-commerce) apps like Blinkit have changed how urban Indian consumers buy groceries and daily essentials — promising 10–15 minute delivery from hyperlocal dark stores. The core experience is built around:

- A fast, browsable catalog organized into categories (Grocery, Fruits & Vegetables, Dairy, Snacks, Personal Care, etc.)
- Search with autosuggest
- A persistent cart with real-time delivery-time estimates
- A streamlined checkout and order-tracking flow
- Reordering from order history

While this experience is fast and convenient, it is fundamentally **reactive** — it shows users what they search for or what's generically popular, but it does not understand *why* the user is shopping right now. A user buying milk, bread, and eggs at 7 AM is very likely preparing breakfast, but the app treats that cart the same way it would at any other time of day, missing an opportunity to help the user complete their actual goal (a fully stocked breakfast) rather than just the items they thought to search for.

## 2. Problem Statement

**Users shop for "missions" (Breakfast, Dinner Prep, Monthly Grocery Run, Baby Care, Guest Arrival, etc.), but existing quick-commerce apps only understand individual product queries.** This creates three recurring problems:

1. **Missed needs** — Users forget complementary items relevant to what they're actually trying to accomplish (e.g., they buy pasta but forget sauce and parmesan), resulting in repeat orders, delivery-fee friction, and lower basket satisfaction.
2. **Generic recommendations** — "Similar products" and "Frequently bought together" widgets are typically driven by co-occurrence statistics or manual merchandising, not by an understanding of the user's real-time context (time of day, day of week, cart trajectory, recent search intent).
3. **No visibility into shopping progress** — Users have no way to know if their cart is "complete" for what they're trying to do; they only find out something is missing when they run out of it at home.

## 3. Goals of This Project

Build a **functionally complete clone of the Blinkit consumer experience** (browse, search, cart, checkout, order tracking, reorder) as a real, deployable full-stack application, and layer on top of it an **AI Mission Intelligence Platform** that:

- Detects the user's likely shopping "mission" from behavioral signals (search terms, cart contents, time/day, order history)
- Recommends complementary, mission-relevant products instead of generic "similar" products
- Shows the user a live "mission completion" indicator inside the cart/checkout flow with one-tap add suggestions

This is an MVP — the goal is a working, demoable, deployed product, not a production-grade replacement for the real Blinkit engineering stack.

## 4. Target Users

| Persona | Description | Needs |
|---|---|---|
| Daily Shopper | Orders small baskets multiple times a week (milk, snacks, veggies) | Speed, low friction reordering |
| Weekly Planner | Does a larger "monthly grocery" run | Complete baskets, avoid forgetting items |
| Occasion Shopper | Buys for a specific event (guests, festival, movie night) | Curated bundles, don't want to browse everything manually |
| New Parent / Pet Owner | Recurring, mission-specific needs (baby care, pet care) | Predictable, low-effort restocking |

## 5. Scope

### 5.1 In Scope (MVP)

**Clone of core Blinkit experience:**
- Landing page with categories, banners, and product carousels
- Category & sub-category browsing (grid + list views) — **10 locked top-level categories, 30 subcategories, ~450–600 seeded products** (full taxonomy in architecture.md §5)
- Product search with autosuggest and filters
- Product detail view (images, price, unit, description, "add to cart")
- Persistent cart (side drawer + full page) with quantity controls
- Delivery ETA display (simulated "X minutes" estimate)
- Address selection / delivery slot (single default address is acceptable for MVP)
- Checkout flow (order summary → payment simulation → order confirmation)
- Order history and reorder
- User authentication (signup/login, session persistence)
- Fully working CTAs: Add to Cart, Increment/Decrement, Remove, Wishlist/Favorite toggle, Search, Filter/Sort, Apply Coupon, Place Order, Track Order, Reorder

**AI Mission Intelligence Platform (proposed solution, layered on top):**
- **Mission Detection Engine** — infers a shopping mission (Breakfast, Dinner Prep, Monthly Grocery, House Cleaning, Baby Care, Pet Care, Festival Shopping, Movie Night, Office Snacks, Gym Nutrition, Emergency Purchase, Guest Arrival) from cart contents, search queries, time of day, day of week, and past orders, with a confidence score ($\ge 0.40$). Operates on a local deterministic rule scorer + **Groq Llama-3.3-70B API (100% Free API Tier)** for tie-breaker classification.
- **Smart Mission Discovery** — once a mission is detected, recommendation widgets switch from generic "similar products" to complementary, mission-relevant products from adjacent categories.
- **Mission Completion Assistant** — a live progress indicator in the cart/checkout ("Breakfast Mission — 82% complete") with one-tap-add suggested items to complete the mission.

**100% Free Tier Deployment Stack:**
- Frontend deployed on **Vercel** (Free Hobby Tier)
- Backend (API + AI service) deployed on **Railway / Render** (Free Tier)
- Database hosted on **Neon / Supabase PostgreSQL** (Free Tier)
- In-memory cache hosted on **Upstash / Railway Redis** (Free Tier)
- Publicly accessible URLs for both, connected end-to-end with zero mandatory API costs.

### 5.2 Out of Scope (MVP)

- Real payment gateway integration (payment step will be simulated/mocked)
- Real-time rider/delivery-partner tracking with live GPS
- Multi-warehouse / dark-store inventory allocation logic
- Native iOS/Android apps (web app only, responsive/mobile-friendly)
- Real SMS/OTP infrastructure (mocked OTP acceptable)
- Advanced fraud detection, multi-language support, multi-currency
- Training a custom ML model from scratch — MVP AI logic uses a **rule-based/heuristic + Groq LLM API hybrid model** (100% free API tier), documented in [architecture.md §5](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/architecture.md#L108-L125), with an explicit upgrade path to a trained ML model later.

## 6. Success Criteria

The MVP is considered successful when:

1. A user can complete a full journey — browse/search → add to cart → see mission detection + mission-aware recommendations → checkout → view order in order history — with **zero dead-end CTAs** (every visible button performs its intended action).
2. The Mission Detection Engine correctly identifies at least the "Breakfast," "Dinner Prep," and "Monthly Grocery" missions from realistic seeded cart/search data with a visible confidence score.
3. The Mission Completion Assistant shows an accurate, dynamically-updating completion percentage and at least 3 relevant one-tap-add suggestions per detected mission.
4. The application is live at a public Vercel URL (frontend) and Railway URL (backend/API), with the frontend successfully calling the deployed backend in production (not just locally).

## 7. Assumptions & Constraints

- Product catalog, pricing, and inventory will be **seeded/synthetic data** modeled on Blinkit's real category structure, scoped to a locked set of 10 top-level categories (see [architecture.md §6](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/architecture.md#L135-L155)) — not scraped proprietary data.
- "Blinkit" branding, logo, and exact visual assets will **not** be copied 1:1 (trademark/IP risk); the UI will closely mirror Blinkit's UX patterns and layout using original branding (e.g., "BlinkClone") and free-to-use product imagery/icons.
- Delivery times, rider details, and payment confirmations are simulated for MVP purposes.
- Single-region deployment (India-context data, INR currency) is sufficient for MVP.

---

*Traceability Links: [context.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/context.md) | [architecture.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/architecture.md) | [implementation_plan.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/implementation_plan.md) | [edge-case.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/edge-case.md)*
