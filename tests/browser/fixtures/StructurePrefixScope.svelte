<script lang="ts">
  import { Affix, Alert, Collapse } from 'antd-svelte';

  export interface StructurePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
  }
  let { scope, sample, local = true }: {
    scope: string;
    sample: StructurePrefixSample;
    local?: boolean;
  } = $props();
  let target = $state<HTMLDivElement>();

  function prefix(name: string) {
    return local && sample.local !== undefined
      ? sample.local ? `${sample.local}-${name}` : '' : undefined;
  }
</script>

{#snippet panelEditor()}<input aria-label={`${scope} panel draft`} value="panel draft" />{/snippet}
<div data-structure-prefix-scope={scope} style="width:480px">
  <div data-prefix-widget="affix">
    <div bind:this={target} data-affix-prefix-target style="height:80px;width:140px;overflow:auto">
      <div style="height:200px">
        <Affix prefixCls={prefix('affix')} offsetTop={0} target={() => target ?? null}>
          <div style="height:24px">Affixed</div>
        </Affix>
      </div>
    </div>
  </div>
  <div data-prefix-widget="alert">
    <Alert prefixCls={prefix('alert')} title="Notice" description="Details" showIcon />
  </div>
  <div data-prefix-widget="collapse">
    <Collapse prefixCls={prefix('collapse')} defaultActiveKey={['one']} items={[
      { key: 'one', label: 'First', children: panelEditor },
      { key: 'two', label: 'Second', children: 'Second panel' }
    ]} />
  </div>
  <input aria-label={`${scope} widget draft`} value="initial draft" />
</div>
