<script lang="ts">
  import reference from './ant-design-avatar-responsive-reference.json';
  import AvatarResponsiveCase from './AvatarResponsiveCase.svelte';
  import type { AvatarResponsiveCase as Sample } from './avatar-responsive-presets';
  let name = $state(reference.cases[0].name);
  let sample = $derived((name === 'lifecycle' ? reference.lifecycle.sample
    : reference.cases.find(sample => sample.name === name)!) as Sample);
  let mode = $state<'case' | 'numeric' | 'empty' | 'new-map'>('case');
  let shifted = $state(false);
  let dark = $state(false);
  let mounted = $state(true);
  let text = $state('AVATAR');
</script>

<section id="avatar-responsive-fixture">
  <h2>Avatar responsive sizes</h2>
  <label>Avatar size reference <select aria-label="Avatar size reference" bind:value={name}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
    <option value="lifecycle">lifecycle</option>
  </select></label>
  <label>Avatar responsive mode <select aria-label="Avatar responsive mode" bind:value={mode}>
    <option value="case">Reference</option><option value="numeric">Numeric</option>
    <option value="empty">Empty</option><option value="new-map">New map</option>
  </select></label>
  <label><input type="checkbox" bind:checked={shifted} /> Shift avatar breakpoint</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark responsive avatar</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount responsive avatar</label>
  <label>Responsive avatar text <input aria-label="Responsive avatar text" bind:value={text} /></label>
  {#if mounted}
    {#key name}<AvatarResponsiveCase {sample} {mode} {shifted} {dark} {text} />{/key}
  {/if}
</section>
