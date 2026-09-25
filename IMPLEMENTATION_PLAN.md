# Flavoland Website — MVP Technical Implementation Plan

## Context

`Flavoland/` currently contains one file: `Flavoland_Website_PRD_v1.docx`. There is no code. This plan translates that PRD into a buildable technical design for the MVP (PRD §28.2).

Three properties of the PRD drive the entire shape of this plan:

1. **Four foundational inputs were explicitly undecided at v1.0** — commerce backend (§27), payment gateway (§11), shipping provider (§13), and launch countries (§1.2). Two are now resolved (see below); payment gateway and shipping provider remain open, but simplified to domestic-India-only for MVP.
2. **§27.2 mandates** that the frontend treat the commerce backend as swappable behind a clean data-fetching layer, precisely because of #1.
3. **§28.1 (Commercial Launch Gate)** forbids accepting real orders until compliance, payment approval, shipping feasibility, and legal review are cleared — but explicitly permits development, testing, staging, and non-commercial validation beforehand.

Together these mean the correct build strategy is **not** "wait for decisions." It is: define a backend-agnostic domain layer, ship a mock adapter, and build every UI surface, content system, and demand-capture flow against it now — so that when the gated decisions land, they are adapter and config work, not rework.

**Decisions taken for this plan** (confirmed with the owner):
- Commerce via an abstraction + mock adapter, with **Medusa (self-hosted) selected as the real adapter target for Phase 8** — resolves A1's platform side (Medusa supports the custom checkout §6.5/§14/§29.3 require; a hosted-Shopify-checkout path would not have).
- **MVP market scope: India-only, domestic B2C** (PRD §28.2, resolved 2026-09-25). Foreign expansion is a planned future phase and is **B2B, not B2C** — a different buyer/pricing model, not just "more countries" on the same consumer checkout. Multi-currency, duty disclosure, and international shipping (PRD §12–14) are **out of MVP scope entirely**, not merely blocked on a vendor TBD — see the updated **A5**/**A8**/**A9**/**A10** and Phase 5 below.
- Journal and product story/compliance content authored as MDX/structured fields in-repo.
- Brand assets remain a placeholder pending the owner; the placeholder visual theme (§2) is used for build purposes until replaced.

**Nothing in this plan invents a business requirement.** Where the PRD is silent or self-contradictory, it is listed in the section below rather than resolved unilaterally.

---

## 1. Technical Ambiguities & Contradictions To Resolve

These must be settled by the owner. Ordered by how much rework they cause if resolved late.

### Blocking — resolve before the phase noted

**A1. RESOLVED — Medusa selected. Hosted checkout vs. custom checkout would have effectively decided the backend. (§6.5, §14, §27, §29.2, §29.3)**
The PRD requires a custom multi-step checkout, duty/tax disclosure *restated before payment* at the review step, and Flavoland-sent status-change emails. A non-Plus Shopify Storefront API integration would have handed the customer to Shopify's hosted checkout, where none of those three are controllable. **The owner has selected Medusa (self-hosted)**, which gives full control over checkout, disclosure placement, and email dispatch — satisfying §6.5/§14/§29.3 as written, no PRD amendment needed. Remaining work is operational, not a requirements gap: Medusa must be hosted and run (the owner takes on that responsibility as a solo operator), and Phase 8 should validate Medusa's customer/order API against **A6/A7** (guest checkout, magic-link order lookup, retroactive guest-order linking) before building against it, since those are the identity-surface features most likely to need custom work on top of Medusa's defaults.

**A2. DDP is disclosed but never collected. (§14, §29.2) — before Phase 6**
§14 CONFIRMED requires supporting duty-inclusive (DDP) *and* customer-pays (DDU). §14's MVP scope and §29.2's acceptance criteria only cover **disclosure text**. Nothing in the PRD says how the duty *amount* is collected under DDP — whether prices are set per-market to absorb it, a duty line item is added at checkout, or a flat uplift is applied. Disclosure alone cannot make DDP operationally true. The data model below reserves a place for this; the mechanism is an open business decision.

**A3. Quantity-level stock validation is impossible against the specified stock model. (§7.1 vs §9)**
§7.1 models stock as a status enum (in stock / low / out of stock / discontinued). §9 requires "stock validation before checkout entry," which implies quantity. With an enum only, the system can block out-of-stock/discontinued items but cannot prevent ordering 40 units of a 3-unit item. Either add an optional integer quantity to the model, or accept enum-only validation as the MVP behaviour.

**A4. Cart persistence: browser storage vs. httpOnly cookie. (§6.4/§9 vs §25)**
§6.4 and §9 specify guest cart persistence "via browser storage/session token." §25 requires "secure, httpOnly cookies for session/cart tokens." These are mutually exclusive — JavaScript cannot read an httpOnly cookie. Recommended resolution: server-owned cart, opaque cart ID in an httpOnly cookie, no cart contents in localStorage. Needs confirmation since it changes §9's offline behaviour.

**A5. RESOLVED for MVP — no EU/UK exposure. Consent layer necessity is unknowable while countries are TBD. (§19 vs §1.2)**
§19 requires GA4 + Meta Pixel from day one, and a consent-gated tag layer *if any EU/UK market is in scope*. MVP is India-only (domestic B2C), so there is no EU/UK exposure at launch and the GDPR-grade consent-gate requirement does not apply to MVP. **Still build fail-closed** — no marketing/analytics tag fires before explicit consent — as a low-cost default that also covers India's own DPDP Act 2023 (a separate, lighter-weight consideration from GDPR; not legal advice, flag alongside §20.2 sign-off). The full EU/UK-grade CMP work becomes necessary only if/when the future foreign B2B phase (§28.3) adds an EU/UK-adjacent market.

### Significant — flag, then proceed

**A6. "Swappable backend" is achievable for catalogue, not for identity.** (§27.2 vs §10)
Products, collections, and content abstract cleanly. Guest checkout, magic-link order lookup, and **retroactive linking of prior guest orders to a newly created account by verified email** (§10, §29.1) are deeply platform-specific and, on some hosted platforms, not exposed at all. The adapter interface should mark the identity/order surface as the boundary where swap cost is real.

**A7. Retroactive account linking requires an email verification step the PRD never specifies.** (§6.6, §10.1, §29.1)
§29.1 says prior guest orders appear "when the account is verified." §6.6 describes only a "create an account to save this order" prompt. The verification step (and whether it is the same magic-link mechanism, upgraded in scope) is undefined. §25 further requires magic-link tokens be "scoped to order-lookup only unless upgraded to full account auth" — that upgrade path is unspecified.

**A8. MOOT for MVP — single currency. Geo-detected currency conflicts with static rendering and CLS targets.** (§12 vs §18, §26)
Auto-detecting currency by IP with manual override defeats a single cached static page and risks a layout shift when prices resolve after hydration. **MVP is India-only, single currency (INR)** — there is no currency to detect or convert, so this entire tension is deferred, not resolved-by-engineering. When the future foreign B2B phase (§28.3) reactivates §12, revisit: resolve country in middleware, render prices server-side, cache per-country variants, treat FX rates as daily-revalidated data. Note the PRD's own §12 caveat — displayed price is indicative, settlement may differ — is a genuine future-phase UX friction, not a bug.

**A9. MOOT for MVP — no duties at all domestically. Product-level duty variance is CONFIRMED but out of MVP scope.** (§14)
§14 CONFIRMED says the DDP/DDU decision is made "per destination country/product/shipping provider." MVP ships domestically within India — there are no customs duties to disclose or resolve at all, so no duty-resolver code is needed for MVP (not even the per-country-default version). Keep the data model's optional duty fields (below) as future-proofing only; build the resolver logic when §14 reactivates in the foreign B2B phase (§28.3).

**A10. MOOT for MVP — no cross-border transit. Market eligibility is static; shelf-life-at-delivery is dynamic.** (§7.1 vs §13)
§7.1 models eligibility as a per-product/per-market boolean. §13's shelf-life-at-delivery concern is a cross-border transit-time problem; MVP's domestic India transit times are short and single-market, so this simplification isn't even needed yet — `marketEligibility` can stay a single-entry array (India) with no per-market variance to model until the foreign B2B phase.

**A11. Three persistent mobile UI elements compete for the same space.** (§23.3)
Sticky Add-to-Cart bar, always-visible cart badge, and a prominent WhatsApp click-to-chat — plus the consent banner from A5 — all target the mobile viewport at once, against a <375px minimum supported width. Needs a deliberate stacking/priority rule at design time or §23.5's "no horizontal scrolling" and touch-target minimums will be hard to hold.

**A12. Third-party scripts are the main threat to the mobile CWV targets.** (§19 vs §23.4, §26)
GA4 + Meta Pixel + a consent layer, measured under simulated 4G with no looser mobile standard (§23.5), is the classic INP/LCP failure mode. Mitigation is planned (post-consent deferred loading, no tag manager on the critical path), but the tension is real and should be measured, not assumed away.

**A13. Legal pages must ship as drafts.** (§6.12, §20.2)
Content is explicitly not legal advice pending review. Recommendation: build the routes, mark drafts visibly, and `noindex` them until sign-off — otherwise unreviewed policy text becomes publicly indexed.

**A14. Build order differs from the PRD's list order.** (§1.1 says "build in that order" referring to §28.2)
§28.2 is a scope list, not a dependency graph, and it predates §28.1's gate. The sequence in §7 below reorders to put all non-gated work first. Flagging explicitly since §1.1 phrases the list as an ordering instruction.

**A15. §22 (Admin Requirements) has no build phase or owner in this plan.** (§20.3, §22, §27)
§22 requires product management, order management including issuing refunds/replacements, sourcing-request review, content management, and per-country config — all admin-side. §22 itself suggests "if using Shopify headless or Medusa, evaluate leveraging their native admin rather than building custom admin screens," and now that Medusa is selected (**A1**), that's a concrete, checkable question rather than a hypothetical: Medusa Admin covers catalogue and order management natively, but it must still be confirmed against §22's specific list — sourcing-request review and refund/replacement issuance in particular — before assuming no custom admin screens are needed. Until Phase 8, product/content changes happen by editing seed JSON/MDX in git (Phase 1's `data/seed/`), which is fine as a Phase 0–7 stopgap but was never stated as a decision; stating it here. Resolve in **Phase 8** (see §7).

### Not blockers, but unresolved inputs

- Brand assets (final logo, wordmark, brand copy) are still pending from the owner (§1.2). A **placeholder visual theme** — warm cream background, terracotta-orange accent, rounded display type, pill/circle shape language (see §2 Design Tokens) — is adopted now, modeled on a reference screenshot the owner supplied, so Phase 0 has something concrete to scaffold against. Plan builds on semantic design tokens so swapping in the final logo and copy later is a token/asset swap, not a rewrite.
- Newsletter/ESP provider is unspecified beyond "Email" in §27.1.
- No PRD requirement covers admin authentication, order-data retention, or India's DPDP Act data-subject request handling for MVP; GDPR/CCPA-specific handling becomes relevant only if the future foreign B2B phase (§28.3) adds an EU/UK/California-adjacent market (**A5**).

---

## 2. Architecture

Single Next.js 15 App Router application (TypeScript, React 19, Tailwind v4), deployed on Vercel. One repository. If a self-hosted backend is chosen at Phase 8, it deploys separately and is reached only through the adapter.

The central structural rule: **no UI file imports a backend SDK.** Everything goes through `lib/commerce`.

```
UI (app/, components/)
        ↓  domain types only
lib/commerce/client.ts  →  getCommerce(): CommerceAdapter
        ↓
adapters/mock  (Phases 1–7)   adapters/<chosen>  (Phase 8+)
```

Three layers that are deliberately *not* the commerce backend's job, and stay in-repo regardless of A1:

- `lib/markets` — country config: display currency, DDP/DDU model, disclosure copy, shipping bands, enabled flag.
- `lib/content` — MDX Journal and structured story/compliance content.
- `lib/analytics` — consent-gated event layer.

### Design Tokens (placeholder theme, pending final brand assets)

Modeled on a reference screenshot the owner supplied (warm, homely, food-brand aesthetic). All values below are **semantic tokens** (`bg-background`, `text-primary`, etc.), not hard-coded literals in components, so the eventual real logo/palette drops in as a token swap — no component code changes.

- **Colour tokens**
  - `--color-background`: warm cream/peach (`#FBEEE0`-ish) — page background
  - `--color-surface-badge`: soft peach (`#F7DDC4`-ish) — pill badge fill
  - `--color-primary` (accent): terracotta-orange (`#E8622C`-ish) — wordmark, badge text, links, primary CTAs
  - `--color-accent-icon`: amber-orange (`#F2941F`-ish) — solid fill for circular checkmark bullets
  - `--color-text-primary`: near-black warm charcoal (`#211C1A`-ish) — headings
  - `--color-text-secondary`: warm gray (`#6B6058`-ish) — body copy, subheadings
- **Typography direction**
  - Display/heading face (incl. wordmark): bold, rounded/geometric sans — placeholder candidate Baloo 2 or Fredoka-style rounded sans, until the real brand font/logo is supplied
  - Body/UI face: neutral, highly legible sans — placeholder candidate Inter or Nunito Sans
- **Shape language**
  - Fully-rounded pill shape for badges, buttons, and primary CTAs
  - Circular icon bullets (checkmark-in-circle) for feature/benefit lists
  - Generous whitespace, centered hero layout for marketing sections (home, about, trust)

This theme is a placeholder pending the owner's final logo and brand copy (§1.2) — treat colour values as approximate until replaced.

---

## 3. Project Structure

```
flavoland/
  src/
    app/
      (marketing)/            home, about, trust, contact, legal/*
      (shop)/                 shop, collections/[slug], products/[slug]
      (journal)/              journal, journal/[slug], journal/category/[category]
      (commerce)/             cart, checkout, checkout/confirmation/[orderNumber]
      orders/                 lookup, [token]
      account/                index, orders
      request-a-product/      custom sourcing form
      api/
        webhooks/shipping/    tracking status ingest (Phase 10)
        webhooks/commerce/    catalogue/order sync + revalidate (Phase 8)
        sourcing/  newsletter/  orders/lookup/  orders/magic-link/
      sitemap.ts  robots.ts  opengraph-image.tsx
    components/
      ui/          primitives: Button, Field, Sheet, Drawer, Badge, Price
      layout/      Header, MobileNav, Footer, StickyActionBar, ConsentBanner, WhatsAppLink
      commerce/    ProductCard, ProductGrid, FilterChips, FilterDrawer, PdpGallery,
                   StoryBlock, ComplianceBlock, AddToCart, CartLine, CartSummary,
                   DutyDisclosure, CheckoutSteps, OrderStatusTimeline
      content/     ArticleBody, ProductEmbed, RelatedArticles
    lib/
      commerce/    types.ts  client.ts  adapters/mock/  adapters/<chosen>/
      markets/     config.ts  resolve.ts  duty.ts
      currency/    rates.ts  format.ts
      content/     journal.ts  schema.ts
      analytics/   consent.ts  events.ts  providers/{ga4,meta}.ts  utm.ts
      seo/         metadata.ts  jsonld.ts
      email/       templates/  send.ts
      validation/  zod schemas shared by forms + API routes
      rate-limit.ts
    content/journal/*.mdx
    data/seed/     products.json  collections.json  markets.json   (mock adapter source)
  tests/
    unit/          duty resolution, FX, eligibility, filters, content schema
    e2e/           one spec per PRD §29 + §23.5 acceptance criterion
```

---

## 4. Data Models

Defined in `lib/commerce/types.ts` — frontend-owned, backend-agnostic. Optionality is load-bearing: §29.4 requires that an unpopulated story block render *nothing*, not a placeholder.

**Product** — `id, slug, sku, title, shortDescription, longDescription, images[], basePrice{amount,currencyCode}, netWeight, ingredients[], allergens[], shelfLife, origin{country,region}, category, tags[], stock{status, quantity?}, sourcingType: 'direct_producer'|'regional_brand', marketEligibility: CountryCode[], story?: StoryBlock, compliance?: ComplianceBlock, seo{title?,description?}, relatedProductSlugs[]`

- `stock.quantity` optional — see **A3**.
- `sourcingType` is internal-only (§7.1); it may tone storytelling but must never render a direct-sourcing claim for a brand-sourced item (§7.1 CONFIRMED).

**StoryBlock** (all optional, block omitted entirely when absent) — `heading?, body, producer?, region?, culturalContext?, media[]`

**ComplianceBlock** (every field optional; §20 CONFIRMED — shown only where applicable and verified) — `fssaiReference?, certifications[], labTests[], allergenNotes?, shelfLifeNotes?, marketNotes: {country, note}[]`

**MarketConfig** — `countryCode, enabled, displayCurrency, dutyModel: 'DDP'|'DDU'|'none', dutyDisclosureCopy{cart,checkoutReview}, shippingBands[{label, estimateAmount, transitDaysMin, transitDaysMax}]`

- **MVP seeds exactly one market: India, `dutyModel: 'none'`** (resolved — §1.2, §28.2). The type stays a config-driven list (not hardcoded in components) purely so the future foreign B2B phase is a config/seed addition, not a schema migration — but no multi-market UI (selector, currency switcher) is built for MVP.
- `dutyModel` resolution is a pure function (`lib/markets/duty.ts`) taking `(countryCode, product?)`; for MVP it always returns `'none'`. **A9**'s product override and the DDP/DDU branches are future-phase work, not MVP.
- **A2**'s duty-amount mechanism only matters once DDP/DDU is reactivated; not needed for MVP.

**Cart** — `id, lines[{productId, slug, title, image, quantity, unitPrice, lineTotal}], subtotal, currencyCode, destinationCountry?, shippingEstimate?, dutyDisclosure?`
Server-owned; opaque id in an httpOnly cookie (**A4**).

**Order** — `id, orderNumber, email, status: 'placed'|'processing'|'shipped'|'in_transit'|'delivered'|'exception', lines[], totals{subtotal,shipping,duties?,total,currencyCode}, shippingAddress, shipments[{carrier, trackingNumber, trackingUrl, events[{status,timestamp,description}]}], dutyModel, utm?, createdAt`

- `utm` persisted at order creation — §2.1 and §19 require conversion attribution by source, which is impossible to reconstruct afterwards.

**SourcingRequest** — `id, productDescription, region?, referenceUrl?, referenceImage?, quantityInterest, destinationCountry, email, status: 'new'|'reviewing'|'responded'|'closed', createdAt` (§6.8)

**Article** — `slug, title, excerpt, heroImage{src,alt}, category, publishedAt, updatedAt?, body (MDX), relatedProductSlugs[], seo{title?,description?}` — frontmatter validated by zod at build time so a malformed article fails the build rather than the page (§17, §18).

---

## 5. Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static + ISR | Hero, featured collections, 4–8 products, trust strip, newsletter (§6.1) |
| `/shop` | Static + ISR, URL-driven filters | `?category=&region=&diet=&sort=&q=` — chips + basic keyword search only (§8) |
| `/collections/[slug]` | SSG + ISR | §5 |
| `/products/[slug]` | SSG + ISR | Conditional story/compliance blocks; Product JSON-LD (§6.3, §29.4) |
| `/journal`, `/journal/[slug]`, `/journal/category/[category]` | SSG | MDX; BlogPosting JSON-LD; product embeds (§17) |
| `/cart` | Dynamic | Duty disclosure #1 (§14) |
| `/checkout` | Dynamic | Step flow; duty disclosure #2 at review, before payment (§6.5, §14) |
| `/checkout/confirmation/[orderNumber]` | Dynamic | Tracking access + optional account prompt (§6.6) |
| `/orders/lookup` | Dynamic | Email + order number (§6.7, §29.3) |
| `/orders/[token]` | Dynamic | Magic link; single-purpose, short expiry (§10.1, §25) |
| `/account`, `/account/orders` | Dynamic | Optional; never required to purchase (§10) |
| `/request-a-product` | Static shell + server action | Lead capture only, no payment (§6.8, §16) |
| `/about`, `/trust`, `/contact` | Static | §6.10, §6.11 |
| `/legal/{terms,privacy,refunds,shipping}` | Static | Draft-marked, `noindex` until sign-off (**A13**) |
| `/api/webhooks/shipping` | Route handler | Signature-verified; updates status, triggers email (§15, §29.3) |
| `/api/{sourcing,newsletter,orders/lookup,orders/magic-link}` | Route handlers | Rate-limited, zod-validated (§25) |
| `sitemap.ts`, `robots.ts` | Generated | §18 |

Country resolution middleware, per-country price/duty-copy rendering, and per-country static-page variants (**A8**) are **future-phase work**, not MVP — MVP has exactly one market (India), so nothing needs resolving at request time.

---

## 6. Integrations & Dependencies

**Core:** `next@15`, `react@19`, `typescript`, `tailwindcss@4`, `zod`
**Content:** `next-mdx-remote` (or `@next/mdx`), `gray-matter`, `rehype-slug`, `remark-gfm`
**Email:** `resend` + `react-email` — transactional only at MVP (confirmation, shipping status, magic link). Newsletter ESP unspecified in the PRD; capture to a stored list behind an interface until chosen.
**FX:** not needed for MVP (single currency, INR) — deferred entirely to the future foreign B2B phase (§12, §28.3), not just cached-and-decided-later.
**Rate limiting:** `@upstash/ratelimit` + Upstash Redis (magic-link and form endpoints, §25).
**Bot protection:** Cloudflare Turnstile on sourcing + newsletter forms.
**Analytics:** hand-rolled consent gate; GA4 via `gtag`, Meta Pixel — both loaded only after explicit consent, deferred off the critical path (**A5**, **A12**).
**Testing:** `vitest` (unit), `@playwright/test` (E2E incl. mobile viewports), `@axe-core/playwright` (§24), Lighthouse CI under mobile throttling (§23.4, §26).

**Commerce (decided, enters at Phase 8):** Medusa JS SDK, behind `lib/commerce/adapters/medusa/`, never imported directly by a component.

**Deferred until decided — no dependency added now:** payment SDK (§11, domestic India gateway), shipping SDK (§13, domestic India logistics for MVP — simpler evaluation than the PRD's original international-shipping criteria, since no cross-border shipments exist at MVP). Each enters behind the adapter or a route handler, never in a component.

---

## 7. Build Sequence

Ordered so that everything not blocked by §28.1's gate happens first. See **A14** regarding the divergence from §28.2's list order.

**Ungated — buildable immediately**

- **Phase 0 — Foundations.** Next.js + TS + Tailwind scaffold, semantic design tokens seeded with the placeholder visual theme (§2 Design Tokens — warm cream/terracotta palette, rounded display type, pill/circle shapes; §1.2), mobile-first layout shell, header/mobile nav, footer, a11y baseline, CI (typecheck, lint, test).
- **Phase 1 — Commerce abstraction.** `lib/commerce/types.ts`, the `CommerceAdapter` interface, the mock adapter, and a 10–20 SKU seed set exercising every optional field combination — with story, without story, with partial compliance, market-restricted. *This is the phase that makes everything after it backend-independent.*
- **Phase 2 — Catalogue.** Shop grid, filter chips, filter drawer (mobile), keyword search, collections, PDP with conditional blocks, cross-sell, Product/Organization JSON-LD, per-product SEO metadata.
- **Phase 3 — Content.** MDX pipeline with zod-validated frontmatter, Journal listing + article template + category filters, in-article product embeds, About, Trust & Compliance Hub, Contact, draft legal routes.
- **Phase 4 — Demand capture.** Custom sourcing form, newsletter signup, WhatsApp click-to-chat, admin notification emails. *Delivers §2.1 demand-signal metrics and can go live before the commercial gate clears.*
- **Phase 5 — Markets & money (simplified for MVP).** Single seeded `MarketConfig` (India, INR, `dutyModel: 'none'`); INR price formatting only — no FX fetch, no country middleware, no duty resolver (**A8**, **A9**, **A10** all moot for MVP). The config shape stays list-based and swappable so the future foreign B2B phase is additive, but nothing multi-market is built now.
- **Phase 6 — Cart & checkout UI.** Server cart against the mock adapter, cart page, multi-step mobile-first checkout. **No duty disclosure UI at MVP** (domestic-only, §14 moot — see **A9**). Payment step stubbed behind an interface. (Depends on **A4**; **A2** no longer applies to MVP.)
- **Phase 7 — Analytics & consent.** Fail-closed consent gate, GA4 + Meta Pixel post-consent, the §19 event schema, UTM capture persisted to order metadata.

**Gated — each blocked on a §28.1 / §1.2 decision**

- **Phase 8 — Medusa adapter.** Platform choice resolved (**A1**); still gated on §28.1 in the sense that this is where real backend infrastructure goes live. Stand up Medusa (hosting/ops), validate its customer/order API against **A6/A7** before committing to it for identity, implement the real `CommerceAdapter`, delete nothing else. Catalogue sync/revalidation webhooks. Resolve **A15** (admin surface) here: confirm Medusa Admin covers §22's product/order/refund management, or scope the gap.
- **Phase 9 — Payment.** Blocked on gateway selection + approval (§11). Hosted fields or redirect only — no raw card form (§11, §25).
- **Phase 10 — Shipping & tracking.** Blocked on a domestic India logistics provider selection (§13, MVP scope). Live rates, address validation, tracking webhooks, status-change emails (§15, §29.3). International shipping integration is future-phase (§28.3), not part of this phase.
- **Phase 11 — Accounts & order access.** Magic-link lookup, optional account creation, retroactive guest-order linking. Partly gated by **A6**/**A7** and by the Phase 8 outcome.
- **Phase 12 — Launch hardening.** Full §29 + §23.5 acceptance suite, axe audit, mobile CWV under throttling, security review, legal sign-off, and a written §28.1 gate checklist that must be signed before commerce is enabled.

---

## 8. Verification

**Per phase:** `tsc --noEmit`, lint, `vitest run`, and the E2E specs written for that phase's acceptance criteria.

**Unit (`vitest`)** — INR price formatting; shop filter/search logic (§8); MDX frontmatter schema rejection of malformed articles. Duty model resolution and FX conversion (§29.2, §29.6) are **future-phase tests**, not MVP — there's no duty/FX logic to unit-test until §14/§12 reactivate (§28.3).

**E2E (`playwright`)** — one spec per MVP acceptance criterion, run at 360px, 768px, and 1280px:
- §29.1 guest checkout completes with no account; magic link opens order status without a password; post-hoc account surfaces prior guest orders.
- §29.3 shipping webhook advances status and dispatches an email; email + order number lookup succeeds and fails closed on a mismatch.
- §29.4 populated story renders; **absent story renders no empty section** — assert the element does not exist.
- §29.5 sourcing submission returns manual-review/no-payment confirmation and notifies admin.
- §23.5 no horizontal scroll under 768px; sticky Add-to-Cart stays reachable; email/numeric `inputmode` on the right fields; hamburger exposes all primary nav.
- §29.2 (duty disclosure) and §29.6 (multi-currency) are **not MVP acceptance criteria** — write these specs when the foreign B2B phase (§28.3) reactivates §12/§14.

**Non-functional** — `@axe-core/playwright` on home/shop/PDP/cart/checkout for WCAG 2.1 AA (§24); Lighthouse CI on home and PDP under simulated mid-tier mobile/4G asserting LCP < 2.5s, CLS < 0.1, INP < 200ms (§23.4, §26); `npm audit` in CI (§25).

**Manual before launch** — iOS Safari + Android Chrome across the §23.2 breakpoints (§23.4), and the §28.1 gate checklist signed off.

**Adapter swap validation (Phase 8)** — the entire Phase 2–7 test suite must pass unchanged against the real adapter. Any test that needs editing marks a leak in the abstraction and is itself the finding.
