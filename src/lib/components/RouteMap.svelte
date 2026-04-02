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

	function markerSvg(label: string, isStart: boolean, isEnd: boolean): string {
		const bg = isStart ? '#16a34a' : isEnd ? '#dc2626' : '#2563eb';
		const initials = label.slice(0, 2).toUpperCase();
		return `
			<div style="
				background:${bg};
				color:#fff;
				width:32px;height:32px;
				border-radius:50% 50% 50% 0;
				transform:rotate(-45deg);
				display:flex;align-items:center;justify-content:center;
				box-shadow:0 2px 6px rgba(0,0,0,.4);
				border:2px solid #fff;
			">
				<span style="transform:rotate(45deg);font-size:9px;font-weight:700">${initials}</span>
			</div>`;
	}

	onMount(() => {
		(async () => {
			const L = await import('leaflet');
			await import('leaflet/dist/leaflet.css');

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

		const latlngs = route.points.map((p) => [p.position.lat, p.position.lon] as [number, number]);

		polyline = L.polyline(latlngs, {
			color: '#16a34a',
			weight: 4,
			opacity: 0.85
		}).addTo(map);

		const lastIdx = route.markers.length - 1;
		route.markers.forEach((m, i) => {
			const icon = L.divIcon({
				html: markerSvg(m.name, i === 0, i === lastIdx),
				className: '',
				iconSize: [32, 32],
				iconAnchor: [16, 32],
				popupAnchor: [0, -34]
			});

			const pt = route.points[m.routePointIndex];
			L.marker([pt.position.lat, pt.position.lon], { icon })
				.bindPopup(
					`<strong>${m.name}</strong><br>${Math.round(pt.elevation)} m ü. M.<br>${(m.distanceFromStart / 1000).toFixed(1)} km`
				)
				.addTo(markerLayer!);
		});

		map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
	}

	$effect(() => {
		if (!map || !route) return;

		import('leaflet').then((L) => {
			renderRoute(L);
		});
	});
</script>

<div bind:this={mapEl} class="h-full w-full rounded-xl"></div>
