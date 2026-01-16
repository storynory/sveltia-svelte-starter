// ================= IMAGE TYPES =================

export type ImageIntrinsic = {
	width: number | null;
	height: number | null;
};

export type ImageMetaMap = Record<string, ImageIntrinsic>;

// Audio
export type AudioSource = {
	mp3: string;
	duration?: string;
	length?: string;
};

// ================= DOMAIN TYPES =================

export type Person = {
	slug: string;
	name: string;
	bio: string;
	portrait: string;
	body: string;
	bodyHtml: string;
	books?: {
		title: string;
		author?: string;
		date?: string | null; // allow null (matches server output)
		publisher?: string;
		cover?: string;
		amazon?: string;
		summary?: string;
	}[];
};

export type Podcast = {
	slug: string;
	title: string;
	description: string;
	date: string;
	thumb: string;
	mp3: string;
	duration: string;
	length: string;
	with: string[];
	body: string;
	bodyHtml: string;
	people?: Person[];
};

// ================= SEARCH TYPES =================

export type PersonSearchItem = Pick<Person, 'slug' | 'name' | 'bio' | 'portrait'> & {
	type: 'person';
};

export type PodcastSearchItem = Pick<
	Podcast,
	'slug' | 'title' | 'description' | 'thumb' | 'with' | 'date'
> & {
	type: 'podcast';
};

export type SearchResult = PersonSearchItem | PodcastSearchItem;
