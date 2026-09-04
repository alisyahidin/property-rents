// Site-wide nav: a fixed, transparent strip holding a floating rounded pill.
// The pill carries its own background, so it stays legible whether it's
// sitting over the homepage hero photo or a plain white page like
// /properties. Always hydrated (client:load in Layout.astro) — the mobile
// menu toggle needs real interactivity, and it's above the fold everywhere.
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Button from './Button';

import logo from '../assets/logo.svg'

const links = [
	{ href: '/', label: 'Home' },
	{ href: '/properties/', label: 'Properties' },
	{ href: '/about/', label: 'About' },
];

export default function Nav() {
	const [open, setOpen] = useState(false);

	return (
		<header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-10">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full bg-neutral-50/95 py-2 pr-2 pl-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
				<a href="/" className="flex items-center gap-2 font-heading text-base font-medium text-ink">
					<img src={logo.src} className="h-6 w-6" fetchPriority='high' />
					Property Rents
				</a>

				<nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
					{links.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="font-heading text-sm text-ink transition-colors hover:text-neutral-600"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="hidden sm:block">
					<Button href="/properties/" size="sm">
						Properties
					</Button>
				</div>

				<button
					type="button"
					aria-label="Toggle menu"
					aria-expanded={open}
					aria-controls="nav-mobile-panel"
					onClick={() => setOpen((value) => !value)}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink sm:hidden"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
				</button>
			</div>

			<AnimatePresence>
				{open && (
					<motion.div
						id="nav-mobile-panel"
						initial={{ opacity: 0, y: -8, height: 0 }}
						animate={{ opacity: 1, y: 0, height: 'auto' }}
						exit={{ opacity: 0, y: -8, height: 0 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						className="mx-auto mt-2 max-w-6xl overflow-hidden sm:hidden"
					>
						<div className="flex flex-col gap-1 rounded-3xl bg-neutral-50/95 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
							{links.map((link) => (
								<a
									key={link.href}
									href={link.href}
									className="rounded-full px-3 py-2.5 font-heading text-sm text-ink hover:bg-neutral-100"
								>
									{link.label}
								</a>
							))}
							<div className="px-3 pt-2 pb-1">
								<Button href="/properties/" size="sm">
									Properties
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
