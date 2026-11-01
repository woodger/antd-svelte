<script lang="ts">
  import {
    Carousel,
    ConfigProvider,
    type CarouselRef,
    type CarouselProps,
    type CarouselItem,
    type DotPlacement,
    type CarouselLazyLoad,
    type CarouselArrowProps,
    type CarouselDotsProps
  } from 'antd-svelte';
  import type { Snippet } from 'svelte';

  let ref = $state<CarouselRef>();
  let element = $state<HTMLDivElement>();
  let mounted = $state(true);
  let count = $state(4);
  let initialSlide = $state(0);
  let destination = $state(2);
  let infinite = $state(true);
  let vertical = $state(false);
  let overrideVertical = $state(false);
  let rtl = $state(false);
  let overrideRtl = $state(false);
  let arrows = $state(true);
  let dots = $state(true);
  let fade = $state(false);
  let draggable = $state(false);
  let accessibility = $state(true);
  let autoplay = $state(false);
  let dotDuration = $state(false);
  let wait = $state(false);
  let adaptive = $state(false);
  let variable = $state(false);
  let center = $state(false);
  let focusOnSelect = $state(false);
  let pauseFocus = $state(false);
  let pauseHover = $state(true);
  let pauseDots = $state(false);
  let useCSS = $state(true);
  let useTransform = $state(true);
  let touchMove = $state(true);
  let swipe = $state(true);
  let swipeToSlide = $state(false);
  let speed = $state(120);
  let autoplaySpeed = $state(1000);
  let show = $state(1);
  let scroll = $state(1);
  let rows = $state(1);
  let perRow = $state(1);
  let placement = $state<DotPlacement>('bottom');
  let lazy = $state<CarouselLazyLoad | 'none'>('none');
  let responsive = $state(false);
  let regular = $state(false);
  let custom = $state(false);
  let alias = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let sync = $state(false);
  let images = $state(false);
  let peer = $state<CarouselRef>();
  let saved: CarouselRef | undefined;
  let reinitializations = $state(0);
  let submissions = $state(0);
  let events = $state<string[]>([]);
  let clicks = $state(0);

  function record(value: string) {
    events = [...events, value];
  }

  let items = $derived<CarouselItem[]>(Array.from({ length: count }, (_, index) => ({
    children: images ? image : [first, second, third, fourth][index % 4],
    width: [160, 220, 180, 200][index % 4],
    class: 'carousel-child',
    style: 'color:red',
    attributes: { 'data-item': index }
  })));
  let options = $derived<CarouselProps>({
    items,
    initialSlide,
    infinite,
    ...(overrideVertical ? { vertical } : {}),
    ...(overrideRtl ? { rtl } : {}),
    arrows,
    dots: dots ? { class: 'custom-dots-class' } : false,
    effect: fade ? 'fade' : 'scrollx',
    draggable,
    accessibility,
    autoplay: autoplay ? dotDuration ? { dotDuration: true } : true : false,
    autoplaySpeed,
    speed,
    waitForAnimate: wait,
    adaptiveHeight: adaptive,
    variableWidth: variable,
    centerMode: center,
    centerPadding: '20px',
    focusOnSelect,
    asNavFor: sync ? peer : undefined,
    pauseOnFocus: pauseFocus,
    pauseOnHover: pauseHover,
    pauseOnDotsHover: pauseDots,
    useCSS,
    useTransform,
    touchMove,
    swipe,
    swipeToSlide,
    slidesToShow: show,
    slidesToScroll: scroll,
    rows,
    slidesPerRow: perRow,
    dotPlacement: placement,
    lazyLoad: lazy === 'none' ? undefined : lazy,
    responsive: responsive ? [
      { breakpoint: 600, settings: regular ? 'unslick' : { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 900, settings: { slidesToShow: 3 } }
    ] : undefined,
    prevArrow: custom ? customArrow : undefined,
    nextArrow: custom ? customArrow : undefined,
    customPaging: custom ? paging : undefined,
    appendDots: custom ? append : undefined,
    beforeChange: (previous, next) => record(`before:${previous}:${next}`),
    afterChange: index => record(`after:${index}`),
    onInit: () => record('init'),
    onReInit: () => { reinitializations++; },
    onLazyLoad: indexes => record(`lazy:${indexes.join(',')}`),
    onEdge: direction => record(`edge:${direction}`),
    onSwipe: direction => record(`swipe:${direction}`),
    swipeEvent: direction => record(`moving:${direction}`),
    onLazyLoadError: () => record('image-error'),
    class: 'local-slider',
    rootClassName: 'local-carousel',
    style: 'color:rgb(0,80,0)'
  });
</script>

{#snippet first()}
  <section class="slide first"><h3>Slide A</h3><input aria-label="Draft A" value="Alpha" />
    <button type="button" onclick={() => { clicks++; }}>Action A</button></section>
{/snippet}
{#snippet second()}
  <section class="slide second"><h3>Slide B</h3><input aria-label="Draft B" value="Beta" /></section>
{/snippet}
{#snippet third()}
  <section class="slide third"><h3>Slide C</h3><input aria-label="Draft C" value="Gamma" /></section>
{/snippet}
{#snippet fourth()}
  <section class="slide fourth"><h3>Slide D</h3><input aria-label="Draft D" value="Delta" /></section>
{/snippet}
{#snippet image()}
  <img alt="Landscape" width="80" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Crect width='80' height='40' fill='%231677ff'/%3E%3C/svg%3E" />
{/snippet}
{#snippet customArrow(info: CarouselArrowProps)}
  <button type="button" class={info.class} style={info.style} onclick={info.onClick}
    aria-label={info.class.includes('slick-prev') ? 'Custom previous' : 'Custom next'}
    data-current={info.currentSlide} data-count={info.slideCount}>Arrow</button>
{/snippet}
{#snippet paging(index: number, info: { onClick: (event: MouseEvent) => void; })}
  <button type="button" onclick={info.onClick} aria-label={`Custom dot ${index + 1}`}>{index + 1}</button>
{/snippet}
{#snippet append(original: Snippet, info: CarouselDotsProps)}
  <!-- svelte-ignore a11y_mouse_events_have_key_events (Проверяет исходные pauseOnDotsHover callbacks.) -->
  <ol class={info.class} onmouseenter={info.onMouseEnter} onmouseover={info.onMouseOver}
    onmouseleave={info.onMouseLeave} data-append="custom">{@render original()}</ol>
{/snippet}

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 4px 12px; }
  .frame { width: 600px; max-width: 100%; }
  .events { display: block; height: 24px; overflow: auto; white-space: nowrap; }
  .slide { color: #fff; text-align: center; background: #364d79; height: 160px; }
  .slide h3 { margin: 0; color: inherit; line-height: 48px; }
  .second { height: 220px; background: #547baa; }
  .third { height: 180px; background: #476353; }
  .fourth { height: 200px; background: #6b4b6b; }
</style>

<section id="carousel-fixture">
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount Carousel</label>
    <label><input type="checkbox" bind:checked={infinite} /> Carousel infinite</label>
    <label><input type="checkbox" bind:checked={overrideVertical} /> Carousel vertical override</label>
    <label><input type="checkbox" bind:checked={vertical} /> Carousel vertical</label>
    <label><input type="checkbox" bind:checked={overrideRtl} /> Carousel RTL override</label>
    <label><input type="checkbox" bind:checked={rtl} /> Carousel RTL</label>
    <label><input type="checkbox" bind:checked={arrows} /> Carousel arrows</label>
    <label><input type="checkbox" bind:checked={dots} /> Carousel dots</label>
    <label><input type="checkbox" bind:checked={fade} /> Carousel fade</label>
    <label><input type="checkbox" bind:checked={draggable} /> Carousel draggable</label>
    <label><input type="checkbox" bind:checked={accessibility} /> Carousel accessibility</label>
    <label><input type="checkbox" bind:checked={autoplay} /> Carousel autoplay</label>
    <label><input type="checkbox" bind:checked={dotDuration} /> Carousel duration</label>
    <label><input type="checkbox" bind:checked={wait} /> Carousel wait</label>
    <label><input type="checkbox" bind:checked={adaptive} /> Carousel adaptive</label>
    <label><input type="checkbox" bind:checked={variable} /> Carousel variable</label>
    <label><input type="checkbox" bind:checked={center} /> Carousel center</label>
    <label><input type="checkbox" bind:checked={focusOnSelect} /> Carousel select</label>
    <label><input type="checkbox" bind:checked={pauseFocus} /> Carousel pause focus</label>
    <label><input type="checkbox" bind:checked={pauseHover} /> Carousel pause hover</label>
    <label><input type="checkbox" bind:checked={pauseDots} /> Carousel pause dots</label>
    <label><input type="checkbox" bind:checked={useCSS} /> Carousel CSS</label>
    <label><input type="checkbox" bind:checked={useTransform} /> Carousel transform</label>
    <label><input type="checkbox" bind:checked={touchMove} /> Carousel touch</label>
    <label><input type="checkbox" bind:checked={swipe} /> Carousel swipe</label>
    <label><input type="checkbox" bind:checked={swipeToSlide} /> Carousel swipe slide</label>
    <label><input type="checkbox" bind:checked={responsive} /> Carousel responsive</label>
    <label><input type="checkbox" bind:checked={regular} /> Carousel regular</label>
    <label><input type="checkbox" bind:checked={custom} /> Carousel custom</label>
    <label><input type="checkbox" bind:checked={alias} /> Carousel locale alias</label>
    <label><input type="checkbox" bind:checked={dark} /> Carousel dark</label>
    <label><input type="checkbox" bind:checked={compact} /> Carousel compact</label>
    <label><input type="checkbox" bind:checked={sync} /> Carousel sync</label>
    <label><input type="checkbox" bind:checked={images} /> Carousel images</label>
    <label>Carousel count<input type="number" bind:value={count} /></label>
    <label>Carousel initial<input type="number" bind:value={initialSlide} /></label>
    <label>Carousel destination<input type="number" bind:value={destination} /></label>
    <label>Carousel speed<input type="number" bind:value={speed} /></label>
    <label>Carousel autoplay speed<input type="number" bind:value={autoplaySpeed} /></label>
    <label>Carousel show<input type="number" bind:value={show} /></label>
    <label>Carousel scroll<input type="number" bind:value={scroll} /></label>
    <label>Carousel rows<input type="number" bind:value={rows} /></label>
    <label>Carousel per row<input type="number" bind:value={perRow} /></label>
    <label>Carousel placement<select bind:value={placement}>
      <option>top</option><option>bottom</option><option>start</option><option>end</option>
    </select></label>
    <label>Carousel lazy<select bind:value={lazy}>
      <option>none</option><option>ondemand</option><option>progressive</option><option>anticipated</option>
    </select></label>
  </div>
  <button type="button" onclick={() => ref?.next()}>Carousel next ref</button>
  <button type="button" onclick={() => ref?.prev()}>Carousel previous ref</button>
  <button type="button" onclick={() => ref?.goTo(destination)}>Carousel go ref</button>
  <button type="button" onclick={() => ref?.goTo(destination, true)}>Carousel instant ref</button>
  <button type="button" onclick={() => ref?.innerSlider?.slickPause()}>Carousel pause ref</button>
  <button type="button" onclick={() => ref?.innerSlider?.slickPlay()}>Carousel play ref</button>
  <button type="button" onclick={() => { saved = ref; }}>Save Carousel ref</button>
  <button type="button" onclick={() => saved?.next()}>Call saved Carousel next</button>
  <button type="button" onclick={() => { events = []; }}>Clear Carousel events</button>
  <output aria-label="Carousel current">{ref?.innerSlider?.state.currentSlide ?? 'none'}</output>
  <output aria-label="Carousel target">{ref?.innerSlider?.state.targetSlide ?? 'none'}</output>
  <output aria-label="Carousel animating">{String(ref?.innerSlider?.state.animating)}</output>
  <output aria-label="Carousel playing">{ref?.innerSlider?.state.autoplaying ?? 'none'}</output>
  <output aria-label="Carousel ref">{element?.id ?? 'none'}</output>
  <output aria-label="Carousel clicks">{clicks}</output>
  <output aria-label="Carousel reinits">{reinitializations}</output>
  <output aria-label="Carousel submissions">{submissions}</output>
  <output aria-label="Carousel peer current">{peer?.innerSlider?.state.currentSlide ?? 'none'}</output>
  <output class="events" aria-label="Carousel events">{events.join('|')}</output>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    locale={{ Carousel: alias ? { prevSlide: 'Source previous', nextSlide: 'Source next' } : undefined }}
    carousel={{ class: 'provider-slider', style: 'color:rgb(80,0,0)' }}>
    <form onsubmit={event => {
      event.preventDefault();
      submissions++;
    }}>
      <div class="frame">
        {#if mounted}<Carousel {...options} bind:ref bind:nativeElement={element} id="carousel-under-test" />{/if}
        {#if sync}
          <Carousel {items} asNavFor={ref} speed={120} bind:ref={peer} id="carousel-peer" />
        {/if}
      </div>
    </form>
  </ConfigProvider>
</section>
