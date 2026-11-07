<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideFormField, useForm } from './form-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { formNamePath, type NamePath } from './form-store.engine';
  import type { ValidationRule } from './validation.engine';

  /** Связывает поле модели Form с label, validation status и доступным описанием ошибок. */
  export interface FormItemProps {
    /** Буквальный ключ либо вложенный путь. Строка с точкой не разбивается на сегменты. */
    name: NamePath;
    label: string;
    children: Snippet;
    help?: string;
    required?: boolean;
    /** Локальные правила поля; при отсутствии используются правила модели верхнего уровня. */
    rules?: readonly ValidationRule[];
    htmlFor?: string;
    class?: string;
  }

  let {
    name,
    label,
    children,
    help,
    required,
    rules,
    htmlFor,
    class: className = ''
  }: FormItemProps = $props();

  const form = useForm();
  const componentTheme = useComponentTheme('Form');
  const generatedId = $props.id();
  let id = $derived(htmlFor ?? `ant-field-${generatedId}`);
  let errors = $derived(form?.getFieldError(name) ?? []);
  let isRequired = $derived(required
    ?? (rules ? rules.some((rule) => rule.required) : form?.isFieldRequired(name))
    ?? false);
  let descriptionId = $derived(errors.length || help ? `${id}-help` : undefined);

  $effect.pre(() => form?.registerField?.({
    get name() {
      return name;
    },
    get rules() {
      return rules;
    }
  }));

  provideFormField({
    get id() {
      return id;
    },
    get name() {
      return formNamePath(name).map(String).join('_');
    },
    get label() {
      return label;
    },
    get disabled() {
      return form?.disabled;
    },
    get required() {
      return isRequired;
    },
    get status() {
      return errors.length ? 'error' : undefined;
    },
    get describedBy() {
      return descriptionId;
    },
    onBlur() {
      form?.touchField(name);
    }
  });

  function focusGroupLabel(label: HTMLLabelElement) {
    function handleClick(event: MouseEvent) {
      if (!event.defaultPrevented && !label.control) {
        label.ownerDocument.getElementById(label.htmlFor)?.focus();
      }
    }

    label.addEventListener('click', handleClick);

    return {
      destroy() {
        label.removeEventListener('click', handleClick);
      }
    };
  }
</script>

<style>
  .ant-form-item-row { display: flex; flex-wrap: wrap; }
</style>

<div class={[
    'ant-form-item',
    componentTheme.className && `ant-form-css-var ${componentTheme.className}`,
    `ant-form-item-${form?.layout ?? 'vertical'}`,
    errors.length && 'ant-form-item-has-error',
    className
  ]} style={componentTheme.style}>
  <!-- Source Row/Col сбрасывают общие aliases, сохраняя наследование Form tokens. -->
  <div class={['ant-form-item-row', componentTheme.className]}>
    <div class="ant-form-item-label">
      <label for={id} class:ant-form-item-required={isRequired} title={label} use:focusGroupLabel>
        {label}
      </label>
    </div>
    <div class="ant-form-item-control">
      <div class="ant-form-item-control-input">
        <div class="ant-form-item-control-input-content">{@render children()}</div>
      </div>
      {#if errors.length}
        <div id={descriptionId} class="ant-form-item-explain ant-form-item-explain-error" role="alert">
          {#each errors as error}<div>{error}</div>{/each}
        </div>
      {:else if help}
        <div id={descriptionId} class="ant-form-item-extra">{help}</div>
      {/if}
    </div>
  </div>
</div>
