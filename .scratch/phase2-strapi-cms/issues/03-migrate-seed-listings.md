# 03: Migrate the 7 seed listings into Strapi

**What to build:** a one-off script that reads the existing Content Collection's seed data and creates the equivalent Agents and Listings in Strapi, so Strapi doesn't start empty.

Read the 7 JSON files under `apps/web/src/content/listings/`. For each distinct Agent found across them (matched by email, same dedupe key the About page already uses), create one `Agent` entry in Strapi via its API. Then create one `Listing` entry per JSON file, referencing the corresponding Agent via the relation from ticket 01, and publish each one (Phase 1's existing listings were all live, so nothing should land as a Draft). Run the script once against the Strapi instance from ticket 01/02; this is a migration tool, not logic that lives on in the codebase afterward (see Testing Decisions in `docs/specs/phase2-strapi-cms.md` — this is verified by checking Strapi's admin panel, not unit-tested).

**Blocked by:** 02 (needs content-types to exist and the API to be reachable, though write access uses an admin API token rather than the public read permissions from 02)

**Status:** ready-for-agent

- [ ] Running the script once results in one Strapi `Agent` entry per distinct Agent email across the 7 seed listings (no duplicates)
- [ ] Running the script results in exactly 7 Strapi `Listing` entries, each with the correct field values and each related to the correct `Agent`
- [ ] Every migrated Listing is Published, not Draft
- [ ] Gallery images and Agent photos are uploaded to Cloudinary as part of migration (not left as external URLs pointing at picsum.photos/Unsplash) — spot-check a couple of migrated Listings in the admin panel to confirm
- [ ] Availability values (`available`/`rented`) match the original seed data exactly
