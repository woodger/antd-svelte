<script lang="ts">
  import { FloatButton, FloatButtonGroup, FloatButtonBackTop } from 'antd-svelte';
  import type { FloatButtonPlacement, FloatButtonShape } from 'antd-svelte';

  export interface FloatButtonPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    childLocal?: string;
    rtl?: boolean;
    aliases?: boolean;
    shape?: FloatButtonShape;
    placement?: FloatButtonPlacement;
    menu?: boolean;
    primary?: boolean;
    disabled?: boolean;
    dot?: boolean;
    opaque?: boolean;
  }

  let { scope, sample, rootPrefix = 'ant', local = true }: {
    scope: string;
    sample: FloatButtonPrefixSample;
    rootPrefix?: string;
    local?: boolean;
  } = $props();
  let prefix = $derived(local && sample.local || `${rootPrefix}-float-btn`);
  let scroller = $state<HTMLDivElement>();
  let nativeElement = $state<HTMLButtonElement | HTMLAnchorElement>();
  let groupElement = $state<HTMLDivElement>();
  let open = $state(true);
  let events = $state<string[]>([]);
  let childrenPrefix = $derived(local ? sample.childLocal : undefined);
</script>

{#snippet icon()}<span aria-hidden="true" style="display:inline-block;width:12px;height:12px">+</span>{/snippet}
{#snippet first()}
  <FloatButton prefixCls={childrenPrefix} {icon} content="First" aria-label={`${scope} first action`}
    class="fixture-float-item" classNames={{ icon: 'fixture-float-icon',
      content: 'fixture-float-content' }} onclick={() => events.push('first')} />
{/snippet}
{#snippet last()}
  <FloatButton prefixCls={childrenPrefix} {icon} content="Last" aria-label={`${scope} last action`}
    class="fixture-float-item" classNames={{ icon: 'fixture-float-icon',
      content: 'fixture-float-content' }} />
{/snippet}
<form data-float-prefix-scope={scope} style="width:480px;position:relative;padding:12px"
  onsubmit={event => event.preventDefault()}>
  <FloatButton prefixCls={local ? sample.local : undefined} bind:nativeElement {icon}
    aria-label={`${scope} standalone action`} content="Do" shape="square"
    type={sample.primary ? 'primary' : 'default'} disabled={sample.disabled}
    class={`${prefix}-pure fixture-float-single`}
    classNames={{ icon: 'fixture-float-icon', content: 'fixture-float-content' }}
    badge={{ count: '5', dot: sample.dot, class: 'fixture-float-badge' }} />
  <FloatButtonGroup prefixCls={local ? sample.local : undefined} shape={sample.shape}
    placement={sample.placement} trigger={sample.menu ? 'click' : undefined} {open}
    onOpenChange={value => { open = value; events.push(`open:${value}`); }}
    bind:nativeElement={groupElement} aria-label={`${scope} floating menu`}
    icon={icon} closeIcon={icon} class={`${prefix}-pure fixture-float-group`}
    items={sample.opaque ? undefined : [{ key: 'first', children: first },
      { key: 'last', children: last }]}
    classNames={{ list: 'fixture-float-list', trigger: 'fixture-float-trigger',
      triggerIcon: 'fixture-float-icon' }}>
    {#if sample.opaque}{@render first()}{@render last()}{/if}
  </FloatButtonGroup>
  <div class="fixture-float-scroller" bind:this={scroller} style="height:60px;overflow:auto">
    <div style="height:300px">Scroll content</div>
  </div>
  <FloatButtonBackTop prefixCls={local ? sample.local : undefined} target={() => scroller ?? null}
    visibilityHeight={0} duration={0} showProgress {icon} aria-label={`${scope} back to top`}
    class={`${prefix}-pure fixture-float-back`} />
  <input aria-label={`${scope} floating draft`} name="draft" value="Draft" />
  <output aria-label={`${scope} floating refs`}>{nativeElement && groupElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} floating events`}>{events.join('|')}</output>
</form>
