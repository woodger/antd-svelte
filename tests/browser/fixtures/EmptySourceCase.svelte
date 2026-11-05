<script lang="ts">
  import { ConfigProvider, Empty, enUS, theme } from 'antd-svelte';
  import type {
    EmptyConfig, EmptyProps, EmptyRef, EmptySemanticSlots, EmptySemanticInfo, ThemeConfig
  } from 'antd-svelte';

  export interface EmptySourceSample {
    name: string;
    props: EmptyProps;
    provider?: 'object' | 'function';
    semantic?: 'object' | 'function';
    childProvider?: 'inherit' | 'empty';
    customImage?: boolean;
    richDescription?: boolean;
    actions?: boolean;
    rtl?: boolean;
    theme?: string;
  }

  let { sample, mounted = true }: { sample: EmptySourceSample; mounted?: boolean; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<EmptyRef>();
  let count = $state(0);
  const classes: EmptySemanticSlots = {
    root: 'local-root', image: 'local-image', description: 'local-description', footer: 'local-footer'
  };
  const styles: EmptySemanticSlots = {
    root: 'padding-top:7px;background:#112233',
    image: 'height:37px;padding-top:2px;background:#224466',
    description: 'padding-top:3px;color:#335577',
    footer: 'padding-top:4px;background:#446688'
  };
  const flag = (info: EmptySemanticInfo) => [
    info.props.image === undefined ? 'unset-image' : 'given-image',
    info.props.description === undefined ? 'unset-description' : 'given-description',
    info.props.description === 0 ? 'zero-description' : 'other-description'
  ].join(' ');
  const provider = {
    image: 'simple', class: 'provider-empty', style: 'padding-top:5px',
    classNames: {
      root: 'provider-root', image: 'provider-image',
      description: 'provider-description', footer: 'provider-footer'
    },
    styles: {
      root: 'padding-top:3px;background:red', image: 'height:25px;background:blue',
      description: 'color:red', footer: 'background:green'
    }
  } satisfies EmptyConfig;
  let providerConfig = $derived<EmptyConfig>(sample.provider === 'function' ? {
    ...provider,
    classNames: info => ({ ...provider.classNames, root: `provider-root ${flag(info)}` }),
    styles: () => provider.styles
  } : provider);
  let emptyProps = $derived<EmptyProps>({
    ...sample.props,
    ...(sample.semantic === 'object' ? { classNames: classes, styles } : {}),
    ...(sample.semantic === 'function' ? {
      classNames: info => ({ ...classes, root: `local-root ${flag(info)}` }),
      styles: info => ({ ...styles,
        root: `padding-top:${info.props.description === 0 ? 9 : 7}px;background:#112233` })
    } : {}),
    ...(sample.customImage ? { image: customImage } : {}),
    ...(sample.richDescription ? { description: richDescription } : {}),
    ...(sample.actions ? { children: actions } : {})
  });
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'empty-source-scope',
      ...(sample.theme === 'variables' ? { prefix: 'Ep' } : {}) },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    ...(sample.theme === 'paint' ? { token: {
      colorBgContainer: '#142536', colorFill: 'rgba(255,80,40,0.35)',
      colorFillTertiary: 'rgba(40,150,220,0.4)'
    } } : sample.theme === 'css-paint' ? { token: {
      colorBgContainer: 'var(--empty-bg)', colorFill: 'var(--empty-ink)'
    } } : {}),
    components: { Empty: sample.theme === 'aliases' ? {
      colorTextDescription: '#125678', controlHeightLG: 48, margin: 27, marginXS: 5,
      marginXL: 43, fontSize: 17, lineHeight: 1.8, opacityImage: 0.3,
      colorFill: '#ff0000', colorBgContainer: '#00ff00'
    } : sample.theme === 'algorithm' ? { algorithm: true, controlHeight: 40 }
      : sample.theme === 'zero' ? {
        controlHeightLG: 0, margin: 0, marginXS: 0, marginXL: 0,
        fontSize: 0, lineHeight: 0, opacityImage: 0
      } : {} }
  });
</script>

{#snippet customImage()}<a href="#empty-source-fixture" aria-label="Decorative source image link">
  <svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0H24V24H0Z" fill="#1677ff" /></svg>
</a>{/snippet}
{#snippet richDescription()}<strong>Rich empty description</strong>
  <input aria-label="Empty description draft" value="Description draft" />
{/snippet}
{#snippet actions()}<button type="button" onclick={() => count++}>Empty source action {count}</button>
  <input aria-label="Empty source draft" value="Fresh draft" />
{/snippet}

<ConfigProvider theme={sourceTheme} locale={enUS} direction={sample.rtl ? 'rtl' : 'ltr'}
  empty={sample.provider ? providerConfig : undefined}>
  <ConfigProvider empty={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-empty-source-frame style="width:300px;--empty-bg:#e0d0c0;--empty-ink:rgba(40,80,120,.4)">
      {#if mounted}<Empty {...emptyProps} bind:nativeElement bind:ref />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Empty source native ref">{Boolean(nativeElement?.isConnected)}</output>
<output aria-label="Empty source object ref">{ref ? ref.nativeElement === nativeElement : false}</output>
