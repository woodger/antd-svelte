<script lang="ts">
  import { Statistic, StatisticTimer, QRCode, Timeline, Steps } from 'antd-svelte';

  export interface WidgetPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
  }
  let { scope, sample, local = true }: {
    scope: string;
    sample: WidgetPrefixSample;
    local?: boolean;
  } = $props();

  function prefix(name: string) {
    return local && sample.local !== undefined
      ? sample.local ? `${sample.local}-${name}` : '' : undefined;
  }
</script>

<div data-feedback-prefix-scope={scope}>
  <div data-prefix-widget="statistic">
    <Statistic prefixCls={prefix('statistic')} title="Count" value={1024} />
  </div>
  <div data-prefix-widget="timer">
    <StatisticTimer prefixCls={prefix('statistic')} type="countdown" title="Timer"
      value={4102444800000} />
  </div>
  <div data-prefix-widget="qrcode">
    <QRCode prefixCls={prefix('qrcode')} type="svg" size={128} value="https://example.com" />
  </div>
  <div data-prefix-widget="timeline">
    <Timeline prefixCls={prefix('timeline')} items={[
      { title: 'Alpha', content: 'First' }, { title: 'Beta', content: 'Second' }
    ]} />
  </div>
  <div data-prefix-widget="steps">
    <Steps prefixCls={prefix('steps')} current={1} items={[
      { title: 'Alpha' }, { title: 'Beta' }, { title: 'Gamma' }
    ]} />
  </div>
  <input aria-label={`${scope} widget draft`} value="initial draft" />
</div>
