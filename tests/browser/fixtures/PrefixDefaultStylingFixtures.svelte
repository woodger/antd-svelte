<script lang="ts">
  import { ConfigProvider, enUS, type ThemeConfig } from 'antd-svelte';
  import PickerPrefixScope, { type PickerPrefixKind } from './PickerPrefixScope.svelte';
  import CalendarPrefixScope from './CalendarPrefixScope.svelte';
  import ColorPickerPrefixScope from './ColorPickerPrefixScope.svelte';

  let component = $state<PickerPrefixKind | 'calendar' | 'color-picker'>('date');
  let preset = $state('light-blue');
  let prefix = $state('');
  let theme = $derived<ThemeConfig>(preset === 'dark-green'
    ? { mode: 'dark', primary: 'green' } : preset === 'compact-purple'
      ? { mode: 'light', primary: 'purple', compact: true } : { mode: 'light', primary: 'blue' });
  let rootPrefix = $derived(prefix || 'ant');
</script>

<section id="prefix-default-styling-fixture">
  <label>Default styling component<select bind:value={component}>
    {#each ['date', 'range', 'time', 'time-range', 'calendar', 'color-picker'] as mode}
      <option value={mode}>{mode}</option>
    {/each}
  </select></label>
  <label>Default styling theme<select bind:value={preset}>
    {#each ['light-blue', 'dark-green', 'compact-purple'] as value}
      <option value={value}>{value}</option>
    {/each}
  </select></label>
  <label>Default styling prefix<input bind:value={prefix} /></label>
  <ConfigProvider prefixCls={prefix} {theme} locale={enUS}>
    {#key component}
      {#if component === 'calendar'}
        <CalendarPrefixScope sample={{ id: 'native', mini: true }} {rootPrefix} />
      {:else if component === 'color-picker'}
        <ColorPickerPrefixScope sample={{ id: 'native' }} {rootPrefix} />
      {:else}
        <PickerPrefixScope sample={{ id: 'native', kind: component }} {rootPrefix} />
      {/if}
    {/key}
  </ConfigProvider>
</section>
