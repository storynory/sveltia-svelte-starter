import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPodcast } from '$lib/server/content/api.generated';
import { marked } from 'marked';

/*
===========================================================================
 DEFAULT MODE: STATIC PAGE (Cloudflare Pages / adapter-static)
 - Page is generated at build time
 - Published content only
 - No preview support
===========================================================================

👉 To enable SSR + draft previews:
   1. Uncomment `export const prerender = false`
   2. Uncomment the preview logic inside `load`
*/

// (Static build default — prerendered)
// export const prerender = true; // implicit default

export const load: PageServerLoad = async ({ params, url }) => {
	// STATIC MODE:
	// Fetch published content only
	const podcast = await getPodcast(params.slug);

	if (!podcast) {
		throw error(404, 'Not found');
	}

	/*
	===========================================================================
	 SSR + PREVIEW MODE (optional)
	 - Runs at request time
	 - Supports ?preview=1
	 - Redirects draft URLs to preview automatically
	===========================================================================

	Uncomment this block AND `export const prerender = false` above
	*/

	/*
	const preview = url.searchParams.get('preview') === '1';

	// Always fetch drafts when SSR is enabled
	const podcast = await getPodcast(params.slug, { includeDrafts: true });

	// Draft but no preview flag → redirect to preview URL
	if (podcast.draft && !preview) {
		throw redirect(302, `/podcasts/${params.slug}?preview=1`);
	}
	*/

	return {
		post: {
			...podcast,
			body: marked.parse(podcast.body)
		}
		// preview
	};
};
