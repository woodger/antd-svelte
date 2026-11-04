<script lang="ts">
  import { createRawSnippet } from 'svelte';
  import { ConfigProvider, Progress, theme } from 'antd-svelte';
  import type {
    ProgressProps, ProgressConfig, ProgressSemanticInfo, ProgressSemanticSlots, ThemeConfig
  } from 'antd-svelte';

  export interface ProgressCircleSample {
    name: string;
    props: Omit<Extract<ProgressProps, { type: 'circle' | 'dashboard'; }>, 'format' | 'rounding'>;
    format?: string;
    rounding?: string;
    semantic?: boolean;
    provider?: boolean;
    childProvider?: string;
    theme?: string;
    rtl?: boolean;
    bodyWidth?: number;
  }
  let { sample, mounted = true }: {
    sample: ProgressCircleSample;
    mounted?: boolean;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let resolvedProps = $derived.by(() => ({
    ...sample.props,
    type: sample.props.type,
    format: sample.format === 'rich'
      ? (p: number, s?: number) => createRawSnippet(() => ({
        render: () => `<strong>${p} / ${s}</strong>`
      }))
      : sample.format === 'numbers' ? (p: number, s?: number) => `${p} / ${s}` : undefined,
    rounding: sample.rounding === 'floor' ? Math.floor
      : sample.rounding === 'ceil' ? Math.ceil : undefined
  }));
  const classes = (info: ProgressSemanticInfo): ProgressSemanticSlots => ({
    root: `local-root percent-${info.props.percent} size-${String(info.props.size)} type-${info.props.type} show-${info.props.showInfo} align-${info.props.percentPosition?.align ?? 'none'}`,
    body: 'local-body', rail: 'local-rail', track: 'local-track', indicator: 'local-indicator'
  });
  const styles = (): ProgressSemanticSlots => ({
    root: 'padding-top:7px', body: 'padding-left:4px', rail: 'border-radius:3px',
    track: 'height:9px;stroke:#119955;stroke-dashoffset:12;stroke-width:3px;transform:rotate(45deg)', indicator: 'color:#6622aa'
  });
  const provider: ProgressConfig = {
    class: 'provider-progress', style: 'padding-top:5px',
    classNames: { root: 'provider-root', body: 'provider-body', rail: 'provider-rail',
      track: 'provider-track', indicator: 'provider-indicator' },
    styles: { root: 'padding-top:3px', body: 'padding-left:2px', rail: 'border-radius:2px',
      track: 'height:7px', indicator: 'color:#2244cc' }
  };
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'progress-circle-source-scope',
      ...(sample.theme === 'variables' ? { prefix: 'ProgressX' } : {}) },
    token: { motion: false },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    components: { Progress: {
      ...(sample.theme === 'own' ? { defaultColor: '#8844cc', remainingColor: '#112233',
        lineBorderRadius: 9, circleTextColor: '#aabbcc', circleTextFontSize: '1.3em',
        circleIconFontSize: '2em' } : {}),
      ...(sample.theme === 'aliases' ? { colorInfo: '#bb2244', fontSize: 18, marginXS: 12,
        colorText: '#119955', paddingXXS: 9, marginXXS: 10 } : {}),
      ...(sample.theme === 'algorithm' ? { colorInfo: '#cc22bb', algorithm: true } : {}),
      ...(sample.theme === 'variables' ? { lineBorderRadius: 7 } : {}),
    } }
  });
</script>

<ConfigProvider theme={sourceTheme} progress={sample.provider ? provider : undefined}
  direction={sample.rtl ? 'rtl' : 'ltr'}>
  <ConfigProvider progress={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-progress-circle style="width:300px">
      {#if mounted}<Progress {...resolvedProps} bind:nativeElement
        classNames={sample.semantic ? classes : undefined}
        styles={sample.bodyWidth ? { body: `width:${sample.bodyWidth}px` }
          : sample.semantic ? styles : undefined} />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Progress circle ref">{Boolean(nativeElement?.isConnected)}</output>
