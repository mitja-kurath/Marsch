<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProcessedRoute, RouteMarker } from '$lib/types';
	import { t } from '$lib/i18n';

	type Props = {
		route: ProcessedRoute;
	};

	let { route }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: import('chart.js').Chart | undefined;

	function buildChartData(r: ProcessedRoute) {
		// Use point indices as labels; x-axis tick callback converts to km
		const labels = r.points.map((_, i) => i);
		const data = r.points.map((p) => p.elevation);
		return { labels, data };
	}

	function buildAnnotations(r: ProcessedRoute) {
		// Find the x-axis label closest to each marker's distance
		const totalDist = r.points[r.points.length - 1].distanceFromStart;
		return Object.fromEntries(
			r.markers.map((m, i) => {
				// Find the point index closest to this marker's distance
				const fraction = totalDist > 0 ? m.distanceFromStart / totalDist : 0;
				const labelIndex = Math.round(fraction * (r.points.length - 1));
				return [
					`marker-${i}`,
					{
						type: 'line' as const,
						scaleID: 'x',
						value: labelIndex,
						borderColor:
							i === 0 ? '#16a34a' : i === r.markers.length - 1 ? '#dc2626' : '#2563eb',
						borderWidth: 2,
						borderDash: [4, 4],
						label: {
							display: true,
							content: m.name,
							position: 'start' as const,
							backgroundColor: 'rgba(0,0,0,0.6)',
							color: '#fff',
							font: { size: 10 },
							padding: { x: 4, y: 2 }
						}
					}
				];
			})
		);
	}

	onMount(() => {
		(async () => {
			const { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } =
				await import('chart.js');
			const annotationPlugin = (await import('chartjs-plugin-annotation')).default;

			Chart.register(
				LineController,
				LineElement,
				PointElement,
				LinearScale,
				CategoryScale,
				Filler,
				Tooltip,
				annotationPlugin
			);

			const { labels, data } = buildChartData(route);

			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: [
						{
							data,
							fill: true,
							borderColor: '#16a34a',
							backgroundColor: 'rgba(22,163,74,0.15)',
							borderWidth: 2,
							pointRadius: 0,
							tension: 0.3
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animation: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							mode: 'index',
							intersect: false,
							callbacks: {
								title: (items) => `${items[0].label} km`,
								label: (item) => `${Math.round(item.parsed.y ?? 0)} m ü. M.`
							}
						},
						annotation: { annotations: buildAnnotations(route) }
					},
					scales: {
						x: {
							ticks: {
								maxTicksLimit: 8,
								callback: (_val, i, ticks) => {
									if (
										i === 0 ||
										i === ticks.length - 1 ||
										i % Math.ceil(ticks.length / 6) === 0
									) {
										const totalKm =
											route.points[route.points.length - 1].distanceFromStart / 1000;
										return `${((i * totalKm) / (ticks.length - 1)).toFixed(1)} km`;
									}
									return '';
								}
							},
							grid: { display: false }
						},
						y: {
							title: { display: true, text: t('chart.elevationLabel'), font: { size: 11 } },
							ticks: { callback: (v) => `${v} m` }
						}
					}
				}
			});
		})();

		return () => chart?.destroy();
	});

	$effect(() => {
		if (!chart) return;
		const { labels, data } = buildChartData(route);
		chart.data.labels = labels;
		chart.data.datasets[0].data = data;
		(chart.options.plugins as any).annotation.annotations = buildAnnotations(route);
		chart.update('none');
	});
</script>

<div class="relative h-full w-full">
	<canvas bind:this={canvas}></canvas>
</div>
