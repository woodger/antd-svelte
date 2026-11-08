import type {
  FormConfig, FormProps, FormSemantic, FormSemanticSlots, FormValues
} from 'antd-svelte';

export interface FormSemanticSettings extends Omit<FormConfig, 'classNames' | 'styles'> {
  classNames?: FormSemanticSlots | 'callback' | 'empty';
  styles?: FormSemanticSlots | 'callback' | 'empty';
  component?: 'form' | false;
  disabled?: boolean;
}

const keys = ['root', 'label', 'content', 'help', 'helpItem', 'extra'] as const;

function flag(value: unknown) {
  return value === undefined ? 'unset' : typeof value === 'function' ? 'function' : String(value);
}

function classes(side: string): FormSemantic {
  return <Values extends FormValues>({ props }: { props: FormProps<Values> }) => {
    const flags = [
      `owner-layout-${props.layout}`, `owner-disabled-${props.disabled}`,
      `owner-colon-${flag(props.colon)}`, `owner-align-${flag(props.labelAlign)}`,
      `owner-wrap-${flag(props.labelWrap)}`, `owner-mark-${flag(props.requiredMark)}`,
      `owner-component-${flag(props.component)}`
    ].join(' ');

    return Object.fromEntries(keys.map((key) => [
      key, `owner-${side}-${key}${key === 'label' ? ` ${flags}` : ''}`
    ]));
  };
}

const styles: FormSemantic = ({ props }) => Object.fromEntries(keys.map((key, index) => [
  key, `color:rgb(${props.disabled ? 151 : 101}, ${21 + index}, ${31 + index});padding-left:${index + 1}px`
]));

export function formSemanticSettings(
  input: FormSemanticSettings | undefined, side: string
): (FormConfig & Pick<FormProps<FormValues>, 'component' | 'disabled'>) | undefined {
  if (!input) return;

  return {
    ...input,
    classNames: input.classNames === 'callback' ? classes(side)
      : input.classNames === 'empty' ? () => undefined : input.classNames,
    styles: input.styles === 'callback' ? styles
      : input.styles === 'empty' ? () => undefined : input.styles
  };
}
