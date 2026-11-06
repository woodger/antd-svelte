import { getContext, setContext } from 'svelte';
import {
  createDesignTokenState,
  defaultThemeConfig,
  hasSourceTheme,
  mergeThemeConfig
} from './theme-config.engine';
import type { DesignTokenContext, ThemeTokenResult } from './theme-context.types';
import type { ThemeConfig } from './types';

const designTokenKey = Symbol('ant-design-tokens');
let defaultState: ReturnType<typeof createDesignTokenState> | undefined;
const defaultContext: DesignTokenContext = {
  config: defaultThemeConfig,
  enabled: false,
  get state() {
    return defaultState ??= createDesignTokenState(defaultThemeConfig);
  },
  style: undefined
};

export function useDesignTokenContext(): DesignTokenContext {
  return getContext<DesignTokenContext | undefined>(designTokenKey) ?? defaultContext;
}

/** Локальная theme создаёт scope, отсутствующая theme сохраняет родительский token/state. */
export function provideDesignTokens(
  getTheme: () => ThemeConfig | undefined,
  id: string,
  getElement?: () => HTMLElement | undefined
) {
  const parent = useDesignTokenContext();
  const config = $derived(mergeThemeConfig(getTheme(), parent.config, id));
  const enabled = $derived(hasSourceTheme(getTheme()) || parent.enabled);
  const state = $derived(getTheme() ? createDesignTokenState(config) : parent.state);
  const context: DesignTokenContext = {
    get element() { return getElement?.() ?? parent.element; },
    get config() { return config; },
    get enabled() { return enabled; },
    get state() { return state; },
    get style() { return enabled ? state.style : undefined; }
  };
  setContext(designTokenKey, context);

  return context;
}

/** Вызывается при инициализации; getter-поля читаются реактивно без повторного getContext. */
export function useToken(): ThemeTokenResult {
  const context = useDesignTokenContext();

  return {
    get theme() { return context.state.theme; },
    get token() { return context.state.token; },
    get hashId() { return context.state.hashId; },
    get cssVar() { return context.state.cssVar; }
  };
}
