import type {
  UploadFile,
  UploadProps,
  UploadRcFile,
  UploadRequest,
  UploadRequestHandler,
  UploadRequestOptions,
  UploadRef
} from './upload.types';
import {
  UPLOAD_LIST_IGNORE,
  uploadFileObject,
  updateUploadList,
  limitUploadList
} from './upload.engine';
// Жизненный цикл Upload 6.6.8 и AjaxUploader 1.1.1; MIT, vendor/LICENSE.ant-design и LICENSE.rc-upload.
export function createUploadController<T = unknown>(
  options: {
    props: () => UploadProps<T>;
    files: () => readonly UploadFile<T>[];
    setFiles: (files: UploadFile<T>[]) => void;
    defaultRequest: UploadRequestHandler<T>;
    uid: () => string;
  }
) {
  let disposed = false;
  const requests = new Map<string, UploadRequest | void>();
  const publish = (
    file: UploadFile<T> | UploadRcFile,
    list: readonly UploadFile<T>[],
    event?: { percent: number; }
  ) => {
    const result = limitUploadList(file, list, options.props().maxCount);
    options.setFiles(result.list);
    if (result.notify)
      options.props().onChange?.({ file, fileList: result.list, ...(event ? { event } : {}) });
  };
  const update = (
    file: UploadRcFile,
    patch: Partial<UploadFile<T>>,
    event?: { percent: number; }
  ) => {
    if (disposed || !options.files().some(item => item.uid === file.uid)) return;
    const item = { ...uploadFileObject<T>(file), ...patch };
    publish(item, updateUploadList(item, options.files()), event);
  };
  const onProgress: UploadRef<T>['onProgress'] = (event, file) => {
    update(file, { status: 'uploading', percent: event.percent }, event);
  };
  const onSuccess: UploadRef<T>['onSuccess'] = (response, file, xhr) => {
    let parsed: unknown = response;
    try {
      if (typeof response === 'string') parsed = JSON.parse(response);
    } catch { /* upstream сохраняет не-JSON строку */ }
    update(file, { status: 'done', percent: 100, response: parsed as T, xhr });
  };
  const onError: UploadRef<T>['onError'] = (error, response, file) => {
    update(file, { status: 'error', error, response });
  };
  const onBatchStart: UploadRef<T>['onBatchStart'] = batch => {
    if (disposed) return;
    const accepted = batch.filter(item => !Reflect.get(item.file, UPLOAD_LIST_IGNORE));
    let list = [...options.files()];
    const items = accepted.map(item => uploadFileObject<T>(item.file));
    for (const item of items) list = updateUploadList(item, list);
    accepted.forEach((item, index) => {
      if (item.parsedFile) {
        items[index].status = 'uploading';
        publish(items[index], list);
      } else {
        const clone = Object.assign(
          new File([item.file], item.file.name, { type: item.file.type }),
          { uid: item.file.uid }
        );
        publish(clone, list);
      }
    });
  };
  const abort = (file?: UploadFile<T> | string) => {
    const ids = file === undefined
      ? [...requests.keys()]
      : [typeof file === 'string' ? file : file.uid];
    for (const id of ids) {
      const request = requests.get(id);
      requests.delete(id);
      request?.abort?.();
    }
  };
  const process = async (file: UploadRcFile, batch: UploadRcFile[]) => {
    let result: Awaited<ReturnType<NonNullable<UploadProps<T>['beforeUpload']>>>;
    try {
      result = await options.props().beforeUpload?.(file, batch);
    } catch {
      result = false;
    }
    if (result === false
      || result === UPLOAD_LIST_IGNORE) return {
        origin: file,
        parsed: null,
        ignored: result === UPLOAD_LIST_IGNORE,
        action: '',
        data: {}
      };
    const props = options.props();
    const action = typeof props.action === 'function'
      ? await props.action(file)
      : props.action ?? '';
    const data = typeof props.data === 'function' ? await props.data(file) : props.data ?? {};
    // Строка beforeUpload в Ant wrapper не заменяет файл; Blob/File заменяют.
    const transformed = result && typeof result === 'object' ? result : file;
    const parsed = transformed instanceof File
      ? transformed as UploadRcFile
      : Object.assign(new File([transformed], file.name, { type: file.type }), { uid: file.uid });
    parsed.uid = file.uid;
    return { origin: file, parsed, ignored: false, action, data };
  };
  async function upload(files: readonly File[]) {
    const batch = files.map(file => Object.assign(file, { uid: options.uid() }));
    const ready = await Promise.all(batch.map(file => process(file, batch)));
    if (disposed) return;
    const accepted = ready.filter(item => !item.ignored);
    onBatchStart(accepted.map(item => ({ file: item.origin, parsedFile: item.parsed })));
    for (const item of accepted) {
      if (!item.parsed || disposed)
        continue;
      const props = options.props();
      const file = item.parsed;
      let completed = false;
      const requestOptions: UploadRequestOptions<T> = {
        action: item.action,
        data: item.data,
        file,
        filename: props.name ?? 'file',
        method: props.method ?? 'post',
        headers: props.headers,
        withCredentials: props.withCredentials,
        onProgress: event => onProgress(event, file),
        onSuccess: (response, xhr) => {
          completed = true;
          requests.delete(file.uid);
          onSuccess(response, file, xhr);
        },
        onError: (error, response) => {
          completed = true;
          requests.delete(file.uid);
          onError(error, response, file);
        }
      };
      const request = props.customRequest
        ? props.customRequest(requestOptions, { defaultRequest: options.defaultRequest })
        : options.defaultRequest(requestOptions);
      if (!completed)
        requests.set(file.uid, request);
    }
  }
  async function remove(file: UploadFile<T>) {
    const result = await options.props().onRemove?.(file);
    if (disposed || result === false) return;
    const list = options.files();
    const next = list.filter(item => item.uid !== file.uid);
    if (next.length === list.length) return;
    for (const item of list)
      if (item.uid === file.uid && !Object.isFrozen(item))
        item.status = 'removed';
    abort(file);
    publish({ ...file, status: 'removed' }, next);
  }
  return {
    upload,
    remove,
    abort,
    onBatchStart,
    onProgress,
    onSuccess,
    onError,
    dispose: () => {
      disposed = true;
      abort();
    }
  };
}
