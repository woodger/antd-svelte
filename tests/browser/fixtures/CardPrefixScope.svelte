<script lang="ts">
  import {
    Card, CardGrid, CardMeta, TypographyTitle, type CardProps, type ComponentSize
  } from 'antd-svelte';

  export interface CardPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    childLocal?: string;
    rtl?: boolean;
    aliases?: boolean;
    grid?: boolean;
    tabs?: boolean;
    loading?: boolean;
    size?: string;
    inner?: boolean;
    borderless?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: CardPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let activeTabKey = $state('a');
  let events = $state<string[]>([]);
  let size = $derived<ComponentSize | undefined>(sample.size === 'small' ? 'small' : undefined);
  let childrenPrefix = $derived(local ? sample.childLocal : undefined);
  let tabList = $derived<CardProps['tabList']>(sample.tabs ? [
    { key: 'a', label: tabAlpha }, { key: 'b', label: tabBeta }
  ] : undefined);
</script>

{#snippet title()}<TypographyTitle level={4}>Card heading</TypographyTitle>{/snippet}
{#snippet avatar()}<span style="display:inline-block;width:24px;height:24px">AV</span>{/snippet}
{#snippet action()}<button type="button">Action</button>{/snippet}
{#snippet tabAlpha()}<span class="fixture-card-tab-label">Alpha</span>{/snippet}
{#snippet tabBeta()}<span class="fixture-card-tab-label">Beta</span>{/snippet}
{#snippet content()}
  <CardMeta prefixCls={childrenPrefix} {avatar} title="Person" description="Description"
    classNames={{ root: 'fixture-card-meta', title: 'fixture-meta-title',
      description: 'fixture-meta-description' }} />
  <input aria-label={`${scope} card draft`} name="draft" value="Draft"
    style="width:90px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />
{/snippet}
<form data-card-prefix-scope={scope} style="width:480px" onsubmit={event => event.preventDefault()}>
  <Card prefixCls={local ? sample.local : undefined} bind:nativeElement {title} extra="Extra"
    {size} loading={sample.loading} type={sample.inner ? 'inner' : undefined}
    variant={sample.borderless ? 'borderless' : 'outlined'} hoverable
    {tabList} bind:activeTabKey onTabChange={key => events.push(`tab:${key}`)} actions={[action]}
    classNames={({ props }) => ({
      root: `fixture-card-prefix fixture-raw-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`,
      header: 'fixture-card-header', body: 'fixture-card-body', actions: 'fixture-card-actions'
    })}>
    {#if sample.grid}
      <CardGrid prefixCls={childrenPrefix} class="fixture-card-grid" style="width:50%">
        {@render content()}
      </CardGrid>
      <CardGrid prefixCls={childrenPrefix} class="fixture-card-grid" style="width:50%"
        hoverable={false}>Second grid</CardGrid>
    {:else}{@render content()}{/if}
  </Card>
  <output aria-label={`${scope} Card prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} Card prefix events`}>{events.join('|')}</output>
</form>
