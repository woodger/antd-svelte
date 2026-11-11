import 'antd-svelte/styles.css';
import { hydrate, tick, unmount } from 'svelte';
import TreeSelectRootCase from './TreeSelectRootCase.svelte';
import { treeSelectRootSamples } from './tree-select-root-cases';

declare global {
  interface Window {
    treeSelectRootHydration?: { field: Element | null; native: Element | null; dispose: () => Promise<void>; };
  }
}
const id = new URL(import.meta.url).searchParams.get('sample')!;
const target = document.getElementById('root')!;
const field = target.querySelector('[data-root-probe]');
const native = field?.closest('.root-own') ?? field;
const instance = hydrate(TreeSelectRootCase, { target, recover: false,
  props: { sample: treeSelectRootSamples.find(sample => sample.id === id)! } });
await tick();
window.treeSelectRootHydration = { field, native, dispose: () => unmount(instance) };
