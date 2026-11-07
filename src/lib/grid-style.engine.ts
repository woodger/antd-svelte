import template from './vendor/grid-responsive.css.js';
import { hashTokenString } from './theme-hash.engine';
import type { AliasToken } from './theme-token.types';

const mediaTokens = [
  'screenSMMin', 'screenMDMin', 'screenLGMin', 'screenXLMin', 'screenXXLMin', 'screenXXXLMin'
] as const;
const defaults = [576, 768, 992, 1200, 1600, 1920] as const;
type GridMediaTokens = Pick<AliasToken, typeof mediaTokens[number]>;

/** Порог xs безусловен; отдельный scope не зависит от пользовательских cssVar.key/hashed. */
export function getGridMediaScope(token: GridMediaTokens): string | undefined {
  const sizes = mediaTokens.map(key => Number(token[key]));
  if (sizes.every((size, index) => size === defaults[index])) return undefined;

  return `ant-grid-media-${hashTokenString(sizes.join(','))}`;
}

/** Полный source Col CSS заменяет default media, включая base/xs и нулевые reset-классы. */
export function getGridMediaCss(token: GridMediaTokens): string | undefined {
  const scope = getGridMediaScope(token);
  if (!scope) return undefined;

  return template.replace(/__ANT_GRID_MEDIA_SCOPE__/g, scope).replace(
    /@media \(min-width: (576|768|992|1200|1600|1920)px\)/g,
    (_, size: string) => {
      const index = defaults.indexOf(Number(size) as typeof defaults[number]);

      return `@media (min-width: ${Number(token[mediaTokens[index]])}px)`;
    }
  );
}
