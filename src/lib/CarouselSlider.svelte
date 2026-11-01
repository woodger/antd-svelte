<script lang="ts">
  import { untrack } from 'svelte';
  import CarouselContent from './CarouselContent.svelte';
  import {
    carouselCanGoNext,
    carouselDotItems,
    carouselRenderedSlides,
    carouselSlideClasses,
    carouselStyle
  } from './carousel.engine';
  import { createCarouselModel } from './carousel.model.svelte';
  import type { CarouselSettings, getCarouselRows } from './carousel-settings.engine';
  import type {
    CarouselArrowProps,
    CarouselAutoplayState,
    CarouselDotsProps,
    CarouselInnerSlider,
    CarouselLocale
  } from './carousel.types';

  let {
    settings,
    groups,
    locale,
    class: className,
    style,
    inner = $bindable()
  }: {
    settings: CarouselSettings;
    groups: ReturnType<typeof getCarouselRows>;
    locale: CarouselLocale;
    class?: string;
    style?: string;
    inner?: CarouselInnerSlider;
  } = $props();
  const model = untrack(() => createCarouselModel(
    settings,
    groups.length,
    groups.map(group => group.width)
  ));
  let list = $state<HTMLDivElement>();
  let track = $state<HTMLDivElement>();
  let dotOverState: CarouselAutoplayState | undefined;
  // Как Track в slick, рендер читает новые props до componentDidUpdate/измерений модели.
  let spec = $derived({ ...model.spec, ...settings });
  let slides = $derived(carouselRenderedSlides(spec, groups.length));
  let dots = $derived(carouselDotItems(spec));
  let listStyle = $derived([
    settings.vertical && model.state.listHeight !== null && `height:${model.state.listHeight}px`,
    settings.centerMode && (settings.vertical
      ? `padding:${settings.centerPadding} 0px` : `padding:0px ${settings.centerPadding}`)
  ].filter(Boolean).join(';'));
  let dotProps = $derived<CarouselDotsProps>({
    class: settings.dotsClass,
    className: settings.dotsClass,
    onMouseEnter: settings.pauseOnDotsHover ? handleDotsEnter : undefined,
    onMouseOver: settings.pauseOnDotsHover ? handleDotsOver : undefined,
    onMouseLeave: settings.pauseOnDotsHover ? model.handleLeave : undefined
  });

  $effect(() => {
    const next = settings;
    const count = groups.length;
    untrack(() => model.configure(next, count));
  });

  $effect(() => {
    const viewport = list;
    const rail = track;
    if (!viewport || !rail) return;
    return untrack(() => model.mount(viewport, rail));
  });

  $effect(() => {
    inner = model.inner;
    return () => { inner = undefined; };
  });

  function arrowProps(previous: boolean): CarouselArrowProps {
    const disabled = previous
      ? !settings.infinite && (model.state.currentSlide === 0 || groups.length <= settings.slidesToShow)
      : !carouselCanGoNext(spec);
    const className = ['slick-arrow', previous ? 'slick-prev' : 'slick-next',
      disabled && 'slick-disabled'].filter(Boolean).join(' ');
    return {
      class: className,
      className,
      style: 'display:block',
      onClick: disabled ? undefined : event => {
        event?.preventDefault();
        model.change({ message: previous ? 'previous' : 'next' });
      },
      currentSlide: model.state.currentSlide,
      slideCount: groups.length,
      'data-role': 'none'
    };
  }

  function slideStyle(item: typeof slides[number]) {
    const values: Record<string, number | string | undefined> = {
      ...(item.index >= 0 && item.index < groups.length ? { outline: 'none' } : {}),
      ...(settings.variableWidth && item.loaded ? { width: groups[item.item].width } : {}),
      ...(!settings.variableWidth ? { width: model.state.slideWidth ?? undefined } : {})
    };
    if (settings.fade) {
      values.position = 'relative';
      if (settings.vertical && model.state.slideHeight) {
        values.top = -item.item * Number.parseInt(String(model.state.slideHeight));
      } else {
        values.left = -item.item * Number.parseInt(String(model.state.slideWidth));
      }
      values.opacity = model.state.currentSlide === item.item ? 1 : 0;
      values.zIndex = model.state.currentSlide === item.item ? 999 : 998;
      if (settings.useCSS) {
        values.transition = `opacity ${settings.speed}ms ${settings.cssEase}, visibility ${settings.speed}ms ${settings.cssEase}`;
      }
    }
    return carouselStyle(values);
  }

  function dotClick(index: number, event: MouseEvent) {
    event.preventDefault();
    model.change({ message: 'dots', index, slidesToScroll: settings.slidesToScroll });
  }

  function handleDotsOver() {
    // React объединяет over/enter одного native события; enter видит состояние до pause.
    dotOverState = model.state.autoplaying;
    model.handleHover();
  }

  function handleDotsEnter() {
    const previous = dotOverState ?? model.state.autoplaying;
    dotOverState = undefined;
    if (previous === 'hovered') model.handleLeave();
  }
</script>

{#snippet arrow(previous: boolean)}
  {@const info = arrowProps(previous)}
  {@const render = previous ? settings.prevArrow : settings.nextArrow}
  {#if render}{@render render(info)}
  {:else}
    <button type="button" class={info.class} style={info.style} onclick={info.onClick}
      data-role="none" aria-label={(previous !== settings.rootRtl) ? locale.prevSlide : locale.nextSlide}></button>
  {/if}
{/snippet}

{#snippet dotsContent()}
  {#each dots as dot}
    <li class:slick-active={dot.active}>
      {#if settings.customPaging}
        {@render settings.customPaging(dot.index, { onClick: event => dotClick(dot.index, event) })}
      {:else}
        <button type="button" onclick={event => dotClick(dot.index, event)}>{dot.index + 1}</button>
      {/if}
    </li>
  {/each}
{/snippet}

<div class={['slick-slider', className, settings.vertical && 'slick-vertical', 'slick-initialized']}
  dir={settings.unslick ? undefined : 'ltr'} {style}>
  {#if settings.arrows && !settings.unslick}{@render arrow(true)}{/if}
  <!-- svelte-ignore a11y_no_static_element_interactions (Контейнер маршрутизирует drag и keyboard вложенных слайдов.) -->
  <div bind:this={list} class="slick-list" style={settings.unslick ? undefined : listStyle}
    onclick={settings.unslick ? undefined : model.handleClick}
    onkeydown={settings.unslick ? undefined : model.handleKeydown}
    onmousedown={model.handleStart} onmousemove={model.handleMove} onmouseup={model.handleEnd}
    onmouseleave={event => { if (model.state.dragging) model.handleEnd(event); }}
    ontouchstart={model.handleStart} ontouchmove={model.handleMove} ontouchend={model.handleEnd}
    ontouchcancel={event => { if (model.state.dragging) model.handleEnd(event); }}>
    <!-- svelte-ignore a11y_mouse_events_have_key_events (Hover pause не заменяет отдельный pauseOnFocus.) -->
    <div bind:this={track} class="slick-track" style={carouselStyle(model.state.trackStyle)}
      onmouseenter={settings.pauseOnHover ? model.handleHover : undefined}
      onmouseover={settings.pauseOnHover ? model.handleHover : undefined}
      onmouseleave={settings.pauseOnHover ? model.handleLeave : undefined}>
      {#each slides as item (item.key)}
        {@const classes = carouselSlideClasses(spec, item.index)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_tabindex a11y_no_static_element_interactions (Исходный слайд получает focusOnSelect и programmatic focus.) -->
        <div data-index={item.index} class={Object.keys(classes).filter(name => classes[name as keyof typeof classes])}
          tabindex="-1" aria-hidden={!classes['slick-active']} style={slideStyle(item)}
          onclick={() => model.select(item.item)}>
          {#if item.loaded}
            {#each groups[item.item].rows as row}
              <div>{#each row as child}
                <div {...child.attributes} tabindex="-1" class={child.class}
                  style={`width:${100 / settings.slidesPerRow}%;display:inline-block`}>
                  <CarouselContent value={child.children} />
                </div>
              {/each}</div>
            {/each}
          {/if}
        </div>
      {/each}
    </div>
  </div>
  {#if settings.arrows && !settings.unslick}{@render arrow(false)}{/if}
  {#if settings.dots && groups.length >= settings.slidesToShow && !settings.unslick}
    {#if settings.appendDots}{@render settings.appendDots(dotsContent, dotProps)}
    {:else}
      <!-- svelte-ignore a11y_mouse_events_have_key_events (Hover pause зависит от pauseOnDotsHover.) -->
      <ul class={dotProps.class} style="display:block" onmouseenter={dotProps.onMouseEnter}
        onmouseover={dotProps.onMouseOver} onmouseleave={dotProps.onMouseLeave}>
        {@render dotsContent()}
      </ul>
    {/if}
  {/if}
</div>
