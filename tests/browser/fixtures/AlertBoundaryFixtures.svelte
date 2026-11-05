<script lang="ts">
  import AlertBoundaryCase from './AlertBoundaryCase.svelte';
  import type { AlertBoundarySample } from './AlertBoundaryCase.svelte';
  import reference from './ant-design-alert-boundary-reference.json';

  let selected = $state('healthy');
  let healthy = $state<boolean>();
  let title = $state<string>();
  let mounted = $state(true);
  let configured = $state(false);
  let nested = $state(false);
  let badFallback = $state(false);
  let sample = $derived.by((): AlertBoundarySample => {
    const original = reference.cases.find(item => item.name === selected)! as AlertBoundarySample;

    return {
      ...original,
      ...(healthy === undefined ? {} : { healthy }),
      props: { ...original.props, ...(title === undefined ? {} : {
        title, id: 'updated-boundary'
      }) }
    };
  });

  function reset() {
    healthy = undefined;
    title = undefined;
    mounted = true;
    configured = false;
    nested = false;
    badFallback = false;
  }
</script>

<section id="alert-boundary-fixture">
  <h2>Source Alert ErrorBoundary API</h2>
  <label>Alert boundary case<select bind:value={selected} onchange={reset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => healthy = false}>Fail boundary child</button>
  <button type="button" onclick={() => healthy = true}>Recover boundary child</button>
  <button type="button" onclick={() => title = 'Updated title'}>Update boundary title</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle boundary mount</button>
  <button type="button" onclick={() => configured = !configured}>Configure boundary Alert</button>
  <button type="button" onclick={() => { nested = true; badFallback = true; }}>
    Fail nested boundary fallback
  </button>
  {#key selected}<AlertBoundaryCase {sample} {mounted} {configured} {nested} {badFallback} />{/key}
</section>
