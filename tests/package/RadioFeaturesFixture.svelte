<script lang="ts">
  import { ConfigProvider, Radio, RadioGroup } from 'antd-svelte';
</script>

{#snippet richLabel()}<strong>Rich option</strong>{/snippet}

<ConfigProvider radio={{ class: 'config-radio', style: 'color:red',
  classNames: { root: 'config-root', icon: 'config-icon', label: 'config-label' },
  styles: { root: 'color:blue', icon: 'outline:1px solid red', label: 'color:purple' } }}>
  <Radio checked classNames={info => ({ root: `checked-${info.props.checked}`, label: 'local-label' })}
    styles={{ root: 'color:green', icon: 'opacity:.5' }} style="color:orange">Semantic Radio</Radio>
  <RadioGroup value={false} vertical options={[
    { value: false, label: richLabel, id: 'rich-option', title: 'Rich title', className: 'rich-class',
      style: 'color:green', required: true },
    { value: true, label: 'Other' }
  ]} />
</ConfigProvider>
