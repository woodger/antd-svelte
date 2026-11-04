<script lang="ts">
  import SkeletonMainCase from './SkeletonMainCase.svelte';
  import type { SkeletonMainSample } from './SkeletonMainCase.svelte';
  import reference from './ant-design-skeleton-main-reference.json';

  let selected = $state('default');
  let loading = $state<boolean>();
  let prefix = $state<string>();
  let mounted = $state(true);
  let configured = $state(false);
  let active = $state(false);
  let themed = $state(false);
  let rtl = $state(false);
  let sample = $derived.by((): SkeletonMainSample => {
    const original = reference.cases.find(item => item.name === selected)! as SkeletonMainSample;

    return {
      ...original,
      ...(configured ? { provider: true, functionalProvider: true, local: true } : {}),
      ...(themed ? { theme: 'own' } : {}),
      ...(rtl ? { rtl: true } : {}),
      props: {
        ...original.props,
        ...(loading === undefined ? {} : { loading }),
        ...(prefix === undefined ? {} : { prefixCls: prefix }),
        ...(active ? { active: true } : {})
      }
    };
  });

  function reset() {
    loading = undefined;
    prefix = undefined;
    mounted = true;
    configured = false;
    active = false;
    themed = false;
    rtl = false;
  }
</script>

<section id="skeleton-main-fixture">
  <h2>Source Skeleton main API</h2>
  <label>Skeleton main case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => loading = false}>Ready main Skeleton</button>
  <button type="button" onclick={() => loading = true}>Load main Skeleton</button>
  <button type="button" onclick={() => prefix = 'live-skeleton'}>Change main Skeleton prefix</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle main Skeleton mount</button>
  <button type="button" onclick={() => configured = !configured}>Toggle main Skeleton config</button>
  <button type="button" onclick={() => active = !active}>Activate main Skeleton</button>
  <button type="button" onclick={() => themed = !themed}>Theme main Skeleton</button>
  <button type="button" onclick={() => rtl = !rtl}>RTL main Skeleton</button>
  <input aria-label="Skeleton main outside draft" value="Draft" />
  <button type="button">Before main Skeleton</button>
  {#key selected}<SkeletonMainCase {sample} {mounted} />{/key}
  <button type="button">After main Skeleton</button>
</section>
