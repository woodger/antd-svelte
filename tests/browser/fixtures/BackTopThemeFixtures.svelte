<script lang="ts">
  import reference from './ant-design-back-top-theme-reference.json';
  import BackTopThemeCase from './BackTopThemeCase.svelte';

  let name = $state(reference.cases[0].name);
  let mode = $state('normal');
  let updated = $state(false);
  let mounted = $state(true);
  let sample = $derived(reference.cases.find(item => item.name === name) ?? reference.cases[0]);
</script>

<section id="back-top-theme-fixture" aria-label="BackTop theme fixture">
  <label>BackTop theme preset<select aria-label="BackTop theme preset" bind:value={name}>
      {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
    </select></label>
  <label>BackTop theme mode<select aria-label="BackTop theme mode" bind:value={mode}>
      {#each Object.keys(sample.states) as item}<option value={item}>{item}</option>{/each}
    </select></label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount BackTop theme</label>
  <button type="button" onclick={() => { updated = !updated; }}>Update BackTop theme tokens</button>
  <BackTopThemeCase {sample} {mode} {updated} {mounted} />
</section>
