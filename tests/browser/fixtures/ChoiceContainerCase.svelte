<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    Cascader,
    CascaderPanel,
    ConfigProvider,
    Form,
    TreeSelect,
    createForm,
    type CascaderOption,
    type CascaderPath,
    type CascaderTriggerInfo,
    type ConfigProviderProps
  } from 'antd-svelte';
  import type { ChoiceContainerCase } from './choice-container-presets';
  import ChoiceContainerContent from './ChoiceContainerContent.svelte';

  let {
    sample,
    mounted = true,
    revision = 0,
    alternate = false,
    dark = false,
    componentTheme = false,
    panel = false,
    lazy = false,
    onCall
  }: {
    sample: ChoiceContainerCase;
    mounted?: boolean;
    revision?: number;
    alternate?: boolean;
    dark?: boolean;
    componentTheme?: boolean;
    panel?: boolean;
    lazy?: boolean;
    onCall?: () => void;
  } = $props();
  const form = createForm<{ path: CascaderPath }>({
    initialValues: { path: [] }
  });
  let paths = $state.raw<readonly CascaderPath[]>([]);
  let lazyChildren = $state(false);
  let loads = $state(0);
  let completed = $state(0);
  let completeLoad = $state<() => void>();
  let treeData = $derived(lazy ? [{
    value: 'lazy', title: 'Lazy', isLeaf: false,
    children: lazyChildren ? [{ value: 'alpha', title: 'Alpha' }] : undefined
  }] : [{ value: 'parent', title: 'Parent', children: [
    { value: 'alpha', title: 'Alpha' }, { value: 'beta', title: 'Beta' },
    { value: 'blocked', title: 'Blocked', disabled: true }
  ] }]);
  let options = $derived<readonly CascaderOption[]>(lazy ? [{
    value: 'lazy', label: 'Lazy', isLeaf: false,
    children: lazyChildren ? [{ value: 'alpha', label: 'Alpha' }] : undefined
  }] : [{ value: 'parent', label: 'Parent', children: [
    { value: 'alpha', label: 'Alpha' }, { value: 'beta', label: 'Beta' },
    { value: 'blocked', label: 'Blocked', disabled: true }
  ] }]);
  let shadow = $state<ShadowRoot>();
  let calls = $state<{ getter: string; trigger: string; tag: string; }[]>([]);
  let searches = $state<string[]>([]);
  let values = $state<unknown[]>([]);
  let scrolls = $state(0);
  let submitted = $state('');
  let parentOptions = $derived.by(() => {
    void revision;
    const target = alternate ? 'child' : sample.parent ?? 'parent';
    const props: Partial<ConfigProviderProps> = {};
    if (sample.parent !== 'none') props.getPopupContainer = trigger => {
      record('parent', trigger);
      return target === 'shadow' ? shadow ?? document.body
        : document.getElementById(`choice-${target}`)!;
    };
    return props;
  });
  let childOptions = $derived.by(() => {
    void revision;
    const props: Partial<ConfigProviderProps> = {};
    if (sample.child === 'undefined') props.getPopupContainer = undefined;
    else if (sample.child === 'child') props.getPopupContainer = trigger => {
      record('child', trigger);
      return document.getElementById('choice-child')!;
    };
    if (sample.resetTheme) props.theme = { inherit: false, token: { motion: false } };
    return props;
  });
  let localOptions = $derived.by(() => {
    void revision;
    if (sample.local === 'undefined') return { getPopupContainer: undefined };
    if (sample.local === 'local') return { getPopupContainer: (trigger: HTMLElement) => {
      record('local', trigger);
      return document.getElementById('choice-local')!;
    } };
    return {};
  });

  function record(getter: string, trigger?: HTMLElement) {
    untrack(() => {
      onCall?.();
      calls.push({
        getter,
        trigger: trigger?.getAttribute('data-choice-trigger')
          ?? (trigger?.classList.contains('ant-select') ? 'select-root' : 'other'),
        tag: trigger?.tagName.toLowerCase() ?? 'none'
      });
    });
  }
  function loadTree() {
    loads++;
    return new Promise<void>(resolve => {
      completeLoad = () => {
        lazyChildren = true;
        resolve();
      };
    });
  }
  function loadPath() {
    loads++;
    completeLoad = () => { lazyChildren = true; };
  }
</script>

{#snippet popupContent(menus: Snippet)}<ChoiceContainerContent {menus} />{/snippet}
{#snippet trigger(control: CascaderTriggerInfo)}
  <button type="button" data-choice-trigger="custom" style="width:120px"
    disabled={control.disabled} onclick={control.onClick} onkeydown={control.onKeyDown}
    onkeyup={control.onKeyUp} aria-expanded={control['aria-expanded']}
    aria-controls={control['aria-controls']}>Custom choice</button>
{/snippet}

<div id="choice-parent" data-choice-container="parent"></div>
<div id="choice-child" data-choice-container="child"></div>
<div id="choice-local" data-choice-container="local"></div>
<div id="choice-shadow" data-choice-container="shadow" {@attach element => {
  const root = element.attachShadow({ mode: 'open' });
  const style = element.ownerDocument.createElement('style');
  style.textContent = '[popover]{position:fixed;inset:auto;margin:0;border:0;box-sizing:border-box}';
  root.append(style);
  shadow = root;
}}></div>
<div style="width:280px;margin:100px">
  <ConfigProvider {...parentOptions} style={`--choice-origin:${dark ? 'dark' : 'light'}`}
    theme={{
      mode: dark ? 'dark' : 'light', token: { motion: false }, cssVar: { key: 'choice-container' },
      components: componentTheme ? {
        TreeSelect: { colorBgElevated: '#123456', nodeHoverBg: '#345678' },
        Cascader: { colorBgElevated: '#234567', optionSelectedBg: '#456789' }
      } : undefined
    }}>
    <ConfigProvider {...childOptions}>
      <Form {form} id="choice-container-form" onFinish={value => {
        submitted = JSON.stringify(value);
      }}>
        {#if mounted}
          {#if panel}
            <CascaderPanel {options} />
          {:else if sample.component.startsWith('tree-select')}
            <TreeSelect {...localOptions} {treeData} treeDefaultExpandAll
              treeCheckable={sample.component === 'tree-select-checkable'}
              name="selected" aria-label="Container choice" showSearch={{ treeNodeFilterProp: 'title', onSearch: value => searches.push(value) }}
              onChange={value => values.push(value)} onPopupScroll={() => scrolls++}
              loadData={lazy ? loadTree : undefined} onTreeLoad={() => completed++} />
          {:else if sample.component === 'cascader-multiple'}
            <Cascader {...localOptions} {options} multiple aria-label="Container choice"
              value={paths} onChange={value => {
                values.push(value);
                paths = value;
              }} showSearch={{ onSearch: value => searches.push(value) }} onPopupScroll={() => scrolls++}
              loadData={lazy ? loadPath : undefined} />
          {:else}
            <Cascader {...localOptions} {options} aria-label="Container choice"
              value={form.values.path} onChange={value => {
                values.push(value);
                form.setFieldValue('path', value ?? []);
              }} showSearch={{ onSearch: value => searches.push(value) }} onPopupScroll={() => scrolls++}
              loadData={lazy ? loadPath : undefined}
              children={sample.component === 'cascader-custom' ? trigger : undefined}
              popupRender={sample.component === 'cascader-custom' ? popupContent : undefined}
              style="width:280px" />
          {/if}
        {/if}
      </Form>
    </ConfigProvider>
  </ConfigProvider>
</div>
<button type="button" onclick={() => completeLoad?.()}>Resolve choice children</button>
<button type="submit" form="choice-container-form">Submit choice form</button>
<output aria-label="Choice container calls">{JSON.stringify(calls)}</output>
<output aria-label="Choice container searches">{JSON.stringify(searches)}</output>
<output aria-label="Choice container values">{JSON.stringify(values)}</output>
<output aria-label="Choice container scrolls">{scrolls}</output>
<output aria-label="Choice loads">{loads}/{completed}</output>
<output aria-label="Choice submitted">{submitted}</output>
