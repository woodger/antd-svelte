<script lang="ts">
  import { untrack } from 'svelte';
  import { Switch, type SwitchSize } from 'antd-svelte';

  export interface SwitchPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    checked?: boolean;
    disabled?: boolean;
    loading?: boolean;
    labels?: boolean;
    size?: SwitchSize;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: SwitchPrefixSample;
    local?: boolean;
  } = $props();
  let checked = $state(untrack(() => Boolean(sample.checked)));
  let nativeElement = $state<HTMLButtonElement>();
  let ref = $state<HTMLButtonElement>();
  let events = $state<string[]>([]);
</script>

<form data-switch-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <Switch prefixCls={local ? sample.local : undefined} bind:checked bind:nativeElement bind:ref
    name={`${scope}-enabled`} aria-label={`${scope} toggle`} size={sample.size}
    disabled={sample.disabled} loading={sample.loading}
    checkedChildren={sample.labels ? 'On' : undefined}
    unCheckedChildren={sample.labels ? 'Off' : undefined}
    classNames={({ props }) => ({
      root: `fixture-switch-prefix fixture-raw-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`,
      indicator: 'fixture-switch-handle'
    })} styles={sample.userStyle ? { root: 'height:29px' } : undefined}
    style={sample.userStyle ? 'height:31px' : undefined}
    onChange={value => events.push(String(value))} />
  <input aria-label={`${scope} switch draft`} name="draft" value="Draft" />
  <output aria-label={`${scope} switch refs`}>{nativeElement && nativeElement === ref ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} switch events`}>{events.join('|')}</output>
</form>
