<script lang="ts">
	import { formatSrcset, webpSrcset, fallbackSrc, getMeta } from '$lib/images/image-helpers';

	let { src, alt = '' } = $props<{ src: string; alt?: string }>();
	const meta = $derived(() => getMeta(src));
</script>

<picture>
	<!-- AVIF first: browsers that support it will pick this -->
	<source
		srcset={formatSrcset(src, 'avif', 640)}
		sizes="(min-width: 1024px) 240px, 40vw"
		type="image/avif"
	/>

	<!-- WebP fallback -->
	<source srcset={webpSrcset(src, 640)} sizes="(min-width: 1024px) 240px, 40vw" type="image/webp" />

	<img
		src={fallbackSrc(src)}
		{alt}
		loading="lazy"
		decoding="async"
		width={meta()?.width}
		height={meta()?.height}
	/>
</picture>
