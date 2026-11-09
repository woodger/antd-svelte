<script lang="ts">
  import { Button, Dropdown, type DropdownPlacement } from 'antd-svelte';

  export interface DropdownPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    arrow?: boolean;
    placement?: DropdownPlacement;
    portal?: boolean;
  }

  let { sample, scope = 'normal', local = true }: {
    sample: DropdownPrefixSample;
    scope?: string;
    local?: boolean;
  } = $props();
  let open = $state(true);
  let events = $state<string[]>([]);
  let changes = $state<boolean[]>([]);
  let container = $state<HTMLDivElement>();
  let getPopupContainer = $derived(sample.portal ? () => container! : undefined);
</script>

{#snippet icon()}★{/snippet}
{#snippet label()}<strong>Rich label</strong>{/snippet}
<section data-dropdown-prefix-scope={scope} style="width:480px;padding:240px 20px">
  <Dropdown prefixCls={local ? sample.local : undefined} bind:open
    trigger={['click']} arrow={sample.arrow} placement={sample.placement}
    {getPopupContainer} aria-label="Prefix commands" onOpenChange={value => changes.push(value)}
    menu={{ items: [
      { key: 'normal', label: 'Normal', icon },
      { key: 'disabled', label: 'Disabled', disabled: true },
      { key: 'divider', type: 'divider' },
      { key: 'danger', label: 'Danger', danger: true },
      { key: 'rich', label },
      { key: 'link', label: 'Native link', href: '#dropdown-prefix-destination' }
    ], onClick: info => events.push(info.key) }}>
    <Button data-prefix-trigger style="width:150px">Open commands</Button>
  </Dropdown>
  <div bind:this={container} data-dropdown-prefix-container></div>
  <output aria-label="Dropdown prefix events">{JSON.stringify(events)}</output>
  <output aria-label="Dropdown prefix changes">{JSON.stringify(changes)}</output>
</section>
