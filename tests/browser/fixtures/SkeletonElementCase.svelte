<script lang="ts">
  import { createRawSnippet, type Component } from 'svelte';
  import {
    ConfigProvider, Skeleton, SkeletonAvatar, SkeletonButton, SkeletonImage,
    SkeletonInput, SkeletonNode, theme
  } from 'antd-svelte';
  import type { SkeletonAvatarSize, SkeletonElementProps, ThemeConfig } from 'antd-svelte';
  import SkeletonNodeContent from './SkeletonNodeContent.svelte';

  export interface SkeletonElementSample {
    name: string;
    kind: 'avatar' | 'button' | 'input' | 'image' | 'node';
    props: SkeletonElementProps & {
      size?: SkeletonAvatarSize;
      shape?: 'circle' | 'square' | 'round' | 'default';
      block?: boolean;
      internalClassName?: string;
    };
    contextSize?: 'small' | 'medium' | 'large';
    rtl?: boolean;
    theme?: string;
    child?: boolean;
    named?: boolean;
    interactive?: boolean;
  }
  let { sample, mounted = true }: {
    sample: SkeletonElementSample;
    mounted?: boolean;
  } = $props();
  const named = {
    avatar: SkeletonAvatar, button: SkeletonButton, input: SkeletonInput,
    image: SkeletonImage, node: SkeletonNode
  };
  const compound = {
    avatar: Skeleton.Avatar, button: Skeleton.Button, input: Skeleton.Input,
    image: Skeleton.Image, node: Skeleton.Node
  };
  let Widget = $derived((sample.named ? named : compound)[sample.kind] as Component<
    SkeletonElementSample['props'] & { children?: import('svelte').Snippet; }
  >);
  const children = createRawSnippet(() => ({ render: () => '<strong>Custom node</strong>' }));
  let sourceTheme = $derived<ThemeConfig>({
    cssVar: { key: 'skeleton-element-source-scope',
      ...(sample.theme === 'variables' ? { prefix: 'SkelX' } : {}) },
    ...(sample.theme === 'dark' ? { algorithm: theme.darkAlgorithm }
      : sample.theme === 'compact' ? { algorithm: theme.compactAlgorithm } : {}),
    components: { Skeleton: {
      ...(sample.theme === 'own' ? {
        gradientFromColor: '#112233', gradientToColor: '#445566', titleHeight: 20,
        blockRadius: 9, paragraphMarginTop: 31, paragraphLiHeight: 18
      } : {}),
      ...(sample.theme === 'aliases' ? {
        controlHeight: 36, controlHeightSM: 28, controlHeightLG: 44,
        borderRadiusSM: 7, colorFillContent: '#116633', colorFill: '#33aa88'
      } : {}),
      ...(sample.theme === 'algorithm' ? { algorithm: true, colorPrimary: '#cc22ff' } : {}),
      ...(sample.theme === 'deprecated' ? { color: '#cc2244', colorGradientEnd: '#3344aa' } : {}),
      ...(sample.theme === 'deprecated-priority' ? { color: 'red',
        gradientFromColor: '#cc2244', colorGradientEnd: 'blue', gradientToColor: '#3344aa' } : {}),
      ...(sample.theme === 'zero' ? {
        titleHeight: 0, blockRadius: 0, paragraphLiHeight: 0, paragraphMarginTop: 0
      } : {}),
      ...(sample.theme === 'variables' ? { gradientFromColor: '#6633aa' } : {})
    } }
  });
</script>

{#snippet interactiveNode()}<SkeletonNodeContent />{/snippet}

<ConfigProvider theme={sourceTheme} componentSize={sample.contextSize}
  direction={sample.rtl ? 'rtl' : 'ltr'}>
  <div data-skeleton-element-frame style="width:300px">
    {#if mounted}<Widget {...sample.props}
      children={sample.interactive ? interactiveNode : sample.child ? children : undefined} />{/if}
  </div>
  <aside data-skeleton-main-preview><Skeleton aria-hidden avatar /></aside>
</ConfigProvider>
