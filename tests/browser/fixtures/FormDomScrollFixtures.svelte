<script lang="ts">
  import { Form, FormItem, Input, createForm, type FormScrollOptions } from 'antd-svelte';

  const form = createForm({ initialValues: {} });
  const neighbor = createForm({ initialValues: {} });
  let box = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let snapshot = $state('');
  let actions = $state('');
  let margin = $state(false);
  let nested = $state(false);
  let overflowHidden = $state(false);
  let outer = $state<HTMLDivElement>();
  let customCalls = $state(0);
  const custom = {
    get nativeElement() {
      return input;
    },
    focus() {
      customCalls++;
      input?.focus();
    }
  };

  function capture(id: string) {
    snapshot = JSON.stringify({ id, top: box?.scrollTop, left: box?.scrollLeft,
      focused: input?.ownerDocument.activeElement === input });
  }

  function scroll(id: string, options?: FormScrollOptions) {
    form.scrollToField(id === 'missing' ? 'missing' : 'scroll', options);
    capture(id);
  }

  function reset() {
    input?.blur();
    box?.scroll(0, 0);
    outer?.scroll(0, 0);
    capture('reset');
  }

  function customBehavior(focus = false) {
    scroll('custom', { boundary: box, focus, behavior: (steps) => {
      actions = JSON.stringify(steps.map(({ el, top, left }) => ({ box: el === box, top, left })));
    } });
  }
</script>

<style>
  .outer { height: 260px; overflow: auto; }
  .nested { height: 120px; }
  .nested .spacer { height: 180px; }
  .box { height: 160px; width: 280px; overflow: auto; }
  .hidden { overflow: hidden; }
  .space { height: 320px; width: 800px; }
  .target { display: block; height: 24px; width: 100px; box-sizing: border-box; margin-left: 400px; }
</style>

<section id="form-dom-scroll-fixture" aria-label="Form scrolling">
  <Form form={form} component={false}>
    <div bind:this={outer} class="outer" class:nested>
      <div class="spacer"></div>
      <div bind:this={box} class="box" class:hidden={overflowHidden} data-testid="scroll-box">
        <div class="space"></div>
        <input bind:this={input} id="dom-scroll-target" class="target" aria-label="Scroll target"
          style:scroll-margin={margin ? '12px 7px 4px 3px' : '0px'} />
        <div class="space"></div>
      </div>
      <div class="spacer"></div>
    </div>
    <FormItem name="scroll" label="Scroll" htmlFor="dom-scroll-target" controlRef={custom}>
      <span>External native control</span>
    </FormItem>
    <FormItem name="same" label="First form" htmlFor="dom-shared-id">
      <Input id="dom-shared-id" aria-label="First form input" />
    </FormItem>
  </Form>
  <Form form={neighbor} component={false}>
    <FormItem name="same" label="Second form" htmlFor="dom-shared-id">
      <input id="dom-shared-id" aria-label="Second form input" />
    </FormItem>
  </Form>
  <button type="button" onclick={() => scroll('missing')}>Scroll missing</button>
  <button type="button" onclick={() => scroll('nearest')}>Scroll nearest</button>
  <button type="button" onclick={() => scroll('visible')}>Scroll visible</button>
  {#each ['start', 'center', 'end'] as block}
    <button type="button" onclick={() => scroll(block === 'end' ? 'end-focus' : block, {
      scrollMode: 'always', block: block as ScrollLogicalPosition,
      inline: block as ScrollLogicalPosition, boundary: box, focus: block === 'end'
    })}>Scroll {block}</button>
  {/each}
  <button type="button" onclick={reset}>Reset scroll</button>
  <button type="button" onclick={() => customBehavior()}>Custom scroll</button>
  <button type="button" onclick={() => customBehavior(true)}>Custom scroll focus</button>
  <button type="button" onclick={() => scroll('smooth', { behavior: 'smooth', boundary: box })}>
    Smooth scroll
  </button>
  <button type="button" onclick={() => scroll('bounded', { boundary: box })}>Bounded scroll</button>
  <button type="button" onclick={() => scroll('predicate', { boundary: (node) => node !== box })}>
    Predicate scroll
  </button>
  <button type="button" onclick={() => scroll('skip-hidden', { skipOverflowHiddenElements: true })}>
    Skip hidden scroll
  </button>
  <button type="button" onclick={() => { form.focusField('same'); }}>Focus first form</button>
  <button type="button" onclick={() => { neighbor.focusField('same'); }}>Focus second form</button>
  <label><input type="checkbox" bind:checked={nested} /> Nested scrolling</label>
  <label><input type="checkbox" bind:checked={overflowHidden} /> Hidden overflow</label>
  <label><input type="checkbox" bind:checked={margin} /> Scroll margin</label>
  <output aria-label="Scroll snapshot">{snapshot}</output>
  <output aria-label="Scroll actions">{actions}</output>
  <output aria-label="Scroll focus calls">{customCalls}</output>
</section>
