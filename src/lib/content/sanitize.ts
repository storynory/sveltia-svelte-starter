import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import type { WindowLike } from 'dompurify';

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window as unknown as WindowLike);

export function sanitizeHtml(dirtyHtml: string): string {
	return DOMPurify.sanitize(dirtyHtml, {
		ALLOWED_TAGS: [
			'p',
			'br',
			'hr',
			'blockquote',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'ol',
			'li',
			'em',
			'strong',
			'del',
			'code',
			'pre',
			'a',
			'img'
		],
		ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height'],
		FORBID_TAGS: [
			'span',
			'style',
			'script',
			'iframe',
			'object',
			'embed',
			'form',
			'input',
			'button',
			'textarea',
			'select'
		],
		FORBID_ATTR: ['style', 'class', 'id', 'srcset', 'sizes'],
		ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/(?!\/))/i
	}) as string;
}

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if ((node as Element).tagName === 'A') {
		const el = node as unknown as HTMLAnchorElement;
		if (el.getAttribute('target') === '_blank') {
			const rel = (el.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean);
			for (const v of ['noopener', 'noreferrer']) {
				if (!rel.includes(v)) rel.push(v);
			}
			el.setAttribute('rel', rel.join(' '));
		}
	}
});
