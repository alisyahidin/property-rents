# 01: Content Collection schema + seed data + Vitest scaffold

**What to build:** the `listings` Astro Content Collection that every other ticket in this spec builds on, plus the test tooling this spec requires.

Define a Zod-validated `listings` Content Collection matching CONTEXT.md's Listing vocabulary exactly: Rent (number, USD), Property Type (enum `apartment` | `house` | `room`), City (string), Area (string), bedroom count (number), Gallery (ordered array of images), Availability (enum `available` | `rented`), and Agent (name, phone, email, photo — inline object, not a reference/collection). Agent's `email` was added to CONTEXT.md alongside this ticket to support ticket 06's mailto Inquiry, which CONTEXT.md's Inquiry definition already committed to but the prior Agent field list didn't support. A malformed entry must fail the build. Add a handful of seed Listing entries (mix of `available` and `rented`, varied Property Type/City/Area/bedrooms/Rent) so later tickets have real content to render against.

Add Vitest to `apps/web` (or hoisted to the workspace root if that's cleaner given the current turbo/workspace setup) since no test runner exists in this repo yet — this ticket only needs to prove it works (e.g. a trivial smoke test); ticket 02 adds the real suite.

See `docs/specs/phase1-browse-search-listings.md` (Implementation Decisions, Testing Decisions) and `docs/adr/0002-phase1-content-collections-mirror-strapi.md` for the schema/vocabulary source of truth.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] `src/content/config.ts` (or equivalent) defines a `listings` collection with a Zod schema covering all fields above (including Agent `email`), field/enum names matching CONTEXT.md exactly
- [x] A handful of seed Listing entries exist, covering both Availability values and a spread of Property Types/Cities/Areas/bedroom counts/Rents
- [x] An intentionally malformed entry fails `astro build` / `astro check` (verify manually, then remove it — don't ship it)
- [x] Vitest is installed and runnable via a package script (e.g. `pnpm --filter web test` or workspace-root equivalent), with at least one smoke test passing
- [x] `astro build` succeeds with the seed data in place
