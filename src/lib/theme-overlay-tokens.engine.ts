import type { AliasToken } from './theme-token.types';

function prepareArrowTokens(token: AliasToken) {
  const { sizePopupArrow, borderRadiusXS, borderRadiusOuter } = token;
  const unitWidth = sizePopupArrow / 2;
  const ax = 0;
  const ay = unitWidth;
  const bx = borderRadiusOuter / Math.sqrt(2);
  const by = unitWidth - borderRadiusOuter * (1 - 1 / Math.sqrt(2));
  const cx = unitWidth - borderRadiusXS * (1 / Math.sqrt(2));
  const cy = borderRadiusOuter * (Math.sqrt(2) - 1) + borderRadiusXS * (1 / Math.sqrt(2));
  const dx = 2 * unitWidth - cx;
  const ex = 2 * unitWidth - bx;
  const fx = 2 * unitWidth - ax;
  const polygonOffset = borderRadiusOuter * (Math.sqrt(2) - 1);

  return {
    arrowShadowWidth: unitWidth * Math.sqrt(2) + borderRadiusOuter * (Math.sqrt(2) - 2),
    arrowPath: `path('M ${ax} ${ay} A ${borderRadiusOuter} ${borderRadiusOuter} 0 0 0 ${bx} ${by} L ${cx} ${cy} A ${borderRadiusXS} ${borderRadiusXS} 0 0 1 ${dx} ${cy} L ${ex} ${by} A ${borderRadiusOuter} ${borderRadiusOuter} 0 0 0 ${fx} ${ay} Z')`,
    arrowPolygon: `polygon(${polygonOffset}px 100%, 50% ${polygonOffset}px, ${
      2 * unitWidth - polygonOffset
    }px 100%, ${polygonOffset}px 100%)`
  };
}

function prepareArrowOffsets(contentRadius: number) {
  return {
    arrowOffsetHorizontal: contentRadius > 12 ? contentRadius + 2 : 12,
    arrowOffsetVertical: 8
  };
}

export function prepareTooltipTokens(token: AliasToken) {
  return {
    zIndexPopup: token.zIndexPopupBase + 70,
    maxWidth: 250,
    ...prepareArrowOffsets(token.borderRadius),
    ...prepareArrowTokens({ ...token, borderRadiusOuter: Math.min(token.borderRadiusOuter, 4) })
  };
}

export function preparePopoverTokens(token: AliasToken) {
  const titlePaddingBlock = (token.controlHeight - token.fontHeight) / 2;

  return {
    titleMinWidth: 177,
    zIndexPopup: token.zIndexPopupBase + 30,
    ...prepareArrowTokens(token),
    ...prepareArrowOffsets(token.borderRadiusLG),
    innerPadding: token.wireframe ? 0 : 12,
    titleMarginBottom: token.wireframe ? 0 : token.marginXS,
    titlePadding: token.wireframe
      ? `${titlePaddingBlock}px ${token.padding}px ${titlePaddingBlock - token.lineWidth}px`
      : 0,
    titleBorderBottom: token.wireframe
      ? `${token.lineWidth}px ${token.lineType} ${token.colorSplit}` : 'none',
    innerContentPadding: token.wireframe ? `${token.paddingSM}px ${token.padding}px` : 0
  };
}

export function preparePopconfirmTokens(token: AliasToken) {
  return { zIndexPopup: token.zIndexPopupBase + 60 };
}
