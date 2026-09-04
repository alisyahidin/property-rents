# 06: Inquiry mailto action

**What to build:** the way a Visitor expresses interest in a Listing — user stories 19, 20, 22 in the spec.

On an `available` Listing's detail page (ticket 05), add a static `mailto:` anchor addressed to that Listing's Agent, with a URL-encoded subject/body pre-filled with details referencing the specific Listing (e.g. Property Type, City/Area) so the Agent immediately knows which unit is being asked about. No form, no submission handler, no persisted record. When the Listing's Availability is `rented`, the Inquiry action is omitted entirely (not rendered, not just disabled/greyed out).

See `docs/specs/phase1-browse-search-listings.md` (Implementation Decisions: "Inquiry").

**Blocked by:** 05

**Status:** ready-for-agent

- [x] `available` Listing detail pages render a `mailto:` anchor addressed to the Listing's Agent `email` (added to the Agent schema in ticket 01)
- [x] Subject/body are URL-encoded and reference the specific Listing (Property Type, City/Area at minimum)
- [x] `rented` Listing detail pages render no Inquiry action at all (not present in the DOM, not just disabled)
- [x] Verified manually via dev server: clicking Inquiry on an `available` listing opens a mail client with prefilled subject/body; `rented` listings show no such control
