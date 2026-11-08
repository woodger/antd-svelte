<script lang="ts">
  import { Anchor, type AnchorItem, type AnchorProps } from 'antd-svelte';

  export interface AnchorPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    horizontal?: boolean;
    tokens?: boolean;
    affix?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: AnchorPrefixSample;
    local?: boolean;
  } = $props();
  let clicks = $state(0);
  let changes = $state<string[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  const current = () => '#prefix-two';
  const items: AnchorItem[] = [
    { key: 'one', href: '#prefix-one', title: 'First' },
    { key: 'two', href: '#prefix-two', title: 'Second',
      children: [{ key: 'detail', href: '#prefix-detail', title: 'Detail' }] },
    { key: 'three', href: '#prefix-three', title: 'Third' }
  ];
  const classes: AnchorProps['classNames'] = ({ props }) => ({
    root: `fixture-raw-prefix-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`
  });
</script>

<div data-anchor-prefix-scope={scope} style="width:300px">
  <Anchor bind:nativeElement prefixCls={local ? sample.local : undefined}
    affix={sample.affix ?? false} showInkInFixed {items}
    direction={sample.horizontal ? 'horizontal' : 'vertical'} getCurrentAnchor={current}
    class="fixture-anchor-prefix-root" classNames={classes}
    onClick={() => clicks++} onChange={href => changes = [...changes, href]} />
  <output aria-label={`${scope} prefix clicks`}>{clicks}</output>
  <output aria-label={`${scope} prefix changes`}>{JSON.stringify(changes)}</output>
  <output aria-label={`${scope} prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
</div>
