// Full-bleed image CTA band, used by both the homepage and the About page.
// The text block fades up as it scrolls into view via the shared Reveal
// primitive; the background photo settles from its zoomed-in `.zoom-in-view`
// pose the same way every other image on the site does (see
// src/scripts/zoomOnView.ts) — plain CSS, not Reveal, since it's the
// section's own overflow-hidden that clips it, not this component's.
import Eyebrow from './Eyebrow';
import Button from './Button';
import { Reveal } from './motion/Reveal';

interface CtaBandProps {
	eyebrow: string;
	heading: string;
	imageUrl: string;
	imageAlt: string;
	buttonHref: string;
	buttonLabel: string;
}

export default function CtaBand({
	eyebrow,
	heading,
	imageUrl,
	imageAlt,
	buttonHref,
	buttonLabel,
}: CtaBandProps) {
	return (
		<section className="relative mx-4 my-6 overflow-hidden rounded-3xl sm:mx-6 lg:mx-10">
			<img
				src={imageUrl}
				alt={imageAlt}
				className="zoom-in-view absolute inset-0 h-full w-full object-cover"
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-ink/45" />
			<Reveal className="relative flex flex-col items-start gap-6 px-6 py-16 sm:items-center sm:px-10 sm:py-24 sm:text-center">
				<Eyebrow text={eyebrow} tone="white" />
				<h2 className="max-w-2xl font-heading text-3xl font-normal text-white sm:text-5xl">{heading}</h2>
				<Button href={buttonHref}>{buttonLabel}</Button>
			</Reveal>
		</section>
	);
}
