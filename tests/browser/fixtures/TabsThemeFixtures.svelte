<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ConfigProvider, Tabs, type TabsPlacement, type TabsType } from 'antd-svelte';
  import { tabsThemePresets } from './tabs-theme-presets';
  import reference from './ant-design-tabs-theme-metrics.json';

  let preset = $state('default');
  let enabled = $state(true);
  let rtl = $state(false);
  let compact = $state(false);
  let hashed = $state(true);
  let mounted = $state(true);
  let parentAliases = $state(false);
  let overrideStyles = $state(false);
  let custom = $state(false);
  let current = $state<string | undefined>('0');
  let events = $state<string[]>([]);
  let config = $derived({
    ...tabsThemePresets[preset],
    cssVar: { ...tabsThemePresets[preset].cssVar, key: 'tabs-tokens-reference' },
    hashed
  });
</script>

<style>
  label { display: block; }
  .stage { width: 760px; }
  .stage.overflow { width: 240px; }
</style>

{#snippet draft()}<input aria-label="Themed Tabs draft" name="draft" value="Initial draft" />{/snippet}
{#snippet popup(menu: Snippet)}{@render menu()}<input aria-label="Themed Tabs popup draft" />{/snippet}
<section id="tabs-theme-fixture">
  <h2>Source Tabs tokens</h2>
  <label>Tabs token preset <select aria-label="Tabs token preset" bind:value={preset}>
    {#each Object.keys(tabsThemePresets) as name}<option>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source Tabs tokens</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL themed Tabs</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact themed Tabs</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed Tabs</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed Tabs</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent Tabs aliases</label>
  <label><input type="checkbox" bind:checked={overrideStyles} /> Override Tabs styles</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom themed Tabs popup</label>
  <input aria-label="Themed Tabs outside" />
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact, primary: 'purple' }} direction={rtl ? 'rtl' : 'ltr'}>
      <div style={parentAliases ? '--ant-font-size:33px;--ant-color-text:red' : undefined}>
        {#each reference.variants as variant (variant.name)}
          <div class="stage" class:overflow={Boolean('overflow' in variant && variant.overflow)}>
            <Tabs class={`tabs-token-${variant.name}`} type={variant.type as TabsType}
              size={'size' in variant ? variant.size as 'small' | 'large' : undefined}
              tabPlacement={'tabPlacement' in variant ? variant.tabPlacement as TabsPlacement : undefined}
              style={overrideStyles ? 'height:240px;--ant-tabs-card-padding:3px 7px' : 'height:240px'}
              items={Array.from({ length: 'overflow' in variant && variant.overflow ? 10 : 3 }, (_, index) => ({
                key: String(index),
                label: `Tab ${index + 1}`,
                disabled: index === 2
              }))} />
          </div>
        {/each}
        <div class="stage overflow">
          <Tabs id="tabs-theme-interactive" aria-label="Interactive themed Tabs" bind:activeKey={current}
            type="editable-card" style="height:240px"
            more={custom ? { trigger: 'click', popupRender: popup } : undefined}
            items={Array.from({ length: 10 }, (_, index) => ({
              key: String(index),
              label: `Tab ${index + 1}`,
              disabled: index === 2,
              children: index === 0 ? draft : undefined
            }))} onChange={key => events = [...events, `change:${key}`]}
            onTabClick={key => events = [...events, `click:${key}`]} />
        </div>
      </div>
    </ConfigProvider>
  {/if}
  <output aria-label="Tabs theme events">{JSON.stringify(events)}</output>
</section>
