---
status: accepted
---

# Static rendering in both phases; Strapi changes trigger a rebuild, not SSR

Once Strapi lands in Phase 2, the obvious default for a CMS-backed site is SSR or ISR — fetch fresh content per request. We're rejecting that: the site stays fully static in both phases. In Phase 2, a Strapi webhook fires a Vercel deploy hook to rebuild on publish, instead of Astro fetching from Strapi at request time. Given a single agency with under 50 listings and infrequent content changes, the freshness delay of a rebuild (seconds to a couple minutes) is a non-issue, and static generation keeps the best SEO and performance with no server runtime to operate or pay for. This also means Phase 1's rendering mode never has to change going into Phase 2 — only the data source behind the build does.
