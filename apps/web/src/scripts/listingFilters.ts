// Ticket 04: hydrated client-side filter island for the index page. Calls
// `filterListings` directly (the same pure function the index page uses at
// build time) against the full Listing payload ticket 03 embedded — no
// server round-trip, no full page reload. See
// docs/specs/phase1-browse-search-listings.md (Implementation Decisions:
// "Rendering strategy").
//
// Extracted out of index.astro's inline <script> so the page shell (server
// rendering of listings via ListingCard) stays separate from this
// filter-widget's DOM wiring/state. Imported and invoked from index.astro.

import { filterListings, type Listing, type ListingFilterCriteria } from '../lib/filterListings';
import { formatRent, propertyTypeLabel } from '../lib/format';

export function initListingFilters(): void {
	const dataEl = document.getElementById('listings-data');
	const filtersSection = document.getElementById('listing-filters');
	const listEl = document.getElementById('listings-list');
	const countEl = document.getElementById('results-count');
	const noResultsEl = document.getElementById('no-results-message');

	if (!dataEl || !filtersSection || !listEl || !countEl || !noResultsEl) return;

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

	// Mirrors ListingCard.astro's markup so client-rendered cards look
	// identical to the server-rendered ones. Rent formatting and the
	// property-type label share the exact same helpers ListingCard.astro and
	// the Listing detail page use (src/lib/format.ts) — only the DOM
	// construction itself is duplicated, since Astro components can't render
	// dynamically in the browser and this app has no client-side framework.
	function renderCard(listing: Listing): HTMLLIElement {
		const typeLabel = propertyTypeLabel(listing.propertyType);

		const li = document.createElement('li');
		li.className =
			'listing-card flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm';
		li.dataset.listingId = listing.id;

		const link = document.createElement('a');
		link.href = `/listings/${listing.id}/`;
		link.className = 'flex flex-col h-full';

		const imageWrap = document.createElement('div');
		imageWrap.className = 'relative aspect-[4/3] w-full overflow-hidden bg-gray-100';

		const img = document.createElement('img');
		img.src = listing.gallery[0] ?? '';
		img.alt = `${typeLabel} in ${listing.area}, ${listing.city}`;
		img.className = 'h-full w-full object-cover';
		img.loading = 'lazy';

		const badge = document.createElement('span');
		badge.className = [
			'absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-semibold',
			listing.availability === 'available'
				? 'bg-green-100 text-green-800'
				: 'bg-gray-200 text-gray-600',
		].join(' ');
		badge.textContent = listing.availability === 'available' ? 'Available' : 'Rented';

		imageWrap.append(img, badge);

		const body = document.createElement('div');
		body.className = 'flex flex-1 flex-col gap-1 p-3';

		const rentP = document.createElement('p');
		rentP.className = 'text-lg font-bold text-gray-900';
		rentP.textContent = formatRent(listing.rent);
		const perMonth = document.createElement('span');
		perMonth.className = 'text-sm font-normal text-gray-500';
		perMonth.textContent = '/mo';
		rentP.appendChild(perMonth);

		const typeP = document.createElement('p');
		typeP.className = 'text-sm text-gray-700';
		typeP.textContent = `${typeLabel} · ${listing.bedrooms} bed${listing.bedrooms === 1 ? '' : 's'}`;

		const locationP = document.createElement('p');
		locationP.className = 'text-sm text-gray-500';
		locationP.textContent = `${listing.area}, ${listing.city}`;

		body.append(rentP, typeP, locationP);
		link.append(imageWrap, body);
		li.appendChild(link);

		return li;
	}

	function render() {
		const criteria = readCriteria();
		const results = filterListings(allListings, criteria);

		listEl.innerHTML = '';
		for (const listing of results) {
			listEl.appendChild(renderCard(listing));
		}

		countEl.textContent = `${results.length} listing${results.length === 1 ? '' : 's'}`;

		const isEmpty = results.length === 0;
		noResultsEl.classList.toggle('hidden', !isEmpty);
		listEl.classList.toggle('hidden', isEmpty);
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
