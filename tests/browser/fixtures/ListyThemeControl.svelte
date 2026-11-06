<script lang="ts">
  import { ConfigProvider, Listy, type ListyRef } from 'antd-svelte';
  import ListyThemeRecord, { type ListyThemeRecordData } from './ListyThemeRecord.svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  const items: ListyThemeRecordData[] = Array.from({ length: 40 }, (_, index) => ({
    id: `row-${String(index).padStart(2, '0')}`,
    team: String(Math.floor(index / 10)),
    index
  }));
  let refs = $state<Record<string, ListyRef | undefined>>({});
  let styled = $derived(priority || id === 'priority');
  let style = $derived([
    styled && 'font-size:30px;color:rgb(255,0,0)',
    id === 'variable' && `--${prefix}-listy-item-padding-block:3px;--${prefix}-color-text:rgb(255,0,255)`
  ].filter(Boolean).join(';') || undefined);
  let styles = $derived(styled ? {
    root: 'font-size:28px;color:rgb(0,128,0);position:static;line-height:1.25',
    item: 'padding-block:5px;color:rgb(128,0,128)',
    groupHeader: 'padding-block:9px'
  } : undefined);
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} listy={styled ? {
  style: 'font-size:26px;color:rgb(0,0,255)',
  styles: {
    root: 'font-size:24px;color:rgb(255,0,255)',
    item: 'padding-inline:8px;color:rgb(255,0,0)',
    groupHeader: 'padding-block:7px'
  }
} : undefined}>
  <section data-listy-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'} style="width:600px;padding:16px">
    {#each ['raw', 'raw-grouped', 'virtual', 'virtual-grouped'] as part}
      {@const grouped = part.endsWith('-grouped')}
      <div data-listy-part={part}>
        <Listy {style} {styles} {items} rowKey="id" height={160}
          virtual={part.startsWith('virtual')} sticky={grouped}
          group={grouped ? { key: item => item.team, title } : undefined} bind:ref={refs[part]}>
          {#snippet itemRender(item)}<ListyThemeRecord {item} {id} {part} />{/snippet}
        </Listy>
      </div>
    {/each}
    {#each ['row-02', 'row-12'] as key}
      <button type="button" onclick={() => refs['virtual-grouped']?.scrollTo({
        key, align: 'top'
      })}>Scroll themed {key} {id}</button>
    {/each}
    <output aria-label={`Listy theme refs ${id}`}>
      {Object.values(refs).filter(Boolean).length}
    </output>
  </section>
</ConfigProvider>

{#snippet title(team: string)}Group {team}{/snippet}
