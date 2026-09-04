---
status: accepted
---

# Phase 1 data source mirrors the future Strapi schema

Development is split in two phases: Phase 1 ships the Astro site before Strapi exists, Phase 2 wires Strapi in as the CMS. Rather than hardcoding Phase 1 listings into components (throwaway) or standing up Strapi early (slower to first ship), Phase 1 stores Listings as Astro Content Collections (local Markdown/JSON) with a schema deliberately shaped to match the Strapi content-types Phase 2 will introduce. This makes the Phase 2 migration a data-source swap behind the same templates and query shape, not a rewrite — the cost is only paid once, up front, in exchange for not paying it twice.
