<script lang="ts">
  import {
    ConfigProvider, Typography, TypographyLink, TypographyParagraph, TypographyText, TypographyTitle
  } from 'antd-svelte';

  let {
    id,
    prefix = 'ant',
    priority = false
  }: { id: string; prefix?: string; priority?: boolean; } = $props();
  let events = $state<string[]>([]);
  let finishCopy: (() => void) | undefined;
  let styled = $derived(priority || id === 'priority');
  let style = $derived([
    styled && 'font-size:30px;color:rgb(255,0,0);margin-top:11px',
    id === 'variable' && `--${prefix}-typography-title-margin-top:13px;--${prefix}-color-text:rgb(255,0,255)`
  ].filter(Boolean).join(';') || undefined);
  let styles = $derived(styled ? {
    root: `font-size:28px;color:rgb(0,128,0);--${prefix}-typography-title-margin-bottom:17px`,
    textarea: 'font-size:22px;letter-spacing:1px'
  } : undefined);
  let shared = $derived({ style, styles });

  function copyText() {
    return new Promise<string>(resolve => {
      finishCopy = () => resolve('Clipboard theme text');
    });
  }
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} typography={styled ? {
  style: 'font-size:26px;margin-top:9px',
  styles: { root: 'font-size:24px;color:rgb(128,0,128)' }
} : undefined}>
  <section data-typography-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
    style="width:600px;padding:16px">
    {#each ['text', 'code', 'h1', 'h3', 'h5', 'paragraph', 'link', 'secondary',
      'article', 'ellipsis', 'copy', 'edit-text', 'edit-title'] as part}
      <div data-typography-part={part}>
        {#if part === 'h1' || part === 'h3' || part === 'h5'}
          <TypographyParagraph children="Lead" />
          <TypographyTitle {...shared} level={part === 'h1' ? 1 : part === 'h3' ? 3 : 5}
            children="Heading" />
        {:else if part === 'paragraph'}
          <TypographyParagraph {...shared} children="Paragraph" />
        {:else if part === 'link'}
          <TypographyLink {...shared} href="#typography-theme" children="Link" />
        {:else if part === 'article'}
          <Typography {...shared}><p>Lead</p><h2>Raw heading</h2><p>Following text</p></Typography>
        {:else if part === 'ellipsis'}
          <TypographyText {...shared} style={[style, 'width:90px;display:inline-block']
            .filter(Boolean).join(';')} ellipsis children="A long line that should be truncated" />
        {:else if part === 'copy'}
          <TypographyText {...shared} children="Copy draft" copyable={{ text: copyText,
            onCopy: () => events.push('copy') }} />
        {:else if part === 'edit-title'}
          <TypographyTitle {...shared} level={1} children="Editing draft" editable={{
            editing: true, autoSize: false, onChange: value => events.push(`title:${value}`)
          }} />
        {:else if part === 'edit-text'}
          <TypographyText {...shared} children="Editing draft" editable={{
            editing: true, autoSize: false, onChange: value => events.push(`text:${value}`)
          }} />
        {:else}
          <TypographyText {...shared} code={part === 'code'}
            type={part === 'secondary' ? 'secondary' : undefined}
            children={part === 'code' ? 'Code sample' : 'Text sample'} />
        {/if}
      </div>
    {/each}
    <button type="button" onclick={() => { events = []; }}>Clear typography events {id}</button>
    <button type="button" onclick={() => finishCopy?.()}>Resolve themed copy {id}</button>
    <output aria-label={`Typography theme events ${id}`}>{JSON.stringify(events)}</output>
  </section>
</ConfigProvider>
