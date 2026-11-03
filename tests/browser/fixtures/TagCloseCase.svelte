<script lang="ts">
  import { ConfigProvider, Tag, enUS, type TagClosable } from 'antd-svelte';
  import type { TagCloseCase, TagCloseValues } from './tag-close-presets';

  let { sample, changed = false, closeLabel, focusable = false }: {
    sample: TagCloseCase;
    changed?: boolean;
    closeLabel?: string;
    focusable?: boolean;
  } = $props();
  let values = $derived({ ...sample, ...(changed ? sample.patch : {}) });
  let events = $state<string[]>([]);
  let nativeElement = $state<HTMLSpanElement | HTMLAnchorElement>();
  const record = (entry: string) => events = [...events, entry];

  function resolveClosable(value: TagCloseValues): TagClosable | undefined {
    if (!value.objectSnippet && !value.watchAfterClose) return value.closable;
    return {
      ...(value.closable && typeof value.closable === 'object' ? value.closable : {}),
      ...(value.objectSnippet ? { closeIcon: customClose } : {}),
      ...(value.watchAfterClose ? { afterClose: () => record('afterClose') } : {})
    };
  }

  let provider = $derived(sample.provider && {
    ...sample.provider,
    closable: resolveClosable(sample.provider),
    closeIcon: sample.provider.closeSnippet ? customClose : sample.provider.closeIcon
  });
</script>

{#snippet customClose()}<span data-custom-close="">S</span>{/snippet}

<div id="tag-close-surface">
  <ConfigProvider
    tag={provider}
    componentDisabled={sample.componentDisabled}
    direction={sample.direction}
    locale={enUS}
    theme={{ token: { motion: false } }}
  >
    <ConfigProvider tag={sample.innerProvider}>
      <form onsubmit={event => {
        event.preventDefault();
        record('submit');
      }}>
        <button type="button">Before close API Tag</button>
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (Счётчик всплывающих событий fixture.) -->
        <div onclick={() => record('parent')}>
          <Tag
            closeIcon={values.closeSnippet ? customClose : values.closeIcon}
            closable={resolveClosable(values)}
            href={values.href}
            target={values.target}
            disabled={values.disabled}
            color={values.color}
            {closeLabel}
            bind:nativeElement
            onClose={event => {
              record(`close:${event.type}:${event.defaultPrevented}`);
              if (sample.preventClose) event.preventDefault();
            }}
            onClick={event => {
              record(`click:${event.currentTarget.tagName}`);
              if (sample.preventClick) event.preventDefault();
            }}
            id="close-api-tag"
            title="API <Tag>"
            data-tag-api-root=""
            aria-label="API Tag"
            tabindex={focusable ? 0 : undefined}
          >{#if sample.childrenLink}<a href="#tag-close-destination">Tag label</a>{:else}Tag label{/if}</Tag>
        </div>
        <button type="button">After close API Tag</button>
      </form>
    </ConfigProvider>
  </ConfigProvider>
</div>
<span id="close-hint">Custom close description</span>
<output aria-label="Tag close events">{JSON.stringify(events)}</output>
<output aria-label="Tag root ref">{nativeElement?.tagName ?? 'empty'}</output>
<button type="button" onclick={() => nativeElement?.focus()}>Focus Tag root ref</button>
