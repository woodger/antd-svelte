<script lang="ts">
  import { ConfigProvider, Divider, type DividerConfig, type DividerProps } from 'antd-svelte';

  let nativeElement = $state<HTMLDivElement>();
  const divider: DividerConfig = {
    class: 'configured-divider',
    classNames: ({ props }) => props.orientation === 'horizontal' ? { root: 'horizontal' } : undefined,
    styles: ({ props }) => props.size === 'small' ? { content: 'padding-inline:4px' } : undefined
  };
  const props: DividerProps = { prefixCls: 'custom-divider', children: 'Title' };
</script>

<ConfigProvider {divider}><Divider {...props} bind:nativeElement /></ConfigProvider>
<output>{nativeElement?.tagName}</output>
