<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Form, FormItem, Input, createForm, type RenderEmptyContent } from 'antd-svelte';
  import Counter from './FormExplanationCounter.svelte';
  import reference from './ant-design-form-help-reference.json';

  interface Sample {
    id: string;
    help?: RenderEmptyContent;
    rich?: boolean;
    helperInput?: boolean;
    counter?: boolean;
    error?: boolean;
  }

  const cases = [...reference.cases, ...reference.observations];
  let { initialCase = 'absent' }: { initialCase?: string } = $props();
  const model = createForm({ initialValues: { name: 'Main' }, rules: { name: [{}] } });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(readSample(selected));

  function readSample(id: string) {
    return cases.find(({ sample }) => sample.id === id)!.sample as Sample;
  }

  function seed(id: string) {
    model.setFields([{
      name: 'name', errors: readSample(id).error ? ['Required'] : [], touched: false
    }]);
  }

  untrack(() => seed(initialCase));
</script>

{#snippet richHelp()}<b data-rich-help>Rich details</b>{/snippet}
{#snippet counterHelp()}<Counter id="Help" />{/snippet}
{#snippet inputHelp()}<Input aria-label="help draft" defaultValue="Draft" />{/snippet}

<section id="form-help-fixture" aria-label="Form rich help">
  <label>Form help sample
    <select value={selected} onchange={(event) => {
      selected = event.currentTarget.value;
      seed(selected);
    }}>
      {#each cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => model.resetFields(['name'])}>Reset help field</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <div data-help-case>
      <Form form={model}>
        <FormItem name="name" label="Caption" help={sample.rich ? richHelp
          : sample.counter ? counterHelp : sample.helperInput ? inputHelp : sample.help}>
          <Input aria-label="main control" value={model.values.name}
            onValueChange={(value) => model.setFieldValue('name', value)} />
        </FormItem>
      </Form>
    </div>
  </ConfigProvider>
</section>
