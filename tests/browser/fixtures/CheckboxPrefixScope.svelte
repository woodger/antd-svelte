<script lang="ts">
  import { Checkbox, CheckboxGroup, Row } from 'antd-svelte';

  export interface CheckboxPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    childLocal?: string;
    rtl?: boolean;
    aliases?: boolean;
    checked?: boolean;
    mixed?: boolean;
    disabled?: boolean;
    snippet?: boolean;
    row?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: CheckboxPrefixSample;
    local?: boolean;
  } = $props();
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLSpanElement>();
  let value = $state(['a']);
  let events = $state<string[]>([]);
  let prefix = $derived(local ? sample.local : undefined);
  let childPrefix = $derived(local ? sample.childLocal : undefined);
</script>

{#snippet label(text: string)}<span class="fixture-checkbox-label">{text}</span>{/snippet}
{#snippet alpha()}{@render label('Alpha')}{/snippet}
{#snippet beta()}{@render label('Beta')}{/snippet}
{#snippet gamma()}{@render label('Gamma')}{/snippet}
{#snippet choices()}
  {#each [{ value: 'a', text: 'Alpha' }, { value: 'b', text: 'Beta' },
    { value: 'c', text: 'Gamma' }] as item (item.value)}
    <Checkbox prefixCls={childPrefix} value={item.value}>{@render label(item.text)}</Checkbox>
  {/each}
{/snippet}
<form data-checkbox-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <Checkbox prefixCls={prefix} checked={sample.checked !== false} indeterminate={sample.mixed}
    value="solo" name={`${scope}-solo`} disabled={sample.disabled}
    class="fixture-checkbox-single" bind:inputElement bind:nativeElement>
    {@render label('Standalone')}
  </Checkbox>
  <CheckboxGroup prefixCls={prefix} class="fixture-checkbox-group" name={`${scope}-choice`}
    defaultValue={['a']} bind:value onChange={values => events.push(values.join(','))}
    disabled={sample.disabled} options={sample.snippet || sample.row ? undefined : [
      { value: 'a', label: alpha }, { value: 'b', label: beta }, { value: 'c', label: gamma }
    ]}>
    {#if sample.row}<Row class="fixture-checkbox-row">{@render choices()}</Row>
    {:else}{@render choices()}{/if}
  </CheckboxGroup>
  <input aria-label={`${scope} checkbox draft`} name="draft" value="Draft" />
  <output aria-label={`${scope} checkbox refs`}>{inputElement && nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} checkbox events`}>{events.join('|')}</output>
</form>
