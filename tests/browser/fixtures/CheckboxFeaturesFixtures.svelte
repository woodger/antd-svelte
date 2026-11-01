<script lang="ts">
  import { flushSync } from 'svelte';
  import {
    Checkbox,
    CheckboxGroup,
    Col,
    ConfigProvider,
    Row,
    Table,
    type CheckboxChangeEvent,
    type CheckboxGroupValue,
    type CheckboxRef,
    type TableKey
  } from 'antd-svelte';

  let owner = $state<CheckboxGroupValue[]>([0]);
  let mounted = $state(true);
  let freeze = $state(false);
  let removeOnChange = $state(false);
  let hideZero = $state(false);
  let reverse = $state(false);
  let variable = $state('variable-a');
  let skip = $state(true);
  let skipped = $state(false);
  let useOptions = $state(false);
  let disabled = $state(false);
  let stop = $state(false);
  let styled = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let autoFocus = $state(false);
  let single = $state(false);
  let mixed = $state(true);
  let mutate = $state(false);
  let host = $state<string[]>([]);
  let tableKeys = $state<TableKey[]>([]);
  let events = $state<string[]>([]);
  let soloEvents = $state<string[]>([]);
  let inputEvents = $state<string[]>([]);
  let mouseEvents = $state<string[]>([]);
  let hostEvents = $state(0);
  let changeBubbles = $state(0);
  let clickBubbles = $state(0);
  let submits = $state(0);
  let ref = $state<CheckboxRef>();
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLSpanElement>();
  let groupElement = $state<HTMLFieldSetElement>();
  let instance = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  let generation = $state(0);
  let keyedEvents = $state<string[]>([]);
  let items = $derived([
    ...(!hideZero ? [{ value: 0, label: 'Child zero' }] : []),
    { value: false, label: 'Child false' }
  ]);
  let children = $derived(reverse ? [...items].reverse() : items);

  function childChange(event: CheckboxChangeEvent) {
    events.push(`child:${typeof event.target.value}:${event.target.value}:${event.target.checked}`);
    if (stop) event.stopPropagation();
  }

  function keyedProps(version: number) {
    return { defaultChecked: version % 2 === 0, value: `keyed-${version}` };
  }
</script>

<style>
  section { padding: 20px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-block: 12px; }
  .form-block { margin-block: 16px; }
  output { display: block; overflow-wrap: anywhere; }
</style>

{#snippet richLabel()}<strong>Rich checkbox option</strong>{/snippet}

<section id="checkbox-features-fixture">
  <h2>Checkbox source features</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount source checkboxes</label>
    <label><input type="checkbox" bind:checked={freeze} /> Freeze source checkbox owner</label>
    <label><input type="checkbox" bind:checked={removeOnChange} /> Remove source checkboxes on change</label>
    <label><input type="checkbox" bind:checked={hideZero} /> Hide source zero child</label>
    <label><input type="checkbox" bind:checked={reverse} /> Reverse source checkbox children</label>
    <label><input type="checkbox" bind:checked={skip} /> Skip source checkbox group</label>
    <label><input type="checkbox" bind:checked={useOptions} /> Use source checkbox options</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable source checkbox group</label>
    <label><input type="checkbox" bind:checked={stop} /> Stop source checkbox change</label>
    <label><input type="checkbox" bind:checked={styled} /> Style source checkboxes</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark source checkboxes</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact source checkboxes</label>
    <label><input type="checkbox" bind:checked={autoFocus} /> Autofocus source checkbox</label>
    <label><input type="checkbox" bind:checked={mutate} /> Mutate source checkbox callback</label>
    <button type="button" onclick={() => { variable = 'variable-b'; }}>Change source child value</button>
    <button type="button" onclick={() => { owner = ['variable-b', 99]; }}>Set source checkbox owner</button>
    <button type="button" onclick={() => { events = []; }}>Clear source checkbox events</button>
    <button type="button" onclick={() => ref?.focus({ preventScroll: true })}>Focus source checkbox ref</button>
    <button type="button" onclick={() => ref?.blur()}>Blur source checkbox ref</button>
    <button type="button" onclick={() => instance?.focus()}>Focus source checkbox instance</button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    style="background:var(--ant-color-bg-container)"
    checkbox={styled ? {
      class: 'checkbox-config',
      style: 'color:red',
      classNames: info => ({
        root: `checkbox-config-${info.props.checked ? 'checked' : 'unchecked'}`,
        icon: 'checkbox-config-icon',
        label: 'checkbox-config-label'
      }),
      styles: { root: 'color:blue', icon: 'outline:1px solid red', label: 'color:purple' }
    } : undefined}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Фикстура считает всплытие, не добавляя интерактивность форме.) -->
    <form id="source-checkbox-form" onsubmit={event => {
      event.preventDefault();
      submits++;
    }}
      onchange={() => { changeBubbles++; }} onclick={() => { clickBubbles++; }}>
      {#if mounted}
        <div class="form-block">
          <CheckboxGroup bind:value={() => owner, next => { if (!freeze) owner = next; }}
            bind:nativeElement={groupElement} name="choices" aria-label="Source child checkboxes"
            {disabled} options={useOptions ? [
              {
                value: 0,
                label: 'Option zero',
                id: 'source-option-zero',
                title: 'Zero metadata',
                className: 'source-zero-class',
                style: 'color:green',
                required: true,
                onChange: childChange
              },
              { value: false, label: richLabel, onChange: childChange }
            ] : []} onChange={next => {
              events.push(`group:${JSON.stringify(next)}`);
              if (mutate) next.push('mutated');
              if (removeOnChange) flushSync(() => { mounted = false; });
            }} onValueChange={next => { events.push(`value:${JSON.stringify(next)}`); }}>
            <Row>
              {#each children as child (child.value)}
                <Col span={12}><Checkbox value={child.value} onChange={childChange}>{child.label}</Checkbox></Col>
              {/each}
              <Col span={12}><Checkbox value="0" onChange={childChange}>Child string zero</Checkbox></Col>
              <Col span={12}><Checkbox value={variable} onChange={childChange}>Variable child</Checkbox></Col>
              <Col span={12}><Checkbox value="skipped" name="skipped" skipGroup={skip}
                bind:checked={skipped} onChange={childChange}>Skipped child</Checkbox></Col>
            </Row>
          </CheckboxGroup>
        </div>
        <Checkbox bind:this={instance} bind:checked={single} bind:indeterminate={mixed}
          bind:ref bind:inputElement bind:nativeElement value={false} name="standalone"
          autoFocus={autoFocus} tabIndex={2} title="Standalone title"
          classNames={info => ({ root: `checkbox-local-${info.props.checked}`, icon: 'checkbox-local-icon' })}
          styles={styled ? { root: 'color:green', label: 'font-weight:bold' } : undefined}
          style={styled ? 'color:orange' : undefined}
          onCheckedChange={next => { soloEvents.push(`checked:${next}`); }}
          onChange={event => { soloEvents.push(`source:${typeof event.target.value}:${event.target.value}:${event.target.checked}`); }}
          onchange={event => { soloEvents.push(`native:${event.currentTarget.value}`); }}
          onClick={() => { soloEvents.push('click'); }}
          onFocus={() => { inputEvents.push('source-focus'); }}
          onfocus={() => { inputEvents.push('native-focus'); }}
          onBlur={() => { inputEvents.push('source-blur'); }}
          onblur={() => { inputEvents.push('native-blur'); }}
          onKeyDown={event => { inputEvents.push(`source-key:${event.key}`); }}
          onkeydown={event => { inputEvents.push(`native-key:${event.key}`); }}
          onKeyPress={event => { inputEvents.push(`source-press:${event.key}`); }}
          onkeypress={event => { inputEvents.push(`native-press:${event.key}`); }}
          onMouseEnter={event => { mouseEvents.push(`enter:${event.currentTarget.tagName}`); }}
          onMouseLeave={event => { mouseEvents.push(`leave:${event.currentTarget.tagName}`); }}>
          Standalone source checkbox
        </Checkbox>
      {/if}
      <div class="form-block"><CheckboxGroup aria-label="Independent nested checkbox group"
        name="nested" defaultValue={['inner']} options={['inner', 'other']} /></div>
      <button type="submit">Submit source checkboxes</button>
      <button type="reset">Reset source checkboxes</button>
    </form>
    <div class="form-block">
      <CheckboxGroup aria-label="Table host choices" bind:value={host}
        onChange={() => { hostEvents++; }} name="host">
        <Checkbox value="host">Host choice</Checkbox>
        <Table caption="Grouped selection table" pagination={false}
          columns={[{ key: 'name', dataIndex: 'name', title: 'Name' }]}
          dataSource={[{ key: 'one', name: 'Row one' }, { key: 'two', name: 'Row two' }]}
          bind:selectedRowKeys={tableKeys} rowSelection />
      </CheckboxGroup>
    </div>
    <ConfigProvider><Checkbox checked>Inherited checkbox config</Checkbox></ConfigProvider>
    {#key generation}
      <Checkbox {...keyedProps(generation)} aria-label="Keyed source checkbox"
        onBlur={() => { keyedEvents.push('blur'); }} />
    {/key}
    <button type="button" onpointerdown={event => event.preventDefault()}
      onclick={() => { generation++; }}>Replace keyed source checkbox</button>
  </ConfigProvider>
  <output aria-label="Source checkbox owner">{JSON.stringify(owner)}</output>
  <output aria-label="Source checkbox events">{events.join('|')}</output>
  <output aria-label="Source solo events">{soloEvents.join('|')}</output>
  <output aria-label="Source checkbox input events">{inputEvents.join('|')}</output>
  <output aria-label="Source checkbox mouse events">{mouseEvents.join('|')}</output>
  <output aria-label="Source checkbox mixed">{String(mixed)}</output>
  <output aria-label="Source checkbox skipped owner">{String(skipped)}</output>
  <output aria-label="Source checkbox change bubbles">{changeBubbles}</output>
  <output aria-label="Source checkbox click bubbles">{clickBubbles}</output>
  <output aria-label="Source checkbox submits">{submits}</output>
  <output aria-label="Source checkbox refs">{Boolean(ref && ref.input === inputElement
    && ref.nativeElement === nativeElement)}</output>
  <output aria-label="Source checkbox group ref">{groupElement?.tagName ?? 'none'}</output>
  <output aria-label="Source checkbox host owner">{JSON.stringify(host)}</output>
  <output aria-label="Source checkbox host events">{hostEvents}</output>
  <output aria-label="Source checkbox table keys">{JSON.stringify(tableKeys)}</output>
  <output aria-label="Source keyed checkbox events">{keyedEvents.join('|')}</output>
</section>
