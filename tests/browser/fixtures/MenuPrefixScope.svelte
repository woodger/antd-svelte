<script lang="ts">
  import { Menu, type MenuItemType } from 'antd-svelte';

  export interface MenuPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    dark?: boolean;
    portal?: boolean;
  }
  let { sample, mode = 'inline', scope = 'normal', local = true }: {
    sample: MenuPrefixSample;
    mode?: 'inline' | 'vertical' | 'horizontal' | 'collapsed';
    scope?: string;
    local?: boolean;
  } = $props();
  let element = $state<HTMLUListElement>();
  let events = $state<string[]>([]);
  let container = $state<HTMLDivElement>();
  let items: MenuItemType[] = [
    { key: 'selected', label: 'Selected', class: 'sample-selected' },
    { key: 'normal', label: 'Normal', class: 'sample-normal', icon },
    { key: 'disabled', label: 'Disabled', class: 'sample-disabled', disabled: true },
    { key: 'danger', label: 'Danger', class: 'sample-danger', danger: true },
    { key: 'parent', label: 'Parent', class: 'sample-parent', children: [
      { key: 'leaf', label: 'Leaf', class: 'sample-leaf' },
      { type: 'group', key: 'group', label: 'Group', children: [{ key: 'group-leaf', label: 'Grouped' }] },
      { type: 'divider', key: 'divider', dashed: true },
      { key: 'link', label: link }
    ] }
  ];
</script>

{#snippet icon()}★{/snippet}
{#snippet link()}<a href="#menu-prefix-destination">Native link</a>{/snippet}
<section data-menu-prefix-scope={scope} style="padding:80px 20px">
  <Menu prefixCls={local ? sample.local : undefined} {items} mode={mode === 'collapsed' ? 'inline' : mode}
    inlineCollapsed={mode === 'collapsed' ? true : undefined} theme={sample.dark ? 'dark' : 'light'}
    class="fixture-menu-prefix" style={`width:${mode === 'horizontal' ? 720 : mode === 'collapsed' ? 80 : 320}px`}
    defaultSelectedKeys={['selected', 'leaf']} defaultOpenKeys={mode === 'collapsed' ? [] : ['parent']}
    triggerSubMenuAction="click" onClick={info => events.push(info.key)} bind:nativeElement={element}
    {...sample.portal ? { getPopupContainer: () => container! } : {}} />
  <div bind:this={container} data-menu-prefix-container></div>
  <output aria-label="Menu prefix ref">{element ? 'mounted' : 'empty'}</output>
  <output aria-label="Menu prefix events">{JSON.stringify(events)}</output>
</section>
