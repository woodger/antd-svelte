<script lang="ts">
  import {
    ConfigProvider,
    Segmented,
    type SegmentedSemanticInfo,
    type SegmentedValue
  } from 'antd-svelte';

  let { emptyStyle = false }: { emptyStyle?: boolean; } = $props();

  function classes<Value extends SegmentedValue>({ props }: SegmentedSemanticInfo<Value>) {
    return { root: [
      `native-name-${Boolean(props.name)}`,
      `native-disabled-${String(props.disabled)}`,
      `native-block-${String(props.block)}`,
      `native-vertical-${String(props.vertical)}`,
      `native-size-${String(props.size)}`,
      `native-shape-${String(props.shape)}`
    ].join(' ') };
  }
</script>

<ConfigProvider componentSize="large" segmented={{ classNames: classes }}>
  <Segmented options={[0, 1]} classNames={classes} styles={emptyStyle ? { item: '' } : undefined} />
</ConfigProvider>
