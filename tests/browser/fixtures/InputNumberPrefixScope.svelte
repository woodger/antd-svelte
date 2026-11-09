<script lang="ts">
  import { untrack } from 'svelte';
  import {
    InputNumber, type ComponentSize, type InputNumberRef, type InputVariant
  } from 'antd-svelte';

  export interface NumberPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    controls?: boolean;
    affix?: boolean;
    size?: ComponentSize;
    variant?: InputVariant;
    status?: 'error' | 'warning';
    spinner?: boolean;
    outOfRange?: boolean;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: NumberPrefixSample;
    local?: boolean;
  } = $props();
  let value = $state<string | null>(untrack(() => sample.outOfRange ? '11' : '1.25'));
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<InputNumberRef>();
  let events = $state<string[]>([]);
</script>

<form data-number-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <InputNumber stringMode prefixCls={local ? sample.local : undefined}
    bind:value bind:inputElement bind:nativeElement bind:ref
    name="amount" aria-label={`${scope} amount`} disabled={sample.disabled}
    readOnly={sample.readOnly} size={sample.size} variant={sample.variant} status={sample.status}
    mode={sample.spinner ? 'spinner' : 'input'} controls={sample.controls}
    prefix={sample.affix ? '$' : undefined} suffix={sample.affix ? 'kg' : undefined}
    min="0" max="10" step="0.25"
    classNames={{ root: 'fixture-number-root', input: 'fixture-number-input',
      prefix: 'fixture-number-prefix', suffix: 'fixture-number-suffix',
      actions: 'fixture-number-actions' }}
    styles={sample.userStyle ? { root: 'width:130px' } : undefined}
    style={sample.userStyle ? 'width:140px' : undefined}
    onChange={text => events.push(`change:${text}`)} />
  <output aria-label={`${scope} number refs`}>{inputElement && nativeElement && ref?.nativeElement === nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} number events`}>{events.join('|')}</output>
</form>
