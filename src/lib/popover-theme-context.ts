import { getContext, setContext } from 'svelte';

const popconfirmThemeKey = Symbol('ant-popconfirm-theme');

export function providePopconfirmTheme() {
  setContext(popconfirmThemeKey, true);
}

/** Только непосредственный Popover получает Popconfirm tokens; вложенные панели независимы. */
export function consumePopconfirmTheme() {
  const isPopconfirm = getContext<boolean | undefined>(popconfirmThemeKey) ?? false;
  setContext(popconfirmThemeKey, false);
  return isPopconfirm;
}
