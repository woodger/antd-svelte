<script lang="ts" generics="Value extends CheckableTagValue = CheckableTagValue">
  import { untrack } from 'svelte';
  import CheckableTag from './CheckableTag.svelte';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { connectTagStyle } from './tag-style.dom';
  import { getTagPrefixCss } from './tag-prefix.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type {
    CheckableTagGroupProps,
    CheckableTagGroupSemantic,
    CheckableTagOption,
    CheckableTagValue
  } from './tag.types';

  let { nativeElement = $bindable(), ...props }: CheckableTagGroupProps<Value> = $props();
  const config = useConfig();
  const componentTheme = useComponentTheme('Tag');
  let prefix = $derived(config.getPrefixCls('tag', props.prefixCls));
  let prefixCss = $derived(getTagPrefixCss(prefix));
  let groupPrefix = $derived(`${prefix}-checkable-group`);
  let innerValue = $state.raw<Value | Value[] | null | undefined>(
    untrack(() => props.defaultValue)
  );
  let previous = untrack(() => props.value);
  let selected = $derived(props.value !== undefined ? props.value : innerValue);
  let options = $derived<CheckableTagOption<Value>[]>(Array.isArray(props.options)
    ? props.options.map(option => option !== null && typeof option === 'object'
      ? option as CheckableTagOption<Value> : { value: option, label: option })
    : []);
  let attributes = $derived(Object.fromEntries(Object.entries(props).filter(([key]) =>
    key === 'role' || key.startsWith('aria-') || key.startsWith('data-')
  )));

  // Как upstream: Tag config типизирован для Tag, но callbacks группы получают её raw props.
  const resolve = (value: CheckableTagGroupSemantic<Value> | undefined) =>
    (typeof value === 'function' ? value({ props }) : value) ?? {};
  let contextClasses = $derived(resolve(
    config.tag?.classNames as CheckableTagGroupSemantic<Value> | undefined
  ));
  let localClasses = $derived(resolve(props.classNames));
  let contextStyles = $derived(resolve(
    config.tag?.styles as CheckableTagGroupSemantic<Value> | undefined
  ));
  let localStyles = $derived(resolve(props.styles));
  let rootStyle = $derived([
    componentTheme.style, contextStyles.root, config.tag?.style, localStyles.root, props.style
  ].filter(Boolean).join(';') || undefined);

  $effect.pre(() => {
    const next = props.value;
    if (!Object.is(next, previous)) innerValue = next;
    previous = next;
  });

  function rootStyles(node: HTMLDivElement) {
    const update = connectTagStyle(node);
    $effect(() => update([
      componentTheme.style, contextStyles.root, config.tag?.style, localStyles.root, props.style
    ]));
  }

  function handleChange(checked: boolean, option: CheckableTagOption<Value>) {
    if (props.multiple) {
      const values = (selected || []) as Value[];
      const next = checked
        ? [...values, option.value] : values.filter(value => value !== option.value);
      innerValue = next;
      props.onChange?.(next);
    } else {
      const next = checked ? option.value : null;
      innerValue = next;
      props.onChange?.(next);
    }
  }
</script>

{#if prefixCss}<ThemeScopeStyle css={prefixCss} scope={`tag-prefix:${prefix}`} />{/if}

<div
  {...attributes}
  bind:this={nativeElement}
  id={props.id}
  class={[
    groupPrefix,
    'ant-tag-css-var',
    config.tag?.class,
    props.rootClassName,
    props.disabled && `${groupPrefix}-disabled`,
    config.direction === 'rtl' && `${groupPrefix}-rtl`,
    componentTheme.className,
    props.class,
    contextClasses.root,
    localClasses.root
  ]}
  style={untrack(() => rootStyle)}
  {@attach rootStyles}
>
  {#each options as option (option.value)}
    <CheckableTag
      class={[
        `${groupPrefix}-item`, contextClasses.item, localClasses.item, option.className
      ].filter(Boolean).join(' ')}
      style={[contextStyles.item, localStyles.item, option.style].filter(Boolean).join(';')}
      checked={props.multiple
        ? ((selected as Value[]) || []).includes(option.value) : selected === option.value}
      disabled={props.disabled}
      onChange={checked => handleChange(checked, option)}
    >{#if typeof option.label === 'function'}{@render option.label()}{:else if typeof option.label !== 'boolean'}{option.label}{/if}</CheckableTag>
  {/each}
</div>
