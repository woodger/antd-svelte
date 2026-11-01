<script lang="ts">
  import { ConfigProvider, Switch } from 'antd-svelte';
</script>

{#snippet rich()}<strong>Rich ON</strong>{/snippet}

<ConfigProvider componentSize="small" switch={{
  class: 'switch-context',
  style: 'color:red',
  classNames: info => ({
    root: `context-${info.props.size}-${info.props.checked}`,
    content: 'context-content',
    indicator: 'context-indicator'
  }),
  styles: { root: 'color:blue', content: 'color:purple', indicator: 'outline:1px solid red' }
}}>
  <Switch defaultValue checkedChildren={rich} unCheckedChildren={0} name="source"
    style="color:orange" styles={{ root: 'color:green', indicator: 'width:20px' }}
    classNames={{ root: 'local-root', content: 'local-content', indicator: 'local-indicator' }} />
  <ConfigProvider><Switch aria-label="Inherited config" /></ConfigProvider>
</ConfigProvider>
