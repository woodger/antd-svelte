import type { AliasToken } from './theme-token.types';

export function prepareCascaderTokens(token: AliasToken) {
  const padding = Math.round((token.controlHeight - token.fontSize * token.lineHeight) / 2);

  return {
    controlWidth: 184,
    controlItemWidth: 111,
    dropdownHeight: 180,
    optionSelectedBg: token.controlItemBgActive,
    optionSelectedFontWeight: token.fontWeightStrong,
    optionPadding: `${padding}px ${token.paddingSM}px`,
    menuPadding: token.paddingXXS,
    optionSelectedColor: token.colorText
  };
}
