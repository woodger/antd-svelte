<script lang="ts" module>
  import type { AlertProps } from 'antd-svelte';

  export interface AlertSourceSample {
    name: string;
    props: AlertProps;
    semantic?: 'object' | 'function' | 'undefined';
    provider?: 'object' | 'function' | 'icons';
    childProvider?: 'inherit' | 'empty';
    rich?: boolean;
    customIcon?: boolean;
    events?: 'local' | 'prevent' | 'stop';
    mouse?: boolean;
    rtl?: boolean;
    theme?: string;
  }
</script>

<script lang="ts">
  import { Alert, ConfigProvider, theme } from 'antd-svelte';
  import type {
    AlertConfig, AlertRef, AlertSemanticInfo, AlertSemanticSlots, ThemeConfig
  } from 'antd-svelte';

  let { sample, mounted = true }: { sample: AlertSourceSample; mounted?: boolean; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<AlertRef>();
  let count = $state(0);
  let events = $state<string[]>([]);
  const classes: AlertSemanticSlots = {
    root: 'local-root', icon: 'local-icon', section: 'local-section', title: 'local-title',
    description: 'local-description', actions: 'local-actions', close: 'local-close'
  };
  const styles: AlertSemanticSlots = {
    root: 'padding-top:7px;background:#112233', icon: 'color:#773355;padding-top:2px',
    section: 'padding-top:3px', title: 'color:#335577;padding-top:4px',
    description: 'color:#7799bb;padding-top:5px', actions: 'color:#337755;padding-top:6px',
    close: 'color:#553377;padding-top:8px'
  };
  const flag = (info: AlertSemanticInfo) => [
    `type-${info.props.type}`, `variant-${info.props.variant}`, `prefix-${info.props.prefixCls}`,
    `close-${info.props.closable}`, `icon-${String(info.props.showIcon)}`,
    info.props.title === undefined ? 'unset-title' : 'given-title'
  ].join(' ');
  const provider = {
    variant: 'filled',
    closable: { closeIcon: 'Context close', 'aria-label': 'Context close', 'data-owner': 'context' },
    class: 'provider-alert', style: 'padding-top:5px',
    classNames: {
      root: 'provider-root', icon: 'provider-icon', section: 'provider-section',
      title: 'provider-title', description: 'provider-description',
      actions: 'provider-actions', close: 'provider-close'
    },
    styles: {
      root: 'padding-top:3px;background:red', icon: 'color:purple', section: 'padding-top:1px',
      title: 'color:red', description: 'color:blue', actions: 'color:orange', close: 'color:green'
    }
  } satisfies AlertConfig;
  let providerConfig = $derived<AlertConfig>(sample.provider === 'icons' ? {
    successIcon: 'Context success', infoIcon: 'Context info',
    warningIcon: 'Context warning', errorIcon: 'Context error'
  } : sample.provider === 'function' ? {
    ...provider,
    classNames: info => ({ ...provider.classNames, root: `provider-root ${flag(info)}` }),
    styles: () => provider.styles
  } : provider);
  function close(event: MouseEvent, name: string) {
    events = [...events, name];
    if (sample.events === 'prevent') event.preventDefault();
    if (sample.events === 'stop') event.stopPropagation();
  }
  let alertProps = $derived<AlertProps>({
    ...sample.props,
    ...(sample.semantic === 'object' ? { classNames: classes, styles } : {}),
    ...(sample.semantic === 'function' ? {
      classNames: info => ({ ...classes, root: `local-root ${flag(info)}` }),
      styles: () => styles
    } : sample.semantic === 'undefined' ? { classNames: () => undefined,
      styles: () => undefined } : {}),
    ...(sample.rich ? { title: richTitle, description: richDescription, action: actions } : {}),
    ...(sample.customIcon ? { icon: customIcon } : {}),
    ...(sample.mouse ? {
      onMouseEnter: () => events = [...events, 'enter'],
      onMouseLeave: () => events = [...events, 'leave']
    } : {}),
    ...(sample.events ? {
      closable: {
        onClose: event => close(event, 'local-close'),
        afterClose: () => events = [...events, 'local-after']
      },
      onClick: () => events = [...events, 'root-click']
    } : {})
  });
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'alert-source-scope',
      ...(sample.theme === 'variables' || sample.theme === 'equal-prefix' ? { prefix: 'Ap' } : {}) },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    components: { Alert: sample.theme === 'tokens' ? {
      borderRadius: 19, defaultPadding: '13px 17px', withDescriptionPadding: '23px 27px',
      withDescriptionIconSize: 37
    } : sample.theme === 'aliases' ? {
      colorInfo: '#117733', colorInfoBg: '#ddffee', colorInfoBorder: '#339966',
      fontSize: 17, fontSizeHeading3: 29, paddingContentVerticalSM: 11,
      paddingMD: 21, paddingContentHorizontalLG: 31, borderRadiusLG: 13
    } : sample.theme === 'algorithm' ? { algorithm: true, fontSize: 18 }
      : sample.theme === 'zero' ? { borderRadius: 0, defaultPadding: 0,
        withDescriptionPadding: 0, withDescriptionIconSize: 0 }
      : sample.theme === 'equal' || sample.theme === 'equal-prefix' ? { borderRadius: 6 }
      : sample.theme === 'undefined' ? { borderRadius: undefined }
      : sample.theme === 'motion' ? { motionDurationSlow: '0.01s' } : {} }
  });
</script>

{#snippet richTitle()}<strong>Rich Alert title</strong>{/snippet}
{#snippet richDescription()}<em>Rich Alert description</em>
  <input aria-label="Alert source draft" value="Fresh draft" />
{/snippet}
{#snippet actions()}<button type="button" onclick={() => count++}>Alert source action {count}</button>{/snippet}
{#snippet customIcon()}<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M0 0H24V24H0Z" fill="#1677ff" /></svg>{/snippet}

<ConfigProvider theme={sourceTheme} direction={sample.rtl ? 'rtl' : 'ltr'}
  alert={sample.provider ? providerConfig : undefined}>
  <ConfigProvider alert={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-alert-source-frame style="width:600px;max-width:100%">
      {#if mounted}<Alert {...alertProps} bind:nativeElement bind:ref />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Alert source native ref">{Boolean(nativeElement?.isConnected)}</output>
<output aria-label="Alert source object ref">{Boolean(nativeElement && ref?.nativeElement?.isConnected)}</output>
<output aria-label="Alert source ref snapshot">{Boolean(ref?.nativeElement)}</output>
<output aria-label="Alert source events">{events.join(',')}</output>
