<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { typographySemantics } from './typography-semantic.engine';
  import {
    typographyActionNode,
    typographyCopyNodes,
    typographyDecorationTags,
    typographyHasChildren,
    typographyMeasureNeeded,
    typographyNodes,
    typographyTooltip
  } from './typography.engine';
  import { createTypographyCopy } from './typography-copy.model.svelte.js';
  import { writeTypographyClipboard } from './typography-copy.dom';
  import { isTypographyNativeEllipsis, type TypographySnippetContent } from './typography-content.dom';
  import { typographyRuRU } from './typography.locale';
  import type { TypographyBlockProps, TypographyContent as Content } from './typography.types';
  import TypographyContent from './TypographyContent.svelte';
  import TypographyDecorations from './TypographyDecorations.svelte';
  import TypographyEditable from './TypographyEditable.svelte';
  import TypographyElement from './TypographyElement.svelte';
  import TypographyEllipsis from './TypographyEllipsis.svelte';
  import TypographyIcon from './TypographyIcon.svelte';
  import TypographySnippet from './TypographySnippet.svelte';
  import TypographyTooltip from './TypographyTooltip.svelte';

  let { nativeElement = $bindable(), ...rawProps }: TypographyBlockProps = $props();
  let {
    children,
    component = 'span',
    prefixCls: customizePrefixCls,
    direction,
    classNames,
    styles,
    class: className,
    rootClassName,
    style,
    type,
    disabled,
    editable,
    copyable,
    ellipsis,
    actions,
    title,
    code,
    mark,
    underline,
    delete: deleted,
    strong,
    keyboard,
    italic,
    onClick,
    onclick,
    onMouseEnter,
    onmouseenter,
    onMouseLeave,
    onmouseleave,
    ...attributes
  } = $derived(rawProps);

  const config = useConfig();
  let prefixCls = $derived(config.getPrefixCls('typography', customizePrefixCls));
  let resolvedDirection = $derived(direction ?? config.direction);
  let semantic = $derived(typographySemantics(
    config.typography,
    classNames,
    styles,
    { ...rawProps, prefixCls, direction: resolvedDirection }
  ));
  let strings = $derived({ ...typographyRuRU, ...config.locale.typography });
  let edit = $derived(typeof editable === 'object' && editable !== null ? editable : {});
  let copyConfig = $derived(typeof copyable === 'object' && copyable !== null ? copyable : {});
  let clip = $derived(typeof ellipsis === 'object' && ellipsis !== null ? ellipsis : {});
  let innerEditing = $state<boolean | undefined>(false);
  let innerExpanded = $state<boolean | undefined>(untrack(() => clip.defaultExpanded || false));
  let lastEditing = untrack(() => edit.editing);
  let lastExpanded = untrack(() => clip.expanded);
  let editing = $derived(Boolean(edit.editing !== undefined ? edit.editing : innerEditing));
  let expanded = $derived(Boolean(clip.expanded !== undefined ? clip.expanded : innerExpanded));
  let triggers = $derived(edit.triggerType ?? ['icon']);
  let enabled = $derived(Boolean(ellipsis) && (!expanded || clip.expandable === 'collapsible'));
  let measure = $derived(typographyMeasureNeeded(enabled, clip, Boolean(editable), Boolean(copyable)));
  let css = $state(untrack(() => enabled));
  let cssLine = $derived(enabled && css && (clip.rows ?? 1) === 1);
  let cssMultiple = $derived(enabled && css && (clip.rows ?? 1) > 1);
  let width = $state(0);
  let jsEllipsis = $state(false);
  let nativeEllipsis = $state(false);
  let nativeVisible = $state(true);
  let hovered = false;
  let hoverActions = $state(false);
  let actionTimer: ReturnType<typeof setTimeout> | undefined;
  let editButton = $state<HTMLButtonElement>();
  let copyButton = $state<HTMLButtonElement>();
  let snapshot = $state.raw<TypographySnippetContent>();
  let text = $derived(typeof children === 'function' && snapshot?.plain ? snapshot.text : children);
  let editText = $derived(edit.text ?? (typeof text === 'string' ? text : ''));
  let placement = $derived(actions?.placement ?? 'end');
  let decorations = $derived(typographyDecorationTags({
    code,
    mark,
    underline,
    delete: deleted,
    strong,
    keyboard,
    italic
  }));
  let tooltip = $derived(typographyTooltip(clip.tooltip, edit.text ?? children));
  let nativeMeasure = $derived(css && Boolean(tooltip.title));
  let truncated = $derived(enabled && (css ? nativeMeasure && nativeEllipsis : jsEllipsis));
  let ariaText = $derived(!ellipsis || css ? undefined :
    [edit.text, text, title, tooltip.title].find(value =>
      typeof value === 'string' || typeof value === 'number'));
  let editTitle = $derived(typographyNodes(edit.tooltip)[0] || strings.edit);
  let copyTips = $derived(typographyCopyNodes(copyConfig.tooltips));
  let copyIcons = $derived(typographyCopyNodes(copyConfig.icon));
  const copier = createTypographyCopy({
    config: () => copyConfig,
    children: () => typeof children === 'function' && snapshot ? snapshot.copy : children,
    write: (value, format) => writeTypographyClipboard(value, format,
      nativeElement?.ownerDocument ?? document)
  });
  let copyTitle = $derived(typographyActionNode(copyTips[copier.copied ? 1 : 0],
    copier.copied ? strings.copied : strings.copy));
  let copyIcon = $derived(typographyActionNode(copyIcons[copier.copied ? 1 : 0], undefined, true));
  let wasEditing = false;
  let active = true;

  $effect.pre(() => {
    const value = edit.editing;
    if (!Object.is(lastEditing, value)) {
      innerEditing = value;
      lastEditing = value;
    }
  });

  $effect.pre(() => {
    const value = clip.expanded;
    if (!Object.is(lastExpanded, value)) {
      innerExpanded = value;
      lastExpanded = value;
    }
  });

  $effect(() => {
    const next = editing;
    const previous = wasEditing;
    wasEditing = next;
    if (!next && previous) {
      let active = true;
      void tick().then(() => {
        if (active) editButton?.focus();
      });
      return () => {
        active = false;
      };
    }
  });

  $effect(() => {
    const active = enabled;
    const needed = measure;
    const rows = clip.rows ?? 1;
    const style = document.documentElement.style;
    css = active && !needed && (rows === 1 ? 'textOverflow' in style : 'webkitLineClamp' in style);
  });

  $effect(() => {
    const element = nativeElement;
    if (!element || !enabled) return;
    function update() {
      const bounds = element!.getBoundingClientRect().width;
      width = element!.offsetWidth === Math.round(bounds) ? bounds : element!.offsetWidth;
    }

    const Observer = element.ownerDocument.defaultView?.ResizeObserver;
    const observer = Observer ? new Observer(update) : undefined;
    observer?.observe(element);
    untrack(update);
    return () => observer?.disconnect();
  });

  $effect(() => {
    void children;
    void cssMultiple;
    void nativeVisible;
    void width;
    const element = nativeElement;
    if (element && enabled && nativeMeasure && hovered) {
      nativeEllipsis = isTypographyNativeEllipsis(element);
    }
  });

  $effect(() => {
    const element = nativeElement;
    if (!element || !nativeMeasure || !enabled) return;
    const Observer = element.ownerDocument.defaultView?.IntersectionObserver;
    const observer = Observer ? new Observer(() => { nativeVisible = Boolean(element.offsetParent); })
      : undefined;
    observer?.observe(element);
    return () => observer?.disconnect();
  });

  onDestroy(() => {
    active = false;
    clearTimeout(actionTimer);
    copier.destroy();
  });

  function handleEditClick(event?: MouseEvent) {
    event?.preventDefault();
    edit.onStart?.();
    innerEditing = true;
  }

  function save(value: string) {
    if (!active) return;
    edit.onChange?.(value);
    innerEditing = false;
  }

  function cancel() {
    edit.onCancel?.();
    innerEditing = false;
  }

  function handleExpand(event: MouseEvent) {
    const next = !expanded;
    innerExpanded = next;
    clip.onExpand?.(event, { expanded: next });
  }

  function content(value: TypographySnippetContent) {
    if (snapshot?.text !== value.text || snapshot.plain !== value.plain || snapshot.copy !== value.copy) {
      snapshot = value;
    }
  }

  function operationsHover(enter: boolean) {
    clearTimeout(actionTimer);
    if (enter) {
      hoverActions = true;
    } else {
      actionTimer = setTimeout(() => {
        hoverActions = false;
      }, 500);
    }
  }

  function onJsEllipsis(value: boolean) {
    const changed = value !== jsEllipsis;
    jsEllipsis = value;
    if (changed) clip.onEllipsis?.(value);
  }

  function handleEnter(event: MouseEvent & { currentTarget: HTMLElement; }) {
    hovered = true;
    if (nativeElement && enabled && nativeMeasure) {
      nativeEllipsis = isTypographyNativeEllipsis(nativeElement);
    }
    (onMouseEnter ?? onmouseenter)?.(event);
  }
</script>

{#snippet operations(canEllipsis: boolean, measuring: boolean)}
  {#if canEllipsis && clip.expandable || editable && triggers.includes('icon') || copyable}
    <span class={[`${prefixCls}-actions`, placement === 'start' && `${prefixCls}-actions-start`,
      semantic.classNames.actions]} style={semantic.styles.actions} role="presentation"
      onmouseenter={() => { if (!measuring) operationsHover(true); }}
      onmouseleave={() => { if (!measuring) operationsHover(false); }}>{#if canEllipsis && clip.expandable}
        <button type="button" onclick={handleExpand}
          class={[`${prefixCls}-${expanded ? 'collapse' : 'expand'}`, semantic.classNames.action]}
          style={semantic.styles.action} aria-label={expanded ? strings.collapse : strings.expand}><TypographyContent value={typeof clip.symbol === 'function' ? clip.symbol(expanded)
            : clip.symbol === undefined ? expanded ? strings.collapse : strings.expand : clip.symbol} /></button>
      {/if}{#if editable && triggers.includes('icon')}
        <button type="button" onclick={handleEditClick} class={[`${prefixCls}-edit`, semantic.classNames.action]}
          style={semantic.styles.action} aria-label={typeof editTitle === 'string' ? editTitle : ''}
          tabindex={edit.tabIndex} {@attach element => {
            if (measuring) return;
            editButton = element;
            return () => { if (editButton === element) editButton = undefined; };
          }}>{#if edit.icon}<TypographyContent value={edit.icon} />{:else}<TypographyIcon name="edit" />{/if}</button>
      {/if}{#if copyable}
        <button type="button" onclick={event => copier.copy(event)}
          class={[`${prefixCls}-copy`, semantic.classNames.action, copier.copied && `${prefixCls}-copy-success`,
            !typographyHasChildren(children) && `${prefixCls}-copy-icon-only`]}
          style={semantic.styles.action} tabindex={copyConfig.tabIndex}
          aria-label={typeof copyTitle === 'string' ? copyTitle : copier.copied ? strings.copied : strings.copy}
          {@attach element => {
            if (measuring) return;
            copyButton = element;
            return () => { if (copyButton === element) copyButton = undefined; };
          }}>{#if copyIcon}<TypographyContent value={copyIcon} />{:else}<TypographyIcon name={copier.copied ? 'check' : copier.loading ? 'loading' : 'copy'} />{/if}</button>
      {/if}</span>
  {/if}
{/snippet}

{#snippet showContent(nodes: Content[], canEllipsis: boolean, measuring: boolean)}
  {#if !measuring && typeof children === 'function'}
    <TypographySnippet {children} onContent={content}
      ariaHidden={nodes.length > 0 && canEllipsis && !expanded && Boolean(ariaText)}
      hidden={enabled && !css && !expanded && canEllipsis && (snapshot?.plain || !nodes.includes(children))} />
  {/if}{#if measuring || typeof children !== 'function'
    || enabled && !css && !expanded && canEllipsis && snapshot?.plain}
    {#if nodes.length && canEllipsis && !expanded && ariaText}
      <span aria-hidden="true"><TypographyContent value={nodes} /></span>
    {:else}<TypographyContent value={nodes} />{/if}
  {/if}
{/snippet}

{#snippet renderContent(nodes: Content[], canEllipsis: boolean, measuring: boolean)}
  <TypographyDecorations tags={decorations}>{#if placement === 'start'}{@render operations(canEllipsis, measuring)}{/if}{@render showContent(nodes, canEllipsis, measuring)}{#if canEllipsis && !expanded}<span aria-hidden="true">...</span>{/if}{clip.suffix ?? ''}{#if placement !== 'start'}{@render operations(canEllipsis, measuring)}{/if}</TypographyDecorations>
{/snippet}

{#if editing}
  <TypographyEditable value={editText} {prefixCls} {component} direction={resolvedDirection}
    class={className} {style} classNames={semantic.classNames} styles={semantic.styles}
    maxLength={edit.maxLength} autoSize={edit.autoSize} enterIcon={edit.enterIcon}
    onSave={save} onCancel={cancel} onEnd={edit.onEnd}>
    {#if typeof children === 'function'}
      <TypographySnippet {children} onContent={content} hidden />
    {/if}
  </TypographyEditable>
{:else}
  <TypographyElement {component} {prefixCls} direction={resolvedDirection} {rootClassName}
    class={[type && `${prefixCls}-${type}`, disabled && `${prefixCls}-disabled`,
      ellipsis && `${prefixCls}-ellipsis`, cssLine && `${prefixCls}-ellipsis-single-line`,
      cssMultiple && `${prefixCls}-ellipsis-multiple-line`, component === 'a' && `${prefixCls}-link`,
      className].filter(Boolean).join(' ')}
    {style} classNames={semantic.classNames} styles={semantic.styles} controlClamp
    clamp={cssMultiple ? clip.rows ?? 1 : undefined} bind:nativeElement
    attributes={{ 'aria-label': ariaText?.toString(), ...attributes, title,
      onclick: (event: MouseEvent & { currentTarget: HTMLElement; }) => {
        if (triggers.includes('text')) handleEditClick(event);
        (onClick ?? onclick)?.(event);
      }, onmouseenter: handleEnter,
      onmouseleave: (event: MouseEvent & { currentTarget: HTMLElement; }) => {
        hovered = false;
        (onMouseLeave ?? onmouseleave)?.(event);
      }
    }}>
    <TypographyEllipsis {text} {width} rows={clip.rows ?? 1} enableMeasure={enabled && !css}
      {expanded} {placement} onEllipsis={onJsEllipsis} children={renderContent} /><TypographyTooltip target={nativeElement} title={tooltip.title} options={tooltip.options}
      enabled={(Boolean(tooltip.title) || tooltip.title === 0) && truncated && !hoverActions} /><TypographyTooltip target={editButton} title={edit.tooltip === false ? undefined : editTitle} />
    <TypographyTooltip target={copyButton} title={copyTitle} />
  </TypographyElement>
{/if}
