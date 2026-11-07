<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { ConfigProvider, Spin, theme } from 'antd-svelte';
  import type {
    SpinProps, SpinConfig, SpinIndicatorInfo, SpinSemanticInfo,
    SpinSemanticSlots, SpinRef, ThemeConfig, ComponentSize
  } from 'antd-svelte';

  export interface SpinSourceSample {
    name: string;
    props: Omit<SpinProps, 'indicator' | 'classNames' | 'styles'> & { indicator?: string | null; };
    children?: boolean;
    childValue?: number | boolean;
    provider?: boolean;
    childProvider?: string;
    providerSize?: ComponentSize;
    semantic?: boolean;
    global?: boolean;
    rtl?: boolean;
    theme?: string;
  }
  let { sample, tokenSize, mounted = true, globalName }: {
    sample: SpinSourceSample;
    tokenSize?: number;
    mounted?: boolean;
    globalName?: string;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<SpinRef>();
  let count = $state(0);
  Spin.setDefaultIndicator(untrack(() => sample.global) ? globalCustom : null);
  onDestroy(() => Spin.setDefaultIndicator(null));
  let resolvedProps = $derived.by((): SpinProps => {
    const { indicator, ...rest } = sample.props;
    return { ...rest, indicator: indicator === 'local' ? local : indicator === null ? null : undefined };
  });
  const classes = (info: SpinSemanticInfo): SpinSemanticSlots => ({
    root: `local-root size-${info.props.size ?? 'none'} visible-${info.props.spinning} full-${info.props.fullscreen} percent-${info.props.percent ?? 'none'}`,
    section: 'local-section', indicator: 'local-indicator', description: 'local-description',
    container: 'local-container'
  });
  const styles = (): SpinSemanticSlots => ({
    root: 'padding-top:7px;color:#cc2200', section: 'padding-top:6px',
    indicator: 'color:#1122aa', description: 'font-size:19px', container: 'background-color:#eee'
  });
  let provider = $derived<SpinConfig>({
    class: 'provider-spin', style: 'padding-top:9px', indicator: provided,
    classNames: { root: 'provider-root', section: 'provider-section', indicator: 'provider-indicator',
      description: 'provider-description', container: 'provider-container' },
    styles: { root: 'padding-top:3px', section: 'padding-top:4px', indicator: 'color:#ff8800' }
  });
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'spin-source-scope', ...(sample.theme === 'variables' ? { prefix: 'SpinX' } : {}) },
    token: { motion: false },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    components: { Spin: {
      ...(sample.theme === 'own'
        ? { contentHeight: 260, dotSize: 28, dotSizeSM: 18, dotSizeLG: 42 } : {}),
      ...(sample.theme === 'aliases' ? { controlHeightLG: 56, controlHeight: 48,
        colorPrimary: '#cc2288', fontSize: 17, paddingSM: 18 } : {}),
      ...(sample.theme === 'algorithm' ? { sizeUnit: 6, algorithm: true } : {}),
      ...(sample.theme === 'variables' ? { dotSize: 26 } : {}),
      ...(sample.theme === 'undefined' ? { dotSize: undefined } : {}),
      ...(sample.theme === 'zero' ? { dotSizeSM: 0 } : {}),
      ...(tokenSize === undefined ? {} : { dotSize: tokenSize })
    } }
  });
  $effect(() => {
    // Setter не реактивен: существующий Spin читает fallback при следующем обновлении props.
    if (globalName) Spin.setDefaultIndicator(replacement);
  });
</script>

{#snippet icon(name: string, info: SpinIndicatorInfo)}<span data-spin-custom={name}
  data-spin-percent={info.percent}>{name}</span>{/snippet}
{#snippet local(info: SpinIndicatorInfo)}{@render icon('local', info)}{/snippet}
{#snippet provided(info: SpinIndicatorInfo)}{@render icon('provider', info)}{/snippet}
{#snippet globalCustom(info: SpinIndicatorInfo)}{@render icon('global', info)}{/snippet}
{#snippet replacement(info: SpinIndicatorInfo)}{@render icon('replacement', info)}{/snippet}
{#snippet contents()}<div style="width:260px;height:96px"><input aria-label="Spin source draft" value="Draft" /><button
  type="button" onclick={() => count++}>Child counter {count}</button></div>{/snippet}
<ConfigProvider theme={sourceTheme} spin={sample.provider ? provider : undefined}
  componentSize={sample.providerSize} direction={sample.rtl ? 'rtl' : 'ltr'}>
  <ConfigProvider spin={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-spin-source style="width:300px">
      {#if mounted}<Spin {...resolvedProps} bind:nativeElement bind:ref
        children={sample.children ? contents : sample.childValue}
        classNames={sample.semantic ? classes : undefined}
        styles={sample.semantic ? styles : undefined} />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Spin source ref">{Boolean(nativeElement && ref?.nativeElement === nativeElement)}</output>
