---
status: accepted
---

# Phase 2 hosting: Render + Neon + Cloudinary, not one all-in-one provider

Strapi needs compute, a database, and file storage; three different free-tier providers are used instead of one, to avoid the two ways a single "free" platform quietly loses data. Render's own free Postgres expires and is permanently deleted 30 days after creation (14-day grace period, no backups), and Render's free web service filesystem is ephemeral — wiped on every deploy, restart, or spin-down — which would drop every uploaded Listing photo. Strapi's compute stays on Render (free web service, self-hosted); its database moves to Neon (free Postgres that suspends compute when idle instead of deleting data); uploads go to Cloudinary (the official Strapi upload provider, with a generous free tier). This keeps the whole stack free while accepting Render's free-tier cold start (roughly a minute, after 15 minutes idle) as a UX cost, not a data-safety one. The Astro site (`apps/web`) deploys to Vercel, matching the webhook-driven rebuild ADR 0003 already committed to.
