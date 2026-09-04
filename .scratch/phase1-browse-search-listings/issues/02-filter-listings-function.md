# 02: `filterListings` pure function + unit tests

**What to build:** the single query/filter seam the rest of the feature depends on — a framework-agnostic function that both build-time rendering and the client-side filter island call unchanged.

Implement `filterListings(listings, criteria)` in the site's data layer: takes the full array of Listing objects (shaped like the Content Collection entries from ticket 01) and a `criteria` object (`propertyType?`, `city?`, `area?`, `minBedrooms?`, `maxBedrooms?`, `minRent?`, `maxRent?`, `availability?`), and returns the matching subset sorted by Rent ascending by default. No Astro APIs, no DOM — pure data in, data out — so it works identically at build time (Node) and in the browser.

See `docs/specs/phase1-browse-search-listings.md` (Implementation Decisions: "Query/filter seam"; Testing Decisions) for the exact contract and test scope. Per the Testing Decisions, this is the *only* module with dedicated automated tests in this spec: cover each filter dimension individually, filters combined, the empty-result case, and the default sort order. Tests should assert only on `filterListings`'s external behavior (input array + criteria in, output array out) — no rendering, no DOM, no file-system content loading.

**Blocked by:** 01 (needs the Listing shape from the Content Collection schema)

**Status:** ready-for-agent

- [ ] `filterListings(listings, criteria)` implemented as a pure, framework-agnostic function
- [ ] Supports all criteria fields: `propertyType`, `city`, `area`, `minBedrooms`, `maxBedrooms`, `minRent`, `maxRent`, `availability`
- [ ] Omitted/undefined criteria fields impose no filter (an empty `criteria` object returns everything, sorted)
- [ ] Default sort order is by Rent ascending
- [ ] Vitest suite covers: each filter dimension individually, multiple filters combined, the empty-result case, and default sort order
- [ ] `pnpm test` (or equivalent) passes
