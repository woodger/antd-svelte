<script lang="ts">
  import reference from './ant-design-directory-tree-reference.json';
  import DirectoryTreeScope from './DirectoryTreeScope.svelte';
  let selected = $state(0);
</script>

<section id="directory-tree-fixture">
  <label>Directory sample<select bind:value={selected}>
    {#each reference.cases as entry, index}<option value={index}>{entry.sample.id}</option>{/each}
  </select></label>
  {#key selected}<DirectoryTreeScope sample={reference.cases[selected].sample} />{/key}
</section>
