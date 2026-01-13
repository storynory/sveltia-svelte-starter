import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { collections, type CollectionName } from '$lib/generated/collections';

const ROOT = path.resolve(process.cwd());

export type ReadResult = {
	meta: { collection: string; slug?: string; name?: string; sourcePath: string };
	data: Record<string, unknown>;
	body: string; // markdown body (empty for JSON/YAML docs)
};

function fileSlug(filename: string) {
	return filename.replace(/\.[^.]+$/, '');
}

export async function readAll(name: CollectionName): Promise<ReadResult[]> {
	const def = collections[name];

	if (def.kind !== 'folder') {
		throw new Error(`readAll() only supports folder collections. "${name}" is files-based.`);
	}

	const dir = path.join(ROOT, def.folder);
	const entries = await fs.readdir(dir, { withFileTypes: true });

	const results: ReadResult[] = [];
	for (const entry of entries) {
		if (!entry.isFile()) continue;

		// Only read matching extension
		if (!entry.name.endsWith(`.${def.extension}`)) continue;

		const fullPath = path.join(dir, entry.name);
		const raw = await fs.readFile(fullPath, 'utf8');

		if (def.format === 'markdown') {
			const parsed = matter(raw);
			results.push({
				meta: { collection: name, slug: fileSlug(entry.name), sourcePath: fullPath },
				data: parsed.data as Record<string, unknown>,
				body: String(parsed.content ?? '')
			});
		} else if (def.format === 'json') {
			const data = JSON.parse(raw);
			results.push({
				meta: { collection: name, slug: fileSlug(entry.name), sourcePath: fullPath },
				data,
				body: typeof data?.body === 'string' ? data.body : ''
			});
		} else {
			// Keep v1 simple: treat unknown as markdown-ish
			const parsed = matter(raw);
			results.push({
				meta: { collection: name, slug: fileSlug(entry.name), sourcePath: fullPath },
				data: parsed.data as Record<string, unknown>,
				body: String(parsed.content ?? '')
			});
		}
	}

	return results;
}

export async function readOne(name: CollectionName, slug: string): Promise<ReadResult | null> {
	const def = collections[name];
	if (def.kind !== 'folder') throw new Error(`readOne() only supports folder collections.`);

	const fullPath = path.join(ROOT, def.folder, `${slug}.${def.extension}`);
	const raw = await fs.readFile(fullPath, 'utf8').catch(() => null);
	if (!raw) return null;

	if (def.format === 'markdown') {
		const parsed = matter(raw);
		return {
			meta: { collection: name, slug, sourcePath: fullPath },
			data: parsed.data as Record<string, unknown>,
			body: String(parsed.content ?? '')
		};
	}

	if (def.format === 'json') {
		const data = JSON.parse(raw);
		return {
			meta: { collection: name, slug, sourcePath: fullPath },
			data,
			body: typeof data?.body === 'string' ? data.body : ''
		};
	}

	const parsed = matter(raw);
	return {
		meta: { collection: name, slug, sourcePath: fullPath },
		data: parsed.data as Record<string, unknown>,
		body: String(parsed.content ?? '')
	};
}

export async function readDoc(
	collectionName: CollectionName,
	docName: string
): Promise<ReadResult> {
	const def = collections[collectionName];
	if (def.kind !== 'files') throw new Error(`readDoc() only supports files collections.`);

	const item = def.files.find((f) => f.name === docName);
	if (!item) throw new Error(`Doc "${docName}" not found in files collection "${collectionName}".`);

	const fullPath = path.join(ROOT, item.file);
	const raw = await fs.readFile(fullPath, 'utf8');

	if (item.format === 'json') {
		const data = JSON.parse(raw);
		return {
			meta: { collection: collectionName, name: docName, sourcePath: fullPath },
			data,
			body: typeof data?.body === 'string' ? data.body : ''
		};
	}

	// frontmatter/markdown default
	const parsed = matter(raw);
	return {
		meta: { collection: collectionName, name: docName, sourcePath: fullPath },
		data: parsed.data as Record<string, unknown>,
		body: String(parsed.content ?? '')
	};
}
