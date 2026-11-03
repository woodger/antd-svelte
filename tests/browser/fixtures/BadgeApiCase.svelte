<script lang="ts">
  import { Badge, ConfigProvider } from 'antd-svelte';
  import type { BadgeContext, BadgeCountContext, BadgeProps } from 'antd-svelte';
  import type { BadgeApiCase } from './badge-api-presets';

  let {
    sample, changed = false, mounted = true, interactive = false,
    legacyStyle = false, nativeAttrs = false
  }: {
    sample: BadgeApiCase;
    changed?: boolean;
    mounted?: boolean;
    interactive?: boolean;
    legacyStyle?: boolean;
    nativeAttrs?: boolean;
  } = $props();
  let values = $derived({ count: '5', ...sample, ...(changed ? sample.patch : {}) });
  let element = $state<HTMLSpanElement>();
  let events = $state<string[]>([]);
  let count = $derived(values.custom ? custom : values.count);
  let classNames = $derived(values.functions ? ({ props }: { props: BadgeProps; }) => ({
    root: `case-fn-${props.size}-${props.dot}-${props.showZero}-${props.overflowCount}`,
    indicator: `case-fn-count-${props.count}`
  }) : values.classNames);
  let styles = $derived(values.functions ? ({ props }: { props: BadgeProps; }) => ({
    root: 'outline:1px solid rgb(44,55,66)',
    indicator: `opacity:${props.size === 'small' ? '.6' : '.8'};color:rgb(20,30,40)`
  }) : values.styles);
</script>

{#snippet custom(attributes: BadgeCountContext)}<span data-api-custom
  class={[attributes.class, 'case-custom-count']}
  style={`${attributes.style ?? ''};display:inline-block;width:24px;height:16px;${values.ownStyle ?? ''}`}>{#if interactive}<input
    aria-label="Badge API custom draft" value="Seed" style="width:64px;font:inherit" />{:else}★{/if}</span>{/snippet}
{#snippet owner(context: BadgeContext)}<button type="button" aria-label="Badge API owner"
  aria-describedby={context.descriptionId}
  style="width:48px;height:48px;padding:0;border:0;font:inherit;background:#eee">T</button>{/snippet}

<ConfigProvider direction={sample.direction} badge={sample.provider}
  theme={{ token: { motion: false } }}>
  <ConfigProvider badge={sample.innerProvider}>
    <div id="badge-api-surface"
      style="font-family:Arial;font-size:14px;color:rgb(12,34,56);line-height:22px;--api-color:#4682b4">
      {#if mounted}<Badge bind:nativeElement={element} {count} color={values.color}
        status={values.status} text={values.text} size={values.size} offset={values.offset}
        overflowCount={values.overflowCount} showZero={values.showZero} dot={values.dot}
        title={values.title} class={values.class} style={legacyStyle
          ? changed ? 'padding-left:8px;color:rgb(12,34,56)'
            : 'padding:4px;padding-left:8px;color:rgb(12,34,56)' : values.style}
        rootClassName={values.rootClassName} {classNames} {styles}
        onClick={() => events.push('alias')} onclick={() => events.push('native')}
        onkeydown={event => events.push(`key:${event.key}`)}
        dir={nativeAttrs ? 'rtl' : undefined} lang={nativeAttrs ? 'ru' : undefined}
        tabindex={nativeAttrs ? 0 : undefined}
        data-api-root="badge" children={sample.wrap === false ? undefined : owner} />{/if}
    </div>
  </ConfigProvider>
</ConfigProvider>
<output aria-label="Badge API ref">{element?.tagName ?? 'none'}</output>
<output aria-label="Badge API events">{events.join(',')}</output>
