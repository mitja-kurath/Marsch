// ─── Coordinates ────────────────────────────────────────────────────────────

export type WGS84Coord = {
	lat: number;
	lon: number;
};

export type LV95Coord = {
	e: number; // Easting  (EPSG:2056)
	n: number; // Northing (EPSG:2056)
};

// ─── Parsed (raw output from KML / GPX) ─────────────────────────────────────

export type ParsedMarker = {
	name: string;
	position: WGS84Coord;
};

export type ParsedRoute = {
	name: string;
	points: WGS84Coord[]; // route polyline
	markers: ParsedMarker[]; // named waypoints / placemarks
};

// ─── Processed (after elevation fetch + snapping) ────────────────────────────

export type RoutePoint = {
	position: WGS84Coord;
	elevation: number; // metres
	distanceFromStart: number; // metres
};

export type RouteMarker = {
	id: string;
	name: string;
	routePointIndex: number; // index into ProcessedRoute.points
	elevation: number; // metres
	distanceFromStart: number; // metres
	breakMinutes: number;
};

export type ProcessedRoute = {
	name: string;
	points: RoutePoint[];
	markers: RouteMarker[];
};

// ─── Calculation ─────────────────────────────────────────────────────────────

export type RouteLeg = {
	fromMarker: RouteMarker;
	toMarker: RouteMarker;
	distanceKm: number;
	ascentM: number;
	descentM: number;
	leistungskilometer: number;
	walkingMinutes: number;
};

export type RouteCalculation = {
	legs: RouteLeg[];
	totalDistanceKm: number;
	totalAscentM: number;
	totalDescentM: number;
	totalWalkingMinutes: number;
	totalBreakMinutes: number;
	totalMinutes: number;
};

// ─── Settings ────────────────────────────────────────────────────────────────

export type SpeedPreset = 'slow' | 'normal' | 'fast' | 'custom';

export type Settings = {
	speedPreset: SpeedPreset;
	speedKmh: number;
	defaultBreakMinutes: number;
	departureTime: string; // "HH:MM", empty string = no time tracking
};

export const SPEED_PRESETS: Record<Exclude<SpeedPreset, 'custom'>, number> = {
	slow: 3,
	normal: 4,
	fast: 5
};

export const DEFAULT_SETTINGS: Settings = {
	speedPreset: 'normal',
	speedKmh: 4,
	defaultBreakMinutes: 10,
	departureTime: ''
};

// ─── App status ───────────────────────────────────────────────────────────────

export type AppStatus =
	| { type: 'idle' }
	| { type: 'loading'; message: string }
	| { type: 'error'; message: string }
	| { type: 'ready' };
