import { getPodcasts } from '$lib/server/content/api.generated';

export async function load() {
	const posts = await getPodcasts(); // draft filtered if draft field exists
	console.log(posts);
	return { posts: posts };
}
