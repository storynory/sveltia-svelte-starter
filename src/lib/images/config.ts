// typescript helper based on config.json as source of truth
//
import raw from './config.json';

export type ImageConfig = {
	widths: number[];
	fallback: { enabled: boolean; width: number; format: string };
	defaultSizes?: string;
};

export const IMAGE_CONFIG = raw as ImageConfig;
