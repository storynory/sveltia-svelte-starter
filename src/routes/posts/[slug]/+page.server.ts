import { error } from '@sveltejs/kit';
import { getPost, getTags, joinPostsWithTags } from '$lib/server/content/api.generated';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		throw error(404, 'Not found');
	}

	const tags = await getTags();
	const [postWithTags] = joinPostsWithTags([post], tags);

	return { post: postWithTags };
};
