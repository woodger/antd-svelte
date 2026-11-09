<script lang="ts">
  import { untrack } from 'svelte';
  import { Input, TextArea, type ComponentSize, type InputVariant } from 'antd-svelte';

  export interface InputPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    clear?: boolean;
    count?: boolean;
    affix?: boolean;
    size?: ComponentSize;
    variant?: InputVariant;
    status?: 'error' | 'warning';
    autoSize?: boolean;
    empty?: boolean;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: InputPrefixSample;
    local?: boolean;
  } = $props();
  let value = $state(untrack(() => sample.empty ? '' : 'Draft'));
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLInputElement | HTMLSpanElement>();
  let textarea = $state<HTMLTextAreaElement>();
  let textRoot = $state<HTMLElement>();
  let events = $state<string[]>([]);
  let prefixCls = $derived(local ? sample.local : undefined);
  let rootStyle = $derived(sample.userStyle ? 'width:240px;border-radius:13px' : 'width:240px');
</script>

<form data-input-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <Input {prefixCls} bind:value bind:inputElement bind:nativeElement
    name="single" aria-label={`${scope} single draft`} disabled={sample.disabled}
    readOnly={sample.readOnly} size={sample.size} variant={sample.variant} status={sample.status}
    prefix={sample.affix ? '@' : undefined} suffix={sample.affix ? 'ms' : undefined}
    allowClear={sample.clear} showCount={sample.count} maxLength={12}
    classNames={{ root: 'fixture-input-root', input: 'fixture-input-leaf',
      clear: 'fixture-input-clear', count: 'fixture-input-count' }}
    styles={sample.userStyle ? { root: 'border-radius:11px' } : undefined}
    style={rootStyle} onValueChange={text => events.push(`input:${text}`)} />
  <TextArea {prefixCls} bind:value bind:nativeElement={textarea} bind:rootElement={textRoot}
    name="multiline" aria-label={`${scope} multiline draft`} disabled={sample.disabled}
    readOnly={sample.readOnly} size={sample.size} variant={sample.variant} status={sample.status}
    allowClear={sample.clear} showCount={sample.count} maxLength={12} rows={2}
    autoSize={sample.autoSize ? { minRows: 2, maxRows: 4 } : false}
    classNames={{ root: 'fixture-textarea-root', textarea: 'fixture-textarea-leaf',
      clear: 'fixture-input-clear', count: 'fixture-input-count' }}
    styles={sample.userStyle ? { root: 'border-radius:11px' } : undefined}
    style={rootStyle} onValueChange={text => events.push(`textarea:${text}`)} />
  <output aria-label={`${scope} input refs`}>{inputElement && nativeElement && textarea && textRoot ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} input events`}>{events.join('|')}</output>
</form>
