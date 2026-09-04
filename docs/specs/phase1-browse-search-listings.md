# Phase 1: Browse & Search Listings

## Problem Statement

Visitors have no way to see what the agency has available to rent — the site currently ships only the default Astro starter template, with no Listings displayed anywhere. The agency has no way to publish a Listing so that a Visitor can find it, learn its details, and get in touch about it.

## Solution

A static Phase 1 site where the agency's Listings live as Astro Content Collection entries. Visitors can browse the full set of published Listings, narrow it down by Property Type, City/Area, bedroom count, Rent, and Availability, open a Listing's detail page to see its full Gallery and Agent contact, and send an Inquiry about it via a `mailto:` link addressed to that Listing's Agent. No accounts, forms, or backend are introduced — Phase 1 stays fully static per ADR 0003, with the Listing schema shaped to mirror the future Strapi content-type per ADR 0002.

## User Stories

1. As a Visitor, I want to see a list of all published Listings, so I can browse what's available without searching first.
2. As a Visitor, I want each Listing in the list to show its Rent, Property Type, City/Area, bedroom count, a cover photo, and Availability badge, so I can scan results quickly.
3. As a Visitor, I want to filter Listings by Property Type (apartment, house, or room), so I only see the kind of unit I'm looking for.
4. As a Visitor, I want to filter Listings by City, so I only see Listings in the city I'm interested in.
5. As a Visitor, I want to further filter by Area within a City, so I can narrow to a specific neighborhood.
6. As a Visitor, I want to filter Listings by bedroom count (minimum and/or maximum), so I only see units that fit my household.
7. As a Visitor, I want to filter Listings by Rent range, so I only see units within my budget.
8. As a Visitor, I want to filter by Availability, so I can choose to see only `available` Listings or include `rented` ones too.
9. As a Visitor, I want to combine multiple filters at once (Property Type + City/Area + bedrooms + Rent range + Availability), so I can narrow to exactly what I want in one pass.
10. As a Visitor, I want filter results to update without a full page reload, so browsing a small list of Listings feels instant.
11. As a Visitor, I want to see how many Listings match my current filters, so I know whether narrowing further is worthwhile.
12. As a Visitor, I want to clear all filters at once, so I can go back to browsing the full set.
13. As a Visitor, I want filtered results in a consistent, predictable order (e.g. by Rent), so results aren't shuffled on every interaction.
14. As a Visitor, when no Listings match my filters, I want a clear "no results" message, so I know to broaden my search rather than think the site is broken.
15. As a Visitor, I want to open a Listing to see its full detail page, so I can learn more before reaching out.
16. As a Visitor, on a Listing's detail page, I want to see its full Gallery, so I can review all available photos, not just the cover photo.
17. As a Visitor, on a Listing's detail page, I want to see the Agent's name, phone, email, and photo, so I know who I'd be contacting.
18. As a Visitor, on a Listing's detail page, I want to see the Rent, Property Type, City/Area, bedroom count, and Availability together, so I have every detail in one place.
19. As a Visitor, on an `available` Listing's detail page, I want an Inquiry action addressed to that Listing's Agent, so I can express interest by email.
20. As a Visitor, I want the Inquiry email to come pre-filled with a subject/body referencing the specific Listing, so the Agent immediately knows which unit I'm asking about.
21. As a Visitor, when a Listing is `rented`, I still want to be able to open its detail page rather than hit a broken link, so a bookmarked or shared link keeps working.
22. As a Visitor, on a `rented` Listing's detail page, I don't want an active Inquiry action offered, so I'm not invited to inquire about a unit that's no longer available.
23. As a Visitor on a phone, I want the listing index and detail pages to be fully usable on a small screen, so I can search for a rental on the go.
24. As the Agency's content maintainer, I want to add a new Listing by creating a Content Collection entry with Rent, Property Type, City, Area, bedroom count, Gallery, Availability, and Agent (name, phone, email, photo) fields, so it appears on the site after the next build.
25. As the Agency's content maintainer, I want the Listing schema to validate required fields at build time, so a malformed entry fails the build loudly instead of shipping a broken page.
26. As the Agency's content maintainer, I want to mark a Listing `rented` without unpublishing it, so it stays visible (badged) rather than disappearing from the site.

## Implementation Decisions

- **Content Collection**: a `listings` Astro Content Collection, schema-validated (Zod) with fields matching CONTEXT.md's Listing definition: Rent (number, USD), Property Type (enum: `apartment` | `house` | `room`), City (string), Area (string), bedroom count (number), Gallery (ordered array of images), Availability (enum: `available` | `rented`), and Agent (name, phone, email, photo — `email` added to support the mailto Inquiry below). Field and enum naming should mirror CONTEXT.md's vocabulary exactly, since this schema is the one ADR 0002 commits to carrying forward into the Phase 2 Strapi content-type.
- **Agent representation**: Agent is stored as an inline object on each Listing entry (not a separate collection/reference) for Phase 1. This matches CONTEXT.md ("Agent is contact info on a Listing, not a login") and keeps the schema simple; it does mean the same Agent's info is duplicated across their Listings, which is an acceptable tradeoff for Phase 1's scale (per ADR 0003, under 50 listings).
- **Query/filter seam**: a single pure function, `filterListings(listings, criteria)`, in the site's data layer. It takes the full array of Listing objects (as loaded from the Content Collection) and a `criteria` object (`propertyType?`, `city?`, `area?`, `minBedrooms?`, `maxBedrooms?`, `minRent?`, `maxRent?`, `availability?`), and returns the matching subset in a consistent sort order (by Rent ascending, as the default). This function is framework-agnostic — no Astro APIs, no DOM — so it can run both at build time and in the browser unchanged.
- **Rendering strategy**: fully static, per ADR 0003. The listing index page renders the full Listing set at build time and embeds it as a small serialized payload; filtering/searching happens client-side (a hydrated island) calling `filterListings` directly — no server round-trip, no SSR query-string handling. This is viable specifically because of the small dataset size ADR 0003 already assumes.
- **Detail pages**: one static page per Listing generated at build time (`getStaticPaths`), keyed by a slug derived from the Content Collection entry id. `rented` Listings are still generated and remain reachable by URL — they are never removed or 404'd, consistent with CONTEXT.md's Availability definition.
- **Inquiry**: rendered as a static `mailto:` anchor on the Listing detail page, addressed to the Listing's Agent, with a URL-encoded subject/body referencing the Listing (e.g. Property Type, City/Area). No form, no submission handler, no persisted record — this matches CONTEXT.md's Phase 1 definition of Inquiry. The Inquiry action is omitted (not just disabled) when the Listing's Availability is `rented`.

## Testing Decisions

- A good test here only asserts on `filterListings`'s external behavior — given a fixed input array of Listing-shaped objects and a `criteria` object, assert on the returned array's contents and order. No test should reach into Astro rendering, the DOM, or file-system content loading.
- **`filterListings` is the only module with dedicated automated tests** in this spec — it's the single seam identified above, and the only piece of logic complex enough to be worth testing in isolation (each filter dimension, filters combined, empty-result case, default sort order).
- **No test runner currently exists in this repo** (no Vitest/Jest config, no test script in `apps/web/package.json` or `turbo.json`). Adding Vitest (scoped to `apps/web`, or hoisted to the workspace root if other packages will need it later) is part of this work, since there's no existing test setup to extend.
- Astro page/component rendering (the index page, filter UI, detail page, Inquiry link) is **not** covered by automated tests in this spec — there's no E2E/browser test runner (e.g. Playwright) set up yet, and introducing one is out of scope here. These are verified manually by running the dev server.
- There is no existing test suite in this repo to use as prior art; tests should follow standard Vitest conventions — one behavior per test, arrange/act/assert, no shared mutable fixtures between tests.

## Out of Scope

- Strapi CMS integration and the Phase 1→Phase 2 data-source migration (ADR 0002).
- SSR, ISR, or webhook-triggered rebuilds (ADR 0003) — Phase 1's rendering mode doesn't change.
- Persisted Inquiry records, an Inquiry form, or any backend/API (Phase 2 concern per CONTEXT.md's Inquiry definition).
- Visitor accounts, saved searches, or favorited Listings — no such concept exists in the domain model.
- Multi-agency/marketplace features or per-agent logins — explicitly rejected in ADR 0001.
- End-to-end/browser test automation (e.g. Playwright) — only the `filterListings` unit seam is tested in this round.
- Map-based search or geolocation-based results.
- Pagination — the full Listing set is rendered and filtered client-side, which ADR 0003's scale assumption (under 50 listings) makes unnecessary for now.

## Further Notes

- No issue tracker or triage label vocabulary is configured for this project yet, so this spec could not be published and labeled `ready-for-agent` automatically — run `/setup-matt-pocock-skills` to wire that up, then paste this spec in. It's written to the standard template and ready to file as-is.
- This is the first feature built in this repo (currently just the default Astro starter template plus `CONTEXT.md`/ADRs) — there's no prior Listing rendering, filtering, or test code to reconcile with.
