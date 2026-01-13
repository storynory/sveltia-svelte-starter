<script lang="ts">
	import { basePath, getMeta } from '$lib/images/image-helpers';

	let { src, alt = '' } = $props<{ src: string; alt?: string }>();

	const meta = $derived(() => getMeta(src));
	const base = $derived(() => basePath(src));

	const w = $derived(() => {
		const m = meta();
		if (!m) return 320;
		const sizes = m.sizes?.length ? m.sizes : [320];
		return sizes[0]; // smallest generated size (either 320 or intrinsic if smaller)
	});
</script>

<img
	src={`${base()}.${w()}.webp`}
	{alt}
	width={meta()?.width}
	height={meta()?.height}
	loading="lazy"
	decoding="async"
	style="width: 200px; height: auto;"
/>
