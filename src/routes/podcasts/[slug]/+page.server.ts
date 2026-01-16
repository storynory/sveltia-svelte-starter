import { error } from '@sveltejs/kit';
import { getPodcast, getTags } from '$lib/server/content/api.generated';
import { marked } from 'marked';

export async function load({ params }) {
	const podcast = await getPodcast(params.slug);

	podcast.body = marked.parse(podcast.body);

	if (!podcast) {
		throw error(404, 'Not found');
	}

	return { post: podcast };
}
