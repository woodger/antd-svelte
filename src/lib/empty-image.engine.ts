import { FastColor } from './fast-color.engine';
import type { AliasToken } from './theme-token.types';

/** Source empty/utils.getAsSolidColor: CSS variables не композируются заранее. */
function solidColor(color: string, background: string) {
  return color?.startsWith('var(') || background?.startsWith('var(')
    ? color : new FastColor(color).onBackground(background).toHexString();
}

/** Built-in SVG использует глобальные tokens, независимо от component aliases Empty. */
export function resolveEmptyImageColors(
  token: Pick<AliasToken,
    'colorBgContainer' | 'colorFill' | 'colorFillSecondary' | 'colorFillTertiary'
    | 'colorFillQuaternary' | 'colorTextQuaternary'
  >,
  simple: boolean
): Record<string, string> {
  const background = token.colorBgContainer;

  return simple ? {
    border: solidColor(token.colorFill, background),
    shadow: solidColor(token.colorFillTertiary, background),
    content: solidColor(token.colorFillQuaternary, background)
  } : {
    panel: solidColor(token.colorFillTertiary, background),
    border: solidColor(token.colorTextQuaternary, background),
    detail: solidColor(token.colorFill, background),
    shadow: solidColor(token.colorFillSecondary, background),
    icon: background
  };
}
