<script lang="ts">
	import type { Settings, SpeedPreset } from '$lib/types';
	import { SPEED_PRESETS } from '$lib/types';
	import { t } from '$lib/i18n';
	import { app } from '$lib/stores/app.svelte';

	let settings: Settings = $derived(app.settings);

	const presets: { value: SpeedPreset; label: string }[] = [
		{ value: 'slow', label: t('settings.speedSlow') },
		{ value: 'normal', label: t('settings.speedNormal') },
		{ value: 'fast', label: t('settings.speedFast') },
		{ value: 'custom', label: t('settings.speedCustom') }
	];

	function selectPreset(preset: SpeedPreset) {
		app.settings.speedPreset = preset;
		if (preset !== 'custom') {
			app.setSpeed(SPEED_PRESETS[preset]);
		}
	}
</script>

<div class="space-y-4">
	<!-- Speed presets -->
	<div>
		<p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.speed')}</p>
		<div class="flex flex-wrap gap-2">
			{#each presets as preset}
				<button
					class="rounded-lg border px-3 py-1.5 text-sm transition-colors {settings.speedPreset === preset.value
						? 'border-green-600 bg-green-600 text-white'
						: 'border-slate-300 text-slate-600 hover:border-green-400 dark:border-slate-600 dark:text-slate-300 dark:hover:border-green-500'}"
					onclick={() => selectPreset(preset.value)}
				>
					{preset.label}
				</button>
			{/each}
		</div>

		{#if settings.speedPreset === 'custom'}
			<div class="mt-2 flex items-center gap-2">
				<input
					type="number"
					min="1"
					max="10"
					step="0.5"
					class="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
					value={settings.speedKmh}
					oninput={(e) => {
						const v = parseFloat((e.target as HTMLInputElement).value);
						if (v > 0) app.setSpeed(v);
					}}
				/>
				<span class="text-sm text-slate-500">{t('settings.kmh')}</span>
			</div>
		{/if}
	</div>

	<!-- Default break -->
	<div>
		<label
			for="default-break"
			class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
		>
			{t('settings.defaultBreak')}
		</label>
		<div class="flex items-center gap-2">
			<input
				id="default-break"
				type="number"
				min="0"
				max="60"
				step="5"
				class="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
				value={settings.defaultBreakMinutes}
				oninput={(e) => {
					app.settings.defaultBreakMinutes = parseInt((e.target as HTMLInputElement).value) || 0;
					app.recalculate();
				}}
			/>
			<span class="text-sm text-slate-500">{t('settings.minutes')}</span>
		</div>
	</div>

	<!-- Departure time -->
	<div>
		<label
			for="departure-time"
			class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
		>
			{t('settings.departureTime')}
		</label>
		<input
			id="departure-time"
			type="time"
			class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
			value={settings.departureTime}
			oninput={(e) => {
				app.settings.departureTime = (e.target as HTMLInputElement).value;
			}}
		/>
	</div>
</div>
