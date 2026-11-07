<script lang="ts">
  import { untrack } from 'svelte';
  import { ConfigProvider, Slider, type SliderSingleProps, type SliderRef } from 'antd-svelte';
  import { scalarClasses, scalarProvider, scalarStyles, sliderScalarCases }
    from './slider-scalar-cases';

  let { preset = 'mark-only', alternate = false, disabled = false, mounted = true,
    cancelKeys = false, styled = false }: {
    preset?: string;
    alternate?: boolean;
    disabled?: boolean;
    mounted?: boolean;
    cancelKeys?: boolean;
    styled?: boolean;
  } = $props();
  const sample = untrack(() => sliderScalarCases.find(sample => sample.name === preset)!);
  const { valueText, ...rawProps } = sample.props;
  let value = $state(sample.props.value);
  let ref = $state<SliderRef>();
  let nativeElement = $state<HTMLDivElement>();
  let form = $state<HTMLFormElement>();
  let changes = $state<{ next: number; previous: number | null }[]>([]);
  let completed = $state<number[]>([]);
  let focusEvents = $state<string[]>([]);
  let inputProps = $derived<SliderSingleProps>({
    ...rawProps,
    marks: alternate ? { 0: 'Low', 80: 'Updated', 100: 'High' } : sample.props.marks,
    disabled: disabled || sample.props.disabled,
    classNames: sample.callback ? scalarClasses : sample.props.classNames,
    styles: styled ? { root: 'color:rgb(30,40,50)', rail: 'height:10px' }
      : sample.callback ? scalarStyles : sample.props.styles,
    ariaValueTextFormatterForHandle: valueText ? [point => `Value ${point}`] : undefined
  });
  let isVertical = $derived(inputProps.orientation === 'vertical');
</script>

{#snippet control()}
  <form id="scalar-form" bind:this={form} onsubmit={event => event.preventDefault()}>
    <div data-scalar-case style="width:400px;height:220px">
      <span id="scalar-label">Scalar label</span>
      {#if mounted}
        <Slider {...inputProps} range={false} bind:value bind:ref bind:nativeElement name="scalar"
          style={[inputProps.style, isVertical ? 'height:180px' : 'width:360px']
            .filter(Boolean).join(';')}
          tooltip={false} onChange={next => {
            changes = [...changes, { next, previous: value ?? null }];
          }} onChangeComplete={next => completed = [...completed, next]}
          onFocus={() => focusEvents = [...focusEvents, 'focus']}
          onBlur={() => focusEvents = [...focusEvents, 'blur']}
          onkeydown={event => { if (cancelKeys) event.preventDefault(); }} />
      {/if}
    </div>
    <button type="reset">Reset scalar form</button>
  </form>
{/snippet}

<ConfigProvider direction={sample.direction ?? 'ltr'}
  theme={sample.nativeTheme
    ?? { cssVar: { key: 'scalar-source-scope' }, token: { motion: false } }}
  slider={scalarProvider(sample)}>
  {#if sample.child !== undefined}
    <ConfigProvider slider={sample.child ?? undefined}>{@render control()}</ConfigProvider>
  {:else}{@render control()}{/if}
</ConfigProvider>
<button type="button" onclick={() => value = 49}>Set scalar owner to 49</button>
<button type="button" onclick={() => form?.reset()}>Reset scalar through ref</button>
<button type="button" onclick={() => ref?.focus()}>Focus scalar ref</button>
<button type="button" onclick={() => ref?.blur()}>Blur scalar ref</button>
<output aria-label="Scalar owner">{String(value)}</output>
<output aria-label="Scalar changes">{JSON.stringify(changes)}</output>
<output aria-label="Scalar completions">{JSON.stringify(completed)}</output>
<output aria-label="Scalar focus events">{JSON.stringify(focusEvents)}</output>
<output aria-label="Scalar native root">{nativeElement?.tagName ?? ''}</output>
