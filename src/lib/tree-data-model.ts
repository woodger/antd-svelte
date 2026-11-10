import { buildTreeEntities, type TreeEntity } from './tree.engine';
import type {
  TreeDataEntity,
  TreeDataNode,
  TreeFieldNames,
  TreeInstance,
  TreeKey,
  TreeModelConfig
} from './tree.types';

function buildModelEntities<Data extends object>(
  data: readonly Data[],
  fieldNames?: TreeFieldNames
) {
  const index = buildTreeEntities(data, fieldNames);
  const entities = new Map<string, TreeDataEntity<Data>>();

  function walk(entries: readonly TreeEntity<Data>[], parent?: TreeDataEntity<Data>) {
    for (const entry of entries) {
      const entity: TreeDataEntity<Data> = {
        node: entry.node,
        nodes: [...(parent?.nodes ?? []), entry.node],
        index: entry.index,
        key: entry.key,
        pos: entry.pos,
        level: entry.level,
        parent
      };

      entities.set(String(entry.key), entity);
      if (parent) (parent.children ??= []).push(entity);
      walk(entry.children, entity);
    }
  }

  walk(index.roots);
  return entities;
}

/**
 * Аналог Tree.useTree для Svelte. Getter data и getter config.fieldNames читаются
 * при каждом getPath; индекс обновляется при смене их ссылок. Не создаёт DOM,
 * effects или timers, поэтому работает также вне компонента и при SSR.
 */
export function createTree<Data extends object = TreeDataNode>(
  source: readonly Data[] | (() => readonly Data[]),
  config: TreeModelConfig = {}
): TreeInstance<Data> {
  let previousData: readonly Data[] | undefined;
  let previousFields: TreeFieldNames | undefined;
  let entities = new Map<string, TreeDataEntity<Data>>();

  function getPath(key: TreeKey) {
    const data = typeof source === 'function' ? source() : source;
    const fields = config.fieldNames;
    if (data !== previousData || fields !== previousFields) {
      entities = buildModelEntities(data, fields);
      previousData = data;
      previousFields = fields;
    }

    const path: TreeDataEntity<Data>[] = [];
    let entity = entities.get(String(key));
    while (entity) {
      path.unshift(entity);
      entity = entity.parent;
    }

    return path;
  }

  return { getPath };
}
