<script lang="ts">
  import { InputSearch, type ComponentSize, type InputVariant } from 'antd-svelte';

  export interface SearchPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    inputPrefix?: string;
    rtl?: boolean;
    aliases?: boolean;
    disabled?: boolean;
    loading?: boolean;
    readOnly?: boolean;
    clear?: boolean;
    count?: boolean;
    affix?: boolean;
    enterButton?: boolean | string;
    size?: ComponentSize;
    variant?: InputVariant;
    status?: 'error' | 'warning';
    userStyle?: boolean;
  }

  let { scope, sample, global = 'ant', local = true }: {
    scope: string;
    sample: SearchPrefixSample;
    global?: string;
    local?: boolean;
  } = $props();
  let value = $state('Draft');
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLInputElement | HTMLSpanElement>();
  let events = $state<string[]>([]);
</script>

<form data-search-prefix-scope={scope} data-search-global={global}
  style="width:480px;padding:12px" onsubmit={event => event.preventDefault()}>
  <InputSearch prefixCls={local ? sample.local : undefined}
    inputPrefixCls={local ? sample.inputPrefix : undefined}
    bind:value bind:inputElement bind:nativeElement
    name="search" aria-label={`${scope} search draft`} disabled={sample.disabled}
    loading={sample.loading} enterButton={sample.enterButton}
    readOnly={sample.readOnly} size={sample.size} variant={sample.variant} status={sample.status}
    prefix={sample.affix ? '@' : undefined} suffix={sample.affix ? 'ms' : undefined}
    allowClear={sample.clear} showCount={sample.count} maxLength={12}
    classNames={{ root: 'fixture-search-root', input: 'fixture-search-input' }}
    styles={sample.userStyle ? { root: 'width:220px' } : undefined}
    style="width:240px"
    onValueChange={text => events.push(`value:${text}`)}
    onSearch={(text, _event, info) => events.push(`${info?.source}:${text}`)} />
  <output aria-label={`${scope} search refs`}>{inputElement && nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} search events`}>{events.join('|')}</output>
</form>
