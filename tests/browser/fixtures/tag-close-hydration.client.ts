import { hydrate, tick } from 'svelte';
import TagCloseCase from './TagCloseCase.svelte';
import reference from './ant-design-tag-close-reference.json';
import type { TagCloseCase as Sample } from './tag-close-presets';

declare global {
  interface Window {
    tagCloseHydration?: {
      root: Element | null;
      close: HTMLButtonElement | null;
      focusedBefore: boolean;
      ready: boolean;
    };
  }
}

const name = new URL(location.href).searchParams.get('name');
const sample = reference.cases.find(sample => sample.name === name);
if (!sample) throw new Error(`Unknown Tag hydration case: ${name}`);

const root = document.querySelector('[data-tag-api-root]');
const close = document.querySelector<HTMLButtonElement>('.ant-tag-close-icon');
close?.focus();
window.tagCloseHydration = {
  root,
  close,
  focusedBefore: document.activeElement === close,
  ready: false
};

hydrate(TagCloseCase, {
  target: document.getElementById('root')!,
  props: { sample: sample as Sample }
});
await tick();
window.tagCloseHydration.ready = true;
