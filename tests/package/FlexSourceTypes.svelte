<script lang="ts">
  import {
    ConfigProvider,
    Flex,
    type FlexConfig,
    type FlexProps,
    type FlexComponentProps
  } from 'antd-svelte';
  import FlexCustomRoot from '../browser/fixtures/FlexCustomRoot.svelte';
  import FlexNoRefRoot from '../browser/fixtures/FlexNoRefRoot.svelte';

  let nativeElement = $state<HTMLElement>();
  const flex: FlexConfig = { vertical: true, class: ['provider-flex'], style: 'gap:12px' };
  const props: FlexComponentProps<{ label: string }> = {
    component: FlexCustomRoot, label: 'Typed root'
  };
  interface ExtendedProps extends FlexProps { tracking?: string; }
  const native: ExtendedProps = { component: 'section', tracking: 'legacy-interface' };
</script>

<ConfigProvider {flex}>
  <Flex {...props} bind:nativeElement><button type="button">Typed item</button></Flex>
  <Flex component={FlexCustomRoot} label="Inferred root" />
  <Flex component={FlexNoRefRoot} />
  <Flex {...native} />
</ConfigProvider>
<output>{nativeElement?.tagName}</output>
