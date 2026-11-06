<script lang="ts">
  import { BorderBeam, ConfigProvider } from 'antd-svelte';

  let { id, priority, prefix = 'ant', prefixCls, externalTarget }: {
    id: string;
    priority?: boolean;
    prefix?: string;
    prefixCls?: string;
    externalTarget?: HTMLElement;
  } = $props();
  let host = $state<HTMLDivElement>();
  let target = $derived(id === 'external' ? externalTarget : host);
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} borderBeam={priority ? {
  style: '--ant-border-beam-line-width:5px;--ant-border-beam-size:70px;--ant-border-beam-duration:11s'
} : undefined}>
  <span hidden data-beam-owner={id}></span>
  {#if id !== 'external'}
    <div data-beam-theme={id} bind:this={host} dir={id === 'rtl' ? 'rtl' : 'ltr'}
      style="position:relative;box-sizing:border-box;width:300px;height:100px;border-style:solid;border-width:1px 2px 3px 4px;border-radius:12px">
      <input aria-label={`Beam themed draft ${id}`} value="Draft" />
    </div>
  {/if}
  <BorderBeam {target} {prefixCls} count={id === 'multiple' ? 3 : id === 'external' ? 2 : 1}
    color={id === 'explicit' ? '#389e0d' : undefined}
    duration={id === 'explicit' ? 9 : undefined}
    lineWidth={id === 'explicit' ? 7 : undefined}
    size={id === 'explicit' ? 80 : undefined}
    outset={id === 'explicit' ? 4 : undefined}
    style={[
      id === 'variable' && `--${prefix}-line-width:6px`,
      priority && '--ant-border-beam-line-width:6px;--ant-border-beam-size:90px;--ant-border-beam-duration:13s;--ant-border-beam-delay:0.8s'
    ].filter(Boolean).join(';')} />
</ConfigProvider>
