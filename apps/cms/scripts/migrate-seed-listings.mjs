#!/usr/bin/env node
// Ticket 03: one-off migration of Phase 1's seed Content Collection into
// Strapi. Not logic that lives on in the codebase — run once, verify the
// result in Strapi's admin panel (see docs/specs/phase2-strapi-cms.md's
// Testing Decisions), then this file has done its job.
//
// Agents first (deduped by email, matching the same dedupe key the About
// page already uses), then Listings referencing them by relation — matches
// ADR 0005 (Agent as a Strapi relation, not a duplicated inline component).
// Each Listing's Gallery and each Agent's photo are downloaded from their
// original URL and re-uploaded to Strapi, which stores them via Cloudinary
// (ADR 0004) — not left as external picsum.photos/Unsplash URLs.
//
// Each Listing's `slug` is its original seed filename (e.g.
// `downtown-loft-apartment`), not Strapi's own `documentId` — a random id
// would replace Phase 1's readable /properties/downtown-loft-apartment/
// URLs with something like /properties/wrmv8h94mr2l8fg87bv5z34b/. Ticket 04
// looks listings up by this slug.
//
// Usage:
//   STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=<full-access token> \
//     node scripts/migrate-seed-listings.mjs
//
// Strapi's REST API needs `documentId` (not the numeric `id`) for
// single-entity GET/PUT/DELETE, but plain numeric ids for relation fields
// on create (agent: <id>, gallery: [<id>, ...]) — both confirmed against a
// live instance before writing this script.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('STRAPI_API_TOKEN is required (a Strapi full-access API token).');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, '../../web/src/content/listings');

async function strapiFetch(pathname, options = {}) {
  const response = await fetch(`${STRAPI_URL}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${pathname} -> ${response.status}: ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

/** Downloads an image URL and uploads it to Strapi (Cloudinary under the
 * hood), returning the numeric media id. */
async function uploadImageFromUrl(url) {
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download ${url}: ${imageResponse.status}`);
  }
  const blob = await imageResponse.blob();

  const filename = path.basename(new URL(url).pathname) || 'image.jpg';
  const form = new FormData();
  form.append('files', blob, filename.includes('.') ? filename : `${filename}.jpg`);

  const uploaded = await strapiFetch('/api/upload', { method: 'POST', body: form });
  return uploaded[0].id;
}

async function loadSeedListings() {
  const files = (await readdir(SEED_DIR)).filter((file) => file.endsWith('.json'));
  const listings = [];
  for (const file of files) {
    const raw = await readFile(path.join(SEED_DIR, file), 'utf-8');
    listings.push({ file, ...JSON.parse(raw) });
  }
  return listings;
}

async function migrateAgents(listings) {
  const byEmail = new Map();
  for (const listing of listings) {
    if (!byEmail.has(listing.agent.email)) {
      byEmail.set(listing.agent.email, listing.agent);
    }
  }

  const agentIdsByEmail = new Map();
  for (const [email, agent] of byEmail) {
    console.log(`Agent: ${agent.name} <${email}>`);
    const photoId = await uploadImageFromUrl(agent.photo);
    const created = await strapiFetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { name: agent.name, phone: agent.phone, email, photo: photoId },
      }),
    });
    agentIdsByEmail.set(email, created.data.id);
    console.log(`  -> created Agent #${created.data.id}`);
  }
  return agentIdsByEmail;
}

async function migrateListings(listings, agentIdsByEmail) {
  for (const listing of listings) {
    console.log(`Listing: ${listing.file}`);
    const galleryIds = [];
    for (const imageUrl of listing.gallery) {
      galleryIds.push(await uploadImageFromUrl(imageUrl));
    }

    const slug = listing.file.replace(/\.json$/, '');
    const created = await strapiFetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          slug,
          rent: listing.rent,
          propertyType: listing.propertyType,
          city: listing.city,
          area: listing.area,
          bedrooms: listing.bedrooms,
          gallery: galleryIds,
          availability: listing.availability,
          agent: agentIdsByEmail.get(listing.agent.email),
        },
      }),
    });
    console.log(
      `  -> created Listing #${created.data.id}, slug="${created.data.slug}" (published: ${Boolean(created.data.publishedAt)})`,
    );
  }
}

async function main() {
  const listings = await loadSeedListings();
  console.log(`Loaded ${listings.length} seed listings from ${SEED_DIR}\n`);

  console.log('--- Migrating Agents ---');
  const agentIdsByEmail = await migrateAgents(listings);

  console.log('\n--- Migrating Listings ---');
  await migrateListings(listings, agentIdsByEmail);

  console.log(`\nDone: ${agentIdsByEmail.size} agents, ${listings.length} listings.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
