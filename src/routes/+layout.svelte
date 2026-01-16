<script lang="ts">
	import '../app.css';
	import type { ColorScheme, Typography } from '$lib/content/types.generated';

	let { data, children } = $props();

	const scheme = $derived(data.scheme as ColorScheme);

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
	class="full-height bg-light"
>
	{@render children()}
</div>
