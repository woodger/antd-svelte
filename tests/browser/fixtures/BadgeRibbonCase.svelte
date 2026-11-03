<script lang="ts">
  import { BadgeRibbon, ConfigProvider, theme } from 'antd-svelte';
  import type { BadgeRibbonProps } from 'antd-svelte';
  import type { BadgeRibbonCase } from './badge-ribbon-presets';
  import BadgeRibbonState from './BadgeRibbonState.svelte';

  let {
    sample,
    changed = false,
    dark = false,
    nativeElement = $bindable()
  }: {
    sample: BadgeRibbonCase;
    changed?: boolean;
    dark?: boolean;
    nativeElement?: HTMLDivElement;
  } = $props();

  let placement = $derived(changed
    ? sample.placement === 'start' ? 'end' : 'start'
    : sample.placement);
  let direction = $derived(changed
    ? sample.direction === 'rtl' ? 'ltr' : 'rtl'
    : sample.direction);
  let color = $derived(changed ? '#ff8800' : sample.color);
  let text = $derived(sample.textMode === 'snippet'
    ? caption : Object.hasOwn(sample, 'text') ? sample.text : 'Ribbon');
  let children = $derived(Object.hasOwn(sample, 'children') ? sample.children : body);
  const classes = ({ props }: { props: BadgeRibbonProps; }) => ({
    root: `case-fn-${props.placement}`,
    indicator: 'case-fn-indicator',
    content: 'case-fn-content'
  });
  const styles = ({ props }: { props: BadgeRibbonProps; }) => ({
    root: props.placement === 'start'
      ? 'border:1px solid rgb(255,0,0)' : 'border:1px solid rgb(0,0,255)',
    indicator: 'opacity:.8',
    content: 'font-weight:700'
  });
</script>

{#snippet body()}<div style="height:96px"><BadgeRibbonState label="Ribbon body" /></div>{/snippet}
{#snippet caption()}<BadgeRibbonState label="Ribbon text" />{/snippet}

<ConfigProvider {direction} ribbon={sample.provider} theme={{
  token: { motion: false, ...sample.token },
  algorithm: dark || sample.theme === 'dark' ? theme.darkAlgorithm
    : sample.theme === 'compact' ? theme.compactAlgorithm
      : sample.theme === 'dark-compact' ? [theme.darkAlgorithm, theme.compactAlgorithm] : undefined,
  components: sample.badge ? { Badge: sample.badge } : undefined,
  ...(sample.cssPrefix ? {
    cssVar: { prefix: sample.cssPrefix, key: 'ribbon-prefix' }, hashed: false
  } : {})
}}>
  <ConfigProvider ribbon={sample.innerProvider}>
    <div id="ribbon-reference-surface" dir={sample.direction ?? 'ltr'}
      style="width:320px;font-family:Arial;font-size:14px;color:rgb(12,34,56);line-height:22px;--ribbon-custom:#4682b4">
      <BadgeRibbon {text} {children} {placement} {color} bind:nativeElement
        class={sample.class} style={sample.style} rootClassName={sample.rootClassName}
        prefixCls={sample.prefixCls}
        classNames={sample.functions ? classes : sample.classNames}
        styles={sample.functions ? styles : sample.styles} />
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Ribbon native ref">{nativeElement ? 'mounted' : 'empty'}</output>
