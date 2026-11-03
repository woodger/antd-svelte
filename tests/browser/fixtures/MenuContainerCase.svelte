<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider,
    Menu,
    type ConfigProviderProps,
    type MenuItemType,
    type MenuProps
  } from 'antd-svelte';
  import type { MenuContainerCase } from './menu-container-presets';
  import MenuContainerLabel from './MenuContainerLabel.svelte';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    hover = false,
    extraForce = false,
    disabled = false,
    link = false,
    onCall
  }: {
    sample: MenuContainerCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    hover?: boolean;
    extraForce?: boolean;
    disabled?: boolean;
    link?: boolean;
    onCall?: () => void;
  } = $props();
  const items: readonly MenuItemType[] = [{
    key: 'p',
    label: 'Projects',
    children: [
      { key: 'a', label: alpha },
      { key: 'n', label: 'Nested', children: [{ key: 'l', label: leaf }] },
      { key: 'blocked', label: 'Blocked', disabled: true }
    ]
  }, { key: 'help', label: 'Help' }];
  let instance = $state<Menu>();
  let nativeRoot = $state<HTMLUListElement>();
  let shadow = $state<ShadowRoot>();
  let calls = $state<{
    getter: string;
    args: number;
    tag: string;
    key: string | null;
    title: string;
  }[]>([]);
  let opened = $state<string[][]>([]);
  let clicked = $state<{ key: string; keyPath: string[]; }[]>([]);
  let selected = $state<string[][]>([]);
  let keys = $state<string[]>([]);
  let keyTargets = $state<boolean[]>([]);
  let domEvents = $state<{ target: string; type: string; }[]>([]);
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
    const props: Pick<MenuProps, 'getPopupContainer'> = {};
    if (sample.local) {
      props.getPopupContainer = sample.local === 'undefined' ? undefined
        : getter('local', alternate ? 'child' : sample.local);
    }
    return props;
  });

  function getter(name: string, target: string) {
    return sample.zero ? (...args: [HTMLElement?]) => get(name, target, args)
      : (trigger?: HTMLElement) => get(name, target, [trigger]);
  }
  function get(getter: string, target: string, args: [HTMLElement?]) {
    untrack(() => {
      onCall?.();
      const node = args[0];
      calls.push({
        getter,
        args: args.length,
        tag: node?.tagName.toLowerCase() ?? 'none',
        key: node?.getAttribute('data-menu-id')?.match(/-(p|n)$/)?.[1] ?? null,
        title: node?.querySelector('.ant-menu-title-content')?.textContent ?? ''
      });
    });
    return target === 'shadow' ? shadow ?? document.body
      : document.getElementById(`menu-${target}`) ?? document.body;
  }
</script>

{#snippet alpha()}<MenuContainerLabel />{/snippet}
{#snippet leaf()}{#if link}<a href="#menu-container-destination">Leaf</a>{:else}Leaf{/if}{/snippet}

<div id="menu-parent" data-menu-container="parent"></div>
<div id="menu-child" data-menu-container="child"></div>
<div id="menu-local" data-menu-container="local"></div>
<div id="menu-shadow" data-menu-container="shadow" {@attach element => {
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
<div id="menu-host" style="width:500px;margin:200px">
  <ConfigProvider {...parentOptions} direction={sample.rtl ? 'rtl' : undefined}
    style={`--menu-origin:${dark ? 'dark' : 'light'}`} theme={{
      mode: dark ? 'dark' : 'light',
      token: { motion: false }
    }}>
    <ConfigProvider {...childOptions}>
      {#if mounted}
        <Menu {...localOptions} {items} mode={sample.mode} {disabled}
          inlineCollapsed={sample.collapsed} defaultOpenKeys={sample.initial ? ['p'] : []}
          forceSubMenuRender={sample.force || extraForce} triggerSubMenuAction={hover ? 'hover' : 'click'}
          style="width:100%" aria-label="Container menu" bind:this={instance}
          bind:nativeElement={nativeRoot} onOpenChange={value => opened.push(value)}
          onClick={info => {
            clicked.push({ key: info.key, keyPath: info.keyPath });
            domEvents.push({
              target: (info.domEvent.target as Element).tagName,
              type: info.domEvent.type
            });
          }}
          onSelect={info => selected.push(info.selectedKeys)} onkeydown={event => {
            keys.push(event.key);
            keyTargets.push(event.currentTarget === nativeRoot);
          }} />
      {/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
<button type="button" onclick={() => instance?.focus()}>Focus container menu</button>
<button type="button" onclick={() => instance?.findItem({ key: 'a' })?.focus()}>Focus container alpha</button>
<output aria-label="Menu container calls">{JSON.stringify(calls)}</output>
<output aria-label="Menu container opened">{JSON.stringify(opened)}</output>
<output aria-label="Menu container clicked">{JSON.stringify(clicked)}</output>
<output aria-label="Menu container selected">{JSON.stringify(selected)}</output>
<output aria-label="Menu container keys">{JSON.stringify(keys)}</output>
<output aria-label="Menu container key targets">{JSON.stringify(keyTargets)}</output>
<output aria-label="Menu container DOM events">{JSON.stringify(domEvents)}</output>
<output aria-label="Menu container ref">{nativeRoot?.tagName ?? 'none'}</output>
