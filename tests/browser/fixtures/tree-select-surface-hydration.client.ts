import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import TreeSelectSurfaceScope from './TreeSelectSurfaceScope.svelte';
import { treeSelectSurfaceSamples } from './tree-select-surface-cases';

declare global {
  interface Window {
    treeSelectPopupHydration?: {
      popup: HTMLElement;
      editor: HTMLInputElement;
      draft: HTMLInputElement;
      dispose: () => Promise<void>;
    };
  }
}

const target = document.getElementById('root')!;
const popup = target.querySelector<HTMLElement>('.ant-select-dropdown')!;
const editor = target.querySelector<HTMLInputElement>('input[role="combobox"]')!;
const draft = target.querySelector<HTMLInputElement>('[data-surface-draft]')!;
const sample = { ...treeSelectSurfaceSamples.find(entry => entry.id === 'popup-wrap')!, defaultOpen: true };
const instance = hydrate(TreeSelectSurfaceScope, { target, props: { sample }, recover: false });
await tick();
window.treeSelectPopupHydration = { popup, editor, draft, dispose: () => unmount(instance) };
