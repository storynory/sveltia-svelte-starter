<script lang="ts">
	import Picture from '$lib/components/PictureHero.svelte';
	import Header from '$lib/components/header/header.svelte';
	import Player from '$lib/components/AudioPlayer.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.title} />
</svelte:head>

<div class="page full bg-prime">
	<article class="bg-light grain">
		<header class="-p txt-center">
			<h1 class="brand-font txt-prime txt-center">{data.post.title}</h1>
		</header>
		<Player mp3={data.post.mp3} />
		{#if data.post.thumb}
			<Picture src={data.post.thumb} />
		{/if}
		<p>{@html data.post.body}</p>
	</article>
</div>

<style>
	h1 {
		font-size: 3em;
	}
	.page {
		padding-top: 2em;
	}
	article {
		margin: auto;
	}
</style>
