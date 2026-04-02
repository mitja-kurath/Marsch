<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProcessedRoute, RouteCalculation, Settings } from '$lib/types';
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
			import('$lib/calculation').then(({ calculate }) => {
				if (route && settings) calculation = calculate(route, settings);
			});
		} catch {
			loadError = true;
		}
	});

	function cumulativeMinutes(idx: number): number {
		if (!calculation || !route) return 0;
		let m = 0;
		for (let i = 0; i < idx; i++) {
			if (i < calculation.legs.length) m += calculation.legs[i].walkingMinutes;
			m += route.markers[i].breakMinutes;
		}
		return m;
	}

	const today = new Date().toLocaleDateString('de-CH', {
		day: '2-digit', month: '2-digit', year: 'numeric'
	});
</script>

<svelte:head>
	<title>Marschzeittabelle</title>
</svelte:head>

<div class="print-page">
	{#if loadError}
		<p style="color:#c0392b">Keine Route gefunden. Bitte kehre zur App zurück.</p>
	{:else if !route || !calculation || !settings}
		<p style="color:#666">Wird geladen…</p>
	{:else}
		<header>
			<div>
				<h1>Marschzeittabelle</h1>
				<p class="route-name">{route.name}</p>
			</div>
			<div class="meta">
				<span>{today}</span>
				{#if settings.departureTime}<span>Abfahrt: {settings.departureTime}</span>{/if}
				<span>Tempo: {settings.speedKmh} km/h</span>
			</div>
		</header>

		<div class="summary">
			{#each [
				{ l: 'Distanz',    v: `${calculation.totalDistanceKm.toFixed(1)} km` },
				{ l: 'Aufstieg',   v: `↑ ${Math.round(calculation.totalAscentM)} Hm` },
				{ l: 'Abstieg',    v: `↓ ${Math.round(calculation.totalDescentM)} Hm` },
				{ l: 'Gehzeit',    v: formatDuration(calculation.totalWalkingMinutes) },
				{ l: 'Pausen',     v: formatDuration(calculation.totalBreakMinutes) },
				{ l: 'Gesamtzeit', v: formatDuration(calculation.totalMinutes) },
			] as s}
				<div class="stat">
					<span class="stat-l">{s.l}</span>
					<span class="stat-v">{s.v}</span>
				</div>
			{/each}
		</div>

		<table>
			<thead>
				<tr>
					<th>Wegpunkt</th>
					<th>Distanz</th>
					<th>Höhe</th>
					<th>↑ Hm</th>
					<th>↓ Hm</th>
					<th>Gehzeit</th>
					<th>Pause</th>
					{#if settings.departureTime}<th>Ankunft</th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each route.markers as marker, i}
					{@const leg = calculation.legs[i - 1]}
					<tr>
						<td>{marker.name}</td>
						<td>{(marker.distanceFromStart / 1000).toFixed(1)} km</td>
						<td>{Math.round(marker.elevation)} m</td>
						<td>{leg ? Math.round(leg.ascentM)  : '–'}</td>
						<td>{leg ? Math.round(leg.descentM) : '–'}</td>
						<td>{leg ? formatDuration(leg.walkingMinutes) : '–'}</td>
						<td>{(i > 0 && i < route.markers.length - 1) ? `${marker.breakMinutes} Min.` : '–'}</td>
						{#if settings.departureTime}
							<td>{i === 0 ? settings.departureTime : addMinutes(settings.departureTime, cumulativeMinutes(i))}</td>
						{/if}
					</tr>
				{/each}
				<tr class="total">
					<td><strong>Total</strong></td>
					<td>{calculation.totalDistanceKm.toFixed(1)} km</td>
					<td>–</td>
					<td>↑ {Math.round(calculation.totalAscentM)}</td>
					<td>↓ {Math.round(calculation.totalDescentM)}</td>
					<td>{formatDuration(calculation.totalWalkingMinutes)}</td>
					<td>{formatDuration(calculation.totalBreakMinutes)}</td>
					{#if settings.departureTime}
						<td>{addMinutes(settings.departureTime, calculation.totalMinutes)}</td>
					{/if}
				</tr>
			</tbody>
		</table>

		<div class="notes">
			<p class="notes-label">Bemerkungen</p>
			<div class="notes-box"></div>
		</div>

		<div class="print-btn noprint">
			<button onclick={() => window.print()}>Drucken / Als PDF speichern</button>
		</div>
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

	.print-page {
		max-width: 820px;
		margin: 0 auto;
		padding: 24px 16px;
		font-family: 'Inter', sans-serif;
		color: #222;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 2px solid #224c00;
		padding-bottom: 14px;
		margin-bottom: 20px;
		gap: 16px;
		flex-wrap: wrap;
	}

	h1 {
		font-size: 1.6rem;
		font-weight: 900;
		color: #224c00;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.route-name {
		font-size: 1rem;
		font-weight: 600;
		color: #3e7213;
		margin: 2px 0 0;
	}

	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
		font-size: 0.8rem;
		color: #666;
	}

	/* Summary */
	.summary {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		border: 2px solid #bae397;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 20px;
	}

	@media (max-width: 540px) {
		.summary { grid-template-columns: repeat(3, 1fr); }
	}

	.stat {
		padding: 10px 12px;
		border-right: 1px solid #bae397;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.stat:last-child { border-right: none; }

	.stat-l { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
	.stat-v { font-size: 1rem; font-weight: 700; color: #222; }

	/* Table */
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
		margin-bottom: 24px;
	}

	th {
		text-align: right;
		padding: 8px 10px;
		font-weight: 700;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #666;
		border-bottom: 2px solid #224c00;
		background: #f0f8e8;
	}

	th:first-child { text-align: left; }

	td {
		text-align: right;
		padding: 7px 10px;
		border-bottom: 1px solid #bae397;
	}

	td:first-child { text-align: left; }

	tr:nth-child(even) td { background: #f9fdf5; }

	.total td {
		font-weight: 700;
		border-top: 2px solid #224c00;
		border-bottom: none;
		background: #f0f8e8;
	}

	/* Notes */
	.notes { margin-bottom: 24px; }
	.notes-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-bottom: 6px; }
	.notes-box { height: 80px; border: 2px solid #bae397; border-radius: 4px; }

	/* Print button */
	.print-btn { display: flex; justify-content: flex-end; }

	@media print {
		.noprint { display: none !important; }
		.print-page { padding: 0; }
	}
</style>
