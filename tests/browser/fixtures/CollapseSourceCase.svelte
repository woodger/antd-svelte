<script lang="ts" module>
  import type { CollapseProps } from 'antd-svelte';

  export interface CollapseSourceSample {
    name: string;
    props: CollapseProps;
    semantic?: 'object' | 'function' | 'undefined';
    provider?: 'object' | 'function' | 'icon';
    childProvider?: 'inherit' | 'empty';
    rich?: boolean;
    customIcon?: boolean;
    rtl?: boolean;
    theme?: string;
  }
</script>

<script lang="ts">
  import { Collapse, ConfigProvider, theme } from 'antd-svelte';
  import type {
    CollapseConfig, CollapseExpandIconInfo, CollapseSemanticInfo, CollapseSemanticSlots,
    ThemeConfig
  } from 'antd-svelte';

  let { sample, mounted = true }: { sample: CollapseSourceSample; mounted?: boolean; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<HTMLDivElement>();
  let count = $state(0);
  let events = $state<string[]>([]);
  let iconInfo: CollapseExpandIconInfo | undefined;
  const classes: CollapseSemanticSlots = {
    root: 'local-root', header: 'local-header', title: 'local-title', body: 'local-body',
    icon: 'local-icon'
  };
  const styles: CollapseSemanticSlots = {
    root: 'padding-top:7px;background:#112233', header: 'padding-top:13px;color:#773355',
    title: 'padding-top:3px;color:#335577', body: 'padding-top:4px;color:#7799bb',
    icon: 'padding-top:5px;color:#337755'
  };
  const flag = (info: CollapseSemanticInfo) => [
    `flag-size-${info.props.size}`, `flag-placement-${info.props.expandIconPlacement}`,
    `flag-border-${info.props.bordered}`, `flag-raw-${String(info.props.collapsible)}`,
    `flag-active-${JSON.stringify(info.props.activeKey)}`
  ].join(' ');
  function rememberIcon(info: CollapseExpandIconInfo) {
    if (info.panelKey === '1') iconInfo = info;
    return info;
  }
  const provider = {
    class: 'provider-owner', style: 'padding-top:5px',
    classNames: { root: 'provider-root', header: 'provider-header', title: 'provider-title',
      body: 'provider-body', icon: 'provider-icon' },
    styles: { root: 'padding-top:3px;background:red', header: 'color:purple', title: 'color:red',
      body: 'color:blue', icon: 'color:orange' }
  } satisfies CollapseConfig;
  let providerConfig = $derived<CollapseConfig>(sample.provider === 'icon' ? {
    ...provider, expandIcon: contextIcon
  } : sample.provider === 'function' ? {
    ...provider,
    classNames: info => ({ ...provider.classNames, root: `provider-root ${flag(info)}` }),
    styles: () => provider.styles
  } : provider);
  let collapseProps = $derived<CollapseProps>({
    ...sample.props,
    items: sample.rich ? [{ key: 1, label: richTitle, children: richBody, extra: actions }]
      : sample.props.items?.map(item => ({ ...item,
        onItemClick: key => events = [...events, `item:${key}`] })),
    ...(sample.semantic === 'object' ? { classNames: classes, styles } : {}),
    ...(sample.semantic === 'function' ? {
      classNames: info => ({ ...classes, root: `local-root ${flag(info)}` }),
      styles: () => styles
    } : sample.semantic === 'undefined' ? { classNames: () => undefined,
      styles: () => undefined } : {}),
    ...(sample.customIcon ? { expandIcon: localIcon } : {}),
    onChange: keys => events = [...events, `change:${keys.join('|')}`]
  });
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'collapse-source-scope',
      ...(sample.theme === 'variables' ? { prefix: 'Cp' } : {}) },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    components: { Collapse: sample.theme === 'tokens' ? {
      headerPadding: '13px 17px', headerPaddingSM: '7px 11px', headerPaddingLG: '19px 23px',
      headerBg: '#123456', contentPadding: '29px 31px', contentPaddingSM: 17,
      contentPaddingLG: 37, contentBg: '#abcdef', borderlessContentPadding: '3px 5px 7px',
      borderlessContentBg: '#fedcba'
    } : sample.theme === 'aliases' ? {
      paddingSM: 11, padding: 19, paddingXS: 7, paddingLG: 29, paddingXXS: 3,
      colorFillAlter: '#112233', colorBgContainer: '#ddeeff', colorText: '#234567',
      fontSize: 17, borderRadiusLG: 13
    } : sample.theme === 'algorithm' ? { algorithm: true, fontSize: 18 }
      : sample.theme === 'zero' ? { headerPadding: 0, headerPaddingSM: 0, headerPaddingLG: 0,
        contentPadding: 0, contentPaddingSM: 0, contentPaddingLG: 0, borderlessContentPadding: 0 }
      : {} }
  });
</script>

{#snippet richTitle()}<strong>Rich title</strong>{/snippet}
{#snippet richBody()}<em>Rich body</em><input
  aria-label="Collapse source draft" defaultValue="Fresh draft" />{/snippet}
{#snippet actions()}<button type="button" onclick={() => count++}>Collapse source action {count}</button>{/snippet}
{#snippet icon(info: CollapseExpandIconInfo, origin: string)}<span>{origin}:{info.isActive}:{info.panelKey}:{String(info.collapsible)}:{String(info.showArrow)}</span>{/snippet}
{#snippet localIcon(info: CollapseExpandIconInfo)}{@render icon(rememberIcon(info), 'Local')}{/snippet}
{#snippet contextIcon(info: CollapseExpandIconInfo)}{@render icon(info, 'Context')}{/snippet}

<ConfigProvider theme={sourceTheme} direction={sample.rtl ? 'rtl' : 'ltr'}
  collapse={sample.provider ? providerConfig : undefined}>
  <ConfigProvider collapse={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-collapse-source-frame style="width:600px;max-width:100%">
      {#if mounted}<Collapse {...collapseProps} bind:nativeElement bind:ref />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Collapse source native ref">{Boolean(nativeElement?.isConnected)}</output>
<output aria-label="Collapse source ref">{Boolean(ref?.isConnected)}</output>
<output aria-label="Collapse source events">{events.join(',')}</output>
<button type="button" onclick={() => iconInfo?.onItemClick?.(iconInfo.panelKey)}>
  Invoke Collapse expand icon callback</button>
