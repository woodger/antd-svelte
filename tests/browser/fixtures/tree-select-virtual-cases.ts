import type { ThemeConfig, TreeScrollConfig, TreeSelectNode, TreeSelectProps } from 'antd-svelte';

type VirtualProps = Pick<TreeSelectProps, 'open' | 'value' | 'multiple' | 'showSearch' | 'virtual'
  | 'listHeight' | 'listItemHeight' | 'listItemScrollOffset' | 'popupMatchSelectWidth'
  | 'treeDefaultExpandedKeys' | 'treeExpandedKeys'>;

export type TreeSelectVirtualAction = { scroll: TreeScrollConfig | null }
  | { props: VirtualProps } | { key: string };

interface TreeSelectVirtualSample {
  id: string;
  props?: VirtualProps;
  provider?: { virtual?: boolean; popupMatchSelectWidth?: boolean | number; };
  tokens?: ThemeConfig['token'];
  wide?: boolean;
  branches?: boolean;
  customPopup?: boolean;
  observation?: boolean;
  actions?: readonly TreeSelectVirtualAction[];
}

const positions: readonly TreeSelectVirtualAction[] = [
  { scroll: 56 },
  { scroll: { key: 55, align: 'bottom', offset: 3 } },
  { scroll: { index: 12, align: 'top', offset: 4 } },
  { scroll: { top: 112, left: 0 } },
  { scroll: { key: 0, align: 'top' } },
  { scroll: null }
];
const branches: readonly TreeSelectVirtualAction[] = [
  { scroll: { key: 'leaf', autoExpand: true } },
  { scroll: { key: 'parent', autoExpand: true } },
  { scroll: { key: 'branch', autoExpand: true } },
  { scroll: { key: 'leaf', align: 'bottom' } }
];

export const treeSelectVirtualSamples: readonly TreeSelectVirtualSample[] = [
  { id: 'default', actions: positions },
  { id: 'local-virtual-off', props: { virtual: false }, actions: positions.slice(0, 2) },
  { id: 'provider-virtual-off', provider: { virtual: false } },
  { id: 'local-virtual-on', provider: { virtual: false }, props: { virtual: true } },
  { id: 'width-off', wide: true, props: { popupMatchSelectWidth: false }, actions: positions.slice(0, 2) },
  { id: 'provider-width-off', provider: { popupMatchSelectWidth: false } },
  { id: 'local-width-on', wide: true, provider: { popupMatchSelectWidth: false }, props: { popupMatchSelectWidth: true } },
  { id: 'width-below-anchor', wide: true, props: { popupMatchSelectWidth: 140 } },
  { id: 'provider-width-number', wide: true, provider: { popupMatchSelectWidth: 300 } },
  { id: 'local-width-overrides-number', provider: { popupMatchSelectWidth: 300 }, wide: true, props: { popupMatchSelectWidth: true } },
  { id: 'zero-estimate', props: { listItemHeight: 0 }, actions: positions.slice(0, 2) },
  { id: 'zero-height', props: { listHeight: 0 }, actions: positions.slice(0, 2) },
  { id: 'theme-estimate', tokens: { controlHeightSM: 30, paddingXXS: 6 } },
  { id: 'retained-single', props: { open: false }, actions: [
    { scroll: 840 }, { props: { open: true } }, { scroll: 56 }, { key: 'ArrowDown' },
    { scroll: 56 }, { props: { open: false } }, { scroll: 280 }, { props: { open: true } },
    { scroll: 56 }, { props: { open: false } }, { scroll: { key: 20, align: 'top' } },
    { props: { open: true } }
  ] },
  { id: 'retained-multiple', props: { open: false, multiple: true, value: [60] }, actions: [
    { scroll: 840 }, { props: { open: true } }, { scroll: 280 }, { props: { open: false } },
    { props: { open: true } }, { props: { open: false } },
    { scroll: { key: 20, align: 'top' } }, { props: { open: true } }
  ] },
  { id: 'branches', branches: true, actions: branches },
  { id: 'default-expansion', branches: true, props: { treeDefaultExpandedKeys: [] }, actions: branches },
  { id: 'controlled-expansion', branches: true, props: { treeExpandedKeys: [] }, actions: branches },
  { id: 'live-viewport', actions: [
    { scroll: 560 }, { props: { virtual: false } }, { scroll: 420 }, { props: { virtual: true } },
    { props: { listHeight: 112 } }, { props: { listItemHeight: 42 } },
    { props: { showSearch: { searchValue: '7' } } },
    { props: { showSearch: { searchValue: 'none' } } }, { props: { showSearch: { searchValue: '' } } }
  ] },
  { id: 'custom-popup', customPopup: true, actions: positions.slice(0, 2) },
  { id: 'hidden-scroll', observation: true, props: { multiple: true, value: [60] }, actions: [
    { scroll: 280 }, { props: { open: false } }, { scroll: 560 }, { props: { open: true } }
  ] },
  { id: 'provider-virtual-undefined', observation: true, provider: { virtual: false }, props: { virtual: undefined } },
  { id: 'empty-ref', observation: true, props: { showSearch: { searchValue: 'none' } }, actions: [{ scroll: 840 }] }
];

export function treeSelectVirtualProps(sample: TreeSelectVirtualSample): VirtualProps {
  return {
    open: true, value: sample.branches ? undefined : 60, showSearch: true,
    listHeight: 84, listItemHeight: sample.tokens ? undefined : 28, listItemScrollOffset: 3,
    ...sample.props
  };
}

export function treeSelectVirtualData(sample: TreeSelectVirtualSample): TreeSelectNode[] {
  if (sample.branches) return [
    { value: 'parent', title: 'Parent', children: [
      { value: 'branch', title: 'Branch', children: [{ value: 'leaf', title: 'Leaf' }] }
    ] },
    { value: 'tail', title: 'Tail' }
  ];
  return Array.from({ length: 80 }, (_, value) => ({
    value, title: sample.wide ? `${'A long node title '.repeat(4)}${value}` : `Node ${value}`
  }));
}
