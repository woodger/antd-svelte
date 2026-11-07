import { render } from 'svelte/server';
import BackTopThemeCase from './BackTopThemeCase.svelte';
import type { BackTopThemeSample } from './back-top-theme-presets';

export function renderBackTop(sample: BackTopThemeSample) {
  return render(BackTopThemeCase, { props: { sample }, idPrefix: 'back-top-ssr-' });
}
