import { hydrate, tick } from 'svelte';
import AlertBoundaryFixtures from './AlertBoundaryFixtures.svelte';

declare global {
  interface Window {
    alertBoundaryHydration?: {
      frame: Element | null;
      input: HTMLInputElement | null;
      focusedBefore: boolean;
      ready: boolean;
    };
  }
}

const frame = document.querySelector('[data-boundary-frame]');
const input = frame?.querySelector('input') ?? null;
input?.focus();
if (input) input.value = 'Pre-hydration draft';
input?.setSelectionRange(2, 8);
window.alertBoundaryHydration = {
  frame, input, focusedBefore: document.activeElement === input, ready: false
};

hydrate(AlertBoundaryFixtures, { target: document.getElementById('root')! });
await tick();
window.alertBoundaryHydration.ready = true;
