<script lang="ts">
  import { untrack } from 'svelte';
  import {
    ConfigProvider, Form, FormItem, Input, createForm,
    type FormConfig, type FormScrollOptions, type NamePath
  } from 'antd-svelte';
  import reference from './ant-design-form-scroll-first-reference.json';

  interface Sample {
    id: string;
    scroll?: boolean | FormScrollOptions;
    parent?: FormConfig;
    child?: FormConfig;
    firstValid?: boolean;
    nested?: boolean;
    visible?: boolean;
  }

  interface Capture {
    order: string[];
    calls: { name: NamePath; options?: FormScrollOptions }[];
    failed: { names: readonly NamePath[]; outOfDate: boolean } | null;
  }

  type Values = { first?: string; second?: string; user?: { name?: string } };

  let { initialCase = 'local-true' }: { initialCase?: string } = $props();
  let capture = $state<Capture>({ order: [], calls: [], failed: null });
  let selected = $state(untrack(() => initialCase));
  let sample = $derived(readSample(selected));
  let viewport: HTMLDivElement;
  let held = $state(false);
  let pending: ((message: string) => void)[] = [];
  let pendingCount = $state(0);
  let settled = $state(0);
  let mounted = $state(true);
  let afterFailure = $state<'replace' | 'unmount'>();

  function readSample(id: string) {
    return reference.cases.find(({ sample }) => sample.id === id)!.sample as Sample;
  }

  function createModel(sample: Sample) {
    const instance = createForm<Values>({
      initialValues: sample.firstValid ? { first: 'Ready' } : {}
    });
    const scroll = instance.scrollToField;
    instance.scrollToField = (name, options) => {
      capture.order.push('scroll');
      capture.calls.push({ name, options });
      scroll(name, options);
    };
    const submit = instance.submit;
    instance.submit = async (onFinish) => {
      try {
        return await submit(onFinish);
      } finally {
        settled += 1;
      }
    };

    return instance;
  }

  let model = $state(untrack(() => createModel(readSample(initialCase))));

  function choose(id: string) {
    selected = id;
    capture = { order: [], calls: [], failed: null };
    settled = 0;
    model = createModel(readSample(id));
    viewport.scrollTop = 0;
  }

  function requestSubmit() {
    const formElement = viewport.querySelector('form');
    formElement?.requestSubmit();
  }

  function validateHeld() {
    if (!held) return;

    return new Promise<string>((resolve) => {
      pending.push(resolve);
      pendingCount = pending.length;
    });
  }
</script>

<section id="form-scroll-first-fixture" aria-label="Form first error scrolling">
  <label>First error sample
    <select value={selected} onchange={(event) => choose(event.currentTarget.value)}>
      {#each reference.cases as entry}<option value={entry.sample.id}>{entry.sample.id}</option>{/each}
    </select>
  </label>
  <button type="button" onclick={() => { held = true; }}>Hold scroll validation</button>
  <button type="button" onclick={() => {
    for (const resolve of pending.splice(0)) resolve('Delayed');
    pendingCount = 0;
  }}>Release scroll validation</button>
  <button type="button" onclick={() => { model = createModel(sample); }}>Replace scroll model</button>
  <button type="button" onclick={() => { mounted = false; }}>Unmount scroll form</button>
  <button type="button" onclick={() => { afterFailure = 'replace'; }}>Replace model after failure</button>
  <button type="button" onclick={() => { afterFailure = 'unmount'; }}>Unmount after failure</button>
  <button type="button" onclick={() => model.resetFields()}>Reset scroll fields</button>
  <button type="button" onclick={() => { selected = 'local-center'; }}>Use center scrolling</button>
  <button type="button" onclick={() => { selected = 'local-focus'; }}>Use focused scrolling</button>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }} form={sample.parent}>
    <ConfigProvider form={sample.child}>
      <div data-scroll-case>
        <button id="submit-control" type="button" onclick={requestSubmit}>Submit scroll form</button>
        <div bind:this={viewport} data-scroll-viewport
          style="height:180px;width:360px;overflow:auto;position:relative">
          {#if mounted}
            <Form form={model} layout="vertical" scrollToFirstError={sample.scroll}
              onFinish={() => { capture.order.push('finish'); }}
              onFinishFailed={(error) => {
                capture.order.push('failed');
                capture.failed = {
                  names: error.errorFields.map((field) => field.name), outOfDate: error.outOfDate
                };
                if (afterFailure === 'replace') model = createModel(sample);
                else if (afterFailure === 'unmount') mounted = false;
              }}>
              <div style={`height:${sample.visible ? 0 : 600}px`}></div>
              <div data-scroll-field="0">
                <FormItem name={sample.nested ? ['user', 'name'] : 'first'} label="First"
                  rules={[{ required: true, message: 'Required' }, { validator: validateHeld }]}>
                  <Input value={sample.nested ? model.values.user?.name : model.values.first}
                    onValueChange={(value) => model.setFieldValue(
                      sample.nested ? ['user', 'name'] : 'first', value
                    )} />
                </FormItem>
                <div style="height:220px"></div>
              </div>
              <div data-scroll-field="1">
                <FormItem name="second" label="Second" rules={[{ required: true, message: 'Required' }]}>
                  <Input value={model.values.second}
                    onValueChange={(value) => model.setFieldValue('second', value)} />
                </FormItem>
                <div style="height:220px"></div>
              </div>
              <div style="height:300px"></div>
            </Form>
          {/if}
        </div>
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="First error capture">{JSON.stringify(capture)}</output>
  <output aria-label="Pending scroll validation">{pendingCount}</output>
  <output aria-label="Settled scroll submits">{settled}</output>
</section>
