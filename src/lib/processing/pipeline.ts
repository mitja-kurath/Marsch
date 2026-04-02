/**
 * Route processing pipeline.
 *
 * Input:  ParsedRoute (raw coords from KML/GPX)
 * Output: ProcessedRoute (points with elevation + snapped markers)
 *
 * Steps:
 *  1. Validate region (Switzerland)
 *  2. Simplify polyline for rendering / API efficiency
 *  3. Compute cumulative distances
 *  4. Snap markers to nearest route point
 *  5. If no markers in file, add synthetic start/end
 *  6. Attach elevation data (provided by the elevation provider)
 */

import type { ParsedRoute, RoutePoint, RouteMarker, ProcessedRoute, WGS84Coord } from '$lib/types';
import { isInSwitzerland, haversineDistance } from './coordinates';
import { simplify } from './simplify';
import { snapToRoute } from './snap';

export type ElevationProfile = {
	/** Elevation in metres, indexed 1:1 with the route points array. */
	elevations: number[];
};

/** Simplification tolerance for rendering (metres). */
const RENDER_TOLERANCE_M = 10;

/** Max input coords for the elevation API. */
const MAX_API_POINTS = 3000;

export function validateRegion(points: WGS84Coord[]): void {
	const step = Math.max(1, Math.floor(points.length / 10));
	const samples = points.filter((_, i) => i % step === 0);
	const allInCh = samples.every(isInSwitzerland);
	if (!allInCh) throw new Error('outside-switzerland');
}

/**
 * Build cumulative distance array (metres) aligned to `points`.
 */
export function buildDistances(points: WGS84Coord[]): number[] {
	const dists: number[] = [0];
	for (let i = 1; i < points.length; i++) {
		dists.push(dists[i - 1] + haversineDistance(points[i - 1], points[i]));
	}
	return dists;
}

/**
 * Reduce point count so the elevation API won't reject the payload,
 * while keeping at least `minPoints` points.
 */
export function prepareForApi(points: WGS84Coord[]): WGS84Coord[] {
	if (points.length <= MAX_API_POINTS) return points;
	return simplify(points, RENDER_TOLERANCE_M);
}

let markerIdCounter = 0;
function newId() {
	return `marker-${++markerIdCounter}`;
}

/**
 * Assemble a ProcessedRoute from parsed data + elevation profile.
 *
 * `elevationProfile` must have exactly `points.length` entries.
 */
export function assembleRoute(
	parsed: ParsedRoute,
	points: WGS84Coord[],
	elevationProfile: ElevationProfile,
	defaultBreakMinutes: number
): ProcessedRoute {
	const distances = buildDistances(points);
	const { elevations } = elevationProfile;

	const routePoints: RoutePoint[] = points.map((pos, i) => ({
		position: pos,
		elevation: elevations[i],
		distanceFromStart: distances[i]
	}));

	// Determine markers: use parsed markers if available, otherwise start+end
	let sourceMarkers = parsed.markers;
	if (sourceMarkers.length < 2) {
		sourceMarkers = [
			{ name: 'Start', position: points[0] },
			{ name: 'Ziel', position: points[points.length - 1] }
		];
	}

	const routeMarkers: RouteMarker[] = sourceMarkers.map((m) => {
		const { index } = snapToRoute(m.position, points);
		return {
			id: newId(),
			name: m.name,
			routePointIndex: index,
			elevation: elevations[index],
			distanceFromStart: distances[index],
			breakMinutes: defaultBreakMinutes
		};
	});

	routeMarkers.sort((a, b) => a.distanceFromStart - b.distanceFromStart);

	// Start/End markers get no break
	routeMarkers[0].breakMinutes = 0;
	routeMarkers[routeMarkers.length - 1].breakMinutes = 0;

	return {
		name: parsed.name,
		points: routePoints,
		markers: routeMarkers
	};
}
