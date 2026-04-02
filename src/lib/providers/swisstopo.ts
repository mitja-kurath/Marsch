/**
 * Swisstopo elevation profile API client.
 *
 * API docs: https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * Takes a LineString in LV95 (EPSG:2056) and returns elevation samples.
 * No API key required — public Swiss federal API.
 */

import type { WGS84Coord } from '$lib/types';
import type { ElevationProfile } from '$lib/processing/pipeline';
import { wgs84ToLv95, haversineDistance } from '$lib/processing/coordinates';
import { simplify } from '$lib/processing/simplify';

const PROFILE_URL = 'https://api3.geo.admin.ch/rest/services/profile.json';

/** Number of elevation points to request from the API. */
const NB_POINTS = 500;

/** Max input coordinates the API accepts in one request. */
const MAX_INPUT_COORDS = 4000;

type ProfilePoint = {
	dist: number; // km from start
	alts: { COMB?: number; DTM25?: number; DTM2?: number };
	easting: number;
	northing: number;
};

/**
 * Fetch elevation profile for `routePoints` from Swisstopo.
 *
 * Returns elevations indexed 1:1 with the input `routePoints` array,
 * interpolated from the API response.
 */
export async function fetchElevationProfile(routePoints: WGS84Coord[]): Promise<ElevationProfile> {
	// Reduce to API limits if necessary
	const simplified =
		routePoints.length > MAX_INPUT_COORDS ? simplify(routePoints, 20) : routePoints;

	const lv95 = simplified.map(wgs84ToLv95);
	const geom = JSON.stringify({
		type: 'LineString',
		coordinates: lv95.map((p) => [p.e, p.n])
	});

	const params = new URLSearchParams({
		geom,
		sr: '2056',
		nb_points: String(NB_POINTS),
		distinct_points: 'true'
	});

	const response = await fetch(`${PROFILE_URL}?${params.toString()}`);
	if (!response.ok) {
		throw new Error(`Swisstopo API ${response.status}: ${response.statusText}`);
	}

	const profile: ProfilePoint[] = await response.json();
	if (!Array.isArray(profile) || profile.length === 0) {
		throw new Error('Empty elevation profile response');
	}

	// Build a distance→elevation lookup from the profile
	const profileDists = profile.map((p) => p.dist * 1000); // km → m
	const profileElevs = profile.map((p) => p.alts.COMB ?? p.alts.DTM25 ?? p.alts.DTM2 ?? 0);

	// Compute cumulative distances along the (simplified) input points
	const inputDists: number[] = [0];
	for (let i = 1; i < simplified.length; i++) {
		inputDists.push(inputDists[i - 1] + haversineDistance(simplified[i - 1], simplified[i]));
	}
	const totalInputDist = inputDists[inputDists.length - 1];
	const totalProfileDist = profileDists[profileDists.length - 1];

	// Scale factor in case API normalises distance differently
	const scale = totalProfileDist > 0 ? totalProfileDist / totalInputDist : 1;

	// Interpolate elevation at each simplified input point
	const simplifiedElevations = inputDists.map((d) => interpolate(d * scale, profileDists, profileElevs));

	// Now map back to the original (non-simplified) routePoints array
	// by re-computing cumulative distances and interpolating
	if (routePoints === simplified) {
		return { elevations: simplifiedElevations };
	}

	const originalDists: number[] = [0];
	for (let i = 1; i < routePoints.length; i++) {
		originalDists.push(
			originalDists[i - 1] + haversineDistance(routePoints[i - 1], routePoints[i])
		);
	}
	const totalOrigDist = originalDists[originalDists.length - 1];
	const scaleOrig = totalProfileDist > 0 ? totalProfileDist / totalOrigDist : 1;

	const elevations = originalDists.map((d) =>
		interpolate(d * scaleOrig, profileDists, profileElevs)
	);

	return { elevations };
}

/** Linear interpolation into a sorted distance→elevation table. */
function interpolate(distM: number, dists: number[], elevs: number[]): number {
	if (distM <= dists[0]) return elevs[0];
	if (distM >= dists[dists.length - 1]) return elevs[elevs.length - 1];

	let lo = 0;
	let hi = dists.length - 1;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (dists[mid] <= distM) lo = mid;
		else hi = mid;
	}

	const t = (distM - dists[lo]) / (dists[hi] - dists[lo]);
	return elevs[lo] + t * (elevs[hi] - elevs[lo]);
}
