<script lang="ts">
  import {
    ConfigProvider,
    ModalHolder,
    createModal,
    type ModalConfirmConfig,
    type ModalConfirmHandle,
    type ModalConfirmType
  } from 'antd-svelte';
  import reference from './ant-design-modal-controller-reference.json';

  interface Sample {
    id: string;
    type: ModalConfirmType;
    action?: string;
    update?: string;
    manual?: boolean;
    async?: boolean;
    reject?: boolean;
  }
  let modal = $state.raw(createModal());
  const sibling = createModal();
  let selected = $state('confirm');
  let mounted = $state(true);
  let colored = $state(false);
  let events = $state<string[]>([]);
  let result = $state<string>('pending');
  let handle: ModalConfirmHandle | undefined;
  let resolve: (() => void) | undefined;
  let reject: (() => void) | undefined;
  let manualClose: (() => void) | undefined;

  function show() {
    const sample = reference.cases.find(entry => entry.sample.id === selected)?.sample as Sample;
    events = [];
    result = 'pending';
    const config: ModalConfirmConfig = {
      title: 'Confirm title',
      content: selected === 'context' ? richContent : 'Confirm content',
      afterClose: () => events.push('after-close'),
      onOk: () => { events.push('ok'); },
      onCancel: () => { events.push('cancel'); }
    };
    if (sample?.manual) {
      config.onOk = close => {
        events.push('ok');
        manualClose = close;
      };
    }
    if (sample?.async) {
      config.onOk = () => {
        events.push('ok');
        return new Promise<void>((done, fail) => {
          resolve = done;
          reject = () => fail(new Error('Validation declined'));
        });
      };
    }
    handle = modal[sample?.type ?? 'confirm'](config);
    void handle.then(confirmed => {
      result = String(confirmed);
      events.push(`result:${confirmed}`);
    });
    if (sample?.update === 'object') {
      handle.update({ title: 'Changed title', content: 'Changed content' });
    } else if (sample?.update === 'function') {
      handle.update(previous => ({ title: `${previous.title} updated` }));
    }
  }

  function hotkey(event: KeyboardEvent) {
    if (!event.ctrlKey || !event.altKey) return;
    event.preventDefault();
    if (event.key === 'd') handle?.destroy();
    if (event.key === 'r') resolve?.();
    if (event.key === 'j') reject?.();
    if (event.key === 'm') manualClose?.();
    if (event.key === 'h') mounted = !mounted;
    if (event.key === 't') colored = !colored;
    if (event.key === 'u') handle?.update({ title: 'Live updated title' });
    if (event.key === 'n') modal.info({ title: 'Nested confirmation', content: 'Nested body' });
    if (event.key === 's') modal = createModal();
    if (event.key === 'b') sibling.info({ title: 'Sibling confirmation', content: 'Sibling body' });
  }
</script>

<svelte:window onkeydown={hotkey} />
{#snippet richContent()}<label>Confirmation draft <input value="initial draft" /></label>{/snippet}

<section id="modal-controller-fixture" aria-label="Modal context confirmations">
  <label>Confirmation sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
      <option value="context">context</option>
    </select>
  </label>
  <button type="button" onclick={show}>Open confirmation</button>
  <input aria-label="Outside confirmation" />
  <output id="modal-controller-result">{result}</output>
  <output id="modal-controller-events">{events.join('|')}</output>
  <ConfigProvider theme={{ cssVar: {}, components: { Modal: {
    contentBg: colored ? '#123456' : undefined
  } } }}>
    {#if mounted}<ModalHolder {modal} />{/if}
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, components: { Modal: { contentBg: '#abcdef' } } }}>
    <ModalHolder modal={sibling} />
  </ConfigProvider>
</section>
