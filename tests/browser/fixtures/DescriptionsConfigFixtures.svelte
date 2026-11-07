<script lang="ts">
  import {
    ConfigProvider, Descriptions, Input, theme,
    type DescriptionsConfig, type DescriptionsItem, type DescriptionsProps
  } from 'antd-svelte';
  import { descriptionsConfigProfile } from './descriptions-config-presets';
  import reference from './ant-design-descriptions-config-reference.json' with { type: 'json' };

  let { sample, probeDefaults = false }: {
    sample?: typeof reference.cases[number];
    probeDefaults?: boolean;
  } = $props();
  let selectedCase = $state('default');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let updated = $state(false);
  let wide = $state(false);
  let small = $state(false);
  let context = $derived<DescriptionsConfig>({ ...descriptionsConfigProfile(current.context),
    ...(updated ? { class: 'context-descriptions-updated',
      style: 'opacity:0.6;outline-offset:7px' } : {}) });
  let nested = $derived<DescriptionsConfig | undefined>(current.nested === 'empty' ? {}
    : current.nested === 'replace' ? { class: 'context-replaced' } : undefined);
  let local = $derived(descriptionsConfigProfile(current.local, true));
  let column = $derived(wide || current.column === 3 ? 3 : 2);
  let size = $derived<DescriptionsProps['size']>(small || current.size === 'small'
    ? 'small' : undefined);
  let layout = $derived<DescriptionsProps['layout']>(current.layout === 'vertical'
    ? 'vertical' : 'horizontal');
  let items = $derived<DescriptionsItem[]>([
    { key: 'one', label: 'First', children: editor, ...(current.item ? {
      labelStyle: 'color:#d4380d;padding-top:31px',
      contentStyle: 'color:#0050b3;padding-top:33px',
      classNames: { label: 'item-label', content: 'item-content' },
      styles: { label: 'color:#c41d7f;margin-top:11px',
        content: 'color:#389e0d;margin-top:13px' }
    } : {}) },
    { key: 'two', label: 'Second', children: 'Value' },
    { key: 'three', label: 'Third', children: 'Filled', span: 'filled' }
  ]);

  function resetCase() {
    updated = false;
    wide = false;
    small = false;
  }
</script>

{#snippet editor()}<Input defaultValue="Draft" name="description-draft"
  aria-label="Descriptions configured draft" />{/snippet}

<section id="descriptions-config-fixture">
  <h2>Descriptions component configuration</h2>
  <label>Descriptions config preset<select aria-label="Descriptions config preset"
    bind:value={selectedCase} onchange={resetCase}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button onclick={() => { updated = !updated; }}>Update Descriptions configuration</button>
  <button onclick={() => { wide = !wide; }}>Toggle configured Descriptions columns</button>
  <button onclick={() => { small = !small; }}>Toggle configured Descriptions size</button>
  <ConfigProvider descriptions={context} componentSize="middle"
    direction={current.direction === 'rtl' ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false }, algorithm: current.theme === 'dark'
      ? theme.darkAlgorithm : current.theme === 'compact' ? theme.compactAlgorithm
        : theme.defaultAlgorithm, components: current.token ? { Descriptions: { algorithm: true,
          colorPrimary: '#eb2f96', labelBg: '#fff0f6', titleMarginBottom: 29 } } : undefined }}>
    <ConfigProvider descriptions={nested}>
      <form aria-label="Configured Descriptions form" onsubmit={event => event.preventDefault()}>
        <Descriptions {...local} title="Descriptions title" extra="Extra" {items} {column} {size}
          bordered={probeDefaults ? undefined : !!current.bordered}
          layout={probeDefaults ? undefined : layout} colon={probeDefaults ? undefined : true}
          classNames={probeDefaults ? ({ props }) => ({
            root: `native-descriptions-${props.bordered}-${props.layout}-${props.colon}`
          }) : local.classNames}
          labelStyle={current.legacy ? 'color:#0000ff;padding-top:21px' : undefined}
          contentStyle={current.legacy ? 'color:#0000ff;padding-top:22px' : undefined} />
      </form>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Descriptions class="outside-descriptions-config" title="Outside"
      items={[{ key: 'outside', label: 'Outside label', children: 'Outside value' }]} />
  </ConfigProvider>
</section>
