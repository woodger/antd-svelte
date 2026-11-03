<script lang="ts">
  import { Avatar, ConfigProvider } from 'antd-svelte';
  import AvatarApiCase from './AvatarApiCase.svelte';
  import reference from './ant-design-avatar-prefix-reference.json';
  import type { AvatarApiCase as Sample } from './avatar-api-presets';

  let name = $state(reference.cases[0].name);
  let changed = $state(false);
  let mounted = $state(true);
  let sample = $derived(reference.cases.find(sample => sample.name === name)! as Sample);
</script>

<section id="avatar-prefix-fixture">
  <h2>Avatar local prefixes</h2>
  <label>Avatar prefix reference <select bind:value={name} onchange={() => {
    changed = false;
    mounted = true;
  }}>
    {#each reference.cases as sample}<option value={sample.name}>{sample.name}</option>{/each}
  </select></label>
  <button type="button" onclick={() => changed = !changed}>Change Avatar prefix props</button>
  <button type="button" onclick={() => mounted = !mounted}>Toggle prefix Avatar</button>
  {#if mounted}{#key name}<AvatarApiCase {sample} {changed} />{/key}{/if}
  <ConfigProvider theme={{
    token: { motion: false }, components: { Avatar: { textFontSize: 23, containerSize: 44 } }
  }}><Avatar alt="Default neighbor" data-avatar-prefix-neighbor="">DEF</Avatar></ConfigProvider>
  <Avatar prefixCls="sibling-avatar" alt="Sibling prefix">SIB</Avatar>
</section>
