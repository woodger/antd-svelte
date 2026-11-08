<script lang="ts">
  import { Breadcrumb, type BreadcrumbItem, type BreadcrumbProps } from 'antd-svelte';

  export interface BreadcrumbPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    tokens?: boolean;
    menuLast?: boolean;
    explicit?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: BreadcrumbPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLElement>();
  let clicks = $state(0);
  let menuClicks = $state(0);
  const classes: BreadcrumbProps['classNames'] = ({ props }) => ({
    root: `fixture-raw-prefix-${props.prefixCls === undefined ? 'unset' : props.prefixCls || 'empty'}`
  });
  let items = $derived.by(() => {
    const values: BreadcrumbItem[] = [
      { key: 'one', title: first, href: '#bc-prefix-one', onClick: () => clicks++ },
      { key: 'menu', title: section, href: '#bc-prefix-section',
        dropdownProps: { trigger: ['click'] }, menu: { items: [{ key: 'entry', label: 'Menu entry' }],
          onClick: () => menuClicks++ } },
      { key: 'last', title: current }
    ];

    if (sample.menuLast) values.splice(2);
    if (sample.explicit) values.splice(1, 0, { key: 'separator', type: 'separator', separator: '>' });
    return values;
  });
</script>

{#snippet first()}<span data-prefix-label>First</span>{/snippet}
{#snippet section()}<span data-prefix-label>Section</span>{/snippet}
{#snippet current()}<span data-prefix-label>Current</span>{/snippet}
{#snippet arrow()}<span data-prefix-arrow>v</span>{/snippet}

<div data-breadcrumb-prefix-scope={scope} style="width:500px">
  <Breadcrumb bind:nativeElement prefixCls={local ? sample.local : undefined}
    {items} dropdownIcon={arrow} class="fixture-breadcrumb-prefix" classNames={classes} />
  <output aria-label={`${scope} breadcrumb prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`${scope} breadcrumb prefix clicks`}>{clicks}</output>
  <output aria-label={`${scope} breadcrumb menu clicks`}>{menuClicks}</output>
</div>
