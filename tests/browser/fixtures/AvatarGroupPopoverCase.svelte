<script lang="ts">
  import { untrack } from 'svelte';
  import { AvatarGroup, ConfigProvider, Popover } from 'antd-svelte';
  import type { AvatarGroupMax, ConfigProviderProps } from 'antd-svelte';
  import type {
    AvatarGroupPopoverCase as Sample,
    AvatarGroupPopoverValues
  } from './avatar-group-popover-presets';

  let {
    sample,
    changed = false,
    mounted = true,
    alternate = false,
    revision = 0,
    standalone = false,
    nativeOptions = false,
    dark = false
  }: {
    sample: Sample;
    changed?: boolean;
    mounted?: boolean;
    alternate?: boolean;
    revision?: number;
    standalone?: boolean;
    nativeOptions?: boolean;
    dark?: boolean;
  } = $props();
  let values = $derived<AvatarGroupPopoverValues>({ ...sample, ...(changed ? sample.patch : {}) });
  let acceptedOpen = $state<boolean>();
  let events = $state<boolean[]>([]);
  let calls = $state<{ getter: string; tag: string }[]>([]);
  let options = $derived.by(() => {
    void revision;
    const result: NonNullable<AvatarGroupMax['popover']> = {
      trigger: 'click',
      title: 'Details',
      ...values.options,
      onOpenChange: next => {
        events.push(next);
        if (values.accept) acceptedOpen = next;
      }
    };
    if (acceptedOpen !== undefined) result.open = acceptedOpen;
    if (values.editor) result.content = editor;
    if (values.richTitle) result.title = heading;
    if (values.undefinedContent) result.content = undefined;
    if (values.undefinedTitle) result.title = undefined;
    if (nativeOptions) Object.assign(result, {
      'aria-label': 'Owner accessible popup',
      'aria-describedby': 'group-popup-description',
      'aria-busy': true,
      class: 'case-wrapper',
      style: 'color:rgb(1,2,3)',
      popupClass: 'case-extra'
    });
    if (values.container === 'local') {
      result.getPopupContainer = trigger => target('local', trigger);
    }
    return result;
  });
  let provider = $derived.by(() => {
    const result: Partial<ConfigProviderProps> = {};
    if (values.container) result.getPopupContainer = trigger => target('provider', trigger);
    return result;
  });

  function target(getter: string, trigger?: HTMLElement) {
    untrack(() => calls.push({ getter, tag: trigger?.tagName ?? 'none' }));
    return document.getElementById(`group-popup-${alternate ? 'alternate' : getter}`)!;
  }
</script>

{#snippet heading()}<strong>Owner popup heading</strong>{/snippet}
{#snippet editor()}
  <div><input aria-label="Owner popup draft" value="Draft" /><button type="button">Owner action</button></div>
{/snippet}

<div id="group-popup-provider" data-group-popover-container="provider"></div>
<div id="group-popup-local" data-group-popover-container="local"></div>
<div id="group-popup-alternate" data-group-popover-container="alternate"></div>
<p id="group-popup-description">Owner popup help</p>
<ConfigProvider {...provider} theme={{ mode: dark ? 'dark' : 'light', token: { motion: false } }}>
  <div id="avatar-group-popover-surface" style="margin:100px 200px">
    {#if mounted}
      {#if standalone}
        <Popover {...options} popupClass="ant-avatar-group-popover">
          <button class="ant-avatar-group-more" type="button">Standalone popup</button>
        </Popover>
      {:else}
        <AvatarGroup items={[
          { key: 'a', label: 'Alpha', text: 'A' },
          { key: 'b', label: 'Beta', text: 'B' },
          { key: 'c', label: 'Gamma', text: 'C' }
        ]} max={{ count: 1, popover: options }} />
      {/if}
    {/if}
  </div>
</ConfigProvider>
<output aria-label="Group popup events">{JSON.stringify(events)}</output>
<output aria-label="Group popup containers">{JSON.stringify(calls)}</output>
