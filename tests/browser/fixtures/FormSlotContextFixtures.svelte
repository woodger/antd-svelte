<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, Select, createForm,
    type ComponentSize, type Variant
  } from 'antd-svelte';
  import reference from './ant-design-form-slot-context-reference.json';

  interface Sample {
    id: string;
    required?: boolean;
    error?: boolean;
    disabled?: boolean;
    size?: ComponentSize;
    variant?: Variant;
    explicit?: boolean;
  }

  let { initialCase = 'default' }: { initialCase?: string } = $props();
  // Модель владеет metadata и до регистрации UI во время SSR.
  const model = createForm({ initialValues: { name: 'Main' }, rules: { name: [{}] } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(readSample(selected));
  let snapshot = $state<{ refIsMain: boolean; mainValue: string; touched: boolean }>();
  let root: HTMLElement;

  function readSample(id: string) {
    return reference.cases.find(({ sample }) => sample.id === id)!.sample as Sample;
  }

  function seed(id: string) {
    model.setFields([{
      name: 'name', errors: readSample(id).error ? ['Required'] : [], touched: false
    }]);
  }

  function inspect() {
    const main = root.querySelector('input[aria-label="main control"]');
    const ref = model.getFieldInstance<{ nativeElement: Element }>('name');
    snapshot = {
      refIsMain: ref?.nativeElement === main,
      mainValue: model.getFieldValue('name'), touched: model.isFieldTouched('name')
    };
  }

  untrack(() => seed(initialCase));
</script>

{#snippet helper(kind: string)}
  <Input aria-label={`${kind} draft`} defaultValue={kind}
    id={sample.explicit ? `own-${kind}` : undefined}
    name={sample.explicit ? `own-${kind}` : undefined}
    status={sample.explicit ? 'warning' : undefined}
    aria-describedby={sample.explicit ? 'own-description' : undefined} />
{/snippet}
{#snippet extra()}
  <div>{@render helper('extra')}<Select aria-label="extra selector"
    options={[{ value: 'a', label: 'Alpha' }]} defaultValue="a" /></div>
{/snippet}
{#snippet popup()}{@render helper('popup')}{/snippet}

<section bind:this={root} id="form-slot-context-fixture" aria-label="Form slot context">
  <label>Form slot sample
    <select value={selected} onchange={(event) => {
      selected = event.currentTarget.value;
      seed(selected);
    }}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={inspect}>Inspect slot bindings</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <div data-slot-case>
      <button id="slot-before" type="button">Before</button>
      <Form form={model} disabled={sample.disabled} size={sample.size} variant={sample.variant}>
        <FormItem name="name" label="Caption" {extra} tooltip={{ title: popup, open: true }}
          rules={sample.required ? [{ required: true }] : undefined}>
          <Input aria-label="main control" value={model.values.name}
            onValueChange={(value) => model.setFieldValue('name', value)} />
        </FormItem>
      </Form>
    </div>
  </ConfigProvider>
  <p id="own-description">Owner helper description</p>
  <output aria-label="Slot binding snapshot">{JSON.stringify(snapshot)}</output>
</section>
