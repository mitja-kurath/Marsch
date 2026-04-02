import type { ProcessedRoute, RouteCalculation, RouteLeg, Settings } from '$lib/types';
import { calcLeistungskilometer, walkingMinutes } from './leistungskilometer';

/**
 * Compute the full route calculation from a ProcessedRoute + user settings.
 * Pure function — no side effects, safe to call reactively.
 */
export function calculate(route: ProcessedRoute, settings: Settings): RouteCalculation {
	const { markers, points } = route;
	const legs: RouteLeg[] = [];

	let totalDistanceKm = 0;
	let totalAscentM = 0;
	let totalDescentM = 0;
	let totalWalkingMinutes = 0;
	let totalBreakMinutes = 0;

	for (let i = 0; i < markers.length - 1; i++) {
		const from = markers[i];
		const to = markers[i + 1];

		const segPoints = points.slice(from.routePointIndex, to.routePointIndex + 1);

		let ascentM = 0;
		let descentM = 0;

		for (let j = 1; j < segPoints.length; j++) {
			const dh = segPoints[j].elevation - segPoints[j - 1].elevation;
			if (dh > 0) ascentM += dh;
			else descentM += -dh;
		}

		const distanceKm = (to.distanceFromStart - from.distanceFromStart) / 1000;
		const lk = calcLeistungskilometer({ distanceKm, ascentM, descentM });
		const legWalkingMinutes = walkingMinutes(lk, settings.speedKmh);

		legs.push({
			fromMarker: from,
			toMarker: to,
			distanceKm,
			ascentM,
			descentM,
			leistungskilometer: lk,
			walkingMinutes: legWalkingMinutes
		});

		totalDistanceKm += distanceKm;
		totalAscentM += ascentM;
		totalDescentM += descentM;
		totalWalkingMinutes += legWalkingMinutes;
		totalBreakMinutes += from.breakMinutes; // break taken *at* the from-marker
	}

	return {
		legs,
		totalDistanceKm,
		totalAscentM,
		totalDescentM,
		totalWalkingMinutes,
		totalBreakMinutes,
		totalMinutes: totalWalkingMinutes + totalBreakMinutes
	};
}

/**
 * Format minutes as "Xh Ymin" or just "Ymin" if under an hour.
 */
export function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = Math.round(minutes % 60);
	if (h === 0) return `${m} Min.`;
	if (m === 0) return `${h} h`;
	return `${h} h ${m} Min.`;
}

/**
 * Given a departure time string ("HH:MM") and elapsed minutes, return
 * the arrival time as "HH:MM".
 */
export function addMinutes(timeStr: string, minutes: number): string {
	const [h, m] = timeStr.split(':').map(Number);
	const total = h * 60 + m + Math.round(minutes);
	const hh = Math.floor(total / 60) % 24;
	const mm = total % 60;
	return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
