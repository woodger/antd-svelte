export interface DirectoryFixtureNode {
  kind: string;
  name: string;
  fullPath?: string;
  type?: string;
  existingPath?: string;
  pages?: DirectoryFixtureNode[][];
  readError?: boolean;
}

/** Моделирует callback FileSystemEntry API; порядок обхода определяет сам Upload. */
export function createDirectoryTransfer(nodes: DirectoryFixtureNode[]) {
  const transfer = new DataTransfer();
  const calls: { path: string; operation: string; errorHandler?: boolean }[] = [];
  const entry = (node: DirectoryFixtureNode): object | null => {
    if (node.kind === 'missing') return null;

    const fullPath = node.fullPath ?? `/${node.name}`;
    if (node.kind === 'directory') return {
      isDirectory: true, isFile: false, fullPath,
      createReader: () => {
        let cursor = 0;
        return {
          readEntries: (success: (entries: unknown[]) => void, failure?: (error: DOMException) => void) => {
            calls.push({ path: fullPath, operation: 'readEntries', errorHandler: Boolean(failure) });
            const page = node.pages?.[cursor++] ?? [];
            queueMicrotask(() => {
              if (node.readError) failure?.(new DOMException('Unreadable directory', 'NotReadableError'));
              else success(page.map(entry));
            });
          }
        };
      }
    };
    const file = new File([node.name], node.name, { type: node.type ?? 'text/plain' });
    if (node.existingPath) Object.defineProperty(file, 'webkitRelativePath', {
      value: node.existingPath, configurable: true
    });
    return {
      isDirectory: false, isFile: true, fullPath,
      file: (success: (file: File) => void, failure?: (error: DOMException) => void) => {
        calls.push({ path: fullPath, operation: 'file', errorHandler: Boolean(failure) });
        queueMicrotask(() => {
          if (node.readError) failure?.(new DOMException('Unreadable file', 'NotReadableError'));
          else success(file);
        });
      }
    };
  };
  const items = nodes.map(node => {
    transfer.items.add(new File([node.name], node.name, { type: node.type ?? '' }));
    const value = entry(node);
    return { kind: 'file', webkitGetAsEntry: () => value };
  });
  Object.defineProperty(transfer, 'items', { value: items });

  return { transfer, calls };
}
