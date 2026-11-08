<script lang="ts">
  import { Splitter, type SplitterProps } from 'antd-svelte';

  export interface SplitterPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    vertical?: boolean;
    lazy?: boolean;
    custom?: boolean;
    disabled?: boolean;
    aliases?: boolean;
  }

  let { scope, sample, local = true, motion = false }: {
    scope: string;
    sample: SplitterPrefixSample;
    local?: boolean;
    motion?: boolean;
  } = $props();
  let events = $state<{ event: string; sizes: number[]; }[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  const classes: SplitterProps['classNames'] = ({ props }) => ({
    root: `fixture-raw-prefix-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`
  });
</script>

{#snippet editor()}<input aria-label={`${scope} panel editor`} value="Draft" />{/snippet}
{#snippet icon()}<span>drag</span>{/snippet}
<div data-splitter-prefix-scope={scope}>
  <Splitter prefixCls={local ? sample.local : undefined}
    bind:nativeElement classNames={classes} orientation={sample.vertical ? 'vertical' : 'horizontal'}
    lazy={sample.lazy} collapsible={{ motion }} draggerIcon={sample.custom ? icon : undefined}
    items={[
      { defaultSize: '40%', min: '10%', max: '80%', resizable: !sample.disabled,
        collapsible: { start: true, end: true, showCollapsibleIcon: true }, children: editor },
      { collapsible: { start: true, end: true, showCollapsibleIcon: true }, children: 'Second' }
    ]}
    style={`width:480px;height:${sample.vertical ? 240 : 160}px`}
    onResizeStart={sizes => events = [...events, { event: 'start', sizes }]}
    onResize={sizes => events = [...events, { event: 'resize', sizes }]}
    onResizeEnd={sizes => events = [...events, { event: 'end', sizes }]}
    onCollapse={(collapsed, sizes) => events = [...events, { event: 'collapse', sizes }]} />
  <output aria-label={`${scope} prefix resize events`}>{JSON.stringify(events)}</output>
  <output aria-label={`${scope} prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
</div>
