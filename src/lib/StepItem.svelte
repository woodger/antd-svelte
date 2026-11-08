<script lang="ts">
  import Tooltip from './Tooltip.svelte';
  import Icon from './Icon.svelte';
  import StepIcon from './StepIcon.svelte';
  import { setStepsIcon } from './steps-icon-context';
  import { useWave } from './wave.svelte';
  import { stepsDataHasContent } from './steps-data.engine';
  import type { StepsDataContent } from './steps-data.engine';
  import type { StepItemViewProps } from './steps-expanded.types';
  let {
    prefixCls = 'ant-steps',
    item,
    index,
    status,
    active,
    blocked,
    nextStatus,
    rootId,
    statusText,
    composed,
    classes,
    slots,
    dot,
    panel,
    inline,
    percent,
    iconRender,
    ellipsis,
    sourceKey,
    onChoose,
    waveDisabled,
    waveColorSource
  }: StepItemViewProps = $props();
  const wave = useWave('Steps', () => blocked || !!waveDisabled, () => waveColorSource);
  const style = (root:
    string
    | undefined, local:
      string
      | undefined) => [root, local].filter(Boolean).join(
        ';'
      );
  let localClasses = $derived(item.classNames ?? {});
  let localStyles = $derived(item.styles ?? {});
  let iconItem = $derived.by(() => {
    const { originalKey: _originalKey, ...data } = item;
    return { ...data, key: sourceKey, status };
  });
  let progress = $derived(!dot && !item.icon && status === 'process' && percent !== undefined);
  setStepsIcon({
    get prefixCls() {
      return prefixCls;
    },
    get className() {
      return ['ant-wave-target', classes.itemIcon, localClasses.icon].filter(Boolean).join(' ');
    },
    get style() {
      return style(slots.itemIcon, localStyles.icon);
    },
    get decorative() {
      return !progress;
    }
  });
  const encodedKey = $derived(
    Array.from(item.key, character => character.codePointAt(0)!.toString(16)).join('-') || 'empty'
  );
  let statusId = $derived(`${rootId}-status-${encodedKey}`);
  let contentId = $derived(`${rootId}-content-${encodedKey}`);
</script>

<style>
  [data-ant-step-part="item"] { min-width: 0; }
  [data-ant-step-part="wrapper"], [data-ant-step-part="header"], [data-ant-step-part="trigger"] { min-width: 0; }
  [data-ant-step-part="header"] { flex-wrap: wrap; }
  [data-ant-step-part="title"], [data-ant-step-part="subtitle"], [data-ant-step-part="content"] { overflow-wrap: anywhere; }
  [data-ant-step-part="subtitle"] { flex-shrink: 1; }
  [data-ant-step-part="trigger"] { display: flex; flex-wrap: wrap; align-items: center; min-height: var(--ant-cmp-steps-heading-height); max-width: 100%; border: 0; padding: 0; margin: 0; background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
  [data-ant-step-part="trigger"]:disabled { cursor: default; }
  [data-ant-step-part="trigger"]:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: -2px; border-radius: var(--ant-border-radius-sm); }
  [data-ant-step-part="item"] :global([data-ant-step-part="icon"] svg) { max-width: 100%; max-height: 100%; }
  [data-ant-step-part="status"] { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>

{#snippet value(node: StepsDataContent)}
  {#if typeof node === 'function'}{@render node()}{:else if node !== true && node !== false}{node ?? ''}{/if}
{/snippet}
{#snippet originalIcon()}
  <StepIcon>
    {#if ellipsis}<svg aria-hidden="true" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" focusable="false"><path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z" /></svg>
    {:else if item.icon}{@render value(item.icon)}
    {:else if dot}<!-- Source CSS paints the empty icon host. -->
    {:else if status === 'finish'}<Icon name="check" />
    {:else if status === 'error'}<Icon name="close" />
    {:else}
      {#if progress}
        <svg class={`${prefixCls}-item-progress-icon-svg`} viewBox="0 0 100 100" width="100%" height="100%" role="progressbar" aria-valuemax="100" aria-valuemin="0" aria-valuenow={percent}>
          <circle class={`${prefixCls}-item-progress-icon-circle ${prefixCls}-item-progress-icon-circle-rail`}></circle>
          <circle class={`${prefixCls}-item-progress-icon-circle ${prefixCls}-item-progress-icon-circle-ptg`} stroke-dasharray={`calc(var(--ant-cmp-steps-progress-radius) * 2 * ${Math
              .PI * percent! / 100}) 9999`} transform="rotate(-90 50 50)"></circle>
        </svg>
      {/if}
      <span class={`${prefixCls}-item-icon-number`}>{index + 1}</span>
    {/if}
  </StepIcon>
{/snippet}
{#snippet title()}
  {#if stepsDataHasContent(item.title)}<svelte:element this={composed ? 'div' : 'span'} data-ant-step-part="title" class={[`${prefixCls}-item-title`, classes.itemTitle, localClasses.title]} style={style(slots.itemTitle, localStyles.title)}>{@render value(item.title)}</svelte:element>{/if}
  {#if stepsDataHasContent(item.subTitle)}<svelte:element this={composed ? 'div' : 'span'} data-ant-step-part="subtitle" class={[
      `${prefixCls}-item-subtitle`,
      classes.itemSubtitle,
      localClasses.subtitle
    ]} style={style(slots.itemSubtitle, localStyles.subtitle)} title={typeof item.subTitle === 'string' ? item.subTitle : undefined}>{@render value(item.subTitle)}</svelte:element>{/if}
{/snippet}
{#snippet tooltipContent()}{@render value(item.content)}{/snippet}
{#snippet wrapper()}
  <div data-ant-step-part="wrapper" class={[`${prefixCls}-item-wrapper`, classes.itemWrapper, localClasses.wrapper]} style={style(slots.itemWrapper, localStyles.wrapper)}>
    {#if iconRender}{@render iconRender(
        originalIcon,
        { index, active, item: iconItem, components: { Icon: StepIcon } }
      )}
    {:else}{@render originalIcon()}{/if}
    <div data-ant-step-part="section" class={[
        `${prefixCls}-item-section`,
        classes.itemSection,
        localClasses.section
      ]} style={style(slots.itemSection, localStyles.section)}>
      <div data-ant-step-part="header" class={[
          `${prefixCls}-item-header`,
          classes.itemHeader,
          localClasses.header
        ]} style={style(slots.itemHeader, localStyles.header)}>
        {#if onChoose}<button type="button" data-ant-step-part="trigger" class={`${prefixCls}-item-trigger`} data-steps-key={item.key} disabled={blocked} aria-current={active ? 'step' : undefined} aria-describedby={[statusId, item.content
            ? contentId
            : undefined].filter(Boolean).join(
              ' '
            )} onclick={onChoose}>{@render title()}</button>{:else}{@render title()}{/if}
        {#if nextStatus}<span class={[
            `${prefixCls}-item-rail`,
            `${prefixCls}-item-rail-${nextStatus}`,
            classes.itemRail,
            localClasses.rail
          ]} style={style(slots.itemRail, localStyles.rail)} aria-hidden="true"></span>{/if}
      </div>
      {#if statusText}<span data-ant-step-part="status" class={`${prefixCls}-item-status`} id={statusId}>{statusText}</span>{/if}
      {#if item.content || stepsDataHasContent(item.content) && typeof item.content !== 'string'}<div data-ant-step-part="content" class={[
          `${prefixCls}-item-content`,
          classes.itemContent,
          localClasses.content
        ]} id={composed ? undefined : contentId} style={style(slots.itemContent, localStyles.content)}>{@render value(item.content)}</div>{/if}
    </div>
  </div>
{/snippet}

<li data-ant-step-part="item" {@attach wave} class={[
    `${prefixCls}-item`,
    `${prefixCls}-item-${status}`,
    active && `${prefixCls}-item-active`,
    blocked && `${prefixCls}-item-disabled`,
    (item.icon || ellipsis) && `${prefixCls}-item-custom`,
    ellipsis && `${prefixCls}-item-ellipsis`,
    onChoose && !blocked && `${prefixCls}-item-clickable`,
    !stepsDataHasContent(item.title)
    && !stepsDataHasContent(item.subTitle)
    && `${prefixCls}-item-empty-header`,
    item.class,
    classes.item,
    localClasses.root
  ]}
  style={[slots.item, localStyles.root, item.style].filter(Boolean).join(';')} aria-current={!composed && !onChoose && active ? 'step' : undefined} data-steps-key={item.key}>
  {#if inline && item.content}<Tooltip title={tooltipContent}>{@render wrapper()}</Tooltip>{:else}{@render wrapper()}{/if}
  {#if panel}<svg aria-hidden="true" class={`${prefixCls}-panel-arrow`} viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M 0 0 L 100 50 L 0 100" /></svg>{/if}
</li>
