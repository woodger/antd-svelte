<script lang="ts">
  import { CheckableTag, ConfigProvider, Tag, type TagSemantic } from 'antd-svelte';
  import type { TagStyleCase, TagStyleValues } from './tag-style-presets';

  let { sample, changed = false }: { sample: TagStyleCase; changed?: boolean } = $props();
  let values = $derived<TagStyleValues>({ ...sample, ...(changed ? sample.patch : {}) });
  const classNames: TagSemantic = ({ props }) => ({
    root: `case-fn-${String(props.color)}-${props.variant}-${props.disabled}`,
    icon: 'case-icon',
    content: 'case-content',
    close: 'case-close'
  });
  const styles: TagSemantic = ({ props }) => ({
    root: `opacity:${props.disabled ? '.4' : '.8'};outline:1px solid rgb(44,55,66)`,
    icon: `color:${props.variant === 'solid' ? 'rgb(9,8,7)' : 'rgb(7,8,9)'}`,
    content: `font-weight:${props.disabled ? 400 : 700}`,
    close: 'color:rgb(88,77,66)'
  });
  let provider = $derived(values.contextFunctions
    ? { ...sample.provider, classNames, styles } : sample.provider);
</script>

{#snippet icon()}◆{/snippet}
{#snippet content()}<span data-tag-label="">Tag label</span>{/snippet}

<div id="tag-style-surface" style="--tag-color:#4682b4">
  <ConfigProvider
    tag={provider}
    direction={sample.direction}
    componentDisabled={sample.componentDisabled}
    theme={{
      mode: sample.dark ? 'dark' : 'light',
      compact: sample.compact,
      token: { motion: false, ...sample.token },
      components: sample.tagTokens ? { Tag: sample.tagTokens } : undefined
    }}
  >
    <ConfigProvider tag={sample.innerProvider}>
      {#if sample.checkable}
        <CheckableTag
          checked
          disabled={values.disabled}
          class={values.class}
          style={values.style}
          icon={values.icon ? icon : undefined}
        >{@render content()}</CheckableTag>
      {:else}
        <Tag
          color={values.color}
          variant={values.variant}
          bordered={values.bordered}
          disabled={values.disabled}
          class={values.class}
          style={values.style}
          rootClassName={values.rootClassName}
          classNames={values.functions ? classNames : values.classNames}
          styles={values.functions ? styles : values.styles}
          icon={values.icon ? icon : undefined}
          closeIcon={values.close}
        >{@render content()}</Tag>
      {/if}
    </ConfigProvider>
  </ConfigProvider>
</div>
