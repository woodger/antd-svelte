<script lang="ts">
  import { Modal } from 'antd-svelte';
  import reference from './ant-design-modal-content-reference.json';

  interface Sample {
    id: string;
    title?: string | number | boolean | null;
    label?: string;
    labelledBy?: string;
  }
  let selected = $state('string');
  let sample = $derived((reference.cases.find(entry => entry.sample.id === selected)
    ?? reference.cases[0]).sample as Sample);
  let open = $state(false);
</script>

{#snippet richTitle()}<strong>Rich title</strong>{/snippet}

<section id="modal-content-fixture" aria-label="Modal content types">
  <label>Modal title sample
    <select id="modal-title-sample" bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <span id="external-title">External modal name</span>
  <button type="button" onclick={() => { open = true; }}>Open content modal</button>
  <Modal bind:open title={sample.title === 'node' ? richTitle : sample.title}
    aria-label={sample.label} aria-labelledby={sample.labelledBy} footer={null}>
    <input aria-label="Modal draft" value="draft text" />
  </Modal>
</section>
