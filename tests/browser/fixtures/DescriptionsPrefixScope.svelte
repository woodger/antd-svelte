<script lang="ts">
  import { Descriptions, type DescriptionsProps, type ComponentSize } from 'antd-svelte';

  export interface DescriptionsPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    bordered?: boolean;
    vertical?: boolean;
    size?: string;
    noColon?: boolean;
    responsive?: boolean;
    tableContext?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: DescriptionsPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let rootPrefix = $derived(scope === 'sibling' ? 'ant'
    : (scope === 'nested' && sample.childPrefix || sample.prefix || 'ant'));
  let size = $derived<ComponentSize | undefined>(
    sample.size === 'small' || sample.size === 'medium' ? sample.size : undefined
  );
  let items = $derived<DescriptionsProps['items']>([
    { key: 'name', label: 'Name', children: editor },
    { key: 'status', label: 'Status', children: 'Active' },
    { key: 'notes', label: 'Notes', children: 'Description', span: 'filled' },
    { key: 'last', label: 'Last', children: 'Value' }
  ]);
</script>

{#snippet editor()}
  <input aria-label={`${scope} descriptions draft`} name="draft" value="Draft"
    style="width:90px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />
{/snippet}
{#snippet content()}
  <Descriptions bind:nativeElement data-prefix-desc-root title="Parameters" extra="Extra"
    prefixCls={local ? sample.local : undefined} {items} {size}
    bordered={sample.bordered} layout={sample.vertical ? 'vertical' : 'horizontal'}
    colon={!sample.noColon} column={sample.responsive ? { xs: 1, md: 2, lg: 3 } : 3}
    classNames={({ props }) => ({
      root: `fixture-raw-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`,
      header: 'fixture-header', title: 'fixture-title', extra: 'fixture-extra',
      label: 'fixture-label', content: 'fixture-content'
    })} />
{/snippet}
<form data-descriptions-prefix-scope={scope} style="width:480px"
  onsubmit={event => event.preventDefault()}>
  {#if sample.tableContext}
    <div class={`${rootPrefix}-table-wrapper`}><table style="width:100%;border-spacing:0"><tbody>
      <tr class={`${rootPrefix}-table-expanded-row`}><td>{@render content()}</td></tr>
    </tbody></table></div>
  {:else}{@render content()}{/if}
  <output aria-label={`${scope} Descriptions prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
</form>
