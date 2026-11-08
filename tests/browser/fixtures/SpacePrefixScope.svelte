<script lang="ts">
  import { Space, SpaceCompact, SpaceAddon, Badge } from 'antd-svelte';
  import type { SpaceProps, SpaceCompactProps, SpaceAddonProps } from 'antd-svelte';

  export interface SpacePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    compact?: string;
    addon?: string;
    vertical?: boolean;
    block?: boolean;
    rtl?: boolean;
    gap?: SpaceProps['size'];
    size?: SpaceCompactProps['size'];
    variant?: SpaceAddonProps['variant'];
    status?: SpaceAddonProps['status'];
    disabled?: boolean;
    aliases?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: SpacePrefixSample;
    local?: boolean;
  } = $props();
  let spaceRef = $state<HTMLDivElement>();
  let compactRef = $state<HTMLDivElement>();
  const classes: SpaceProps['classNames'] = ({ props }) => ({
    root: `fixture-raw-prefix-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`
  });
</script>

{#snippet spaceEditor()}<input aria-label={`${scope} space editor`} value="Draft"
  style="width:100px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />{/snippet}
{#snippet badge()}<Badge count={5} data-space-prefix-badge />{/snippet}
{#snippet text()}<span>Last</span>{/snippet}
{#snippet start()}<SpaceAddon prefixCls={local ? sample.addon : undefined}
  class="fixture-addon-prefix" variant={sample.variant} status={sample.status}
  disabled={sample.disabled}>From</SpaceAddon>{/snippet}
{#snippet end()}<SpaceAddon prefixCls={local ? sample.addon : undefined}
  class="fixture-addon-prefix" variant={sample.variant}>To</SpaceAddon>{/snippet}
{#snippet compactEditor()}<input aria-label={`${scope} compact editor`} value="Compact"
  style="width:100px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />{/snippet}

<div data-space-prefix-scope={scope} style="width:400px">
  <Space bind:nativeElement={spaceRef} prefixCls={local ? sample.local : undefined}
    class="fixture-space-prefix" classNames={classes} size={sample.gap ?? 'small'}
    orientation={sample.vertical ? 'vertical' : 'horizontal'} separator="|"
    items={[{ key: 'editor', children: spaceEditor }, { key: 'badge', children: badge },
      { key: 'text', children: text }]} />
  <SpaceCompact bind:nativeElement={compactRef} prefixCls={local ? sample.compact : undefined}
    class="fixture-compact-prefix" size={sample.size} block={sample.block}
    orientation={sample.vertical ? 'vertical' : 'horizontal'}
    items={[{ key: 'start', children: start }, { key: 'editor', children: compactEditor },
      { key: 'end', children: end }]} />
  <output aria-label={`${scope} Space prefix refs`}>{spaceRef && compactRef ? 'mounted' : 'empty'}</output>
</div>
