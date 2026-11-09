<script lang="ts">
  import { Mentions, type MentionsProps } from 'antd-svelte';

  export interface MentionsPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    size?: MentionsProps['size'];
    status?: MentionsProps['status'];
    variant?: MentionsProps['variant'];
    disabled?: boolean;
    readonly?: boolean;
    loading?: boolean;
    empty?: boolean;
    popup?: boolean;
    top?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: MentionsPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
</script>

<form data-mentions-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <Mentions prefixCls={local ? sample.local : undefined} defaultValue="Draft"
    options={sample.empty ? [] : [
      { value: 'alpha', label: 'Alpha' }, { value: 'beta', label: 'Beta' },
      { value: 'gamma', label: 'Gamma', disabled: true }
    ]} size={sample.size} status={sample.status} variant={sample.variant}
    disabled={sample.disabled} readonly={sample.readonly} loading={sample.loading}
    placement={sample.top ? 'top' : 'bottom'} aria-label={`${scope} mention`}
    name={`${scope}-comment`} rows={1} class="fixture-mentions-prefix"
    popupClassName={`fixture-${scope}-mentions-popup`} style="width:320px"
    bind:nativeElement onSelect={option => events.push(option.value)} />
  <output aria-label={`${scope} Mentions ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} Mentions events`}>{events.join('|')}</output>
</form>
