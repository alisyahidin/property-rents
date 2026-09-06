---
status: accepted
---

# Agent becomes a Strapi relation, not a duplicated inline component

Phase 1 stored Agent as an inline object duplicated on every Listing — ADR 0002's mirror target, but explicitly called out as "an acceptable tradeoff for Phase 1's scale" rather than a permanent design. Strapi makes relations close to free where hand-maintained JSON files weren't, so Phase 2 models Agent as its own content-type with a Listing → Agent relation instead of carrying the duplication forward: each Agent is entered once and referenced by every Listing they manage. This doesn't change what Agent means in the domain — `CONTEXT.md`'s definition is unchanged — and doesn't reopen ADR 0001: Agent is still just structured contact content Strapi manages, not a Strapi Admin User or login of any kind.
