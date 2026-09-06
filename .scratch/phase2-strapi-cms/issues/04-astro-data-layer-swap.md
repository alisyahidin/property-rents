# 04: Swap apps/web's data layer from the Content Collection to Strapi

**What to build:** the actual data-source swap ADR 0002 committed Phase 1's schema to preparing for — the moment where `apps/web` stops reading `src/content/listings/*.json` and starts reading Strapi.

Replace the three `getCollection('listings')` call sites — the homepage's featured section, `/properties`, and `/properties/[slug]`'s `getStaticPaths` — with a fetch against Strapi's REST API (`/api/listings?populate=agent` or equivalent) at build time. Add a small reshaping function that turns Strapi's API response shape into the exact `Listing` type `filterListings` (`apps/web/src/lib/filterListings.ts`) already expects, so `filterListings` itself needs zero changes — per the spec, this is the seam ADR 0002 was betting the whole migration on. Give this reshaping function its own unit tests (fixed Strapi response in, asserted `Listing` object(s) out), the same style as `filterListings`'s existing suite.

Once the site builds correctly against Strapi (verify all pages render the migrated data from ticket 03 correctly, including Agent info via the relation), delete `apps/web/src/content.config.ts` and the seed JSON files under `apps/web/src/content/listings/` — Strapi is now the single source of truth, not a second data source that can drift from it.

See `docs/specs/phase2-strapi-cms.md` (Implementation Decisions: Data-layer swap, Content Collection removal).

**Blocked by:** 03 (needs real migrated data in Strapi to build and verify against)

**Status:** ready-for-agent

- [ ] All three call sites fetch from Strapi instead of `getCollection('listings')`
- [ ] A reshaping function converts Strapi's response shape into the existing `Listing` type, with its own unit tests
- [ ] `filterListings.ts` itself has zero changes
- [ ] `astro build` succeeds and every page (homepage featured section, `/properties` browse/filter, every `/properties/[slug]`) renders the same content it did against the Content Collection, including Agent name/phone/email/photo via the relation
- [ ] A `rented` Listing still has no Inquiry action; an `available` one still does, addressed to the correct Agent's email
- [ ] `apps/web/src/content.config.ts` and `apps/web/src/content/listings/*.json` are deleted
- [ ] `pnpm test` still passes (existing `filterListings` suite untouched, new reshaping-function suite passing)
