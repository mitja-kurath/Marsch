<script lang="ts">
	import type { SpeedPreset } from '$lib/types';
	import { SPEED_PRESETS } from '$lib/types';
	import { app } from '$lib/stores/app.svelte';

	let settings = $derived(app.settings);

	const presets: { value: SpeedPreset; label: string }[] = [
		{ value: 'slow',   label: 'Langsam (3 km/h)' },
		{ value: 'normal', label: 'Normal (4 km/h)'  },
		{ value: 'fast',   label: 'Schnell (5 km/h)' },
		{ value: 'custom', label: 'Eigenes Tempo'     },
	];

	function selectPreset(p: SpeedPreset) {
		app.settings.speedPreset = p;
		if (p !== 'custom') app.setSpeed(SPEED_PRESETS[p]);
	}
</script>

<div class="settings-grid">
	<fieldset class="field-group">
		<legend>Wandertempo</legend>
		<div class="pill-row">
			{#each presets as p}
				<button
					class="pill-btn {settings.speedPreset === p.value ? 'active' : ''}"
					onclick={() => selectPreset(p.value)}
				>{p.label}</button>
			{/each}
		</div>
		{#if settings.speedPreset === 'custom'}
			<div class="inline-row">
				<input
					type="number" min="1" max="10" step="0.5"
					value={settings.speedKmh}
					oninput={(e) => {
						const v = parseFloat((e.target as HTMLInputElement).value);
						if (v > 0) app.setSpeed(v);
					}}
				/>
				<span class="unit">km/h</span>
			</div>
		{/if}
	</fieldset>

	<fieldset class="field-group">
		<legend>Standard-Pause je Wegpunkt</legend>
		<div class="inline-row">
			<input
				id="default-break"
				type="number" min="0" max="60" step="5"
				value={settings.defaultBreakMinutes}
				oninput={(e) => {
					app.settings.defaultBreakMinutes = parseInt((e.target as HTMLInputElement).value) || 0;
					app.recalculate();
				}}
			/>
			<span class="unit">Min.</span>
		</div>
	</fieldset>

	<fieldset class="field-group">
		<legend>Abfahrtszeit <span class="optional">(optional)</span></legend>
		<input
			id="departure-time"
			type="time"
			value={settings.departureTime}
			oninput={(e) => { app.settings.departureTime = (e.target as HTMLInputElement).value; }}
		/>
	</fieldset>
</div>

<style>
	.settings-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20px 32px;
	}

	.field-group {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	legend {
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin-bottom: 4px;
	}

	.optional {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--text-muted);
	}

	.pill-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.pill-btn {
		font-size: 0.82rem;
		padding: 0.3rem 0.7rem;
		background: transparent;
		color: var(--accent);
		border: 2px solid var(--accent-light);
		font-weight: 600;
	}

	.pill-btn:hover {
		border-color: var(--accent);
		background: var(--accent-bg);
		color: var(--accent-dark);
	}

	.pill-btn.active {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	.pill-btn.active:hover {
		background: var(--accent-dark);
		border-color: var(--accent-dark);
	}

	.inline-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	input[type='number'],
	input[type='time'] {
		width: 90px;
	}

	.unit {
		font-size: 0.875rem;
		color: var(--text-muted);
	}
</style>
