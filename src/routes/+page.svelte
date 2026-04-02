<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { app } from '$lib/stores/app.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import RouteMap from '$lib/components/RouteMap.svelte';
	import ElevationChart from '$lib/components/ElevationChart.svelte';
	import RouteTable from '$lib/components/RouteTable.svelte';
	import RouteSummary from '$lib/components/RouteSummary.svelte';
	import SpeedSettings from '$lib/components/SpeedSettings.svelte';

	onMount(() => {
		app.hydrate();
	});

	let settingsOpen = $state(false);

	function handlePrint() {
		app.persist();
		window.open('/print', '_blank');
	}
</script>

<svelte:head>
	<title>{t('app.title')} — {t('app.subtitle')}</title>
</svelte:head>

<!-- ─── Header ─────────────────────────────────────────────────────────────── -->
<header class="border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
	<div class="mx-auto flex max-w-7xl items-center justify-between">
		<div class="flex items-center gap-3">
			<svg class="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M3 17l4-8 4 4 4-6 4 8" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
					d="M3 21h18" />
			</svg>
			<div>
				<h1 class="text-lg font-bold leading-none text-slate-900 dark:text-slate-100">
					{t('app.title')}
				</h1>
				<p class="text-xs text-slate-500 dark:text-slate-400">{t('app.subtitle')}</p>
			</div>
		</div>

		{#if app.status.type === 'ready'}
			<div class="flex items-center gap-2">
				<button
					class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
					onclick={() => (settingsOpen = !settingsOpen)}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{t('settings.title')}
				</button>
				<button
					class="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
					onclick={handlePrint}
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
					</svg>
					{t('actions.print')}
				</button>
				<button
					class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
					onclick={() => app.reset()}
				>
					{t('actions.reset')}
				</button>
			</div>
		{/if}
	</div>
</header>

<!-- ─── Settings panel (slide-down) ────────────────────────────────────────── -->
{#if settingsOpen && app.status.type === 'ready'}
	<div class="border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60">
		<div class="mx-auto max-w-7xl">
			<SpeedSettings />
		</div>
	</div>
{/if}

<!-- ─── Main content ────────────────────────────────────────────────────────── -->
<main class="mx-auto max-w-7xl px-4 py-6">

	<!-- IDLE: upload form -->
	{#if app.status.type === 'idle'}
		<div class="mx-auto max-w-2xl pt-8">
			<FileUpload />
		</div>

	<!-- LOADING -->
	{:else if app.status.type === 'loading'}
		<div class="flex min-h-64 flex-col items-center justify-center gap-4 pt-8">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-600"
			></div>
			<p class="text-slate-600 dark:text-slate-300">{app.status.message}</p>
		</div>

	<!-- ERROR -->
	{:else if app.status.type === 'error'}
		<div class="mx-auto max-w-xl pt-8">
			<div class="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
				<div class="flex items-start gap-3">
					<svg class="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p class="font-medium text-red-800 dark:text-red-300">{app.status.message}</p>
					</div>
				</div>
				<div class="mt-4 flex gap-2">
					<button
						class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
						onclick={() => app.reset()}
					>
						{t('error.retry')}
					</button>
				</div>
			</div>
		</div>

	<!-- READY: full results view -->
	{:else if app.status.type === 'ready' && app.route && app.calculation}
		{@const route = app.route}
		{@const calculation = app.calculation}
		{@const settings = app.settings}

		<div class="space-y-6">
			<!-- Route name -->
			<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">{route.name}</h2>

			<!-- Summary cards -->
			<RouteSummary {calculation} />

			<!-- Map + elevation chart -->
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700" style="height: 420px">
					<RouteMap {route} />
				</div>
				<div class="flex flex-col gap-1 rounded-xl border border-slate-200 p-4 dark:border-slate-700" style="height: 420px">
					<p class="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('chart.title')}</p>
					<div class="flex-1">
						<ElevationChart {route} />
					</div>
				</div>
			</div>

			<!-- Table -->
			<div>
				<p class="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{t('table.title')}</p>
				<RouteTable {route} {calculation} {settings} />
			</div>
		</div>
	{/if}
</main>
