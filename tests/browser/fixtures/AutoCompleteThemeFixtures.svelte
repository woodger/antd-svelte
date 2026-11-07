<script lang="ts">
  import { referenceSizeLabel } from './reference-size';
  import {
    AutoComplete, ConfigProvider, type AutoCompleteItem, type ThemeConfig
  } from 'antd-svelte';
  import CompletionInput from './CompletionInput.svelte';
  import { autoCompleteThemePresets } from './auto-complete-theme-presets';

  let preset = $state('default');
  let enabled = $state(true);
  let mounted = $state(true);
  let hashed = $state(true);
  let compact = $state(false);
  let color = $state('');
  let width = $state(240);
  let listHeight = $state(256);
  let parentAliases = $state(false);
  let changes = $state<string[]>([]);
  let searches = $state<string[]>([]);
  let selections = $state<string[]>([]);
  let openings = $state<boolean[]>([]);
  let focusEvents = $state(0);
  let editor = $state<HTMLInputElement | HTMLTextAreaElement>();
  let nativeRoot = $state<HTMLDivElement>();
  let customEditor = $state<HTMLInputElement | HTMLTextAreaElement>();
  const options: AutoCompleteItem[] = [{ label: 'Letters', options: [
    { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' },
    { value: 'd', label: 'Disabled', disabled: true }
  ] }, { value: 'c', label: 'Gamma' }];
  const sizes = ['medium', 'small', 'large'] as const;
  const variants = ['filled', 'borderless', 'underlined'] as const;
  let config = $derived<ThemeConfig>({
    ...autoCompleteThemePresets[preset],
    cssVar: { ...autoCompleteThemePresets[preset].cssVar, key: 'completion-source-scope' },
    hashed,
    components: color ? {
      ...autoCompleteThemePresets[preset].components,
      Select: { ...autoCompleteThemePresets[preset].components?.Select, selectorBg: color }
    } : autoCompleteThemePresets[preset].components
  });
</script>

<style>
  .samples { display: grid; grid-template-columns: repeat(3, 240px); align-items: start; gap: 20px; margin-block: 24px; }
</style>

<section id="auto-complete-theme-fixture">
  <h2>Source AutoComplete tokens</h2>
  <label>Completion token preset <select bind:value={preset} aria-label="Completion token preset">
    {#each Object.keys(autoCompleteThemePresets) as name}<option value={name}>{name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={enabled} /> Apply source completion tokens</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount themed completion</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash themed completion</label>
  <label><input type="checkbox" bind:checked={compact} /> Native compact completion</label>
  <label><input type="checkbox" bind:checked={parentAliases} /> Parent completion aliases</label>
  <label>Completion color override <input bind:value={color} /></label>
  <label>Completion popup width <input type="number" bind:value={width} /></label>
  <label>Completion list height <input type="number" bind:value={listHeight} /></label>
  {#if mounted}
    <ConfigProvider theme={enabled ? config : { compact }}>
      <form id="themed-completion-form">
        <div class="samples" style={parentAliases ? '--ant-font-size:30px;--ant-color-text:red' : undefined}>
          {#each sizes as size}
            <AutoComplete {size} {options} defaultValue="b" class={`completion-token-${referenceSizeLabel(size)}`}
              aria-label={`Themed completion ${size}`} style="width:240px" />
          {/each}
          {#each variants as variant}
            <AutoComplete {variant} {options} defaultValue="b" class={`completion-token-${variant}`}
              aria-label={`Themed completion ${variant}`} style="width:240px" />
          {/each}
          <AutoComplete {options} defaultValue="b" disabled class="completion-token-disabled"
            aria-label="Themed completion disabled" style="width:240px" />
          <AutoComplete {options} defaultValue="b" class="completion-token-custom" name="custom"
            bind:inputElement={customEditor} aria-label="Themed completion custom" style="width:240px">
            {#snippet children(control)}<CompletionInput {control} />{/snippet}
          </AutoComplete>
          <AutoComplete {options} defaultValue="b" class="completion-token-textarea" name="notes"
            aria-label="Themed completion textarea" style="width:240px">
            {#snippet children(control)}
              <textarea {...control.attributes} use:control.register rows="3"
                style="width:100%;font:inherit;box-sizing:border-box"></textarea>
            {/snippet}
          </AutoComplete>
          <AutoComplete {options} defaultValue="b" class="completion-token-popup" name="query"
            bind:inputElement={editor} bind:nativeElement={nativeRoot}
            aria-label="Themed completion popup" style="width:240px"
            allowClear {listHeight} popupMatchSelectWidth={width}
            onFocus={() => focusEvents++}
            onChange={value => { changes = [...changes, String(value)]; }}
            showSearch={{ onSearch: value => { searches = [...searches, value]; } }}
            onSelect={value => { selections = [...selections, value]; }}
            onOpenChange={value => { openings = [...openings, value]; }} />
          <AutoComplete options={[]} notFoundContent="No results" class="completion-token-empty"
            aria-label="Themed completion empty" style="width:240px" />
        </div>
      </form>
    </ConfigProvider>
  {/if}
  <button type="button" onclick={() => editor?.focus()}>Focus themed completion</button>
  <button type="button" onclick={() => customEditor?.focus()}>Focus themed custom completion</button>
  <output aria-label="Completion theme changes">{JSON.stringify(changes)}</output>
  <output aria-label="Completion theme searches">{JSON.stringify(searches)}</output>
  <output aria-label="Completion theme selections">{JSON.stringify(selections)}</output>
  <output aria-label="Completion theme openings">{JSON.stringify(openings)}</output>
  <output aria-label="Completion theme focus events">{focusEvents}</output>
  <output aria-label="Completion native refs">{JSON.stringify({
    root: Boolean(nativeRoot), input: Boolean(editor),
    contains: Boolean(nativeRoot && editor && nativeRoot.contains(editor))
  })}</output>
</section>
