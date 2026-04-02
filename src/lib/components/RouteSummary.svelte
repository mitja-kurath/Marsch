<script lang="ts">
	import type { RouteCalculation } from '$lib/types';
	import { formatDuration } from '$lib/calculation';

	type Props = { calculation: RouteCalculation };
	let { calculation }: Props = $props();

	const stats = $derived([
		{ label: 'Distanz',   value: `${calculation.totalDistanceKm.toFixed(1)} km` },
		{ label: 'Aufstieg',  value: `${Math.round(calculation.totalAscentM)} Hm`,  up: true },
		{ label: 'Abstieg',   value: `${Math.round(calculation.totalDescentM)} Hm`,  down: true },
		{ label: 'Gehzeit',   value: formatDuration(calculation.totalWalkingMinutes) },
		{ label: 'Pausen',    value: formatDuration(calculation.totalBreakMinutes) },
		{ label: 'Gesamtzeit',value: formatDuration(calculation.totalMinutes), highlight: true },
	]);
</script>

<div class="summary">
	{#each stats as s}
		<div class="stat {s.highlight ? 'stat--highlight' : ''}">
			<span class="stat-label">{s.label}</span>
			<span class="stat-value">
				{#if s.up}↑ {/if}{#if s.down}↓ {/if}{s.value}
			</span>
		</div>
	{/each}
</div>

<style>
	.summary {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 2px solid var(--accent-light);
		border-radius: var(--radius);
		overflow: hidden;
	}

	@media (max-width: 480px) {
		.summary { grid-template-columns: repeat(2, 1fr); }
	}

	.stat {
		padding: 14px 16px;
		border-right: 1px solid var(--accent-light);
		border-bottom: 1px solid var(--accent-light);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.stat:nth-child(3n) { border-right: none; }

	@media (max-width: 480px) {
		.stat:nth-child(2n) { border-right: none; }
		.stat:nth-child(3n) { border-right: 1px solid var(--accent-light); }
		.stat:nth-child(3n):nth-child(2n) { border-right: none; }
	}

	.stat--highlight {
		background: var(--accent);
	}

	.stat-label {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	.stat--highlight .stat-label {
		color: rgba(255, 255, 255, 0.75);
	}

	.stat-value {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text);
	}

	.stat--highlight .stat-value {
		color: #fff;
	}
</style>
