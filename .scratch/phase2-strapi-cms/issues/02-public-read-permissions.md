# 02: Public read permissions for Listing and Agent

**What to build:** the permissions change that lets `apps/web`'s build read Strapi's content without an API token.

In Strapi's Users & Permissions plugin, grant the `Public` role `find` and `findOne` on `Listing` and `Agent`. No API token is required for these reads — this is the same Listing/Agent data the static build is about to publish to the world anyway (per `docs/specs/phase2-strapi-cms.md`'s Public read access decision), so gating it behind a secret adds handling with no real security benefit. Confirm Strapi's default behavior of only returning Published entries through the public API holds (Draft Listings must not be readable via the public `find`/`findOne` endpoints) — this is what makes Draft & Publish (ticket 01) actually gate site visibility rather than just being a label in the admin panel.

Write access (creating/editing content in the admin panel) is unaffected — it stays behind normal Strapi admin authentication, which this ticket doesn't touch.

**Blocked by:** 01 (needs the `Listing`/`Agent` content-types to exist)

**Status:** ready-for-agent

- [ ] `Public` role has `find` + `findOne` permission on `Listing`
- [ ] `Public` role has `find` + `findOne` permission on `Agent`
- [ ] An unauthenticated `GET` to `/api/listings` (no API token) returns Published Listings only — verify by creating a Draft Listing and confirming it does not appear in the response
- [ ] An unauthenticated `GET` to `/api/agents` returns Agent data without a token
- [ ] The admin panel (write access) still requires login — unaffected by this change
