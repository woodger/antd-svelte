<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { provideFormField, useForm } from './form-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { formNamePath, type NamePath } from './form-store.engine';
  import type { ValidationRule } from './validation.engine';
  import { useFormList } from './form-list-context';
  import { captureFormResetFocus } from './form-reset.dom';

  /** Связывает поле модели Form с label, validation status и доступным описанием ошибок. */
  export interface FormItemProps {
    /** Буквальный ключ либо путь от ближайшего FormList; строка с точкой остаётся одним ключом. */
    name: NamePath;
    label: string;
    children: Snippet;
    help?: string;
    required?: boolean;
    /** Локальные правила поля; при отсутствии используются правила модели верхнего уровня. */
    rules?: readonly ValidationRule[];
    /**
     * False по умолчанию собирает все сообщения параллельно, true останавливает правила
     * последовательно, 'parallel' выбирает первую завершившуюся ошибку.
     * Предупреждение не обходит ожидающие блокирующие правила.
     */
    validateFirst?: boolean | 'parallel';
    htmlFor?: string;
    /**
     * Native element, bind:this либо объект с focus/nativeElement пользовательского control.
     * Имеет приоритет над встроенной регистрацией и возвращается getFieldInstance без обёртки.
     */
    controlRef?: unknown;
    class?: string;
  }

  let {
    name,
    label,
    children,
    help,
    required,
    rules,
    validateFirst,
    htmlFor,
    controlRef,
    class: className = ''
  }: FormItemProps = $props();

  const form = useForm();
  const list = useFormList();
  const componentTheme = useComponentTheme('Form');
  const generatedId = $props.id();
  let id = $derived(htmlFor ?? `ant-field-${generatedId}`);
  let path = $derived([...(list?.prefixName ?? []), ...formNamePath(name)]);
  let errors = $derived(form?.getFieldError(path) ?? []);
  let warnings = $derived(form?.getFieldWarning(path) ?? []);
  let isRequired = $derived(required
    ?? (rules ? rules.some((rule) => rule.required && !rule.warningOnly) : form?.isFieldRequired(path))
    ?? false);
  let descriptionId = $derived(errors.length || warnings.length || help ? `${id}-help` : undefined);
  let resetKey = $state.raw<object>({});
  let content: HTMLDivElement | undefined = $state();
  const controls = new Set<() => unknown>();

  $effect.pre(() => {
    // В списке metadata следует за key строки; обычное поле хранит её по имени модели.
    const registeredName = list ? undefined : path;

    return form?.registerField?.({
      get name() {
        return registeredName ?? path;
      },
      get rules() {
        return rules;
      },
      get validateFirst() {
        return validateFirst;
      },
      getInstance() {
        if (controlRef != null) return controlRef;
        for (const getInstance of controls) {
          const instance = getInstance();
          if (instance != null) return instance;
        }
      },
      getElement() {
        const host = content;
        if (!host?.isConnected) return;

        // Сначала свой binding: одинаковый htmlFor соседней формы не выбирает чужой control.
        return [...host.querySelectorAll<HTMLElement>('[id]')].find((node) => node.id === id)
          ?? host.ownerDocument.getElementById(id) ?? undefined;
      },
      onReset() {
        const restoreFocus = captureFormResetFocus(content, id);
        resetKey = {};
        if (restoreFocus) void tick().then(restoreFocus);
      }
    });
  });

  provideFormField({
    get id() {
      return id;
    },
    get name() {
      return path.map(String).join('_');
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
      return errors.length ? 'error' : warnings.length ? 'warning' : undefined;
    },
    get describedBy() {
      return descriptionId;
    },
    registerControl(getInstance) {
      controls.add(getInstance);
      return () => { controls.delete(getInstance); };
    },
    onBlur() {
      form?.touchField(path);
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
    !errors.length && warnings.length && 'ant-form-item-has-warning',
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
        <div bind:this={content} class="ant-form-item-control-input-content">{#key resetKey}{@render children()}{/key}</div>
      </div>
      {#if errors.length || warnings.length}
        <div id={descriptionId} class={[
          'ant-form-item-explain', errors.length && 'ant-form-item-explain-error'
        ]} role={errors.length ? 'alert' : 'status'}>
          {#each errors as error}<div class="ant-form-item-explain-error">{error}</div>{/each}
          {#each warnings as warning}<div class="ant-form-item-explain-warning">{warning}</div>{/each}
        </div>
      {:else if help}
        <div id={descriptionId} class="ant-form-item-extra">{help}</div>
      {/if}
    </div>
  </div>
</div>
