import { theme as staticTheme } from './theme.engine';
import { useToken } from './theme-context.svelte';

/** Source theme API; useToken читает текущий ConfigProvider через Svelte context. */
export const theme = { ...staticTheme, useToken };
