<script lang="ts">
  import { Anchor, ConfigProvider, type AnchorItem } from 'antd-svelte';

  let container = $state<HTMLDivElement>();
  let horizontal = $state(true);
  let compact = $state(false);
  let dark = $state(false);
  let clicks = $state(0);
  let changed = $state('');
  const items: AnchorItem[] = [
    { key: 'overview', href: '#spacing-overview', title: 'Описание' },
    {
      key: 'delivery', href: '#spacing-delivery', title: 'Доставка',
      children: [{ key: 'details', href: '#spacing-details', title: 'Условия доставки' }]
    },
    { key: 'payment', href: '#spacing-payment', title: 'Оплата' }
  ];
</script>

<section id="anchor-spacing-fixture">
  <h2>Anchor link spacing</h2>
  <label><input type="checkbox" bind:checked={horizontal} /> Horizontal spacing Anchor</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact spacing Anchor</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark spacing Anchor</label>
  <ConfigProvider theme={{ compact, mode: dark ? 'dark' : 'light' }}>
    <div style="width:min(100%,320px)">
      <Anchor id="spacing-anchor" {items} affix={false} showInkInFixed
        direction={horizontal ? 'horizontal' : 'vertical'} getContainer={() => container!}
        onClick={() => clicks++} onChange={value => { changed = value; }} />
    </div>
    <div bind:this={container} id="spacing-scroll" style="height:200px;overflow:auto">
      <div id="spacing-overview" style="height:200px">Описание</div>
      <div id="spacing-delivery" style="height:200px">Доставка</div>
      <div id="spacing-details" style="height:200px">Условия доставки</div>
      <div id="spacing-payment" style="height:600px">Оплата</div>
    </div>
  </ConfigProvider>
  <output aria-label="Spacing Anchor clicks">{clicks}</output>
  <output aria-label="Spacing Anchor changes">{changed}</output>
</section>
