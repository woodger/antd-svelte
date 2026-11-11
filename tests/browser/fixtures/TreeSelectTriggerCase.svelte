<script lang="ts">
  import { untrack } from 'svelte';
  import { TreeSelect } from 'antd-svelte';
  import type { TreeSelectRef } from 'antd-svelte';
  import type { TreeSelectTriggerAction, TreeSelectTriggerSample } from './tree-select-trigger-cases';
  let { sample }: { sample: TreeSelectTriggerSample } = $props();
  let actions = $state(untrack(() => sample.showAction));
  let disabled = $state(untrack(() => sample.disabled));
  let controlledOpen = $state(false);
  let revision = $state(0);
  let events = $state<unknown[][]>([]);
  let nativeEvents = $state<string[]>([]);
  let control = $state<TreeSelectRef>();
  let nativeElement = $state<HTMLDivElement>();
  let inputElement = $state<HTMLInputElement>();
  let active = $state(true);
  let actionIndex = $state('0');
  function record(kind: string, event: KeyboardEvent | MouseEvent | FocusEvent) {
    events = [...events, 'key' in event
      ? [kind, event.key, (event.currentTarget as Element).tagName, event.defaultPrevented]
      : [kind, (event.currentTarget as Element).tagName]];
  }
  function apply(action: TreeSelectTriggerAction) {
    if (action === 'enable-focus-action') actions = ['focus'];
    if (action === 'disable') disabled = true;
    if (action === 'enable') disabled = false;
    if (action === 'update') revision++;
  }
</script>

<output data-trigger-events hidden>{JSON.stringify(events)}</output>
<output data-trigger-native-events hidden>{JSON.stringify(nativeEvents)}</output>
<div data-trigger-control data-trigger-multiple={sample.multiple || undefined} style="margin:64px;width:320px"
  data-trigger-ref={Boolean(nativeElement && inputElement)}>
  {#if active}<TreeSelect bind:this={control} bind:nativeElement bind:inputElement
    aria-label="Trigger selection" style="width:320px" treeData={[
      { value: 'a', title: revision ? 'Updated Alpha' : 'Alpha' }, { value: 'b', title: 'Beta' }
    ]} showSearch={!sample.readonly} showAction={actions} autoFocus={sample.autoFocus} {disabled}
    multiple={sample.multiple} defaultOpen={sample.defaultOpen}
    defaultValue={sample.clear ? 'a' : undefined} allowClear={sample.clear}
    getPopupContainer={sample.insideRoot ? trigger => trigger : undefined}
    open={sample.controlledOpen ? controlledOpen : undefined}
    maxLength={sample.maxLength} tabIndex={sample.tabIndex}
    {...(sample.nativeAttributes ? { autofocus: false, tabindex: 7, maxlength: 2 } : {})}
    onOpenChange={value => {
      events = [...events, ['open', value]];
      if (sample.controlledOpen === 'accept') controlledOpen = value;
    }}
    onChange={(value, labels) => { events = [...events, ['change', value ?? null, labels]]; }}
    onSelect={value => { events = [...events, ['select', value]]; }}
    onDeselect={value => { events = [...events, ['deselect', value]]; }}
    onClear={() => { events = [...events, ['clear']]; }}
    onInputKeyDown={event => {
      record('input-key', event);
      if (event.key === sample.inputPrevent) event.preventDefault();
      if (event.key === sample.inputStop) event.stopPropagation();
    }} onKeyDown={event => { record('root-key', event); if (event.key === sample.rootPrevent) event.preventDefault(); }}
    onKeyUp={event => record('root-key-up', event)}
    onFocus={event => record('focus', event)} onBlur={event => record('blur', event)}
    onMouseDown={event => record('mouse-down', event)} onClick={event => record('click', event)}
    onMouseEnter={event => record('mouse-enter', event)} onMouseLeave={event => record('mouse-leave', event)}
    onkeydown={event => { nativeEvents = [...nativeEvents, `down:${event.key}:${event.currentTarget.tagName}`];
      if (event.key === sample.nativePrevent) event.preventDefault(); }}
    onkeyup={event => { nativeEvents = [...nativeEvents, `up:${event.key}:${event.currentTarget.tagName}`]; }}
    onfocus={event => { nativeEvents = [...nativeEvents, `focus:${event.currentTarget.tagName}`]; }}
    onblur={event => { nativeEvents = [...nativeEvents, `blur:${event.currentTarget.tagName}`]; }}
  />{/if}
</div>
<button id="trigger-outside" type="button">Outside trigger</button>
<label>Trigger action<select bind:value={actionIndex}>
  {#each sample.actions as action, index}<option value={String(index)}>{action}</option>{/each}
</select></label>
<button type="button" onclick={() => apply(sample.actions[Number(actionIndex)])}>Apply trigger action</button>
<button type="button" onclick={() => control?.focus()}>Focus trigger ref</button>
<button type="button" onclick={() => control?.blur()}>Blur trigger ref</button>
<button type="button" data-trigger-unmount onclick={() => { active = false; }}>Unmount trigger</button>
