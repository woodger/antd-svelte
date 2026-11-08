<script lang="ts">
  import { App, ConfigProvider, type AppProps } from 'antd-svelte';
  import AppConsumer from './AppConsumer.svelte';
  let { component = 'main' }: Pick<AppProps, 'component'> = $props();
</script>

<ConfigProvider app={{ class: 'context-app', style: 'color:#abcdef;padding:5px' }}
  theme={{ cssVar: {}, components: { App: { fontSize: 20, lineHeight: 2 } } }}>
  <App {component} class="local-app" rootClassName="root-app" style="padding:7px"
    id="ssr-app" aria-label="SSR application">
    <AppConsumer />
  </App>
</ConfigProvider>
