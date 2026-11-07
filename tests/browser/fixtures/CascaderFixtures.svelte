<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    Cascader, CascaderPanel, ConfigProvider, Form, FormItem, createForm, SpaceCompact, Button,
    type CascaderContent, type CascaderOption, type CascaderPath, type CascaderRenderInfo,
    type CascaderTagInfo, type CascaderTriggerInfo, type CascaderOmittedTag
  } from 'antd-svelte';

  function initialOptions(): CascaderOption[] {
    return [
      { value: 'asia', label: 'Asia', 'data-testid': 'source-path-asia', children: [
        { value: 'china', label: 'China', children: [
          { value: 'hangzhou', label: 'Hangzhou' },
          { value: 'nanjing', label: 'Nanjing' }
        ] },
        { value: 'japan', label: 'Japan' },
        { value: 'locked', label: 'Locked leaf', disabled: true },
        { value: 'checkbox', label: 'No checkbox', disableCheckbox: true }
      ] },
      { value: 'europe', label: 'Europe', children: [
        { value: 'france', label: 'France' }, { value: 'germany', label: 'Germany' }
      ] },
      { value: 0, label: 'Zero' },
      { value: 'disabled', label: 'Disabled branch', disabled: true, children: [
        { value: 'hidden', label: 'Hidden child' }
      ] }
    ];
  }
  function renamed(nodes: readonly CascaderOption[]): CascaderOption[] {
    return nodes.map(node => ({
      code: node.value, text: node.label, nodes: node.children ? renamed(node.children) : undefined,
      disabled: node.disabled, disableCheckbox: node.disableCheckbox, isLeaf: node.isLeaf
    }));
  }
  let data = $state<CascaderOption[]>(initialOptions());
  let value = $state<CascaderPath | readonly CascaderPath[]>([]);
  let defaultValue = $state<CascaderPath | readonly CascaderPath[]>([]);
  let multiple = $state(false);
  let accept = $state(true);
  let controlled = $state(true);
  let searchEnabled = $state(false);
  let controlledSearch = $state(false);
  let searchValue = $state('');
  let acceptSearch = $state(true);
  let autoClear = $state(true);
  let changeOnSelect = $state(false);
  let hover = $state(false);
  let childStrategy = $state(false);
  let customFields = $state(false);
  let custom = $state(false);
  let customTag = $state(false);
  let customTrigger = $state(false);
  let limit = $state('50');
  let customFilter = $state(false);
  let sort = $state(false);
  let hideAll = $state(false);
  let emptyContent = $state(false);
  let lazy = $state(false);
  let controlledOpen = $state(false);
  let open = $state(false);
  let acceptOpen = $state(true);
  let legacy = $state(false);
  let defaultOpen = $state(false);
  let mounted = $state(true);
  let instance = $state(0);
  let localDisabled = $state('inherit');
  let loading = $state(false);
  let allowClear = $state(true);
  let clearMode = $state('default');
  let size = $state<'small' | 'medium' | 'large'>('medium');
  let variant = $state<'outlined' | 'filled' | 'borderless' | 'underlined' | 'inherit'>('inherit');
  let dark = $state(false);
  let compact = $state(false);
  let styled = $state(false);
  let icons = $state(false);
  let hideIcons = $state(false);
  let responsive = $state(false);
  let count = $state('all');
  let width = $state(360);
  let popupWidth = $state('default');
  let truncate = $state(false);
  let customRest = $state(false);
  let nativeElement = $state<HTMLDivElement>();
  let inputElement = $state<HTMLInputElement>();
  let picker = $state<{ focus(options?: FocusOptions): void; blur(): void; }>();
  let events = $state<string[]>([]);
  let published = $state('');
  let identity = $state(false);
  let pending = $state<CascaderOption>();
  let footerCount = $state(0);
  let submitCount = $state(0);
  let panelValue = $state<CascaderPath | readonly CascaderPath[]>([]);
  let panelMultiple = $state(false);
  let panelMounted = $state(true);
  let panelEvents = $state('');
  let source = $derived(hideAll ? [] : customFields ? renamed(data) : data);
  const form = createForm<{ path: CascaderPath }>({
    initialValues: { path: [] },
    rules: { path: [{ required: true, message: 'Choose an associated path' }] }
  });

  function onChange(
    next: CascaderPath | readonly CascaderPath[] | undefined,
    selected: (CascaderOption | undefined)[] | (CascaderOption | undefined)[][] | undefined
  ) {
    published = JSON.stringify([next ?? null, selected]) ?? '';
    const paths = multiple ? selected as (CascaderOption | undefined)[][]
      : [selected as (CascaderOption | undefined)[]];
    const all = (list: readonly CascaderOption[]): CascaderOption[] => list.flatMap(
      node => [node, ...all(node[customFields ? 'nodes' : 'children'] as CascaderOption[] ?? [])]
    );
    const nodes = all(source);
    identity = paths.every(path => path?.every(node => !node || nodes.includes(node)));
    events.push(`change:${JSON.stringify(next) ?? 'undefined'}`);
    if (accept) value = next ?? [];
  }
  function searched(next: string) {
    events.push(`search:${next}`);
    if (acceptSearch) searchValue = next;
  }
  function opened(next: boolean, kind = 'open') {
    events.push(`${kind}:${next}`);
    if (acceptOpen) open = next;
  }
  function loadData(selected: CascaderOption[]) {
    pending = selected.at(-1);
    events.push(`load:${selected.map(option => option.value).join('/')}`);
    return Promise.resolve().then(() => { events.push('load-promise-resolved'); });
  }
  function finishLazy(empty: boolean, leaf = false) {
    if (!pending) return;
    if (leaf) pending.isLeaf = true;
    else pending.children = empty ? [] : [{ value: 'child', label: 'Loaded child' }];
    data = [...data];
    pending = undefined;
  }
  function reset() {
    value = [];
    defaultValue = [];
    panelValue = [];
    searchValue = '';
    open = false;
    data = lazy ? [
      { value: 'lazy', label: 'Lazy branch', isLeaf: false },
      { value: 'empty', label: 'Empty branch', isLeaf: false }
    ] : initialOptions();
    pending = undefined;
    events = [];
    instance++;
  }
</script>

<style>
  .controls { display:flex;flex-wrap:wrap;gap:8px;margin-block:12px; }
  .holder { max-width:100%;margin-block:16px; }
  output { display:block;overflow-wrap:anywhere; }
  .panel { margin-block:20px; }
</style>

{#snippet option(option: CascaderOption, info: CascaderRenderInfo)}
  <span class="custom-cascader-option" data-path={info.path.length}>
    {@render info.originNode()}<small>{' ['}{String(option.value ?? option.code)}]</small>
  </span>
{/snippet}
{#snippet display(labels: CascaderContent[])}<strong class="custom-cascader-display">{labels.join(' → ')}</strong>{/snippet}
{#snippet tag(info: CascaderTagInfo)}
  <span class="custom-cascader-tag" data-value={info.value} data-max-tag={info.isMaxTag}>
    {@render info.label()}
    {#if info.closable}<button type="button" aria-label="Remove custom path"
      onmousedown={event => event.preventDefault()}
      onclick={event => { event.stopPropagation(); info.onClose?.(event); }}>×</button>{/if}
  </span>
{/snippet}
{#snippet rest(omitted: CascaderOmittedTag[])}
  <span class="custom-cascader-rest">Hidden {omitted.length}: {omitted.map(item => item.label).join(', ')}</span>
{/snippet}
{#snippet trigger(info: CascaderTriggerInfo)}
  <button type="button" aria-label="Custom path trigger" disabled={info.disabled}
    aria-haspopup="menu" aria-expanded={info['aria-expanded']} aria-controls={info['aria-controls']}
    onclick={info.onClick} onkeydown={info.onKeyDown} onkeyup={info.onKeyUp}>Choose region</button>
{/snippet}
{#snippet popup(content: Snippet)}
  <section class="custom-cascader-popup" aria-label="Custom path popup">
    {@render content()}
    <button type="button" onmousedown={event => event.preventDefault()}
      onclick={() => { footerCount++; }}>Popup action</button>
    {#if lazy}
      <button type="button" onmousedown={event => event.preventDefault()}
        onclick={() => finishLazy(false)}>Finish lazy children</button>
      <button type="button" onmousedown={event => event.preventDefault()}
        onclick={() => finishLazy(true)}>Finish empty children</button>
      <button type="button" onmousedown={event => event.preventDefault()}
        onclick={() => finishLazy(false, true)}>Mark lazy leaf</button>
    {/if}
  </section>
{/snippet}
{#snippet icon()}<span class="custom-cascader-icon">I</span>{/snippet}
{#snippet empty()}<span class="custom-cascader-empty">No matching path</span>{/snippet}
{#snippet compactPopup(content: Snippet)}
  {@render content()}<Button>Popup outside Compact</Button>
{/snippet}
{#snippet compactPath()}
  <Cascader options={initialOptions()} class="fixture-compact-cascader" aria-label="Compact path"
    popupRender={compactPopup} />
{/snippet}
{#snippet compactButton()}<Button>Compact path action</Button>{/snippet}

<section id="cascader-fixture">
  <h2>Cascader</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={multiple} onchange={reset} /> Multiple paths</label>
    <label><input type="checkbox" bind:checked={controlled} /> Controlled paths</label>
    <label><input type="checkbox" bind:checked={accept} /> Accept paths</label>
    <label><input type="checkbox" bind:checked={searchEnabled} /> Search paths</label>
    <label><input type="checkbox" bind:checked={controlledSearch} /> Controlled path search</label>
    <label><input type="checkbox" bind:checked={acceptSearch} /> Accept path search</label>
    <label><input type="checkbox" bind:checked={autoClear} /> Clear path search on select</label>
    <label><input type="checkbox" bind:checked={changeOnSelect} /> Select intermediate paths</label>
    <label><input type="checkbox" bind:checked={hover} /> Expand paths on hover</label>
    <label><input type="checkbox" bind:checked={childStrategy} /> Show child paths</label>
    <label><input type="checkbox" bind:checked={customFields} /> Custom path fields</label>
    <label><input type="checkbox" bind:checked={custom} /> Custom path content</label>
    <label><input type="checkbox" bind:checked={customTag} /> Custom path tags</label>
    <label><input type="checkbox" bind:checked={customRest} /> Custom hidden path content</label>
    <label><input type="checkbox" bind:checked={customTrigger} /> Custom trigger</label>
    <label><input type="checkbox" bind:checked={customFilter} /> Filter path values</label>
    <label><input type="checkbox" bind:checked={sort} /> Reverse path results</label>
    <label><input type="checkbox" bind:checked={hideAll} /> Empty path options</label>
    <label><input type="checkbox" bind:checked={emptyContent} /> Empty path content</label>
    <label><input type="checkbox" bind:checked={lazy} onchange={event => {
      lazy = event.currentTarget.checked;
      reset();
    }} /> Lazy path options</label>
    <label><input type="checkbox" bind:checked={controlledOpen} /> Controlled path popup</label>
    <label><input type="checkbox" bind:checked={open} /> Path popup open</label>
    <label><input type="checkbox" bind:checked={acceptOpen} /> Accept path popup</label>
    <label><input type="checkbox" bind:checked={legacy} /> Legacy path popup props</label>
    <label><input type="checkbox" bind:checked={defaultOpen} /> Default path popup open</label>
    <label><input type="checkbox" bind:checked={loading} /> Path loading</label>
    <label><input type="checkbox" bind:checked={allowClear} /> Clearable paths</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark cascader</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact cascader</label>
    <label><input type="checkbox" bind:checked={styled} /> Styled cascader</label>
    <label><input type="checkbox" bind:checked={icons} /> Custom cascader icons</label>
    <label><input type="checkbox" bind:checked={hideIcons} /> Hide cascader icons</label>
    <label><input type="checkbox" bind:checked={responsive} /> Responsive path tags</label>
    <label><input type="checkbox" bind:checked={truncate} /> Truncate path tags</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount cascader</label>
    <label>Path disabled<select bind:value={localDisabled}><option>inherit</option><option>true</option><option>false</option></select></label>
    <label>Path size<select bind:value={size}><option>medium</option><option>small</option><option>large</option></select></label>
    <label>Path variant<select bind:value={variant}><option>inherit</option><option>outlined</option><option>filled</option><option>borderless</option><option>underlined</option></select></label>
    <label>Search path limit<select bind:value={limit}><option>50</option><option>1</option><option>false</option><option>0</option></select></label>
    <label>Path tag count<select bind:value={count}><option>all</option><option>0</option><option>1</option></select></label>
    <label>Path width<input type="number" bind:value={width} /></label>
    <label>Path popup width<select bind:value={popupWidth}><option>default</option><option>true</option><option>240</option></select></label>
    <label>Path clear icon<select aria-label="Path clear icon" bind:value={clearMode}><option>default</option><option>object</option><option>false</option><option>legacy-null</option></select></label>
    <button type="button" onclick={reset}>Reset cascader</button>
    <button type="button" onclick={() => { value = multiple ? [['missing', 0], ['asia']] : ['asia', 'missing']; }}>Set missing path</button>
    <button type="button" onclick={() => { value = multiple ? [['asia']] : ['asia', 'china', 'hangzhou']; }}>Set owner path</button>
    <button type="button" onclick={() => { defaultValue = multiple ? [[0]] : [0]; }}>Change path default</button>
    <button type="button" onclick={() => { instance++; }}>Remount cascader</button>
    <button type="button" onclick={() => {
      data = [{ value: '', label: 'Blank' }];
      value = [];
      instance++;
    }}>Use blank path options</button>
    <button type="button" onclick={() => { events = []; }}>Clear path events</button>
    <button type="button" onclick={() => picker?.focus()}>Focus cascader</button>
    <button type="button" onmousedown={event => event.preventDefault()} onclick={() => picker?.blur()}>Blur cascader</button>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }} componentSize={size}
    cascader={styled ? {
      class: 'context-cascader', style: 'color:rgb(20, 30, 40)', variant: 'filled',
      classNames: { root: 'context-path-root', popup: 'context-path-popup' },
      styles: { root: 'border-color:rgb(1, 2, 3)', popup: { listItem: 'color:rgb(70, 80, 90)' } },
      expandIcon: icon, loadingIcon: icon, suffixIcon: icon, clearIcon: icon, removeIcon: icon
    } : undefined}>
    <form onsubmit={event => { event.preventDefault(); submitCount++; }}>
      <div class="holder">
        {#if mounted}{#key instance}
          <Cascader bind:this={picker} bind:nativeElement bind:inputElement options={source}
            {multiple} value={controlled ? value : undefined} {defaultValue} {onChange}
            showSearch={searchEnabled ? {
              searchValue: controlledSearch ? searchValue : undefined,
              onSearch: searched, autoClearSearchValue: autoClear,
              limit: limit === 'false' ? false : Number(limit),
              filter: customFilter ? (text, path, fields) => path.some(
                node => String(node[fields.label === 'text' ? 'code' : 'value']).includes(text)
              ) : undefined,
              sort: sort ? (first, second) => String(second.at(-1)?.label)
                .localeCompare(String(first.at(-1)?.label)) : undefined,
              searchIcon: icons ? icon : undefined
            } : false}
            {changeOnSelect} expandTrigger={hover ? 'hover' : 'click'}
            showCheckedStrategy={childStrategy ? 'SHOW_CHILD' : 'SHOW_PARENT'}
            fieldNames={customFields ? { label: 'text', value: 'code', children: 'nodes' } : undefined}
            open={controlledOpen ? open : undefined} {defaultOpen}
            onOpenChange={legacy ? undefined : next => opened(next)}
            onDropdownVisibleChange={legacy ? next => opened(next, 'legacy-open') : undefined}
            allowClear={!allowClear ? false : clearMode === 'object' ? {}
              : clearMode === 'false' ? { clearIcon: false } : true}
            clearIcon={clearMode === 'legacy-null' ? null : undefined}
            onClear={() => events.push('clear')}
            loadData={lazy ? loadData : undefined} {loading}
            disabled={localDisabled === 'inherit' ? undefined : localDisabled === 'true'}
            variant={variant === 'inherit' ? undefined : variant}
            optionRender={custom ? option : undefined} displayRender={custom ? display : undefined}
            tagRender={customTag ? tag : undefined} children={customTrigger ? trigger : undefined}
            popupRender={!legacy ? popup : undefined} dropdownRender={legacy ? popup : undefined}
            maxTagCount={responsive ? 'responsive' : count === 'all' ? undefined : Number(count)}
            maxTagTextLength={truncate ? 3 : undefined} maxTagPlaceholder={customRest ? rest : undefined}
            popupMatchSelectWidth={popupWidth === 'true' ? true
              : popupWidth === 'default' ? false : Number(popupWidth)}
            popupClassName={!legacy && styled ? 'local-path-popup' : undefined}
            dropdownClassName={legacy && styled ? 'legacy-path-popup' : undefined}
            popupMenuColumnStyle={legacy && styled ? 'color:rgb(90, 10, 10)' : undefined}
            styles={styled ? { root: 'color:rgb(10, 20, 30)', popup: {
              root: 'padding:2px', list: 'min-width:123px', listItem: 'color:rgb(30, 40, 50)'
            } } : undefined}
            dropdownStyle={legacy && styled ? 'padding:3px' : undefined}
            classNames={styled ? ({ props }) => ({
              root: `local-path-${props.size}-${props.variant}-${props.disabled}`,
              input: 'local-path-input', item: 'local-path-item',
              popup: { root: 'local-semantic-popup', list: 'local-path-list', listItem: 'local-path-entry' }
            }) : undefined}
            prefix={icons ? icon : undefined} suffixIcon={hideIcons ? null : icons ? icon : undefined}
            expandIcon={hideIcons ? false : undefined} loadingIcon={hideIcons ? false : undefined}
            removeIcon={icons ? icon : undefined}
            notFoundContent={emptyContent ? null : custom ? empty : undefined}
            class="fixture-cascader" style={`width:${width}px;${styled ? 'color:rgb(50, 60, 70)' : ''}`}
            aria-label="Path" placeholder="Choose path" />
        {/key}{/if}
      </div>
    </form>
    <label><input type="checkbox" bind:checked={panelMultiple}
      onchange={() => { panelValue = []; }} /> Multiple panel paths</label>
    <label><input type="checkbox" bind:checked={panelMounted} /> Mount path panel</label>
    {#if panelMounted}<div class="panel">
      <CascaderPanel options={initialOptions()} value={panelValue} multiple={panelMultiple}
        onChange={next => { panelValue = next ?? []; panelEvents = JSON.stringify(next) ?? 'undefined'; }}
        class="fixture-cascader-panel" aria-label="Path panel" />
    </div>{/if}
    <Form {form}><FormItem label="Associated path" name="path" htmlFor="associated-path" help="Choose a region">
      <Cascader options={initialOptions()} value={form.values.path}
        onChange={next => form.setFieldValue('path', next ?? [])} />
    </FormItem></Form>
    <SpaceCompact size="small" items={[compactPath, compactButton]} />
  </ConfigProvider>
  <output aria-label="Path value">{JSON.stringify(value)}</output>
  <output aria-label="Path published">{published}</output>
  <output aria-label="Path events">{events.join('|')}</output>
  <output aria-label="Path identity">{String(identity)}</output>
  <output aria-label="Path ref">{nativeElement?.tagName ?? '-'}/{inputElement?.tagName ?? '-'}</output>
  <output aria-label="Panel value">{panelEvents}</output>
  <output aria-label="Path footer count">{footerCount}</output>
  <output aria-label="Path submissions">{submitCount}</output>
</section>
