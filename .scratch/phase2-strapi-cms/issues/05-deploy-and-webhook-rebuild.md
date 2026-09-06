# 05: Deploy both apps and wire the publish-triggers-rebuild webhook

**What to build:** the last piece ADR 0003 already committed to — Strapi publishes trigger a rebuild via a webhook, not SSR or request-time fetching — plus actually getting both apps hosted, since neither has been deployed anywhere yet.

Deploy `apps/cms` to Render as a free web service, pointed at the Neon database and Cloudinary provider from ticket 01 (production secrets, not local `.env` values). Deploy `apps/web` to Vercel, with its Strapi API URL pointed at the now-hosted Render instance. In Vercel, create a Deploy Hook and copy its URL. In Strapi's admin panel (Settings → Webhooks), create a webhook pointed at that Deploy Hook URL, firing on `Listing` `publish`, `update`, `unpublish`, and `delete` events — not on Draft saves, since those aren't visible and don't need a rebuild.

See `docs/specs/phase2-strapi-cms.md` (Implementation Decisions: Hosting topology, Rebuild trigger) and `docs/adr/0004-phase2-hosting-split-across-providers.md`.

**Blocked by:** 04 (the deployed build needs to actually depend on Strapi data for the webhook loop to mean anything)

**Status:** ready-for-agent

- [ ] `apps/cms` is live on Render, connected to production Neon + Cloudinary credentials (not local dev values)
- [ ] `apps/web` is live on Vercel, its build successfully fetching from the deployed Strapi instance
- [ ] A Vercel Deploy Hook exists and its URL is configured as a Strapi webhook target
- [ ] The Strapi webhook fires on Listing publish, update (while Published), unpublish, and delete — not on Draft saves
- [ ] End-to-end check: publish a test change in Strapi's production admin panel, confirm a Vercel rebuild is triggered, and confirm the live site reflects the change once it completes
- [ ] Cold start is confirmed as the only user-facing effect of Render's free tier (admin panel is slow to load after ~15 min idle; the public site itself is unaffected since it's static and served from Vercel)
