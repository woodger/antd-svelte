import type { Snippet } from 'svelte';
import type {
  HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes, HTMLTextareaAttributes
} from 'svelte/elements';

export type TreeSelectEditorElement = HTMLInputElement | HTMLTextAreaElement;

export type TreeSelectRootAttributes<RootElement extends HTMLElement = HTMLDivElement> =
  RootElement extends HTMLInputElement ? Omit<HTMLInputAttributes, 'children'>
    : RootElement extends HTMLTextAreaElement ? Omit<HTMLTextareaAttributes, 'children'>
    : RootElement extends HTMLButtonElement ? Omit<HTMLButtonAttributes, 'children'>
    : Omit<HTMLAttributes<RootElement>, 'children'>;
export type TreeSelectInputAttributes<EditorElement extends TreeSelectEditorElement = HTMLInputElement> =
  EditorElement extends HTMLTextAreaElement ? Omit<HTMLTextareaAttributes, 'children'>
    : Omit<HTMLInputAttributes, 'children'>;

export type TreeSelectRootRegistration<RootElement extends HTMLElement = HTMLDivElement> = RootElement | {
  nativeElement: RootElement;
  focus?(options?: FocusOptions): void;
  blur?(): void;
};
export type TreeSelectInputRegistration<EditorElement extends TreeSelectEditorElement = HTMLInputElement> = EditorElement | {
  inputElement: EditorElement;
  nativeElement?: HTMLElement;
  focus?(options?: FocusOptions): void;
  blur?(): void;
};

/** Примените merged attributes к корню и зарегистрируйте его DOM или composite ref. */
export interface TreeSelectRootContext<RootElement extends HTMLElement = HTMLDivElement> {
  attributes: TreeSelectRootAttributes<RootElement>;
  register: (ref: TreeSelectRootRegistration<RootElement>) => () => void;
}
/** Примените merged attributes к редактору и зарегистрируйте его DOM или composite ref. */
export interface TreeSelectInputContext<EditorElement extends TreeSelectEditorElement = HTMLInputElement> {
  attributes: TreeSelectInputAttributes<EditorElement>;
  register: (ref: TreeSelectInputRegistration<EditorElement>) => () => void;
}

export type TreeSelectRootComponent<RootElement extends HTMLElement = HTMLDivElement> =
  Snippet<[TreeSelectRootContext<RootElement>]> | {
    render: Snippet<[TreeSelectRootContext<RootElement>]>;
    /** Собственные attrs; callbacks вызываются после внутренних обработчиков корня. */
    props?: TreeSelectRootAttributes<RootElement>;
  };
export type TreeSelectInputComponent<EditorElement extends TreeSelectEditorElement = HTMLInputElement> =
  Snippet<[TreeSelectInputContext<EditorElement>]> | {
    render: Snippet<[TreeSelectInputContext<EditorElement>]>;
    /** Собственные attrs; callbacks вызываются перед внутренними обработчиками редактора. */
    props?: TreeSelectInputAttributes<EditorElement>;
  };
export interface TreeSelectComponents<
  RootElement extends HTMLElement = HTMLDivElement,
  EditorElement extends TreeSelectEditorElement = HTMLInputElement
> {
  /** Полная замена поля; стандартное содержимое и components.input не рендерятся. */
  root?: TreeSelectRootComponent<RootElement>;
  input?: TreeSelectInputComponent<EditorElement>;
}
