// Pill button with a trailing icon-chip. Hover (the chip rotating 45°, the
// pill lifting) stays plain CSS on purpose — it's a per-frame :hover state
// with no orchestration, exactly what CSS already does for free, so it
// renders and works even where this component isn't hydrated. motion.dev is
// reserved for the moments that actually need JS: scroll reveals and the
// nav's animated panel — see components/motion/Reveal.tsx and Nav.tsx.
import type { ReactNode } from 'react';
import { cx } from '../lib/cx';

interface ButtonProps {
	href: string;
	variant?: 'primary' | 'inverted';
	size?: 'md' | 'sm';
	children: ReactNode;
}

export default function Button({ href, variant = 'primary', size = 'md', children }: ButtonProps) {
	const shell = variant === 'primary' ? 'bg-white text-ink' : 'bg-ink text-white';
	const chip = variant === 'primary' ? 'bg-ink text-white' : 'bg-peach text-ink';
	const padding = size === 'sm' ? 'py-1 pl-4 pr-1' : 'py-1.5 pl-5 pr-1.5';
	const chipSize = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

	return (
		<a
			href={href}
			className={cx(
				'group inline-flex items-center gap-4 rounded-full font-heading text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5',
				shell,
				padding,
			)}
		>
			<span>{children}</span>
			<span
				className={cx(
					'flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:rotate-45',
					chip,
					chipSize,
				)}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M4 12L12 4M12 4H5.5M12 4V10.5"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		</a>
	);
}
