import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTag, getPodcasts } from '$lib/server/content/api.generated';
import { marked } from 'marked';

export const load: PageServerLoad = async ({ params }) => {
	const tagSlug = params.slug;

	const tag = await getTag(tagSlug);
	if (!tag) throw error(404, 'Not found');

	const posts = await getPodcasts(); // drafts excluded by default
	const taggedPosts = posts.filter((p) => Array.isArray(p.tags) && p.tags.includes(tagSlug));

	return {
		tag: {
			...tag,
			body: await marked.parse(tag.body)
		},
		posts: taggedPosts
	};
};
