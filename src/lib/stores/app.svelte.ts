import type {
	ProcessedRoute,
	RouteCalculation,
	AppStatus,
	Settings,
	RouteMarker
} from '$lib/types';
import { DEFAULT_SETTINGS } from '$lib/types';
import { calculate } from '$lib/calculation';

class AppStore {
	route = $state<ProcessedRoute | null>(null);
	calculation = $state<RouteCalculation | null>(null);
	status = $state<AppStatus>({ type: 'idle' });
	settings = $state<Settings>({ ...DEFAULT_SETTINGS });

	recalculate() {
		if (this.route) {
			this.calculation = calculate(this.route, this.settings);
		}
	}

	updateMarkerBreak(markerId: string, breakMinutes: number) {
		if (!this.route) return;
		const marker = this.route.markers.find((m) => m.id === markerId);
		if (marker) {
			marker.breakMinutes = breakMinutes;
			this.recalculate();
		}
	}

	updateMarkerName(markerId: string, name: string) {
		if (!this.route) return;
		const marker = this.route.markers.find((m) => m.id === markerId);
		if (marker) {
			marker.name = name;
		}
	}

	setSpeed(speedKmh: number) {
		this.settings.speedKmh = speedKmh;
		this.recalculate();
	}

	setLoading(message: string) {
		this.status = { type: 'loading', message };
	}

	setError(message: string) {
		this.status = { type: 'error', message };
	}

	setReady(route: ProcessedRoute) {
		this.route = route;
		this.recalculate();
		this.status = { type: 'ready' };
		this.persist();
	}

	reset() {
		this.route = null;
		this.calculation = null;
		this.status = { type: 'idle' };
		this.clearPersisted();
	}

	persist() {
		if (!this.route || !this.calculation) return;
		try {
			localStorage.setItem(
				'marsch:route',
				JSON.stringify({ route: this.route, settings: this.settings })
			);
		} catch {
			// storage quota — ignore
		}
	}

	hydrate() {
		try {
			const raw = localStorage.getItem('marsch:route');
			if (!raw) return;
			const { route, settings } = JSON.parse(raw) as {
				route: ProcessedRoute;
				settings: Settings;
			};
			this.settings = { ...DEFAULT_SETTINGS, ...settings };
			this.route = route;
			this.recalculate();
			this.status = { type: 'ready' };
		} catch {
			this.clearPersisted();
		}
	}

	clearPersisted() {
		try {
			localStorage.removeItem('marsch:route');
		} catch {
			// ignore
		}
	}

	snapshotForPrint(): { route: ProcessedRoute; calculation: RouteCalculation; settings: Settings } | null {
		if (!this.route || !this.calculation) return null;
		return {
			route: JSON.parse(JSON.stringify(this.route)),
			calculation: JSON.parse(JSON.stringify(this.calculation)),
			settings: { ...this.settings }
		};
	}
}

export const app = new AppStore();
