// Ant Design 6.6.8 / @rc-component/select 1.10.1; MIT, vendor/LICENSE.rc-select.
import { splitSelectTokens } from './select-token.engine';
import type { SelectTokenSeparators } from './select.types';

/** TreeSelect tokenization affects search and visibility; it does not select nodes. */
export type TreeSelectTokenSeparators = SelectTokenSeparators;

export function treeSelectTokenWithEnter(separators?: TreeSelectTokenSeparators) {
  return typeof separators === 'function'
    || Boolean(separators?.some(token => token === '\n' || token === '\r\n'));
}

/** Restores the browser-normalized pasted substring for newline tokenization. */
export function treeSelectPastedSearch(
  text: string, pasted: string | undefined, separators?: TreeSelectTokenSeparators
) {
  if (!pasted || !treeSelectTokenWithEnter(separators) || !/[\r\n]/.test(pasted)) return text;
  const normalized = pasted.replace(/[\r\n]+$/, '').replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
  return text.replace(normalized, pasted);
}

export function treeSelectTokenSearch(text: string, options: {
  previousSearch: string;
  separators?: TreeSelectTokenSeparators;
  composing?: boolean;
  fromTyping?: boolean;
}) {
  const { previousSearch, separators, composing, fromTyping = true } = options;
  // rc-tree-select consumes maxCount and does not forward it to BaseSelect search.
  const words = composing ? null : splitSelectTokens(text, separators);
  const split = words !== null;
  const search = split ? '' : text;
  return { search, notifySearch: search !== previousSearch, split,
    open: split ? false : text && fromTyping ? true : undefined };
}
