<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { useForm } from './form-context';
  import { providePopconfirmTheme } from './popover-theme-context';
  import { ruRU } from './types';
  import { createPopconfirmAction } from './popconfirm.model.svelte.js';
  import { getPopupActiveElement } from './popup.dom';
  import { getOverlaySemantics } from './overlay-semantic.engine';
  import { getOverlayPrefixCss } from './overlay-prefix.engine';
  import prefixTemplate from './vendor/popconfirm-prefix.css.js';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { PopconfirmProps, PopconfirmSemanticProps } from './popconfirm.types';
  import Popover from './Popover.svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  let {
    open = $bindable<boolean | undefined>(),
    open: providedOpen,
    ...props
  }: PopconfirmProps = $props();
  let {
    children,
    title,
    description,
    color,
    prefixCls,
    openClassName,
    icon,
    defaultOpen = false,
    destroyOnHidden,
    destroyTooltipOnHide,
    disabled,
    showCancel = true,
    okText,
    cancelText,
    okType = 'primary',
    okButtonProps,
    cancelButtonProps,
    placement = 'top',
    arrow,
    trigger,
    mouseEnterDelay,
    mouseLeaveDelay,
    autoAdjustOverflow = true,
    getPopupContainer,
    getTooltipContainer,
    onOpenChange,
    onConfirm,
    onCancel,
    onError,
    rootClassName,
    classNames,
    styles,
    overlayClassName,
    overlayStyle,
    overlayInnerStyle,
    class: className = '',
    style
  } = $derived(props);

  const config = useConfig();
  let prefix = $derived(prefixCls || 'ant-popconfirm');
  let prefixCss = $derived(getOverlayPrefixCss('popconfirm', prefix, prefixTemplate));
  let resolvedTrigger = $derived(trigger || config.popconfirm?.trigger || 'click');
  let enterDelay = $derived(mouseEnterDelay ?? config.popconfirm?.mouseEnterDelay ?? 0.1);
  let leaveDelay = $derived(mouseLeaveDelay ?? config.popconfirm?.mouseLeaveDelay ?? 0.1);
  let callbackProps = $derived<PopconfirmSemanticProps>({
    ...props,
    open: providedOpen,
    placement,
    trigger: resolvedTrigger,
    mouseEnterDelay: enterDelay,
    mouseLeaveDelay: leaveDelay,
    okType,
    overlayStyle
  });
  let semantics = $derived(getOverlaySemantics(
    config.popconfirm,
    classNames,
    styles,
    callbackProps,
    overlayStyle
  ));
  providePopconfirmTheme();
  const form = useForm();
  const generatedId = $props.id();
  const titleId = `ant-popconfirm-${generatedId}-title`;
  const descriptionId = `ant-popconfirm-${generatedId}-description`;
  const initialDefault = untrack(() => defaultOpen);
  // Raw open переживает обновление spread props без входного open.
  let uncontrolledOpen = $state(initialDefault);
  let rawOpen = $derived(providedOpen === undefined ? uncontrolledOpen : open ?? initialDefault);
  let overlay = $state<HTMLDivElement>();
  let errorSession = $state.raw<object>();
  let active = true;
  let resolvedDisabled = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let hasTitle = $derived(typeof title === 'function' || Boolean(String(title ?? '').trim()));
  let hasDescription = $derived(
    typeof description === 'function' || Boolean(String(description ?? '').trim())
  );
  let visible = $derived(!resolvedDisabled && hasTitle && rawOpen);
  let session = $derived(visible ? { owner: rawOpen } : null);
  const action = createPopconfirmAction(() => session, {
    onSuccess: () => {
      uncontrolledOpen = false;
      open = false;
      onOpenChange?.(false);
    },
    onError: (error) => {
      errorSession = session ?? undefined;
      onError?.(error);
    }
  });
  let errorVisible = $derived(session !== null && session === errorSession);

  $effect.pre(() => {
    const element = overlay;

    // Сохраняем фокус в карточке до отключения кнопок на время Promise.
    if (action.loading && element?.contains(getPopupActiveElement(element)))
      element.focus({ preventScroll: true });
  });

  onDestroy(() => {
    active = false;
    action.dispose();
  });

  function request(next: boolean) {
    if (!active || resolvedDisabled || action.loading || next === rawOpen) return;

    uncontrolledOpen = next;
    open = next;
    onOpenChange?.(next);
  }

  function confirm(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
    if (!visible || action.loading || okButtonProps?.disabled) return;

    okButtonProps?.onclick?.(event);
    if (event.defaultPrevented) return;

    errorSession = undefined;
    void action.run(() => onConfirm?.(event));
  }

  function cancel(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }) {
    if (!visible || action.loading || cancelButtonProps?.disabled) return;

    cancelButtonProps?.onclick?.(event);
    if (event.defaultPrevented) return;

    request(false);
    onCancel?.(event);
  }
</script>

<style>
  [data-ant-popconfirm-content] { min-width: min(200px, calc(100vw - 40px)); overflow-wrap: anywhere; }
  [data-ant-popconfirm-content]:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 2px; }
  [data-ant-popconfirm-message-text] { min-width: 0; }
  [data-ant-popconfirm-content] [data-ant-popconfirm-buttons] { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--ant-margin-xs); white-space: normal; }
  [data-ant-popconfirm-buttons] :global(.ant-btn) { max-width: 100%; min-height: var(--ant-control-height-sm); height: auto; margin-inline-start: 0; white-space: normal; }
  .anticon { display: inline-flex; }
  [data-ant-popconfirm-error] { margin: 8px 0 0; color: var(--ant-color-error); }
</style>

{#snippet content()}
  <div bind:this={overlay} data-ant-popconfirm-content="" class={`${prefix}-inner-content`} tabindex="-1">
    <div class={`${prefix}-message`}>
      {#if icon !== null}<span class={[`${prefix}-message-icon`, semantics.classNames.icon]}
        style={semantics.styles.icon} aria-hidden="true"><span class="anticon">{#if icon}{@render icon()}{:else}<Icon name="warning" />{/if}</span></span>{/if}
      <div data-ant-popconfirm-message-text="" class={`${prefix}-message-text`}>
        <div id={titleId} class={[`${prefix}-title`, semantics.classNames.title]}
          style={semantics.styles.title}>{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</div>
        {#if hasDescription}<div id={descriptionId} class={[`${prefix}-description`, semantics.classNames.content]}
          style={semantics.styles.content}>{#if typeof description === 'function'}{@render description()}{:else}{description}{/if}</div>{/if}
      </div>
    </div>
    <div data-ant-popconfirm-buttons="" class={`${prefix}-buttons`}>
      {#if showCancel}<Button {...cancelButtonProps} size={cancelButtonProps?.size ?? 'small'} disabled={Boolean(
          action.loading || resolvedDisabled || cancelButtonProps?.disabled
        )} htmlType="button" onclick={cancel}>{cancelText ?? config.locale.cancelText}</Button>{/if}
      <Button {...okButtonProps} type={okButtonProps?.type ?? okType} size={okButtonProps?.size ?? 'small'} disabled={Boolean(
          action.loading || resolvedDisabled || okButtonProps?.disabled
        )} loading={action.loading} htmlType="button" onclick={confirm}>{okText ?? config.locale.okText}</Button>
    </div>
    {#if errorVisible}<p role="alert" data-ant-popconfirm-error="" class={`${prefix}-error`}>{config.locale.confirmErrorText ?? ruRU.confirmErrorText}</p>{/if}
  </div>
{/snippet}

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`popconfirm-prefix:${prefix}`} />{/if}<Popover content={hasTitle ? content : undefined} bind:open={() => visible, request}
  trigger={resolvedDisabled ? [] : resolvedTrigger} mouseEnterDelay={enterDelay} mouseLeaveDelay={leaveDelay}
  showAction={props.showAction} hideAction={props.hideAction}
  focusDelay={props.focusDelay} blurDelay={props.blurDelay}
  align={props.align} builtinPlacements={props.builtinPlacements} onPopupAlign={props.onPopupAlign}
  {destroyOnHidden} {destroyTooltipOnHide}
  {placement} {arrow} {color} {openClassName} {autoAdjustOverflow} {getPopupContainer} {getTooltipContainer}
  {rootClassName} {overlayInnerStyle} classNames={{
    root: [config.popconfirm?.class, overlayClassName, semantics.classNames.root].filter(Boolean).join(' '),
    container: semantics.classNames.container,
    arrow: semantics.classNames.arrow
  }} styles={{ root: semantics.styles.root, container: semantics.styles.container,
    arrow: semantics.styles.arrow }}
  popupClass={prefix} aria-labelledby={titleId} aria-describedby={hasDescription ? descriptionId : undefined} aria-busy={action.loading || undefined} class={className} {style}>
  {@render children()}
</Popover>
