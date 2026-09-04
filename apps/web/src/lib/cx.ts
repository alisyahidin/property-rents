// Tiny className-joining helper for the React marketing components — avoids
// pulling in a dependency (clsx/cva) for what's only ever a few conditional
// classes at a time.
export function cx(...classes: Array<string | false | undefined | null>): string {
	return classes.filter(Boolean).join(' ');
}
