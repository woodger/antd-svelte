<script lang="ts">
  import { untrack } from 'svelte';
  import { AvatarGroup, ConfigProvider, Popconfirm, Popover } from 'antd-svelte';
  import type { PopoverActionCase } from './popover-actions.types';

  let { sample, source = true }: { sample: PopoverActionCase; source?: boolean } = $props();
  let step = $state(0);
  let mounted = $state(true);
  let frame = $derived(sample.frames[step]);
  let options = $derived.by(() => {
    const { showAction, hideAction, ...rest } = frame.props;
    return { ...rest, showAction: showAction ?? undefined, hideAction: hideAction ?? undefined };
  });
  let events = $state<boolean[]>([]);
  let commands = $state<string[]>([]);

  function expose(node: HTMLElement) {
    Object.defineProperty(node, 'actionEvents', { configurable: true, get: () => [...events] });
    return () => { Reflect.deleteProperty(node, 'actionEvents'); };
  }

  function onOpenChange(value: boolean) {
    untrack(() => events.push(value));
  }
</script>

{#snippet content()}<input id="action-popup-input" aria-label="Action popup draft" value="Draft" />{/snippet}
{#snippet trigger()}<button id="action-trigger" type="button">Action trigger</button>{/snippet}

<div id="popover-action-case" {@attach expose}>
  <button type="button" onclick={() => step++} disabled={step >= sample.frames.length - 1}>
    Next action step
  </button>
  <label><input type="checkbox" bind:checked={mounted} /> Mount action popup</label>
  <output aria-label="Popover action events">{JSON.stringify(events)}</output>
  <output aria-label="Popover action commands">{JSON.stringify(commands)}</output>
  <output aria-label="Popover action step">{step}</output>
  <button id="action-outside" type="button">Outside focus</button>
  <ConfigProvider theme={source ? { cssVar: {}, token: { motion: false } }
    : { mode: 'light', primary: 'blue' }}
    popover={source ? {} : undefined} popconfirm={source ? {} : undefined}>
    <div style="margin:180px">
      {#if mounted}
        {#if sample.mode === 'popover'}
          {#if frame.props.open === undefined}
            <Popover {...options} {content} {onOpenChange}>{@render trigger()}</Popover>
          {:else}
            <Popover {...options} {content} {onOpenChange}
              bind:open={() => frame.props.open, () => {}}>{@render trigger()}</Popover>
          {/if}
        {:else if sample.mode === 'popconfirm'}
          {#if frame.props.open === undefined}
            <Popconfirm {...options} description={content} {onOpenChange}
              okText="Confirm action" cancelText="Cancel action"
              onConfirm={() => { commands.push('confirm'); }}
              onCancel={() => { commands.push('cancel'); }}>{@render trigger()}</Popconfirm>
          {:else}
            <Popconfirm {...options} description={content} {onOpenChange}
              bind:open={() => frame.props.open, () => {}}
              okText="Confirm action" cancelText="Cancel action"
              onConfirm={() => { commands.push('confirm'); }}
              onCancel={() => { commands.push('cancel'); }}>{@render trigger()}</Popconfirm>
          {/if}
        {:else}
          <AvatarGroup items={[
            { key: 'a', label: 'Alpha', text: 'A' },
            { key: 'b', label: 'Beta', text: 'B' }
          ]} max={{ count: 1, popover: { ...options, content, onOpenChange } }} />
        {/if}
      {/if}
    </div>
  </ConfigProvider>
</div>
