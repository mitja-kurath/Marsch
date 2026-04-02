<script lang="ts">
	import type { ProcessedRoute, RouteCalculation, Settings } from '$lib/types';
	import { formatDuration, addMinutes } from '$lib/calculation';
	import { app } from '$lib/stores/app.svelte';

	type Props = { route: ProcessedRoute; calculation: RouteCalculation; settings: Settings };
	let { route, calculation, settings }: Props = $props();

	let editingBreak: string | null = $state(null);
	let editingName: string | null = $state(null);

	function cumulativeMinutes(markerIdx: number): number {
		let mins = 0;
		for (let i = 0; i < markerIdx; i++) {
			if (i < calculation.legs.length) mins += calculation.legs[i].walkingMinutes;
			mins += route.markers[i].breakMinutes;
		}
		return mins;
	}
</script>

<div class="table-wrap">
	<table>
		<thead>
			<tr>
				<th class="col-name">Wegpunkt</th>
				<th class="col-num">Distanz</th>
				<th class="col-num">Höhe</th>
				<th class="col-num">↑</th>
				<th class="col-num">↓</th>
				<th class="col-num">Gehzeit</th>
				<th class="col-num">Pause</th>
				{#if settings.departureTime}
					<th class="col-num">Ankunft</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each route.markers as marker, i}
				{@const leg = calculation.legs[i - 1]}
				<tr>
					<td class="col-name">
						{#if editingName === marker.id}
							<input
								class="inline-input"
								value={marker.name}
								onblur={(e) => {
									app.updateMarkerName(marker.id, (e.target as HTMLInputElement).value);
									editingName = null;
								}}
								onkeydown={(e) => (e.key === 'Enter' || e.key === 'Escape') && (e.target as HTMLInputElement).blur()}
							/>
						{:else}
							<span
								class="name-cell"
								role="button"
								tabindex="0"
								onclick={() => (editingName = marker.id)}
								onkeydown={(e) => e.key === 'Enter' && (editingName = marker.id)}
							>
								{#if i === 0}<span class="badge badge--start">Start</span>{/if}
								{#if i === route.markers.length - 1}<span class="badge badge--end">Ziel</span>{/if}
								{marker.name}
							</span>
						{/if}
					</td>

					<td class="col-num">{(marker.distanceFromStart / 1000).toFixed(1)} km</td>
					<td class="col-num">{Math.round(marker.elevation)} m</td>
					<td class="col-num col-up">{leg ? `${Math.round(leg.ascentM)}` : '–'}</td>
					<td class="col-num col-dn">{leg ? `${Math.round(leg.descentM)}` : '–'}</td>
					<td class="col-num">{leg ? formatDuration(leg.walkingMinutes) : '–'}</td>

					<td class="col-num">
						{#if i === 0 || i === route.markers.length - 1}
							<span class="muted">–</span>
						{:else if editingBreak === marker.id}
							<input
								type="number"
								min="0" max="120" step="5"
								class="inline-input inline-input--num"
								value={marker.breakMinutes}
								onblur={(e) => {
									app.updateMarkerBreak(marker.id, parseInt((e.target as HTMLInputElement).value) || 0);
									editingBreak = null;
								}}
								onkeydown={(e) => (e.key === 'Enter' || e.key === 'Escape') && (e.target as HTMLInputElement).blur()}
							/>
						{:else}
							<button
								class="break-btn"
								onclick={() => (editingBreak = marker.id)}
							>{marker.breakMinutes} Min.</button>
						{/if}
					</td>

					{#if settings.departureTime}
						<td class="col-num col-time">
							{i === 0
								? settings.departureTime
								: addMinutes(settings.departureTime, cumulativeMinutes(i))}
						</td>
					{/if}
				</tr>
			{/each}

			<tr class="totals-row">
				<td class="col-name"><strong>Total</strong></td>
				<td class="col-num"><strong>{calculation.totalDistanceKm.toFixed(1)} km</strong></td>
				<td class="col-num">–</td>
				<td class="col-num col-up"><strong>{Math.round(calculation.totalAscentM)}</strong></td>
				<td class="col-num col-dn"><strong>{Math.round(calculation.totalDescentM)}</strong></td>
				<td class="col-num"><strong>{formatDuration(calculation.totalWalkingMinutes)}</strong></td>
				<td class="col-num"><strong>{formatDuration(calculation.totalBreakMinutes)}</strong></td>
				{#if settings.departureTime}
					<td class="col-num col-time">
						<strong>{addMinutes(settings.departureTime, calculation.totalMinutes)}</strong>
					</td>
				{/if}
			</tr>
		</tbody>
	</table>
</div>

<style>
	.table-wrap {
		overflow-x: auto;
		border: 2px solid var(--accent-light);
		border-radius: var(--radius);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	thead tr {
		background: var(--accent-bg);
		border-bottom: 2px solid var(--accent-light);
	}

	th {
		padding: 10px 12px;
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		white-space: nowrap;
	}

	td {
		padding: 9px 12px;
		border-bottom: 1px solid var(--accent-light);
		vertical-align: middle;
	}

	tbody tr:last-child td { border-bottom: none; }
	tbody tr:hover td { background: var(--accent-bg); }

	.totals-row td {
		border-top: 2px solid var(--accent-light);
		border-bottom: none;
		background: var(--accent-bg);
	}

	.col-name { text-align: left; min-width: 140px; }
	.col-num  { text-align: right; white-space: nowrap; }
	.col-up   { color: var(--accent-dark); }
	.col-dn   { color: #b04040; }
	.col-time { font-weight: 600; }

	.muted { color: var(--text-muted); }

	/* Badges */
	.badge {
		display: inline-block;
		font-size: 0.65rem;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 2px;
		margin-right: 5px;
		vertical-align: middle;
	}
	.badge--start { background: var(--accent-light); color: var(--accent-dark); }
	.badge--end   { background: #fdd; color: #a00; }

	/* Name cell */
	.name-cell {
		cursor: pointer;
		color: var(--text);
	}
	.name-cell:hover { color: var(--accent); }

	/* Inline editing */
	.inline-input {
		width: 100%;
		font-size: 0.875rem;
		padding: 3px 6px;
		border: 2px solid var(--accent);
		border-radius: var(--radius);
	}
	.inline-input--num {
		width: 72px;
		text-align: right;
	}

	/* Break button */
	.break-btn {
		background: none;
		border: 1px solid var(--accent-light);
		color: var(--text-muted);
		font-size: 0.8rem;
		padding: 2px 6px;
		cursor: pointer;
		border-radius: var(--radius);
	}
	.break-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-bg);
	}
</style>
