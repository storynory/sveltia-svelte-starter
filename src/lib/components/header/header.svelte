<div class="top">
	<div class="full topNav">
		<nav class="txt-right page -p">
			<a href="/">Home</a> /
			<a href="/posts/about-relaxivity">About / </a>
			<a href="/search/">Search / </a>
			<a href="/posts/podcast">Podcast</a>
		</nav>
	</div>

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

	.wave {
		position: absolute;
		inset: 0;
		z-index: 1;

		contain: paint;
		pointer-events: none;

		/* helps some browsers keep this on its own composited layer */
		transform: translateZ(0);

		--size: 50px;
		--b: 10px;
		--m: 0.5;
		--p: calc(var(--m) * var(--size));
		--R: calc(var(--size) * sqrt(var(--m) * var(--m) + 1) + var(--b) / 2);

		--_g: #0000 calc(99% - var(--b)), #000 calc(101% - var(--b)) 99%, #0000 101%;

		/* Safari/iOS */
		-webkit-mask:
			radial-gradient(var(--R) at left 50% bottom calc(-1 * var(--p)), var(--_g))
				calc(50% - 2 * var(--size)) calc(50% - var(--size) / 2 - var(--b) / 2) /
				calc(4 * var(--size)) calc(var(--size) + var(--b)),
			radial-gradient(var(--R) at left 50% top calc(-1 * var(--p)), var(--_g)) 50%
				calc(50% + var(--size) / 2 + var(--b) / 2) / calc(4 * var(--size))
				calc(var(--size) + var(--b));

		/* everyone else */
		mask:
			radial-gradient(var(--R) at left 50% bottom calc(-1 * var(--p)), var(--_g))
				calc(50% - 2 * var(--size)) calc(50% - var(--size) / 2 - var(--b) / 2) /
				calc(4 * var(--size)) calc(var(--size) + var(--b)),
			radial-gradient(var(--R) at left 50% top calc(-1 * var(--p)), var(--_g)) 50%
				calc(50% + var(--size) / 2 + var(--b) / 2) / calc(4 * var(--size))
				calc(var(--size) + var(--b));

		background: linear-gradient(90deg, rgba(230, 211, 163, 0.6), rgba(176, 224, 230, 0.6));
		background-repeat: no-repeat;
		background-size: 100% 100%;
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
</style>
