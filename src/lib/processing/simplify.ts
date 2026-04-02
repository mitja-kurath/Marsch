import type { WGS84Coord } from '$lib/types';
import { haversineDistance } from './coordinates';

/**
 * Douglas-Peucker polyline simplification.
 * Reduces point count while preserving shape within `toleranceM` metres.
 */
export function simplify(points: WGS84Coord[], toleranceM: number): WGS84Coord[] {
	if (points.length <= 2) return points;

	const maxDist = { value: 0, index: 0 };

	for (let i = 1; i < points.length - 1; i++) {
		const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
		if (d > maxDist.value) {
			maxDist.value = d;
			maxDist.index = i;
		}
	}

	if (maxDist.value > toleranceM) {
		const left = simplify(points.slice(0, maxDist.index + 1), toleranceM);
		const right = simplify(points.slice(maxDist.index), toleranceM);
		return [...left.slice(0, -1), ...right];
	}

	return [points[0], points[points.length - 1]];
}

/** Perpendicular distance from point P to the line segment AB, in metres. */
function perpendicularDistance(p: WGS84Coord, a: WGS84Coord, b: WGS84Coord): number {
	const ap = haversineDistance(a, p);
	const ab = haversineDistance(a, b);

	if (ab === 0) return ap;

	// Project P onto line AB using dot product in flat approximation
	const dx = b.lon - a.lon;
	const dy = b.lat - a.lat;
	const t = Math.max(
		0,
		Math.min(1, ((p.lon - a.lon) * dx + (p.lat - a.lat) * dy) / (dx * dx + dy * dy))
	);

	const foot: WGS84Coord = { lat: a.lat + t * dy, lon: a.lon + t * dx };
	return haversineDistance(p, foot);
}
