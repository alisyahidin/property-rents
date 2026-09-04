# 04: Client-side filter island

**What to build:** the interactive filtering experience on top of the index page — user stories 3–14 in the spec.

A hydrated island on the listing index page (ticket 03) that lets a Visitor filter by Property Type, City, Area (scoped within the selected City), minimum/maximum bedrooms, Rent range, and Availability (`available`-only vs. including `rented`), in any combination, calling `filterListings` directly against the payload ticket 03 embedded — no server round-trip, no full page reload. Show the current match count, a "clear all filters" control, and a clear "no results" message when a combination matches nothing. Results stay in the same consistent order (`filterListings`'s default Rent-ascending sort). Usable on a small screen.

See `docs/specs/phase1-browse-search-listings.md` (Implementation Decisions: "Rendering strategy") — this is the "hydrated island... calling `filterListings` directly" piece.

**Blocked by:** 02, 03

**Status:** ready-for-agent

- [ ] Filter controls exist for: Property Type, City, Area (Area options scoped to the selected City), min/max bedrooms, min/max Rent, Availability
- [ ] Changing any filter updates the visible list client-side with no full page reload, via `filterListings`
- [ ] Multiple filters combine correctly (AND semantics across dimensions)
- [ ] Current match count is displayed and updates with filters
- [ ] A "clear all filters" control resets to the full unfiltered list
- [ ] An empty result set shows a clear "no results" message instead of a blank list
- [ ] Filtered results remain sorted by Rent ascending (or whatever order `filterListings` returns)
- [ ] Usable on a small (phone-width) screen
- [ ] Verified manually via dev server: each filter dimension alone, combined filters, clear-all, and the no-results state
