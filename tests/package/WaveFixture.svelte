<script lang="ts">
  import { Button, Checkbox, ConfigProvider, Radio, Steps, Switch, Tag,
    type WaveConfig } from 'antd-svelte';
  let { wave }: { wave?: WaveConfig; } = $props();
</script>

<ConfigProvider {wave} theme={{ token: { colorPrimary: '#00b96b' } }}>
  <Button id="ssr-wave-button">SSR wave button</Button>
  <Checkbox name="ssr-check" defaultChecked>SSR wave checkbox</Checkbox>
  <Radio name="ssr-radio" defaultChecked>SSR wave radio</Radio>
  <Switch name="ssr-switch" defaultChecked aria-label="SSR wave switch" />
  <Steps items={[{ title: 'SSR step' }]} onChange={() => {}} />
  <Tag onClick={() => {}}>SSR wave tag</Tag>
</ConfigProvider>
