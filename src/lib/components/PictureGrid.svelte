<script lang="ts">
	import { webpSrcset, fallbackSrc, getMeta } from '$lib/images/image-helpers';

	let {
		src,
		alt = '',
		priority = false
	} = $props<{
		src: string;
		alt?: string;
		priority?: boolean;
	}>();

	const meta = $derived(() => getMeta(src));

	const loading = $derived(() => (priority ? 'eager' : 'lazy'));
	const fetchPriority = $derived(() => (priority ? 'high' : 'auto'));
</script>

<picture>
	<source
		srcset={webpSrcset(src)}
		sizes="
		(min-width: 1200px) 33vw,
		(min-width: 768px) 50vw,
		320px
	"
		type="image/avif"
	/>

	<source
		srcset={webpSrcset(src)}
		sizes="
		(min-width: 1200px) 33vw,
		(min-width: 768px) 50vw,
		320px
	"
		type="image/webp"
	/>

	<img
		src={fallbackSrc(src)}
		{alt}
		loading={loading()}
		fetchpriority={fetchPriority()}
		decoding="async"
		width={meta()?.width}
		height={meta()?.height}
	/>
</picture>
