// Homepage FAQ accordion. Single-open (opening one closes whatever else was
// open), first item open by default. The open item's answer carries a small
// real photo alongside it — a deliberate echo of the "every listing shows
// real photos" line used elsewhere on the site, rather than a purely
// decorative flourish.
//
// The thumbnail only exists in the DOM once its row opens, which is after
// Layout.astro's page-load call to initZoomOnView() has already run — so
// each row re-triggers it itself on open, the same way listingFilters.ts
// re-triggers it after rebuilding the card grid.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cx } from '../lib/cx';
import { initZoomOnView } from '../scripts/zoomOnView';

const EASE = [0.22, 1, 0.36, 1] as const;

interface FaqEntry {
	question: string;
	answer: string;
	image: string;
	imageAlt: string;
}

const faqs: FaqEntry[] = [
	{
		question: 'Do I need an account to browse listings?',
		answer:
			"No — browse and filter every listing right away. There's no sign-up and nothing to set up first.",
		image:
			'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
		imageAlt: 'A bright, modern rental interior',
	},
	{
		question: 'How do I ask about a place I like?',
		answer:
			"Open its listing page and use Inquire — it emails the agent who actually manages that place, pre-filled with what you're asking about. No shared inbox, no ticketing queue.",
		image:
			'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
		imageAlt: 'A rental home exterior at dusk',
	},
	{
		question: 'Why is a rented listing still on the site?',
		answer:
			"It stays up, badged Rented, instead of disappearing. That way a bookmarked or shared link never quietly breaks — you'll just see it's no longer available.",
		image:
			'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
		imageAlt: 'A modern rental property exterior',
	},
	{
		question: 'How do you make sure listings are accurate?',
		answer:
			'Every listing is checked against a strict schema before it ships. Rent, photos, and an agent are never optional, so what you see here is never missing the basics.',
		image:
			'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
		imageAlt: 'A bright, modern living room',
	},
	{
		question: 'Can I narrow results by city, bedrooms, or rent?',
		answer:
			'Yes — filter by property type, city and area, bedroom count, and rent range on the full listings page. Results update instantly as you adjust them.',
		image:
			'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
		imageAlt: 'A modern rental bathroom',
	},
];

function ChevronIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
			<path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

interface FaqRowProps {
	item: FaqEntry;
	index: number;
	isOpen: boolean;
	onToggle: () => void;
	reduceMotion: boolean;
}

function FaqRow({ item, index, isOpen, onToggle, reduceMotion }: FaqRowProps) {
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen && panelRef.current) initZoomOnView(panelRef.current);
	}, [isOpen]);

	return (
		<div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white">
			<button
				type="button"
				className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7"
				aria-expanded={isOpen}
				aria-controls={`faq-panel-${index}`}
				onClick={onToggle}
			>
				<span className="font-heading text-base font-medium text-ink sm:text-lg">{item.question}</span>
				<span
					className={cx(
						'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink transition-all duration-300',
						isOpen ? 'rotate-180 bg-peach' : 'bg-neutral-50',
					)}
				>
					<ChevronIcon />
				</span>
			</button>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						id={`faq-panel-${index}`}
						ref={panelRef}
						initial={reduceMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
						transition={{ duration: 0.4, ease: EASE }}
					>
						<div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-center sm:gap-8 sm:px-7 sm:pb-7">
							<p className="flex-1 text-sm leading-relaxed text-neutral-600 sm:text-base">{item.answer}</p>
							<div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-40">
								<img
									src={item.image}
									alt={item.imageAlt}
									loading="lazy"
									className="zoom-in-view h-full w-full object-cover"
								/>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function Faq() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);
	const reduceMotion = useReducedMotion();

	return (
		<div className="flex flex-col gap-3">
			{faqs.map((item, index) => (
				<FaqRow
					key={item.question}
					item={item}
					index={index}
					isOpen={openIndex === index}
					onToggle={() => setOpenIndex(openIndex === index ? null : index)}
					reduceMotion={Boolean(reduceMotion)}
				/>
			))}
		</div>
	);
}
