<script lang="ts">
	import { getContext } from 'svelte';
	import type { Tag } from '$lib/content/types.generated';
	const tags = (getContext('tags') ?? []) as Tag[];
</script>

<div class="bg-light page -p-lg">
	<h1>Tags</h1>
	{#if tags}
		<ul>
			{#each tags as tag}
				<li class="card">
					<h2><a href="/tag/{tag.slug}/">{tag.title} </a></h2>

					<p><a href="/tag/{tag.slug}">{@html tag.description}</a></p>
				</li>
			{/each}
		</ul>
	{/if}
</div>
