/**
 * Leistungskilometer (effort-kilometre) formula.
 *
 * Developed by the Swiss Alpine Club (SAC) and used by official Swiss
 * hiking time estimates. Each Leistungskilometer (LK) corresponds to one
 * "effort-equivalent" flat kilometre at the reference speed.
 *
 * Formula:
 *   - Uphill:  LK += distKm + ascentM / 100
 *   - Flat:    LK += distKm
 *   - Downhill (slope ≤ -20%): LK += distKm + |descentM| / 150
 *   - Gentle descent (slope > -20%): LK += distKm
 *
 * Time (minutes) = LK / speedKmh * 60
 */

export type LegMetrics = {
	distanceKm: number;
	ascentM: number;
	descentM: number;
};

export function calcLeistungskilometer({ distanceKm, ascentM, descentM }: LegMetrics): number {
	let lk = distanceKm;

	// Uphill penalty: +1 LK per 100 m ascent
	lk += ascentM / 100;

	// Steep downhill penalty: only when average slope < -20%
	// Slope = descentM / (distanceKm * 1000)
	if (distanceKm > 0) {
		const slope = -descentM / (distanceKm * 1000);
		if (slope > 0.2) {
			lk += descentM / 150;
		}
	}

	return lk;
}

export function walkingMinutes(lk: number, speedKmh: number): number {
	if (speedKmh <= 0) return 0;
	return (lk / speedKmh) * 60;
}
