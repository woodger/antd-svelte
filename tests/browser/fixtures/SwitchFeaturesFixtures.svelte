<script lang="ts">
  import { flushSync } from 'svelte';
  import { ConfigProvider, Switch, type SwitchEvent, type SwitchSize } from 'antd-svelte';

  let checked = $state(false);
  let value = $state(false);
  let primary = $state(false);
  let secondary = $state(true);
  let defaultValue = $state(true);
  let mounted = $state(true);
  let freeze = $state(false);
  let cancel = $state(false);
  let remove = $state(false);
  let loading = $state(false);
  let disabled = $state(false);
  let styled = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let autoFocus = $state(false);
  let size = $state<SwitchSize>('medium');
  let events = $state<string[]>([]);
  let focusEvents = $state<string[]>([]);
  let aliasEvents = $state<boolean[]>([]);
  let submits = $state(0);
  let ref = $state<HTMLButtonElement>();
  let nativeElement = $state<HTMLButtonElement>();
  let instance = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  let generation = $state(0);

  function changed(next: boolean, event: SwitchEvent) {
    events.push(`change:${next}:${event.type}:${event.currentTarget.tagName}`);
    if (remove) flushSync(() => { mounted = false; });
  }

  function keyedProps(version: number) {
    return { checkedChildren: version, defaultChecked: version % 2 === 0 };
  }
</script>

<style>
  section { padding: 20px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-block: 12px; }
  form { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  output { display: block; overflow-wrap: anywhere; }
</style>

{#snippet rich()}<strong>Rich ON</strong>{/snippet}

<section id="switch-features-fixture">
  <h2>Switch source features</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount source switch</label>
    <label><input type="checkbox" bind:checked={freeze} /> Freeze source switch</label>
    <label><input type="checkbox" bind:checked={cancel} /> Cancel source switch click</label>
    <label><input type="checkbox" bind:checked={remove} /> Remove source switch on change</label>
    <label><input type="checkbox" bind:checked={loading} /> Load source switch</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable source switch</label>
    <label><input type="checkbox" bind:checked={styled} /> Style source switch</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark source switch</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact source switch</label>
    <label><input type="checkbox" bind:checked={autoFocus} /> Autofocus source switch</label>
    <label>Source switch size <select bind:value={size} aria-label="Source switch size">
      <option value="medium">Medium</option><option value="small">Small</option>
      <option value="middle">Middle</option><option value="default">Default</option>
    </select></label>
    <button type="button" onclick={() => { checked = true; }}>Set source switch owner</button>
    <button type="button" onclick={() => { value = !value; }}>Set source switch alias</button>
    <button type="button" onclick={() => { defaultValue = false; }}>Replace source switch default</button>
    <button type="button" onclick={() => { events = []; }}>Clear source switch events</button>
    <button type="button" onclick={() => ref?.focus({ preventScroll: true })}>Focus source switch ref</button>
    <button type="button" onclick={() => ref?.blur()}>Blur source switch ref</button>
    <button type="button" onclick={() => instance?.focus()}>Focus source switch instance</button>
    <button type="button" onclick={() => instance?.blur()}>Blur source switch instance</button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    switch={styled ? {
      class: 'switch-config',
      style: 'color:red',
      classNames: info => ({
        root: `switch-config-${info.props.size}-${info.props.disabled}`,
        content: 'switch-config-content',
        indicator: 'switch-config-indicator'
      }),
      styles: { root: 'color:blue', content: 'color:purple', indicator: 'outline:1px solid red' }
    } : undefined}>
    <form id="source-switch-form" onsubmit={event => {
      event.preventDefault();
      submits++;
    }}>
      {#if mounted}
        <Switch bind:checked={() => checked, next => { if (!freeze) checked = next; }}
          bind:ref bind:nativeElement bind:this={instance} {size} {loading} {disabled}
          name="enabled" aria-label="Source switch" autoFocus={autoFocus} tabIndex={2}
          checkedChildren={rich} unCheckedChildren={0}
          classNames={{ root: 'switch-local', content: 'switch-local-content' }}
          styles={styled ? { root: 'color:green', content: 'font-weight:bold' } : undefined}
          style={styled ? 'color:orange' : undefined}
          onclick={event => {
            events.push('native-click');
            if (cancel) event.preventDefault();
          }}
          onCheckedChange={next => { events.push(`checked:${next}`); }} onChange={changed}
          onClick={(next, event) => { events.push(`click:${next}:${event.type}`); }}
          onKeyDown={event => { events.push(`source-key:${event.key}`); }}
          onkeydown={event => { events.push(`native-key:${event.key}`); }}
          onFocus={() => { focusEvents.push('source-focus'); }}
          onfocus={() => { focusEvents.push('native-focus'); }}
          onBlur={() => { focusEvents.push('source-blur'); }}
          onblur={() => { focusEvents.push('native-blur'); }} />
      {/if}
      <Switch bind:value name="alias" aria-label="Alias switch"
        onChange={next => { aliasEvents.push(next); }} checkedChildren="Yes" unCheckedChildren="No" />
      <Switch bind:checked={primary} bind:value={secondary} name="priority"
        aria-label="Priority switch" />
      <Switch {defaultValue} name="default" aria-label="Default alias switch" />
      <Switch defaultChecked={false} defaultValue={true} aria-label="Default priority switch" />
      <button type="submit">Submit source switches</button>
      <button type="reset">Reset source switches</button>
      <button type="button" onclick={event => {
        event.currentTarget.form?.reset();
        flushSync(() => { mounted = false; });
      }}>Reset and remove source switch</button>
    </form>
    <ConfigProvider><Switch aria-label="Inherited switch config" /></ConfigProvider>
    {#key generation}
      <Switch {...keyedProps(generation)} aria-label="Keyed source switch"
        onBlur={() => { focusEvents.push('keyed-blur'); }} />
    {/key}
    <button type="button" onpointerdown={event => event.preventDefault()}
      onclick={() => { generation++; }}>Replace keyed source switch</button>
  </ConfigProvider>
  <output aria-label="Source switch events">{events.join('|')}</output>
  <output aria-label="Source switch owner">{String(checked)}</output>
  <output aria-label="Source switch alias owner">{String(value)}</output>
  <output aria-label="Source switch alias events">{JSON.stringify(aliasEvents)}</output>
  <output aria-label="Source switch priority owners">{String(primary)}|{String(secondary)}</output>
  <output aria-label="Source switch focus events">{focusEvents.join('|')}</output>
  <output aria-label="Source switch refs">{Boolean(ref && ref === nativeElement)}</output>
  <output aria-label="Source switch submits">{submits}</output>
</section>
