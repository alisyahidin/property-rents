# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root
- **`docs/adr/`**: read ADRs that touch the area you're about to work in

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-single-agency-no-multitenancy.md
│   ├── 0002-phase1-content-collections-mirror-strapi.md
│   └── 0003-static-rendering-with-webhook-rebuild.md
└── apps/
    ├── web/
    └── cms/
```

This repo is a pnpm workspace (`apps/web`, `apps/cms`), but only `apps/web` currently has code — `apps/cms` is an empty placeholder for the Phase 2 Strapi CMS (see ADR 0002). A single root `CONTEXT.md` and `docs/adr/` cover the whole repo for now. Revisit multi-context (a `CONTEXT-MAP.md` with a per-app `CONTEXT.md`) once `apps/cms` gets real code with its own domain vocabulary.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0002 (Phase 1 mirrors Strapi schema), but worth reopening because…_
