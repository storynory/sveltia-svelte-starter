<script lang="ts">
	import Header from '$lib/components/header/header.svelte';

	let { data } = $props();
</script>

<Header />
<main class="bg-prime -p">
	<article class="bg-light -m-auto">
		<h1>{@html data.post.title}</h1>
		<p>{@html data.post.body}</p>
	</article>
</main>
