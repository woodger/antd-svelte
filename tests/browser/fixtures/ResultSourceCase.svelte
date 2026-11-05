<script lang="ts" module>
  import type { ResultProps } from 'antd-svelte';

  export interface ResultSourceSample {
    name: string;
    props: ResultProps;
    semantic?: 'object' | 'function' | 'undefined';
    provider?: 'object' | 'function';
    childProvider?: 'inherit' | 'empty';
    rich?: boolean;
    customIcon?: boolean;
    staticImage?: '403' | '404' | '500';
    rtl?: boolean;
    theme?: string;
  }
</script>

<script lang="ts">
  import { ConfigProvider, Result, theme } from 'antd-svelte';
  import type {
    ResultConfig, ResultSemanticInfo, ResultSemanticSlots, ResultRef, ThemeConfig
  } from 'antd-svelte';

  let { sample, mounted = true }: { sample: ResultSourceSample; mounted?: boolean; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<ResultRef>();
  let count = $state(0);
  const classes: ResultSemanticSlots = {
    root: 'local-root', title: 'local-title', subTitle: 'local-subtitle',
    body: 'local-body', extra: 'local-extra', icon: 'local-icon'
  };
  const styles: ResultSemanticSlots = {
    root: 'padding-top:7px;background:#112233', title: 'color:#335577;padding-top:3px',
    subTitle: 'color:#7799bb;padding-top:4px', body: 'background:#446688;padding-top:5px',
    extra: 'color:#337755;padding-top:6px', icon: 'color:#773355;padding-top:2px'
  };
  const flag = (info: ResultSemanticInfo) => [
    `status-${info.props.status}`,
    info.props.title === undefined ? 'unset-title' : 'given-title',
    info.props.title === 0 ? 'zero-title' : 'other-title'
  ].join(' ');
  const provider = {
    class: 'provider-result', style: 'padding-top:5px',
    classNames: {
      root: 'provider-root', title: 'provider-title', subTitle: 'provider-subtitle',
      body: 'provider-body', extra: 'provider-extra', icon: 'provider-icon'
    },
    styles: {
      root: 'padding-top:3px;background:red', title: 'color:red', subTitle: 'color:blue',
      body: 'background:green', extra: 'color:orange', icon: 'color:purple'
    }
  } satisfies ResultConfig;
  let providerConfig = $derived<ResultConfig>(sample.provider === 'function' ? {
    ...provider,
    classNames: info => ({ ...provider.classNames, root: `provider-root ${flag(info)}` }),
    styles: () => provider.styles
  } : provider);
  let resultProps = $derived<ResultProps>({
    ...sample.props,
    ...(sample.semantic === 'object' ? { classNames: classes, styles } : {}),
    ...(sample.semantic === 'function' ? {
      classNames: info => ({ ...classes, root: `local-root ${flag(info)}` }),
      styles: info => ({ ...styles,
        root: `padding-top:${info.props.title === 0 ? 9 : 7}px;background:#112233` })
    } : sample.semantic === 'undefined' ? {
      classNames: () => undefined, styles: () => undefined
    } : {}),
    ...(sample.customIcon ? { icon: customIcon } : {}),
    ...(sample.rich ? { title: richTitle, subTitle: richSubtitle, extra: actions, children: body } : {})
  });
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'result-source-scope',
      ...(sample.theme === 'variables' ? { prefix: 'Rp' } : {}) },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    ...(sample.theme === 'global' ? { token: {
      fontSize: 17, fontSizeHeading3: 29, paddingLG: 27, colorInfo: '#156789'
    } } : {}),
    components: { Result: sample.theme === 'tokens' ? {
      titleFontSize: 31, subtitleFontSize: 19, iconFontSize: 83, extraMargin: '11px 7px 5px'
    } : sample.theme === 'aliases' ? {
      colorTextHeading: '#123456', colorTextDescription: '#56789a', colorFillAlter: '#aabbcc',
      colorInfo: '#117733', paddingLG: 29, lineHeightHeading3: 1.8, lineHeight: 2,
      fontSizeHeading3: 30, fontSize: 18
    } : sample.theme === 'algorithm' ? { algorithm: true, fontSize: 18 }
      : sample.theme === 'strings' ? {
        titleFontSize: '2rem', iconFontSize: '3.5rem', extraMargin: '1.5em auto 0'
      } : sample.theme === 'zero' ? {
        titleFontSize: 0, subtitleFontSize: 0, iconFontSize: 0, extraMargin: 0
      } : {} }
  });
</script>

{#snippet richTitle()}<strong>Rich Result title</strong>{/snippet}
{#snippet richSubtitle()}<em>Rich Result subtitle</em>{/snippet}
{#snippet actions()}<button type="button" onclick={() => count++}>Result source action {count}</button>
  <input aria-label="Result source draft" value="Fresh draft" />
{/snippet}
{#snippet body()}<p>Result source details</p>{/snippet}
{#snippet customIcon()}<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M0 0H24V24H0Z" fill="#1677ff" /></svg>
  <button type="button">Decorative Result source control</button>
{/snippet}

<ConfigProvider theme={sourceTheme} direction={sample.rtl ? 'rtl' : 'ltr'}
  result={sample.provider ? providerConfig : undefined}>
  <ConfigProvider result={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-result-source-frame style="width:600px;max-width:100%">
      {#if mounted}
        {#if sample.staticImage === '403'}<Result.PRESENTED_IMAGE_403 />
        {:else if sample.staticImage === '404'}<Result.PRESENTED_IMAGE_404 />
        {:else if sample.staticImage === '500'}<Result.PRESENTED_IMAGE_500 />
        {:else}<Result {...resultProps} bind:nativeElement bind:ref />{/if}
      {/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Result source native ref">{Boolean(nativeElement?.isConnected)}</output>
<output aria-label="Result source object ref">{ref ? ref.nativeElement === nativeElement : false}</output>
