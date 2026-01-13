import imageMeta from '$lib/image-sizes.json';
import { IMAGE_CONFIG } from '$lib/images/config';

type ManifestEntry = {
	width: number;
	height: number;
	sizes?: number[];
	formats?: string[];
};

const manifest = imageMeta as unknown as Record<string, ManifestEntry>;

export function basePath(src: string): string {
	return src.replace(/(\.\d+)?\.[^.]+$/, '');
}

export function getMeta(src: string) {
	return manifest[src] ?? null;
}

export function formatSrcset(src: string, format: string, max?: number) {
	const meta = getMeta(src);
	if (!meta) return '';

	// If manifest tracks formats, honour it. If not, assume the format exists.
	if (meta.formats && !meta.formats.includes(format)) return '';

	const base = basePath(src);
	const widths = meta.sizes?.length ? meta.sizes : IMAGE_CONFIG.widths;
	const sizes = widths.filter((w) => !max || w <= max);

	return sizes.map((w) => `${base}.${w}.${format} ${w}w`).join(', ');
}

// your wrapper (so existing components keep working)
export function webpSrcset(src: string, max?: number) {
	return formatSrcset(src, 'webp', max);
}
export function fallbackSrc(src: string) {
	const base = basePath(src);
	const meta = getMeta(src);

	const { width: cfgWidth, format } = IMAGE_CONFIG.fallback;

	const intrinsic = meta?.width;
	const width =
		typeof intrinsic === 'number' && intrinsic > 0 ? Math.min(cfgWidth, intrinsic) : cfgWidth;

	return `${base}.${width}.${format}`;
}
