<script lang="ts">
  import { Divider, Flex, Segmented } from 'antd-svelte';

  export interface CorePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
  }
  let { scope, sample, local = true }: {
    scope: string;
    sample: CorePrefixSample;
    local?: boolean;
  } = $props();
  let value = $state('beta');
  let changes = $state(0);

  function prefix(name: string) {
    return local && sample.local !== undefined
      ? sample.local ? `${sample.local}-${name}` : '' : undefined;
  }
</script>

<form data-core-prefix-scope={scope} style="width:480px"
  onsubmit={event => event.preventDefault()}>
  <div data-prefix-widget="divider">
    <Divider prefixCls={prefix('divider')} titlePlacement="start">Title</Divider>
  </div>
  <div data-prefix-widget="flex">
    <Flex prefixCls={prefix('flex')} gap="small" align="center">
      <span>Alpha</span><span>Beta</span>
    </Flex>
  </div>
  <div data-prefix-widget="segmented">
    <Segmented prefixCls={prefix('segmented')} name={`${scope}-segment`} bind:value
      options={[{ label: 'Alpha', value: 'alpha' }, { label: 'Beta', value: 'beta' }]}
      onChange={() => changes++} />
  </div>
  <output data-prefix-changes>{changes}</output>
  <input aria-label={`${scope} widget draft`} value="initial draft" />
</form>
