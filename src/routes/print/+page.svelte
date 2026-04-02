<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProcessedRoute, RouteCalculation, Settings } from '$lib/types';
	import { t } from '$lib/i18n';
	import { formatDuration, addMinutes } from '$lib/calculation';

	let route = $state<ProcessedRoute | null>(null);
	let calculation = $state<RouteCalculation | null>(null);
	let settings = $state<Settings | null>(null);
	let loadError = $state(false);

	onMount(() => {
		try {
			const raw = localStorage.getItem('marsch:route');
			if (!raw) { loadError = true; return; }
			const data = JSON.parse(raw) as { route: ProcessedRoute; settings: Settings };
			route = data.route;
			settings = data.settings;
			// Re-import calculate to avoid SSR issues
			import('$lib/calculation').then(({ calculate }) => {
				if (route && settings) {
					calculation = calculate(route, settings);
				}
			});
		} catch {
			loadError = true;
		}
	});

	function cumulativeMinutes(legIndex: number, markers: ProcessedRoute['markers'], legs: RouteCalculation['legs']): number {
		let mins = 0;
		for (let i = 0; i < legIndex; i++) {
			mins += legs[i].walkingMinutes + markers[i].breakMinutes;
		}
		return mins;
	}

	const today = new Date().toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
</script>

<svelte:head>
	<title>{t('print.title')}</title>
	<style>
		@media print {
			@page { margin: 1.5cm; }
			body { font-size: 11pt; }
			.no-print { display: none !important; }
		}
	</style>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-8 font-sans text-slate-900">
	{#if loadError}
		<p class="text-red-600">Keine Route gefunden. Bitte kehre zur App zurück.</p>
	{:else if !route || !calculation || !settings}
		<p class="text-slate-500">Wird geladen…</p>
	{:else}
		<!-- Header -->
		<div class="mb-6 flex items-start justify-between border-b pb-4">
			<div>
				<h1 class="text-2xl font-bold">{t('print.title')}</h1>
				<p class="mt-0.5 text-lg text-slate-600">{route.name}</p>
			</div>
			<div class="text-right text-sm text-slate-500">
				<p>{t('print.generatedOn')}: {today}</p>
				{#if settings.departureTime}
					<p>Abfahrt: {settings.departureTime} Uhr</p>
				{/if}
				<p>Tempo: {settings.speedKmh} km/h</p>
			</div>
		</div>

		<!-- Summary grid -->
		<div class="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
			{#each [
				{ label: 'Distanz', value: `${calculation.totalDistanceKm.toFixed(1)} km` },
				{ label: 'Aufstieg', value: `↑ ${Math.round(calculation.totalAscentM)} m` },
				{ label: 'Abstieg', value: `↓ ${Math.round(calculation.totalDescentM)} m` },
				{ label: 'Gehzeit', value: formatDuration(calculation.totalWalkingMinutes) },
				{ label: 'Pausen', value: formatDuration(calculation.totalBreakMinutes) },
				{ label: 'Total', value: formatDuration(calculation.totalMinutes) },
			] as stat}
				<div class="rounded-lg border border-slate-200 p-3 text-center">
					<p class="text-xs text-slate-500">{stat.label}</p>
					<p class="mt-0.5 font-bold">{stat.value}</p>
				</div>
			{/each}
		</div>

		<!-- Table -->
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="border-b-2 border-slate-900 text-left">
					<th class="py-2 pr-3">Wegpunkt</th>
					<th class="py-2 pr-3 text-right">Distanz</th>
					<th class="py-2 pr-3 text-right">Höhe</th>
					<th class="py-2 pr-3 text-right">Aufstieg</th>
					<th class="py-2 pr-3 text-right">Abstieg</th>
					<th class="py-2 pr-3 text-right">Gehzeit</th>
					<th class="py-2 pr-3 text-right">Pause</th>
					{#if settings.departureTime}
						<th class="py-2 text-right">Ankunft</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each route.markers as marker, i}
					{@const leg = calculation.legs[i - 1]}
					{@const elapsed = i > 0 ? cumulativeMinutes(i, route.markers, calculation.legs) : 0}
					<tr class="border-b border-slate-200 {i % 2 === 0 ? '' : 'bg-slate-50'}">
						<td class="py-2 pr-3 font-medium">{marker.name}</td>
						<td class="py-2 pr-3 text-right tabular-nums">{(marker.distanceFromStart / 1000).toFixed(1)} km</td>
						<td class="py-2 pr-3 text-right tabular-nums">{Math.round(marker.elevation)} m</td>
						<td class="py-2 pr-3 text-right tabular-nums">{leg ? `↑ ${Math.round(leg.ascentM)}` : '–'}</td>
						<td class="py-2 pr-3 text-right tabular-nums">{leg ? `↓ ${Math.round(leg.descentM)}` : '–'}</td>
						<td class="py-2 pr-3 text-right tabular-nums">{leg ? formatDuration(leg.walkingMinutes) : '–'}</td>
						<td class="py-2 pr-3 text-right tabular-nums">{(i > 0 && i < route.markers.length - 1) ? `${marker.breakMinutes} Min.` : '–'}</td>
						{#if settings.departureTime}
							<td class="py-2 text-right tabular-nums font-medium">
								{i === 0 ? settings.departureTime : addMinutes(settings.departureTime, elapsed)}
							</td>
						{/if}
					</tr>
				{/each}
				<!-- Total row -->
				<tr class="border-t-2 border-slate-900 font-bold">
					<td class="py-2 pr-3">Total</td>
					<td class="py-2 pr-3 text-right tabular-nums">{calculation.totalDistanceKm.toFixed(1)} km</td>
					<td class="py-2 pr-3"></td>
					<td class="py-2 pr-3 text-right tabular-nums">↑ {Math.round(calculation.totalAscentM)}</td>
					<td class="py-2 pr-3 text-right tabular-nums">↓ {Math.round(calculation.totalDescentM)}</td>
					<td class="py-2 pr-3 text-right tabular-nums">{formatDuration(calculation.totalWalkingMinutes)}</td>
					<td class="py-2 pr-3 text-right tabular-nums">{formatDuration(calculation.totalBreakMinutes)}</td>
					{#if settings.departureTime}
						<td class="py-2 text-right tabular-nums">{addMinutes(settings.departureTime, calculation.totalMinutes)}</td>
					{/if}
				</tr>
			</tbody>
		</table>

		<!-- Notes -->
		<div class="mt-8">
			<p class="mb-1 text-sm font-semibold text-slate-600">{t('print.notes')}</p>
			<div class="h-24 rounded-lg border border-slate-300"></div>
		</div>

		<!-- Print button -->
		<div class="no-print mt-6 flex justify-end">
			<button
				class="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
				onclick={() => window.print()}
			>
				{t('actions.print')}
			</button>
		</div>
	{/if}
</div>
