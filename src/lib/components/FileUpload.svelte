<script lang="ts">
	import { t } from '$lib/i18n';
	import { parseFile } from '$lib/parsing';
	import { validateRegion, prepareForApi, assembleRoute } from '$lib/processing/pipeline';
	import { fetchElevationProfile } from '$lib/providers/swisstopo';
	import { app } from '$lib/stores/app.svelte';

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

			if (msg === 'no-route') {
				app.setError(t('upload.error.noRoute'));
			} else if (msg === 'too-few-points') {
				app.setError(t('upload.error.tooFewPoints'));
			} else if (msg === 'outside-switzerland') {
				app.setError(t('upload.error.outsideSwitzerland'));
			} else if (msg.startsWith('invalid-format:')) {
				const ext = msg.split(':')[1];
				app.setError(t('upload.error.invalidFormat', { ext }));
			} else if (msg.startsWith('no-markers')) {
				app.setError(t('upload.error.noMarkers'));
			} else if (msg.includes('Swisstopo') || msg.includes('Empty elevation')) {
				app.setError(t('error.elevationApi'));
			} else {
				app.setError(t('upload.error.parseError', { message: msg }));
			}
		}
	}

	function onDrop(e: DragEvent) {
		dragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) processFile(file);
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) processFile(file);
	}
</script>

<div
	role="button"
	tabindex="0"
	class="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-colors {dragging
		? 'border-green-500 bg-green-50 dark:bg-green-950/20'
		: 'border-slate-300 hover:border-green-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-green-500 dark:hover:bg-slate-800/50'}"
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	ondrop={(e) => {
		e.preventDefault();
		onDrop(e);
	}}
	onclick={() => fileInput.click()}
	onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
>
	<!-- Upload icon -->
	<svg
		class="h-14 w-14 {dragging ? 'text-green-500' : 'text-slate-400'}"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
		/>
	</svg>

	<div class="text-center">
		<p class="text-lg font-semibold text-slate-700 dark:text-slate-200">
			{t('upload.title')}
		</p>
		<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
			{t('upload.description')}
		</p>
	</div>

	<button
		class="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
		onclick={(e) => {
			e.stopPropagation();
			fileInput.click();
		}}
	>
		{t('upload.button')}
	</button>

	<p class="text-xs text-slate-400 dark:text-slate-500">{t('upload.supportedFormats')}</p>
</div>

<input
	bind:this={fileInput}
	type="file"
	accept=".kml,.gpx"
	class="hidden"
	onchange={onFileChange}
/>
