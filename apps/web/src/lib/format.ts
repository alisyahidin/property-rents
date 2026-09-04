// Shared display-formatting helpers for Listing fields.
//
// Rent formatting and property-type-label casing each need to render
// identically in three places: the server-rendered PropertyCard.astro, the
// server-rendered Listing detail page ([slug].astro), and the client-side
// filter island's card renderer (src/scripts/listingFilters.ts). Centralizing
// them here means a future change to either only needs to happen once.
//
// No Astro APIs, no DOM dependency — safe to import at build time (Node)
// and in the browser, same as filterListings.ts.

import type { PropertyType } from './filterListings';

/**
 * Formats a monthly rent amount as whole-dollar USD currency, e.g.
 * `1800` -> `"$1,800"`.
 */
export function formatRent(rent: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(rent);
}

/**
 * Capitalizes a PropertyType for display, e.g. `"apartment"` -> `"Apartment"`.
 */
export function propertyTypeLabel(propertyType: PropertyType): string {
	return propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
}
