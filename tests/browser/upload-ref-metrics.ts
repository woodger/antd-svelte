import type { UploadChangeParam, UploadFile } from 'antd-svelte';

export function describeUploadRefFile(file: UploadFile) {
  return {
    uid: file.uid,
    name: file.name,
    status: file.status ?? null,
    percent: Object.hasOwn(file, 'percent') ? file.percent ?? 'undefined' : 'missing',
    fileInstance: file instanceof File,
    originName: file.originFileObj?.name ?? null,
    response: file.response ?? null,
    error: file.error ? {
      name: 'name' in file.error ? file.error.name ?? null : null,
      message: 'message' in file.error ? file.error.message ?? null : null
    } : null,
    xhr: file.xhr ? { readyState: file.xhr.readyState } : null
  };
}

export function describeUploadRefChange(info: UploadChangeParam) {
  return {
    file: describeUploadRefFile(info.file),
    fileList: info.fileList.map(describeUploadRefFile),
    event: info.event ?? null
  };
}

export function readUploadRefTransport() {
  const count = (name: string) => Number(document.querySelector(`[data-ref-${name}]`)!.textContent);

  return {
    changes: count('callbacks'),
    requests: count('requests'),
    prepared: count('before'),
    aborted: count('aborted'),
    list: JSON.parse(document.querySelector('[data-ref-list]')!.textContent || '[]')
  };
}
