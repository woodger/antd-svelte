<script lang="ts">
  import { AvatarGroup, ConfigProvider } from 'antd-svelte';
  import type { AvatarGroupMaxCase as Sample, AvatarGroupMaxValues } from './avatar-group-max-presets';

  let { sample, changed = false }: { sample: Sample; changed?: boolean } = $props();
  let values = $derived<AvatarGroupMaxValues>({ ...sample, ...(changed ? sample.patch : {}) });
  const items = [
    { key: 'a', label: 'Alpha', text: 'A' },
    { key: 'b', label: 'Beta', text: 'B' },
    { key: 'c', label: 'Gamma', text: 'C' },
    { key: 'd', label: 'Delta', text: 'D' }
  ];
</script>

<ConfigProvider theme={{ token: { motion: false } }}>
  <div id="avatar-group-max-surface" style="margin:160px 200px">
    <AvatarGroup
      {items}
      max={values.max}
      maxCount={values.maxCount}
      maxStyle={values.maxStyle}
      maxPopoverPlacement={values.maxPopoverPlacement}
      maxPopoverTrigger={values.maxPopoverTrigger}
    />
  </div>
</ConfigProvider>
