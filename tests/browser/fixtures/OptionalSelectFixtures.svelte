<script lang="ts">
  import { ConfigProvider, Select } from 'antd-svelte';

  let remote = $state(false);
  let tags = $state(['seed']);
  let remoteProps = $derived(remote ? {
    options: [{ value: 'seed', label: 'Loaded seed' }, { value: 'remote', label: 'Remote' }]
  } : {});
</script>

<section id="optional-select-fixture" aria-label="Select with omitted options">
  <label><input type="checkbox" bind:checked={remote} />Supply remote options</label>
  <ConfigProvider theme={{ token: { motion: false } }}>
    <form aria-label="Optional Select native form" onsubmit={event => event.preventDefault()}>
      <button type="reset">Reset optional Select</button>
      <Select defaultValue={0} name="single" aria-label="Single without options" />
      <Select mode="multiple" defaultValue={['kept']} name="multiple"
        aria-label="Multiple without options" allowClear />
      <div data-optional-tags>
        <Select {...remoteProps} mode="tags" bind:value={tags} defaultValue={['seed']}
          name="tags" aria-label="Tags without options" allowClear required />
      </div>
    </form>
  </ConfigProvider>
  <output aria-label="Optional tags values">{JSON.stringify(tags)}</output>
</section>
