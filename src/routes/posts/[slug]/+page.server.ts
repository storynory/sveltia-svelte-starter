import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPost, getTags } from '$lib/server/content/api.generated';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		throw error(404, 'Not found');
	}

	return {
		post: {
			...post,
			body: marked.parse(post.body)
		}
	};
};
