<script>
	let { data } = $props();
	console.log(data.posts);
</script>

<h1>{data.tag.title}</h1>

{@html data.tag.body}

<ul class="bg-light">
	{#each data.posts as post}
		<li>
			<a href="/podcasts/{post.slug}">{post.title}</a>
		</li>
	{/each}
</ul>
