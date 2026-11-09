<script lang="ts">
  import { InputPassword, type ComponentSize, type InputVariant } from 'antd-svelte';

  export interface PasswordPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    inputPrefix?: string;
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
    visible?: boolean;
    hiddenToggle?: boolean;
    icon?: boolean;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: PasswordPrefixSample;
    local?: boolean;
  } = $props();
  let value = $state('Draft');
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLInputElement | HTMLSpanElement>();
  let events = $state<string[]>([]);
</script>

<form data-password-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <InputPassword prefixCls={local ? sample.local : undefined}
    inputPrefixCls={local ? sample.inputPrefix : undefined}
    bind:value bind:inputElement bind:nativeElement
    name="password" aria-label={`${scope} password draft`} disabled={sample.disabled}
    readOnly={sample.readOnly} size={sample.size} variant={sample.variant} status={sample.status}
    prefix={sample.affix ? '@' : undefined} suffix={sample.affix ? 'ms' : undefined}
    allowClear={sample.clear} showCount={sample.count} maxLength={12}
    visibilityToggle={sample.hiddenToggle ? false : sample.visible ? { visible: true } : true}
    iconRender={sample.icon ? () => 'V' : undefined}
    classNames={{ root: 'fixture-password-root', input: 'fixture-password-leaf' }}
    styles={sample.userStyle ? { root: 'border-radius:11px' } : undefined}
    style={sample.userStyle ? 'width:240px;border-radius:13px' : 'width:240px'}
    onValueChange={text => events.push(`value:${text}`)} />
  <output aria-label={`${scope} password refs`}>{inputElement && nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} password events`}>{events.join('|')}</output>
</form>
