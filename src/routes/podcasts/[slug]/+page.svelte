<script lang="ts">
	import Picture from '$lib/components/PictureHero.svelte';
	import Header from '$lib/components/header/header.svelte';
	let { data } = $props();
</script>

<Header />

<main class="bg-prime center">
	<article class="bg-light">
		<h1>{data.post.title}</h1>
		<Picture src={data.post.thumb} />
		<p>{@html data.post.body}</p>
	</article>
</main>
