# 04: Swap apps/web's data layer from the Content Collection to Strapi

**What to build:** the actual data-source swap ADR 0002 committed Phase 1's schema to preparing for — the moment where `apps/web` stops reading `src/content/listings/*.json` and starts reading Strapi.

Replace the three `getCollection('listings')` call sites — the homepage's featured section, `/properties`, and `/properties/[slug]`'s `getStaticPaths` — with a fetch against Strapi's REST API (`/api/listings?populate=agent` or equivalent) at build time. Add a small reshaping function that turns Strapi's API response shape into the exact `Listing` type `filterListings` (`apps/web/src/lib/filterListings.ts`) already expects, so `filterListings` itself needs zero changes — per the spec, this is the seam ADR 0002 was betting the whole migration on. Give this reshaping function its own unit tests (fixed Strapi response in, asserted `Listing` object(s) out), the same style as `filterListings`'s existing suite.

Once the site builds correctly against Strapi (verify all pages render the migrated data from ticket 03 correctly, including Agent info via the relation), delete `apps/web/src/content.config.ts` and the seed JSON files under `apps/web/src/content/listings/` — Strapi is now the single source of truth, not a second data source that can drift from it.

See `docs/specs/phase2-strapi-cms.md` (Implementation Decisions: Data-layer swap, Content Collection removal).

**Amendments found while implementing:**
- A **fourth** call site existed that this ticket missed when it was written: `/about`'s "Meet the Agents" section also called `getCollection('listings')` directly to build its agent roster. Fixed the same way as the other three.
- Added a `slug` field to the Strapi `Listing` schema (see ticket 01's amendment) so `Listing.id` stays a readable string (`downtown-loft-apartment`) instead of becoming Strapi's random `documentId` — otherwise every Phase 1 URL would have changed.
- Strapi's `populate=*` does **not** recurse into a relation's own relations — `agent.photo` needed an explicit deep-populate query (`populate[agent][populate][photo]=true`), confirmed against the live instance before writing `fetchListings`.

**Blocked by:** 03 (needs real migrated data in Strapi to build and verify against)

**Status:** done

- [x] All three (really four, see amendment) call sites fetch from Strapi instead of `getCollection('listings')`
- [x] A reshaping function (`mapStrapiListing` in `apps/web/src/lib/strapi.ts`) converts Strapi's response shape into the existing `Listing` type, with its own unit tests (`apps/web/tests/strapi.test.ts`)
- [x] `filterListings.ts` itself has zero changes
- [x] `astro build` succeeds and every page (homepage featured section, `/properties` browse/filter, every `/properties/[slug]`, `/about`) renders the same content it did against the Content Collection, including Agent name/phone/email/photo via the relation — verified in-browser, including the client-side filter island (7 → 5 listings when toggling "Show available only")
- [x] A `rented` Listing still has no Inquiry action; an `available` one still does, addressed to the correct Agent's email
- [x] `apps/web/src/content.config.ts` and `apps/web/src/content/listings/*.json` are deleted
- [x] `pnpm test` still passes (18 existing tests untouched, 4 new `mapStrapiListing` tests passing — 22 total)
