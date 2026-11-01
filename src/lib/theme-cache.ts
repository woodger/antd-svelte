import { DerivativeTheme } from './theme-derivative';
import type { MappingAlgorithm } from './theme-token.types';

interface ThemeCacheNode {
  map?: Map<MappingAlgorithm, ThemeCacheNode>;
  value?: [DerivativeTheme, number];
}

const cache = new Map<MappingAlgorithm, ThemeCacheNode>();
let keys: (readonly MappingAlgorithm[])[] = [];
let callCount = 0;

function getEntry(algorithms: readonly MappingAlgorithm[]) {
  let node: ThemeCacheNode | undefined = { map: cache };
  algorithms.forEach(algorithm => {
    node = node?.map?.get(algorithm);
  });

  return node?.value;
}

function deletePath(current: Map<MappingAlgorithm, ThemeCacheNode>, path: readonly MappingAlgorithm[]) {
  const node = current.get(path[0])!;
  if (path.length === 1) {
    if (!node.map) current.delete(path[0]);
    else current.set(path[0], { map: node.map });
    return;
  }

  deletePath(node.map!, path.slice(1));
  if ((!node.map || node.map.size === 0) && !node.value) current.delete(path[0]);
}

/** Кэш cssinjs 2.1.2 по цепочке функций; после 25 записей удаляет самую давнюю по использованию. */
export function createDerivativeTheme(
  derivatives: MappingAlgorithm | readonly MappingAlgorithm[]
): DerivativeTheme | undefined {
  const algorithms = typeof derivatives === 'function' ? [derivatives] : derivatives;
  let entry = getEntry(algorithms);
  if (!entry) {
    const theme = new DerivativeTheme(algorithms);
    if (keys.length + 1 > 25) {
      const oldest = keys.reduce((result, key) =>
        getEntry(key)![1] < getEntry(result)![1] ? key : result
      );
      keys = keys.filter(key => key.length !== oldest.length
        || key.some((algorithm, index) => algorithm !== oldest[index]));
      deletePath(cache, oldest);
    }

    keys.push(algorithms);
    let current = cache;
    algorithms.forEach((algorithm, index) => {
      if (index === algorithms.length - 1) {
        current.set(algorithm, { value: [theme, callCount++] });
      } else {
        const node = current.get(algorithm);
        if (!node) current.set(algorithm, { map: new Map() });
        else node.map ??= new Map();
        current = current.get(algorithm)!.map!;
      }
    });
    entry = getEntry(algorithms);
  }

  if (entry) entry[1] = callCount++;

  return entry?.[0];
}
