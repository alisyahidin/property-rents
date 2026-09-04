// Scroll-position-linked motion layer, used once: the hero photo drifts at
// a different rate than the page as it scrolls past. Everywhere else on the
// site motion is triggered by mount or viewport-entry (see `Reveal`) — this
// is the one place the scroll position itself drives an animation, so it's
// deliberately restrained (a few percent of the image's height) rather than
// a showy effect.
//
// Reads scroll through the same Motion `frame` loop that `SmoothScroll`
// drives Lenis from, so the drift tracks the smoothed scroll position
// exactly rather than the raw, jittery wheel input.
import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface ParallaxProps {
	children: ReactNode;
	className?: string;
	/** Total px the layer drifts across the section's full scroll-through. */
	range?: number;
}

export default function Parallax({ children, className, range = 100 }: ParallaxProps) {
	const ref = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
	const y = useTransform(scrollYProgress, [0, 1], [-range / 2, range / 2]);

	if (reduceMotion) {
		return (
			<div ref={ref} className={className}>
				{children}
			</div>
		);
	}

	const bleed = range / 2;

	return (
		<div ref={ref} className={className}>
			<motion.div
				style={{ y, position: 'absolute', inset: `-${bleed}px 0`, height: `calc(100% + ${range}px)` }}
			>
				{children}
			</motion.div>
		</div>
	);
}
