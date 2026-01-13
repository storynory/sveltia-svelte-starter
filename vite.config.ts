import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

	css: {
		transformer: 'lightningcss',

		lightningcss: {
			targets: {
				chrome: 90,
				firefox: 88,
				safari: 15
			},

			drafts: {
				customMedia: true,
				nesting: true
			}
		}
	}
});
