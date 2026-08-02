# Edge Case & System Resilience Specification — BlinkClone: Quick Commerce Platform with AI Mission Intelligence

## 1. Executive Overview

This document specifies all edge cases, exception handling strategies, fallback mechanics, and boundary conditions for the **BlinkClone** quick-commerce platform and its **AI Mission Intelligence Engine**. 

Given the dual nature of BlinkClone—combining high-speed quick-commerce workflows (10–15 min delivery simulation) with dynamic AI intent inference—system resilience is essential to prevent dead-end CTAs, false mission assumptions, UI flickering, state corruption, or network failure lockouts.

---

## 2. AI Mission Intelligence Engine Edge Cases

### 2.1 Low-Confidence & Ambiguous Cart Scenarios

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Empty or Single-Item Cart** | Cart has 0 or 1 generic item (e.g., 1 bottle of Water or 1 unit of Salt). | High rate of false-positive mission predictions (e.g., tagging 1 water bottle as "Gym Nutrition"). | Set minimum threshold of **2 distinct items** or 1 highly specific item (e.g., Baby Formula) before triggering mission detection. Return `mission: null`, `confidence: 0.0`. |
| **Heterogeneous / Contradictory Cart** | Cart contains items from 3+ unrelated missions (e.g., Diapers + Potato Chips + Engine Oil). | Conflicting top mission scores (e.g., `baby_care: 0.35`, `movie_night: 0.32`). | If top confidence score is **below threshold (< 0.55)**, suppress the `MissionBanner` and `MissionCompletionWidget`. Fall back gracefully to standard "Frequently Bought Together" carousel. |
| **Tie-Breaker Close Scores** | Top two scores differ by < 0.05 (e.g., `breakfast: 0.61` vs `guest_arrival: 0.59`). | Flipping banner back and forth on minor cart updates, confusing the user. | Invoke Groq Llama-3.3-70B API for one-shot LLM classification as a tie-breaker. If LLM is unreachable, stick to the highest-scoring candidate and enforce a **score hysteresis buffer (0.10)** before switching active missions. |

### 2.2 LLM API Resilience (Groq API Failure / Degradation)

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Missing `GROQ_API_KEY`** | `GROQ_API_KEY` environment variable is not defined in `apps/backend/.env`. | Server crash or unhandled promise rejection during LLM fallback call. | Engine detects missing key during initialization; automatically disables LLM fallback branch and operates 100% deterministically using rule-based scoring. |
| **API Timeout / Rate Limit (429/504)** | Groq API responds with 429 Rate Limit, 504 Gateway Timeout, or latency > 1500ms. | UI latency, blocked cart checkout endpoint, or HTTP 500 error on client. | LLM invocation is wrapped in a strict **800ms timeout Promise.race()**. If it times out or throws, the system logs a non-blocking warning and returns the deterministic heuristic score result immediately. |
| **Malformed LLM Output** | LLM returns unexpected JSON schema or markdown block instead of raw JSON. | `JSON.parse` error crashing the backend mission module. | Enforce Zod validation schema on LLM response parsing. On schema failure, log raw response and fallback to deterministic engine output. |

### 2.3 Rapid Cart Mutations & Async Race Conditions

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Rapid Item Stepper Clicks** | User rapidly clicks "+ ADD" / "-" 10 times in 1 second. | Multiple parallel HTTP requests causing out-of-order Redis/DB state updates and banner flickering. | Implement client-side **optimistic UI updates** with Zustand, and **debounce API calls (300ms)** for mission recalculation (`GET /api/mission/completion`). Backend uses atomic Prisma operations (`increment`/`decrement`). |
| **Out-of-Order API Responses** | Network delay causes response for Cart state [Item A] to arrive AFTER response for Cart state [Item A + B]. | UI displays outdated completion percentage (e.g., 80% instead of 100%). | Include an incrementing `cartVersion` integer header/payload in requests. Discard incoming mission responses where `response.cartVersion < currentCartVersion`. |

### 2.4 Conflicting User Intent Signals

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Search Intent vs Cart Mismatch** | User searches for "whey protein" (Gym Mission), but active cart has "chocolates and soda" (Movie Night). | Misaligned recommendations or conflicting UI messages. | Apply time-decay weighting: active cart items carry **65% weight**, recent search queries (within last 5 min) carry **25% weight**, and time-of-day prior carries **10% weight**. |

### 2.5 Mission Completion Boundary States

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **100% Mission Completion** | All required category slots for detected mission are satisfied in cart. | Showing irrelevant "Suggested Items" when mission is already complete. | Widget displays a celebrated **"Mission Fully Stocked! ⚡"** state with a green check badge and hides missing-item chips. |
| **Over-complete / Extra Categories** | User has all 5 Breakfast slots filled PLUS 4 unrelated snacks. | Completion math exceeding 100% or throwing division errors. | Cap completion percentage display at `Math.min(100, Math.round((filledSlots / totalRequiredSlots) * 100))`. |

---

## 3. Commerce Engine & Cart State Edge Cases

### 3.1 Guest-to-Authenticated Cart Migration

```
   ┌──────────────────────┐             ┌─────────────────────────┐
   │ Guest Cart (Storage) │             │ Logged-in DB Cart (User)│
   │ [Milk (x1), Eggs(x1)]│             │ [Bread (x1)]            │
   └──────────┬───────────┘             └────────────┬────────────┘
              │                                      │
              └──────────────► MERGE ◄───────────────┘
                                 │
                   ┌─────────────▼───────────────┐
                   │ Final Cart (DB & Sync)      │
                   │ [Milk (x1), Eggs(x1), Bread]│
                   └─────────────────────────────┘
```

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Post-Login Cart Merge** | Guest adds items to local cart, then logs into an existing account with pre-existing cart items. | Guest cart items wiped out or duplicate line items created in DB. | Server executes a **Cart Merge Strategy** upon auth: combines quantities for identical product IDs, appends distinct product IDs, and re-computes mission detection post-merge. |
| **Stale Session Token** | User leaves tab open for 7 days; access token expires while editing cart. | 401 Unauthorized crashes cart drawer. | Axios interceptor attempts invisible refresh via `/api/auth/refresh`. If refresh fails, store cart state locally, redirect to login, and restore cart seamlessly post-auth. |

### 3.2 Inventory & Stock Limits

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Item Out-of-Stock Mid-Session** | Product stock drops to 0 in DB while user has it in active cart drawer. | Order placement fails at checkout without clear explanation. | Perform real-time stock verification at `/api/orders` checkout POST. If SKU is out of stock, block order creation, flag item in cart with "Out of Stock" red badge, and adjust total. |
| **Quantity Limit Exceeded** | User attempts to add 50 units of a product with only 5 units in stock. | Negative inventory in database. | Enforce quantity cap: `Math.min(requestedQty, product.stockQty, MAX_PER_USER_LIMIT = 10)`. Show toast: *"Only 5 units available"*. |
| **Out-of-Stock Suggested Chip** | Mission completion chip suggests a product whose `stockQty == 0`. | Clicking chip throws error or adds unpurchasable item. | Mission Recommendation Service filters out products where `stockQty <= 0` prior to returning candidate chips. |

### 3.3 Coupon & Pricing Validation Anomalies

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Cart Value Drops Below Coupon Threshold** | User applies `MISSION20` (Min cart ₹499), then decrements item quantity making total ₹450. | User retains invalid coupon discount on ineligible cart. | On every cart mutation (+/- item), backend automatically re-evaluates applied coupon rules. If minimum constraint fails, invalidate coupon and surface notice: *"Coupon removed: Minimum order value ₹499 required"*. |
| **MRP Discount Inversion** | Seed data or admin error where `price > mrp`. | Misleading UI showing negative discount percentage. | Enforce schema constraint and runtime fallback: if `price > mrp`, set `mrp = price` (display 0% discount). |

### 3.4 Multi-Tab Synchronisation

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Cart Mutated in Tab A, Checkout in Tab B** | User adds items in Tab A and clicks "Place Order" in Tab B simultaneously. | Order placed with incorrect total or items missing. | Use browser `BroadcastChannel` or `window.addEventListener('storage')` to synchronize Zustand cart state across tabs instantly. |

---

## 4. Catalog, Search & Filtering Edge Cases

### 4.1 Zero Match & Empty Search Queries

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **No Products Found** | User searches for unseeded term (e.g., "iPhone", "Lawnmower"). | Blank screen with zero feedback. | Display empty search state component: *"No items found for 'iPhone' in Grocery catalog"*, accompanied by popular category chips and current top mission carousel. |
| **Special Character Search** | User enters SQL/regex injection characters (`' OR 1=1 --`, `<script>`, `?q=%`). | Database error or security vulnerability. | Input sanitization via Zod + Prisma parameterized queries (protects against SQLi). HTML escaping prevents XSS payloads. |

### 4.2 Category Taxonomy Mismatches

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Multi-Tag Category Assignment** | A product (e.g., *Almond Milk*) belongs to `Dairy & Breakfast` but carries `baby_care` and `breakfast` mission tags. | Item double-counted or excluded in mission checklist calculation. | Checklist logic maps candidate products by primary `mission_tags[]` array, avoiding duplicate slot contributions through a `setOfVisitedProductIds`. |

---

## 5. Checkout & Order Lifecycle Edge Cases

### 5.1 Idempotency & Double-Click Order Creation

```
 User Clicks "Place Order" (2x Rapidly)
   │
   ├── Click 1 ──► [Idempotency Key: ID-98231] ──► Order Created (DB)
   │
   └── Click 2 ──► [Idempotency Key: ID-98231] ──► Deduplicated! Return existing Order ID
```

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Double-Click "Place Order"** | User clicks "Place Order" button multiple times due to slow network. | Duplicate orders charged and created in database. | Client disables button immediately on first click. Frontend generates a unique `idempotencyKey` UUID per checkout session passed to `POST /api/orders`. Backend returns cached result for duplicate keys within 60s. |

### 5.2 Order History & Out-of-Stock Reorder

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Reordering Discontinued Products** | User clicks "Reorder" from order history, but 2 of 5 past items are now out of stock or deleted. | Reorder API endpoint returns 500 internal server error. | Reorder endpoint processes available items, adds them to cart, skips out-of-stock items, and notifies user: *"3 items added to cart. 2 items are currently unavailable."* |

### 5.3 Simulated Order Tracker Timer Inconsistencies

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Page Refresh During Live Tracking** | User refreshes `/order/[id]` page while status is "Out for Delivery". | Timer resets back to "Order Placed". | Order creation timestamp (`placedAt`) is stored in Postgres. Order status is deterministically calculated from elapsed time since `placedAt`:
- `0–30s`: Order Placed 📝
- `31–90s`: Packing at Dark Store 📦
- `91–180s`: Out for Delivery 🛵
- `>180s`: Delivered 🚚 |

---

## 6. Infrastructure, Security & Network Failure Modes

### 6.1 CORS & Vercel-Railway Network Faults

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **CORS Origin Mismatch** | Vercel production preview URL is missing from Railway Express CORS whitelist. | Browser blocks all API requests with CORS error. | Configure Express CORS middleware with regex pattern matching official Vercel preview domains (`https://*.vercel.app`) alongside production domain and `localhost`. |
| **Railway Backend Cold Start / Sleep** | Free-tier Railway container takes 3–5 seconds to spin up on first request. | Frontend requests time out or user sees infinite loading spinner. | React Query config set with `retry: 2`, `retryDelay: 1000ms`, and global skeleton loaders on UI. |

### 6.2 Redis Cache Disruption

| Scenario | Trigger / Condition | Failure Risk | Mitigation / Handling Strategy |
|---|---|---|---|
| **Redis Service Downtime** | Railway Redis add-on crashes or reaches memory limit. | Entire application crashes if Redis is hard dependency. | Wrap Redis client calls in `try/catch` fallbacks. On Redis failure, system falls back to querying PostgreSQL directly for active cart data and recalculating mission scores on-the-fly. |

---

## 7. Verification & Edge Case Test Matrix

To guarantee compliance, the following manual and automated checks must pass prior to release:

```bash
# 1. Verify Groq Graceful Fallback (Unset API key test)
GROQ_API_KEY="" npm run test:backend

# 2. Verify Idempotent Order Creation
curl -X POST http://localhost:4000/api/orders \
  -H "Header-Idempotency-Key: test-uuid-123" \
  -H "Authorization: Bearer <TOKEN>"

# 3. Verify Stock Exceeded Guard
curl -X POST http://localhost:4000/api/cart/items \
  -d '{"productId": "prod_1", "quantity": 999}'
```

| Test Case | Expected Result | Pass Criteria |
|---|---|---|
| Single item cart | `mission: null`, `confidence: 0` | Banner hidden |
| Groq API key missing | System runs heuristic scorer without errors | HTTP 200 on `/detect` |
| Apply invalid coupon | Error toast displayed, discount 0 | Total unaltered |
| Rapid 10x quantity click | Cart state debounced, no race condition | Final Qty exact |
| Refresh tracking page | Status calculated from `placedAt` | Timer consistent |

---

*Derived from [architecture.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/architecture.md), [context.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/context.md), [problemstatement.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/problemstatement.md), and [implementation_plan.md](file:///c:/Nextleap%20Projects%20Git/PMFGPMVP/docs/implementation_plan.md)*
