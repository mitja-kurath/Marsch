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

	onMount(() => app.hydrate());

	let settingsOpen = $state(false);

	function handlePrint() {
		app.persist();
		window.open('/print', '_blank');
	}
</script>

<svelte:head>
	<title>Marsch — Wanderzeit-Planer</title>
</svelte:head>

<div class="page">

	<header class="site-header">
		<a href="/" class="wordmark" onclick={() => app.reset()}>Marsch</a>

		{#if app.status.type === 'ready'}
			<nav class="header-actions">
				<button class="ghost" onclick={() => (settingsOpen = !settingsOpen)}>
					Einstellungen
				</button>
				<button class="ghost" onclick={handlePrint}>Drucken</button>
				<button class="ghost" onclick={() => app.reset()}>Neue Route</button>
			</nav>
		{/if}
	</header>

	{#if settingsOpen && app.status.type === 'ready'}
		<div class="settings-panel">
			<SpeedSettings />
		</div>
	{/if}

	<main>

		{#if app.status.type === 'idle'}
			<section class="hero">
				<h1 class="hero-title">Marsch.</h1>
				<p class="hero-lead">Wandern, einfach geplant.</p>
				<p class="hero-sub">
					Lade deine Route hoch — Marsch berechnet automatisch Zeiten,
					Aufstieg, Abstieg und erstellt eine Marschzeittabelle.
				</p>
			</section>

			<ol class="steps">
				<li>
					<strong>1. Planen</strong>
					Route auf <a href="https://map.geo.admin.ch" target="_blank" rel="noopener">Swisstopo</a>
					einzeichnen und Wegpunkte benennen — das kannst du bereits.
				</li>
				<li>
					<strong>2. Exportieren</strong>
					Route als <em>KML-Datei</em> (Swisstopo) oder <em>GPX-Datei</em>
					(Komoot, Strava, AllTrails) exportieren.
				</li>
				<li>
					<strong>3. Hochladen</strong>
					Datei hier hochladen. Marsch berechnet Geschwindigkeit,
					Auf- und Abstieg, Pausen und Ankunftszeiten.
				</li>
			</ol>

			<div class="upload-section">
				<FileUpload />
			</div>

		{:else if app.status.type === 'loading'}
			<div class="state-center">
				<div class="spinner"></div>
				<p class="state-msg">{app.status.message}</p>
			</div>

		{:else if app.status.type === 'error'}
			<div class="state-center">
				<div class="error-box">
					<p class="error-msg">{app.status.message}</p>
					<button onclick={() => app.reset()}>Erneut versuchen</button>
				</div>
			</div>

		{:else if app.status.type === 'ready' && app.route && app.calculation}
			{@const route = app.route}
			{@const calculation = app.calculation}
			{@const settings = app.settings}

			<div class="results">
				<h2 class="route-name">{route.name}</h2>

				<RouteSummary {calculation} />

				<div class="viz-grid">
					<div class="map-wrap">
						<RouteMap {route} />
					</div>
					<div class="chart-wrap">
						<p class="section-label">Höhenprofil</p>
						<ElevationChart {route} />
					</div>
				</div>

				<p class="section-label">Wegpunkte</p>
				<RouteTable {route} {calculation} {settings} />
			</div>
		{/if}

	</main>

	<footer class="site-footer">
		<span>marsch.mitjakurath.ch</span>
		<a href="https://github.com/mitja-kurath/Marsch" target="_blank" rel="noopener">GitHub</a>
	</footer>

</div>

<style>
	/* ─── Header ────────────────────────────────────────────────────────────── */
	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 0 14px;
		border-bottom: 2px solid var(--accent-light);
		margin-bottom: 0;
	}

	.wordmark {
		font-weight: 900;
		font-size: 1.25rem;
		color: var(--accent-dark);
		text-decoration: none;
		letter-spacing: -0.02em;
	}

	.wordmark:hover {
		color: var(--accent);
	}

	.header-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.header-actions button {
		font-size: 0.875rem;
		padding: 0.3rem 0.7rem;
	}

	/* ─── Settings panel ────────────────────────────────────────────────────── */
	.settings-panel {
		border-bottom: 2px solid var(--accent-light);
		background: var(--accent-bg);
		padding: 20px 0;
		margin-bottom: 0;
	}

	/* ─── Hero ──────────────────────────────────────────────────────────────── */
	.hero {
		padding: 52px 0 32px;
		text-align: center;
	}

	.hero-title {
		font-size: clamp(3rem, 10vw, 5.5rem);
		font-style: italic;
		color: var(--accent-dark);
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.hero-lead {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--accent-dark);
		margin: 10px 0 6px;
	}

	.hero-sub {
		font-size: 0.95rem;
		color: var(--text-muted);
		max-width: 480px;
		margin: 0 auto;
		line-height: 1.55;
	}

	/* ─── Steps ─────────────────────────────────────────────────────────────── */
	.steps {
		list-style: none;
		padding: 0;
		margin: 36px 0;
		display: flex;
		flex-direction: column;
		gap: 0;
		border: 2px solid var(--accent-light);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.steps li {
		padding: 14px 18px;
		font-size: 0.92rem;
		line-height: 1.5;
		border-bottom: 1px solid var(--accent-light);
		color: var(--text-muted);
	}

	.steps li:last-child {
		border-bottom: none;
	}

	.steps li strong {
		display: block;
		font-weight: 700;
		color: var(--text);
		margin-bottom: 2px;
	}

	/* ─── Upload section ────────────────────────────────────────────────────── */
	.upload-section {
		margin-bottom: 52px;
	}

	/* ─── States ────────────────────────────────────────────────────────────── */
	.state-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 260px;
		gap: 16px;
	}

	.spinner {
		width: 36px;
		height: 36px;
		border: 3px solid var(--accent-light);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.state-msg {
		font-size: 0.95rem;
		color: var(--text-muted);
	}

	.error-box {
		border: 2px solid #c0392b;
		border-radius: var(--radius);
		padding: 20px 24px;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.error-msg {
		color: #c0392b;
		font-size: 0.95rem;
		margin: 0;
		line-height: 1.5;
	}

	.error-box button {
		background: #c0392b;
		border-color: #c0392b;
		align-self: flex-start;
	}

	.error-box button:hover {
		background: #96281b;
		border-color: #96281b;
	}

	/* ─── Results ───────────────────────────────────────────────────────────── */
	.results {
		padding: 28px 0 52px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.route-name {
		font-size: 1.6rem;
		letter-spacing: -0.02em;
	}

	.viz-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	@media (max-width: 600px) {
		.viz-grid {
			grid-template-columns: 1fr;
		}
	}

	.map-wrap {
		height: 380px;
		border: 2px solid var(--accent-light);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.chart-wrap {
		height: 380px;
		border: 2px solid var(--accent-light);
		border-radius: var(--radius);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chart-wrap > :last-child {
		flex: 1;
	}

	.section-label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin: 0;
	}

	/* ─── Footer ────────────────────────────────────────────────────────────── */
	.site-footer {
		border-top: 2px solid var(--accent-light);
		padding: 14px 0;
		display: flex;
		gap: 16px;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
</style>
