// /scripts/process-images.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const CONFIG_PATH = path.resolve('src/lib/images/config.json');

async function loadConfig() {
	const raw = await fs.readFile(CONFIG_PATH, 'utf8');
	return JSON.parse(raw);
}

function sha1(buf) {
	return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 10);
}

async function* walk(dir) {
	let entries = [];
	try {
		entries = await fs.readdir(dir, { withFileTypes: true });
	} catch {
		return;
	}

	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(full);
		else yield full;
	}
}

function stripExt(file) {
	return file.replace(/\.[^.]+$/, '');
}

function normaliseSlashes(p) {
	return p.replace(/\\/g, '/');
}

function makeOutPath(outDir, rel, width, ext) {
	const name = stripExt(rel);
	return path.join(outDir, `${name}.${width}.${ext}`);
}

/**
 * Choose the widths we will *name* and *record* for this image.
 * If the image is smaller than the smallest configured width, we fall back to the intrinsic width
 * so we still generate one sensible variant (and filenames match reality).
 */
function pickGeneratedSizes(intrinsicWidth, widths) {
	if (typeof intrinsicWidth !== 'number' || intrinsicWidth <= 0) return widths;

	const ok = widths.filter((w) => w <= intrinsicWidth);
	if (ok.length === 0) return [intrinsicWidth];

	return ok;
}

async function fileExists(p) {
	try {
		await fs.stat(p);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	const cfg = await loadConfig();

	const SRC = cfg.srcDir ?? './uploads';
	const OUT = cfg.outDir ?? './static/uploads';
	const INPUT_EXTS = new Set(cfg.inputExts ?? ['.jpg', '.jpeg', '.png', '.webp']);

	const WIDTHS = cfg.widths ?? [320, 640, 960];
	const formats = cfg.formats ?? { webp: { enabled: true, quality: 80 } };

	const fallback = cfg.fallback ?? {
		enabled: true,
		format: 'jpg',
		width: 640,
		quality: 82,
		mozjpeg: true
	};

	const CACHE_FILE = cfg.cacheFile ?? '.image-cache.json';
	const META_FILE = cfg.metaFile ?? './src/lib/image-sizes.json';

	let cache = {};
	try {
		cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
	} catch {
		cache = {};
	}

	let metaMap = {};
	try {
		metaMap = JSON.parse(await fs.readFile(META_FILE, 'utf8'));
	} catch {
		metaMap = {};
	}

	let built = 0;
	let skipped = 0;
	let warnedAlpha = 0;

	async function saveState() {
		await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
		await fs.writeFile(META_FILE, JSON.stringify(metaMap, null, 2));
	}

	async function processOne(file) {
		const rel = path.relative(SRC, file);
		const ext = path.extname(file).toLowerCase();
		if (!INPUT_EXTS.has(ext)) return;

		const buf = await fs.readFile(file);
		const digest = sha1(buf);

		if (cache[rel] === digest) {
			skipped++;
			return;
		}

		const img = sharp(buf).rotate();
		const meta = await img.metadata();

		// record intrinsic size under original path
		const webPath =
			'/uploads/' + normaliseSlashes(rel).split('/').map(encodeURIComponent).join('/');

		const intrinsicW = meta.width ?? null;
		const intrinsicH = meta.height ?? null;

		// full manifest entry for downstream Picture components
		metaMap[webPath] = {
			width: intrinsicW,
			height: intrinsicH,
			sizes: pickGeneratedSizes(intrinsicW, WIDTHS),
			formats: []
		};

		// variants for enabled formats (webp/avif)
		for (const [fmt, opts] of Object.entries(formats)) {
			if (!opts?.enabled) continue;

			const q = Number(opts.quality ?? 80);

			// record that we generated this format
			metaMap[webPath].formats.push(fmt);

			for (const widthPx of metaMap[webPath].sizes) {
				// ensure filenames reflect the actual output width (no ".320" files that are really 220px)
				const outWidth = typeof intrinsicW === 'number' ? Math.min(widthPx, intrinsicW) : widthPx;

				const pipeline = img.clone().resize({ width: outWidth, withoutEnlargement: true });

				// decide encoder first; ignore unknown formats
				let write;
				if (fmt === 'webp') {
					write = (p) => p.webp({ quality: q });
				} else if (fmt === 'avif') {
					write = (p) => p.avif({ quality: q });
				} else {
					continue;
				}

				const out = makeOutPath(OUT, rel, outWidth, fmt);
				const tmp = out + '.tmp';
				await fs.mkdir(path.dirname(out), { recursive: true });

				await write(pipeline).toFile(tmp);
				await fs.rename(tmp, out);
			}
		}

		// single fallback (usually jpg 640)
		if (fallback?.enabled) {
			const fbWidth = Number(fallback.width ?? 640);
			let fbFormat = String(fallback.format ?? 'jpg').toLowerCase();

			// JPEG can't do alpha; switch to png if needed
			if ((fbFormat === 'jpg' || fbFormat === 'jpeg') && meta.hasAlpha) {
				fbFormat = 'png';
				warnedAlpha++;
			}

			// ensure fallback filename reflects actual output width
			const outFbWidth = typeof intrinsicW === 'number' ? Math.min(fbWidth, intrinsicW) : fbWidth;

			const out = makeOutPath(OUT, rel, outFbWidth, fbFormat);
			const tmp = out + '.tmp';
			await fs.mkdir(path.dirname(out), { recursive: true });

			const pipeline = img.clone().resize({ width: outFbWidth, withoutEnlargement: true });

			if (fbFormat === 'jpg' || fbFormat === 'jpeg') {
				const q = Number(fallback.quality ?? 82);
				const mozjpeg = Boolean(fallback.mozjpeg ?? true);
				await pipeline.jpeg({ quality: q, mozjpeg }).toFile(tmp);
			} else if (fbFormat === 'png') {
				await pipeline.png({ compressionLevel: 9 }).toFile(tmp);
			} else if (fbFormat === 'webp') {
				const q = Number(fallback.quality ?? 80);
				await pipeline.webp({ quality: q }).toFile(tmp);
			}

			if (await fileExists(tmp)) {
				await fs.rename(tmp, out);
			}
		}

		cache[rel] = digest;
		built++;
		console.log('built:', rel);
	}

	for await (const file of walk(SRC)) {
		await processOne(file);
	}

	await saveState();
	console.log(`done — built ${built}, skipped ${skipped}`);

	if (warnedAlpha > 0) {
		console.log(`note — ${warnedAlpha} image(s) had alpha; wrote PNG fallback instead of JPG.`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
