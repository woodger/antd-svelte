<script lang="ts">
  import { ConfigProvider, ColorPicker, enUS } from 'antd-svelte';
</script>

<ConfigProvider locale={enUS} direction="rtl" componentSize="large"
  colorPicker={{ class: 'provider-color', style: 'color:red',
    classNames: { body: 'provider-body', popup: { root: 'provider-popup' } },
    styles: { root: 'color:blue' } }}>
  <ColorPicker value="#1677ff80" showText open format="rgb" mode={['single', 'gradient']}
    styles={{ root: 'color:green', popup: { root: 'color:purple' } }} style="color:orange"
    classNames={info => ({ root: `local-${info.props.size}`, description: 'local-description' })} />
</ConfigProvider>
