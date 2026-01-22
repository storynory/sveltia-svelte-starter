<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<meta name="description" content={data.post.excerpt} />
	<title>{data.post.title}</title>
</svelte:head>

<div class="page">
	<article class="bg-light -m-auto">
		<h1>{@html data.post.title}</h1>
		<p>{@html data.post.body}</p>
	</article>
</div>
