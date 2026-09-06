import { describe, expect, it } from 'vitest';

import { mapStrapiListing } from '../src/lib/strapi';

// Fixed Strapi-API-response-shaped fixture, asserting only on
// mapStrapiListing's input -> Listing-shaped output, the same seam
// discipline filterListings.test.ts uses (ticket 04's Testing Decisions).
const strapiListing = {
  slug: 'downtown-loft-apartment',
  rent: 1450,
  propertyType: 'apartment' as const,
  city: 'Austin',
  area: 'Downtown',
  bedrooms: 1,
  availability: 'available' as const,
  gallery: [
    { url: 'https://res.cloudinary.com/example/image/upload/g1.jpg' },
    { url: 'https://res.cloudinary.com/example/image/upload/g2.jpg' },
  ],
  agent: {
    name: 'Priya Nair',
    phone: '+1-512-555-0142',
    email: 'priya.nair@example-agency.com',
    photo: { url: 'https://res.cloudinary.com/example/image/upload/agent.jpg' },
  },
};

describe('mapStrapiListing', () => {
  it('uses the slug as the Listing id, not Strapi\'s own documentId', () => {
    expect(mapStrapiListing(strapiListing).id).toBe('downtown-loft-apartment');
  });

  it('carries every scalar field through unchanged', () => {
    const listing = mapStrapiListing(strapiListing);
    expect(listing.rent).toBe(1450);
    expect(listing.propertyType).toBe('apartment');
    expect(listing.city).toBe('Austin');
    expect(listing.area).toBe('Downtown');
    expect(listing.bedrooms).toBe(1);
    expect(listing.availability).toBe('available');
  });

  it('flattens the gallery relation into a plain array of URLs', () => {
    expect(mapStrapiListing(strapiListing).gallery).toEqual([
      'https://res.cloudinary.com/example/image/upload/g1.jpg',
      'https://res.cloudinary.com/example/image/upload/g2.jpg',
    ]);
  });

  it('flattens the agent relation, including the nested photo media, into a plain Agent object', () => {
    expect(mapStrapiListing(strapiListing).agent).toEqual({
      name: 'Priya Nair',
      phone: '+1-512-555-0142',
      email: 'priya.nair@example-agency.com',
      photo: 'https://res.cloudinary.com/example/image/upload/agent.jpg',
    });
  });
});
