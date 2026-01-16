// scripts/generate-sveltia-config.mjs
//
// Build a single Sveltia config at static/admin/config.yml
// from modular YAML files:
//
//   cms/base.yml
//   cms/collections/*.yml   (each file contains ONE collection item)
//
// Usage:
//   node scripts/generate-sveltia-config.mjs
//
// Notes:
// - Keeps it boring: no anchors, no includes, no magic.
// - Fails loudly if collections are missing/duplicated.

import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();

const BASE_PATH = path.join(ROOT, 'cms', 'base.yml');
const COLLECTIONS_DIR = path.join(ROOT, 'cms', 'collections');
const OUT_PATH = path.join(ROOT, 'static', 'admin', 'config.yml');

async function fileExists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

async function readYamlFile(p) {
	const raw = await fs.readFile(p, 'utf8');
	return YAML.parse(raw);
}

async function main() {
	assert(await fileExists(BASE_PATH), `Missing ${BASE_PATH}`);

	const base = await readYamlFile(BASE_PATH);
	assert(base && typeof base === 'object', `Invalid YAML in ${BASE_PATH}`);

	// base.yml should NOT contain collections
	assert(
		!('collections' in base),
		`base.yml should not contain "collections:" (put collections in cms/collections/*.yml)`
	);

	assert(await fileExists(COLLECTIONS_DIR), `Missing folder ${COLLECTIONS_DIR}`);

	const entries = await fs.readdir(COLLECTIONS_DIR, { withFileTypes: true });
	const ymlFiles = entries
		.filter((e) => e.isFile() && (e.name.endsWith('.yml') || e.name.endsWith('.yaml')))
		.map((e) => path.join(COLLECTIONS_DIR, e.name))
		.sort((a, b) => a.localeCompare(b)); // stable order

	assert(ymlFiles.length > 0, `No collection YAML files found in ${COLLECTIONS_DIR}`);

	const collections = [];
	for (const file of ymlFiles) {
		const doc = await readYamlFile(file);

		// Expect either:
		// - a single object { name: ..., ... }   (recommended)
		// OR
		// - an array with one item [ { name: ..., ... } ]
		let item = doc;

		if (Array.isArray(doc)) {
			assert(doc.length === 1, `${file}: expected an array with exactly 1 item`);
			item = doc[0];
		}

		assert(item && typeof item === 'object', `${file}: expected a collection object`);
		assert(typeof item.name === 'string' && item.name.trim(), `${file}: missing collection "name"`);

		collections.push(item);
	}

	// Validate unique names
	const names = new Set();
	for (const c of collections) {
		assert(!names.has(c.name), `Duplicate collection name "${c.name}"`);
		names.add(c.name);
	}

	const combined = {
		...base,
		collections
	};

	const header =
		'# yaml-language-server: $schema=https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json\n\n';
	const outYaml = header + YAML.stringify(combined);

	await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
	await fs.writeFile(OUT_PATH, outYaml, 'utf8');

	console.log(`Wrote ${path.relative(ROOT, OUT_PATH)} from cms/base.yml + cms/collections/*.yml`);
}

main().catch((err) => {
	console.error(err?.stack ?? String(err));
	process.exit(1);
});
