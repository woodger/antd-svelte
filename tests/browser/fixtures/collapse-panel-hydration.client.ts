import 'antd-svelte/styles.css';
import { hydrate, tick } from 'svelte';
import CollapseLegacyCase from './CollapseLegacyCase.svelte';

declare global {
  interface Window {
    collapsePanelHydration?: {
      frame: Element | null;
      input: HTMLInputElement | null;
      focusedBefore: boolean;
      ready: boolean;
    };
  }
}

const frame = document.querySelector('[aria-label="Legacy sections"]');
const input = frame?.querySelector('input') ?? null;
input?.focus();
if (input) input.value = 'Pre-hydration draft';
input?.setSelectionRange(2, 8);
window.collapsePanelHydration = {
  frame, input, focusedBefore: document.activeElement === input, ready: false
};

hydrate(CollapseLegacyCase, { target: document.getElementById('root')! });
await tick();
window.collapsePanelHydration.ready = true;
