<script lang="ts">
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';
  import Tooltip from './Tooltip.svelte';
  import FloatButtonIcon from './FloatButtonIcon.svelte';
  import { buttonHasContent, buttonText } from './button.engine';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { useFloatButton } from './float-button-context';
  import { getFloatButtonPrefixCss } from './float-button-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import { connectFeedbackFocus } from './feedback.dom';
  import type { BadgeProps } from './badge.types';
  import type { TooltipProps } from './tooltip.types';
  import type { FloatButtonContent, FloatButtonProps } from './float-button.types';
  let {
    type = 'default',
    shape = 'circle',
    icon,
    content,
    tooltip,
    badge,
    classNames,
    styles,
    class: className = '',
    rootClassName = '',
    style,
    prefixCls: customizePrefixCls,
    nativeElement = $bindable(),
    ...rest
  }: FloatButtonProps = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('FloatButton');
  const group = useFloatButton();
  let prefixCls = $derived(customizePrefixCls === undefined && group?.prefixCls
    ? group.prefixCls : config.getPrefixCls('float-btn', customizePrefixCls));
  let rootPrefixCls = $derived(config.getPrefixCls());
  let prefixCss = $derived(getFloatButtonPrefixCss(prefixCls, rootPrefixCls));
  let actualShape = $derived(group?.shape || shape);
  let individual = $derived(group?.individual ?? true);
  let actualIcon = $derived(!buttonHasContent(content) && !icon ? defaultIcon : icon);
  let info = $derived(
    {
      props: {
        ...rest,
        type,
        shape: actualShape,
        icon,
        content,
        tooltip,
        badge,
        classNames,
        styles,
        class: className,
        rootClassName,
        style,
        prefixCls: customizePrefixCls
      }
    }
  );
  let classes = $derived(
    typeof classNames === 'function' ? classNames(info) ?? {} : classNames ?? {}
  );
  let slots = $derived(typeof styles === 'function' ? styles(info) ?? {} : styles ?? {});
  let combinedClasses = $derived(
    {
      root: [group?.classNames.root, classes.root].filter(Boolean).join(' '),
      icon: [`${prefixCls}-icon`, group?.classNames.icon, classes.icon].filter(Boolean).join(
        ' '
      ),
      content: [`${prefixCls}-content`, group?.classNames.content, classes.content].filter(
        Boolean
      )
        .join(
          ' '
        )
    }
  );
  let combinedStyles = $derived(
    {
      root: [group?.styles.root, slots.root].filter(Boolean).join(';'),
      icon: [group?.styles.icon, slots.icon].filter(Boolean).join(';'),
      content: [group?.styles.content, slots.content].filter(Boolean).join(';')
    }
  );
  let cleanBadge = $derived.by(() => {
    const source: Partial<BadgeProps> = badge ?? {};
    const {
      status: _status,
      text: _text,
      title: _title,
      children: _children,
      ...remaining
    } = source;
    return remaining;
  });
  let tooltipProps = $derived<Omit<TooltipProps, 'children'> | undefined>(
    tooltip === undefined || tooltip === null || tooltip === false || tooltip === ''
      ? undefined
      : typeof tooltip === 'object' ? tooltip : {
        title: tooltip === true ? emptyTooltip : tooltip
      }
  );
  let insert = $derived(
    !actualIcon && config.button?.autoInsertSpace !== false && badge === undefined
  );
  $effect(() => {
    if (nativeElement) return connectFeedbackFocus(nativeElement);
  });
</script>

{#snippet defaultIcon()}<FloatButtonIcon name="file-text" />{/snippet}
{#snippet emptyTooltip()}{/snippet}
{#snippet contentNode()}
  {#if typeof content === 'number'}{content}
  {:else if typeof content === 'function' || typeof content === 'string' && content !== ''}
    <span class={combinedClasses.content} style={combinedStyles.content}>{#if typeof content === 'function'}{@render content()}{:else}{buttonText(content, insert)}{/if}</span>
  {/if}
  {#if badge !== undefined}<Badge {...cleanBadge} class={[
      `${prefixCls}-badge`,
      cleanBadge.dot && `${prefixCls}-badge-dot`,
      cleanBadge.class,
      combinedClasses.content
    ].filter(
      Boolean
    ).join(
      ' '
    )} style={[cleanBadge.style, combinedStyles.content].filter(Boolean).join(
        ';'
      )} />{/if}
{/snippet}
{#snippet node()}
  <Button {...rest} {type} shape={actualShape} size="large" icon={actualIcon} children={contentNode} _skipSemantic _skipContentWrapper
    data-ant-float-root
    data-ant-float-prefix={prefixCss ? prefixCls : undefined}
    data-ant-float-global={prefixCss ? rootPrefixCls : undefined}
    _themeStyle={componentTheme.style}
    class={[
        `${prefixCls} ant-float-btn-css-var`,
        componentTheme.className,
        `${prefixCls}-${type}`,
        `${prefixCls}-${actualShape}`,
        config.direction === 'rtl' && `${prefixCls}-rtl`,
        individual && `${prefixCls}-individual`,
        !buttonHasContent(content) && `${prefixCls}-icon-only`,
        className,
        rootClassName
      ].filter(
        Boolean
      ).join(
        ' '
      )}
    classNames={combinedClasses} styles={combinedStyles} {style} bind:nativeElement />
{/snippet}
{#if tooltipProps}<Tooltip {...tooltipProps} style={[group
    && 'display:contents', tooltipProps.style].filter(Boolean).join(';')}>{@render node()}</Tooltip>{:else}{@render node()}{/if}
{#if prefixCss}
  <ThemeScopeStyle css={prefixCss} scope={`float-button-prefix:${prefixCls}:${rootPrefixCls}`} />
{/if}
