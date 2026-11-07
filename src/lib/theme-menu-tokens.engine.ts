import { FastColor } from './fast-color.engine';
import type { AliasToken } from './theme-token.types';
import type { MenuComponentToken } from './theme-component-token.types';

export function prepareMenuTokens(token: AliasToken & Partial<MenuComponentToken>) {
  const {
    colorPrimary,
    colorError,
    colorTextDisabled,
    colorErrorBg,
    colorText,
    colorTextDescription,
    colorBgContainer,
    colorFillAlter,
    lineWidth,
    lineWidthBold,
    controlItemBgActive,
    colorBgTextHover,
    controlHeightLG,
    lineHeight,
    colorBgElevated,
    marginXXS,
    padding,
    fontSize,
    controlHeightSM,
    fontSizeLG,
    colorTextLightSolid,
    colorErrorHover,
  } = token;

  const activeBarWidth = token.activeBarWidth ?? 0;
  const activeBarBorderWidth = token.activeBarBorderWidth ?? lineWidth;
  const itemMarginInline = token.itemMarginInline ?? token.marginXXS;

  const colorTextDark = new FastColor(colorTextLightSolid).setA(0.65).toRgbString();

  return {
    dropdownWidth: 160,
    zIndexPopup: token.zIndexPopupBase + 50,
    itemBorderRadius: token.borderRadiusLG,
    subMenuItemBorderRadius: token.borderRadiusSM,
    itemColor: colorText,
    itemHoverColor: colorText,
    horizontalItemHoverColor: colorPrimary,
    groupTitleColor: colorTextDescription,
    itemSelectedColor: colorPrimary,
    subMenuItemSelectedColor: colorPrimary,
    horizontalItemSelectedColor: colorPrimary,
    itemBg: colorBgContainer,
    itemHoverBg: colorBgTextHover,
    itemActiveBg: controlItemBgActive,
    subMenuItemBg: colorFillAlter,
    itemSelectedBg: controlItemBgActive,
    horizontalItemSelectedBg: 'transparent',
    activeBarWidth,
    activeBarHeight: lineWidthBold,
    activeBarBorderWidth,

    itemDisabledColor: colorTextDisabled,

    dangerItemColor: colorError,
    dangerItemHoverColor: colorError,
    dangerItemSelectedColor: colorError,
    dangerItemActiveBg: colorErrorBg,
    dangerItemSelectedBg: colorErrorBg,

    itemMarginInline,

    horizontalItemBorderRadius: 0,
    horizontalItemHoverBg: 'transparent',
    itemHeight: controlHeightLG,
    groupTitleLineHeight: lineHeight,
    collapsedWidth: controlHeightLG * 2,
    popupBg: colorBgElevated,
    itemMarginBlock: marginXXS,
    itemPaddingInline: padding,
    horizontalLineHeight: `${controlHeightLG * 1.15}px`,
    iconSize: fontSize,
    iconMarginInlineEnd: controlHeightSM - fontSize,
    collapsedIconSize: fontSizeLG,
    groupTitleFontSize: fontSize,

    darkItemDisabledColor: new FastColor(colorTextLightSolid).setA(0.25).toRgbString(),

    darkItemColor: colorTextDark,
    darkDangerItemColor: colorError,
    darkItemBg: '#001529',
    darkPopupBg: '#001529',
    darkSubMenuItemBg: '#000c17',
    darkItemSelectedColor: colorTextLightSolid,
    darkItemSelectedBg: colorPrimary,
    darkDangerItemSelectedBg: colorError,
    darkItemHoverBg: 'transparent',
    darkGroupTitleColor: colorTextDark,
    darkItemHoverColor: colorTextLightSolid,
    darkDangerItemHoverColor: colorErrorHover,
    darkDangerItemSelectedColor: colorTextLightSolid,
    darkDangerItemActiveBg: colorError,

    itemWidth: activeBarWidth
      ? `calc(100% + ${activeBarBorderWidth}px)`
      : `calc(100% - ${itemMarginInline * 2}px)`,
  };
}
