// src/routes/feed.rss/+server.ts
import { getPodcasts } from '$lib/server/content/api.generated';
import type { RequestHandler } from './$types';

export const prerender = true;

// ------------------------------------------------------------
// Config (edit this block per site/feed)
// ------------------------------------------------------------
const FEED = {
	siteUrl: 'https://relaxivity.app',
	title: 'Relaxivity',
	description: 'Relax and listen to stories',

	// Where the mp3 files live (no trailing slash needed)
	audioBaseUrl: 'https://audio.relaxivity.app',

	// If mp3 is stored as a filename (your case), keep this true.
	// If you later store mp3 as a full URL, set false.
	mp3IsFilename: true,

	language: 'en',
	author: 'Relaxivity',
	explicit: false,

	itunesCategory: {
		main: 'Health & Fitness',
		sub: 'Mental Health'
	},

	channelImage: '/itunes247.jpg',

	cacheControl: 'max-age=0, s-maxage=3600'
} as const;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function escapeXml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function dateValue(p: { date?: string }): number {
	const t = p?.date ? new Date(p.date).getTime() : NaN;
	return Number.isFinite(t) ? t : 0;
}

function pubDate(p: { date?: string }): string {
	// If date missing, avoid "Invalid Date"
	return p?.date && Number.isFinite(new Date(p.date).getTime())
		? new Date(p.date).toUTCString()
		: new Date(0).toUTCString();
}

function resolveChannelImageUrl(): string {
	return FEED.channelImage.startsWith('http')
		? FEED.channelImage
		: `${FEED.siteUrl}${FEED.channelImage}`;
}

function resolveAudioUrl(mp3: unknown): string {
	const s = typeof mp3 === 'string' ? mp3.trim() : '';
	if (!s) return '';

	// Full URL already
	if (s.startsWith('http://') || s.startsWith('https://')) return s;

	// If it’s stored as a filename (e.g. "birth-of-buddha-relaxivity.mp3")
	if (FEED.mp3IsFilename) return `${FEED.audioBaseUrl}/${s}`;

	// Otherwise treat as a path (e.g. "/podcasts/ep1.mp3")
	if (s.startsWith('/')) return `${FEED.audioBaseUrl}${s}`;

	// Fallback
	return `${FEED.audioBaseUrl}/${s}`;
}

type Podcast = {
	slug: string;
	title: string;
	date?: string;
	description?: string;
	bodyHtml?: string;
	thumb?: string;
	mp3?: string;
	duration?: string;
	length?: string | number;
	with?: string[];
};

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------
export const GET: RequestHandler = async () => {
	const podcasts = (await getPodcasts()) as Podcast[];

	const itemsXml = podcasts
		.slice()
		.sort((a, b) => dateValue(b) - dateValue(a))
		.map((p) => {
			const link = `${FEED.siteUrl}/podcasts/${p.slug}`;
			const audioUrl = resolveAudioUrl(p.mp3);

			const description = p.description || p.bodyHtml || '';

			const thumbUrl = p.thumb
				? p.thumb.startsWith('http')
					? p.thumb
					: `${FEED.siteUrl}${p.thumb}`
				: '';

			const lengthValue =
				typeof p.length === 'number'
					? p.length
					: typeof p.length === 'string'
						? Number.parseInt(p.length, 10) || 0
						: 0;

			return `
      <item>
        <title><![CDATA[${p.title ?? ''}]]></title>
        <link>${escapeXml(link)}</link>
        <guid isPermaLink="true">${escapeXml(link)}</guid>
        <pubDate>${pubDate(p)}</pubDate>

        <description><![CDATA[${description}]]></description>

        ${audioUrl ? `<enclosure url="${escapeXml(audioUrl)}" length="${lengthValue}" type="audio/mpeg" />` : ''}
        ${p.duration ? `<itunes:duration>${escapeXml(p.duration)}</itunes:duration>` : ''}
        ${thumbUrl ? `<itunes:image href="${escapeXml(thumbUrl)}" />` : ''}
        ${p.with && p.with.length > 0 ? `<itunes:author>${escapeXml(p.with.join(', '))}</itunes:author>` : ''}
      </item>`;
		})
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss
  version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
>
  <channel>
    <title>${escapeXml(FEED.title)}</title>
    <link>${escapeXml(FEED.siteUrl)}</link>
    <description>${escapeXml(FEED.description)}</description>
    <language>${escapeXml(FEED.language)}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

    <itunes:author>${escapeXml(FEED.author)}</itunes:author>
    <itunes:explicit>${FEED.explicit ? 'true' : 'false'}</itunes:explicit>

    <itunes:category text="${escapeXml(FEED.itunesCategory.main)}">
      <itunes:category text="${escapeXml(FEED.itunesCategory.sub)}" />
    </itunes:category>

    <image>
      <url>${escapeXml(resolveChannelImageUrl())}</url>
      <title>${escapeXml(FEED.title)}</title>
      <link>${escapeXml(FEED.siteUrl)}</link>
    </image>

    ${itemsXml}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': FEED.cacheControl
		}
	});
};
