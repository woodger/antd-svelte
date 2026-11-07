<script lang="ts">
  import { tick } from 'svelte';
  import {
    Form, FormItem, FormList, createForm, Input, InputPassword, InputSearch, TextArea,
    InputNumber, Checkbox, Radio, Switch, Select, Slider, InputOTP, DatePicker,
    RangePicker, Rate, Mentions, AutoComplete, TreeSelect, Cascader,
    CheckboxGroup, RadioGroup, TimePicker, TimeRangePicker, Transfer,
    type CheckboxRef, type RadioRef, type InputNumberRef, type SliderRef, type NamePath
  } from 'antd-svelte';

  const names: { tag: string; name: NamePath }[] = [
    ...['input', 'password', 'search', 'textarea', 'number', 'checkbox', 'radio', 'switch',
      'select', 'slider', 'range', 'otp', 'date', 'dates', 'time', 'times', 'rate',
      'mentions', 'autocomplete', 'tree-select', 'cascader', 'checkbox-group', 'radio-group']
      .map((name) => ({ tag: name, name })),
    { tag: 'nested', name: ['user', 'name'] }, { tag: 'literal', name: 'user_name' },
    { tag: 'numeric', name: ['rows', 0, 'name'] }, { tag: 'string', name: ['rows', '0', 'name'] },
    { tag: 'removable', name: 'removable' }
  ];
  const initialValues = { people: ['Anna', 'Bob'] };
  let form = $state(createForm({ initialValues }));
  let shown = $state(true);
  let removable = $state(true);
  let checkbox = $state<CheckboxRef>();
  let radio = $state<RadioRef>();
  let number = $state<InputNumberRef>();
  let slider = $state<SliderRef>();
  let range = $state<SliderRef>();
  let switchRef = $state<HTMLButtonElement>();
  let raw = $state<HTMLInputElement>();
  let customRoot = $state<HTMLSpanElement>();
  let customInput = $state<HTMLInputElement>();
  let customCalls = $state(0);
  let transfer = $state<HTMLDivElement>();
  let snapshot = $state('');
  const previous = new Map<string, unknown>();
  const custom = {
    get nativeElement() {
      return customRoot;
    },
    focus() {
      if (this !== custom) throw new Error('Lost custom focus receiver');
      customCalls++;
      customInput?.focus();
    }
  };

  function capture(tag: string, name: NamePath) {
    const instance = form.getFieldInstance(name);
    const published: Record<string, unknown> = {
      checkbox, radio, number, slider, range, switch: switchRef, custom, raw, transfer
    };
    snapshot = JSON.stringify({
      tag, instance: instance != null,
      stable: previous.has(tag) ? previous.get(tag) === instance : null,
      sameRef: Object.hasOwn(published, tag) ? instance === published[tag] : null
    });
    previous.set(tag, instance);
  }

  function focus(tag: string, name: NamePath) {
    form.focusField(name);
    capture(tag, name);
  }

  async function reset() {
    capture('input', 'input');
    form.resetFields(['input']);
    await tick();
    focus('input', 'input');
  }

  async function replaceModel() {
    const previousForm = form;
    form = createForm({ initialValues });
    await tick();
    snapshot = JSON.stringify({ oldInstance: previousForm.getFieldInstance('input') != null });
    form.focusField('input');
  }
</script>

<section id="form-dom-fixture" aria-label="Form DOM methods">
  <div>
    {#each names as item (item.tag)}
      <button type="button" onclick={() => focus(item.tag, item.name)}>Focus {item.tag}</button>
    {/each}
    {#each ['custom', 'raw', 'fallback', 'missing', 'disabled', 'transfer'] as name}
      <button type="button" onclick={() => focus(name, name)}>Focus {name}</button>
    {/each}
    <button type="button" onclick={() => focus('person', ['people', 0])}>Focus first person</button>
    <button type="button" onclick={reset}>Reset DOM input</button>
    <button type="button" onclick={() => { removable = !removable; }}>Toggle DOM field</button>
    <button type="button" onclick={() => { shown = !shown; }}>Toggle DOM form</button>
    <button type="button" onclick={replaceModel}>Replace DOM model</button>
  </div>
  <output aria-label="DOM snapshot">{snapshot}</output>
  <output aria-label="Custom focus calls">{customCalls}</output>

  {#if shown}
    <Form {form}>
      {#each names as item (item.tag)}
        {#if item.tag !== 'removable' || removable}
          <div data-dom-field={item.tag}>
            <FormItem name={item.name} label={item.tag}>
              {#if item.tag === 'password'}<InputPassword />
              {:else if item.tag === 'search'}<InputSearch />
              {:else if item.tag === 'textarea'}<TextArea />
              {:else if item.tag === 'number'}<InputNumber bind:ref={number} />
              {:else if item.tag === 'checkbox'}<Checkbox bind:ref={checkbox} />
              {:else if item.tag === 'radio'}<Radio bind:ref={radio} />
              {:else if item.tag === 'switch'}<Switch bind:ref={switchRef} />
              {:else if item.tag === 'select'}<Select options={[{ value: 'a', label: 'A' }]} />
              {:else if item.tag === 'slider'}<Slider bind:ref={slider} />
              {:else if item.tag === 'range'}<Slider range bind:ref={range} />
              {:else if item.tag === 'otp'}<InputOTP />
              {:else if item.tag === 'date'}<DatePicker />
              {:else if item.tag === 'dates'}<RangePicker />
              {:else if item.tag === 'time'}<TimePicker />
              {:else if item.tag === 'times'}<TimeRangePicker />
              {:else if item.tag === 'rate'}<Rate />
              {:else if item.tag === 'mentions'}<Mentions options={[{ value: 'anna' }]} />
              {:else if item.tag === 'autocomplete'}<AutoComplete options={[{ value: 'Anna' }]} />
              {:else if item.tag === 'tree-select'}<TreeSelect treeData={[{ key: 'a', value: 'a', title: 'A' }]} />
              {:else if item.tag === 'cascader'}<Cascader options={[{ value: 'a', label: 'A' }]} />
              {:else if item.tag === 'checkbox-group'}<CheckboxGroup options={['A', 'B']} />
              {:else if item.tag === 'radio-group'}<RadioGroup options={['A', 'B']} />
              {:else}<Input prefix={item.tag === 'input' ? 'Prefix' : undefined} />{/if}
            </FormItem>
          </div>
        {/if}
      {/each}

      <div data-dom-field="custom">
        <FormItem name="custom" label="Custom" controlRef={custom}>
          <span bind:this={customRoot}><input bind:this={customInput} aria-label="Custom input" /></span>
        </FormItem>
      </div>
      <div data-dom-field="raw">
        <FormItem name="raw" label="Raw" htmlFor="dom-raw" controlRef={raw}>
          <input bind:this={raw} id="dom-raw" />
        </FormItem>
      </div>
      <div data-dom-field="fallback">
        <FormItem name="fallback" label="Fallback" htmlFor="dom-fallback">
          <input id="dom-fallback" />
        </FormItem>
      </div>
      <FormItem name="disabled" label="Disabled"><Input disabled /></FormItem>
      <FormItem name="transfer" label="Transfer">
        <Transfer bind:nativeElement={transfer} dataSource={[{ key: 'a', title: 'Anna' }]}
          render={(item) => item.title ?? item.key} />
      </FormItem>

      <FormList name="people">
        {#snippet children(fields, operation)}
          {#each fields as item (item.key)}
            <div data-dom-field={`person-${item.key}`}>
              <FormItem name={item.name} label={`Person ${item.name}`}>
                <Input value={String(form.getFieldValue(['people', item.name]))} />
              </FormItem>
            </div>
          {/each}
          <button type="button" onclick={() => operation.move(0, 1)}>Move DOM person</button>
          <button type="button" onclick={() => operation.remove(0)}>Remove DOM person</button>
        {/snippet}
      </FormList>
    </Form>
  {/if}
</section>
