<script lang="ts">
  import { untrack } from 'svelte';
  import FloatButton from './FloatButton.svelte';
  import FloatButtonIcon from './FloatButtonIcon.svelte';
  import FloatButtonSlot from './FloatButtonSlot.svelte';
  import Flex from './Flex.svelte';
  import SpaceCompact from './SpaceCompact.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { getFloatButtonPrefixCss } from './float-button-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { useForm } from './form-context';
  import { floatButtonPlacement } from './float-button.engine';
  import { createFloatButtonMotion } from './float-button-motion.dom';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { FloatButtonContext } from './float-button-context';
  import type { FloatButtonGroupProps } from './float-button.types';
  let {
    children,
    items,
    shape = 'circle',
    type = 'default',
    placement,
    icon,
    closeIcon,
    trigger,
    open,
    onOpenChange,
    disabled,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    prefixCls: customizePrefixCls,
    onclick,
    onClick,
    nativeElement = $bindable(),
    ...floatProps
  }: FloatButtonGroupProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('FloatButton');
  const form = useForm();
  let prefixCls = $derived(config.getPrefixCls('float-btn', customizePrefixCls));
  let rootPrefixCls = $derived(config.getPrefixCls());
  let prefixCss = $derived(getFloatButtonPrefixCss(prefixCls, rootPrefixCls));
  let internalOpen = $state(false);
  let opened = $derived(open ?? internalOpen);
  let menu = $derived(trigger === 'click' || trigger === 'hover');
  let present = $state(untrack(() => !trigger || Boolean(open)));
  let flexList = $state<HTMLElement>();
  let compactList = $state<HTMLDivElement>();
  let motionState: boolean | undefined;
  let motion = $state.raw<ReturnType<typeof createFloatButtonMotion>>();
  let individual = $derived(shape === 'circle');
  let list = $derived(individual ? flexList : compactList);
  let actualPlacement = $derived(floatButtonPlacement(placement));
  let vertical = $derived(actualPlacement === 'top' || actualPlacement === 'bottom');
  let blocked = $derived(disabled ?? form?.disabled ?? config.componentDisabled);
  let info = $derived(
    {
      props: {
        ...floatProps,
        children,
        items,
        shape,
        type,
        placement: actualPlacement,
        icon,
        closeIcon,
        trigger,
        open,
        onOpenChange,
        disabled: blocked,
        classNames,
        styles,
        class: className,
        rootClassName,
        style,
        prefixCls: customizePrefixCls,
        onclick,
        onClick
      }
    }
  );
  let contextClasses = $derived(
    typeof config.floatButtonGroup?.classNames === 'function'
      ? config.floatButtonGroup.classNames(info) ?? {}
      : config.floatButtonGroup?.classNames ?? {}
  );
  let contextStyles = $derived(
    typeof config.floatButtonGroup?.styles === 'function'
      ? config.floatButtonGroup.styles(info) ?? {}
      : config.floatButtonGroup?.styles ?? {}
  );
  let classes = $derived(
    typeof classNames === 'function' ? classNames(info) ?? {} : classNames ?? {}
  );
  let slots = $derived(typeof styles === 'function' ? styles(info) ?? {} : styles ?? {});
  let listContext = $derived<FloatButtonContext>(
    {
      prefixCls,
      shape,
      individual,
      classNames: {
        root: [contextClasses.item, classes.item].filter(Boolean).join(' '),
        icon: [contextClasses.itemIcon, classes.itemIcon].filter(Boolean).join(' '),
        content: [contextClasses.itemContent, classes.itemContent].filter(Boolean).join(' ')
      },
      styles: {
        root: [contextStyles.item, slots.item].filter(Boolean).join(';'),
        icon: [contextStyles.itemIcon, slots.itemIcon].filter(Boolean).join(';'),
        content: [contextStyles.itemContent, slots.itemContent].filter(Boolean).join(';')
      }
    }
  );
  let triggerContext = $derived<FloatButtonContext>(
    {
      prefixCls,
      shape,
      individual: true,
      classNames: {
        root: [contextClasses.trigger, classes.trigger].filter(Boolean).join(' '),
        icon: [contextClasses.triggerIcon, classes.triggerIcon].filter(Boolean).join(' '),
        content: [contextClasses.triggerContent, classes.triggerContent].filter(Boolean).join(
          ' '
        )
      },
      styles: {
        root: [contextStyles.trigger, slots.trigger].filter(Boolean).join(';'),
        icon: [contextStyles.triggerIcon, slots.triggerIcon].filter(Boolean).join(';'),
        content: [contextStyles.triggerContent, slots.triggerContent].filter(Boolean).join(';')
      }
    }
  );
  function request(next: boolean) {
    if (blocked || opened === next) return;
    if (open === undefined)
      internalOpen = next;
    onOpenChange?.(next);
  }
  $effect(() => {
    if (!menu || opened)
      present = true; else if (!list)
      present = false;
  });
  $effect(() => {
    if (!list || !menu) return;
    const controller = createFloatButtonMotion(
      list,
      true,
      () => { present = false; },
      motionState,
      () => rootPrefixCls
    );
    motion = controller;
    return () => {
      controller.destroy();
      motion = undefined;
    };
  });
  $effect(() => {
    if (menu && motion) {
      motion.sync(opened);
      motionState = opened;
    } else if (!menu)
      motionState = undefined;
  });
  $effect(() => {
    const root = nativeElement;
    if (!root || trigger !== 'click') return;
    const outside = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || !root.contains(event.target))
        request(false);
    };
    root.ownerDocument.addEventListener('click', outside, true);
    return () => root.ownerDocument.removeEventListener('click', outside, true);
  });
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
  $effect(() => {
    if (list) return connectFeedbackFocus(list);
  });
</script>
<style>
  /* Opaque children — один Compact slot; границы видимых controls определяются на SSR. */
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque][data-ant-float-vertical] > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):not(:first-child)),
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque][data-ant-float-vertical] > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):not(:first-child) > [data-ant-float-root]) { margin-block-start:calc(0px - var(--ant-line-width));border-start-start-radius:0;border-start-end-radius:0; }
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque][data-ant-float-vertical] > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):has(~ :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])))),
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque][data-ant-float-vertical] > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):has(~ :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root]))) > [data-ant-float-root]) { border-end-start-radius:0;border-end-end-radius:0; }
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque]:not([data-ant-float-vertical]) > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):not(:first-child)),
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque]:not([data-ant-float-vertical]) > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):not(:first-child) > [data-ant-float-root]) { margin-inline-start:calc(0px - var(--ant-line-width));border-start-start-radius:0;border-end-start-radius:0; }
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque]:not([data-ant-float-vertical]) > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):has(~ :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])))),
  [data-ant-float-group] > :global([data-ant-float-list][data-ant-float-opaque]:not([data-ant-float-vertical]) > :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root])):has(~ :is([data-ant-float-root],.ant-tooltip-trigger:has(> [data-ant-float-root]))) > [data-ant-float-root]) { border-start-end-radius:0;border-end-end-radius:0; }
</style>

{#snippet defaultIcon()}<FloatButtonIcon name="file-text" />{/snippet}
{#snippet defaultCloseIcon()}<FloatButtonIcon name="close" />{/snippet}
{#snippet content()}{#if items}{#each items as item (item.key)}{@render item.children()}{/each}{:else}{@render children?.()}{/if}{/snippet}
{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`float-button-prefix:${prefixCls}:${rootPrefixCls}`} />{/if}<div bind:this={nativeElement} role="group" dir={config.direction}
  data-ant-float-group
  data-ant-float-prefix={prefixCss ? prefixCls : undefined}
  data-ant-float-global={prefixCss ? rootPrefixCls : undefined}
  class={[
      `${prefixCls}-group ant-float-btn-css-var`,
      componentTheme.className,
      individual && `${prefixCls}-group-individual`,
      menu && `${prefixCls}-group-${actualPlacement}`,
      menu && `${prefixCls}-group-menu-mode`,
      config.direction === 'rtl' && `${prefixCls}-group-rtl`,
      config.floatButtonGroup?.class,
      contextClasses.root,
      classes.root,
      className,
      rootClassName
    ]}
  style={[
      componentTheme.style,
      contextStyles.root,
      config.floatButtonGroup?.style,
      slots.root,
      style
    ]
      .filter(
        Boolean
      ).join(
        ';'
      )}
  onmouseenter={() => {
      if (trigger === 'hover')
        request(true);
    }} onmouseleave={() => {
        if (trigger === 'hover')
          request(false);
      }}>
  <FloatButtonSlot context={listContext}>
    {#if !menu || present}
      {#if individual}<Flex bind:nativeElement={flexList} data-ant-float-list data-ant-float-vertical={vertical || undefined} {vertical} class={[`${prefixCls}-group-list`, contextClasses
          .list, classes
            .list]
          .filter(
            Boolean
          ).join(
            ' '
          )} style={[contextStyles.list, slots.list].filter(Boolean).join(';')}>{@render content()}</Flex>
      {:else}<SpaceCompact bind:nativeElement={compactList} data-ant-float-list data-ant-float-vertical={vertical || undefined} data-ant-float-opaque={items === undefined || undefined} {vertical} items={items} class={[`${prefixCls}-group-list`, contextClasses
          .list, classes
            .list]
          .filter(
            Boolean
          ).join(
            ' '
          )} style={[contextStyles.list, slots.list].filter(Boolean).join(';')}>{@render children?.()}</SpaceCompact>{/if}
    {/if}
  </FloatButtonSlot>
  {#if menu}
    <FloatButtonSlot context={triggerContext}>
      <FloatButton {...floatProps} {type} icon={opened
          ? closeIcon ?? config.floatButtonGroup?.closeIcon ?? defaultCloseIcon
          : icon === undefined ? defaultIcon : icon} disabled={blocked}
        class={`${prefixCls}-group-trigger`} aria-expanded={opened} onclick={event => {
            if (trigger === 'click')
              request(!opened);
            (onclick ?? onClick)?.(event);
          }} />
    </FloatButtonSlot>
  {/if}
</div>
