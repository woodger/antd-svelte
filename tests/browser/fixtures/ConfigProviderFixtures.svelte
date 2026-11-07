<script lang="ts">
  import BasicFixtures from './BasicFixtures.svelte';
  import { createControls } from './controls.model.svelte';

  const controls = createControls();
</script>

<section id="config-provider-fixture" aria-label="ConfigProvider fixture">
  <BasicFixtures kind="select" {controls} rootIdPrefix="config-provider-" />
  <BasicFixtures kind="modal" {controls} rootIdPrefix="config-provider-" />
</section>
