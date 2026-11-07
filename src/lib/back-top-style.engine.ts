import template from './vendor/back-top.css.js';
import { hashTokenString } from './theme-hash.engine';
import type { AliasToken } from './theme-token.types';

/** Runtime UMD CSS сохраняет media screenMD/screenXS; private scope изолирует соседние темы. */
export function getBackTopStyle(
  prefix: string,
  token: Pick<AliasToken, 'screenMD' | 'screenXS'>
) {
  const md = Number(token.screenMD);
  const xs = Number(token.screenXS);
  const scope = `ant-svelte-back-top-${hashTokenString(`${prefix},${md},${xs}`)}`;
  const css = template
    .replace(/(\.ant-back-top-css-var|\.ant-back-top(?![-\w]))/g,
      (_, root: string) => `${root}:where(.${scope})`)
    .replace(/\.ant-back-top(?!-css-var\b)/g, () => `.${prefix}`)
    .replace(/"ant-back-top"/g, () => `"${prefix}"`)
    .replace(/" ant-back-top"/g, () => `" ${prefix}"`)
    .replace(/@media \(max-width:\s*(768|480)px\)/g,
      (_, size: string) => `@media (max-width: ${size === '768' ? md : xs}px)`)
    .replace(/<\/style/gi, '<\\/style');

  return { scope, css };
}
