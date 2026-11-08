<script lang="ts">
  import {
    Form, FormItem, RadioGroup, CheckboxGroup, InputOTP, Slider, ColorPicker, createForm
  } from 'antd-svelte';

  let { caption = 'Choices' }: { caption?: string } = $props();
  const model = createForm({ initialValues: {
    radio: 'a', checkbox: ['a'], otp: '', slider: 40, range: [25, 75], color: '#1677ff'
  } });
  const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];
  const fields = ['radio', 'checkbox', 'otp', 'slider', 'range', 'color'] as const;
  let ownLabel = $state(false);
  let ownLabelledBy = $state(false);
  let plain = $state(false);
</script>

<section data-rich-controls aria-label="Rich label controls">
  <button type="button" onclick={() => { ownLabel = !ownLabel; }}>Toggle own rich names</button>
  <button type="button" onclick={() => { ownLabelledBy = !ownLabelledBy; }}>
    Toggle external rich names
  </button>
  <button type="button" onclick={() => { plain = !plain; }}>Toggle plain control labels</button>
  <p id="rich-control-external">External label</p>
  <Form form={model}>
    {#each fields as kind}
      {#snippet label()}<strong>{caption} {kind}</strong>{/snippet}
      <FormItem name={kind} label={plain ? `${caption} ${kind}` : label} class={`rich-${kind}`}>
        {#if kind === 'radio'}
          <RadioGroup {options} defaultValue="a" aria-label={ownLabel ? 'Owner radio' : undefined}
            aria-labelledby={ownLabelledBy ? 'rich-control-external' : undefined} />
        {:else if kind === 'checkbox'}
          <CheckboxGroup {options} defaultValue={['a']}
            aria-label={ownLabel ? 'Owner checkbox' : undefined}
            aria-labelledby={ownLabelledBy ? 'rich-control-external' : undefined} />
        {:else if kind === 'otp'}
          <InputOTP length={4} aria-label={ownLabel ? 'Owner otp' : undefined}
            aria-labelledby={ownLabelledBy ? 'rich-control-external' : undefined} />
        {:else if kind === 'slider'}
          <Slider defaultValue={40} ariaLabelForHandle={ownLabel ? 'Owner slider' : undefined}
            ariaLabelledByForHandle={ownLabelledBy ? 'rich-control-external' : undefined} />
        {:else if kind === 'range'}
          <Slider range defaultValue={[25, 75]}
            ariaLabelForHandle={ownLabel ? ['Owner start', 'Owner end'] : undefined}
            ariaLabelledByForHandle={ownLabelledBy
              ? ['rich-control-external', 'rich-control-external'] : undefined} />
        {:else}
          <ColorPicker defaultValue="#1677ff" aria-label={ownLabel ? 'Owner color' : undefined}
            aria-labelledby={ownLabelledBy ? 'rich-control-external' : undefined} />
        {/if}
      </FormItem>
    {/each}
  </Form>
</section>
