<!-- src/lib/components/SideMenu.svelte -->
<script lang="ts">
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

<aside id="side-menu" class:open aria-label="Site menu">
	<nav class="menu-nav" aria-label="Main">
		<a href="/" onclick={close}>Home</a>
		<a href="/posts/about-relaxivity" onclick={close}>About</a>
		<a href="/search/" onclick={close}>Search</a>
		<a href="/posts/podcast" onclick={close}>Podcast</a>
	</nav>
</aside>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(0, 0, 0, 0.35);
	}

	aside {
		position: fixed;
		top: 0;
		left: 0;
		height: 100dvh;
		width: min(340px, 86vw);
		z-index: 45;
		background: rgba(255, 255, 255, 0.92);
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

	.close:hover {
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
		color: inherit;
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
		position: fixed;
		top: 2px;
		left: 16px;
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
		background: currentColor;
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
		background: blue;
	}

	.burger.open .burger-lines::after {
		top: 0;
		transform: rotate(-45deg);
		background: blue;
	}
</style>
