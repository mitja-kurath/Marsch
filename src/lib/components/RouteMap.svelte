<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProcessedRoute } from '$lib/types';

	type Props = {
		route: ProcessedRoute;
		highlightIndex?: number | null;
	};

	let { route, highlightIndex = null }: Props = $props();

	let mapEl: HTMLDivElement;
	let map: import('leaflet').Map | undefined;
	let polyline: import('leaflet').Polyline | undefined;
	let markerLayer: import('leaflet').LayerGroup | undefined;
	let leafletMarkers: import('leaflet').Marker[] = [];
	let leafletRef: typeof import('leaflet') | undefined;

	function markerSvg(label: string, isStart: boolean, isEnd: boolean, highlighted = false): string {
		const bg = isStart ? '#16a34a' : isEnd ? '#dc2626' : '#2563eb';
		const size = highlighted ? 40 : 32;
		const fontSize = highlighted ? 11 : 9;
		const border = highlighted ? 3 : 2;
		const initials = label.slice(0, 2).toUpperCase();
		return `
			<div style="
				background:${bg};
				color:#fff;
				width:${size}px;height:${size}px;
				border-radius:50% 50% 50% 0;
				transform:rotate(-45deg);
				display:flex;align-items:center;justify-content:center;
				box-shadow:0 2px 6px rgba(0,0,0,.4);
				border:${border}px solid #fff;
				transition:width 0.12s,height 0.12s;
			">
				<span style="transform:rotate(45deg);font-size:${fontSize}px;font-weight:700">${initials}</span>
			</div>`;
	}

	onMount(() => {
		(async () => {
			const L = await import('leaflet');
			await import('leaflet/dist/leaflet.css');
			leafletRef = L;

			map = L.map(mapEl, { zoomControl: true });

			L.tileLayer(
				'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
				{
					attribution: '© <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
					maxZoom: 18
				}
			).addTo(map);

			markerLayer = L.layerGroup().addTo(map);
			renderRoute(L);
		})();

		return () => {
			map?.remove();
		};
	});

	function renderRoute(L: typeof import('leaflet')) {
		if (!map || !markerLayer) return;

		markerLayer.clearLayers();
		polyline?.remove();
		leafletMarkers = [];

		const latlngs = route.points.map((p) => [p.position.lat, p.position.lon] as [number, number]);

		polyline = L.polyline(latlngs, {
			color: '#16a34a',
			weight: 4,
			opacity: 0.85
		}).addTo(map);

		const lastIdx = route.markers.length - 1;
		route.markers.forEach((m, i) => {
			const highlighted = highlightIndex === i;
			const icon = L.divIcon({
				html: markerSvg(m.name, i === 0, i === lastIdx, highlighted),
				className: '',
				iconSize: highlighted ? [40, 40] : [32, 32],
				iconAnchor: highlighted ? [20, 40] : [16, 32],
				popupAnchor: [0, -34]
			});

			const pt = route.points[m.routePointIndex];
			const marker = L.marker([pt.position.lat, pt.position.lon], { icon })
				.bindPopup(
					`<strong>${m.name}</strong><br>${Math.round(pt.elevation)} m ü. M.<br>${(m.distanceFromStart / 1000).toFixed(1)} km`
				)
				.addTo(markerLayer!);

			leafletMarkers.push(marker);
		});

		map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
	}

	$effect(() => {
		if (!map || !route) return;

		import('leaflet').then((L) => {
			renderRoute(L);
		});
	});

	// Update marker icons when highlightIndex changes without re-rendering the whole map
	$effect(() => {
		const idx = highlightIndex;
		if (!leafletRef || !leafletMarkers.length) return;

		const L = leafletRef;
		const lastIdx = route.markers.length - 1;

		leafletMarkers.forEach((marker, i) => {
			const m = route.markers[i];
			const highlighted = idx === i;
			const icon = L.divIcon({
				html: markerSvg(m.name, i === 0, i === lastIdx, highlighted),
				className: '',
				iconSize: highlighted ? [40, 40] : [32, 32],
				iconAnchor: highlighted ? [20, 40] : [16, 32],
				popupAnchor: [0, -34]
			});
			marker.setIcon(icon);
		});
	});
</script>

<div bind:this={mapEl} class="h-full w-full rounded-xl"></div>
