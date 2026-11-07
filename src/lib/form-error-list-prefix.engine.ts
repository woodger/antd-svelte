/** Только explain styles Form; prefix списка не меняет оформление соседних FormItem. */
export function getFormErrorListPrefixCss(prefix: string) {
  if (prefix === 'ant-form') return undefined;

  return `
.${prefix}-item .${prefix}-item-explain{clear:both;color:var(--ant-color-text-description);font-size:var(--ant-font-size);line-height:var(--ant-line-height);}
.${prefix}-item .${prefix}-item-explain-error{color:var(--ant-color-error);}
.${prefix}-item .${prefix}-item-explain-warning{color:var(--ant-color-warning);}
`.replace(/<\/style/gi, '<\\/style');
}
