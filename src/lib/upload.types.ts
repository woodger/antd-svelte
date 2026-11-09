import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface UploadRcFile extends File {
  uid: string;
  lastModifiedDate?: Date;
}
export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'removed';
export interface UploadFile<T = unknown> {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  status?: UploadFileStatus;
  percent?: number;
  originFileObj?: UploadRcFile;
  response?: T;
  error?: Error | ProgressEvent;
  xhr?: XMLHttpRequest;
  url?: string;
  thumbUrl?: string;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}
export interface UploadLocale {
  uploading?: string;
  removeFile?: string;
  downloadFile?: string;
  uploadError?: string;
  previewFile?: string;
}
export interface UploadRequestOptions<T = unknown> {
  action: string;
  filename: string;
  file: UploadRcFile;
  method: string;
  data?: Record<string, unknown>;
  headers?: Record<string, string | null>;
  withCredentials?: boolean;
  onProgress?: (event: { percent: number; }) => void;
  onSuccess?: (response: T, xhr?: XMLHttpRequest) => void;
  onError?: (error: Error | ProgressEvent, response?: T) => void;
}
export interface UploadRequest {
  abort?: () => void;
}
export type UploadRequestHandler<T = unknown> = (
  options: UploadRequestOptions<T>
) => UploadRequest | void;
export interface UploadChangeParam<T = unknown> {
  file: UploadFile<T> | UploadRcFile;
  fileList: UploadFile<T>[];
  event?: { percent: number; };
}
export interface UploadListOptions<T = unknown> {
  showRemoveIcon?: boolean | ((file: UploadFile<T>) => boolean);
  showDownloadIcon?: boolean | ((file: UploadFile<T>) => boolean);
  showPreviewIcon?: boolean | ((file: UploadFile<T>) => boolean);
  extra?: Snippet<[UploadFile<T>]>;
}
/** Выбор и загрузка файлов с controlled list, beforeUpload и настраиваемым транспортом. */
export interface UploadProps<T = unknown> extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'onchange' | 'ondrop' | 'onerror' | 'onprogress'
> {
  /** Локальный namespace Upload/Dragger и списка; пустая строка наследует ConfigProvider. */
  prefixCls?: string;
  /** Управляемый список; изменения публикуются через onChange и ожидают принятия владельцем. */
  fileList?: readonly UploadFile<T>[];
  /** Начальный список при отсутствии fileList. */
  defaultFileList?: readonly UploadFile<T>[];
  /** @defaultValue 'file' */
  name?: string;
  /** @defaultValue '' */
  action?: string | ((file: UploadRcFile) => string | PromiseLike<string>);
  /** @defaultValue 'post' */
  method?: 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';
  data?:
  Record<string, unknown>
  | ((file: UploadFile<T>) => Record<string, unknown> | PromiseLike<Record<string, unknown>>);
  headers?: Record<string, string | null>;
  withCredentials?: boolean;
  /** @defaultValue '' */
  accept?: string | { format?: string; filter?: 'native' | ((file: File) => boolean); };
  /** @defaultValue false */
  multiple?: boolean;
  /**
   * Выбор папки и обход вложенных файлов при drop/paste; сохраняет webkitRelativePath.
   * @defaultValue false
   */
  directory?: boolean;
  /**
   * Вставка файлов из paste событий документа. Disabled блокирует вставку,
   * в отличие от отсутствующего guard у rc-upload 1.1.1.
   * @defaultValue false
   */
  pastable?: boolean;
  capture?: boolean | 'user' | 'environment';
  disabled?: boolean;
  /** false останавливает отправку, UPLOAD_LIST_IGNORE исключает файл из списка. */
  beforeUpload?: (
    file: UploadRcFile,
    fileList: UploadRcFile[]
  ) => void | boolean | string | Blob | PromiseLike<void | boolean | string | Blob>;
  /** Собственный транспорт; info.defaultRequest предоставляет исходную XHR-реализацию. */
  customRequest?: (
    options: UploadRequestOptions<T>,
    info: { defaultRequest: UploadRequestHandler<T>; }
  ) => UploadRequest | void;
  onChange?: (info: UploadChangeParam<T>) => void;
  /** false или Promise с false запрещает удаление файла. */
  onRemove?: (file: UploadFile<T>) => void | boolean | PromiseLike<void | boolean>;
  onDrop?: (event: DragEvent) => void;
  onPreview?: (file: UploadFile<T>) => void;
  onDownload?: (file: UploadFile<T>) => void;
  maxCount?: number;
  /** @defaultValue true */
  openFileDialogOnClick?: boolean;
  /** @defaultValue true */
  hasControlInside?: boolean;
  /** @defaultValue true */
  showUploadList?: boolean | UploadListOptions<T>;
  /** @defaultValue 'text' */
  listType?: 'text' | 'picture' | 'picture-card' | 'picture-circle';
  previewFile?: (file: File | Blob) => PromiseLike<string>;
  isImageUrl?: (file: UploadFile<T>) => boolean;
  /** Иконка файла с контекстом file/listType; готовая thumbnail по-прежнему показывает изображение. */
  iconRender?: Snippet<[file: UploadFile<T>, listType: NonNullable<UploadProps<T>['listType']>]>;
  locale?: UploadLocale;
  type?: 'select' | 'drag';
  children?: Snippet;
  rootClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLSpanElement;
  /** Нативный ref доступен после mount и очищается при unmount. */
  inputElement?: HTMLInputElement;
}
/** Upload с drag-and-drop поверхностью и дополнительной высотой контейнера. */
export interface UploadDraggerProps<T = unknown> extends UploadProps<T> {
  height?: number;
}
