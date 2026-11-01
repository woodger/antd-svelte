<script lang="ts">
  import type { TourPanelInfo, TourProps, TourLocale } from './tour.types';
  import { getTourCloseAttributes, hasTourContent } from './tour.engine';
  import Button from './Button.svelte';
  import TourContent from './TourContent.svelte';
  import TourCloseIcon from './TourCloseIcon.svelte';

  let {
    info,
    type,
    locale,
    closeLabel,
    indicatorsRender,
    actionsRender
  }: {
    info: TourPanelInfo;
    type: TourProps['type'];
    locale: TourLocale;
    closeLabel: string;
    indicatorsRender?: TourProps['indicatorsRender'];
    actionsRender?: TourProps['actionsRender'];
  } = $props();

  let {
    prefixCls,
    current,
    total = 1,
    closable,
    title,
    description,
    cover,
    nextButtonProps,
    prevButtonProps,
    classNames = {},
    styles = {}
  } = $derived(info);
  let primary = $derived((info.type ?? type) === 'primary');
  let last = $derived(current === total - 1);

  function handlePrevious(event: MouseEvent & { currentTarget: HTMLButtonElement; }) {
    const callback = prevButtonProps?.onClick;
    info.onPrev?.();
    callback?.(event);
  }

  function handleNext(event: MouseEvent & { currentTarget: HTMLButtonElement; }) {
    const callback = nextButtonProps?.onClick;
    if (last) info.onFinish?.();
    else info.onNext?.();
    callback?.(event);
  }
</script>

{#snippet actions()}
  {#if current !== 0}
    <Button size="small" type="default" ghost={primary}
      class={[`${prefixCls}-prev-btn`, prevButtonProps?.class].filter(Boolean).join(' ')}
      style={prevButtonProps?.style} onClick={handlePrevious}>
      <TourContent value={prevButtonProps?.children ?? locale.Previous} />
    </Button>
  {/if}<Button size="small" type={primary ? 'default' : 'primary'}
    class={[`${prefixCls}-next-btn`, nextButtonProps?.class].filter(Boolean).join(' ')}
    style={nextButtonProps?.style} onClick={handleNext}>
    <TourContent value={nextButtonProps?.children ?? (last ? locale.Finish : locale.Next)} />
  </Button>
{/snippet}

<div class={`${prefixCls}-panel`}>
  <div class={[`${prefixCls}-section`, classNames.section]} style={styles.section}>
    {#if closable}
      <button type="button" onclick={() => info.onClose?.()}
        class={[`${prefixCls}-close`, classNames.close]} style={styles.close}
        aria-label={closeLabel} {...getTourCloseAttributes(closable)}>{#if closable.closeIcon}<TourContent value={closable.closeIcon} />{:else}<TourCloseIcon class={`${prefixCls}-close-icon`} />{/if}</button>
    {/if}
    {#if hasTourContent(cover)}
      <div class={[`${prefixCls}-cover`, classNames.cover]} style={styles.cover}>
        <TourContent value={cover} />
      </div>
    {/if}
    {#if hasTourContent(title)}
      <div class={[`${prefixCls}-header`, classNames.header]} style={styles.header}>
        <div class={[`${prefixCls}-title`, classNames.title]} style={styles.title}>
          <TourContent value={title} />
        </div>
      </div>
    {/if}
    {#if hasTourContent(description)}
      <div class={[`${prefixCls}-description`, classNames.description]} style={styles.description}>
        <TourContent value={description} />
      </div>
    {/if}
    <div class={[`${prefixCls}-footer`, classNames.footer]} style={styles.footer}>
      {#if total > 1}
        <div class={[`${prefixCls}-indicators`, classNames.indicators]} style={styles.indicators}>
          {#if indicatorsRender}{@render indicatorsRender(current, total)}
          {:else}{#each Array.from({ length: total }, (_, index) => index) as index}
            <span class={[`${prefixCls}-indicator`, index === current && `${prefixCls}-indicator-active`,
              classNames.indicator]} style={styles.indicator}></span>
          {/each}{/if}
        </div>
      {/if}
      <div class={[`${prefixCls}-actions`, classNames.actions]} style={styles.actions}>
        {#if actionsRender}{@render actionsRender(actions, { current, total })}
        {:else}{@render actions()}{/if}
      </div>
    </div>
  </div>
</div>
