<script lang="ts">
	import Header from '$lib/components/header/header.svelte';
	import type { Podcast } from '$lib/content/types.generated';
	import Picture from '$lib/components/PictureGrid.svelte';
	let { data } = $props();
	let posts = $derived(data.posts as Podcast[]);
</script>

<Header />
<main class="bg-prime">
	<div class="page">
		<ul class="grid -m -p-x bg-prime">
			{#each posts as post}
				<li class="card bg-light">
					<h2><a href="/podcasts/{post.slug}">{post.title}</a></h2>
					{#if post.thumb}
						<Picture src={post.thumb} />
					{/if}

					<p>{post.description}</p>
				</li>
			{/each}
		</ul>
	</div>
</main>

<style>
	main {
		width: 100%;
		position: relative;
		top: 200px;
		z-index: 1;
	}
</style>
