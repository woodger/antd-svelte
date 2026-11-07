<script lang="ts">
  import { Anchor, Breadcrumb, ConfigProvider } from 'antd-svelte';

  let source = $state(false);
  let custom = $state(false);
  let inline = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let clicks = $state(0);
  let themeConfig = $derived({
    mode: dark ? 'dark' as const : 'light' as const,
    primary: 'blue' as const,
    compact,
    ...(source ? { cssVar: {} } : {})
  });
  let variables = $derived(custom
    ? '--ant-link-decoration:overline;--ant-link-hover-decoration:underline;--ant-link-focus-decoration:line-through'
    : undefined);
</script>

<section id="link-decoration-fixture">
  <h2>Navigation link decoration</h2>
  <label><input type="checkbox" bind:checked={source} /> Source link theme</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom link decorations</label>
  <label><input type="checkbox" bind:checked={inline} /> Inline link decoration</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark link theme</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact link theme</label>
  <ConfigProvider theme={themeConfig}>
    <Anchor class="decoration-anchor" affix={false} style={variables}
      styles={inline ? { itemTitle: 'text-decoration:underline' } : undefined}
      onClick={event => {
        event.preventDefault();
        clicks++;
      }}
      items={[{ key: 'link', href: '#decoration-target', title: 'Anchor link' }]} />
    <Breadcrumb aria-label="Decoration Breadcrumb" class="decoration-breadcrumb" style={variables}
      items={[
        { key: 'plain', title: 'Breadcrumb link', href: '#decoration-target',
          onClick: event => {
            event.preventDefault();
            clicks++;
          } },
        { key: 'menu', title: 'Breadcrumb menu link', href: '#decoration-target',
          onClick: event => {
            event.preventDefault();
            clicks++;
          },
          menu: { items: [{ key: 'one', label: 'Menu choice', path: '/one' }] } },
        { key: 'last', title: 'Current page' }
      ]} />
    <Breadcrumb aria-label="Custom decoration Breadcrumb" style={variables}
      items={[{ key: 'custom', title: 'Custom Breadcrumb link', href: '#decoration-target' }]}>
      {#snippet itemRender(item)}<a href={item.href}
        style={inline ? 'text-decoration:underline' : undefined}
        onclick={event => {
          event.preventDefault();
          clicks++;
        }}>{item.title}</a>{/snippet}
    </Breadcrumb>
    <a id="outside-decoration" href="#decoration-target">Outside link</a>
  </ConfigProvider>
  <div id="decoration-target">Destination</div>
  <output aria-label="Decoration clicks">{clicks}</output>
</section>
