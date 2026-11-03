<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import {
    ConfigProvider,
    Form,
    FormItem,
    Mentions,
    SpaceCompact,
    createForm,
    type ConfigProviderProps,
    type MentionsProps
  } from 'antd-svelte';
  import type { MentionsPopupCase } from './mentions-popup-presets';
  import MentionsPopupBody from './MentionsPopupBody.svelte';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    loading = false,
    empty = false,
    onCall
  }: {
    sample: MentionsPopupCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    loading?: boolean;
    empty?: boolean;
    onCall?: () => void;
  } = $props();
  const form = createForm({
    initialValues: { note: '' },
    rules: { note: [{ required: true, message: 'Mention required' }] }
  });
  let shadow = $state<ShadowRoot>();
  let calls = $state<{
    getter: string;
    args: number;
    tag: string;
    text: string;
    parent: string;
  }[]>([]);
  let searches = $state<string[]>([]);
  let values = $state<string[]>([]);
  let selected = $state<string[]>([]);
  let scrolls = $state(0);
  let blurred = $state(0);
  let parentOptions = $derived.by(() => {
    void revision;
    const target = alternate ? 'child' : sample.parent === 'shadow' ? 'shadow' : 'parent';
    const props: Partial<ConfigProviderProps> = {};
    if (sample.parent !== 'none') {
      props.getPopupContainer = (...args) => get('parent', target, args);
    }
    return props;
  });
  let childOptions = $derived.by(() => {
    void revision;
    return sample.child ? {
      getPopupContainer: (...args: [HTMLElement?]) => get('child', 'child', args)
    } : {};
  });
  let localOptions = $derived.by(() => {
    void revision;
    const props: Pick<MentionsProps, 'getPopupContainer'> = {};
    if (sample.local === 'undefined') props.getPopupContainer = undefined;
    else if (sample.local) {
      const target = alternate ? 'child' : sample.local;
      props.getPopupContainer = sample.parameter
        ? (trigger?: HTMLElement) => get('local', target, [trigger])
        : (...args: [HTMLElement?]) => get('local', target, args);
    }
    return props;
  });

  function get(getter: string, target: string, args: [HTMLElement?]) {
    untrack(() => {
      onCall?.();
      const trigger = args[0];
      calls.push({
        getter,
        args: args.length,
        tag: trigger?.tagName.toLowerCase() ?? 'none',
        text: trigger?.textContent ?? '',
        parent: trigger?.parentElement?.classList.contains('ant-mentions-measure')
          ? 'measure' : 'other'
      });
    });
    return target === 'shadow' ? shadow ?? document.body
      : document.getElementById(`mention-${target}`)!;
  }
  onMount(() => {
    if (sample.context) void form.validateFields().catch(() => {});
  });
</script>

{#snippet renderPopup(menu: Snippet)}<MentionsPopupBody {menu} replace={sample.replace} />{/snippet}
{#snippet widget()}
  {#if mounted}
    <Mentions {...localOptions} aria-label="Mention entry" name="note" rows={3}
      prefix={sample.prefix ?? '@'} placement={sample.placement ?? 'bottom'} {loading}
      options={empty ? [] : [
        { value: 'alpha', label: 'Alpha' }, { value: 'beta', label: 'Beta' },
        { value: 'blocked', label: 'Blocked', disabled: true }
      ]} popupRender={sample.custom ? renderPopup : undefined}
      onSearch={(text, prefix) => searches.push(`${prefix}:${text}`)}
      onChange={value => values.push(value)} onSelect={option => selected.push(option.value)}
      onPopupScroll={() => scrolls++} onBlur={() => blurred++} />
  {/if}
{/snippet}

<div id="mention-parent" data-mention-container="parent"></div>
<div id="mention-child" data-mention-container="child"></div>
<div id="mention-local" data-mention-container="local"></div>
<div id="mention-shadow" data-mention-container="shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  const style = element.ownerDocument.createElement('style');
  style.textContent = '[popover]{position:fixed;inset:auto;margin:0;border:0;box-sizing:border-box}';
  root.append(style);
  shadow = root;
}}></div>
<div style="width:300px;margin:100px">
  <ConfigProvider {...parentOptions} direction={sample.rtl ? 'rtl' : undefined}
    style={`--mention-origin:${dark ? 'dark' : 'light'}`} theme={{
      mode: dark ? 'dark' : 'light', token: { motion: false }
    }}>
    <ConfigProvider {...childOptions}>
      {#if sample.context}
        <Form {form} id="mention-popup-form"><FormItem name="note" label="Mention field">
          <SpaceCompact size="small">{@render widget()}</SpaceCompact>
        </FormItem></Form>
      {:else}<form id="mention-popup-form">{@render widget()}</form>{/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
<output aria-label="Mention popup calls">{JSON.stringify(calls)}</output>
<output aria-label="Mention popup searches">{JSON.stringify(searches)}</output>
<output aria-label="Mention popup values">{JSON.stringify(values)}</output>
<output aria-label="Mention popup selected">{JSON.stringify(selected)}</output>
<output aria-label="Mention popup scrolls">{scrolls}</output>
<output aria-label="Mention popup blurred">{blurred}</output>
