<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, TreeSelect } from 'antd-svelte';
  import type { TreeSelectRef, TreeSelectRootContext } from 'antd-svelte';
  import type { TreeSelectRootSample } from './tree-select-root-cases';
  import TreeSelectRootElement from './TreeSelectRootElement.svelte';
  import TreeSelectRootComposite from './TreeSelectRootComposite.svelte';
  let { sample }: { sample: TreeSelectRootSample } = $props();
  let open = $state(untrack(() => sample.controlled?.endsWith('-open') ?? false));
  let events = $state<unknown[][]>([]);
  let mounted = $state(true);
  let control = $state<TreeSelectRef>();
  let nativeElement = $state<HTMLElement>();
  let inputElement = $state<HTMLInputElement>();
  let ownElement = $state<HTMLElement>();
  function record(owner: 'generated' | 'own', kind: string, event: Event) {
    if (sample.prevent === owner && event.cancelable) event.preventDefault();
    events.push([`${owner}:${kind}`, (event.currentTarget as Element).tagName,
      event.defaultPrevented, (event.target as Element).tagName,
      event instanceof KeyboardEvent ? event.key : null]);
  }
  let ownProps = $derived(sample.own ? {
    class: 'root-own', style: 'width: 220px; color: rgb(120, 30, 20);',
    id: 'own-id', tabindex: 7, title: 'Own title', 'aria-label': 'Own label',
    'data-collision': 'own', 'data-own': 'kept', name: 'own-name',
    placeholder: 'Own placeholder', disabled: sample.ownDisabled,
    type: sample.root.includes('button') ? 'button' as const : undefined,
    value: sample.root === 'input' || sample.root === 'component-input' ? 'Own draft' : undefined,
    onfocusin: (event: FocusEvent) => record('own', 'focus', event),
    onfocusout: (event: FocusEvent) => record('own', 'blur', event),
    onmousedown: (event: MouseEvent) => record('own', 'mouse-down', event),
    onclick: (event: MouseEvent) => record('own', 'click', event),
    onkeydown: (event: KeyboardEvent) => record('own', 'key-down', event),
    onkeyup: (event: KeyboardEvent) => record('own', 'key-up', event)
  } : undefined);
  let refs = $derived({
    nativeTag: nativeElement?.tagName ?? null,
    nativeIsRoot: Boolean(nativeElement && nativeElement === ownElement),
    focus: Boolean(nativeElement && control?.focus), blur: Boolean(nativeElement && control?.blur),
    ownTag: sample.own ? ownElement?.tagName ?? null : null,
    ownIsNative: Boolean(sample.own && ownElement && ownElement === nativeElement)
  });
  function refAction(kind: 'focus' | 'blur') {
    events.push([`ref:${kind}:before`]);
    if (kind === 'focus') control?.focus({ preventScroll: true });
    else control?.blur();
    events.push([`ref:${kind}:after`]);
  }
</script>
{#snippet prefix()}<b data-root-generated-prefix>Generated prefix</b>{/snippet}
{#snippet suffix()}<b data-root-generated-suffix>Generated suffix</b>{/snippet}
{#snippet inert()}<input data-root-inert-input />{/snippet}
{#snippet root(context: TreeSelectRootContext<HTMLElement>)}
  {#if sample.root === 'composite'}
    <TreeSelectRootComposite {context} bind:nativeElement={ownElement} />
  {:else if sample.root.startsWith('component-')}
    <TreeSelectRootElement {context} button={sample.root === 'component-button'} bind:nativeElement={ownElement} />
  {:else if sample.root === 'button'}
    <button {...context.attributes} bind:this={ownElement} {@attach context.register}>{sample.own ? 'Own root' : ''}</button>
  {:else if sample.root === 'container'}
    <div {...context.attributes} bind:this={ownElement} {@attach context.register}>
      <input data-root-child aria-label="Nested root field" value="Nested draft" />
    </div>
  {:else}
    <input {...context.attributes} bind:this={ownElement} {@attach context.register} />
  {/if}
{/snippet}
<ConfigProvider theme={{ token: { motion: false }, cssVar: { key: 'tree-select-root' } }}>
  <output data-root-events hidden>{JSON.stringify(events)}</output>
  <output data-root-refs hidden>{JSON.stringify(refs)}</output>
  <output data-root-native-editor hidden>{inputElement?.tagName ?? ''}</output>
  <div data-tree-select-root-host style="margin:64px;width:340px" data-root-ready={Boolean(nativeElement)}>
    {#if mounted}<TreeSelect bind:this={control} bind:nativeElement bind:inputElement
      components={{ root: ownProps ? { render: root, props: ownProps } : root,
        input: sample.both ? inert : undefined }}
      treeData={[{ value: 'a', title: 'Alpha' }, { value: 'b', title: 'Beta' }]} defaultValue="a"
      id="generated-id" title="Generated title" name="generated-name" tabIndex={4}
      data-root-probe="control" data-collision="generated" aria-label="Generated label"
      class="generated-class" style="width:310px;color:rgb(20,30,120)" placeholder="Generated placeholder"
      allowClear showSearch={{ onSearch: value => events.push(['search', value]) }} {prefix} {suffix}
      disabled={sample.disabled} defaultOpen={sample.defaultOpen} open={sample.controlled ? open : undefined}
      showAction={sample.showAction}
      onOpenChange={next => { events.push(['open', next]); if (sample.controlled?.startsWith('accept-')) open = next; }}
      onChange={value => events.push(['change', value ?? null])}
      onFocus={event => record('generated', 'focus', event)} onBlur={event => record('generated', 'blur', event)}
      onMouseDown={event => record('generated', 'mouse-down', event)} onClick={event => record('generated', 'click', event)}
      onKeyDown={event => record('generated', 'key-down', event)} onKeyUp={event => record('generated', 'key-up', event)} />{/if}
  </div>
</ConfigProvider>
<button type="button">Outside root</button>
<button type="button" onclick={() => refAction('focus')}>Root ref focus</button>
<button type="button" onclick={() => refAction('blur')}>Root ref blur</button>
<button type="button" onclick={() => { mounted = false; }}>Unmount root</button>
