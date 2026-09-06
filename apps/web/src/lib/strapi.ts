// Ticket 04: the data-source swap ADR 0002 committed Phase 1's schema to
// preparing for. Fetches Listings from Strapi at build time instead of the
// (now deleted) `listings` Content Collection, and reshapes the response
// into the exact same `Listing` type `filterListings` already expects — so
// `filterListings` itself needed zero changes, per the spec.
//
// No API token: the Public role has find/findOne on Listing/Agent (ticket
// 02) — this is the same data the static build is about to publish to the
// world anyway, so there's no secret to manage here.
import type { Agent, Availability, Listing, PropertyType } from './filterListings';

const STRAPI_URL = import.meta.env.STRAPI_URL ?? 'http://localhost:1337';

interface StrapiMedia {
  url: string;
}

interface StrapiAgent {
  name: string;
  phone: string;
  email: string;
  photo: StrapiMedia;
}

interface StrapiListing {
  slug: string;
  rent: number;
  propertyType: PropertyType;
  city: string;
  area: string;
  bedrooms: number;
  gallery: StrapiMedia[];
  availability: Availability;
  agent: StrapiAgent;
}

/**
 * Reshapes one Strapi API listing (with `gallery` and `agent.photo`
 * populated) into the `Listing` shape the rest of the site already works
 * with. Pure — no fetch, no Astro APIs — so it's unit-testable the same way
 * `filterListings` is.
 */
export function mapStrapiListing(strapiListing: StrapiListing): Listing {
  const agent: Agent = {
    name: strapiListing.agent.name,
    phone: strapiListing.agent.phone,
    email: strapiListing.agent.email,
    photo: strapiListing.agent.photo.url,
  };

  return {
    id: strapiListing.slug,
    rent: strapiListing.rent,
    propertyType: strapiListing.propertyType,
    city: strapiListing.city,
    area: strapiListing.area,
    bedrooms: strapiListing.bedrooms,
    gallery: strapiListing.gallery.map((image) => image.url),
    availability: strapiListing.availability,
    agent,
  };
}

/**
 * Fetches every Published Listing from Strapi (Draft ones are excluded by
 * Strapi's own Draft & Publish behavior — see CONTEXT.md's Draft/Published
 * entry), with Gallery and Agent (including Agent's photo) populated.
 */
export async function fetchListings(): Promise<Listing[]> {
  const url = new URL('/api/listings', STRAPI_URL);
  url.searchParams.set('populate[gallery]', 'true');
  url.searchParams.set('populate[agent][populate][photo]', 'true');
  url.searchParams.set('pagination[pageSize]', '100');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch listings from Strapi (${STRAPI_URL}): ${response.status}`);
  }

  const { data } = (await response.json()) as { data: StrapiListing[] };
  return data.map(mapStrapiListing);
}
