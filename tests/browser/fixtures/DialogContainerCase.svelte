<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider,
    Drawer,
    Modal,
    type ConfigProviderProps,
    type GetContainer
  } from 'antd-svelte';
  import type { DialogContainerCase } from './dialog-container-presets';
  import DialogContainerContents from './DialogContainerContents.svelte';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    nested = false,
    motion = false,
    staging = 'none',
    onCall
  }: {
    sample: DialogContainerCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    nested?: boolean;
    motion?: boolean;
    staging?: 'none' | 'element' | 'fragment';
    onCall?: () => void;
  } = $props();
  let opened = $state(untrack(() => Boolean(sample.initial)));
  let shadow = $state<ShadowRoot>();
  let calls = $state<{ getter: string; args: number; tag: string; body: boolean; }[]>([]);
  let closes = $state(0);
  const stagingNode = untrack(() => typeof document === 'undefined' ? undefined
    : staging === 'fragment' ? document.createDocumentFragment()
      : staging === 'element' ? document.createElement('div') : undefined);
  let parentOptions = $derived.by(() => {
    void revision;
    const props: Partial<ConfigProviderProps> = {};
    if (sample.parent !== 'none') {
      props.getPopupContainer = getter('parent', alternate ? 'child' : sample.parent ?? 'parent');
    }
    return props;
  });
  let childOptions = $derived.by(() => {
    void revision;
    const props: Partial<ConfigProviderProps> = {};
    if (sample.child) {
      props.getPopupContainer = sample.child === 'undefined' ? undefined : getter('child', 'child');
    }
    if (sample.resetTheme) props.theme = { inherit: false, token: { motion: false } };
    return props;
  });
  let localOptions = $derived.by(() => {
    void revision;
    const props: { getContainer?: GetContainer; } = {};
    if (staging !== 'none') {
      props.getContainer = () => stagingNode!;
      return props;
    }
    if (!sample.local) return props;

    const target = alternate ? 'child' : sample.local;
    if (sample.local === 'undefined') props.getContainer = undefined;
    else if (sample.local === 'inline') props.getContainer = false;
    else if (sample.local === 'element') {
      // Не читается при SSR: исходные DOM-узлы доступны после mount fixture.
      props.getContainer = alternate ? childElement : localElement;
    } else if (sample.local === 'selector') props.getContainer = `#panel-${alternate ? 'child' : 'local'}`;
    else if (sample.local === 'empty-selector') props.getContainer = '';
    else if (sample.local === 'missing-selector') props.getContainer = '#panel-never';
    else props.getContainer = () => get('local', target, [])!;
    return props;
  });
  let localElement = $state<HTMLDivElement>();
  let childElement = $state<HTMLDivElement>();

  function getter(name: string, target: string) {
    return (...args: [HTMLElement?]) => get(name, target, args)!;
  }
  function get(getter: string, target: string, args: [HTMLElement?]) {
    untrack(() => {
      onCall?.();
      calls.push({
        getter,
        args: args.length,
        tag: args[0]?.tagName.toLowerCase() ?? 'none',
        body: args[0] === document.body
      });
    });
    if (target === 'empty-result') return undefined;
    if (nested && args[0] && args[0] !== document.body) return args[0].parentElement ?? document.body;
    return target === 'shadow' ? shadow ?? document.body
      : document.getElementById(`panel-${target}`) ?? document.body;
  }
</script>

<div id="panel-parent" data-panel-container="parent"></div>
<div id="panel-child" data-panel-container="child" bind:this={childElement}></div>
<div id="panel-local" data-panel-container="local" bind:this={localElement}></div>
<div id="panel-shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  const style = element.ownerDocument.createElement('style');
  root.append(style);
  function syncStyle() {
    const css = Array.from(element.ownerDocument.head.querySelectorAll('style'))
      .map(node => node.textContent).join('\n');
    if (style.textContent !== css) style.textContent = css;
  }
  const observer = new MutationObserver(syncStyle);
  observer.observe(element.ownerDocument.head, {
    childList: true,
    subtree: true,
    characterData: true
  });
  syncStyle();
  shadow = root;
  return () => observer.disconnect();
}}></div>
<button type="button" onclick={() => opened = true}>Open container panel</button>
<div id="panel-staging-host"></div>
<button type="button" onclick={() => {
  if (stagingNode) document.getElementById('panel-staging-host')!.append(stagingNode);
}}>Connect staged panel</button>
<button type="button" onclick={() => {
  if (stagingNode instanceof Element) stagingNode.remove();
}}>Disconnect staged panel</button>
<div id="panel-host">
  <ConfigProvider {...parentOptions} direction={sample.rtl ? 'rtl' : undefined}
    style={`--panel-origin:${dark ? 'dark' : 'light'}`}
    theme={{ mode: dark ? 'dark' : 'light', token: { motion } }}>
    <ConfigProvider {...childOptions}>
      {#if mounted}
        {#if sample.component === 'modal'}
          <Modal {...localOptions} bind:open={opened} title="Container panel"
            onCancel={() => closes++}>
            <DialogContainerContents {nested} />
          </Modal>
        {:else}
          <Drawer {...localOptions} bind:open={opened} title="Container panel"
            forceRender={sample.force} destroyOnHidden={sample.destroy} onClose={() => closes++}>
            <DialogContainerContents {nested} />
          </Drawer>
        {/if}
      {/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
<button type="button" onclick={() => opened = false}>Close container panel</button>
<output aria-label="Panel container calls">{JSON.stringify(calls)}</output>
<output aria-label="Panel container closes">{closes}</output>
<output aria-label="Panel container open">{String(opened)}</output>
