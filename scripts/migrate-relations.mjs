#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

function slugify(input) {
	// simple, predictable slug: lowercase, hyphens, strip punctuation
	return String(input ?? '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '') // accents
		.toLowerCase()
		.trim()
		.replace(/['"]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-+/g, '-');
}

function extractFrontmatter(raw) {
	// expects file starts with --- ... ---
	if (!raw.startsWith('---')) return null;
	const end = raw.indexOf('\n---', 3);
	if (end === -1) return null;

	// include the closing --- line
	const endLine = raw.indexOf('\n', end + 1);
	const fmBlock = raw.slice(0, endLine === -1 ? raw.length : endLine + 1);
	const body = raw.slice(fmBlock.length);

	return { fmBlock, body };
}

function parseSimpleFrontmatterValue(fmBlock, key) {
	// Extract a single scalar from frontmatter, e.g. "name: Jana"
	// Does not handle nested YAML; good enough for your people/tags files.
	const lines = fmBlock.split('\n');
	for (const line of lines) {
		const m = line.match(new RegExp(`^${key}:\\s*(.*)\\s*$`));
		if (!m) continue;
		let v = m[1] ?? '';
		// strip surrounding quotes if any
		v = v.replace(/^['"]|['"]$/g, '');
		return v.trim();
	}
	return null;
}

function updateListKeyInFrontmatter(fmBlock, key, mapFn) {
	const lines = fmBlock.split('\n');
	let changed = false;

	// find "key:" line in frontmatter
	const keyIdx = lines.findIndex(
		(l) => new RegExp(`^${key}:\\s*$`).test(l) || new RegExp(`^${key}:\\s*\\[`).test(l)
	);
	if (keyIdx === -1) return { fmBlock, changed: false };

	// Case A: inline list: key: [a, b]
	if (lines[keyIdx].includes('[')) {
		const m = lines[keyIdx].match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`));
		if (!m) return { fmBlock, changed: false };
		const inside = m[1].trim();
		if (!inside) return { fmBlock, changed: false };

		const parts = inside
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.map((s) => s.replace(/^['"]|['"]$/g, ''));

		const mapped = parts.map(mapFn);
		const next = `${key}: [${mapped.map((s) => `'${s}'`).join(', ')}]`;
		if (next !== lines[keyIdx]) {
			lines[keyIdx] = next;
			changed = true;
		}
		return { fmBlock: lines.join('\n'), changed };
	}

	// Case B: block list:
	// key:
	//   - item
	//   - item2
	// stop when we hit a non-indented key or end of frontmatter
	let i = keyIdx + 1;
	while (i < lines.length) {
		const line = lines[i];

		// stop at end marker or a new top-level key
		if (line.trim() === '---') break;
		if (/^[A-Za-z0-9_]+:\s*/.test(line) && !line.startsWith('  ')) break;

		const itemMatch = line.match(/^\s*-\s*(.+)\s*$/);
		if (itemMatch) {
			let item = itemMatch[1].trim();
			item = item.replace(/^['"]|['"]$/g, '');
			const mapped = mapFn(item);
			const nextLine = line.replace(itemMatch[1], mapped);
			if (nextLine !== line) {
				lines[i] = nextLine;
				changed = true;
			}
		}

		i += 1;
	}

	return { fmBlock: lines.join('\n'), changed };
}

async function listMarkdownFiles(dir) {
	const out = [];
	let entries = [];
	try {
		entries = await fs.readdir(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const ent of entries) {
		const p = path.join(dir, ent.name);
		if (ent.isDirectory()) continue;
		if (ent.isFile() && (p.endsWith('.md') || p.endsWith('.markdown'))) out.push(p);
	}
	return out;
}

async function buildPeopleMap() {
	const dir = path.join(CONTENT_DIR, 'people');
	const files = await listMarkdownFiles(dir);
	const map = new Map(); // name -> slug (filename slug)
	for (const file of files) {
		const raw = await fs.readFile(file, 'utf8');
		const fm = extractFrontmatter(raw);
		const filenameSlug = path.basename(file).replace(/\.(md|markdown)$/i, '');
		const name = fm ? parseSimpleFrontmatterValue(fm.fmBlock, 'name') : null;
		if (name) map.set(name, filenameSlug);
	}
	return map;
}

async function buildTagsMap() {
	const dir = path.join(CONTENT_DIR, 'tags');
	const files = await listMarkdownFiles(dir);
	const map = new Map(); // title -> slug (filename slug)
	for (const file of files) {
		const raw = await fs.readFile(file, 'utf8');
		const fm = extractFrontmatter(raw);
		const filenameSlug = path.basename(file).replace(/\.(md|markdown)$/i, '');
		const title = fm ? parseSimpleFrontmatterValue(fm.fmBlock, 'title') : null;
		if (title) map.set(title, filenameSlug);
	}
	return map;
}

async function migrateFile(file, peopleMap, tagsMap) {
	const raw = await fs.readFile(file, 'utf8');
	const fm = extractFrontmatter(raw);
	if (!fm) return { changed: false };

	let fmBlock = fm.fmBlock;
	let changedAny = false;

	// podcasts: talent + tags
	if (file.includes(`${path.sep}podcasts${path.sep}`)) {
		const r1 = updateListKeyInFrontmatter(fmBlock, 'talent', (v) => peopleMap.get(v) ?? slugify(v));
		fmBlock = r1.fmBlock;
		changedAny ||= r1.changed;

		const r2 = updateListKeyInFrontmatter(fmBlock, 'tags', (v) => tagsMap.get(v) ?? slugify(v));
		fmBlock = r2.fmBlock;
		changedAny ||= r2.changed;
	}

	// posts: tags
	if (file.includes(`${path.sep}posts${path.sep}`)) {
		const r = updateListKeyInFrontmatter(fmBlock, 'tags', (v) => tagsMap.get(v) ?? slugify(v));
		fmBlock = r.fmBlock;
		changedAny ||= r.changed;
	}

	if (!changedAny) return { changed: false };

	if (DRY_RUN) {
		console.log(`\n[DRY RUN] Would update: ${path.relative(ROOT, file)}`);
		return { changed: true };
	}

	const next = fmBlock + fm.body;
	await fs.writeFile(file, next, 'utf8');
	console.log(`Updated: ${path.relative(ROOT, file)}`);
	return { changed: true };
}

async function main() {
	const peopleMap = await buildPeopleMap();
	const tagsMap = await buildTagsMap();

	if (VERBOSE) {
		console.log(`People mapped: ${peopleMap.size}`);
		console.log(`Tags mapped:   ${tagsMap.size}`);
	}

	const targets = [
		...(await listMarkdownFiles(path.join(CONTENT_DIR, 'podcasts'))),
		...(await listMarkdownFiles(path.join(CONTENT_DIR, 'posts')))
	];

	let changedCount = 0;
	for (const file of targets) {
		const { changed } = await migrateFile(file, peopleMap, tagsMap);
		if (changed) changedCount += 1;
	}

	console.log(`\nDone. Files changed: ${changedCount}${DRY_RUN ? ' (dry-run)' : ''}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
