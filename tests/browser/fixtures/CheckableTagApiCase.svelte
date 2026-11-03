<script lang="ts">
  import { untrack } from 'svelte';
  import { CheckableTag } from 'antd-svelte';
  import type { CheckableTagApiCase } from './checkable-tag-api-presets';

  let { sample, aliases = false, direction }: {
    sample: CheckableTagApiCase;
    aliases?: boolean;
    direction?: 'ltr' | 'rtl';
  } = $props();
  let checked = $state(untrack(() => sample.checked ?? false));
  let mounted = $state(true);
  let events = $state<string[]>([]);
  let nativeElement = $state<HTMLButtonElement>();

  function handleChange(value: boolean) {
    events = [...events, `change:${value}`];
    if (sample.accept) checked = value;
    if (sample.removeOnChange) mounted = false;
  }

  function handleClick(event: MouseEvent, alias = false) {
    events = [...events, `${alias ? 'onclick' : 'click'}:${event.currentTarget instanceof Element
      ? event.currentTarget.getAttribute('data-checkable-root') : 'missing'}`];
    if (sample.preventClick) event.preventDefault();
  }

  function handleKeyDown(event: KeyboardEvent, alias = false) {
    events = [...events, `${alias ? 'onkeydown' : 'key'}:${event.key}:${event.repeat}`];
    if (sample.preventKey) event.preventDefault();
    if (sample.removeOnKeyDown) mounted = false;
  }
</script>

<form onsubmit={event => event.preventDefault()}>
  <button type="button">Before API tag</button>
  {#if mounted}
    <CheckableTag
      {checked}
      disabled={sample.disabled}
      onChange={handleChange}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onclick={aliases ? event => handleClick(event, true) : undefined}
      onkeydown={aliases ? event => handleKeyDown(event, true) : undefined}
      bind:nativeElement
      data-checkable-root="api"
      title="API <tag>"
      dir={direction}
      aria-label="API tag"
      class="api-checkable"
      style="letter-spacing:1px"
    >API content</CheckableTag>
  {/if}
  <button type="button">After API tag</button>
</form>
<output aria-label="Checkable API events">{JSON.stringify(events)}</output>
<output aria-label="Checkable API ref">{nativeElement ? 'button' : 'empty'}</output>
<output aria-label="Checkable API checked">{String(checked)}</output>
<button type="button" onclick={() => checked = !checked}>Set API checked</button>
<button type="button" onclick={() => mounted = !mounted}>Toggle API mount</button>
<button type="button" onclick={() => nativeElement?.focus()}>Focus API tag</button>
