/**
 * Minimal i18n helper.
 *
 * Designed for easy migration to a real i18n library (e.g. svelte-i18n,
 * Paraglide). All translatable strings live in ./de.ts and are accessed
 * via the `t()` function using dot-notation keys.
 *
 * To swap in a real library:
 *   1. Replace the `t` export with the library's equivalent.
 *   2. Keep the translation files in ./de.ts (same shape).
 */

import { de } from './de';

type Obj = Record<string, unknown>;

type DeepKeys<T> = T extends string
	? ''
	: {
			[K in keyof T & string]: T[K] extends string ? K : `${K}.${DeepKeys<T[K]>}`;
		}[keyof T & string];

export type TranslationKey = DeepKeys<typeof de>;

function resolve(obj: Obj, path: string): string {
	const parts = path.split('.');
	let cur: unknown = obj;
	for (const p of parts) {
		if (cur == null || typeof cur !== 'object') return path;
		cur = (cur as Obj)[p];
	}
	return typeof cur === 'string' ? cur : path;
}

/**
 * Translate a key.  Supports simple variable interpolation via `{var}`.
 *
 * @example t('upload.error.invalidFormat', { ext: 'xlsx' })
 */
export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
	let value = resolve(de as unknown as Obj, key);
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			value = value.replaceAll(`{${k}}`, String(v));
		}
	}
	return value;
}
