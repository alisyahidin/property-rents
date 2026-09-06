import type { Core } from '@strapi/strapi';

// The default CSP only allows admin-panel media previews from Strapi's own
// origin, which is fine for the local-disk upload provider but breaks image
// previews once uploads live on Cloudinary (ADR 0004) — the admin panel
// needs `res.cloudinary.com` allowed in img-src/media-src or every media
// thumbnail in the admin UI just fails to load.
const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
