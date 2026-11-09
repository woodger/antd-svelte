<script lang="ts">
  import { Badge, Radio, RadioButton, RadioGroup, type ComponentSize } from 'antd-svelte';

  export interface RadioPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    childLocal?: string;
    rtl?: boolean;
    aliases?: boolean;
    button?: boolean;
    solid?: boolean;
    vertical?: boolean;
    block?: boolean;
    disabled?: boolean;
    size?: ComponentSize;
    badge?: boolean;
    snippet?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: RadioPrefixSample;
    local?: boolean;
  } = $props();
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLSpanElement>();
  let value = $state('a');
  let events = $state<string[]>([]);
  let prefix = $derived(local ? sample.local : undefined);
  let childPrefix = $derived(local ? sample.childLocal : undefined);
</script>

{#snippet label(text: string)}<span class="fixture-radio-label">{text}</span>{/snippet}
{#snippet alpha()}{@render label('Alpha')}{/snippet}
{#snippet beta()}{@render label('Beta')}{/snippet}
{#snippet gamma()}{@render label('Gamma')}{/snippet}
<form data-radio-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <Radio prefixCls={prefix} defaultChecked value="solo" name={`${scope}-solo`}
    disabled={sample.disabled} class="fixture-radio-single" bind:inputElement bind:nativeElement>
    {@render label('Standalone')}
  </Radio>
  <RadioButton prefixCls={prefix} defaultChecked value="button" name={`${scope}-button`}
    disabled={sample.disabled} class="fixture-radio-button">
    {@render label('Button')}
  </RadioButton>
  <RadioGroup prefixCls={prefix} class="fixture-radio-group" name={`${scope}-choice`}
    defaultValue="a" bind:value onChange={event => events.push(String(event.target.value))}
    optionType={sample.button || sample.badge ? 'button' : 'default'}
    buttonStyle={sample.solid ? 'solid' : 'outline'} size={sample.size}
    vertical={sample.vertical} block={sample.block} disabled={sample.disabled}
    options={sample.badge || sample.snippet ? undefined : [
      { value: 'a', label: alpha }, { value: 'b', label: beta }, { value: 'c', label: gamma }
    ]}>
    {#each [{ value: 'a', text: 'Alpha' }, { value: 'b', text: 'Beta' },
      { value: 'c', text: 'Gamma' }] as item (item.value)}
      {#if sample.badge}
        <Badge count="5"><RadioButton prefixCls={childPrefix} value={item.value}>
          {@render label(item.text)}
        </RadioButton></Badge>
      {:else}
        <Radio prefixCls={childPrefix} value={item.value}>{@render label(item.text)}</Radio>
      {/if}
    {/each}
  </RadioGroup>
  <input aria-label={`${scope} radio draft`} name="draft" value="Draft" />
  <output aria-label={`${scope} radio refs`}>{inputElement && nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} radio events`}>{events.join('|')}</output>
</form>
