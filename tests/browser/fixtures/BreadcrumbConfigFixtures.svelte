<script lang="ts">
  import {
    Breadcrumb, ConfigProvider, theme,
    type BreadcrumbConfig, type BreadcrumbItem
  } from 'antd-svelte';
  import { breadcrumbConfigProfile } from './breadcrumb-config-presets';
  import reference from './ant-design-breadcrumb-config-reference.json' with { type: 'json' };

  let { sample, probeDefaults = false }: {
    sample?: typeof reference.cases[number];
    probeDefaults?: boolean;
  } = $props();
  let selectedCase = $state('default');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let updated = $state(false);
  let short = $state(false);
  let clicked = $state(0);
  let menuClicks = $state(0);
  const params: Record<string, unknown> = { id: '42' };
  let context = $derived<BreadcrumbConfig>({ ...breadcrumbConfigProfile(current.context, false,
    { separator: contextSeparator, dropdownIcon: contextIcon }),
    ...(updated ? { class: 'context-breadcrumb-updated',
      style: 'opacity:0.6;outline-offset:7px', separator: '>>', dropdownIcon: updatedIcon } : {}) });
  let nested = $derived<BreadcrumbConfig | undefined>(current.nested === 'empty' ? {}
    : current.nested === 'replace' ? { class: 'context-replaced' } : undefined);
  let local = $derived(breadcrumbConfigProfile(current.local, true,
    { separator: localSeparator, dropdownIcon: localIcon }));
  let items = $derived.by(() => {
    const result: BreadcrumbItem[] = [
      { key: 'one', title: 'First', href: '#breadcrumb-config-first', onClick: () => { clicked++; } },
      { key: 'menu', title: 'Section', href: '#breadcrumb-config-section',
        menu: { items: [{ key: 'entry', label: 'Menu entry' }],
          onClick: () => { menuClicks++; } } },
      { key: 'last', title: 'User :id' }
    ].slice(0, short || current.count === 2 ? 2 : 3);
    if (current.extraSeparator) result.splice(1, 0, { type: 'separator', separator: '!' });
    return result;
  });

  function resetCase() {
    updated = false;
    short = false;
    clicked = 0;
    menuClicks = 0;
  }
</script>

{#snippet contextSeparator()}<span data-breadcrumb-separator="context">~~</span>{/snippet}
{#snippet localSeparator()}<span data-breadcrumb-separator="local">&gt;&gt;</span>{/snippet}
{#snippet contextIcon()}<span data-breadcrumb-icon="context">C</span>{/snippet}
{#snippet localIcon()}<span data-breadcrumb-icon="local">L</span>{/snippet}
{#snippet updatedIcon()}<span data-breadcrumb-icon="updated">U</span>{/snippet}

<section id="breadcrumb-config-fixture">
  <h2>Breadcrumb component configuration</h2>
  <label>Breadcrumb config preset<select aria-label="Breadcrumb config preset"
    bind:value={selectedCase} onchange={resetCase}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <button onclick={() => { updated = !updated; }}>Update Breadcrumb configuration</button>
  <button onclick={() => { short = !short; }}>Toggle configured Breadcrumb items</button>
  <output aria-label="Configured Breadcrumb clicks">{clicked}</output>
  <output aria-label="Configured Breadcrumb menu clicks">{menuClicks}</output>
  <ConfigProvider breadcrumb={context} direction={current.rtl ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false }, algorithm: current.theme === 'dark'
      ? theme.darkAlgorithm : current.theme === 'compact' ? theme.compactAlgorithm
        : theme.defaultAlgorithm, components: current.token ? { Breadcrumb: { algorithm: true,
          colorPrimary: '#eb2f96', separatorMargin: 13, lastItemColor: '#c41d7f' } } : undefined }}>
    <ConfigProvider breadcrumb={nested}>
      <div class="breadcrumb-config-main" dir={current.rtl ? 'rtl' : 'ltr'}
        style="width:680px;color:rgb(0,0,0)">
        <Breadcrumb {...local} {items} params={probeDefaults ? undefined : params}
          separator={Object.hasOwn(current, 'separator') ? current.separator : local.separator}
          dropdownIcon={Object.hasOwn(current, 'icon') ? current.icon : local.dropdownIcon}
          classNames={probeDefaults ? ({ props }) => ({
            root: `native-breadcrumb-params-${typeof props.params}`
          }) : local.classNames} />
      </div>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Breadcrumb class="outside-breadcrumb-config"
      items={[{ title: 'Outside first' }, { title: 'Outside second' }]} />
  </ConfigProvider>
</section>
