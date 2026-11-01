<script lang="ts">
  import { ConfigProvider, InputNumber } from 'antd-svelte';
</script>

<ConfigProvider direction="rtl" componentSize="small" inputNumber={{
  class: 'number-config',
  classNames: { prefix: 'number-config-prefix', input: 'number-config-input' },
  style: 'color:red',
  styles: { root: 'color:blue' },
  variant: 'filled'
}}>
  <InputNumber defaultValue={1} prefix="USD" suffix="kg" mode="spinner"
    classNames={info => ({ root: `number-local-${info.props.size}`, action: 'number-action' })}
    styles={{ root: 'color:green', suffix: 'color:purple' }} style="color:orange" />
</ConfigProvider>
