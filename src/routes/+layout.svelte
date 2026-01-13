<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();

	const defaultColors = {
		prime: '#0D1B3F',
		accent: '#E6D3A3',
		second: '#f4e8d7',
		gray: '#f8f9fa',
		text: '#333333',
		light: 'ivory'
	};
	type ColorScheme = typeof defaultColors;

	let colors: ColorScheme = defaultColors;
	// let colors =  defaultColours;
	let prime = colors.prime; /* warm biscuit background */
	let accent = colors.accent;
	let second = colors.second; /*soft cream */
	let gray = colors.gray;
	let text = colors.text;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<header class="bg-prime header txt-center">
	<p class="site-title">Relaxivity</p>
	<span>Relax and Listen to stories</span>
</header>

<div
	class="-p-lg bg-prime"
	style="
  --prime:{prime};
  --accent:{accent};
  --second:{second};
  --text:{text};
  --font: Comfortaa;
  --gray:{gray};
  
  "
>
	{@render children()}
</div>

<style>
	@font-face {
		font-family: 'Comfortaa';
		src: url('/fonts/Comfortaa/Comfortaa-Medium.woff2') format('woff2');
		font-weight: 500;
		font-style: normal;
		font-display: swap;
	}

	.header {
		background: #0d1b3f;
		color: #4fb3a2;
		font-family: 'ariel, sans-serif';
	}
	.site-title {
		font-size: 2em;
		text-align: center;
		line-height: 1.4;
		margin: 0;
		padding: 0;
		font-family: 'Comfortaa', sans-serif;
	}

	:global {
		body {
			background-color: var(--prime);
		}
		.bg-prime {
			background-color: var(--prime);
		}
		.bg-accent {
			background-color: var(--accent);
		}

		.bg-white,
		.bg-light {
			background-color: var(--second);
		}

		.txt-prime {
			color: var(--prime);
		}

		.txt-accent {
			color: var(--accent);
		}
		p,
		.txt-white,
		txt-light {
			color: var(--accent);
		}

		body {
			color: var(--text);
		}

		a,
		a:hover {
			color: var(--accent);
		}

		.brd-tp {
			border-top: 1px solid var(--accent);
		}

		.brd-bottom {
			border-bottom: 1px solid var(--accent);
		}

		.card {
			border: 1px solid var(--accent);
		}
	}

	.panel {
		background-image: radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px);
		background-size: 3px 3px;
		background-color: var(--second);
		border-radius: 12px;
		padding: 1.5rem;
	}
</style>
