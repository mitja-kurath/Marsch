<script lang="ts">
	import type { ProcessedRoute, RouteCalculation, Settings } from '$lib/types';
	import { t } from '$lib/i18n';
	import { formatDuration, addMinutes } from '$lib/calculation';
	import { app } from '$lib/stores/app.svelte';

	type Props = {
		route: ProcessedRoute;
		calculation: RouteCalculation;
		settings: Settings;
	};

	let { route, calculation, settings }: Props = $props();

	let editingBreak: string | null = $state(null);
	let editingName: string | null = $state(null);

	function cumulativeWalkingAtMarker(markerIdx: number): number {
		return calculation.legs
			.slice(0, markerIdx)
			.reduce((sum, leg) => sum + leg.walkingMinutes, 0);
	}

	function cumulativeBreakAtMarker(markerIdx: number): number {
		return route.markers
			.slice(0, markerIdx)
			.reduce((sum, m) => sum + m.breakMinutes, 0);
	}

	function arrivalTime(markerIdx: number): string | null {
		if (!settings.departureTime) return null;
		const elapsed = cumulativeWalkingAtMarker(markerIdx) + cumulativeBreakAtMarker(markerIdx);
		return addMinutes(settings.departureTime, elapsed);
	}
</script>

<div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
	<table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
		<thead class="bg-slate-50 dark:bg-slate-800">
			<tr>
				<th class="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.name')}</th
				>
				<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.distanceFromStart')}</th
				>
				<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.elevation')}</th
				>
				<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.ascent')}</th
				>
				<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.descent')}</th
				>
				<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.walkingTime')}</th
				>
				<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
					>{t('table.breakTime')}</th
				>
				{#if settings.departureTime}
					<th class="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300"
						>{t('table.arrival')}</th
					>
				{/if}
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100 bg-white dark:divide-slate-700/50 dark:bg-slate-900">
			{#each route.markers as marker, i}
				{@const leg = calculation.legs[i - 1]}
				<tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/40">
					<!-- Name (editable) -->
					<td class="px-4 py-3">
						{#if editingName === marker.id}
							<input
								class="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
								value={marker.name}
								autofocus
								onblur={(e) => {
									app.updateMarkerName(marker.id, (e.target as HTMLInputElement).value);
									editingName = null;
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === 'Escape') {
										(e.target as HTMLInputElement).blur();
									}
								}}
							/>
						{:else}
							<span
								class="cursor-pointer font-medium text-slate-800 hover:text-green-600 dark:text-slate-200 dark:hover:text-green-400"
								role="button"
								tabindex="0"
								onclick={() => (editingName = marker.id)}
								onkeydown={(e) => e.key === 'Enter' && (editingName = marker.id)}
							>
								{#if i === 0}
									<span class="mr-1 text-xs font-bold text-green-600">▶</span>
								{:else if i === route.markers.length - 1}
									<span class="mr-1 text-xs font-bold text-red-500">■</span>
								{/if}
								{marker.name}
							</span>
						{/if}
					</td>

					<!-- Distance from start -->
					<td class="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
						{(marker.distanceFromStart / 1000).toFixed(1)} km
					</td>

					<!-- Elevation -->
					<td class="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
						{Math.round(marker.elevation)} m
					</td>

					<!-- Ascent for this leg -->
					<td class="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
						{#if leg}
							<span class="text-green-600 dark:text-green-400">↑ {Math.round(leg.ascentM)}</span>
						{:else}
							–
						{/if}
					</td>

					<!-- Descent for this leg -->
					<td class="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
						{#if leg}
							<span class="text-red-500 dark:text-red-400">↓ {Math.round(leg.descentM)}</span>
						{:else}
							–
						{/if}
					</td>

					<!-- Walking time for this leg -->
					<td class="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
						{#if leg}
							{formatDuration(leg.walkingMinutes)}
						{:else}
							–
						{/if}
					</td>

					<!-- Break (editable) -->
					<td class="px-4 py-3 text-right tabular-nums">
						{#if i === 0 || i === route.markers.length - 1}
							<span class="text-slate-300 dark:text-slate-600">–</span>
						{:else if editingBreak === marker.id}
							<input
								type="number"
								min="0"
								max="120"
								step="5"
								class="w-16 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
								value={marker.breakMinutes}
								autofocus
								onblur={(e) => {
									const val = parseInt((e.target as HTMLInputElement).value) || 0;
									app.updateMarkerBreak(marker.id, val);
									editingBreak = null;
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === 'Escape') {
										(e.target as HTMLInputElement).blur();
									}
								}}
							/>
						{:else}
							<button
								class="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-green-400"
								onclick={() => (editingBreak = marker.id)}
							>
								{marker.breakMinutes} Min.
							</button>
						{/if}
					</td>

					<!-- Arrival time -->
					{#if settings.departureTime}
						<td class="px-4 py-3 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">
							{arrivalTime(i) ?? '–'}
						</td>
					{/if}
				</tr>
			{/each}

			<!-- Totals row -->
			<tr class="border-t-2 border-slate-300 bg-slate-50 font-semibold dark:border-slate-600 dark:bg-slate-800">
				<td class="px-4 py-3 text-slate-700 dark:text-slate-200">{t('table.totalRow')}</td>
				<td class="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-200">
					{calculation.totalDistanceKm.toFixed(1)} km
				</td>
				<td class="px-4 py-3"></td>
				<td class="px-4 py-3 text-right tabular-nums text-green-600 dark:text-green-400">
					↑ {Math.round(calculation.totalAscentM)}
				</td>
				<td class="px-4 py-3 text-right tabular-nums text-red-500 dark:text-red-400">
					↓ {Math.round(calculation.totalDescentM)}
				</td>
				<td class="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-200">
					{formatDuration(calculation.totalWalkingMinutes)}
				</td>
				<td class="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-200">
					{formatDuration(calculation.totalBreakMinutes)}
				</td>
				{#if settings.departureTime}
					<td class="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-200">
						{arrivalTime(route.markers.length - 1) ?? '–'}
					</td>
				{/if}
			</tr>
		</tbody>
	</table>
</div>
