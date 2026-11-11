import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import TreeSelectVirtualFixtures from './TreeSelectVirtualFixtures.svelte';

declare global {
  interface Window {
    virtualTreeSelectHydration?: { popup: Element | null; dispose: () => Promise<void>; };
  }
}

const target = document.getElementById('root')!;
const popup = target.querySelector('[popover]');
const instance = hydrate(TreeSelectVirtualFixtures, { target, recover: false });
await tick();
window.virtualTreeSelectHydration = { popup, dispose: () => unmount(instance) };
