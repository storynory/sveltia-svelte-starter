<!-- src/lib/components/SideMenu.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { ColorScheme } from '$lib/content/types.generated';
	let { links = [] } = $props<{
		links?: { href: string; label: string }[];
	}>();

	let open = $state(false);

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	$effect(() => {
		if (!open) return;

		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') close();
		}

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	const sideColors = getContext('colors') as ColorScheme;
</script>

<button
	class="burger"
	class:open
	type="button"
	aria-label="Open menu"
	aria-expanded={open}
	aria-controls="side-menu"
	onclick={toggle}
>
	<span class="burger-lines" aria-hidden="true"></span>
</button>

{#if open}
	<div class="overlay" onclick={close} aria-hidden="true"></div>
{/if}

<aside
	id="side-menu"
	class:open
	aria-label="Site menu"
	class="bg-light"
	style="--prime: {sideColors.prime}"
>
	<nav class="menu-nav" aria-label="Main txt-prime">
		<a href="/">
			<svg class="icon"><use href="/icons/sprite.svg#icon-home"></use></svg>
			Home
		</a>
		<a href="/posts/about-relaxivity">
			<svg class="icon"><use href="/icons/sprite.svg#icon-info"></use></svg>
			About
		</a>
		<a href="/search/">
			<svg class="icon"><use href="/icons/sprite.svg#icon-search"></use></svg>
			Search
		</a>
		<a href="/posts/podcast">
			<svg class="icon"><use href="/icons/sprite.svg#icon-podcast"></use></svg>
			Podcast
		</a>
	</nav>
</aside>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(0, 0, 0, 0.35);
	}

	.icon {
		width: 1.2em;
		height: 1.2em;
		display: inline-block;
		vertical-align: -0.15em;
		fill: currentColor;
	}

	aside {
		position: fixed;
		top: 0;
		left: 0;
		height: 100dvh;
		width: min(340px, 86vw);
		z-index: 45;
		backdrop-filter: blur(14px);
		box-shadow: 24px 0 60px rgba(0, 0, 0, 0.18);
		transform: translateX(-105%);
		transition: transform 180ms ease;
		display: flex;
		flex-direction: column;
		padding: 3em 1em;
		pointer-events: none; /* important */
	}

	aside.open {
		transform: translateX(0);
		pointer-events: auto; /* important */
	}

	.menu-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 10px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.menu-title {
		font-weight: 600;
	}

	.close {
		border: 0;
		background: transparent;
		cursor: pointer;
		font-size: 18px;
		padding: 8px 10px;
		border-radius: 10px;
	}

	button:hover {
		background: rgba(0, 0, 0, 0.06);
	}

	.menu-nav {
		display: grid;
		gap: 10px;
		padding-top: 14px;
	}

	.menu-nav a {
		text-decoration: none;
		padding: 10px 12px;
		border-radius: 12px;
	}

	.menu-nav a:hover {
		background: rgba(0, 0, 0, 0.06);
	}

	@media (prefers-reduced-motion: reduce) {
		aside {
			transition: none;
		}
	}

	/**************** BURGER AND TRANSFORM INTO X ***************/

	.burger {
		top: -4px;
		z-index: 50;
		width: 32px;
		height: 32px;
		border: 0;
		border-radius: 12px;
		/*
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(10px); */
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		cursor: pointer;
		position: relative;
		display: grid;
		place-items: center;
	}

	.burger-lines,
	.burger-lines::before,
	.burger-lines::after {
		content: '';
		display: block;
		width: 20px;
		height: 2px;
		background: var(--prime);
		border-radius: 2px;
		position: relative;
		transition:
			transform 160ms ease,
			background-color 120ms ease,
			top 160ms ease;
	}

	.burger-lines::before,
	.burger-lines::after {
		position: absolute;
		left: 0;
	}

	.burger-lines::before {
		top: -6px;
	}

	.burger-lines::after {
		top: 6px;
	}

	/* OPEN: turn middle line transparent, move others to centre + rotate */
	.burger.open .burger-lines {
		background: transparent;
	}

	.burger.open .burger-lines::before {
		top: 0;
		transform: rotate(45deg);
		background: var(--prime);
	}

	.burger.open .burger-lines::after {
		top: 0;
		transform: rotate(-45deg);
		background: var(--prime);
	}
</style>
