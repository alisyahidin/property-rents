# 01: Strapi scaffold, Listing/Agent content-types, and free-tier hosting wiring

**What to build:** the `apps/cms` Strapi app every later ticket in this phase depends on — scaffolded, content-typed, and wired to its free-tier hosting from the start (not added later), since a local-only Strapi with no real database or upload provider would just be redone in ticket 05.

Scaffold a TypeScript Strapi project in `apps/cms` (the empty placeholder directory already reserved for it — see `docs/agents/domain.md`). Define two content-types: `Listing` (Rent, Property Type, City, Area, bedroom count, Gallery, Availability, and an Agent relation) and `Agent` (name, phone, email, photo), related by a Listing → Agent relation — not Agent as an inline component (ADR 0005). Field and enum naming mirrors CONTEXT.md's vocabulary exactly, continuing ADR 0002's commitment. Enable Draft & Publish on `Listing` only. Commit the generated `schema.json` for both content-types under `apps/cms` — this is the schema-as-code decision in `docs/specs/phase2-strapi-cms.md`.

Wire Strapi to its Phase 2 hosting from the start (ADR 0004): connect it to a Neon free Postgres database (not Strapi's default SQLite, and not Render's own free Postgres — that one self-deletes 30 days after creation), and configure `@strapi/provider-upload-cloudinary` as the upload provider for Gallery/Agent photo uploads (Render's free-tier disk is ephemeral). Required secrets (Neon connection string, Cloudinary credentials, Strapi's own `APP_KEYS`/`JWT_SECRET`/`API_TOKEN_SALT`) go in `apps/cms/.env`, gitignored, not committed.

See `docs/specs/phase2-strapi-cms.md` (Implementation Decisions: Hosting topology, Content-types, Draft & Publish, Schema as code) and `docs/adr/0004-phase2-hosting-split-across-providers.md` / `docs/adr/0005-agent-becomes-strapi-relation.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] `apps/cms` is a TypeScript Strapi project, picked up by the existing `apps/*` pnpm workspace glob
- [x] `Listing` and `Agent` content-types exist with the fields above, related by a Listing → Agent relation (not a component)
- [x] Draft & Publish is enabled on `Listing` and not on `Agent`
- [x] Both content-types' `schema.json` files are committed under `apps/cms`
- [x] Strapi connects to a Neon Postgres database (verify: restart the Strapi process, confirm previously-entered content is still there) — verified: booted against Neon, ran first-time migrations, restarted cleanly
- [ ] Cloudinary is configured as the upload provider (verify: upload a test image, confirm it's served from a `res.cloudinary.com` URL, not a local path) — config wired, actual upload verified in ticket 03 once real Gallery/Agent photos are migrated
- [x] All secrets live in `apps/cms/.env`, which is gitignored
- [x] `pnpm --filter cms develop` (or the workspace equivalent) starts Strapi's admin panel locally without errors
