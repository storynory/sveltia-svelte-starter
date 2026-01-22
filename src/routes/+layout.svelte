<script lang="ts">
	import '../app.css';
	import type { ColorScheme, Typography } from '$lib/content/types.generated';
	import Footer from '$lib/components/footer/footer.svelte';
	import { setContext } from 'svelte';
	let { data, children } = $props();
	import Header from '$lib/components/header/header.svelte';
	const scheme = $derived(data.scheme as ColorScheme);
	setContext('colors', scheme);
	const typography = $derived(data.typography as Typography);
	$effect(() => {
		// typography variables have to be set on the root, this is only solution I could find that works with js variables.... will hardcode in production
		const root = document.documentElement;
		root.style.setProperty('--fontSize', String(typography.fontSize));
		root.style.setProperty('--scale', String(typography.scale));
		root.style.setProperty('--lineHeight', String(typography.lineHeight));
	});
</script>

<div
	style={`
		--prime: ${scheme.prime};
		--accent: ${scheme.accent};
		--second: ${scheme.second};
		--gray: ${scheme.gray};
		--text: ${scheme.text};
		--light: ${scheme.light};
	`}
	class="full-height bg-light -m-top-site"
>
	<Header />
	<main class="bg-prime">
		{@render children()}
	</main>
</div>

<style>
	main {
		background: var(--prime);
	}
</style>
