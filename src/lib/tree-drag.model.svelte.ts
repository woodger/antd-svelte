import { untrack } from 'svelte';
import type { TreeEntity, TreeIndex } from './tree.engine';
import { getTreeDragChildren, resolveTreeDrop, treeDropIndicatorStyle } from './tree-drag.engine';
import type { TreeDropState } from './tree-drag.engine';
import type {
  TreeBasicDataNode, TreeEventNode, TreeKey, TreeProps
} from './tree.types';

type Entry<Data extends object> = TreeEntity<Data & TreeBasicDataNode<Data>>;
interface TreeDragOptions<Data extends object> {
  props: () => TreeProps<Data>;
  index: () => TreeIndex<Data & TreeBasicDataNode<Data>>;
  visible: () => readonly Entry<Data>[];
  expanded: () => readonly TreeKey[];
  setExpanded: (keys: TreeKey[]) => void;
  node: (entry: Entry<Data>) => TreeEventNode<Data>;
  disabled: () => boolean | undefined;
  indent: () => number;
  rtl: () => boolean;
}

interface TreeDragSession<Data extends object> {
  key: TreeKey;
  data: Data & TreeBasicDataNode<Data>;
  snapshot: TreeEventNode<Data>;
  children: TreeKey[];
  startX: number;
  indent: number;
}

export function createTreeDrag<Data extends object>(options: TreeDragOptions<Data>) {
  let source = $state.raw<TreeDragSession<Data> | null>(null);
  let active = $state(false);
  let highlighted = $state<TreeKey | null>(null);
  let target = $state.raw<TreeDropState | null>(null);
  let entered: TreeKey | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let owner: Window | null = null;
  let disposed = false;

  function draggable(entry: Entry<Data>) {
    const setting = options.props().draggable;
    if (!setting) return false;
    const predicate = typeof setting === 'function' ? setting
      : typeof setting === 'object' ? setting.nodeDraggable : undefined;
    return Boolean(!predicate || predicate(entry.node));
  }

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function clearTarget() {
    target = null;
  }

  function clean() {
    clearTimer();
    owner?.removeEventListener('dragend', windowEnd);
    owner = null;
    source = null;
    active = false;
    highlighted = null;
    entered = null;
    clearTarget();
  }

  $effect(() => {
    if (!source || !active) return;
    const entry = options.index().entities.get(String(source.key));
    const valid = !options.disabled() && entry && !entry.node.disabled && draggable(entry);
    if (!valid) untrack(clean);
  });

  function start(event: DragEvent, entry: Entry<Data>) {
    if (disposed || options.disabled() || entry.node.disabled || !draggable(entry)) return;
    event.stopPropagation();
    clean();
    const snapshot = options.node(entry);
    source = {
      key: entry.key,
      data: entry.node,
      snapshot: { ...snapshot },
      children: getTreeDragChildren(entry),
      startX: event.clientX,
      indent: options.indent()
    };
    active = true;
    highlighted = entry.key;
    options.setExpanded(options.expanded().filter(key => key !== entry.key));
    const element = event.currentTarget;
    owner = element instanceof Element ? element.ownerDocument.defaultView : null;
    owner?.addEventListener('dragend', windowEnd);
    options.props().onDragStart?.({ event, node: snapshot });
    try {
      // Firefox требует запись DataTransfer; readonly transfer может отклонить её.
      event.dataTransfer?.setData('text/plain', '');
    } catch {
      // Ограничение браузера не отменяет начатый drag.
    }
    if (event.defaultPrevented) clean();
  }

  function resolve(event: DragEvent, entry: Entry<Data>) {
    if (!source || !active) return null;
    const element = event.target instanceof Element ? event.target : event.currentTarget;
    if (!(element instanceof Element)) return null;
    return resolveTreeDrop({
      index: options.index(),
      visible: options.visible(),
      expandedKeys: options.expanded(),
      dragNode: source.data,
      targetKey: entry.key,
      clientX: event.clientX,
      clientY: event.clientY,
      rect: element.getBoundingClientRect(),
      startX: source.startX,
      indent: source.indent,
      rtl: options.rtl(),
      allowDrop: options.props().allowDrop
    });
  }

  function allowed(candidate: TreeDropState | null) {
    if (!candidate?.dropAllowed || !source || !active) return false;
    const entry = options.index().entities.get(String(source.key));
    return Boolean(entry && !getTreeDragChildren(entry).includes(candidate.dropTargetKey));
  }

  function self(candidate: TreeDropState) {
    return source?.key === candidate.dropTargetKey && candidate.dropLevelOffset === 0;
  }

  function eventSnapshot(
    session: Pick<TreeDragSession<Data>, 'data' | 'snapshot'>
  ): TreeEventNode<Data> {
    // Source удерживает исходную data-ссылку и state начала drag раздельно.
    const { key, expanded, selected, checked, halfChecked, loaded, loading, pos, active,
      dragOver, dragOverGapTop, dragOverGapBottom } = session.snapshot;
    return { ...session.data, key, expanded, selected, checked, halfChecked, loaded, loading,
      pos, active, dragOver, dragOverGapTop, dragOverGapBottom };
  }

  function enter(event: DragEvent, entry: Entry<Data>) {
    if (disposed) return;
    event.preventDefault();
    event.stopPropagation();
    entered = entry.key;
    const candidate = resolve(event, entry);
    if (!allowed(candidate) || !candidate) {
      clearTarget();
      return;
    }
    const node = options.node(entry);
    const expandedKeys = [...options.expanded()];
    clearTimer();
    if (source && source.key !== entry.key) {
      const session = source;
      const delayed = { data: entry.node, snapshot: { ...node } };
      timer = setTimeout(() => {
        timer = undefined;
        if (disposed || source !== session || !active) return;
        const current = options.index().entities.get(String(entry.key));
        if (!current) return;
        const keys = [...options.expanded()];
        if (current.children.length && !keys.includes(current.key)) keys.push(current.key);
        options.setExpanded(keys);
        options.props().onExpand?.(keys, {
          expanded: true, node: eventSnapshot(delayed), nativeEvent: event
        });
      }, 800);
    }
    if (self(candidate)) {
      clearTarget();
      return;
    }
    target = candidate;
    options.props().onDragEnter?.({ event, node, expandedKeys });
  }

  function over(event: DragEvent, entry: Entry<Data>) {
    if (disposed) return;
    event.preventDefault();
    event.stopPropagation();
    const candidate = resolve(event, entry);
    if (!allowed(candidate) || !candidate) {
      // Source сохраняет прежний разрешённый target; следующий drop обходит запрет.
      clearTarget();
      return;
    }
    const node = options.node(entry);
    target = self(candidate) ? null : candidate;
    options.props().onDragOver?.({ event, node });
  }

  function leave(event: DragEvent, entry: Entry<Data>) {
    if (disposed) return;
    event.stopPropagation();
    const node = options.node(entry);
    const element = event.currentTarget;
    if (entered === entry.key && element instanceof Element
      && (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget))) {
      clearTarget();
      entered = null;
    }
    options.props().onDragLeave?.({ event, node });
  }

  function end(event: DragEvent, entry?: Entry<Data>) {
    if (disposed) return;
    event.stopPropagation();
    const node = entry ? options.node(entry) : source ? eventSnapshot(source) : undefined;
    clean();
    if (node) options.props().onDragEnd?.({ event, node });
  }

  function windowEnd(event: DragEvent) {
    const entry = source && options.index().entities.get(String(source.key));
    end(event, entry ?? undefined);
  }

  function drop(event: DragEvent, entry: Entry<Data>) {
    if (disposed) return;
    event.preventDefault();
    event.stopPropagation();
    if (highlighted === entry.key) highlighted = null;
    const session = source;
    const candidate = target;
    const node = candidate && options.index().entities.get(String(candidate.dropTargetKey));
    const permit = options.props().allowDrop;
    if (!session || !candidate || !node || !allowed(candidate) || self(candidate)
      || permit && !permit({
        dragNode: session.data, dropNode: node.node, dropPosition: candidate.dropPosition
      })) {
      clearTarget();
      return;
    }
    const snapshot = options.node(node);
    clearTimer();
    active = false;
    entered = null;
    clearTarget();
    options.props().onDrop?.({
      event,
      node: snapshot,
      dragNode: eventSnapshot(session),
      dragNodesKeys: [session.key, ...session.children],
      dropToGap: candidate.dropPosition !== 0,
      dropPosition: node.index + candidate.dropPosition
    });
  }

  return {
    draggable,
    start,
    enter,
    over,
    leave,
    end,
    drop,
    get draggingKey() { return active ? source?.key ?? null : null; },
    get highlightedKey() { return highlighted; },
    get target() { return target; },
    get indicatorStyle() {
      return target && source ? treeDropIndicatorStyle(target, source.indent, options.rtl()) : '';
    },
    flags(key: TreeKey) {
      const over = target?.dragOverNodeKey === key;
      return {
        dragOver: over && target?.dropPosition === 0,
        dragOverGapTop: over && target?.dropPosition === -1,
        dragOverGapBottom: over && target?.dropPosition === 1
      };
    },
    dispose() {
      disposed = true;
      clean();
    }
  };
}
