import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import TreeSelectNodesFixtures from './TreeSelectNodesFixtures.svelte';

declare global {
  interface Window {
    declaredTreeSelectHydration?: { popup: Element | null; input: Element | null; dispose: () => Promise<void>; };
  }
}

const target = document.getElementById('root')!;
const popup = target.querySelector('[popover]');
const input = target.querySelector('[aria-label="Declared selection"]');
const instance = hydrate(TreeSelectNodesFixtures, { target, recover: false });
await tick();
window.declaredTreeSelectHydration = { popup, input, dispose: () => unmount(instance) };
