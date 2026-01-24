<script lang="ts">
	import type { Podcast } from '$lib/content/types.generated';
	import Picture from '$lib/components/PictureGrid.svelte';
	import HeroPanel from '$lib/components/FrontHero.svelte';
	let { data } = $props();
	let posts = $derived(data.posts as Podcast[]);
</script>

<svelte:head>
	<title>Relaxivity - Audio to relax to</title>
	<meta
		name="description"
		content="Relaxing and atmospheric audio, including stories, and chants"
	/>
</svelte:head>
<div class="page">
	<HeroPanel />
	<ul class="grid -m -p-x bg-prime">
		{#each posts as post}
			<li class="bg-prime -p">
				<h2 class="txt-light">
					<a class="txt-light" href="/podcasts/{post.slug}">{post.title}</a>
				</h2>
				{#if post.thumb}
					<a href="/podcasts/{post.slug}"> <Picture src={post.thumb} /></a>
				{/if}
				<div class="bg-light">
					<p class="-p"><a href="/podcasts/{post.slug}">{post.description}</a></p>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	li h2 {
		color: white;
	}
</style>
