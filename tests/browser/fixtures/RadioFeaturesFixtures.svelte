<script lang="ts">
  import { flushSync } from 'svelte';
  import {
    ConfigProvider,
    Radio,
    RadioButton,
    RadioGroup,
    type RadioChangeEvent,
    type RadioRef,
    type RadioValue
  } from 'antd-svelte';

  let value = $state<RadioValue | undefined>(0);
  let checked = $state(false);
  let mounted = $state(true);
  let freeze = $state(false);
  let removeOnChange = $state(false);
  let styled = $state(false);
  let stop = $state(false);
  let disabled = $state(false);
  let vertical = $state(false);
  let orientation = $state<'inherit' | 'horizontal' | 'vertical'>('inherit');
  let optionType = $state<'default' | 'button'>('default');
  let dark = $state(false);
  let compact = $state(false);
  let autofocus = $state(false);
  let richCount = $state(1);
  let events = $state<string[]>([]);
  let standaloneEvents = $state<string[]>([]);
  let focusEvents = $state<string[]>([]);
  let mouseEvents = $state<string[]>([]);
  let keyEvents = $state<string[]>([]);
  let changeEvents = $state(0);
  let clickEvents = $state(0);
  let submits = $state(0);
  let ref = $state<RadioRef>();
  let nativeElement = $state<HTMLSpanElement>();
  let inputElement = $state<HTMLInputElement>();
  let groupElement = $state<HTMLFieldSetElement>();
  let instance = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();

  function optionChange(event: RadioChangeEvent) {
    events.push(`option:${typeof event.target.value}:${event.target.value}:${value}`);
    if (stop) event.stopPropagation();
  }
</script>

<style>
  section { padding: 20px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-block: 12px; }
  form { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
  output { display: block; overflow-wrap: anywhere; }
</style>

{#snippet richLabel()}<strong>Rich option {richCount}</strong>{/snippet}

<section id="radio-features-fixture">
  <h2>Radio source features</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount source radios</label>
    <label><input type="checkbox" bind:checked={freeze} /> Freeze source radio owner</label>
    <label><input type="checkbox" bind:checked={removeOnChange} /> Remove source radios on change</label>
    <label><input type="checkbox" bind:checked={styled} /> Style source radios</label>
    <label><input type="checkbox" bind:checked={stop} /> Stop source radio change</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable source radio group</label>
    <label><input type="checkbox" bind:checked={vertical} /> Vertical source radios</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark source radios</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact source radios</label>
    <label><input type="checkbox" bind:checked={autofocus} /> Autofocus source radio</label>
    <label>Source radio orientation<select bind:value={orientation} aria-label="Source radio orientation">
      <option value="inherit">inherit</option><option>horizontal</option><option>vertical</option>
    </select></label>
    <label>Source radio appearance<select bind:value={optionType} aria-label="Source radio appearance">
      <option>default</option><option>button</option>
    </select></label>
    <button type="button" onclick={() => { richCount++; }}>Update rich radio label</button>
    <button type="button" onclick={() => { value = false; }}>Set source radio owner</button>
    <button type="button" onclick={() => { events = []; }}>Clear source radio events</button>
    <button type="button" onclick={() => ref?.focus({ preventScroll: true })}>Focus source radio ref</button>
    <button type="button" onclick={() => ref?.blur()}>Blur source radio ref</button>
    <button type="button" onclick={() => instance?.focus()}>Focus source radio instance</button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} radio={styled ? {
    class: 'source-radio-config',
    style: 'color:red',
    classNames: info => ({
      root: `source-config-root source-config-${info.props.checked ? 'checked' : 'unchecked'}`,
      icon: 'source-config-icon',
      label: 'source-config-label'
    }),
    styles: { root: 'color:blue', icon: 'outline:1px solid red', label: 'color:purple' }
  } : undefined}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Фикстура считает всплывающие clicks, не добавляя интерактивность форме.) -->
    <form id="source-radio-form" onchange={() => { changeEvents++; }}
      onclick={() => { clickEvents++; }} onsubmit={event => { event.preventDefault(); submits++; }}>
      {#if mounted}
        <RadioGroup bind:value={() => value, next => { if (!freeze) value = next; }}
          bind:nativeElement={groupElement} name="source" aria-label="Source radio options"
          {vertical} orientation={orientation === 'inherit' ? undefined : orientation}
          {optionType} {disabled} options={[
            { value: 0, label: 'Numeric zero', id: 'source-radio-zero', title: 'Zero title',
              className: 'zero-option', style: 'color:green', onChange: optionChange },
            { value: false, label: 'Boolean false', required: true, onChange: optionChange },
            { value: '0', label: richLabel, onChange: optionChange },
            { value: 'locked', label: 'Locked source option', disabled: true }
          ]}
          onChange={event => {
            events.push(`group:${typeof event.target.value}:${event.target.value}:${event.target.checked}:${event.nativeEvent instanceof Event}`);
            if (removeOnChange) flushSync(() => { mounted = false; });
          }}
          onValueChange={next => { events.push(`value:${typeof next}:${next}`); }}
          onFocus={event => { focusEvents.push(`focus:${event.target instanceof HTMLInputElement}`); }}
          onBlur={event => { focusEvents.push(`blur:${event.target instanceof HTMLInputElement}`); }} />
        <RadioButton bind:this={instance} bind:checked bind:ref bind:nativeElement bind:inputElement
          value={false} name="standalone" autoFocus={autofocus} tabIndex={2}
          classNames={info => ({ root: `source-checked-${info.props.checked}`, icon: 'source-local-icon' })}
          styles={styled ? { root: 'color:green', label: 'font-weight:bold' } : undefined}
          style={styled ? 'color:orange' : undefined}
          onCheckedChange={next => { standaloneEvents.push(`checked:${next}`); }}
          onChange={event => { standaloneEvents.push(`change:${typeof event.target.value}:${event.target.value}`); }}
          onchange={event => { standaloneEvents.push(`native:${event.currentTarget.value}`); }}
          onClick={() => { standaloneEvents.push('click'); }}
          onKeyDown={event => { keyEvents.push(`source-key:${event.key}`); }}
          onkeydown={event => { keyEvents.push(`native-key:${event.key}`); }}
          onKeyPress={event => { keyEvents.push(`source-press:${event.key}`); }}
          onkeypress={event => { keyEvents.push(`native-press:${event.key}`); }}
          onMouseEnter={event => { mouseEvents.push(`enter:${event.currentTarget.tagName}`); }}
          onMouseLeave={event => { mouseEvents.push(`leave:${event.currentTarget.tagName}`); }}>
          Standalone source radio
        </RadioButton>
      {/if}
      <button type="submit">Submit source radios</button>
      <button type="reset">Reset source radios</button>
    </form>
    <ConfigProvider>
      <Radio checked aria-label="Inherited semantic radio">Inherited semantic radio</Radio>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Source radio value">{JSON.stringify(value) ?? 'undefined'}</output>
  <output aria-label="Source radio events">{events.join('|')}</output>
  <output aria-label="Source standalone events">{standaloneEvents.join('|')}</output>
  <output aria-label="Source radio focus events">{focusEvents.join('|')}</output>
  <output aria-label="Source radio mouse events">{mouseEvents.join('|')}</output>
  <output aria-label="Source radio key events">{keyEvents.join('|')}</output>
  <output aria-label="Source radio change bubbles">{changeEvents}</output>
  <output aria-label="Source radio click bubbles">{clickEvents}</output>
  <output aria-label="Source radio submits">{submits}</output>
  <output aria-label="Source radio refs">{Boolean(ref && inputElement && nativeElement
    && ref.input === inputElement && ref.nativeElement === nativeElement)}</output>
  <output aria-label="Source radio group ref">{groupElement?.tagName ?? 'none'}</output>
</section>
