import { DerivativeTheme } from './theme-derivative';

/** Murmur2 @emotion/hash 0.8.0: исходная byte-маска и намеренный fallthrough. */
export function hashTokenString(value: string): string {
  let hash = 0;
  let part: number;
  let index = 0;
  let length = value.length;

  for (; length >= 4; ++index, length -= 4) {
    part = (value.charCodeAt(index) & 0xff)
      | ((value.charCodeAt(++index) & 0xff) << 8)
      | ((value.charCodeAt(++index) & 0xff) << 16)
      | ((value.charCodeAt(++index) & 0xff) << 24);
    part = (part & 0xffff) * 0x5bd1e995 + (((part >>> 16) * 0xe995) << 16);
    part ^= part >>> 24;
    hash = ((part & 0xffff) * 0x5bd1e995 + (((part >>> 16) * 0xe995) << 16))
      ^ ((hash & 0xffff) * 0x5bd1e995 + (((hash >>> 16) * 0xe995) << 16));
  }

  switch (length) {
    case 3:
      hash ^= (value.charCodeAt(index + 2) & 0xff) << 16;
    case 2:
      hash ^= (value.charCodeAt(index + 1) & 0xff) << 8;
    case 1:
      hash ^= value.charCodeAt(index) & 0xff;
      hash = (hash & 0xffff) * 0x5bd1e995 + (((hash >>> 16) * 0xe995) << 16);
  }

  hash ^= hash >>> 13;
  hash = (hash & 0xffff) * 0x5bd1e995 + (((hash >>> 16) * 0xe995) << 16);

  return ((hash ^ (hash >>> 15)) >>> 0).toString(36);
}

const flattened = new WeakMap<object, string>();

/** Порядок ключей и nested Theme.id участвуют в token key, как в cssinjs. */
export function flattenToken(token: object): string {
  const cached = flattened.get(token);
  if (cached) return cached;

  let value = '';
  for (const [key, item] of Object.entries(token)) {
    value += key;
    if (item instanceof DerivativeTheme) value += item.id;
    else if (item && typeof item === 'object') value += flattenToken(item);
    else value += item;
  }

  const result = hashTokenString(value);
  flattened.set(token, result);

  return result;
}

export function tokenToKey(token: object, salt: string): string {
  return hashTokenString(`${salt}_${flattenToken(token)}`);
}
