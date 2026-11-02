<script lang="ts">
  import {
    ConfigProvider,
    Steps,
    Timeline,
    type StepsDataItem,
    type StepsProps,
    type ThemeConfig,
    type TimelineItem
  } from 'antd-svelte';
  import { stepsThemePresets } from './steps-theme-presets';
  import reference from './ant-design-steps-metrics.json';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let rtl = $state(false);
  let parentAliases = $state(false);
  let overrideStyles = $state(false);
  let narrow = $state(false);
  let iconSize = $state<number | undefined>();
  let events = $state<string[]>([]);
  let current = $state(1);
  let config = $derived<ThemeConfig>({
    ...stepsThemePresets[preset],
    cssVar: { ...stepsThemePresets[preset].cssVar, key: 'steps-source-scope' },
    hashed,
    components: iconSize !== undefined ? {
      ...stepsThemePresets[preset].components,
      Steps: { ...stepsThemePresets[preset].components?.Steps, iconSize }
    } : stepsThemePresets[preset].components
  });
  const items: StepsDataItem[] = [
    { key: 'finish', title: 'Finished', subTitle: 'First', content: 'Finished content' },
    { key: 'process', title: 'Process', subTitle: 'Second', content: 'Process content' },
    { key: 'wait', title: 'Waiting', subTitle: 'Third', content: 'Waiting content' },
    {
      key: 'error',
      title: 'Error',
      subTitle: 'Fourth',
      content: 'Error content',
      status: 'error',
      disabled: true
    }
  ];
  const timelineItems: TimelineItem[] = [
    { key: 'one', title: 'First', content: 'First event' },
    { key: 'two', title: 'Second', content: 'Second event', color: 'green' },
    { key: 'three', title: 'Third', content: 'Third event', color: 'red' }
  ];
  let variants = $derived(reference.variants.filter((_, index) => index < 6
    || ['default', 'steps-tokens', 'both-aliases', 'custom-prefix'].includes(preset)) as {
    name: string;
    custom?: boolean;
    props?: Partial<StepsProps>;
  }[]);

  function choose(index: number) {
    events = [...events, `change:${index}`];
    current = index;
  }
</script>

<style>
  label { display: block; }
  .stage { width: 800px; max-width: 100%; }
</style>

{#snippet customIcon()}<svg width="1em" height="1em" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1L15 15" stroke="currentColor" /></svg>{/snippet}
<section id="steps-theme-fixture">
  <h2>Source Steps and Timeline tokens</h2>
  <label>Steps token preset <select bind:value={preset} aria-label="Steps token preset">
    {#each Object.keys(stepsThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Steps tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Steps</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Steps</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact Steps</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL themed Steps</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Steps aliases</label>
  <label><input type="checkbox" bind:checked={overrideStyles} /> Override Steps token styles</label>
  <label><input type="checkbox" bind:checked={narrow} /> Narrow themed Steps</label>
  <label>Steps icon size <input type="number" bind:value={iconSize} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }} direction={rtl ? 'rtl' : 'ltr'}>
      <div class="stage" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}
        style:width={narrow ? '200px' : undefined}>
        {#each variants as variant (variant.name)}
          <Steps class={`steps-token-${variant.name}`} aria-label={`Themed ${variant.name} Steps`}
            items={variant.custom ? items.map(item => ({ ...item, icon: customIcon })) : items}
            {current} responsive={false} {...variant.props}
            styles={overrideStyles ? { root: '--ant-steps-icon-size:41px' } : undefined}
            style={overrideStyles ? '--ant-steps-icon-size:47px' : undefined} />
        {/each}
        <Timeline class="steps-token-timeline" items={timelineItems}
          styles={overrideStyles ? { root: '--ant-timeline-dot-size:21px' } : undefined}
          style={overrideStyles ? '--ant-timeline-dot-size:27px' : undefined} />
        <Timeline class="steps-token-timeline-horizontal" items={timelineItems}
          orientation="horizontal" mode="alternate" />
        <Steps class="steps-token-interactive" aria-label="Interactive themed Steps" {items}
          {current} onChange={choose} responsive={false} />
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Steps theme events">{JSON.stringify(events)}</output>
</section>
