<script>
	let colors = $props();
</script>

<style>
	:root {
		--prime: #00634e;
		--accent: #6666ff;
		--light: ivory;
		--gray-light: #f8f9fa;
	}

	:global(body) {
		body {
			color: #333;
		}

		.bg-prime {
			background-color: var(--prime);
		}

		.clr-accent {
			color: var(--accent);
		}

		.text-light,
		.txt-white {
			color: var(--light);
		}

		.bg-gray {
			background-color: var(--gray-light);
		}

		.bg-light,
		.bg-white {
			background-color: var(--light);
		}

		.brd-tp {
			border-top: 1px solid var(--frog-dark);
		}

		.bx-shadow {
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
		}

		h1,
		h2,
		h3,
		h4,
		h1,
		a h1,
		a h2,
		a h3,
		a h4 {
			color: #333;
		}

		a {
			color: var(--prime);
		}

		a:hover {
			color: var(--accent);
		}
	}
</style>
