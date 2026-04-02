import type { WGS84Coord } from '$lib/types';
import { haversineDistance } from './coordinates';

/**
 * Find the index of the route point closest to `target`.
 * Returns the index and the distance in metres.
 */
export function snapToRoute(
	target: WGS84Coord,
	routePoints: WGS84Coord[]
): { index: number; distanceM: number } {
	let bestIndex = 0;
	let bestDist = Infinity;

	for (let i = 0; i < routePoints.length; i++) {
		const d = haversineDistance(target, routePoints[i]);
		if (d < bestDist) {
			bestDist = d;
			bestIndex = i;
		}
	}

	return { index: bestIndex, distanceM: bestDist };
}

/** Max distance (m) a marker may be from the route before we warn. */
export const MAX_SNAP_DISTANCE_M = 500;
