import type { ParsedRoute } from '$lib/types';
import { parseKml } from './kml';
import { parseGpx } from './gpx';

export type SupportedFormat = 'kml' | 'gpx';

function detectFormat(file: File): SupportedFormat {
	const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
	if (ext === 'kml') return 'kml';
	if (ext === 'gpx') return 'gpx';
	throw new Error(`invalid-format:${ext || file.name}`);
}

export async function parseFile(file: File): Promise<ParsedRoute> {
	const format = detectFormat(file);
	const text = await file.text();

	const parsed = format === 'kml' ? parseKml(text) : parseGpx(text);

	if (parsed.points.length < 2) {
		throw new Error('too-few-points');
	}

	return parsed;
}
