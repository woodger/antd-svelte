import { useDesignTokenContext } from './theme-context.svelte';
import { componentThemeStyle, type StyledComponent } from './theme-component-style.engine';

/** SSR и реактивный root style перед semantic/user styles; native темы сохраняют старый CSS. */
export function useComponentTheme(component: StyledComponent) {
  const context = useDesignTokenContext();
  const style = $derived(context.enabled
    ? componentThemeStyle(component, context.state.token, context.state.prefix) : undefined);

  return {
    get style() { return style; },
    get className() {
      return context.enabled ? [context.state.key, context.state.hashId].filter(Boolean).join(' ')
        : undefined;
    }
  };
}
