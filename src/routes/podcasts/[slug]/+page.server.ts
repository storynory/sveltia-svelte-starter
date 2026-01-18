// src/routes/podcasts/[slug]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPodcast } from '$lib/server/content/api.generated';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params, url }) => {
	const preview = url.searchParams.get('preview') === '1';

	// Always allow drafts at fetch time
	const podcast = await getPodcast(params.slug, { includeDrafts: true });

	// Truly not found
	if (!podcast) {
		throw error(404, 'Not found');
	}

	// Draft, but user is not in preview mode → redirect
	if (podcast.draft && !preview) {
		throw redirect(302, `/podcasts/${params.slug}?preview=1`);
	}

	return {
		post: {
			...podcast,
			body: marked.parse(podcast.body)
		},
		preview
	};
};
