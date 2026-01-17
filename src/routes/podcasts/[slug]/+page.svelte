<script lang="ts">
	import Picture from '$lib/components/PictureHero.svelte';
	import Header from '$lib/components/header/header.svelte';
	import Player from '$lib/components/AudioPlayer.svelte';
	let { data } = $props();
</script>

<Header />

<main class="bg-prime center">
	<article class="bg-light">
		<h1>{data.post.title}</h1>
		<Player mp3={data.post.mp3} />
		<Picture src={data.post.thumb} />
		<p>{@html data.post.body}</p>
	</article>
</main>
