<script lang="ts">
  import { ConfigProvider, Skeleton, SkeletonAvatar, theme } from 'antd-svelte';
  import type {
    SkeletonProps, SkeletonConfig, SkeletonSemanticInfo, SkeletonSemanticSlots,
    SkeletonRef, ThemeConfig
  } from 'antd-svelte';

  export interface SkeletonMainSample {
    name: string;
    props: SkeletonProps;
    provider?: boolean;
    local?: boolean;
    functionalProvider?: boolean;
    objectLocal?: boolean;
    childProvider?: string;
    nested?: string;
    rtl?: boolean;
    theme?: string;
  }
  let { sample, mounted = true }: { sample: SkeletonMainSample; mounted?: boolean; } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let ref = $state<SkeletonRef>();
  const classes = (info: SkeletonSemanticInfo): SkeletonSemanticSlots => ({
    root: `local-root avatar-${String(info.props.avatar)} title-${String(info.props.title)} paragraph-${String(info.props.paragraph)} active-${String(info.props.active)} loading-${String(info.props.loading)}`,
    header: 'local-header',
    section: 'local-section',
    avatar: 'local-avatar',
    title: 'local-title',
    paragraph: 'local-paragraph'
  });
  const styles = (): SkeletonSemanticSlots => ({
    root: 'padding-top:7px;background:#112233',
    header: 'padding-top:2px;background:#224466',
    section: 'background:#334455',
    avatar: 'width:30px;height:25px;background:#446688',
    title: 'height:11px;background:#5588aa',
    paragraph: 'background:#6688bb'
  });
  const provider = {
    class: 'provider-skeleton',
    style: 'padding-top:5px',
    classNames: {
      root: 'provider-root',
      header: 'provider-header',
      section: 'provider-section',
      avatar: 'provider-avatar',
      title: 'provider-title',
      paragraph: 'provider-paragraph'
    },
    styles: {
      root: 'padding-top:3px;background:red',
      header: 'background:blue',
      section: 'background:green',
      avatar: 'background:red',
      title: 'background:yellow',
      paragraph: 'background:pink'
    }
  } satisfies SkeletonConfig;
  let providerConfig = $derived<SkeletonConfig>(sample.functionalProvider ? {
    ...provider,
    classNames: info => ({
      ...provider.classNames,
      root: `provider-root context-avatar-${String(info.props.avatar)} context-title-${String(info.props.title)} context-paragraph-${String(info.props.paragraph)} context-active-${String(info.props.active)}`
    }),
    styles: () => provider.styles
  } : provider);
  let skeletonProps = $derived<SkeletonProps>({
    ...sample.props,
    ...(sample.local ? { classNames: classes, styles } : {}),
    ...(sample.objectLocal ? {
      classNames: { root: 'object-root', title: 'object-title' },
      styles: { root: 'padding-top:9px', title: 'height:13px' }
    } : {}),
    ...(sample.nested ? {
      avatar: {
        size: 64,
        ...(sample.nested === 'prefix' ? { prefixCls: 'nested-avatar' } : {}),
        class: 'nested-avatar-class',
        style: 'background:black'
      },
      title: {
        width: 120,
        ...(sample.nested === 'prefix' ? { prefixCls: 'nested-title' } : {}),
        class: 'nested-title-class',
        style: 'background:black'
      },
      paragraph: {
        rows: 3,
        width: [100, '60%', 40],
        ...(sample.nested === 'prefix' ? { prefixCls: 'nested-paragraph' } : {}),
        class: 'nested-paragraph-class',
        style: 'background:black'
      }
    } : {})
  });
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: {
      key: 'skeleton-main-source-scope',
      ...(sample.theme === 'variables' ? { prefix: 'SkelMain' } : {})
    },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    components: {
      Skeleton: sample.theme === 'own' ? {
        gradientFromColor: '#112233',
        gradientToColor: '#445566',
        titleHeight: 20,
        paragraphLiHeight: 18,
        blockRadius: 9,
        paragraphMarginTop: 31
      } : {}
    }
  });
</script>

<ConfigProvider theme={sourceTheme} direction={sample.rtl ? 'rtl' : 'ltr'}
  skeleton={sample.provider ? providerConfig : undefined}>
  <ConfigProvider skeleton={sample.childProvider === 'empty' ? {} : undefined}>
    <div data-skeleton-main-frame style="width:300px">
      {#if mounted}<Skeleton {...skeletonProps} bind:nativeElement bind:ref>
        <input aria-label="Skeleton main child" value="Fresh child" />
      </Skeleton>{/if}
    </div>
    <div data-skeleton-primitive-neighbor><SkeletonAvatar /></div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Skeleton main native ref">{Boolean(nativeElement?.isConnected)}</output>
<output aria-label="Skeleton main object ref">{ref
  ? ref.nativeElement ? ref.nativeElement === nativeElement ? 'same' : 'different' : 'null'
  : 'none'}</output>
