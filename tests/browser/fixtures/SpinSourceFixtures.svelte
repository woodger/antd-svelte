<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Spin } from 'antd-svelte';
  import SpinSourceCase from './SpinSourceCase.svelte';
  import SpinThemeScopes from './SpinThemeScopes.svelte';
  import type { SpinSourceSample } from './SpinSourceCase.svelte';
  import reference from './ant-design-spin-source-reference.json';

  let selected = $state('default');
  let scopes = $state(false);
  let revision = $state(0);
  let percent = $state<number | 'auto'>();
  let fullscreen = $state<boolean>();
  let spinning = $state<boolean>();
  let delay = $state<number>();
  let prefix = $state<string>();
  let tokenSize = $state<number>();
  let mounted = $state(true);
  let globalName = $state<string>();
  let sample = $derived.by((): SpinSourceSample => {
    const source = reference.cases.find(item => item.name === selected)! as SpinSourceSample;
    return { ...source, props: { ...source.props,
      ...(percent === undefined ? {} : { percent }),
      ...(fullscreen === undefined ? {} : { fullscreen }),
      ...(spinning === undefined ? {} : { spinning }),
      ...(delay === undefined ? {} : { delay }),
      ...(prefix === undefined ? {} : { prefixCls: prefix }),
      'data-revision': revision
    } };
  });
  function reset() {
    revision = 0;
    percent = undefined;
    fullscreen = undefined;
    spinning = undefined;
    delay = undefined;
    prefix = undefined;
    tokenSize = undefined;
    mounted = true;
    globalName = undefined;
    Spin.setDefaultIndicator(null);
  }
  onDestroy(() => Spin.setDefaultIndicator(null));
</script>

<section id="spin-source-fixture">
  <h2>Source Spin</h2>
  <label>Spin source case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => percent = 'auto'}>Auto Spin percent</button>
  <button type="button" onclick={() => percent = 0}>Zero Spin percent</button>
  <button type="button" onclick={() => percent = 25}>Quarter Spin percent</button>
  <button type="button" onclick={() => percent = 150}>Overflow Spin percent</button>
  <button type="button" onclick={() => spinning = false}>Stop source Spin</button>
  <button type="button" onclick={() => spinning = true}>Start source Spin</button>
  <button type="button" onclick={() => delay = 500}>Delay source Spin</button>
  <button type="button" onclick={() => fullscreen = !fullscreen}>Toggle source fullscreen</button>
  <button type="button" onclick={() => prefix = prefix ? '' : 'live-spin'}>Change Spin prefix</button>
  <button type="button" onclick={() => tokenSize = 34}>Change Spin token</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle source Spin mount</button>
  <button type="button" onclick={() => globalName = 'replacement'}>Set global Spin indicator</button>
  <button type="button" onclick={() => revision++}>Refresh Spin props</button>
  <label><input type="checkbox" bind:checked={scopes} /> Show Spin scopes</label>
  <input aria-label="Spin source outside" value="Outside" />
  <button type="button">Before source Spin</button>
  {#key selected}<SpinSourceCase {sample} {tokenSize} {mounted} {globalName} />{/key}
  <button type="button">After source Spin</button>
  {#if scopes}<SpinThemeScopes {tokenSize} />{/if}
</section>
