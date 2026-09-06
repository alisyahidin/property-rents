---
status: accepted
---

# Phase 2 hosting: a self-managed VPS + Neon + Cloudinary, not one all-in-one provider

Strapi needs compute, a database, and file storage. The database and file storage are split onto their own managed providers regardless of where the app itself runs, to avoid two ways a single "free" platform quietly loses data: a self-managed database needs someone to own backups, and a self-managed disk on a machine you might rebuild or resize needs someone to own not losing what's on it. Database: Neon (free Postgres, managed backups, decoupled from the compute box's own lifecycle). Uploads: Cloudinary (the official Strapi upload provider) — this also keeps Gallery/Agent photos off the VPS's own disk and bandwidth entirely, and was already built and verified working before the compute decision below changed.

**Compute**: originally planned as a Render free web service. That plan didn't survive contact with reality — every card-gated "free tier" PaaS we tried (Render, and this is a pattern across Koyeb, Fly.io, and others, not a Render-specific quirk) either declined the card on file during signup or has quietly started requiring one after previously not. Rather than keep hunting for a free-tier PaaS whose card-verification flow happens to work today and might not tomorrow, Strapi's compute moves to a self-managed VPS the Agency pays for and controls directly — no signup-time card-verification hold to fail, no platform-side policy change to get blindsided by, and no free-tier cold start to accept as a UX cost, since a VPS is always on. The tradeoff this takes on instead: the Agency (in practice, whoever maintains this repo) now owns OS patching, process supervision (a systemd service or pm2, not a PaaS's built-in restart-on-crash), and a reverse proxy for TLS — operational surface a PaaS would otherwise have absorbed.

The Astro site (`apps/web`) still deploys to Vercel, matching the webhook-driven rebuild ADR 0003 already committed to — that decision is unaffected by where Strapi's compute lives.
