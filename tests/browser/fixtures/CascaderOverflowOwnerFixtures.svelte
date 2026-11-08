<script lang="ts">
  import { Cascader, ConfigProvider } from 'antd-svelte';

  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'locked', label: 'Locked', disabled: true },
    { value: 0, label: 'Zero' },
    { value: 'z', label: 'Zeta' }
  ];
</script>

{#snippet summary()}
  <input aria-label="Cascader summary field" value={'x'.repeat(100)} style="width:120px" />
{/snippet}

<section id="cascader-overflow-owner-fixture" aria-label="Cascader overflow ownership">
  <ConfigProvider theme={{ token: { motion: false } }}>
    <Cascader {options} multiple value={options.map(option => [option.value])}
      maxTagCount="responsive" maxTagPlaceholder={summary}
      aria-label="Owned Cascader" style="width:400px" />
  </ConfigProvider>
</section>
