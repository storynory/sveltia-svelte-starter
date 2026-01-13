<script lang="ts">
	import { formatSrcset, webpSrcset, fallbackSrc, getMeta } from '$lib/images/image-helpers';

	let { src, alt = '' } = $props<{ src: string; alt?: string }>();

	const meta = $derived(() => getMeta(src));
</script>

<picture>
	<!-- AVIF first (used only if generated + supported) -->
	<source
		srcset={formatSrcset(src, 'avif')}
		sizes="(min-width: 1200px) 900px, 85vw"
		type="image/avif"
	/>

	<!-- WebP -->
	<source srcset={webpSrcset(src)} sizes="(min-width: 1200px) 900px, 85vw" type="image/webp" />

	<img
		src={fallbackSrc(src)}
		{alt}
		loading="eager"
		fetchpriority="high"
		decoding="async"
		width={meta()?.width}
		height={meta()?.height}
	/>
</picture>
