<script lang="ts">
  import BasicFixtures from './BasicFixtures.svelte';
  import { createControls } from './controls.model.svelte';

  const controls = createControls();
</script>

<section id="input-select-fixture" aria-label="Shared Input and Select fixture">
  <BasicFixtures kind="input" {controls} rootIdPrefix="input-select-" />
  <BasicFixtures kind="select" {controls} rootIdPrefix="input-select-" />
  <BasicFixtures kind="select-numeric" {controls} rootIdPrefix="input-select-" />
</section>
