// Ant Design 6.6.8 / rc-upload 1.1.1 traverseFileTree; MIT, vendor/LICENSE.rc-upload.

/** Обходит FileSystemEntry в ширину, читая все порции directory reader. */
export async function collectUploadDirectoryFiles(
  items: Iterable<Pick<DataTransferItem, 'webkitGetAsEntry'>>,
  isAccepted: (file: File) => boolean
): Promise<File[]> {
  const pending = [...items].map(item => item.webkitGetAsEntry());
  const files: File[] = [];

  for (let index = 0; index < pending.length; index++) {
    const entry = pending[index];
    if (!entry) continue;

    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      // Source не передаёт error callback и оставляет Promise незавершённым при ошибке.
      const file = await new Promise<File | undefined>(resolve => {
        fileEntry.file(resolve, () => resolve(undefined));
      });
      if (!file || !isAccepted(file)) continue;

      if (entry.fullPath && !file.webkitRelativePath) {
        Object.defineProperty(file, 'webkitRelativePath', {
          value: entry.fullPath.replace(/^\//, ''), writable: false
        });
      }
      files.push(file);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      while (true) {
        const entries = await new Promise<FileSystemEntry[]>(resolve => {
          reader.readEntries(resolve, () => resolve([]));
        });
        if (!entries.length) break;

        pending.push(...entries);
      }
    }
  }

  return files;
}
