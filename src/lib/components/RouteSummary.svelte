<script lang="ts">
	import type { RouteCalculation } from '$lib/types';
	import { t } from '$lib/i18n';
	import { formatDuration } from '$lib/calculation';

	type Props = {
		calculation: RouteCalculation;
	};

	let { calculation }: Props = $props();

	const stats = $derived([
		{
			label: t('summary.totalDistance'),
			value: calculation.totalDistanceKm.toFixed(1),
			unit: t('units.km')
		},
		{
			label: t('summary.totalAscent'),
			value: Math.round(calculation.totalAscentM).toString(),
			unit: t('units.hm')
		},
		{
			label: t('summary.totalDescent'),
			value: Math.round(calculation.totalDescentM).toString(),
			unit: t('units.hm')
		},
		{
			label: t('summary.walkingTime'),
			value: formatDuration(calculation.totalWalkingMinutes),
			unit: ''
		},
		{
			label: t('summary.breakTime'),
			value: formatDuration(calculation.totalBreakMinutes),
			unit: ''
		},
		{
			label: t('summary.totalTime'),
			value: formatDuration(calculation.totalMinutes),
			unit: '',
			highlight: true
		}
	]);
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
	{#each stats as stat}
		<div
			class="rounded-xl p-4 {stat.highlight
				? 'bg-green-600 text-white'
				: 'bg-slate-100 dark:bg-slate-800'}"
		>
			<p class="text-xs font-medium {stat.highlight ? 'text-green-100' : 'text-slate-500 dark:text-slate-400'}">
				{stat.label}
			</p>
			<p class="mt-1 text-xl font-bold {stat.highlight ? 'text-white' : 'text-slate-800 dark:text-slate-100'}">
				{stat.value}
				{#if stat.unit}
					<span class="text-sm font-normal">{stat.unit}</span>
				{/if}
			</p>
		</div>
	{/each}
</div>
