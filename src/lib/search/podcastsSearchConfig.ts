export const podcastsSearchConfig = {
	indexUrl: '/search/podcasts.json',
	keys: [
		{ name: 'title', weight: 3 },
		{ name: 'tagTitles', weight: 2.2 },
		{ name: 'tagText', weight: 1.8 },
		{ name: 'description', weight: 1.6 },
		{ name: 'talent', weight: 1.2 }
	],
	fuseOptions: {
		threshold: 0.35,
		ignoreLocation: true,
		minMatchCharLength: 2,
		includeScore: true
	}
} as const;
