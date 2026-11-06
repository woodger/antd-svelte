<script lang="ts">
  import { ColorPicker, ConfigProvider, enUS, type ColorValue } from 'antd-svelte';

  let { id, prefix = 'ant', priority = false, opened = '' }: {
    id: string;
    prefix?: string;
    priority?: boolean;
    opened?: string;
  } = $props();
  const gradient: ColorValue = [
    { color: '#1677ff', percent: 0 }, { color: '#fa541c', percent: 100 }
  ];
  const presets = [{ label: 'Stored colors', colors: ['#1677ff', '#fa541c', '#00000055', '#ffffff55'] }];
  let styled = $derived(priority || id === 'priority');
  let modes = $derived(id === 'normal'
    ? ['basic', 'small', 'large', 'disabled', 'cleared', 'rgb', 'hsb', 'gradient'] : ['basic']);
  let events = $state<string[]>([]);
</script>

<ConfigProvider locale={enUS} direction={id === 'rtl' ? 'rtl' : 'ltr'}>
  <section data-color-theme={id} style="width:800px;padding:16px;color:rgb(1,2,3)">
    {#each modes as mode}
      {@const active = id === 'normal' && opened === mode}
      <div data-color-control={mode} style="margin-bottom:16px">
        <ColorPicker defaultValue={mode === 'gradient' ? gradient : mode === 'cleared' ? '' : '#1677ff'}
          mode={mode === 'gradient' ? 'gradient' : 'single'}
          format={mode === 'rgb' ? 'rgb' : mode === 'hsb' ? 'hsb' : undefined}
          size={mode === 'small' ? 'small' : mode === 'large' ? 'large' : undefined}
          disabled={mode === 'disabled'} showText open={active} allowClear
          presets={active ? presets : undefined}
          style={[styled && 'color:rgb(0,128,0);padding-top:13px',
            id === 'variable' && `--${prefix}-font-size:21px`].filter(Boolean).join(';')}
          classNames={active ? { popup: { root: 'theme-color-popup' } } : undefined}
          styles={styled ? { description: 'color:#cf1322', popup: { root: 'color:#389e0d' } }
            : undefined}
          aria-label={`Themed ColorPicker ${id} ${mode}`}
          onChange={color => events.push(`change:${mode}:${color.toCssString()}`)}
          onChangeComplete={color => events.push(`complete:${mode}:${color.toCssString()}`)} />
      </div>
    {/each}
    <output aria-label={`ColorPicker theme events ${id}`}>{JSON.stringify(events)}</output>
  </section>
</ConfigProvider>
