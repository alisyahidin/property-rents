# Phase 2: Strapi CMS Integration

Status: ready-for-agent
Category: enhancement

## Problem Statement

Every Listing and Agent on the site lives in Phase 1's Astro Content Collection — hand-edited JSON files that only a developer can safely change, with no way to stage a new Listing before it's visible and no way to enter an Agent once and reuse them across their Listings. ADR 0002 already committed Phase 1's schema to mirror a future Strapi content-type specifically so this moment would be a data-source swap, not a rewrite; this phase is that swap.

## Solution

Strapi becomes the Agency's content-management backend for Listings and Agents. The Agency's content maintainers create, edit, and publish content through Strapi's admin panel instead of editing files; `apps/web`'s build fetches from Strapi's API instead of the Content Collection, which is deleted once the swap is verified. The site stays fully static per ADR 0003 — Strapi publishes trigger a webhook that fires a Vercel deploy hook, rebuilding the site, rather than any server-side rendering or request-time fetching. Strapi is scoped to content the Agency authors; Inquiry stays exactly as CONTEXT.md defines it today (an unpersisted `mailto:` link) — persisting visitor-submitted Inquiries is a different kind of backend concern this phase deliberately doesn't pick up. Strapi's compute runs on a self-managed VPS, with its database on Neon and file uploads on Cloudinary — per ADR 0004, split across providers so a database or a disk doesn't depend on the compute box's own lifecycle, and (for compute specifically) to sidestep the card-verification friction that turned out to be common across free-tier PaaS options.

## User Stories

1. As the Agency's content maintainer, I want to create, edit, and publish Listings and Agents in Strapi's admin panel, so I don't need a developer to hand-edit JSON files to change what's on the site.
2. As the Agency's content maintainer, I want to enter each Agent once and attach them to every Listing they manage, so I'm not retyping the same name, phone, email, and photo per Listing (ADR 0005).
3. As the Agency's content maintainer, I want to save a new Listing as a Draft before it's visible on the site, so I can prepare it without publishing it prematurely.
4. As the Agency's content maintainer, I want the site to rebuild automatically when I publish, update, or unpublish a Listing, so changes go live without a developer triggering anything by hand.
5. As a Visitor, I want the site to look and behave exactly as it does today, so migrating the data source underneath it doesn't change anything I can see or do — browsing, filtering, viewing a Listing, or inquiring by email.
6. As a Visitor, I want a Listing marked `rented` to keep behaving exactly as before (stays up, badged, no Inquiry action offered), so Strapi's involvement doesn't change what CONTEXT.md's Availability means.
7. As the Agency's content maintainer, I want the 7 Listings already on the site migrated into Strapi, so switching to Strapi doesn't start the site over with nothing published.
8. As a developer, I want `apps/web`'s build to fetch Listings and Agents from Strapi instead of the Content Collection, so ADR 0002's committed data-source swap actually happens.
9. As a developer, I want Strapi's content-type schemas committed to `apps/cms` as code, so the content model is versioned and reviewable like the rest of this codebase.
10. As a developer, I want local development to work against the same Strapi instance as production without risking what's actually live, so this phase doesn't need a second hosting environment just to develop against real content.

## Implementation Decisions

- **Hosting topology**: Strapi (`apps/cms`) runs on a self-managed VPS (originally planned as a Render free web service — dropped after hitting card-verification friction that turned out to be common across free-tier PaaS, not Render-specific); its database on Neon's free Postgres (managed backups, decoupled from the VPS's own lifecycle); file uploads (Gallery, Agent photo) on Cloudinary via `@strapi/provider-upload-cloudinary` (keeps photos off the VPS's own disk and bandwidth). `apps/web` deploys to Vercel. See ADR 0004 for the full reasoning and the operational tradeoff a self-managed VPS takes on (OS patching, process supervision, TLS) that a PaaS would otherwise have absorbed.
- **Content-types**: `Listing` and `Agent` as separate Strapi content-types, related by a Listing → Agent relation (many Listings to one Agent) — not Agent as an inline component. See ADR 0005. Field names on both content-types mirror CONTEXT.md's vocabulary exactly, continuing ADR 0002's commitment: Listing gets Rent, Property Type, City, Area, bedroom count, Gallery, Availability, and an Agent relation; Agent gets name, phone, email, photo.
- **Draft & Publish**: enabled on `Listing`, layered independently on top of the existing Availability field (see CONTEXT.md's Draft/Published entry, added alongside this spec). `Published` gates whether a Listing appears on the site at all; `Availability` (`available`/`rented`) only has meaning among Listings that are Published. No live preview of Draft content is provided — staying fully static (ADR 0003) rules out the on-demand rendering a real preview would need, so staff check a Listing by publishing it.
- **Schema as code**: Strapi's generated `schema.json` for each content-type is committed under `apps/cms`, not left as admin-UI-only configuration — consistent with how the Zod schema was a first-class, reviewable artifact in Phase 1.
- **Public read access**: Strapi's Users & Permissions plugin grants public `find`/`findOne` on `Listing` (Published only) and `Agent`. No API token is required for `apps/web`'s build to read this data — it's the same data the static build is about to publish to the world anyway, so gating reads behind a secret adds handling with no real security benefit. Write access (the Strapi admin panel) stays behind normal Strapi admin authentication, which this phase doesn't change.
- **Rebuild trigger**: a Strapi webhook (Settings → Webhooks) fires a Vercel deploy hook on `Listing` `publish`, `update` (while Published), `unpublish`, and `delete` events — not on every Draft save, since Draft content isn't visible and doesn't need a rebuild.
- **Data-layer swap in `apps/web`**: the three call sites currently using `getCollection('listings')` (the homepage's featured section, `/properties`, and `/properties/[slug]`'s `getStaticPaths`) fetch from Strapi's REST API at build time instead, reshaping the response into the same `Listing` type `filterListings` already expects. `filterListings` itself is untouched — it already operates on Listing-shaped objects regardless of where they came from, which is exactly the seam ADR 0002's "data-source swap, not a rewrite" was betting on.
- **Content Collection removal**: `src/content.config.ts` and the seed JSON files under `src/content/listings/` are deleted once the Strapi-backed build is verified working — Strapi becomes the single source of truth, not a second data source that can drift from what's actually published.
- **Migration**: a one-off script reads the 7 existing seed JSON listings and creates the corresponding Agents and Listings in Strapi via its API (Agents first, then Listings referencing them, then publishing each Listing) — not manual re-entry through the admin panel, so what got migrated is reviewable and repeatable rather than typed by hand with no record.
- **Dev environment**: local development points at the same live Strapi instance as production; there's no separate staging Strapi. This is safe because of Draft & Publish — anything created or changed locally during testing defaults to Draft and never reaches the live site unless explicitly published.

## Testing Decisions

- `filterListings`'s existing unit suite is untouched — it doesn't test against the Content Collection or Strapi, only against fixed Listing-shaped objects, so the data-source swap doesn't affect it.
- The new Strapi-response-to-`Listing`-type reshaping function is a pure function and gets the same kind of unit coverage `filterListings` already has: given a fixed Strapi API response shape, assert on the resulting `Listing` object(s).
- The migration script is verified by running it once and confirming Strapi's admin panel shows the correct Agents and Listings, not by unit tests — it's a one-off tool, not logic that lives on in the codebase.
- Strapi's own admin panel, webhook delivery, and the Vercel deploy hook are verified manually (publish a test change, confirm a rebuild happens and the live site reflects it) — there's no automated test runner for either platform's configuration, consistent with Phase 1's decision not to introduce browser/E2E automation.

## Out of Scope

- Persisting Inquiries or building an Inquiry form — Strapi stays scoped to Agency-authored content; CONTEXT.md's Inquiry definition is unchanged, and "Phase 2 may persist Inquiries once a backend exists" remains an open door this phase doesn't walk through.
- A live preview of Draft content — would require reopening ADR 0003's fully-static commitment.
- Site-wide copy (agency name, footer blurb, social links) moving into Strapi — stays hardcoded in `Footer.tsx`/`Layout.astro`; nothing here asked for non-developer-editable site copy.
- A separate staging/preview Strapi environment — dev and prod share one instance, protected by Draft & Publish.
- Per-agent Strapi admin accounts, roles, or permissions beyond a single shared admin login — no multi-tenant content-editor story exists yet, and ADR 0001's single-agency framing gives no reason to build one now.
- GraphQL — `apps/web`'s build reads Strapi's REST API; nothing here needs GraphQL's added complexity at this scale.
- Modeling "the Agency" as a Strapi entity or content-type — ADR 0001 already treats it as unmodeled, and nothing in this phase requires changing that.

## Further Notes

- Scoped via a `/grill-with-docs` session (grilling + domain-modeling) rather than assumed — see ADR 0004, ADR 0005, and the Draft/Published entry added to `CONTEXT.md` alongside this spec.
- The hosting shape (a VPS for compute, Neon for the database, Cloudinary for uploads, rather than one all-in-one platform) is a deliberate response to real, hit-in-practice constraints, not an oversight to revisit later — see ADR 0004 for the full history, including the free-tier-PaaS card-verification issues that ruled out the originally-planned Render.
- Phase 1 (branch `phase1-browse-search-listings`) is merged to `main`; this phase builds on that merged state.

## Comments
