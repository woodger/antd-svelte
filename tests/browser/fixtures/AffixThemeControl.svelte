<script lang="ts">
  import { Affix, type AffixUpdatePosition } from 'antd-svelte';

  let { id, prefixCls, style }: { id: string; prefixCls?: string; style?: string; } = $props();
  let container = $state<HTMLDivElement>();
  let nativeElement = $state<HTMLDivElement>();
  let instance = $state<{ updatePosition: AffixUpdatePosition }>();
  let changes = $state<boolean[]>([]);
</script>

<div data-affix-theme={id}>
  <div data-affix-scroll bind:this={container}
    style="width:260px;height:100px;overflow:auto;font:14px/20px monospace;color:#17292b">
    <div style="height:40px"></div>
    <Affix {prefixCls} class="theme-affix" rootClassName="theme-affix-fixed" bind:nativeElement
      bind:this={instance} target={() => container ?? null} offsetTop={5}
      style={[
        id === 'style' ? '--ant-font-size:28px;--ant-affix-z-index-popup:444' : undefined,
        style
      ].filter(Boolean).join(';') || undefined}
      onChange={value => changes = [...changes, Boolean(value)]}>
      <div style="height:32px">
        <input aria-label={`Affix themed draft ${id}`} name={`affix-${id}`} value="Draft" />
      </div>
    </Affix>
    <div style="height:200px"></div>
  </div>
  <button type="button" onclick={() => instance?.updatePosition()}>Refresh themed Affix {id}</button>
  <output aria-label={`Affix theme changes ${id}`}>{JSON.stringify(changes)}</output>
  <output aria-label={`Affix theme ref ${id}`}>{nativeElement ? 'mounted' : 'empty'}</output>
</div>
