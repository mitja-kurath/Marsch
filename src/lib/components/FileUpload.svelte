<script lang="ts">
	import { parseFile } from '$lib/parsing';
	import { validateRegion, prepareForApi, assembleRoute } from '$lib/processing/pipeline';
	import { fetchElevationProfile } from '$lib/providers/swisstopo';
	import { app } from '$lib/stores/app.svelte';
	import { t } from '$lib/i18n';

	let dragging = $state(false);
	let fileInput: HTMLInputElement;

	async function processFile(file: File) {
		try {
			app.setLoading(t('loading.parsing'));
			const parsed = await parseFile(file);

			validateRegion(parsed.points);

			app.setLoading(t('loading.elevation'));
			const apiPoints = prepareForApi(parsed.points);
			const profile = await fetchElevationProfile(apiPoints);

			app.setLoading(t('loading.calculating'));
			const route = assembleRoute(parsed, apiPoints, profile, app.settings.defaultBreakMinutes);

			app.setReady(route);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg === 'no-route') app.setError(t('upload.error.noRoute'));
			else if (msg === 'too-few-points') app.setError(t('upload.error.tooFewPoints'));
			else if (msg === 'outside-switzerland') app.setError(t('upload.error.outsideSwitzerland'));
			else if (msg.startsWith('invalid-format:'))
				app.setError(t('upload.error.invalidFormat', { ext: msg.split(':')[1] }));
			else if (msg.includes('Swisstopo') || msg.includes('Empty elevation'))
				app.setError(t('error.elevationApi'));
			else app.setError(t('upload.error.parseError', { message: msg }));
		}
	}

	function onDrop(e: DragEvent) {
		dragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) processFile(file);
	}

	function onFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) processFile(file);
	}
</script>

<div
	class="drop-zone {dragging ? 'dragging' : ''}"
	role="button"
	tabindex="0"
	ondragover={(e) => { e.preventDefault(); dragging = true; }}
	ondragleave={() => (dragging = false)}
	ondrop={(e) => { e.preventDefault(); onDrop(e); }}
	onclick={() => fileInput.click()}
	onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
>
	<svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
			d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
	</svg>

	<p class="drop-label">Route hochladen</p>
	<p class="drop-hint">KML- oder GPX-Datei hier ablegen</p>

	<button
		onclick={(e) => { e.stopPropagation(); fileInput.click(); }}
	>
		Datei auswählen
	</button>

	<p class="format-note">KML (Swisstopo) · GPX (Komoot, Strava, AllTrails)</p>
</div>

<input
	bind:this={fileInput}
	type="file"
	accept=".kml,.gpx"
	style="display:none"
	onchange={onFileChange}
/>

<style>
	.drop-zone {
		border: 2px dashed var(--accent-light);
		border-radius: var(--radius);
		padding: 40px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		transition: border-color 120ms, background 120ms;
		text-align: center;
	}

	.drop-zone:hover,
	.drop-zone:focus-visible {
		border-color: var(--accent);
		background: var(--accent-bg);
		outline: none;
	}

	.drop-zone.dragging {
		border-color: var(--accent);
		border-style: solid;
		background: var(--accent-bg);
	}

	.upload-icon {
		width: 40px;
		height: 40px;
		color: var(--accent);
		opacity: 0.7;
	}

	.drop-label {
		font-weight: 700;
		font-size: 1rem;
		color: var(--text);
		margin: 0;
	}

	.drop-hint {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
	}

	.format-note {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0;
	}
</style>
