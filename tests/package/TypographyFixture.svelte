<script lang="ts">
  import {
    ConfigProvider,
    Typography,
    TypographyText,
    TypographyTitle,
    TypographyParagraph,
    TypographyLink,
    type TypographyContent,
    type TypographySemantic
  } from 'antd-svelte';
  let { variant = 'paragraph', semantic }: {
    variant?: string;
    semantic?: TypographySemantic;
  } = $props();
  const classes = {
    root: 'context-root',
    actions: 'context-actions',
    action: 'context-action',
    textarea: 'context-textarea'
  };
  const style = { root: 'color:red', action: 'padding:2px', textarea: 'color:blue' };
  let text = $derived<TypographyContent>(variant === 'zero' ? 0
    : variant === 'array' ? ['Before ', word, ' after'] : 'Text content');
</script>

{#snippet word()}<b>atomic</b>{/snippet}

<ConfigProvider typography={{ class: 'provider-typography', classNames: classes,
  styles: style, style: 'color:pink' }}>
  {#if variant === 'container'}
    <Typography class="local-typography" classNames={semantic} style="color:green">
      <h2>Heading</h2><p>Paragraph</p>
    </Typography>
  {:else if variant === 'title'}
    <TypographyTitle level={3} children={text} copyable editable classNames={semantic} />
  {:else if variant === 'link'}
    <TypographyLink href="#next" target="_blank" children={text} classNames={semantic} />
  {:else if variant === 'decor'}
    <TypographyParagraph children={text} strong underline delete code mark keyboard italic copyable />
  {:else if variant === 'editing'}
    <TypographyParagraph children={text} editable={{ editing: true }}
      classNames={{ root: 'local-root', textarea: 'local-textarea' }} styles={{ textarea: 'padding:4px' }} />
  {:else if variant === 'ellipsis'}
    <TypographyParagraph children={text} ellipsis={{ rows: 2, expandable: true, suffix: 'tail' }} copyable />
  {:else if variant === 'text'}
    <TypographyText children={text} classNames={semantic} />
  {:else}
    <TypographyParagraph children={text} copyable editable classNames={semantic} style="color:green" />
  {/if}
</ConfigProvider>
