export const prerender = true;
export const trailingSlash = 'always';

import {
	getTags,
	getSettingsSite,
	getColorSchemes,
	getTypographyAll
} from '$lib/server/content/api.generated';
import { joinOne } from '$lib/server/content/helpers';
import { defaultColorScheme } from '$lib/theme/defaultScheme';
import { defaultTypography } from '$lib/theme/defaultTypography';

export async function load() {
	const settings = await getSettingsSite();
	const schemes = await getColorSchemes();
	const typographies = await getTypographyAll();
	const tags = await getTags();
	const settingsWithSchemes = joinOne(settings, schemes, {
		field: 'activeColorScheme',
		multiple: false
	});

	const settingsJoined = joinOne(settingsWithSchemes, typographies, {
		field: 'activeTypography',
		multiple: false
	});

	const scheme = settingsJoined.activeColorSchemeObjects ?? defaultColorScheme;
	const typography = settingsJoined.activeTypographyObjects ?? defaultTypography;

	return {
		settings: settingsJoined,
		scheme,
		typography,
		tags
	};
}
