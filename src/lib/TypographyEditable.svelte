<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { provideFormField, useFormField } from './form-context';
  import { useConfig } from './config-context';
  import { typographyEditKey, typographyEditValue } from './typography.engine';
  import type { TypographyEditConfig, TypographySlots } from './typography.types';
  import TextArea from './TextArea.svelte';
  import TypographyIcon from './TypographyIcon.svelte';
  import TypographyContent from './TypographyContent.svelte';

  let {
    value,
    prefixCls,
    direction,
    component,
    class: className,
    style,
    classNames,
    styles,
    maxLength,
    autoSize = true,
    enterIcon,
    onSave,
    onCancel,
    onEnd,
    children
  }: {
    value: string;
    prefixCls: string;
    direction: 'ltr' | 'rtl';
    component: keyof HTMLElementTagNameMap;
    class?: string;
    style?: string;
    classNames: TypographySlots;
    styles: TypographySlots;
    maxLength?: number;
    autoSize?: TypographyEditConfig['autoSize'];
    enterIcon?: TypographyEditConfig['enterIcon'];
    onSave: (value: string) => void;
    onCancel: () => void;
    onEnd?: () => void;
    children?: Snippet;
  } = $props();

  const field = useFormField();
  const config = useConfig();
  provideFormField(field ? {
    get status() { return field.status; },
    get disabled() { return field.disabled; },
    required: false,
    describedBy: undefined,
    // Editor не становится control внешнего FormItem и не публикует его blur/value.
    onBlur() {}
  } : undefined);
  let current = $state(untrack(() => value));
  let textarea = $state<HTMLTextAreaElement>();
  let composing = false;
  let lastKey: number | undefined;
  let initialFocus = false;
  let confirming = false;

  onDestroy(() => {
    confirming = true;
  });

  function finish(action: () => void) {
    // Native blur при удалении textarea не должен повторять уже обработанный Enter/Escape.
    confirming = true;
    action();
    void tick().then(() => {
      if (textarea?.isConnected) confirming = false;
    });
  }

  $effect(() => {
    current = value;
  });

  $effect(() => {
    const element = textarea;
    if (!element || initialFocus) return;
    initialFocus = true;
    let active = true;
    void tick().then(() => {
      if (!active || !element.isConnected) return;
      element.focus();
      element.setSelectionRange(element.value.length, element.value.length);
    });
    return () => {
      active = false;
    };
  });

  function getKeyCode(event: KeyboardEvent) {
    return event.keyCode || (event.key === 'Enter' ? 13 : event.key === 'Escape' ? 27 : 0);
  }
  function handleKeyDown(event: KeyboardEvent) {
    if (!composing) lastKey = getKeyCode(event);
  }

  function handleKeyUp(event: KeyboardEvent) {
    const action = typographyEditKey(lastKey, {
      keyCode: getKeyCode(event),
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey
    }, composing);
    if (action === 'save') {
      const end = onEnd;
      finish(() => {
        onSave(current.trim());
        end?.();
      });
    } else if (action === 'cancel') {
      finish(onCancel);
    }
  }

  function handleBlur(event: FocusEvent) {
    if (confirming) return;
    const element = textarea;
    const value = current.trim();
    if (event.relatedTarget !== null) {
      onSave(value);
      return;
    }
    // Chromium отправляет blur до удаления focused DOM; teardown Svelte идёт после него.
    void tick().then(() => {
      if (!confirming && element?.isConnected) onSave(value);
    });
  }
</script>

<div class={[prefixCls, `${prefixCls}-edit-content`, direction === 'rtl' && `${prefixCls}-rtl`,
  `${prefixCls}-${component}`, className, classNames.root, 'ant-typography-css-var',
  config.theme.compact && 'ant-typography-compact']}
  style={[styles.root, style].filter(Boolean).join(';')}>
  <TextArea value={current} onChange={event => { current = typographyEditValue(event.target.value); }}
    onKeyDown={handleKeyDown} onkeyup={handleKeyUp} onBlur={handleBlur}
    onCompositionStart={() => { composing = true; }} onCompositionEnd={() => { composing = false; }}
    {maxLength} {autoSize} rows={1} dir={direction} class={classNames.textarea} style={styles.textarea}
    bind:nativeElement={textarea} />
  {#if enterIcon === undefined}
    <TypographyIcon name="enter" class={`${prefixCls}-edit-content-confirm`} />
  {:else if typeof enterIcon === 'function'}
    {@render enterIcon(`${prefixCls}-edit-content-confirm`)}
  {:else}<TypographyContent value={enterIcon} />{/if}
  {@render children?.()}
</div>
