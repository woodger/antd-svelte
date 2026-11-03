<script lang="ts">
  import { ConfigProvider, Tag, CheckableTag, CheckableTagGroup } from 'antd-svelte';
  import type { TagPrefixCase, TagPrefixValues } from './tag-prefix-presets';

  let { sample, changed = false, nativeTheme = false }: {
    sample: TagPrefixCase;
    changed?: boolean;
    nativeTheme?: boolean;
  } = $props();
  let values = $derived<TagPrefixValues>({ ...sample, ...(changed ? sample.patch : {}) });
  let events = $state<(boolean | string[] | null)[]>([]);
  let closed = $state(false);
  let tagElement = $state<HTMLSpanElement | HTMLAnchorElement>();
  let checkableElement = $state<HTMLButtonElement>();
  let groupElement = $state<HTMLDivElement>();
  let nativeElement = $derived(groupElement ?? checkableElement ?? tagElement);
</script>

{#snippet icon()}◆{/snippet}
{#snippet label()}{#if sample.childLink}<a href="#tag-prefix-destination">Prefix link</a>{:else}Prefix label{/if}{/snippet}

<ConfigProvider
  tag={sample.provider}
  direction={sample.direction}
  componentDisabled={sample.componentDisabled}
  theme={nativeTheme ? { mode: sample.dark ? 'dark' : 'light', compact: sample.compact } : {
    mode: sample.dark ? 'dark' : 'light',
    compact: sample.compact,
    token: { motion: false, ...sample.token },
    components: sample.tagTokens ? { Tag: sample.tagTokens } : undefined
  }}
>
  {#if sample.kind === 'group'}
    <CheckableTagGroup
      prefixCls={values.prefixCls}
      disabled={values.disabled}
      multiple
      value={['a']}
      options={['a', 'b']}
      style={values.style}
      data-tag-prefix-root=""
      classNames={{ root: 'case-root', item: 'case-item' }}
      onChange={next => events = [...events, next]}
      bind:nativeElement={groupElement}
    />
  {:else if sample.kind === 'checkable'}
    <CheckableTag
      prefixCls={values.prefixCls}
      disabled={values.disabled}
      checked={values.checked}
      icon={values.icon ? icon : undefined}
      style={values.style}
      data-tag-prefix-root=""
      class="case-root"
      onChange={next => events = [...events, next]}
      bind:nativeElement={checkableElement}
    >{@render label()}</CheckableTag>
  {:else}
    <Tag
      prefixCls={values.prefixCls}
      disabled={values.disabled}
      color={values.color}
      variant={values.variant}
      closable={values.closable}
      icon={values.icon ? icon : undefined}
      href={values.href}
      target={values.target}
      style={values.style}
      data-tag-prefix-root=""
      classNames={{ root: 'case-root', close: 'case-close' }}
      onClose={() => closed = true}
      bind:nativeElement={tagElement}
    >{@render label()}</Tag>
  {/if}
</ConfigProvider>
<output aria-label="Tag prefix events">{JSON.stringify(events)}</output>
<output aria-label="Tag prefix close">{String(closed)}</output>
<output aria-label="Tag prefix ref">{nativeElement ? nativeElement.tagName : 'empty'}</output>
