<script lang="ts">
  import { ConfigProvider, Listy, theme,
    type ThemeConfig } from 'antd-svelte';
  import reference from './ant-design-list-links-reference.json';

  let preset = $state('default');
  let source = $state(true);
  let mounted = $state(true);
  let clicks = $state(0);
  let sample = $derived(reference.cases.find(item => item.name === preset)!);
  const items = [{ id: 'one' }];
  let configured = $derived<ThemeConfig>({
    mode: sample.dark ? 'dark' : 'light',
    primary: 'blue',
    compact: sample.compact,
    ...(source ? {
      cssVar: { prefix: sample.prefix },
      algorithm: sample.dark ? [theme.darkAlgorithm]
        : sample.compact ? [theme.defaultAlgorithm, theme.compactAlgorithm] : undefined,
      token: { motion: false, ...(sample.custom ? {
        colorPrimary: '#52c41a', colorLink: '#cf1322', colorLinkHover: '#fa541c',
        colorLinkActive: '#722ed1', linkDecoration: 'overline',
        linkHoverDecoration: 'underline', linkFocusDecoration: 'line-through'
      } : {}) }
    } : {})
  });
  let rootStyle = $derived(sample.variables ? [
    `--${sample.prefix}-link-decoration:overline`,
    `--${sample.prefix}-link-hover-decoration:underline`,
    `--${sample.prefix}-link-focus-decoration:line-through`,
    `--${sample.prefix}-color-link:#d4380d`,
    `--${sample.prefix}-color-link-hover:#389e0d`,
    `--${sample.prefix}-color-link-active:#531dab`
  ].join(';') : undefined);
  let inlineStyle = $derived(sample.inline ? 'text-decoration:underline;color:rgb(0,128,0)' : undefined);
</script>

<section id="list-links-fixture">
  <h2>Listy links</h2>
  <select aria-label="List links preset" bind:value={preset}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select>
  <label><input type="checkbox" bind:checked={source} /> Source list links</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount list links</label>
  <button type="button" onclick={() => { preset = 'custom'; }}>Update list link tokens</button>
  <ConfigProvider theme={configured} direction={sample.rtl ? 'rtl' : 'ltr'}>
    {#if mounted}
      <div style="width:600px;max-width:90vw;margin:40px" dir={sample.rtl ? 'rtl' : 'ltr'}>
        <Listy style={rootStyle} {items} rowKey="id" virtual={false}>
          {#snippet itemRender()}<a id="list-link-row" href="#row" style={inlineStyle}
            onclick={() => clicks++}>Row link</a>{/snippet}
        </Listy>
      </div>
    {/if}
    <a id="outside-list-links" href="#outside">Outside link</a>
  </ConfigProvider>
  <output aria-label="List link clicks">{clicks}</output>
</section>
