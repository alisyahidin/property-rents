// Ticket 04: hydrated client-side filter island for the index page. Calls
// `filterListings` directly (the same pure function the index page uses at
// build time) against the full Listing payload ticket 03 embedded — no
// server round-trip, no full page reload. See
// docs/specs/phase1-browse-search-listings.md (Implementation Decisions:
// "Rendering strategy").
//
// Extracted out of /properties' inline <script> so the page shell (server
// rendering of listings via PropertyCard) stays separate from this
// filter-widget's DOM wiring/state. Imported and invoked from
// src/pages/properties/index.astro.

import { filterListings, type Listing, type ListingFilterCriteria } from '../lib/filterListings';
import { formatRent, propertyTypeLabel } from '../lib/format';
import { initZoomOnView } from './zoomOnView';

export function initListingFilters(): void {
	const dataEl = document.getElementById('listings-data');
	const filtersSection = document.getElementById('listing-filters');
	const listEl = document.getElementById('listings-list');
	const countEl = document.getElementById('results-count');
	const noResultsEl = document.getElementById('no-results-message');

	if (!dataEl || !filtersSection || !listEl || !countEl || !noResultsEl) return;

	// Re-typed as non-null: the guard above proves it at runtime, but a
	// nested function closing over these (render(), below) doesn't retain
	// that narrowing across the function boundary.
	const list = listEl as HTMLElement;
	const count = countEl as HTMLElement;
	const noResults = noResultsEl as HTMLElement;

	const allListings: Listing[] = JSON.parse(dataEl.textContent ?? '[]');

	const propertyTypeEl = document.getElementById('filter-property-type') as HTMLSelectElement;
	const cityEl = document.getElementById('filter-city') as HTMLSelectElement;
	const areaEl = document.getElementById('filter-area') as HTMLSelectElement;
	const minBedroomsEl = document.getElementById('filter-min-bedrooms') as HTMLInputElement;
	const maxBedroomsEl = document.getElementById('filter-max-bedrooms') as HTMLInputElement;
	const minRentEl = document.getElementById('filter-min-rent') as HTMLInputElement;
	const maxRentEl = document.getElementById('filter-max-rent') as HTMLInputElement;
	const availableOnlyEl = document.getElementById('filter-available-only') as HTMLInputElement;
	const clearButton = document.getElementById('clear-filters') as HTMLButtonElement;

	// City -> sorted, de-duplicated Areas within that City, so the Area
	// control's options can be scoped to whichever City is selected.
	const areasByCity = new Map<string, string[]>();
	for (const listing of allListings) {
		const areas = areasByCity.get(listing.city) ?? [];
		if (!areas.includes(listing.area)) areas.push(listing.area);
		areasByCity.set(listing.city, areas);
	}
	for (const areas of areasByCity.values()) areas.sort((a, b) => a.localeCompare(b));

	const cities = [...areasByCity.keys()].sort((a, b) => a.localeCompare(b));
	for (const city of cities) {
		const option = document.createElement('option');
		option.value = city;
		option.textContent = city;
		cityEl.appendChild(option);
	}

	function populateAreaOptions(city: string) {
		areaEl.innerHTML = '';
		const placeholder = document.createElement('option');
		placeholder.value = '';

		if (city) {
			placeholder.textContent = `All areas in ${city}`;
			areaEl.disabled = false;
			areaEl.appendChild(placeholder);
			for (const area of areasByCity.get(city) ?? []) {
				const option = document.createElement('option');
				option.value = area;
				option.textContent = area;
				areaEl.appendChild(option);
			}
		} else {
			placeholder.textContent = 'Select a city first';
			areaEl.disabled = true;
			areaEl.appendChild(placeholder);
		}
	}

	function readCriteria(): ListingFilterCriteria {
		const criteria: ListingFilterCriteria = {};

		if (propertyTypeEl.value) {
			criteria.propertyType = propertyTypeEl.value as Listing['propertyType'];
		}
		if (cityEl.value) criteria.city = cityEl.value;
		if (areaEl.value) criteria.area = areaEl.value;

		const minBedrooms = minBedroomsEl.value === '' ? NaN : Number(minBedroomsEl.value);
		if (!Number.isNaN(minBedrooms)) criteria.minBedrooms = minBedrooms;

		const maxBedrooms = maxBedroomsEl.value === '' ? NaN : Number(maxBedroomsEl.value);
		if (!Number.isNaN(maxBedrooms)) criteria.maxBedrooms = maxBedrooms;

		const minRent = minRentEl.value === '' ? NaN : Number(minRentEl.value);
		if (!Number.isNaN(minRent)) criteria.minRent = minRent;

		const maxRent = maxRentEl.value === '' ? NaN : Number(maxRentEl.value);
		if (!Number.isNaN(maxRent)) criteria.maxRent = maxRent;

		if (availableOnlyEl.checked) criteria.availability = 'available';

		return criteria;
	}

	// Mirrors PropertyCard.astro's markup so client-rendered cards look
	// identical to the server-rendered ones. Rent formatting and the
	// property-type label share the exact same helpers PropertyCard.astro and
	// the Listing detail page use (src/lib/format.ts) — only the DOM
	// construction itself is duplicated, since Astro components can't render
	// dynamically in the browser and this app has no client-side framework.
	function renderCard(listing: Listing): HTMLAnchorElement {
		const typeLabel = propertyTypeLabel(listing.propertyType);
		const bedroomsLabel = `${listing.bedrooms} bed${listing.bedrooms === 1 ? '' : 's'}`;
		const isAvailable = listing.availability === 'available';

		const card = document.createElement('a');
		card.href = `/properties/${listing.id}/`;
		card.dataset.listingId = listing.id;
		card.className =
			'group flex flex-col overflow-hidden rounded-3xl border border-neutral-100 p-2 transition-shadow duration-200 hover:shadow-lg';

		const imageWrap = document.createElement('div');
		imageWrap.className = 'relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100';

		const img = document.createElement('img');
		img.src = listing.gallery[0] ?? '';
		img.alt = `${typeLabel} in ${listing.area}, ${listing.city}`;
		img.className = 'zoom-in-view h-full w-full object-cover';
		img.loading = 'lazy';

		const availabilityWrap = document.createElement('div');
		availabilityWrap.className = 'absolute top-3 right-3';
		const availabilityBadge = document.createElement('span');
		availabilityBadge.className = [
			'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
			isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600',
		].join(' ');
		availabilityBadge.textContent = isAvailable ? 'Available' : 'Rented';
		availabilityWrap.appendChild(availabilityBadge);

		const specsWrap = document.createElement('div');
		specsWrap.className = 'absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-3';
		for (const text of [bedroomsLabel, typeLabel]) {
			const pill = document.createElement('span');
			pill.className = 'rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink';
			pill.textContent = text;
			specsWrap.appendChild(pill);
		}

		imageWrap.append(img, availabilityWrap, specsWrap);

		const content = document.createElement('div');
		content.className = 'flex items-end justify-between gap-3 px-2 pt-4 pb-2';

		const textWrap = document.createElement('div');
		textWrap.className = 'min-w-0';

		const heading = document.createElement('h3');
		heading.className = 'font-heading text-lg font-normal text-ink';
		heading.textContent = `${typeLabel} in ${listing.area}`;

		const locationP = document.createElement('p');
		locationP.className = 'mt-1 text-sm text-neutral-600';
		locationP.textContent = `${listing.area}, ${listing.city}`;

		textWrap.append(heading, locationP);

		const priceBadge = document.createElement('span');
		priceBadge.className =
			'shrink-0 rounded-full bg-peach px-3 py-1.5 font-heading text-sm whitespace-nowrap text-ink';
		priceBadge.textContent = `${formatRent(listing.rent)}/mo`;

		content.append(textWrap, priceBadge);
		card.append(imageWrap, content);

		return card;
	}

	function render() {
		const criteria = readCriteria();
		const results = filterListings(allListings, criteria);

		list.innerHTML = '';
		for (const listing of results) {
			list.appendChild(renderCard(listing));
		}
		// Freshly-created nodes — the global call in Layout.astro ran before
		// they existed, so this grid needs its own pass to pick up their
		// `.zoom-in-view` cover photos.
		initZoomOnView(list);

		count.textContent = `${results.length} listing${results.length === 1 ? '' : 's'}`;

		const isEmpty = results.length === 0;
		noResults.classList.toggle('hidden', !isEmpty);
		list.classList.toggle('hidden', isEmpty);
	}

	populateAreaOptions('');

	propertyTypeEl.addEventListener('change', render);
	cityEl.addEventListener('change', () => {
		populateAreaOptions(cityEl.value);
		areaEl.value = '';
		render();
	});
	areaEl.addEventListener('change', render);
	minBedroomsEl.addEventListener('input', render);
	maxBedroomsEl.addEventListener('input', render);
	minRentEl.addEventListener('input', render);
	maxRentEl.addEventListener('input', render);
	availableOnlyEl.addEventListener('change', render);

	clearButton.addEventListener('click', () => {
		propertyTypeEl.value = '';
		cityEl.value = '';
		populateAreaOptions('');
		minBedroomsEl.value = '';
		maxBedroomsEl.value = '';
		minRentEl.value = '';
		maxRentEl.value = '';
		availableOnlyEl.checked = false;
		render();
	});
}
