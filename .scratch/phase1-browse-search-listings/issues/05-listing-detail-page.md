# 05: Listing detail page

**What to build:** the page a Visitor lands on after opening a Listing — user stories 15–18, 21, 23 in the spec.

One static page per Listing, generated at build time via `getStaticPaths`, keyed by a slug derived from the Content Collection entry id. The page shows the full Gallery (not just the cover photo), the Agent's name, phone, email, and photo, and the Rent, Property Type, City/Area, bedroom count, and Availability together. `rented` Listings are generated and reachable exactly like `available` ones — never removed or 404'd, so a bookmarked/shared link always keeps working. Usable on a small screen.

See `docs/specs/phase1-browse-search-listings.md` (Implementation Decisions: "Detail pages") and CONTEXT.md's Availability definition.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] One static page per Listing exists at build time via `getStaticPaths`, slug derived from the Content Collection entry id
- [x] Page shows the full Gallery (all images, in order), not just the cover photo
- [x] Page shows Agent name, phone, email, and photo
- [x] Page shows Rent, Property Type, City/Area, bedroom count, and Availability together
- [x] `rented` Listings generate a page and are reachable by URL identically to `available` ones
- [x] Usable on a small (phone-width) screen
- [x] `astro build` succeeds and each seed Listing's detail page renders correctly (verify manually via dev server)
