import { getPodcasts, getTags, getPeople } from '$lib/server/content/api.generated';
import { join } from '$lib/server/content/helpers';

export async function load() {
	let podcasts = await getPodcasts();
	const tags = await getTags();
	const talent = await getPeople();

	podcasts = join(podcasts, tags, {
		field: 'slug',
		multiple: true
	});

	podcasts = join(podcasts, talent, {
		field: 'name',
		multiple: true
	});

	console.log(tags[0]);
	console.log(talent[0]);
	return { posts: podcasts }; // keeping your "posts" naming
}
