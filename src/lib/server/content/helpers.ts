import { marked } from 'marked';

/**
 * Add `${field}Html` properties by rendering Markdown fields on each item.
 * Example: fields ['body','description'] => adds bodyHtml, descriptionHtml
 */
export type WithHtml<T, K extends keyof T> = T & {
	[P in K as `${Extract<P, string>}Html`]: string;
};

export function addMarkdownHtml<T extends Record<string, unknown>, K extends keyof T>(
	items: T[],
	fields: readonly K[],
	opts?: { marked?: Parameters<typeof marked.parse>[1] }
): WithHtml<T, K>[] {
	return items.map((item) => {
		const extra: Record<string, string> = {};
		for (const field of fields) {
			const key = String(field);
			const raw = item[field];
			const md = typeof raw === 'string' ? raw : '';
			extra[`${key}Html`] = md ? String(marked.parse(md, opts?.marked)) : '';
		}
		return { ...item, ...(extra as any) } as WithHtml<T, K>;
	});
}

/**
 * Render Markdown fields on a single object (same behaviour as addMarkdownHtml, but for one item).
 */
export function addMarkdownHtmlOne<T extends Record<string, unknown>, K extends keyof T>(
	item: T,
	fields: readonly K[],
	opts?: { marked?: Parameters<typeof marked.parse>[1] }
): WithHtml<T, K> {
	return addMarkdownHtml([item], fields, opts)[0];
}

/**
 * Generic join helper for relation fields (string or string[]).
 * Adds `${field}Objects` to each item.
 *
 * Example:
 *   join(posts, tags, { field: 'tags', targetKey: 'slug' })
 * => post.tagsObjects: Tag[]
 *
 * Example:
 *   join(podcasts, narrators, { field: 'narrator', multiple: false })
 * => podcast.narratorObjects: Narrator | undefined
 */
export type WithJoined<T, FieldName extends string, Target, Multiple extends boolean> = T &
	(Multiple extends true
		? { [K in `${FieldName}Objects`]: Target[] }
		: { [K in `${FieldName}Objects`]: Target | undefined });

export function join<
	TItem extends Record<string, unknown>,
	FieldName extends string,
	TTarget extends Record<string, unknown>,
	TargetKey extends keyof TTarget = 'slug',
	Multiple extends boolean = true
>(
	items: TItem[],
	targets: TTarget[],
	opts: {
		field: FieldName;
		targetKey?: TargetKey; // default: 'slug'
		multiple?: Multiple; // default: true
	}
): WithJoined<TItem, FieldName, TTarget, Multiple>[] {
	const targetKey = (opts.targetKey ?? ('slug' as TargetKey)) as TargetKey;
	const multiple = (opts.multiple ?? true) as Multiple;

	const index = new Map<string, TTarget>();
	for (const t of targets) {
		const k = t[targetKey];
		if (typeof k === 'string' && k) index.set(k, t);
	}

	const joinedProp = `${opts.field}Objects` as const;

	return items.map((item) => {
		const v = item[opts.field];

		if (multiple) {
			const keys = Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
			const resolved = keys
				.filter((k): k is string => typeof k === 'string')
				.map((k) => index.get(k))
				.filter(Boolean) as TTarget[];
			return { ...(item as any), [joinedProp]: resolved } as any;
		}

		const key = typeof v === 'string' ? v : '';
		const resolved = key ? index.get(key) : undefined;
		return { ...(item as any), [joinedProp]: resolved } as any;
	});
}

export function joinOne<
	TItem extends Record<string, unknown>,
	FieldName extends string,
	TTarget extends Record<string, unknown>,
	Multiple extends boolean = false
>(
	item: TItem,
	targets: TTarget[],
	opts: {
		field: FieldName;
		targetKey?: keyof TTarget;
		multiple?: Multiple;
	}
): WithJoined<TItem, FieldName, TTarget, Multiple> {
	return join([item], targets, opts)[0];
}

/**
 * Sort by a date field (string or Date-ish).
 * Defaults to descending (newest first).
 */
export function sortByDate<T extends Record<string, unknown>>(
	items: T[],
	field: keyof T,
	dir: 'asc' | 'desc' = 'desc'
): T[] {
	const toTime = (x: unknown) => {
		if (x instanceof Date) return x.getTime();
		if (typeof x === 'string' && x) {
			const t = Date.parse(x);
			return Number.isFinite(t) ? t : NaN;
		}
		return NaN;
	};

	const factor = dir === 'asc' ? 1 : -1;

	return [...items].sort((a, b) => {
		const ta = toTime(a[field]);
		const tb = toTime(b[field]);

		// push invalid dates to the end
		if (!Number.isFinite(ta) && !Number.isFinite(tb)) return 0;
		if (!Number.isFinite(ta)) return 1;
		if (!Number.isFinite(tb)) return -1;

		return factor * (ta - tb);
	});
}

/**
 * Filter out drafts (supports either boolean draft flag OR status string).
 * Default is "published only".
 */
export function filterPublished<T extends Record<string, unknown>>(
	items: T[],
	opts?: { includeDrafts?: boolean; draftField?: keyof T; statusField?: keyof T }
): T[] {
	const includeDrafts = opts?.includeDrafts === true;
	if (includeDrafts) return items;

	const draftField = (opts?.draftField ?? 'draft') as keyof T;
	const statusField = (opts?.statusField ?? 'status') as keyof T;

	return items.filter((item) => {
		const d = item[draftField];
		if (d === true) return false;

		const s = item[statusField];
		if (typeof s === 'string' && s.toLowerCase() === 'draft') return false;

		return true;
	});
}

export function pick<T extends Record<string, any>, K extends keyof T>(item: T, keys: K[]) {
	const out: Partial<T> = {};
	for (const k of keys) out[k] = item[k];
	return out as Pick<T, K>;
}
