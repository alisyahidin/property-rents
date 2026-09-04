// Scroll/mount "zoomed in → zoomed out" reveal for every photo on the site.
// Deliberately plain IntersectionObserver + CSS, not motion.dev: several
// image usage sites — the /properties card grid that listingFilters.ts wipes
// and rebuilds wholesale, and every image on the Astro-only listing detail
// page — render with no React hydration at all, so a Framer-driven version
// would leave those images stuck zoomed in. One mechanism that works
// identically hydrated or not mirrors PropertyCard's existing decision to
// keep its own image zoom in plain CSS for the same reason (see
// PropertyCard.tsx).
//
// The zoomed-in starting state lives entirely in CSS (`.zoom-in-view` in
// global.css) so it's correct on first paint with zero JS. This module only
// ever adds the `.is-zoomed-out` class that triggers the CSS transition down
// to scale(1) — it never has to set the initial pose itself.
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
	if (typeof window === 'undefined') return null;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
	if (observer) return observer;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-zoomed-out');
				observer?.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
	);
	return observer;
}

/**
 * Observes every not-yet-triggered `.zoom-in-view` image under `root` (the
 * whole document by default). An image already above the fold at call time
 * intersects immediately, so this doubles as the "animate on mount" case —
 * no separate mode needed. Safe to call repeatedly, e.g. after
 * listingFilters.ts rebuilds the card grid, since already-triggered images
 * are skipped and never re-observed.
 */
export function initZoomOnView(root: ParentNode = document): void {
	const io = getObserver();
	if (!io) return;
	root.querySelectorAll('.zoom-in-view:not(.is-zoomed-out)').forEach((el) => io.observe(el));
}
