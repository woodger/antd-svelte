<script lang="ts">
  import { ConfigProvider, Menu, type MenuMode } from 'antd-svelte';

  let source = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let custom = $state(false);
  let inline = $state(false);
  let rtl = $state(false);
  let mode = $state<MenuMode>('horizontal');
  let target = $state('native');
  let selected = $state<string[]>([]);
  let clicks = $state<string[]>([]);
  let shadow = $state<ShadowRoot>();
  let variables = $derived(custom
    ? '--ant-link-decoration:overline;--ant-link-hover-decoration:underline;--ant-link-focus-decoration:line-through'
    : undefined);
  let linkStyle = $derived(inline ? 'text-decoration:underline' : undefined);
  let theme = $derived({
    mode: dark ? 'dark' as const : 'light' as const,
    primary: 'blue' as const,
    compact,
    ...(source ? {
      cssVar: {},
      token: {
        colorPrimary: '#fa8c16',
        ...(custom ? {
          linkDecoration: 'overline',
          linkHoverDecoration: 'underline',
          linkFocusDecoration: 'line-through'
        } : {})
      }
    } : {})
  });

  function getContainer() {
    return target === 'shadow' ? shadow ?? document.body : document.body;
  }

  function shadowStyles(node: HTMLElement) {
    const root = node.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    root.append(style);
    function sync() {
      const css = [...document.head.querySelectorAll('style')].map(node => node.textContent).join('\n');
      if (style.textContent !== css) style.textContent = css;
    }
    const observer = new MutationObserver(sync);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    sync();
    shadow = root;
    return () => observer.disconnect();
  }
</script>

{#snippet regular()}<a href="#reports" style={linkStyle}>Regular link</a>{/snippet}
{#snippet nested()}<a href="#nested" style={linkStyle}>Nested link</a>{/snippet}
{#snippet group()}<a href="#group" style={linkStyle}>Group link</a>{/snippet}
<section id="menu-link-decoration-fixture">
  <h2>Menu link decoration</h2>
  <label><input type="checkbox" bind:checked={source} /> Source Menu links</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Menu links</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Menu links</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Menu link decorations</label>
  <label><input type="checkbox" bind:checked={inline} /> Inline Menu link decoration</label>
  <label><input type="checkbox" bind:checked={rtl} /> RTL Menu links</label>
  <select aria-label="Menu link mode" bind:value={mode}>
    <option value="horizontal">horizontal</option>
    <option value="inline">inline</option>
    <option value="vertical">vertical</option>
  </select>
  <select aria-label="Menu link container" bind:value={target}>
    <option value="native">native</option>
    <option value="body">body</option>
    <option value="shadow">shadow</option>
  </select>
  <div id="menu-link-shadow" {@attach shadowStyles}></div>
  <ConfigProvider {theme} direction={rtl ? 'rtl' : 'ltr'}>
    <div style="width:700px;max-width:90vw;margin:80px 40px">
      <Menu {mode} theme={dark ? 'dark' : 'light'}
        aria-label="Decoration Menu" class="decoration-menu" style={variables}
        getPopupContainer={target === 'native' ? undefined : getContainer}
        defaultOpenKeys={['parent']} triggerSubMenuAction="click"
        subMenuOpenDelay={0} subMenuCloseDelay={0}
        items={[
          { key: 'regular', label: regular },
          { key: 'parent', label: 'More', children: [{ key: 'nested', label: nested }] },
          {
            key: 'group',
            type: 'group',
            label: group,
            children: [{ key: 'child', label: 'Group child' }]
          }
        ]}
        onSelect={info => selected = [...info.selectedKeys]}
        onDeselect={info => selected = [...info.selectedKeys]}
        onClick={info => clicks.push(info.key)} />
      <a id="outside-menu-decoration" href="#outside">Outside Menu link</a>
    </div>
  </ConfigProvider>
  <output aria-label="Menu link selected">{JSON.stringify(selected)}</output>
  <output aria-label="Menu link clicks">{JSON.stringify(clicks)}</output>
  <section id="reports">Reports target</section>
  <section id="nested">Nested target</section>
  <section id="group">Group target</section>
</section>
