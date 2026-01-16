import * as api from '$lib/server/content/api.generated';
import { sortByDate, filterPublished, join } from '$lib/server/content/helpers';

type AnyItem = Record<string, unknown>;

type JoinSpec =
	| string
	| { field: string; collection?: string; multiple?: boolean; targetKey?: string };

type ListOpts = {
	includeDrafts?: boolean;
	sort?: string; // e.g. '-date,title'
	filter?: (row: AnyItem) => boolean; // simple & safe
	expand?: JoinSpec | JoinSpec[]; // e.g. 'tags' or {field:'author',collection:'people'}
};

function parseSort(sort: string | undefined) {
	if (!sort) return [];
	return sort
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

function applySort<T extends AnyItem>(items: T[], sort: string | undefined): T[] {
	let out = [...items];
	for (const key of parseSort(sort).reverse()) {
		const desc = key.startsWith('-');
		const field = (desc ? key.slice(1) : key) as keyof T;

		// date-ish sort if field looks like date
		if (String(field).toLowerCase().includes('date')) {
			out = sortByDate(out, field, desc ? 'desc' : 'asc') as T[];
			continue;
		}

		out.sort((a, b) => {
			const av = a[field];
			const bv = b[field];
			if (av === bv) return 0;
			if (av == null) return 1;
			if (bv == null) return -1;
			return (String(av) < String(bv) ? -1 : 1) * (desc ? -1 : 1);
		});
	}
	return out;
}

async function getAll(collection: string, includeDrafts: boolean) {
	// relies on generated getXxxs() functions being present.
	// map collection name -> function name at runtime
	const fn = `get${collection[0].toUpperCase()}${collection.slice(1)}`; // expects plural already
	const getter = (api as any)[fn];
	if (typeof getter !== 'function')
		throw new Error(`No API function ${fn}() for collection "${collection}"`);
	const items = (await getter({ includeDrafts })) as AnyItem[];
	return items;
}

async function getOne(collection: string, slug: string, includeDrafts: boolean) {
	const fn = `get${collection[0].toUpperCase()}${collection.slice(1, -1)}${collection.endsWith('s') ? '' : ''}`; // not used
	// better: call getXxx(slug)
	// we’ll just try both patterns: getPost / getPosts? etc
	const singularGuess = collection.endsWith('s') ? collection.slice(0, -1) : collection;
	const fn2 = `get${singularGuess[0].toUpperCase()}${singularGuess.slice(1)}`;
	const getter = (api as any)[fn2];
	if (typeof getter !== 'function')
		throw new Error(`No API function ${fn2}(slug) for collection "${collection}"`);
	return (await getter(slug, { includeDrafts })) as AnyItem | null;
}

async function expandItems(items: AnyItem[], spec: JoinSpec | JoinSpec[], includeDrafts: boolean) {
	const specs = Array.isArray(spec) ? spec : [spec];
	let out = items;

	for (const s of specs) {
		const field = typeof s === 'string' ? s : s.field;
		const multiple = typeof s === 'string' ? true : (s.multiple ?? true);
		const targetKey = typeof s === 'string' ? 'slug' : (s.targetKey ?? 'slug');

		// default collection name is the field name (tags -> tags)
		const targetCollection = typeof s === 'string' ? s : (s.collection ?? field);

		const targets = await getAll(targetCollection, includeDrafts);
		out = join(out, targets, { field, multiple, targetKey: targetKey as any }) as AnyItem[];
	}

	return out;
}

export function content() {
	return {
		collection(name: string) {
			return {
				async getList(page = 1, perPage = 50, opts: ListOpts = {}) {
					const includeDrafts = opts.includeDrafts === true;

					let items = await getAll(name, includeDrafts);

					// draft filtering
					items = filterPublished(items, { includeDrafts }) as AnyItem[];

					// filter predicate
					if (opts.filter) items = items.filter(opts.filter);

					// expand relations
					if (opts.expand) items = await expandItems(items, opts.expand, includeDrafts);

					// sort
					items = applySort(items, opts.sort);

					const totalItems = items.length;
					const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
					const start = (page - 1) * perPage;
					const end = start + perPage;

					return {
						page,
						perPage,
						totalItems,
						totalPages,
						items: items.slice(start, end)
					};
				},

				async getOne(slug: string, opts: Omit<ListOpts, 'sort'> = {}) {
					const includeDrafts = opts.includeDrafts === true;

					let item = await getOne(name, slug, includeDrafts);
					if (!item) return null;

					// draft filtering
					if (!includeDrafts) {
						const d = item.draft;
						const s = item.status;
						if (d === true) return null;
						if (typeof s === 'string' && s.toLowerCase() === 'draft') return null;
					}

					// expand relations
					if (opts.expand) {
						const [expanded] = await expandItems([item], opts.expand, includeDrafts);
						item = expanded;
					}

					// markdown-to-html stays separate (good)
					return item;
				}
			};
		}
	};
}
