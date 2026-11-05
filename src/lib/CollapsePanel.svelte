<script lang="ts">
  import RenderContent from './RenderContent.svelte';
  import type { CollapseContent } from './collapse.types';

  let {
    id,
    labelledBy,
    itemKey,
    open,
    region,
    children,
    prefix = 'ant-collapse',
    bodyClass,
    bodyStyle,
    forceRender = false,
    destroyOnHidden = false
  }: {
    id: string;
    labelledBy: string;
    itemKey: string;
    open: boolean;
    region: boolean;
    children?: CollapseContent;
    prefix?: string;
    bodyClass?: string;
    bodyStyle?: string;
    forceRender?: boolean;
    destroyOnHidden?: boolean;
  } = $props();
  let mounted = $state(false);
  let renderContent = $derived(open || forceRender || mounted && !destroyOnHidden);

  // История фактического монтирования сохраняет панель без копирования open через effect.
  function rememberContent() {
    mounted = true;
    return () => {
      mounted = false;
    };
  }
</script>

<style>
  [data-collapse-panel] { min-width: 0; overflow-wrap: anywhere; }
  [data-collapse-panel][hidden] { display: none; }
</style>

<div {id} role={region ? 'region' : undefined} aria-labelledby={region ? labelledBy : undefined} hidden={!open} data-collapse-panel={itemKey} class={[`${prefix}-panel`, !open && `${prefix}-panel-hidden`]}>
  {#if renderContent}<div class={[`${prefix}-body`, bodyClass]} data-ant-collapse-part="body" style={bodyStyle || undefined} {@attach rememberContent}><RenderContent value={children} /></div>{/if}
</div>
