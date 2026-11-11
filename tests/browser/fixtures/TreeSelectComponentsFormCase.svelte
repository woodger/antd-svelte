<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { ConfigProvider, Form, FormItem, TreeSelect, createForm,
    type TreeSelectInputContext, type TreeSelectRootContext, type TreeSelectValue } from 'antd-svelte';
  import TreeSelectComponentsFormInput from './TreeSelectComponentsFormInput.svelte';
  import type { TreeSelectComponentsFormSample } from './tree-select-components-form-cases';
  let { sample }: { sample: TreeSelectComponentsFormSample } = $props();
  const model = createForm<{ choice?: TreeSelectValue }>({ initialValues: {} });
  let active = $state(true);
  let ready = $state(false);
  let root = $state<HTMLElement>();
  let input = $state<HTMLInputElement>();
  let events = $state<unknown[][]>([]);
  interface FieldInstance {
    nativeElement?: HTMLElement;
    focus?: (options?: FocusOptions) => void;
    blur?: () => void;
    scrollTo?: unknown;
    select?: unknown;
  }
  onMount(() => {
    let mounted = true;
    void tick().then(() => { if (mounted) ready = true; });
    return () => { mounted = false; };
  });
  function association() {
    const instance = ready && active ? model.getFieldInstance<FieldInstance>('choice') : undefined;
    return { present: Boolean(instance), nativeTag: instance?.nativeElement?.tagName ?? null,
      nativeMatchesControl: Boolean(instance?.nativeElement && instance.nativeElement === root),
      focus: typeof instance?.focus === 'function', blur: typeof instance?.blur === 'function',
      scrollTo: typeof instance?.scrollTo === 'function', select: typeof instance?.select === 'function' };
  }
  function record(...event: unknown[]) { events = [...events, event]; }
</script>

{#snippet customInput(context: TreeSelectInputContext<HTMLInputElement>)}
  <TreeSelectComponentsFormInput inputContext={context} />
{/snippet}
{#snippet customRoot(context: TreeSelectRootContext<HTMLElement>)}
  <TreeSelectComponentsFormInput rootContext={context} />
{/snippet}
<section data-form-components-case={sample.id} data-form-components-ready={ready} style="margin:48px;width:420px">
  <ConfigProvider theme={{ token: { motion: false } }}>
    <Form form={model} data-form-components-native>
      {#if active}<FormItem name="choice" initialValue="a" htmlFor="choice" validateStatus="error" hasFeedback
        rules={[{ required: true }]} help="Choice help">
        <TreeSelect style="width:360px" bind:nativeElement={root} bind:inputElement={input}
          value={model.values.choice} onChange={value => { record('change', value); model.setFieldValue('choice', value); }}
          treeData={[{ value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }]}
          showSearch={{ filterTreeNode: false, onSearch: text => record('search', text) }}
          components={sample.slot === 'input' ? { input: customInput } : { root: customRoot }} />
      </FormItem>{/if}
    </Form>
  </ConfigProvider>
  <button type="button" data-form-components-focus onclick={() => model.focusField('choice')}>Focus associated field</button>
  <button type="button" data-form-components-unmount onclick={() => { active = false; }}>Unmount component field</button>
  <output data-form-components-model>{JSON.stringify(model.values.choice ?? null)}</output>
  <output data-form-components-events>{JSON.stringify(events)}</output>
  <output data-form-components-association>{JSON.stringify(association())}</output>
  <output data-form-components-native-refs>{JSON.stringify({ root: root?.tagName ?? null, input: input?.tagName ?? null })}</output>
</section>
