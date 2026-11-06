<script lang="ts">
  import { ConfigProvider, type GetTargetContainer } from 'antd-svelte';
  import TargetContainerControl from './TargetContainerControl.svelte';

  let { sample, mounted = true, override, getTargetContainer }: {
    sample: { name: string; target?: string; };
    mounted?: boolean;
    override?: 'a' | 'b' | 'window';
    getTargetContainer?: GetTargetContainer;
  } = $props();
  let first = $state<HTMLDivElement>();
  let second = $state<HTMLDivElement>();
  let selected = $derived.by<'a' | 'b' | 'window' | undefined>(() => {
    const name = override ?? sample.target;
    if (name !== undefined && name !== 'a' && name !== 'b' && name !== 'window') {
      throw new Error(`Unknown target name: ${name}`);
    }
    return name;
  });
  function resolve(name: 'a' | 'b' | 'window') {
    return name === 'window' ? window : (name === 'a' ? first : second) ?? window;
  }
  let common = $derived<GetTargetContainer | undefined>(selected
    ? () => resolve(selected!) : undefined);
</script>

<div style="min-height:2700px">
  {#if mounted}
    <ConfigProvider theme={{ token: { motion: false } }}
      getTargetContainer={getTargetContainer ?? common}>
      <TargetContainerControl id="normal" target={selected ?? 'window'} index={0} {resolve} />
      <ConfigProvider getTargetContainer={undefined}>
        <TargetContainerControl id="inherited" target={selected ?? 'window'} index={1} {resolve} />
      </ConfigProvider>
      <ConfigProvider getTargetContainer={() => resolve('b')}>
        <TargetContainerControl id="nested" target="b" index={2} {resolve} />
      </ConfigProvider>
      <TargetContainerControl id="explicit" target="a" index={3} {resolve} explicit />
    </ConfigProvider>
  {/if}
  <ConfigProvider theme={{ token: { motion: false } }}>
    <TargetContainerControl id="outside" target="window" index={4} {resolve} />
  </ConfigProvider>
  <div id="target-a" bind:this={first}
    style="position:absolute;top:500px;width:240px;height:120px;overflow:auto">
    <section id="a-1" style="height:160px">A one</section>
    <section id="a-2" style="height:240px">A two</section>
  </div>
  <div id="target-b" bind:this={second}
    style="position:absolute;top:800px;width:240px;height:120px;overflow:auto">
    <section id="b-1" style="height:160px">B one</section>
    <section id="b-2" style="height:240px">B two</section>
  </div>
  <section id="window-1" style="position:absolute;top:1600px;height:240px">Window one</section>
  <section id="window-2" style="position:absolute;top:1900px;height:240px">Window two</section>
</div>
