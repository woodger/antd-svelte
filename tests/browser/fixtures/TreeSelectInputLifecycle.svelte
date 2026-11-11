<script lang="ts">
  import { ConfigProvider, Form, FormItem, TreeSelect, createForm,
    type TreeSelectInputContext, type TreeSelectRef, type TreeSelectValue } from 'antd-svelte';
  import TreeSelectInputLifecycleEditor from './TreeSelectInputLifecycleEditor.svelte';
  const model = createForm<{ selected: TreeSelectValue }>({ initialValues: { selected: 'a' } });
  let active = $state(true);
  let custom = $state(true);
  let revision = $state(0);
  let search = $state('');
  let events = $state<unknown[][]>([]);
  const deferred: (() => void)[] = [];
  let deferredCount = $state(0);
  let control = $state<TreeSelectRef>();
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  function release(id: string, cleanup: () => void) {
    if (id === 'input-lifecycle-0' && active) { deferred.push(cleanup); deferredCount = deferred.length; }
    else cleanup();
  }
  function releaseDeferred() { for (const cleanup of deferred.splice(0)) cleanup(); deferredCount = 0; }
  function record(...event: unknown[]) { events = [...events, event]; }
</script>

{#snippet editor(context: TreeSelectInputContext<HTMLInputElement>)}
  {#key revision}<TreeSelectInputLifecycleEditor {context} {revision} {release} />{/key}
{/snippet}
<section data-input-lifecycle data-input-lifecycle-refs={Boolean(root && input && control)}>
  <ConfigProvider theme={{ token: { motion: false } }}>
    <Form form={model} component={false}>
      <FormItem name="selected">
        {#if active}<TreeSelect aria-label="Input lifecycle" style="width:360px"
          bind:nativeElement={root} bind:inputElement={input} bind:this={control}
          components={custom ? { input: editor } : undefined}
          value={model.values.selected} onChange={value => model.setFieldValue('selected', value)}
          treeData={[{ value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }]}
          showSearch={{ searchValue: search, filterTreeNode: false,
            onSearch: text => { search = text; record('search', text); } }}
          onOpenChange={open => record('open', open)} />{/if}
      </FormItem>
    </Form>
  </ConfigProvider>
  <div style="margin-top:320px">
  <button type="button" data-input-replace onclick={() => revision++}>Replace custom editor</button>
  <button type="button" data-input-cleanup onclick={releaseDeferred}>Release replaced editor</button>
  <button type="button" data-input-remove onclick={() => { custom = false; }}>Remove custom editor</button>
  <button type="button" data-input-focus onclick={() => control?.focus()}>Focus lifecycle ref</button>
  <button type="button" data-input-set onclick={() => model.setFieldValue('selected', 'b')}>Set input selection</button>
  <button type="button" data-input-reset onclick={() => { search = ''; model.resetFields(); }}>Reset input field</button>
  <button type="button" data-input-unmount onclick={() => { active = false; releaseDeferred(); }}>Unmount input field</button>
  </div>
  <output data-input-lifecycle-editor>{input?.id ?? null}</output>
  <output data-input-lifecycle-root>{root?.tagName ?? null}</output>
  <output data-input-lifecycle-events>{JSON.stringify(events)}</output>
  <output data-input-lifecycle-model>{JSON.stringify(model.values.selected ?? null)}</output>
  <output data-input-lifecycle-deferred>{deferredCount > 0}</output>
</section>
