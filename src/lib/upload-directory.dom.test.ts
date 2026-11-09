import { describe, expect, it } from 'vitest';
import { collectUploadDirectoryFiles } from './upload-directory.dom';

type Entry = ReturnType<DataTransferItem['webkitGetAsEntry']>;
const item = (entry: Entry) => ({ webkitGetAsEntry: () => entry });
const fileEntry = (file: File, path: string): FileSystemFileEntry => ({
  isFile: true, isDirectory: false, fullPath: path,
  file: (resolve: FileCallback) => resolve(file)
}) as FileSystemFileEntry;
const directoryEntry = (pages: FileSystemEntry[][]): FileSystemDirectoryEntry => ({
  isFile: false, isDirectory: true, fullPath: '/folder',
  createReader: () => {
    let cursor = 0;
    return { readEntries: (resolve: FileSystemEntriesCallback) => resolve(pages[cursor++] ?? []) };
  }
}) as FileSystemDirectoryEntry;

describe('collectUploadDirectoryFiles', () => {
  it('reads all directory batches and preserves breadth-first order and relative paths', async () => {
    const root = new File(['root'], 'root.txt');
    const first = new File(['first'], 'first.txt');
    const last = new File(['last'], 'last.txt');
    const deep = new File(['deep'], 'deep.txt');
    const nested = directoryEntry([[fileEntry(deep, '/folder/nested/deep.txt')]]);
    const directory = directoryEntry([
      [fileEntry(first, '/folder/first.txt'), nested],
      [fileEntry(last, '/folder/last.txt')]
    ]);

    const files = await collectUploadDirectoryFiles([
      item(directory), item(fileEntry(root, '/root.txt'))
    ], () => true);

    expect(files).toEqual([root, first, last, deep]);
    expect(files.map(file => file.webkitRelativePath)).toEqual([
      'root.txt', 'folder/first.txt', 'folder/last.txt', 'folder/nested/deep.txt'
    ]);
    expect(Object.getOwnPropertyDescriptor(first, 'webkitRelativePath')?.writable).toBe(false);
  });

  it('filters before assigning paths and retains an existing relative path', async () => {
    const ignored = new File(['ignore'], 'ignore.png');
    const kept = new File(['keep'], 'keep.txt');
    Object.defineProperty(kept, 'webkitRelativePath', { value: 'original/keep.txt' });

    const files = await collectUploadDirectoryFiles([
      item(fileEntry(ignored, '/folder/ignore.png')), item(fileEntry(kept, '/other/keep.txt'))
    ], file => file.name.endsWith('.txt'));

    expect(files).toEqual([kept]);
    expect(kept.webkitRelativePath).toBe('original/keep.txt');
    expect(ignored.webkitRelativePath).toBeUndefined();
  });

  it('skips missing entries and completes file read failures before processing the next file', async () => {
    const good = new File(['good'], 'good.txt');
    const bad = { isFile: true, isDirectory: false, fullPath: '/bad.txt',
      file: (_success: FileCallback, fail: ErrorCallback) => fail(new DOMException('No access'))
    } as FileSystemFileEntry;

    const files = await collectUploadDirectoryFiles([
      item(null), item(bad), item(fileEntry(good, '/good.txt'))
    ], () => true);

    expect(files).toEqual([good]);
    expect(good.webkitRelativePath).toBe('good.txt');
  });

  it('retains previously read entries when a later directory batch fails', async () => {
    const good = new File(['good'], 'good.txt');
    let cursor = 0;
    const directory = { isFile: false, isDirectory: true, fullPath: '/folder',
      createReader: () => ({ readEntries: (success: FileSystemEntriesCallback, fail: ErrorCallback) => {
        if (cursor++ === 0) success([fileEntry(good, '/folder/good.txt')]);
        else fail(new DOMException('No access'));
      } })
    } as FileSystemDirectoryEntry;

    const files = await collectUploadDirectoryFiles([item(directory)], () => true);

    expect(files).toEqual([good]);
    expect(good.webkitRelativePath).toBe('folder/good.txt');
  });
});
