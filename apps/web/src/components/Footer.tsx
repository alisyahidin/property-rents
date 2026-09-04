import logo from '../assets/logo.svg'

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-neutral-100 bg-white">
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
					<div className="flex flex-col gap-4">
						<a href="/" className="flex items-center gap-2 font-heading text-lg font-medium text-ink">
							<img src={logo.src} className="h-6 w-6" fetchPriority='high' />
							Property Rents
						</a>
						<p className="max-w-sm text-sm leading-relaxed text-neutral-600">
							Every listing here is verified at build time and points straight to the agent who
							manages it — no ticketing queue, no separate contact form.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						<span className="font-heading text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
							Pages
						</span>
						<a href="/" className="text-sm text-ink hover:text-neutral-600">
							Home
						</a>
						<a href="/properties/" className="text-sm text-ink hover:text-neutral-600">
							Properties
						</a>
						<a href="/about/" className="text-sm text-ink hover:text-neutral-600">
							About
						</a>
					</div>

					<div className="flex flex-col gap-3">
						<span className="font-heading text-xs font-medium tracking-[0.14em] text-neutral-400 uppercase">
							Get in touch
						</span>
						<p className="text-sm leading-relaxed text-neutral-600">
							Open any listing to email its agent directly — that's the fastest way to reach us
							about a specific place.
						</p>
					</div>
				</div>

				<div className="mt-12 flex flex-col gap-3 border-t border-neutral-100 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
					<p>&copy; {year} Property Rents. All rights reserved.</p>
					<p>A single-agency listings site.</p>
				</div>
			</div>
		</footer>
	);
}
