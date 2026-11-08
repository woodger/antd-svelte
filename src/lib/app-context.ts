import { getContext, setContext } from 'svelte';
import type { AppInstance, AppOptions } from './app.types';

const appKey = Symbol('ant-app-api');
const optionsKey = Symbol('ant-app-options');

export function provideApp(api: AppInstance, options: Readonly<AppOptions>) {
  setContext(appKey, api);
  setContext(optionsKey, options);
}

export function useAppOptions(): Readonly<AppOptions> | undefined {
  return getContext(optionsKey);
}

/** Вызывается при инициализации дочернего компонента под App, в том числе в SSR. */
export function useApp(): AppInstance {
  const api = getContext<AppInstance | undefined>(appKey);
  if (!api) throw new Error('useApp must be called inside App.');
  return api;
}
