<script lang="ts">
  import { Listy, type ListyRef } from 'antd-svelte';

  export interface ListyPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    userStyle?: boolean;
    links?: boolean;
    short?: boolean;
    noHeight?: boolean;
    noSticky?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: ListyPrefixSample;
    local?: boolean;
  } = $props();
  let refs = $state<Record<string, ListyRef | undefined>>({});
  const items = Array.from({ length: 24 }, (_, index) => ({
    id: `row-${String(index).padStart(2, '0')}`, index, team: String(Math.floor(index / 6))
  }));
  let records = $derived(sample.short ? items.slice(0, 2) : items);
</script>

{#snippet title(team: string)}Group {team}{/snippet}

<section data-listy-prefix-scope={scope} style="width:480px;padding:12px">
  {#each ['raw', 'raw-grouped', 'virtual', 'virtual-grouped'] as part}
    {@const grouped = part.endsWith('-grouped')}
    <div data-listy-prefix-part={part}>
      <Listy prefixCls={local ? sample.local : undefined} items={records} rowKey="id"
        height={sample.noHeight ? undefined : 160} virtual={part.startsWith('virtual')}
        sticky={grouped && !sample.noSticky}
        group={grouped ? { key: item => item.team, title } : undefined}
        classNames={{ root: 'fixture-listy-prefix', item: 'fixture-listy-row',
          groupHeader: 'fixture-listy-header' }}
        styles={sample.userStyle ? {
          root: 'font-size:18px;color:rgb(1,2,3)', item: 'padding-block:5px',
          groupHeader: 'padding-block:7px'
        } : undefined} style={sample.userStyle ? 'color:rgb(4,5,6)' : undefined}
        bind:ref={refs[part]}>
        {#snippet itemRender(item)}<div data-record={item.id}>
          {#if sample.links}<a href={`#${item.id}`}>Record {item.id} </a>
          {:else}<span>Record {item.id} </span>{/if}<input
            aria-label={`${scope} ${part} ${item.id} draft`} value="Draft" style="width:100px" />
        </div>{/snippet}
      </Listy>
    </div>
  {/each}
  <button type="button" onclick={() => refs['virtual-grouped']?.scrollTo({
    key: 'row-12', align: 'top'
  })}>Scroll grouped list {scope}</button>
  <button type="button" onclick={() => refs['raw-grouped']?.scrollTo({
    key: 'row-12', align: 'top'
  })}>Scroll raw list {scope}</button>
  <output aria-label={`${scope} Listy refs`}>{Object.values(refs).filter(Boolean).length}</output>
</section>
