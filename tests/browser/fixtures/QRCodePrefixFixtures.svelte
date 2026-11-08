<script lang="ts">
  import reference from './ant-design-qrcode-prefix-reference.json';
  import QRCodePrefixCase from './QRCodePrefixCase.svelte';
  import type { QRCodePrefixSample } from './qrcode-prefix-cases';

  let { sample: initialSample }: { sample?: QRCodePrefixSample } = $props();
  let selected = $state(reference.cases[0].sample.id);
  let transition = $state('matrix');
  let sample = $derived(initialSample ?? (transition === 'matrix'
    ? reference.cases.find(({ sample }) => sample.id === selected)!.sample
    : reference.transitions.find(({ step }) => step === transition)!.sample) as QRCodePrefixSample);
</script>

<section id="qrcode-prefix-fixture" aria-label="QRCode local prefix">
  <label>QRCode prefix sample
    <select bind:value={selected}>
      {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
    </select>
  </label>
  <label>QRCode prefix transition
    <select bind:value={transition}>
      <option value="matrix">matrix</option>
      {#each reference.transitions as { step }}<option value={step}>{step}</option>{/each}
    </select>
  </label>
  <QRCodePrefixCase {sample} />
</section>
