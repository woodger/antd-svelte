import type { Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type {
  TreeSelectComponents, TreeSelectInputAttributes, TreeSelectInputContext,
  TreeSelectInputRegistration, TreeSelectProps, TreeSelectRootAttributes,
  TreeSelectRootContext, TreeSelectRootRegistration, TreeSelectSemanticInfo,
  TreeSelectNode, TreeSelectValue, TreeSelectEditorElement
} from 'antd-svelte';

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;
interface Entry { code: number; caption: string; }
type CustomProps = TreeSelectProps<number, Entry, HTMLButtonElement, HTMLTextAreaElement>;
type CustomInfo = TreeSelectSemanticInfo<number, Entry, HTMLButtonElement, HTMLTextAreaElement>;

function inferTreeSelectProps<Value extends TreeSelectValue = TreeSelectValue,
  Data extends object = TreeSelectNode, Root extends HTMLElement = HTMLDivElement,
  Editor extends TreeSelectEditorElement = HTMLInputElement>(props: TreeSelectProps<Value, Data, Root, Editor>) {
  return props;
}

export type TreeSelectComponentTypeAssertions = [
  Assert<Equal<TreeSelectProps['nativeElement'], HTMLDivElement | undefined>>,
  Assert<Equal<TreeSelectProps['inputElement'], HTMLInputElement | undefined>>,
  Assert<Equal<TreeSelectProps['onInputKeyDown'], HTMLInputAttributes['onkeydown']>>,
  Assert<Equal<TreeSelectProps['onFocus'], HTMLAttributes<HTMLDivElement>['onfocusin']>>,
  Assert<Equal<CustomProps['nativeElement'], HTMLButtonElement | HTMLDivElement | undefined>>,
  Assert<Equal<CustomProps['inputElement'], HTMLTextAreaElement | HTMLInputElement | undefined>>,
  Assert<Equal<CustomInfo['props']['components'], TreeSelectComponents<HTMLButtonElement, HTMLTextAreaElement> | undefined>>,
  Assert<Equal<CustomInfo['props']['inputElement'], CustomProps['inputElement']>>,
  Assert<Equal<ReturnType<TreeSelectInputContext['register']>, () => void>>,
  Assert<Equal<ReturnType<TreeSelectRootContext['register']>, () => void>>
];

export function treeSelectComponentProps(
  root: Snippet<[TreeSelectRootContext<HTMLButtonElement>]>,
  input: Snippet<[TreeSelectInputContext<HTMLTextAreaElement>]>
) {
  return {
    value: 1,
    treeData: [{ code: 1, caption: 'Alpha' }],
    components: {
      root: {
        render: root,
        props: {
          type: 'button', disabled: false,
          onmousedown(event) { const target: HTMLButtonElement = event.currentTarget; void target; }
        }
      },
      input: {
        render: input,
        props: {
          rows: 3, wrap: 'soft',
          onkeydown(event) { const target: HTMLTextAreaElement = event.currentTarget; void target; }
        }
      }
    },
    onChange(value) { const result: number = value; void result; },
    onSelect(_value, node) { const caption: string | undefined = node?.caption; void caption; },
    onInputKeyDown(event) {
      const target: HTMLInputElement | HTMLTextAreaElement = event.currentTarget;
      void target;
    },
    onFocus(event) { const target: HTMLButtonElement | HTMLDivElement = event.currentTarget; void target; },
    onpaste(event) { const target: HTMLInputElement | HTMLTextAreaElement = event.currentTarget; void target; },
    classNames({ props }) {
      const root: HTMLButtonElement | HTMLDivElement | undefined = props.nativeElement;
      const input: HTMLTextAreaElement | HTMLInputElement | undefined = props.inputElement;
      const value: number | undefined = props.value;
      void root; void input; void value;
      return { root: 'custom-tree-select' };
    }
  } satisfies CustomProps;
}

export function treeSelectComponentInference(
  root: Snippet<[TreeSelectRootContext<HTMLButtonElement>]>,
  input: Snippet<[TreeSelectInputContext<HTMLTextAreaElement>]>
) {
  const treeData: readonly Entry[] = [{ code: 1, caption: 'Alpha' }];
  const defaults = inferTreeSelectProps({
    value: 1, treeData,
    onChange(value) { const result: number = value; void result; },
    onSelect(_value, node) { const caption: string | undefined = node?.caption; void caption; }
  });
  const custom = inferTreeSelectProps({
    value: 1, treeData, components: { root, input },
    onChange(value) { const result: number = value; void result; },
    onSelect(_value, node) { const caption: string | undefined = node?.caption; void caption; }
  });
  const assertions: [
    Assert<Equal<typeof defaults.nativeElement, HTMLDivElement | undefined>>,
    Assert<Equal<typeof defaults.inputElement, HTMLInputElement | undefined>>,
    Assert<Equal<typeof custom.nativeElement, HTMLButtonElement | HTMLDivElement | undefined>>,
    Assert<Equal<typeof custom.inputElement, HTMLTextAreaElement | HTMLInputElement | undefined>>
  ] = [true, true, true, true];
  return { defaults, custom, assertions };
}

export function treeSelectComponentRegistrations(
  root: TreeSelectRootContext<HTMLButtonElement>,
  input: TreeSelectInputContext<HTMLTextAreaElement>,
  button: HTMLButtonElement,
  textarea: HTMLTextAreaElement,
  wrapper: HTMLSpanElement
) {
  const rootAttachment: Attachment<HTMLButtonElement> = root.register;
  const inputAttachment: Attachment<HTMLTextAreaElement> = input.register;
  const rootComposite: TreeSelectRootRegistration<HTMLButtonElement> = {
    nativeElement: button, focus: options => button.focus(options), blur: () => button.blur()
  };
  const inputComposite: TreeSelectInputRegistration<HTMLTextAreaElement> = {
    inputElement: textarea, nativeElement: wrapper,
    focus: options => textarea.focus(options), blur: () => textarea.blur()
  };
  const cleanupRoot: () => void = root.register(rootComposite);
  const cleanupInput: () => void = input.register(inputComposite);
  return { rootAttachment, inputAttachment, cleanupRoot, cleanupInput };
}

export function treeSelectComponentNegativeTypes(input: TreeSelectInputContext<HTMLTextAreaElement>) {
  // @ts-expect-error A textarea slot does not accept input-only attributes.
  const invalidInput: TreeSelectInputAttributes<HTMLTextAreaElement> = { type: 'text' };
  // @ts-expect-error A native input slot does not accept textarea-only attributes.
  const invalidTextarea: TreeSelectInputAttributes<HTMLInputElement> = { rows: 2 };
  // @ts-expect-error A button root does not accept textarea-only attributes.
  const invalidRoot: TreeSelectRootAttributes<HTMLButtonElement> = { rows: 2 };
  // @ts-expect-error Composite editor registration requires its actual native editor.
  const missingEditor: TreeSelectInputRegistration<HTMLTextAreaElement> = { nativeElement: document.body };
  // @ts-expect-error Root registration requires the declared native root type.
  const wrongRoot: TreeSelectRootRegistration<HTMLInputElement> = { nativeElement: document.body };
  // @ts-expect-error A textarea context cannot register a native input.
  input.register(document.createElement('input'));
  return { invalidInput, invalidTextarea, invalidRoot, missingEditor, wrongRoot };
}
