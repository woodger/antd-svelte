import { getContext, setContext, untrack } from 'svelte';

interface NodeEntry {
  readonly element: HTMLTemplateElement | undefined;
  read: () => object;
}

const nodesKey = Symbol('ant-tree-select-nodes');

export function provideTreeSelectNodes() {
  const entries = new Set<NodeEntry>();
  let revision = $state(0);
  const collection = {
    get data() {
      void revision;
      return [...entries].sort((before, after) => {
        if (!before.element || !after.element) return 0;
        const position = before.element.compareDocumentPosition(after.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      }).map(entry => entry.read());
    },
    register(entry: NodeEntry) {
      untrack(() => { entries.add(entry); revision++; });
      return () => untrack(() => { entries.delete(entry); revision++; });
    },
    observe(element: HTMLDivElement) {
      const observer = new MutationObserver(() => { revision++; });
      observer.observe(element, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  };
  setContext(nodesKey, collection);
  return collection;
}

export function useTreeSelectNodes() {
  return getContext<ReturnType<typeof provideTreeSelectNodes> | undefined>(nodesKey);
}
