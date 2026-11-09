<script lang="ts">
  import { Rate, type RateCharacterInfo, type RateProps } from 'antd-svelte';
  import type { Snippet } from 'svelte';

  export interface RatePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    disabled?: boolean;
    half?: boolean;
    value?: number;
    count?: number;
    keyboard?: boolean;
    size?: RateProps['size'];
    character?: boolean;
    render?: boolean;
    tooltips?: boolean;
    userStyle?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: RatePrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLUListElement>();
  let events = $state<string[]>([]);
</script>

{#snippet character(info: RateCharacterInfo)}<b data-character-prefix={info.prefixCls}>{info.index + 1}</b>{/snippet}
{#snippet renderer(origin: Snippet, _info: RateCharacterInfo)}<span style="display:contents">{@render origin()}</span>{/snippet}

<form data-rate-prefix-scope={scope} style="width:480px;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <Rate prefixCls={local ? sample.local : undefined} defaultValue={sample.value ?? 2.5}
    count={sample.count ?? 5} allowHalf={sample.half} disabled={sample.disabled}
    keyboard={sample.keyboard} size={sample.size} aria-label={`${scope} rating`}
    character={sample.character ? character : undefined}
    characterRender={sample.render ? renderer : undefined}
    tooltips={sample.tooltips ? ['One', 'Two', 'Three', 'Four', 'Five'] : undefined}
    class="fixture-rate-prefix" style={sample.userStyle ? 'font-size:27px;color:rgb(1,2,3)' : undefined}
    bind:nativeElement onChange={value => events.push(String(value))} />
  <input aria-label={`${scope} rate draft`} name="draft" value="Draft" />
  <output aria-label={`${scope} rate ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} rate events`}>{events.join('|')}</output>
</form>
