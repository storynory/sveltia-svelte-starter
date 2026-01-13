<script lang="ts">
	import type { Podcast } from '$lib/content/types.generated';
	import Picture from '$lib/components/PictureGrid.svelte';
	let { data } = $props();
	let posts = $derived(data.posts as Podcast[]);
</script>

<h2>Posts</h2>

<ul class="bg-prime grid">
	{#each posts as post}
		<li class="card">
			<a href="/posts/{post.slug}">{post.title}</a>
			<p>{post.description}</p>
		</li>
	{/each}
</ul>
