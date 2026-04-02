/**
 * Approximate coordinate conversions between WGS84 and Swiss LV95 (EPSG:2056).
 *
 * Based on the official Swisstopo approximation formula:
 * https://www.swisstopo.admin.ch/en/maps-data-online/calculation-services/navref.html
 *
 * Accuracy: ±1 m (sufficient for hiking applications).
 */

import type { WGS84Coord, LV95Coord } from '$lib/types';

/** Switzerland bounding box (WGS84) — used for region detection. */
const CH_BOUNDS = {
	latMin: 45.8,
	latMax: 47.85,
	lonMin: 5.9,
	lonMax: 10.55
};

export function isInSwitzerland(coord: WGS84Coord): boolean {
	return (
		coord.lat >= CH_BOUNDS.latMin &&
		coord.lat <= CH_BOUNDS.latMax &&
		coord.lon >= CH_BOUNDS.lonMin &&
		coord.lon <= CH_BOUNDS.lonMax
	);
}

/** WGS84 → LV95 (EPSG:2056) */
export function wgs84ToLv95(coord: WGS84Coord): LV95Coord {
	const phi = (coord.lat * 3600 - 169028.66) / 10000;
	const lambda = (coord.lon * 3600 - 26782.5) / 10000;

	const e =
		2600072.37 +
		211455.93 * lambda -
		10938.51 * lambda * phi -
		0.36 * lambda * phi * phi -
		44.54 * lambda * lambda * lambda;

	const n =
		1200147.07 +
		308807.95 * phi +
		3745.25 * lambda * lambda +
		76.63 * phi * phi -
		194.56 * lambda * lambda * phi +
		119.79 * phi * phi * phi;

	return { e, n };
}

/** LV95 (EPSG:2056) → WGS84 */
export function lv95ToWgs84(coord: LV95Coord): WGS84Coord {
	const y = (coord.e - 2600000) / 1000000;
	const x = (coord.n - 1200000) / 1000000;

	const lonDeg =
		2.6779094 +
		4.728982 * y +
		0.791484 * y * x +
		0.1306 * y * x * x -
		0.0436 * y * y * y;

	const latDeg =
		16.9023892 +
		3.238272 * x -
		0.270978 * y * y -
		0.002528 * x * x -
		0.0447 * y * y * x -
		0.014 * x * x * x;

	return {
		lat: (latDeg * 100) / 36,
		lon: (lonDeg * 100) / 36
	};
}

/**
 * Haversine distance in metres between two WGS84 points.
 */
export function haversineDistance(a: WGS84Coord, b: WGS84Coord): number {
	const R = 6371000;
	const dLat = ((b.lat - a.lat) * Math.PI) / 180;
	const dLon = ((b.lon - a.lon) * Math.PI) / 180;
	const sinDLat = Math.sin(dLat / 2);
	const sinDLon = Math.sin(dLon / 2);
	const aa =
		sinDLat * sinDLat +
		Math.cos((a.lat * Math.PI) / 180) *
			Math.cos((b.lat * Math.PI) / 180) *
			sinDLon *
			sinDLon;
	return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}
