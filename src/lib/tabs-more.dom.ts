/** CSS motion меняет client rect; popup выравнивается по исходному border box. */
export function getTabsMoreSize(element: HTMLElement) {
  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  const number = (value: string) => Number.parseFloat(value) || 0;
  const width = Number.parseFloat(style.width);
  const height = Number.parseFloat(style.height);
  const contentBox = style.boxSizing === 'content-box';

  return {
    width: Number.isFinite(width) ? width + (contentBox
      ? number(style.paddingLeft) + number(style.paddingRight)
        + number(style.borderLeftWidth) + number(style.borderRightWidth) : 0) : element.offsetWidth,
    height: Number.isFinite(height) ? height + (contentBox
      ? number(style.paddingTop) + number(style.paddingBottom)
        + number(style.borderTopWidth) + number(style.borderBottomWidth) : 0) : element.offsetHeight
  };
}
