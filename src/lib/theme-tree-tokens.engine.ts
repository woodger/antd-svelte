import type { AliasToken } from './theme-token.types';

export function prepareTreeSelectTokens(token: AliasToken) {
  return {
    titleHeight: token.controlHeightSM,
    switcherSize: token.controlHeightSM,
    indentSize: token.controlHeightSM,
    nodeHoverBg: token.controlItemBgHover,
    nodeHoverColor: token.colorText,
    nodeSelectedBg: token.controlItemBgActive,
    nodeSelectedColor: token.colorText
  };
}

export function prepareTreeTokens(token: AliasToken) {
  return {
    ...prepareTreeSelectTokens(token),
    directoryNodeSelectedColor: token.colorTextLightSolid,
    directoryNodeSelectedBg: token.colorPrimary
  };
}
