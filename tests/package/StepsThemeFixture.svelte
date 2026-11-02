<script lang="ts">
  import { ConfigProvider, Steps, Timeline } from 'antd-svelte';
  import { stepsThemePresets } from '../browser/fixtures/steps-theme-presets';

  let { preset = 'default', native = false, semantic = false }: {
    preset?: string;
    native?: boolean;
    semantic?: boolean;
  } = $props();
  const browserOnly = () => { throw new Error('browser only'); };
</script>

<ConfigProvider theme={native ? { compact: true } : {
  ...stepsThemePresets[preset],
  cssVar: { ...stepsThemePresets[preset].cssVar, key: 'steps-ssr' }
}}>
  <Steps current={1} onChange={browserOnly} items={[
    { key: 'one', title: 'First', content: 'First content' },
    { key: 'two', title: 'Second', content: 'Second content' }
  ]}
    styles={semantic ? { root: '--ant-steps-icon-size:41px' } : undefined}
    style={semantic ? '--ant-steps-icon-size:47px' : undefined} />
  <Timeline items={[
    { key: 'one', title: 'First', content: 'First event' },
    { key: 'two', title: 'Second', content: 'Second event' }
  ]}
    styles={semantic ? { root: '--ant-timeline-dot-size:21px' } : undefined}
    style={semantic ? '--ant-timeline-dot-size:27px' : undefined} />
</ConfigProvider>
