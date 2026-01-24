<script lang="ts">
	import Menu from '$lib/components/menu/sideMenu.svelte';
</script>

<header class="bg-light top full">
	<div class=" flex equal page">
		<div class="flex left">
			<Menu />
			<a href="/" class="brand-font -p-x site-title txt-prime">Relaxivity</a>
			<!-- Tier 2 -->
		</div>
		<nav class="flex right txt-light -p-x">
			<a href="/posts/about-relaxivity" class="txt-prime">
				<svg class="icon"><use href="/icons/sprite.svg#icon-info"></use></svg>
				About
			</a>
			<a href="/search/" class="txt-prime">
				<svg class="icon"><use href="/icons/sprite.svg#icon-search"></use></svg>
				Search
			</a>
		</nav>
	</div>
</header>

<style>
	/* we need a .flex-lg-screen that kicks in after mobile to put on top eleme */

	nav a {
		padding-left: 1em;
	}

	.icon {
		width: 1.2em;
		height: 1.2em;
		display: inline-block;
		vertical-align: -0.15em;
		fill: var(--prime);
	}
	.top {
		line-height: 1.5;
		font-size: 1rem;
		padding-top: 0.5em;
	}
</style>
