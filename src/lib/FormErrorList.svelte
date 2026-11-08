<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import RenderContent from './RenderContent.svelte';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useComponentTheme } from './theme-component.svelte';
  import { useFormList } from './form-list-context';
  import {
    buildFormErrorList, reconcileFormErrorList, type FormErrorMotionEntity
  } from './form-error-list.engine';
  import { formErrorMotion } from './form-error-list.dom';
  import { getFormErrorListPrefixCss } from './form-error-list-prefix.engine';
  import type { FormErrorListProps } from './form-error-list.types';
  import type { RenderEmptyContent } from './types';
  import { useForm } from './form-context';

  let {
    fieldId,
    help,
    helpStatus,
    errors = [],
    warnings = [],
    class: className,
    onVisibleChanged
  }: FormErrorListProps = $props();
  const list = useFormList();
  const form = useForm();
  const componentTheme = useComponentTheme('Form');
  let prefix = $derived(list?.prefixCls ?? 'ant-form');
  let prefixCss = $derived(getFormErrorListPrefixCss(prefix));
  let delayedErrors = $state.raw<readonly RenderEmptyContent[]>(untrack(() => errors));
  let delayedWarnings = $state.raw<readonly RenderEmptyContent[]>(untrack(() => warnings));
  let messages = $derived(buildFormErrorList({
    help, helpStatus, errors: delayedErrors, warnings: delayedWarnings
  }));
  let visible = $derived(messages.length > 0);
  let rendered = $state(untrack(() => visible));
  let entries = $state.raw<FormErrorMotionEntity[]>(untrack(() =>
    messages.map((message) => ({ ...message, visible: true }))
  ));
  let active = true;

  $effect(() => {
    const next = [...errors];
    const timer = setTimeout(() => { delayedErrors = next; }, next.length ? 0 : 10);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    const next = [...warnings];
    const timer = setTimeout(() => { delayedWarnings = next; }, next.length ? 0 : 10);
    return () => clearTimeout(timer);
  });

  $effect.pre(() => {
    const current = messages;

    untrack(() => {
      entries = reconcileFormErrorList(entries, current);
      if (current.length) rendered = true;
    });
  });

  onDestroy(() => { active = false; });

  function finishHolder(shown: boolean) {
    if (!active || shown !== visible) return;

    if (!shown) {
      rendered = false;
      entries = [];
    }

    onVisibleChanged?.(shown);
  }

  function finishMessage(key: string, shown: boolean) {
    if (!active || shown) return;

    entries = entries.filter((entry) => entry.key !== key || entry.visible);
  }
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope="form-error-list-prefix" />{/if}
{#if rendered}
  <div
    id={fieldId ? `${fieldId}_help` : undefined}
    class={[
      `${prefix}-item-explain`, componentTheme.className && 'ant-form-css-var',
      componentTheme.className, form?.classNames?.help, className
    ]}
    style={[componentTheme.style, form?.styles?.help].filter(Boolean).join(';') || undefined}
    data-ant-form-error-list
    data-visible={visible}
    use:formErrorMotion={{ visible, kind: 'holder', onFinish: finishHolder }}
  >
    {#each entries as entry (entry.key)}
      <div
        class={[entry.status && `${prefix}-item-explain-${entry.status}`, form?.classNames?.helpItem]}
        style={form?.styles?.helpItem}
        data-ant-form-error-message
        data-visible={entry.visible}
        use:formErrorMotion={{
          visible: entry.visible,
          kind: 'message',
          onFinish: (shown) => finishMessage(entry.key, shown)
        }}
      ><RenderContent value={entry.content} /></div>
    {/each}
  </div>
{/if}
