<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import AnchorPrefixScope from './AnchorPrefixScope.svelte';
  import reference from './ant-design-anchor-prefix-reference.json';

  let selected = $state(reference.cases[0].sample.id as string);
  let live = $state(false);
  let prefix = $state('suite');
  let local = $state('');
  let horizontal = $state(false);
  let decorated = $state(false);
  let sample = $derived(live ? { id: 'live', prefix, horizontal, local: local || undefined }
    : (reference.cases.find(entry => entry.sample.id === selected) ?? reference.cases[0]).sample);
</script>

<section id="anchor-prefix-fixture">
  <label>Anchor prefix sample <select bind:value={selected}>
    {#each reference.cases as { sample }}<option value={sample.id}>{sample.id}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={live} /> Live Anchor prefix</label>
  <label>Live Anchor prefix value <input bind:value={prefix} /></label>
  <label>Local Anchor prefix value <input bind:value={local} /></label>
  <label><input type="checkbox" bind:checked={horizontal} /> Horizontal prefixed Anchor</label>
  <label><input type="checkbox" bind:checked={decorated} /> Decorated prefix links</label>
  <ConfigProvider prefixCls={sample.prefix}
    direction={'rtl' in sample && sample.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: 'variablePrefix' in sample ? { prefix: sample.variablePrefix } : {},
      token: { motionDurationSlow: '0s',
        ...(decorated ? { linkDecoration: 'underline', linkHoverDecoration: 'overline',
          linkFocusDecoration: 'line-through' } : {}) },
      components: 'tokens' in sample && sample.tokens
        ? { Anchor: { linkPaddingBlock: 7, linkPaddingInlineStart: 24 } } : undefined }}>
    <AnchorPrefixScope scope="normal" {sample} />
    <ConfigProvider prefixCls={'childPrefix' in sample ? sample.childPrefix : undefined}>
      <AnchorPrefixScope scope="nested" {sample} />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motionDurationSlow: '0s' } }}>
    <AnchorPrefixScope scope="sibling" {sample} local={false} />
  </ConfigProvider>
</section>
