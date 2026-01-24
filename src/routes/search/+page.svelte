<script lang="ts">
	import Fuse from 'fuse.js';
	import { podcastsSearchConfig as cfg } from '$lib/search/podcastsSearchConfig';
	import Header from '$lib/components/header/header.svelte';

	type Doc = {
		id: string;
		slug: string;
		title: string;
		description: string;
		tagTitles: string[];
		tagText: string;
		talent: string[];
		thumb?: string;
		date?: string;
		duration?: string;
		length?: string;
	};

	type Result = { item: Doc; score?: number; refIndex?: number };

	let query = $state('');
	let docs = $state() as Doc[];
	let fuse = $state<any>(null); // keep this lax; avoids Fuse typing drama
	let results = $state() as Result[];

	// load index once
	$effect(() => {
		if (fuse) return;

		(async () => {
			const res = await fetch(cfg.indexUrl);
			const data = (await res.json()) as Doc[];
			docs = data;
			fuse = new Fuse(docs, { ...(cfg.fuseOptions as any), keys: cfg.keys as any });
			results = docs.map((item) => ({ item, score: 1, refIndex: 0 }));
		})();

		return;
	});

	// recompute results when query changes
	$effect(() => {
		const q = query.trim();

		if (!fuse) {
			results = [];
			return;
		}

		if (!q) {
			results = docs.map((item) => ({ item, score: 1, refIndex: 0 }));
			return;
		}

		results = fuse.search(q) as unknown as Result[];
	});
</script>

<main class="bg-prime">
	<div class="page">
		<section class="bg-light -p">
			<h1>Search</h1>

			<input
				class="input -p"
				type="search"
				placeholder="Search episodes…"
				bind:value={query}
				autocapitalize="off"
				autocomplete="off"
				spellcheck="false"
			/>

			{#if !fuse}
				<p>Loading…</p>
			{:else}
				<p>{results.length} result{results.length === 1 ? '' : 's'}</p>

				<ul class="r">
					{#each results as r}
						<li class="card bg-accent">
							<h2 class="-p-y"><a href="/podcasts/{r.item.slug}">{r.item.title}</a></h2>

							{#if r.item.talent?.length}
								<small> — {r.item.talent.join(', ')}</small>
							{/if}

							{#if r.item.tagTitles?.length}
								<div><small>{r.item.tagTitles.join(' · ')}</small></div>
							{/if}

							{#if r.item.description}
								<p><a href="/podcasts/{r.item.slug}">{r.item.description}</a></p>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</main>

<style>
	.input {
		width: 90%;
		margin: 1em auto;
		border: 1px solid gray;
		border-radius: 1em;
	}
</style>
