import type { ParsedRoute, WGS84Coord, ParsedMarker } from '$lib/types';

function coordFromEl(el: Element): WGS84Coord | null {
	const lat = parseFloat(el.getAttribute('lat') ?? '');
	const lon = parseFloat(el.getAttribute('lon') ?? '');
	if (isNaN(lat) || isNaN(lon)) return null;
	return { lat, lon };
}

function getName(el: Element): string {
	return el.getElementsByTagName('name')[0]?.textContent?.trim() ?? '';
}

export function parseGpx(xml: string): ParsedRoute {
	const doc = new DOMParser().parseFromString(xml, 'application/xml');

	const parseError = doc.querySelector('parsererror');
	if (parseError) {
		throw new Error(parseError.textContent ?? 'XML parse error');
	}

	const name =
		doc.querySelector('gpx > metadata > name')?.textContent?.trim() ||
		doc.querySelector('trk > name')?.textContent?.trim() ||
		'Route';

	// Track points (trkpt inside trkseg)
	const linePoints: WGS84Coord[][] = [];
	for (const seg of Array.from(doc.getElementsByTagName('trkseg'))) {
		const pts = Array.from(seg.getElementsByTagName('trkpt'))
			.map(coordFromEl)
			.filter((c): c is WGS84Coord => c !== null);
		if (pts.length >= 2) linePoints.push(pts);
	}

	// Route points (rtept inside rte) — treat as line if no track exists
	if (linePoints.length === 0) {
		for (const rte of Array.from(doc.getElementsByTagName('rte'))) {
			const pts = Array.from(rte.getElementsByTagName('rtept'))
				.map(coordFromEl)
				.filter((c): c is WGS84Coord => c !== null);
			if (pts.length >= 2) linePoints.push(pts);
		}
	}

	// Waypoints (wpt) → markers
	const markers: ParsedMarker[] = [];
	for (const wpt of Array.from(doc.getElementsByTagName('wpt'))) {
		const coord = coordFromEl(wpt);
		if (!coord) continue;
		const markerName = getName(wpt) || 'Wegpunkt';
		markers.push({ name: markerName, position: coord });
	}

	if (linePoints.length === 0) {
		throw new Error('no-route');
	}

	const points = linePoints.flat();

	return { name, points, markers };
}
