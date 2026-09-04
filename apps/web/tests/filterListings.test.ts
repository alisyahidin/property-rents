import { describe, expect, it } from 'vitest';

import { filterListings, type Listing } from '../src/lib/filterListings';

// Fixed fixture array of Listing-shaped objects — no file-system content
// loading, no Astro/DOM. Each test asserts only on filterListings's
// input-array + criteria -> output-array behavior, per the spec's Testing
// Decisions.
const agent = {
  name: 'Elena Cho',
  phone: '+1-503-555-0111',
  email: 'elena.cho@example-agency.com',
  photo: 'https://picsum.photos/seed/agent-elena/400/400',
};

const listings: Listing[] = [
  {
    id: 'riverside-apartment',
    rent: 1800,
    propertyType: 'apartment',
    city: 'Portland',
    area: 'Riverside',
    bedrooms: 2,
    gallery: ['https://picsum.photos/seed/riverside-1/1200/800'],
    availability: 'rented',
    agent,
  },
  {
    id: 'maple-street-house',
    rent: 2400,
    propertyType: 'house',
    city: 'Portland',
    area: 'Maple Street',
    bedrooms: 3,
    gallery: ['https://picsum.photos/seed/maple-1/1200/800'],
    availability: 'available',
    agent,
  },
  {
    id: 'cozy-room-near-campus',
    rent: 900,
    propertyType: 'room',
    city: 'Eugene',
    area: 'University District',
    bedrooms: 1,
    gallery: ['https://picsum.photos/seed/cozy-1/1200/800'],
    availability: 'available',
    agent,
  },
  {
    id: 'lakeview-two-bed-apartment',
    rent: 1500,
    propertyType: 'apartment',
    city: 'Eugene',
    area: 'Lakeview',
    bedrooms: 2,
    gallery: ['https://picsum.photos/seed/lakeview-1/1200/800'],
    availability: 'available',
    agent,
  },
  {
    id: 'suburban-family-house',
    rent: 3000,
    propertyType: 'house',
    city: 'Salem',
    area: 'Suburban',
    bedrooms: 4,
    gallery: ['https://picsum.photos/seed/suburban-1/1200/800'],
    availability: 'rented',
    agent,
  },
];

describe('filterListings', () => {
  it('returns every listing sorted by rent ascending when criteria is empty', () => {
    const result = filterListings(listings, {});

    expect(result.map((listing) => listing.id)).toEqual([
      'cozy-room-near-campus',
      'lakeview-two-bed-apartment',
      'riverside-apartment',
      'maple-street-house',
      'suburban-family-house',
    ]);
  });

  it('returns every listing sorted by rent ascending when criteria is omitted', () => {
    const result = filterListings(listings);

    expect(result).toHaveLength(listings.length);
    expect(result.map((listing) => listing.rent)).toEqual([900, 1500, 1800, 2400, 3000]);
  });

  it('does not mutate the input array', () => {
    const original = [...listings];

    filterListings(listings, { city: 'Portland' });

    expect(listings).toEqual(original);
  });

  it('filters by propertyType', () => {
    const result = filterListings(listings, { propertyType: 'house' });

    expect(result.map((listing) => listing.id)).toEqual([
      'maple-street-house',
      'suburban-family-house',
    ]);
  });

  it('filters by city', () => {
    const result = filterListings(listings, { city: 'Eugene' });

    expect(result.map((listing) => listing.id)).toEqual([
      'cozy-room-near-campus',
      'lakeview-two-bed-apartment',
    ]);
  });

  it('filters by area', () => {
    const result = filterListings(listings, { area: 'Riverside' });

    expect(result.map((listing) => listing.id)).toEqual(['riverside-apartment']);
  });

  it('filters by minBedrooms', () => {
    const result = filterListings(listings, { minBedrooms: 3 });

    expect(result.map((listing) => listing.id)).toEqual([
      'maple-street-house',
      'suburban-family-house',
    ]);
  });

  it('filters by maxBedrooms', () => {
    const result = filterListings(listings, { maxBedrooms: 1 });

    expect(result.map((listing) => listing.id)).toEqual(['cozy-room-near-campus']);
  });

  it('filters by a minBedrooms/maxBedrooms range', () => {
    const result = filterListings(listings, { minBedrooms: 2, maxBedrooms: 2 });

    expect(result.map((listing) => listing.id)).toEqual([
      'lakeview-two-bed-apartment',
      'riverside-apartment',
    ]);
  });

  it('filters by minRent', () => {
    const result = filterListings(listings, { minRent: 2000 });

    expect(result.map((listing) => listing.id)).toEqual([
      'maple-street-house',
      'suburban-family-house',
    ]);
  });

  it('filters by maxRent', () => {
    const result = filterListings(listings, { maxRent: 1000 });

    expect(result.map((listing) => listing.id)).toEqual(['cozy-room-near-campus']);
  });

  it('filters by a minRent/maxRent range', () => {
    const result = filterListings(listings, { minRent: 1000, maxRent: 2000 });

    expect(result.map((listing) => listing.id)).toEqual([
      'lakeview-two-bed-apartment',
      'riverside-apartment',
    ]);
  });

  it('filters by availability', () => {
    const result = filterListings(listings, { availability: 'available' });

    expect(result.map((listing) => listing.id)).toEqual([
      'cozy-room-near-campus',
      'lakeview-two-bed-apartment',
      'maple-street-house',
    ]);
  });

  it('combines multiple filters', () => {
    const result = filterListings(listings, {
      propertyType: 'apartment',
      city: 'Eugene',
      availability: 'available',
      maxRent: 1600,
    });

    expect(result.map((listing) => listing.id)).toEqual(['lakeview-two-bed-apartment']);
  });

  it('returns an empty array when no listing matches the combined criteria', () => {
    const result = filterListings(listings, {
      propertyType: 'room',
      city: 'Portland',
    });

    expect(result).toEqual([]);
  });

  it('returns an empty array when a range excludes every listing', () => {
    const result = filterListings(listings, { minRent: 5000 });

    expect(result).toEqual([]);
  });

  it('preserves rent-ascending order after filtering', () => {
    const result = filterListings(listings, { propertyType: 'house' });

    expect(result.map((listing) => listing.rent)).toEqual([2400, 3000]);
  });
});
