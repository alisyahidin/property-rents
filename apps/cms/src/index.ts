import type { Core } from '@strapi/strapi';

// Ticket 02: public read access for Listing/Agent, set as code on every boot
// rather than a manual admin-panel click-through (matches this repo's
// schema-as-code discipline — see docs/specs/phase2-strapi-cms.md's Public
// read access decision). No API token is needed for apps/web's build to
// read this data: it's the same Listing/Agent data the static build is
// about to publish to the world anyway, so gating reads behind a secret
// adds handling with no real security benefit. Write access (the admin
// panel) is unaffected — it stays behind normal Strapi admin auth.
//
// Strapi's users-permissions plugin doesn't pre-seed permission rows for
// custom content-types (only a fixed list of its own auth actions) — a
// permission row's mere existence *is* the grant, there's no separate
// `enabled` flag. Rows normally only appear when an admin ticks the box in
// Settings > Roles, which is exactly the manual step this bootstrap
// replaces. Idempotent: checks for each row before creating it, so this is
// safe on every startup, including in production once this is deployed to
// Render (ticket 05).
const PUBLIC_READ_ACTIONS = [
  'api::listing.listing.find',
  'api::listing.listing.findOne',
  'api::agent.agent.find',
  'api::agent.agent.findOne',
];

async function grantPublicReadAccess(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    strapi.log.warn('Ticket 02: no "public" role found — skipping public read permission setup.');
    return;
  }

  for (const action of PUBLIC_READ_ACTIONS) {
    const existing = await strapi.query('plugin::users-permissions.permission').findOne({
      where: { action, role: publicRole.id },
    });

    if (!existing) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
      strapi.log.info(`Ticket 02: granted public read access for "${action}".`);
    }
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicReadAccess(strapi);
  },
};
