<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { provideFormField, useForm } from './form-context';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { formNamePath, type NamePath } from './form-store.engine';
  import type { ValidationRule } from './validation.engine';
  import { useFormList } from './form-list-context';
  import { captureFormResetFocus } from './form-reset.dom';
  import { enUS, type RenderEmptyContent } from './types';
  import RenderContent from './RenderContent.svelte';
  import Row from './Row.svelte';
  import Col from './Col.svelte';
  import NoFormItemColumns from './NoFormItemColumns.svelte';
  import type { ColProps } from './grid.types';
  import { resolveFormWrapperCol } from './form-columns.engine';
  import type { FormItemTooltip as FormItemTooltipContent } from './form.types';
  import { resolveFormTooltip } from './form-tooltip.engine';
  import FormItemTooltip from './FormItemTooltip.svelte';

  /** Связывает поле модели Form с label, validation status и доступным описанием ошибок. */
  export interface FormItemProps {
    /** Буквальный ключ либо путь от ближайшего FormList; строка с точкой остаётся одним ключом. */
    name: NamePath;
    /** Текст/число/массив/Snippet; false/null/undefined/'' скрывают label, null сохраняет offset. */
    label?: RenderEmptyContent;
    /** Содержимое подсказки либо Tooltip options; defaults наследуются из Form. */
    tooltip?: FormItemTooltipContent;
    children: Snippet;
    help?: string;
    /** Пояснение рядом с errors/warnings; reset пересоздаёт content, false/null/undefined/'' скрывают. */
    extra?: RenderEmptyContent;
    required?: boolean;
    /** Скрывает блок без удаления control, значения и регистрации validation. @defaultValue false */
    hidden?: boolean;
    /** Локальный layout поля; иначе наследуется ближайший Form, standalone остаётся vertical. */
    layout?: 'horizontal' | 'vertical';
    /** Локальное выравнивание подписи имеет приоритет над ближайшим Form. */
    labelAlign?: 'left' | 'right';
    /** Колонки label заменяют Form.labelCol целиком, включая явный {}. */
    labelCol?: ColProps;
    /** Колонки controls заменяют Form.wrapperCol; вложенные Item их не наследуют. */
    wrapperCol?: ColProps;
    /** Управляет добавленным colon; true имеет приоритет и над Form.colon=false. */
    colon?: boolean;
    /** Локальные правила поля; при отсутствии используются правила модели верхнего уровня. */
    rules?: readonly ValidationRule[];
    /**
     * False по умолчанию собирает все сообщения параллельно, true останавливает правила
     * последовательно, 'parallel' выбирает первую завершившуюся ошибку.
     * Предупреждение не обходит ожидающие блокирующие правила.
     */
    validateFirst?: boolean | 'parallel';
    /** Задержка автоматической validation в ms; validateFields/submit запускаются сразу. */
    validateDebounce?: number;
    htmlFor?: string;
    /**
     * Native element, bind:this либо объект с focus/nativeElement пользовательского control.
     * Имеет приоритет над встроенной регистрацией и возвращается getFieldInstance без обёртки.
     */
    controlRef?: unknown;
    /** Дополнительный класс корня поля; не передаётся в FormContext. */
    rootClassName?: string;
    /** Inline CSS корня после вычисленных компонентных токенов. */
    style?: string;
    class?: string;
  }

  let {
    name,
    label,
    tooltip,
    children,
    help,
    extra,
    required,
    hidden = false,
    layout,
    labelAlign,
    labelCol,
    wrapperCol,
    colon,
    rules,
    validateFirst,
    validateDebounce,
    htmlFor,
    controlRef,
    rootClassName,
    style,
    class: className = ''
  }: FormItemProps = $props();

  const form = useForm();
  const config = useConfig();
  const list = useFormList();
  const componentTheme = useComponentTheme('Form');
  const generatedId = $props.id();
  let id = $derived(htmlFor ?? `ant-field-${generatedId}`);
  let path = $derived([...(list?.prefixName ?? []), ...formNamePath(name)]);
  let resolvedLayout = $derived(layout ?? form?.layout ?? 'vertical');
  let resolvedLabelAlign = $derived(labelAlign ?? form?.labelAlign ?? 'right');
  let resolvedLabelCol = $derived(labelCol ?? form?.labelCol);
  let resolvedWrapperCol = $derived(resolveFormWrapperCol({
    label, labelCol, wrapperCol, formLabelCol: form?.labelCol, formWrapperCol: form?.wrapperCol
  }));
  let computedColon = $derived(colon === true || form?.colon !== false && colon !== false);
  let haveColon = $derived(resolvedLayout !== 'vertical' && computedColon);
  let hasLabel = $derived(label !== undefined && label !== null && label !== false && label !== '');
  let labelContent = $derived(typeof label === 'string' && haveColon && label.trim()
    ? label.replace(/[:：]\s*$/, '') : label);
  let labelledBy = $derived(hasLabel && typeof label !== 'string' && typeof label !== 'number'
    ? `${id}_label` : undefined);
  let requiredMark = $derived(form?.requiredMark ?? true);
  let tooltipOptions = $derived(resolveFormTooltip(tooltip, form?.tooltip));
  let optionalText = $derived(config.locale.Form?.optional || enUS.Form.optional);
  let errors = $derived(form?.getFieldError(path) ?? []);
  let warnings = $derived(form?.getFieldWarning(path) ?? []);
  let isRequired = $derived(required
    ?? (rules ? rules.some((rule) => rule.required && !rule.warningOnly) : form?.isFieldRequired(path))
    ?? false);
  let descriptionId = $derived(errors.length || warnings.length || help ? `${id}-help` : undefined);
  let hasExtra = $derived(extra !== undefined && extra !== null && extra !== false && extra !== '');
  let extraId = $derived(hasExtra ? `${id}_extra` : undefined);
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
      get validateDebounce() {
        return validateDebounce;
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
      return typeof label === 'string' || typeof label === 'number' ? String(label) : undefined;
    },
    get labelledBy() {
      return labelledBy;
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
      return [descriptionId, extraId].filter(Boolean).join(' ') || undefined;
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

{#snippet captionWithTooltip()}
  <RenderContent value={labelContent} />{#if tooltipOptions}<FormItemTooltip options={tooltipOptions} />{/if}
{/snippet}

<div class={[
    'ant-form-item',
    componentTheme.className && `ant-form-css-var ${componentTheme.className}`,
    `ant-form-item-${resolvedLayout}`,
    hidden && 'ant-form-item-hidden',
    errors.length && 'ant-form-item-has-error',
    !errors.length && warnings.length && 'ant-form-item-has-warning',
    className,
    rootClassName
  ]} style={[componentTheme.style, style].filter(Boolean).join(';') || undefined}>
  <Row class={['ant-form-item-row', componentTheme.className].filter(Boolean).join(' ')}>
    {#if hasLabel}
      <Col {...resolvedLabelCol} class={[
        'ant-form-item-label',
        resolvedLabelAlign === 'left' && 'ant-form-item-label-left',
        form?.labelWrap === true && 'ant-form-item-label-wrap',
        resolvedLabelCol?.class
      ].filter(Boolean).join(' ')}>
        <label for={id} id={labelledBy} class={form?.classNames?.label}
          style={form?.styles?.label} class:ant-form-item-required={isRequired}
          class:ant-form-item-required-mark-hidden={requiredMark === false}
          class:ant-form-item-required-mark-optional={requiredMark === 'optional'
            || typeof requiredMark === 'function'}
          class:ant-form-item-no-colon={!computedColon}
          title={typeof label === 'string' ? label : undefined} use:focusGroupLabel>
          {#key resetKey}
            {#if typeof requiredMark === 'function'}
              {@render requiredMark(tooltipOptions ? captionWithTooltip : labelContent,
                { required: isRequired })}
            {:else}
              {@render captionWithTooltip()}{#if requiredMark === 'optional' && !isRequired}<span class="ant-form-item-optional">{optionalText}</span>{/if}
            {/if}
          {/key}
        </label>
      </Col>
    {/if}
    <NoFormItemColumns>
      <Col {...resolvedWrapperCol}
        class={['ant-form-item-control', resolvedWrapperCol?.class].filter(Boolean).join(' ')}>
        <div class="ant-form-item-control-input">
          <div bind:this={content}
            class={['ant-form-item-control-input-content', form?.classNames?.content]}
            style={form?.styles?.content}>{#key resetKey}{@render children()}{/key}</div>
        </div>
        {#if errors.length || warnings.length}
          <div id={descriptionId} class={['ant-form-item-explain', form?.classNames?.help]}
            style={form?.styles?.help} role={errors.length ? 'alert' : 'status'}>
            {#each errors as error}
              <div class={['ant-form-item-explain-error', form?.classNames?.helpItem]}
                style={form?.styles?.helpItem}>{error}</div>
            {/each}
            {#each warnings as warning}
              <div class={['ant-form-item-explain-warning', form?.classNames?.helpItem]}
                style={form?.styles?.helpItem}>{warning}</div>
            {/each}
          </div>
        {:else if help}
          <div id={descriptionId} class={['ant-form-item-extra', form?.classNames?.help]}
            style={form?.styles?.help}>
            {#if form?.classNames?.helpItem || form?.styles?.helpItem}
              <div class={form?.classNames?.helpItem} style={form?.styles?.helpItem}>{help}</div>
            {:else}{help}{/if}
          </div>
        {/if}
        {#if hasExtra}
          <div id={extraId} class={['ant-form-item-extra', form?.classNames?.extra]}
            style={form?.styles?.extra}>{#key resetKey}<RenderContent value={extra} />{/key}</div>
        {/if}
      </Col>
    </NoFormItemColumns>
  </Row>
</div>
