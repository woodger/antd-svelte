<script lang="ts">
  import { Breadcrumb, ConfigProvider, Dropdown, theme, type BreadcrumbItem } from 'antd-svelte';

  let id = $state('42');
  let custom = $state(false);
  let separators = $state(true);
  let cancel = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let mounted = $state(true);
  let large = $state(false);
  let source = $state(false);
  let actionMenu = $state(false);
  let narrow = $state(false);
  let actions = $state(0);
  let submissions = $state(0);
  let events = $state<string[]>([]);
  let items = $derived<BreadcrumbItem[]>([
    {
      key: 'home',
      path: '/home',
      title: 'Home :id',
      class: 'home-link',
      'data-home': 'yes',
      onClick: event => {
        events.push('home');
        if (cancel) event.preventDefault();
      }
    },
    {
      key: 'project',
      path: ':id',
      title: 'Project :id',
      menu: {
        items: [
          { key: 'layout', path: '/layout', title: 'Layout' },
          { key: 'locked', path: '/locked', title: 'Locked', disabled: true },
          { key: 'general', path: '/general', label: 'General' }
        ],
        onClick: info => {
          events.push(`menu:${info.key}`);
          if (cancel) info.domEvent.preventDefault();
        }
      },
      dropdownProps: { trigger: 'click', 'aria-label': 'Breadcrumb sections' }
    },
    ...separators ? [] : [{ key: 'separator', type: 'separator' as const, separator: ':' }],
    { key: 'current', title: 'Current', onClick: () => { actions++; } }
  ]);
  let alignmentItems = $derived<BreadcrumbItem[]>([
    { key: 'workspace', path: 'workspace', title: 'Рабочее пространство' },
    {
      key: 'svelte',
      path: actionMenu ? undefined : 'svelte',
      title: 'svelte',
      menu: { items: [
        { key: 'components', title: 'Компоненты' },
        { key: 'themes', title: 'Темы' }
      ] },
      dropdownProps: { trigger: 'click', 'aria-label': 'Aligned Breadcrumb sections' }
    },
    { key: 'library', title: 'Библиотека' }
  ]);
</script>

{#snippet renderItem(item: BreadcrumbItem, params: Record<string, unknown>, routes: readonly BreadcrumbItem[], paths: readonly string[])}
  <a
    href={`#/${paths.join('/')}`}
    data-route-count={routes.length}
    data-param-id={String(params.id)}
  >{typeof item.title === 'string' ? `Custom ${item.title}` : 'Custom'}</a>
{/snippet}
<section id="breadcrumb-fixture" aria-label="Breadcrumb fixture">
  <label>Breadcrumb parameter <input bind:value={id} /></label>
  <label><input type="checkbox" bind:checked={custom} /> Custom Breadcrumb renderer</label>
  <label><input type="checkbox" bind:checked={separators} /> Automatic Breadcrumb separators</label>
  <label><input type="checkbox" bind:checked={cancel} /> Cancel Breadcrumb navigation</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark Breadcrumb</label>
  <label><input type="checkbox" bind:checked={compact} /> Compact Breadcrumb</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount Breadcrumb</label>
  <label><input type="checkbox" bind:checked={large} /> Large Breadcrumb context</label>
  <label><input type="checkbox" bind:checked={source} /> Source Breadcrumb theme</label>
  <label><input type="checkbox" bind:checked={actionMenu} /> Breadcrumb menu without href</label>
  <label><input type="checkbox" bind:checked={narrow} /> Narrow Breadcrumb</label>
  <ConfigProvider componentSize={large ? 'large' : undefined} theme={source ? {
    algorithm: [dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      ...compact ? [theme.compactAlgorithm] : []]
  } : { mode: dark ? 'dark' : 'light', compact }}>
    <form
      onsubmit={event => {
        event.preventDefault();
        submissions++;
      }}
    >
      {#if mounted}<Breadcrumb
        id="fixture-breadcrumb"
        aria-label="Project breadcrumb"
        {items}
        params={{ id }}
        separator={separators ? '/' : ''}
        itemRender={custom ? renderItem : undefined}
        classNames={{ item: 'semantic-item', separator: 'semantic-separator' }}
        styles={{ root: 'padding:1px', item: 'padding:2px', separator: 'padding:3px' }}
        style="padding:4px"
      />{/if}
      <div style:width={narrow ? custom ? '280px' : '200px' : '800px'}>
        <Breadcrumb id="alignment-breadcrumb" aria-label="Aligned breadcrumb"
          items={alignmentItems} itemRender={custom ? renderItem : undefined} />
      </div>
      <button type="button">After Breadcrumb</button>
    </form>
    <Dropdown menu={{ items: [{ key: 'external', label: 'External entry' }] }}
      class="standalone-dropdown"><button type="button">Standalone Dropdown</button></Dropdown>
  </ConfigProvider>
  <output aria-label="Breadcrumb events">{JSON.stringify(events)}</output>
  <output aria-label="Breadcrumb actions">{actions}</output>
  <output aria-label="Breadcrumb submissions">{submissions}</output>
</section>
