import { mount, unmount, type Snippet } from 'svelte';
import TreeSelectLabelBinding from './TreeSelectLabelBinding.svelte';
import type { TreeSelectLabel, TreeSelectLabeledValue, TreeSelectRawValue } from './tree-select.types';

export function createTreeSelectLabelCache<Data extends object>() {
  const bindings = new WeakMap<Data, {
    renderer: Snippet<[Data]>;
    original: TreeSelectLabel;
    label: Snippet;
  }>();
  const originals = new WeakMap<Snippet, { label: TreeSelectLabel }>();

  function original(label: TreeSelectLabel): TreeSelectLabel {
    const entry = typeof label === 'function' ? originals.get(label) : undefined;
    return entry ? entry.label : label;
  }
  function get(renderer: Snippet<[Data]>, data: Data, raw: TreeSelectLabel) {
    const cached = bindings.get(data);
    return cached?.renderer === renderer && Object.is(cached.original, raw) ? cached.label : undefined;
  }
  function remember(renderer: Snippet<[Data]>, data: Data, raw: TreeSelectLabel, label: Snippet) {
    bindings.set(data, { renderer, original: raw, label });
    originals.set(label, { label: raw });
  }

  return {
    original,
    forChange(renderer: Snippet<[Data]>, data: Data, fallback: TreeSelectLabel): Snippet {
      const raw = original(fallback);
      const cached = get(renderer, data, raw);
      if (cached) return cached;

      // Только обработчик выбора: пустой компонент создаёт snippet без рендера label.
      let label: Snippet | undefined;
      const binding = mount(TreeSelectLabelBinding<Data>, {
        target: document.createElement('div'),
        props: { renderer, data, capture: value => { label = value; } }
      });
      void unmount(binding);
      if (!label) throw new Error('Unable to bind TreeSelect label');
      remember(renderer, data, raw, label);
      return label;
    },
    forSummary(
      renderer: Snippet<[Data]>,
      items: TreeSelectLabeledValue[],
      nodes: ReadonlyMap<TreeSelectRawValue, Data>
    ) {
      const pending: {
        renderer: Snippet<[Data]>;
        data: Data;
        capture: (label: Snippet) => void;
      }[] = [];
      const records = items.map(item => {
        const data = nodes.get(item.value);
        if (!data) return item;
        const raw = original(item.label);
        const cached = get(renderer, data, raw);
        if (cached) return { ...item, label: cached };

        const record = { ...item };
        let captured = false;
        pending.push({
          renderer, data,
          capture: label => {
            if (captured) return;
            captured = true;
            remember(renderer, data, raw, label);
            record.label = label;
          }
        });
        return record;
      });
      return { records, pending };
    }
  };
}
