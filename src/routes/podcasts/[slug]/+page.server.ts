import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPodcast, getTags } from '$lib/server/content/api.generated';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
	const podcast = await getPodcast(params.slug);

	if (!podcast) {
		throw error(404, 'Not found');
	}

	return {
		post: {
			...podcast,
			body: marked.parse(podcast.body)
		}
	};
};
