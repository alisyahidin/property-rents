// Repeated section-opening pattern (eyebrow + heading + supporting
// paragraph) shared by every marketing section, so a tweak to that pattern
// only happens once.
import Eyebrow from './Eyebrow';
import { cx } from '../lib/cx';

interface SectionIntroProps {
	eyebrow: string;
	heading: string;
	paragraph?: string;
	align?: 'left' | 'center';
}

export default function SectionIntro({ eyebrow, heading, paragraph, align = 'left' }: SectionIntroProps) {
	return (
		<div className={cx('flex max-w-2xl flex-col gap-4', align === 'center' && 'mx-auto items-center text-center')}>
			<Eyebrow text={eyebrow} />
			<h2 className="font-heading text-3xl leading-[1.15] font-normal text-ink sm:text-4xl lg:text-5xl">
				{heading}
			</h2>
			{paragraph && <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">{paragraph}</p>}
		</div>
	);
}
