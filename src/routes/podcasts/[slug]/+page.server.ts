// src/routes/podcasts/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPodcast } from '$lib/server/content/api.generated';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params, url }) => {
	const preview = url.searchParams.get('preview') === '1';

	const podcast = await getPodcast(params.slug, { includeDrafts: preview });

	if (!podcast) {
		throw error(404, 'Not found');
	}

	return {
		post: {
			...podcast,
			body: marked.parse(podcast.body)
		},
		preview
	};
};
