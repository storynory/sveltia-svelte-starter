import { getPodcasts, getTags, getPeople } from '$lib/server/content/api.generated';
import { join } from '$lib/server/content/helpers';

export async function load() {
	const podcasts = await getPodcasts();
	const tags = await getTags();
	const people = await getPeople();

	const podcastsWithTags = join(podcasts, tags, { field: 'tags' });
	const podcastsWithAll = join(podcastsWithTags, people, { field: 'talent' });

	return { posts: podcastsWithAll }; // keeping your "posts" naming
}
