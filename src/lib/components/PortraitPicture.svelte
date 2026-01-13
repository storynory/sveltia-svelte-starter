<script lang="ts">
	// @ts-ignore – same pattern as your other project
	let {
		src = '',
		alt = '',
		class: className = '',
		loading = 'lazy'
	} = $props<{
		src?: string;
		alt?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
	}>();

	const base = src.replace(/\.[^.]+$/, '');

	// WebP only
	const webpSrc = `${base}.640.webp`;
	const webpSrcset = `${base}.640.webp 640w`;

	const sizes = '300px'; // small portrait; tweak to taste
</script>

<img class={className} src={webpSrc} srcset={webpSrcset} {sizes} {alt} {loading} decoding="async" />

<style>
	img {
		margin-top: 0;
	}
</style>
