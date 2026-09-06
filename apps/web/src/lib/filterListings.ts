// Pure, framework-agnostic query/filter seam for Listings.
//
// This module has no Astro APIs and no DOM dependency, so `filterListings`
// can run unchanged at build time (Node, rendering the index page) and in
// the browser (the client-side filter island) — see
// docs/specs/phase1-browse-search-listings.md, "Query/filter seam".
//
// `Listing` here is a flat shape, unchanged by Phase 2's data-source swap
// (docs/specs/phase2-strapi-cms.md, ticket 04): Phase 1 built it from a
// `listings` Content Collection entry (`{ id: entry.id, ...entry.data }`);
// now `src/lib/strapi.ts`'s `mapStrapiListing` builds the exact same shape
// from Strapi's API response instead. Neither `filterListings` nor its
// tests changed at all — this is the seam ADR 0002's migration promise
// depended on.

export type PropertyType = 'apartment' | 'house' | 'room';

export type Availability = 'available' | 'rented';

export interface Agent {
  name: string;
  phone: string;
  email: string;
  photo: string;
}

export interface Listing {
  id: string;
  rent: number;
  propertyType: PropertyType;
  city: string;
  area: string;
  bedrooms: number;
  gallery: string[];
  availability: Availability;
  agent: Agent;
}

export interface ListingFilterCriteria {
  propertyType?: PropertyType;
  city?: string;
  area?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minRent?: number;
  maxRent?: number;
  availability?: Availability;
}

/**
 * Returns the subset of `listings` matching `criteria`, sorted by Rent
 * ascending. An omitted/undefined criteria field imposes no filter, so an
 * empty (or default) `criteria` returns every listing, sorted.
 *
 * Pure: does not mutate `listings` or `criteria`, and has no side effects.
 */
export function filterListings(
  listings: readonly Listing[],
  criteria: ListingFilterCriteria = {},
): Listing[] {
  return listings
    .filter((listing) => {
      if (criteria.propertyType !== undefined && listing.propertyType !== criteria.propertyType) {
        return false;
      }
      if (criteria.city !== undefined && listing.city !== criteria.city) {
        return false;
      }
      if (criteria.area !== undefined && listing.area !== criteria.area) {
        return false;
      }
      if (criteria.minBedrooms !== undefined && listing.bedrooms < criteria.minBedrooms) {
        return false;
      }
      if (criteria.maxBedrooms !== undefined && listing.bedrooms > criteria.maxBedrooms) {
        return false;
      }
      if (criteria.minRent !== undefined && listing.rent < criteria.minRent) {
        return false;
      }
      if (criteria.maxRent !== undefined && listing.rent > criteria.maxRent) {
        return false;
      }
      if (criteria.availability !== undefined && listing.availability !== criteria.availability) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.rent - b.rent);
}
