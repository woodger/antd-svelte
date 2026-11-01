<script lang="ts">
  import {
    ConfigProvider,
    Typography,
    TypographyText,
    TypographyTitle,
    TypographyParagraph,
    TypographyLink,
    type TypographyContent,
    type TypographyEditConfig,
    type TypographyEllipsisConfig,
    type TypographyType
  } from 'antd-svelte';

  let variant = $state('paragraph');
  let contentMode = $state('scalar');
  let text = $state('Bamboo is Little Light '.repeat(7).trim());
  let appearance = $state('normal');
  let level = $state<1 | 2 | 3 | 4 | 5>(2);
  let marked = $state(false);
  let disabled = $state(false);
  let editable = $state(false);
  let copying = $state(false);
  let copyText = $state('');
  let copyFormat = $state<'text/plain' | 'text/html'>('text/plain');
  let asyncCopy = $state(false);
  let customIcons = $state(false);
  let tooltips = $state(true);
  let editText = $state(false);
  let editControlled = $state(false);
  let ownerEditing = $state<boolean | undefined>(false);
  let accept = $state(true);
  let trigger = $state('icon');
  let enterIcon = $state('default');
  let editMaxLength = $state(0);
  let editMinRows = $state(0);
  let editMaxRows = $state(0);
  let ellipsis = $state('off');
  let tooltipTitle = $state('auto');
  let rows = $state(2);
  let suffix = $state('');
  let suffixEnabled = $state(false);
  let expandable = $state('off');
  let expandedControlled = $state(false);
  let ownerExpanded = $state<boolean | undefined>(false);
  let defaultExpanded = $state(false);
  let customSymbol = $state(false);
  let placement = $state<'start' | 'end'>('end');
  let width = $state(300);
  let mounted = $state(true);
  let dark = $state(false);
  let compact = $state(false);
  let localRtl = $state(false);
  let semantic = $state(false);
  let customLocale = $state(false);
  let sourceLocale = $state(false);
  let native = $state<HTMLElement>();
  let events = $state<string[]>([]);
  let copyResolve: ((value: string) => void) | undefined;
  let saved = $state('');

  function event(value: string) { events = [...events, value]; }
  function onStart() {
    event('start');
    if (accept) ownerEditing = true;
  }
  let edit = $derived<TypographyEditConfig | false>(editable ? {
    text: editText ? 'Explicit editable text' : undefined,
    editing: editControlled ? ownerEditing : undefined,
    triggerType: trigger === 'both' ? ['text', 'icon'] : trigger === 'none' ? [] :
      trigger === 'text' ? ['text'] : ['icon'],
    onStart,
    onChange: value => {
      saved = value;
      event(`save:${value}`);
      if (accept) {
        text = value;
        ownerEditing = false;
      }
    },
    onCancel: () => {
      event('cancel');
      if (accept) ownerEditing = false;
    },
    onEnd: () => event('end'),
    tooltip: tooltips,
    maxLength: editMaxLength || undefined,
    autoSize: editMinRows || editMaxRows ? {
      minRows: editMinRows || undefined,
      maxRows: editMaxRows || undefined
    } : true,
    enterIcon: enterIcon === 'none' ? null : enterIcon === 'custom' ? confirm : undefined
  } : false);
  let clip = $derived<TypographyEllipsisConfig | boolean>(ellipsis === 'off' ? false : {
    rows,
    suffix: suffixEnabled ? suffix : undefined,
    expandable: expandable === 'collapsible' ? 'collapsible' : expandable === 'once',
    expanded: expandedControlled ? ownerExpanded : undefined,
    defaultExpanded,
    symbol: customSymbol ? expanded => expanded ? 'Close text' : 'Open text' : undefined,
    tooltip: ellipsis === 'tooltip' || ellipsis === 'js-tooltip'
      ? tooltipTitle === 'zero' ? 0 : tooltipTitle === 'none' ? { title: null } : true
      : undefined,
    onEllipsis: ellipsis.startsWith('js') ? value => event(`ellipsis:${value}`) : undefined,
    onExpand: (_event, info) => {
      event(`expanded:${info.expanded}`);
      if (accept) ownerExpanded = info.expanded;
    }
  });
  let data = $derived<TypographyContent>(contentMode === 'array' ? ['Before ', word, ' after']
    : contentMode === 'zero' ? 0 : text);
  let props = $derived({
    id: 'typography-under-test',
    editable: edit,
    copyable: copying ? {
      text: asyncCopy ? () => new Promise<string>(resolve => { copyResolve = resolve; }) : copyText || undefined,
      format: copyFormat,
      tooltips,
      icon: customIcons ? ['COPY', 'DONE'] : undefined,
      onCopy: () => event('copy')
    } : false,
    ellipsis: clip,
    actions: { placement },
    type: appearance === 'normal' ? undefined : appearance as TypographyType,
    disabled,
    strong: marked,
    underline: marked,
    delete: marked,
    code: marked,
    mark: marked,
    keyboard: marked,
    italic: marked,
    class: 'local-typography',
    rootClassName: 'root-typography',
    direction: localRtl ? 'rtl' as const : undefined,
    classNames: semantic ? { root: 'local-root', actions: 'local-actions', action: 'local-action',
      textarea: 'local-textarea' } : undefined,
    styles: semantic ? { root: 'color:rgb(0,0,90)', action: 'padding:1px', textarea: 'font-size:20px' }
      : undefined,
    style: semantic ? 'color:rgb(0,90,0)' : undefined,
    onClick: () => event('click')
  });
</script>

{#snippet word()}<b>atomic</b>{/snippet}
{#snippet confirm(className: string)}<span class={className}>OK</span>{/snippet}
{#snippet body()}{#if contentMode === 'rich'}Before <b>atomic</b> after{:else}{text}{/if}{/snippet}

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px 16px; }
  .surface { background: var(--ant-color-bg-container); }
</style>

<section id="typography-fixture">
  <div class="controls">
    <label>Typography variant<select bind:value={variant}>
      <option>paragraph</option><option>text</option><option>title</option><option>link</option><option>container</option>
    </select></label>
    <label>Typography content<select bind:value={contentMode}>
      <option>scalar</option><option>snippet</option><option>array</option><option>rich</option><option>zero</option>
    </select></label>
    <label>Typography level<select bind:value={level}>
      <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
      <option value={4}>4</option><option value={5}>5</option>
    </select></label>
    <label>Typography type<select bind:value={appearance}>
      <option>normal</option><option>secondary</option><option>success</option><option>warning</option><option>danger</option>
    </select></label>
    <label><input type="checkbox" bind:checked={marked} /> Typography decorations</label>
    <label><input type="checkbox" bind:checked={disabled} /> Typography disabled</label>
    <label><input type="checkbox" bind:checked={editable} /> Typography editable</label>
    <label><input type="checkbox" bind:checked={copying} /> Typography copyable</label>
    <label><input type="checkbox" bind:checked={asyncCopy} /> Typography async copy</label>
    <label><input type="checkbox" bind:checked={customIcons} /> Typography custom icons</label>
    <label><input type="checkbox" bind:checked={tooltips} /> Typography action tooltips</label>
    <label><input type="checkbox" bind:checked={editText} /> Typography explicit edit text</label>
    <label><input type="checkbox" bind:checked={editControlled} /> Typography controlled edit</label>
    <label><input type="checkbox" bind:checked={expandedControlled} /> Typography controlled expanded</label>
    <label><input type="checkbox" bind:checked={defaultExpanded} /> Typography default expanded</label>
    <label><input type="checkbox" bind:checked={customSymbol} /> Typography custom symbol</label>
    <label><input type="checkbox" bind:checked={accept} /> Accept Typography changes</label>
    <label><input type="checkbox" bind:checked={suffixEnabled} /> Typography suffix enabled</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount Typography</label>
    <label><input type="checkbox" bind:checked={dark} /> Typography dark</label>
    <label><input type="checkbox" bind:checked={compact} /> Typography compact</label>
    <label><input type="checkbox" bind:checked={localRtl} /> Typography local RTL</label>
    <label><input type="checkbox" bind:checked={semantic} /> Typography semantic</label>
    <label><input type="checkbox" bind:checked={customLocale} /> Typography locale</label>
    <label><input type="checkbox" bind:checked={sourceLocale} /> Typography Text locale alias</label>
    <label>Typography triggers<select bind:value={trigger}>
      <option>icon</option><option>text</option><option>both</option><option>none</option>
    </select></label>
    <label>Typography enter icon<select bind:value={enterIcon}>
      <option>default</option><option>none</option><option>custom</option>
    </select></label>
    <label>Typography ellipsis<select bind:value={ellipsis}>
      <option>off</option><option>css</option><option>tooltip</option><option>js</option><option>js-tooltip</option>
    </select></label>
    <label>Typography tooltip title<select bind:value={tooltipTitle}>
      <option>auto</option><option>zero</option><option>none</option>
    </select></label>
    <label>Typography expandable<select bind:value={expandable}>
      <option>off</option><option>once</option><option>collapsible</option>
    </select></label>
    <label>Typography actions<select bind:value={placement}><option>start</option><option>end</option></select></label>
    <label>Typography copy format<select bind:value={copyFormat}>
      <option>text/plain</option><option>text/html</option>
    </select></label>
    <label>Typography rows<input type="number" bind:value={rows} /></label>
    <label>Typography edit maximum<input type="number" bind:value={editMaxLength} /></label>
    <label>Typography edit min rows<input type="number" bind:value={editMinRows} /></label>
    <label>Typography edit max rows<input type="number" bind:value={editMaxRows} /></label>
    <label>Typography width<input type="number" bind:value={width} /></label>
    <label>Typography suffix<input bind:value={suffix} /></label>
    <label>Typography copy text<input bind:value={copyText} /></label>
    <label>Typography source<input bind:value={text} /></label>
  </div>
  <button type="button" onclick={() => copyResolve?.('Async clipboard text')}>Resolve Typography copy</button>
  <button type="button" onclick={() => { ownerEditing = true; }}>Start Typography owner edit</button>
  <button type="button" onclick={() => { ownerEditing = false; }}>Stop Typography owner edit</button>
  <button type="button" onclick={() => { ownerEditing = undefined; }}>Release Typography owner edit</button>
  <button type="button" onclick={() => { ownerExpanded = true; }}>Expand Typography owner</button>
  <button type="button" onclick={() => { ownerExpanded = false; }}>Collapse Typography owner</button>
  <button type="button" onclick={() => { ownerExpanded = undefined; }}>Release Typography owner expanded</button>
  <button type="button" onclick={() => { events = []; }}>Clear Typography events</button>
  <output aria-label="Typography events">{events.join('|')}</output>
  <output aria-label="Typography saved">{saved}</output>
  <output aria-label="Typography ref">{native?.tagName ?? 'none'}</output>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact }}
    locale={{ typography: customLocale ? { edit: 'Change text', copy: 'Copy text', copied: 'Done',
      expand: 'Read more', collapse: 'Read less' } : undefined,
      Text: sourceLocale ? { copy: 'Source copy' } : undefined }}
    typography={semantic ? {
      class: 'provider-typography', style: 'color:rgb(90,0,0)',
      classNames: ({ props }) => ({ root: `provider-${props.component ?? 'article'}-${props.direction}`,
        actions: 'provider-actions', action: 'provider-action', textarea: 'provider-textarea' }),
      styles: { root: 'color:pink', actions: 'background:transparent', textarea: 'padding:2px' }
    } : undefined}>
    <div class="surface" style={`width:${width}px`}>
      {#if mounted}
        {#if variant === 'container'}
          <Typography id="typography-under-test" class={props.class} rootClassName={props.rootClassName}
            classNames={props.classNames} styles={props.styles} style={props.style}
            direction={props.direction} bind:nativeElement={native}>
            <h2>Article heading</h2><p>Article body</p>
          </Typography>
        {:else if variant === 'text'}
          <TypographyText {...props} children={contentMode === 'snippet' || contentMode === 'rich' ? body : data}
            bind:nativeElement={native} />
        {:else if variant === 'title'}
          <TypographyTitle {...props} {level} children={contentMode === 'snippet' || contentMode === 'rich' ? body : data}
            bind:nativeElement={native} />
        {:else if variant === 'link'}
          <TypographyLink {...props} ellipsis={Boolean(clip)} href="#destination" target="_blank"
            children={contentMode === 'snippet' || contentMode === 'rich' ? body : data} bind:nativeElement={native} />
        {:else}
          <TypographyParagraph {...props} children={contentMode === 'snippet' || contentMode === 'rich' ? body : data}
            bind:nativeElement={native} />
        {/if}
      {/if}
    </div>
  </ConfigProvider>
</section>
