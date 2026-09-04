// Global Lenis smooth-scroll instance, mounted once in Layout.astro.
// `root` mode smooths the real document scroll (window/html) rather than a
// custom container, so every existing anchor link, in-page find, and
// focus-scroll behaviour keeps working unchanged, and `useLenis()` becomes
// reachable from any other client island on the page without a Provider.
//
// Lenis's own rAF loop is disabled (`autoRaf: false`) and driven instead by
// Motion's `frame` scheduler. That matters because scroll-linked Motion
// values (see `Parallax`) read scroll position on Motion's frame tick too —
// left on separate loops, Lenis and Motion each update a fraction of a
// frame apart, and scroll-linked animations visibly lag behind the smoothed
// scroll position. Driving both off one scheduler keeps them in lockstep.
import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { cancelFrame, frame, useReducedMotion } from 'motion/react';
import 'lenis/dist/lenis.css';

function FrameSync() {
	const lenis = useLenis();

	useEffect(() => {
		if (!lenis) return;
		const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
		frame.update(update, true);
		return () => cancelFrame(update);
	}, [lenis]);

	return null;
}

export default function SmoothScroll() {
	// Smoothing is a physical-feel enhancement, not core functionality — skip
	// it outright for reduced-motion users instead of smoothing their scroll
	// input against their stated preference.
	const reduceMotion = useReducedMotion();
	if (reduceMotion) return null;

	return (
		<ReactLenis root options={{ autoRaf: false, lerp: 0.1, duration: 1.2 }}>
			<FrameSync />
		</ReactLenis>
	);
}
