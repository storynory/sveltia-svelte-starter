<div>
	<nav class="top -p-r">
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
	<header class="bg-prime header">
		<div class="wave"></div>

		<div class="site-title txt-center">
			<a class="title txt-accent" href="/">Relaxivity</a>
			<p class="txt-accent">Relax and listen to stories</p>
		</div>
	</header>
</div>

<style>
	.topNav {
		width: 100%;
		background-color: ivory;
		overflow: hidden;
		position: relative;
	}
	.fixed {
		position: fixed;
		width: 100%;
		z-index: 100;
	}

	.header {
		position: relative;
		height: 160px;
		border-bottom: 2px solid var(--accent);
		overflow: hidden;
	}

	.site-title {
		position: relative;
		z-index: 2;

		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		pointer-events: auto;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
		background-color: rgba(13, 27, 63, 0.7);
		padding: 1em;
	}

	header .title {
		font-size: 2.2rem;
		line-height: 1.2;
		margin: 0;
		text-decoration: none;
	}

	.site-title p {
		margin: 0.4em 0 0;
		font-size: 1rem;
		opacity: 1;
	}

	.icon {
		width: 1.2em;
		height: 1.2em;
		display: inline-block;
		vertical-align: -0.15em;
		fill: currentColor;
	}
	.top {
		font-size: 1rem;
		text-align: right;
		padding-right: 0.5em;
	}

	.top a {
		padding: 0.5em 0.5em 0.5em 0;
		display: inline-block;
	}
</style>
