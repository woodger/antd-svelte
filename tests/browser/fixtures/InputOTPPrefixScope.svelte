<script lang="ts">
  import { untrack } from 'svelte';
  import { InputOTP, type ComponentSize, type InputVariant } from 'antd-svelte';

  export interface OTPPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    disabled?: boolean;
    size?: ComponentSize;
    variant?: InputVariant;
    status?: 'error' | 'warning';
    mask?: boolean | string;
    type?: 'number';
    separator?: boolean;
    empty?: boolean;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: OTPPrefixSample;
    local?: boolean;
  } = $props();
  let value = $state(untrack(() => sample.empty ? '' : '12'));
  let nativeElement = $state<HTMLDivElement>();
  let events = $state<string[]>([]);
</script>

<form data-otp-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <InputOTP prefixCls={local ? sample.local : undefined} bind:nativeElement {value}
    defaultValue={sample.empty ? '' : '12'} length={4} aria-label={`${scope} code`}
    disabled={sample.disabled} size={sample.size} variant={sample.variant} status={sample.status}
    mask={sample.mask} type={sample.type} separator={sample.separator ? '-' : undefined}
    classNames={{ root: 'fixture-otp-root', separator: 'fixture-otp-separator' }}
    styles={sample.userStyle ? { root: 'column-gap:11px', input: 'padding-inline:9px' } : undefined}
    style={sample.userStyle ? 'column-gap:13px' : undefined}
    onInput={cells => {
      value = cells.join('');
      events.push(`input:${value}`);
    }} onChange={text => events.push(`change:${text}`)} />
  <output aria-label={`${scope} OTP refs`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} OTP events`}>{events.join('|')}</output>
</form>
