// Small label above a section heading: a dot + all-caps text. The dot echoes
// the peach accent used in the nav brand mark, tying section labels back to
// the site's own logomark.
import { cx } from '../lib/cx';

interface EyebrowProps {
	text: string;
	tone?: 'ink' | 'white';
}

export default function Eyebrow({ text, tone = 'ink' }: EyebrowProps) {
	return (
		<div className="flex items-center gap-2.5">
			<span className="h-2 w-2 rounded-full bg-peach" />
			<span
				className={cx(
					'font-heading text-xs font-medium tracking-[0.14em] uppercase',
					tone === 'white' ? 'text-white' : 'text-ink',
				)}
			>
				{text}
			</span>
		</div>
	);
}
