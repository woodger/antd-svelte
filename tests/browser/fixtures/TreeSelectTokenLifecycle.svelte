<script lang="ts">
  import { ConfigProvider, Form, FormItem, TreeSelect, createForm,
    type TreeSelectTokenSeparators, type TreeSelectValue } from 'antd-svelte';
  const model = createForm<{ selected: TreeSelectValue }>({ initialValues: { selected: undefined } });
  let active = $state(true);
  let multiple = $state(false);
  let alternate = $state(false);
  let search = $state('');
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let nativeEvents = $state<unknown[][]>([]);
  let events = $state<unknown[][]>([]);
  let splits = $state<unknown[][]>([]);
  function record(...event: unknown[]) { events = [...events, event]; }
  function native(name: string, event: Event) {
    nativeEvents = [...nativeEvents, [name, (event.currentTarget as HTMLElement).tagName,
      event instanceof ClipboardEvent ? event.clipboardData?.getData('text') : null]];
  }
  const originalSplitter: TreeSelectTokenSeparators = text => {
    splits = [...splits, ['original', text]];
    return text.split(',');
  };
  const alternateSplitter: TreeSelectTokenSeparators = text => {
    splits = [...splits, ['alternate', text]];
    return text.split(',');
  };
</script>
<section data-token-lifecycle data-token-lifecycle-refs={Boolean(root && input)}>
  <ConfigProvider theme={{ token: { motion: false } }}>
    <Form form={model} component={false}>
      <FormItem name="selected">
        {#if active}<TreeSelect aria-label="Token lifecycle" style="width:360px" {multiple}
          bind:nativeElement={root} bind:inputElement={input}
          value={model.values.selected} onChange={value => model.setFieldValue('selected', value)}
          treeData={[{ value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }]}
          tokenSeparators={alternate ? alternateSplitter : originalSplitter}
          showSearch={{ searchValue: search, filterTreeNode: false,
            onSearch: text => { search = text; record('search', text); } }}
          onOpenChange={open => record('open', open)}
          onpaste={event => native('paste', event)}
          oncompositionstart={event => native('compositionstart', event)}
          oncompositionend={event => native('compositionend', event)} />{/if}
      </FormItem>
    </Form>
  </ConfigProvider>
  <button type="button" onclick={() => { search = 'External'; }}>Update token search</button>
  <button type="button" onclick={() => { multiple = !multiple; }}>Toggle token mode</button>
  <button type="button" onclick={() => { alternate = !alternate; }}>Replace token splitter</button>
  <button type="button" onclick={() => model.setFieldValue('selected', 'a')}>Set token selection</button>
  <button type="button" data-token-reset onclick={() => { search = ''; model.resetFields(); }}>Reset token field</button>
  <button type="button" data-token-unmount onclick={() => { active = false; }}>Unmount token field</button>
  <button type="button" style="display:block;margin-top:320px">Outside token lifecycle</button>
  <output data-token-native-events>{JSON.stringify(nativeEvents)}</output>
  <output data-token-lifecycle-events>{JSON.stringify(events)}</output>
  <output data-token-splits>{JSON.stringify(splits)}</output>
  <output data-token-model>{JSON.stringify(model.values.selected ?? null)}</output>
</section>
