import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import TreeSelectTriggerCase from './TreeSelectTriggerCase.svelte';
import { treeSelectTriggerSamples } from './tree-select-trigger-cases';
declare global {
  interface Window {
    treeSelectTriggerHydration?: { input: Element | null; root: Element | null; dispose: () => Promise<void>; };
  }
}
const target = document.getElementById('root')!;
const input = target.querySelector('[aria-label="Trigger selection"]');
const root = target.querySelector('.ant-select');
const instance = hydrate(TreeSelectTriggerCase, { target, recover: false,
  props: { sample: treeSelectTriggerSamples.find(entry => entry.id === 'autofocus-open')! } });
await tick();
window.treeSelectTriggerHydration = { input, root, dispose: () => unmount(instance) };
