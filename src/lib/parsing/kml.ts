import type { ParsedRoute, WGS84Coord, ParsedMarker } from '$lib/types';

function parseCoord(text: string): WGS84Coord | null {
	// KML: "lon,lat[,ele]"
	const parts = text.trim().split(',');
	if (parts.length < 2) return null;
	const lon = parseFloat(parts[0]);
	const lat = parseFloat(parts[1]);
	if (isNaN(lat) || isNaN(lon)) return null;
	return { lat, lon };
}

function parseCoordinatesElement(el: Element): WGS84Coord[] {
	const text = el.textContent ?? '';
	return text
		.trim()
		.split(/\s+/)
		.map(parseCoord)
		.filter((c): c is WGS84Coord => c !== null);
}

function getChildText(el: Element, tag: string): string {
	return el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
}

export function parseKml(xml: string): ParsedRoute {
	const doc = new DOMParser().parseFromString(xml, 'application/xml');

	const parseError = doc.querySelector('parsererror');
	if (parseError) {
		throw new Error(parseError.textContent ?? 'XML parse error');
	}

	const name = doc.querySelector('Document > name')?.textContent?.trim() ?? 'Route';

	// Collect all LineString coordinate arrays
	const linePoints: WGS84Coord[][] = [];
	for (const ls of Array.from(doc.getElementsByTagName('LineString'))) {
		const coordEl = ls.getElementsByTagName('coordinates')[0];
		if (coordEl) {
			const pts = parseCoordinatesElement(coordEl);
			if (pts.length >= 2) linePoints.push(pts);
		}
	}

	// Collect Point placemarks as markers (exclude those that are part of a track)
	const markers: ParsedMarker[] = [];
	for (const pm of Array.from(doc.getElementsByTagName('Placemark'))) {
		const pointEls = pm.getElementsByTagName('Point');
		if (pointEls.length === 0) continue;

		const coordEl = pointEls[0].getElementsByTagName('coordinates')[0];
		if (!coordEl) continue;

		const coord = parseCoord(coordEl.textContent?.trim() ?? '');
		if (!coord) continue;

		const markerName = getChildText(pm, 'name') || 'Wegpunkt';
		markers.push({ name: markerName, position: coord });
	}

	if (linePoints.length === 0) {
		throw new Error('no-route');
	}

	// Merge all line segments into one continuous route
	const points = linePoints.flat();

	return { name, points, markers };
}
