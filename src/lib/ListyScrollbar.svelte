<script lang="ts">
  import { untrack } from 'svelte';
  import { listyScrollbar, listyScrollbarOffset } from './listy.engine';

  let {
    prefixCls,
    rtl,
    offset,
    range,
    size,
    flash,
    onScroll,
    onMoving
  }: {
    prefixCls: string;
    rtl: boolean;
    offset: number;
    range: number;
    size: number;
    flash: number;
    onScroll: (top: number) => void;
    onMoving: (moving: boolean) => void;
  } = $props();

  let bar = $state<HTMLDivElement>();
  let thumb = $state<HTMLDivElement>();
  let visible = $state(true);
  let moving = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let geometry = $derived(listyScrollbar(size, range, offset));

  function show() {
    clearTimeout(timer);
    visible = true;
    timer = setTimeout(() => { visible = false; }, 3000);
  }

  $effect(() => {
    void flash;
    void offset;
    untrack(show);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    const track = bar;
    const handle = thumb;
    if (!track || !handle) return;
    return untrack(() => connect(track, handle));
  });

  function connect(track: HTMLDivElement, handle: HTMLDivElement) {
    const view = track.ownerDocument.defaultView;
    if (!view) return;
    let startY = 0;
    let startTop = 0;
    let frame = 0;

    function position(event: MouseEvent | TouchEvent) {
      return ('touches' in event ? event.touches[0].pageY : event.pageY) - view!.scrollY;
    }

    function stop() {
      view!.cancelAnimationFrame(frame);
      if (moving) onMoving(false);
      moving = false;
      view!.removeEventListener('mousemove', move);
      view!.removeEventListener('touchmove', move);
      view!.removeEventListener('mouseup', stop);
      view!.removeEventListener('touchend', stop);
      view!.removeEventListener('touchcancel', stop);
    }

    function move(event: MouseEvent | TouchEvent) {
      view!.cancelAnimationFrame(frame);
      const scale = size / track.getBoundingClientRect().height;
      const next = startTop + (position(event) - startY) * scale;
      const top = listyScrollbarOffset(next, geometry.thumb, size, range);
      frame = view!.requestAnimationFrame(() => onScroll(top));
    }

    function start(event: MouseEvent | TouchEvent) {
      moving = true;
      startY = position(event);
      startTop = geometry.top;
      onMoving(true);
      event.stopPropagation();
      event.preventDefault();
      view!.addEventListener('mousemove', move, { passive: true });
      view!.addEventListener('touchmove', move, { passive: true });
      view!.addEventListener('mouseup', stop, { passive: true });
      view!.addEventListener('touchend', stop, { passive: true });
      view!.addEventListener('touchcancel', stop, { passive: true });
    }

    function trackDown(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();
      if (event.button !== 0 || handle.contains(event.target as Node)) return;
      const y = position(event);
      const top = track.getBoundingClientRect().top;
      if (!Number.isFinite(y) || !Number.isFinite(top)) return;
      onScroll(listyScrollbarOffset(y - top - geometry.thumb / 2, geometry.thumb, size, range));
    }

    function preventTouch(event: TouchEvent) { event.preventDefault(); }

    track.addEventListener('mousedown', trackDown);
    track.addEventListener('mousemove', show);
    track.addEventListener('touchstart', preventTouch, { passive: false });
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: false });

    return () => {
      track.removeEventListener('mousedown', trackDown);
      track.removeEventListener('mousemove', show);
      track.removeEventListener('touchstart', preventTouch);
      handle.removeEventListener('mousedown', start);
      handle.removeEventListener('touchstart', start);
      stop();
    };
  }
</script>

<div bind:this={bar} aria-hidden="true"
  class={[`${prefixCls}-scrollbar`, `${prefixCls}-scrollbar-vertical`,
    visible && `${prefixCls}-scrollbar-visible`]}
  style={`position:absolute;${visible ? '' : 'visibility:hidden;'}width:8px;top:0;bottom:0;${rtl ? 'left' : 'right'}:0`}>
  <div bind:this={thumb}
    class={[`${prefixCls}-scrollbar-thumb`, moving && `${prefixCls}-scrollbar-thumb-moving`]}
    style={`position:absolute;border-radius:99px;background:var(--rc-virtual-list-scrollbar-bg,rgba(0,0,0,0.5));cursor:pointer;user-select:none;width:100%;height:${geometry.thumb}px;top:${geometry.top}px`}></div>
</div>
