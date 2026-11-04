<script lang="ts">
  import SkeletonElementCase from './SkeletonElementCase.svelte';
  import type { SkeletonElementSample } from './SkeletonElementCase.svelte';
  import reference from './ant-design-skeleton-element-reference.json';

  let selected = $state('avatar-default');
  let active = $state(false);
  let block = $state(false);
  let size = $state<SkeletonElementSample['contextSize']>();
  let prefix = $state<string>();
  let ownTheme = $state(false);
  let mounted = $state(true);
  let interactive = $state(false);
  let sample = $derived.by((): SkeletonElementSample => {
    const source = reference.cases.find(item => item.name === selected)! as SkeletonElementSample;
    return {
      ...source,
      ...(interactive ? { interactive: true } : {}),
      ...(size ? { contextSize: size } : {}),
      ...(ownTheme ? { theme: 'own' } : {}),
      props: { ...source.props,
        ...(active ? { active: true } : {}),
        ...(block ? { block: true } : {}),
        ...(prefix ? { prefixCls: prefix } : {})
      }
    };
  });

  function reset() {
    active = false;
    block = false;
    size = undefined;
    prefix = undefined;
    ownTheme = false;
    mounted = true;
    interactive = false;
  }
</script>

<section id="skeleton-element-fixture">
  <h2>Source Skeleton elements</h2>
  <label>Skeleton element case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => active = true}>Activate Skeleton element</button>
  <button type="button" onclick={() => block = true}>Expand Skeleton element</button>
  <button type="button" onclick={() => size = 'small'}>Small Skeleton context</button>
  <button type="button" onclick={() => size = 'large'}>Large Skeleton context</button>
  <button type="button" onclick={() => prefix = 'live-skeleton'}>Change Skeleton prefix</button>
  <button type="button" onclick={() => ownTheme = true}>Theme Skeleton element</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle Skeleton element mount</button>
  <button type="button" onclick={() => interactive = true}>Interactive Skeleton node</button>
  <input aria-label="Skeleton element draft" value="Draft" />
  <button type="button">Before Skeleton element</button>
  {#key selected}<SkeletonElementCase {sample} {mounted} />{/key}
  <button type="button">After Skeleton element</button>
</section>
