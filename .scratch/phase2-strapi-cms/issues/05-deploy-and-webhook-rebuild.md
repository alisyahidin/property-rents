# 05: Deploy both apps and wire the publish-triggers-rebuild webhook

**What to build:** the last piece ADR 0003 already committed to — Strapi publishes trigger a rebuild via a webhook, not SSR or request-time fetching — plus actually getting both apps hosted, since neither has been deployed anywhere yet.

**Amendment:** this ticket originally planned Strapi on Render as a free web service. That plan is dropped — see ADR 0004's update — in favor of a self-managed VPS, after hitting card-verification failures common across free-tier PaaS options. The steps below reflect the VPS plan.

On the VPS: install Node.js (matching `apps/cms/package.json`'s engines) and pnpm, clone the repo (or pull `apps/cms` via a deploy script), run `pnpm install --frozen-lockfile` and `pnpm --filter cms build`, then run Strapi as a persistent process — a systemd service (preferred, survives reboots) or `pm2 start pnpm --name cms -- --filter cms start` — pointed at production Neon/Cloudinary credentials (fresh secrets, not the local dev `.env` values; see the ones already generated for this in chat). Put a reverse proxy (nginx or Caddy) in front of it for TLS and a real domain/subdomain instead of exposing Strapi's raw port directly — Caddy in particular gets free automatic HTTPS with almost no config, worth defaulting to unless there's a reason to prefer nginx. Open only 80/443 in the VPS firewall; Strapi's own port stays internal.

Deploy `apps/web` to Vercel, with its `STRAPI_URL` pointed at the VPS's public URL. In Vercel, create a Deploy Hook and copy its URL. In Strapi's admin panel (Settings → Webhooks), create a webhook pointed at that Deploy Hook URL, firing on `Listing` `publish`, `update`, `unpublish`, and `delete` events — not on Draft saves, since those aren't visible and don't need a rebuild.

See `docs/specs/phase2-strapi-cms.md` (Implementation Decisions: Hosting topology, Rebuild trigger) and `docs/adr/0004-phase2-hosting-split-across-providers.md`.

**Blocked by:** 04 (the deployed build needs to actually depend on Strapi data for the webhook loop to mean anything), and on VPS access details (provider, IP/SSH, domain) not yet provided

**Status:** ready-for-agent (pending VPS access)

- [ ] `apps/cms` runs on the VPS as a persistent process (systemd or pm2), surviving a reboot
- [ ] A reverse proxy terminates TLS in front of Strapi; Strapi's own port is not publicly exposed
- [ ] Production Neon + Cloudinary credentials are in place on the VPS (fresh secrets, not local dev values)
- [ ] `apps/web` is live on Vercel, its build successfully fetching from the VPS-hosted Strapi instance
- [ ] A Vercel Deploy Hook exists and its URL is configured as a Strapi webhook target
- [ ] The Strapi webhook fires on Listing publish, update (while Published), unpublish, and delete — not on Draft saves
- [ ] End-to-end check: publish a test change in Strapi's production admin panel, confirm a Vercel rebuild is triggered, and confirm the live site reflects the change once it completes
