<script lang="ts">
  import { Carousel, type CarouselProps } from 'antd-svelte';

  let { id, placement = 'bottom', priority = false }: {
    id: string;
    placement?: CarouselProps['dotPlacement'];
    priority?: boolean;
  } = $props();
</script>

{#snippet content()}
  <div style="height:120px"><input aria-label="Carousel theme draft" value="Draft" /></div>
{/snippet}
<!-- Source ConfigProvider не создаёт dir-wrapper; задаём одинаковое наследование в обоих стендах. -->
<div data-carousel-theme={id} dir="ltr" style="width:360px">
  <Carousel arrows speed={0} dotPlacement={placement}
    items={[1, 2, 3, 4].map(key => ({ key, children: content }))}
    style={priority ? '--ant-carousel-dot-width:35px;--ant-carousel-dot-active-width:55px;--ant-carousel-arrow-size:31px' : undefined} />
</div>
