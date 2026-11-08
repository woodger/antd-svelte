<script lang="ts">
  import {
    Typography, TypographyText, TypographyTitle, TypographyParagraph, TypographyLink
  } from 'antd-svelte';

  export interface TypographyPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: TypographyPrefixSample;
    local?: boolean;
  } = $props();
  let prefixCls = $derived(local ? sample.local : undefined);
  let value = $state('Editable draft');
  let events = $state<string[]>([]);
</script>

<section data-typography-prefix-scope={scope} style="width:480px">
  <div data-prefix-part="container"><Typography {prefixCls}><p>Article text</p></Typography></div>
  <div data-prefix-part="title"><TypographyTitle {prefixCls} level={3}>Heading</TypographyTitle></div>
  <div data-prefix-part="text"><TypographyText {prefixCls} strong mark code
    type="secondary">Decorated text</TypographyText></div>
  <div data-prefix-part="link"><TypographyLink {prefixCls} href="#typography-prefix" type="danger"
    >Linked text</TypographyLink></div>
  <div data-prefix-part="ellipsis"><TypographyText {prefixCls} ellipsis style="width:90px"
    >A long line that should be truncated</TypographyText></div>
  <div data-prefix-part="actions"><TypographyParagraph {prefixCls} children={value}
    editable={{ tooltip: 'Edit', autoSize: false, maxLength: 30, enterIcon: null,
      onChange: next => { value = next; events.push(`save:${next}`); },
      onCancel: () => events.push('cancel') }}
    copyable={{ text: 'Copied draft', tooltips: ['Copy', 'Copied'],
      onCopy: () => events.push('copy') }} /></div>
  <output aria-label={`${scope} Typography prefix events`}>{events.join('|')}</output>
</section>
