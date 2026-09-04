// Scroll/mount reveal primitives shared by every marketing section on the
// home, listings, and about pages — one place owning the "fade up into
// place" motion language (mirrors the reference site's own slide-in/reveal
// treatment) instead of every section re-implementing it.
//
// `Reveal` fades a single block. `RevealGroup` + `RevealItem` stagger a
// list of children (card grids, the hero's line-by-line entrance). Both
// respect prefers-reduced-motion by rendering a plain, fully-visible <div>
// instead of animating.
import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
	children: ReactNode;
	/** "scroll" fades in as the block enters the viewport (default, for
	 * below-the-fold content); "mount" fades in immediately (for
	 * above-the-fold content like the hero). */
	mode?: 'scroll' | 'mount';
	delay?: number;
	className?: string;
}

export function Reveal({ children, mode = 'scroll', delay = 0, className }: RevealProps) {
	const reduceMotion = useReducedMotion();
	if (reduceMotion) return <div className={className}>{children}</div>;

	const hidden = { opacity: 0, y: 20 };
	const shown = { opacity: 1, y: 0 };

	return (
		<motion.div
			className={className}
			initial={hidden}
			transition={{ duration: 0.7, ease: EASE, delay }}
			{...(mode === 'scroll'
				? { whileInView: shown, viewport: { once: true, margin: '-80px' } }
				: { animate: shown })}
		>
			{children}
		</motion.div>
	);
}

const groupVariants: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

interface RevealGroupProps {
	children: ReactNode;
	mode?: 'scroll' | 'mount';
	className?: string;
}

export function RevealGroup({ children, mode = 'scroll', className }: RevealGroupProps) {
	const reduceMotion = useReducedMotion();
	if (reduceMotion) return <div className={className}>{children}</div>;

	return (
		<motion.div
			className={className}
			initial="hidden"
			variants={groupVariants}
			{...(mode === 'scroll'
				? { whileInView: 'show', viewport: { once: true, margin: '-80px' } }
				: { animate: 'show' })}
		>
			{children}
		</motion.div>
	);
}

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<motion.div className={className} variants={itemVariants}>
			{children}
		</motion.div>
	);
}
