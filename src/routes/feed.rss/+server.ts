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

	// Recommended for Apple Podcasts (email should NOT go in itunes:author)
	owner: {
		name: 'Relaxivity',
		email: 'bertie@storynory.com' // <- change this
	},

	explicit: false,

	itunesCategory: {
		main: 'Health & Fitness',
		sub: 'Mental Health'
	},

	// 1400x1400+ square recommended; should be a full URL or site-relative path
	channelImage: '/itunes247.jpg',

	// Optional: if you want every episode to use channelImage unless it has its own thumb
	fallbackItemImageToChannelImage: true,

	cacheControl: 'max-age=0, s-maxage=3600'
} as const;

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type Podcast = {
	slug: string;
	title: string;
	draft?: boolean;
	description?: string;
	date?: string;
	thumb?: string;
	mp3?: string;
	duration?: string; // "MM:SS" or "HH:MM:SS"
	length?: string | number; // bytes, allow commas in string
	bodyHtml?: string; // optional, if your API provides it
	body?: string; // optional
	excerpt?: string; // optional
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function escapeXml(input: string): string {
	return String(input)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

// CDATA that won’t break if content includes "]]>"
function cdata(input: string): string {
	return `<![CDATA[${String(input).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function dateValue(p: { date?: string }): number {
	const t = p?.date ? new Date(p.date).getTime() : NaN;
	return Number.isFinite(t) ? t : 0;
}

function pubDate(p: { date?: string }): string {
	const d = p?.date ? new Date(p.date) : null;
	return d && Number.isFinite(d.getTime()) ? d.toUTCString() : new Date(0).toUTCString();
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

function resolveThumbUrl(itemThumb?: string): string {
	const t = typeof itemThumb === 'string' ? itemThumb.trim() : '';
	if (t) {
		return t.startsWith('http') ? t : `${FEED.siteUrl}${t}`;
	}
	return FEED.fallbackItemImageToChannelImage ? resolveChannelImageUrl() : '';
}

function parseLengthBytes(length: unknown): number {
	if (typeof length === 'number') {
		return Number.isFinite(length) && length > 0 ? Math.floor(length) : 0;
	}
	if (typeof length === 'string') {
		// allow commas/spaces from “Get Info” copy/paste: "20,971,520"
		const cleaned = length.replace(/[, ]+/g, '').trim();
		const n = Number.parseInt(cleaned, 10);
		return Number.isFinite(n) && n > 0 ? n : 0;
	}
	return 0;
}

function isValidDuration(d: unknown): d is string {
	if (typeof d !== 'string') return false;
	const s = d.trim();
	// MM:SS or HH:MM:SS (also allows M:SS)
	return /^([0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]$/.test(s);
}

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------
export const GET: RequestHandler = async () => {
	const podcasts = (await getPodcasts()) as Podcast[];

	const itemsXml = podcasts
		.slice()
		// drop drafts if they exist
		.filter((p) => !p.draft)
		.sort((a, b) => dateValue(b) - dateValue(a))
		.map((p) => {
			const link = `${FEED.siteUrl}/podcasts/${p.slug}`;
			const audioUrl = resolveAudioUrl(p.mp3);

			// Prefer explicit description; fall back to HTML/body if you have it; else empty.
			const description = p.description ?? p.bodyHtml ?? p.excerpt ?? '';

			const thumbUrl = resolveThumbUrl(p.thumb);
			const lengthValue = parseLengthBytes(p.length);

			// Only output duration if it matches a safe pattern
			const duration = isValidDuration(p.duration) ? p.duration.trim() : '';

			// Enclosure: include if we have an audio URL. Length is optional; include only if valid > 0.
			const enclosureXml = audioUrl
				? lengthValue > 0
					? `<enclosure url="${escapeXml(audioUrl)}" length="${lengthValue}" type="audio/mpeg" />`
					: `<enclosure url="${escapeXml(audioUrl)}" type="audio/mpeg" />`
				: '';

			return `
      <item>
        <title>${cdata(p.title ?? '')}</title>
        <link>${escapeXml(link)}</link>
        <guid isPermaLink="true">${escapeXml(link)}</guid>
        <pubDate>${pubDate(p)}</pubDate>

        <description>${cdata(description)}</description>

        ${enclosureXml}
        ${duration ? `<itunes:duration>${escapeXml(duration)}</itunes:duration>` : ''}
        ${thumbUrl ? `<itunes:image href="${escapeXml(thumbUrl)}" />` : ''}

        <!-- Keep author consistent and set once in config -->
        <itunes:author>${escapeXml(FEED.author)}</itunes:author>
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

    <itunes:owner>
      <itunes:name>${escapeXml(FEED.owner.name)}</itunes:name>
      <itunes:email>${escapeXml(FEED.owner.email)}</itunes:email>
    </itunes:owner>

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
