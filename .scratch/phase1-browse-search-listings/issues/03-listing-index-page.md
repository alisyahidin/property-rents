# 03: Static listing index page

**What to build:** the page a Visitor lands on to browse every published Listing, from the user's perspective — user stories 1, 2, 13, 23 in the spec.

A statically rendered index page that lists every Listing from the Content Collection at build time, sorted in the consistent default order (call `filterListings(listings, {})` rather than re-implementing sort logic). Each Listing in the list shows Rent, Property Type, City/Area, bedroom count, a cover photo (first Gallery image), and an Availability badge. Fully usable on a small screen (this is the mobile-usability bar for the whole feature — get it right here since ticket 04 builds on this page's markup).

This page also embeds the full Listing set as a small serialized payload for ticket 04's client-side filter island to consume — coordinate the payload shape/location so ticket 04 doesn't have to restructure this page's output.

See `docs/specs/phase1-browse-search-listings.md` (Implementation Decisions: "Rendering strategy") for the static-embed approach and rationale (ADR 0003).

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [x] Index page renders every Listing from the `listings` Content Collection at build time
- [x] Sort order comes from `filterListings(listings, {})`, not separately re-implemented
- [x] Each list item shows: Rent, Property Type, City/Area, bedroom count, cover photo, Availability badge
- [x] Layout is usable on a small (phone-width) screen
- [x] Full Listing set is embedded as a serialized payload on the page, in a shape ticket 04 can consume directly for client-side filtering
- [x] `astro build` succeeds and the page renders correctly with seed data (verify manually via dev server)
