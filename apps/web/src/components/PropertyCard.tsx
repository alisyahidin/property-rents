// Listing card used on both the homepage's Featured Listings and the
// /properties browse grid. Image zoom (both the on-scroll zoomed-in-to-
// zoomed-out entrance and the hover zoom) and the hover shadow stay plain
// CSS (`.zoom-in-view` in global.css + group-hover, transition-shadow) so
// they work even unhydrated — see src/scripts/zoomOnView.ts; motion.dev
// adds the card's own scroll-triggered entrance and its spring lift on
// hover — both live directly on this component (rather than wrapping it in
// the shared <Reveal>) because a framework component nested into another
// hydrated framework component *through* an .astro file's template renders
// as inert HTML, not a live island — nesting PropertyCard inside <RevealItem>
// from a page would silently kill its hover animation. Give each usage
// site's `<PropertyCard client:visible .../>` its own directive instead.
//
// Availability is rendered inline here rather than via the shared
// AvailabilityBadge.astro — a .tsx file can't import a .astro component,
// and that badge is also used, unchanged, by the (still-Astro) listing
// detail page, so it stays put there.
//
// /properties also re-renders this same visual shape client-side, in
// src/scripts/listingFilters.ts's renderCard() — Astro/React components
// can't run in the browser as a normal DOM-diffing tree from that vanilla
// script, so that function rebuilds the markup by hand. Change the two
// together or they'll drift apart.
import { motion, useReducedMotion } from 'motion/react';
import type { Listing } from '../lib/filterListings';
import { formatRent, propertyTypeLabel as formatPropertyTypeLabel } from '../lib/format';

interface PropertyCardProps {
	listing: Listing;
	/** Staggers entrance when several cards reveal together in a grid. */
	delay?: number;
	/**
	 * Set false when this card is rendered without a `client:*` directive
	 * (as on /properties, where listingFilters.ts owns the grid and hydrating
	 * individual cards would fight it). Framer Motion's `initial` pose still
	 * renders in static HTML even without hydration, but with no JS running
	 * `whileInView` never fires to bring it back — the card would stay stuck
	 * at `opacity: 0` forever. Skipping the motion props entirely renders the
	 * card fully visible instead.
	 */
	animated?: boolean;
}

function AvailabilityPill({ availability }: { availability: Listing['availability'] }) {
	const isAvailable = availability === 'available';
	return (
		<span
			className={
				isAvailable
					? 'inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'
					: 'inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600'
			}
		>
			{isAvailable ? 'Available' : 'Rented'}
		</span>
	);
}

export default function PropertyCard({ listing, delay = 0, animated = true }: PropertyCardProps) {
	const typeLabel = formatPropertyTypeLabel(listing.propertyType);
	const bedroomsLabel = `${listing.bedrooms} bed${listing.bedrooms === 1 ? '' : 's'}`;
	const rentFormatted = formatRent(listing.rent);
	const coverPhoto = listing.gallery[0];
	const reduceMotion = useReducedMotion();
	const skipMotion = !animated || reduceMotion;

	return (
		<motion.a
			href={`/properties/${listing.id}/`}
			className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-100 p-2 transition-shadow duration-200 hover:shadow-lg"
			initial={skipMotion ? undefined : { opacity: 0, y: 20 }}
			whileInView={
				skipMotion ? undefined : { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
			}
			viewport={{ once: true, margin: '-60px' }}
			whileHover={
				skipMotion
					? undefined
					: { y: -6, transition: { type: 'spring', stiffness: 300, damping: 24 } }
			}
		>
			<div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-neutral-100">
				<img
					src={coverPhoto}
					alt={`${typeLabel} in ${listing.area}, ${listing.city}`}
					className="zoom-in-view h-full w-full object-cover"
					loading="lazy"
				/>
				<div className="absolute top-3 right-3">
					<AvailabilityPill availability={listing.availability} />
				</div>
				<div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-3">
					<span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink">
						{bedroomsLabel}
					</span>
					<span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink">{typeLabel}</span>
				</div>
			</div>

			<div className="flex items-end justify-between gap-3 px-2 pt-4 pb-2">
				<div className="min-w-0">
					<h3 className="font-heading text-lg font-normal text-ink">
						{typeLabel} in {listing.area}
					</h3>
					<p className="mt-1 text-sm text-neutral-600">
						{listing.area}, {listing.city}
					</p>
				</div>
				<span className="shrink-0 rounded-full bg-peach px-3 py-1.5 font-heading text-sm whitespace-nowrap text-ink">
					{rentFormatted}/mo
				</span>
			</div>
		</motion.a>
	);
}
