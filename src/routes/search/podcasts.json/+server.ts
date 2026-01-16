import { json } from '@sveltejs/kit';
import { getPodcasts, getTags, getPeople } from '$lib/server/content/api.generated';
import { join, filterPublished, pick } from '$lib/server/content/helpers';

export const prerender = true;

function stripMarkdown(input: string): string {
	return input
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/[#>*_~\-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export async function GET() {
	let podcasts = await getPodcasts();
	const tags = await getTags();
	const people = await getPeople();

	podcasts = filterPublished(podcasts);

	podcasts = join(podcasts, tags, { field: 'tags', targetKey: 'title', multiple: true });
	podcasts = join(podcasts, people, { field: 'talent', targetKey: 'name', multiple: true });

	const docs = podcasts.map((p: any) => {
		const tagTitles = (p.tagsObjects ?? []).map((t: any) => t.title).filter(Boolean);

		const tagText = (p.tagsObjects ?? [])
			.map((t: any) => {
				const desc = t.description ? stripMarkdown(t.description) : '';
				return [t.title, desc].filter(Boolean).join(' — ');
			})
			.join(' | ');

		const talent = (p.talentObjects ?? []).map((x: any) => x.name).filter(Boolean);

		return {
			...pick(p, ['slug', 'title', 'date', 'thumb', 'duration', 'length']),
			id: p.slug,
			description: p.description ? stripMarkdown(p.description) : '',
			tagTitles,
			tagText,
			talent
		};
	});

	return json(docs);
}
