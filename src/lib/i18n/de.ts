export const de = {
	app: {
		title: 'Marsch',
		subtitle: 'Wanderzeit-Planer'
	},
	upload: {
		title: 'Route hochladen',
		description: 'KML- oder GPX-Datei hierher ziehen oder klicken zum Auswählen',
		button: 'Datei auswählen',
		supportedFormats: 'Unterstützte Formate: KML (Swisstopo), GPX (Komoot, Strava, AllTrails)',
		error: {
			invalidFormat: 'Ungültiges Format. Unterstützt werden: KML und GPX. Du hast hochgeladen: {ext}',
			noRoute: 'Die Datei enthält keine Route.',
			noMarkers: 'Mindestens zwei Wegpunkte (Start und Ziel) sind erforderlich.',
			parseError: 'Fehler beim Lesen der Datei: {message}',
			outsideSwitzerland:
				'Die Route liegt ausserhalb der Schweiz. Aktuell wird nur die Schweiz unterstützt.',
			tooFewPoints: 'Die Route enthält zu wenige Punkte.'
		}
	},
	settings: {
		title: 'Einstellungen',
		speed: 'Wandertempo',
		speedSlow: 'Langsam (3 km/h)',
		speedNormal: 'Normal (4 km/h)',
		speedFast: 'Schnell (5 km/h)',
		speedCustom: 'Eigenes Tempo',
		defaultBreak: 'Standard-Pause je Wegpunkt',
		minutes: 'Min.',
		kmh: 'km/h',
		departureTime: 'Abfahrtszeit (optional)',
		departureTimePlaceholder: 'z. B. 08:00'
	},
	map: {
		title: 'Karte'
	},
	chart: {
		title: 'Höhenprofil',
		elevationLabel: 'Höhe (m ü. M.)',
		distanceLabel: 'Distanz (km)'
	},
	table: {
		title: 'Wegpunkte',
		name: 'Wegpunkt',
		distanceFromStart: 'Distanz',
		elevation: 'Höhe',
		ascent: 'Aufstieg',
		descent: 'Abstieg',
		lk: 'Leistungs-km',
		walkingTime: 'Gehzeit',
		breakTime: 'Pause',
		arrival: 'Ankunft',
		totalRow: 'Total'
	},
	summary: {
		title: 'Zusammenfassung',
		totalDistance: 'Gesamtdistanz',
		totalAscent: 'Aufstieg',
		totalDescent: 'Abstieg',
		walkingTime: 'Gehzeit',
		breakTime: 'Pausenzeit',
		totalTime: 'Gesamtzeit'
	},
	marker: {
		breakLabel: 'Pause',
		minutes: 'Min.',
		editBreak: 'Pause bearbeiten'
	},
	actions: {
		print: 'Drucken',
		reset: 'Neue Route',
		exportJson: 'Als JSON exportieren'
	},
	loading: {
		parsing: 'Datei wird analysiert…',
		elevation: 'Höhendaten werden geladen…',
		calculating: 'Zeiten werden berechnet…'
	},
	error: {
		elevationApi: 'Höhendaten konnten nicht geladen werden. Bitte prüfe deine Internetverbindung.',
		retry: 'Erneut versuchen',
		unknown: 'Ein unerwarteter Fehler ist aufgetreten.'
	},
	units: {
		km: 'km',
		m: 'm',
		hm: 'Hm',
		h: 'h',
		min: 'Min.',
		kmh: 'km/h'
	},
	print: {
		title: 'Marschzeittabelle',
		generatedOn: 'Erstellt am',
		route: 'Route',
		notes: 'Bemerkungen'
	}
} as const;

export type Translations = typeof de;
