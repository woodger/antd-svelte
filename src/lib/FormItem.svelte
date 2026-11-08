<script lang="ts">
  import { onDestroy, onMount, tick, untrack, type Snippet } from 'svelte';
  import type { FormFieldRegistration } from './form-internal';
  import type { FormFieldMeta } from './form.model.svelte';
  import { useForm, type FormFieldContext } from './form-context';
  import { useConfig } from './config-context';
  import { useComponentTheme } from './theme-component.svelte';
  import { formNamePath, type NamePath } from './form-store.engine';
  import type { ValidationRule } from './validation.engine';
  import { useFormList } from './form-list-context';
  import { captureFormControlResetFocus, captureFormResetFocus } from './form-reset.dom';
  import { getFormFieldElement } from './form-field.dom';
  import { enUS, type RenderEmptyContent } from './types';
  import RenderContent from './RenderContent.svelte';
  import Row from './Row.svelte';
  import Col from './Col.svelte';
  import NoFormItemColumns from './NoFormItemColumns.svelte';
  import type { ColProps } from './grid.types';
  import { resolveFormWrapperCol } from './form-columns.engine';
  import type { FormItemTooltip as FormItemTooltipContent } from './form.types';
  import type { FormValidateStatus } from './form-error-list.types';
  import { resolveFormStatus } from './form-status.engine';
  import { resolveFormTooltip } from './form-tooltip.engine';
  import FormItemTooltip from './FormItemTooltip.svelte';
  import NoFormItemBinding from './NoFormItemBinding.svelte';
  import FormItemBinding from './FormItemBinding.svelte';
  import FormItemStatusProvider from './FormItemStatusProvider.svelte';
  import { useFormItemStatusContext, type FormItemStatus } from './form-item-status';
  import { useFormItemMeta, type FormItemMetaContext } from './form-item-meta-context';
  import { mergeFormItemMessages, type FormItemMessages } from './form-no-style.engine';

  /** Связывает поле модели Form с label, validation status и доступным описанием ошибок. */
  export interface FormItemProps {
    /** Ключ/путь от FormList; без name остаётся layout без model binding, rules и native name. */
    name?: NamePath;
    /** Заполняет undefined перед render control/SSR; изменение prop используется будущим reset. */
    initialValue?: unknown;
    /** Текст/число/массив/Snippet; false/null/undefined/'' скрывают label, null сохраняет offset. */
    label?: RenderEmptyContent;
    /** Содержимое подсказки либо Tooltip options; defaults наследуются из Form. */
    tooltip?: FormItemTooltipContent;
    children: Snippet;
    /** Пояснение без errors/warnings; поддерживает rich content и сбрасывает state вместе с полем. */
    help?: RenderEmptyContent;
    /** Пояснение рядом с errors/warnings; reset пересоздаёт content, false/null/undefined/'' скрывают. */
    extra?: RenderEmptyContent;
    required?: boolean;
    /** Скрывает блок без удаления control, значения и регистрации validation. @defaultValue false */
    hidden?: boolean;
    /** Убирает layout; ошибки передаются ближайшему styled Item, help=false отключает передачу. */
    noStyle?: boolean;
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
    /** Визуальный статус поверх metadata; '' отключает автоматический, не очищая errors/ARIA. */
    validateStatus?: FormValidateStatus;
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
    initialValue,
    label,
    tooltip,
    children,
    help,
    extra,
    required,
    hidden = false,
    noStyle = false,
    layout,
    labelAlign,
    labelCol,
    wrapperCol,
    colon,
    rules,
    validateFirst,
    validateDebounce,
    validateStatus,
    htmlFor,
    controlRef,
    rootClassName,
    style,
    class: className = ''
  }: FormItemProps = $props();

  const form = useForm();
  const config = useConfig();
  const list = useFormList();
  const parentStatus = useFormItemStatusContext();
  const parentMeta = useFormItemMeta();
  const componentTheme = useComponentTheme('Form');
  const generatedId = $props.id();
  let hasName = $derived(name !== undefined && name !== null);
  let hasLayout = $derived(!noStyle || hidden);
  let id = $derived(htmlFor ?? `ant-field-${generatedId}`);
  let path = $derived([...(list?.prefixName ?? []), ...formNamePath(name ?? [])]);
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
  let labelledBy = $derived(hasLayout && hasName && hasLabel
    && typeof label !== 'string' && typeof label !== 'number'
    ? `${id}_label` : undefined);
  let requiredMark = $derived(form?.requiredMark ?? true);
  let tooltipOptions = $derived(resolveFormTooltip(tooltip, form?.tooltip));
  let optionalText = $derived(config.locale.Form?.optional || enUS.Form.optional);
  let errors = $derived(hasName ? form?.getFieldError(path) ?? [] : []);
  let warnings = $derived(hasName ? form?.getFieldWarning(path) ?? [] : []);
  let meta = $derived(hasName ? form?.getFieldMeta(path) : undefined);
  let status = $derived(resolveFormStatus({
    validateStatus, errors, warnings, touched: meta?.touched, validating: meta?.validating
  }) ?? (!hasLayout ? parentStatus.status : undefined));
  let isRequired = $derived(required
    ?? (hasName && (rules
      ? rules.some((rule) => rule.required && !rule.warningOnly) : form?.isFieldRequired(path)))
    ?? false);
  let hasHelp = $derived(help !== undefined && help !== null && help !== false && help !== '');
  const reportedFields = new Set<FormItemMessages>();
  let reportVersion = $state.raw<object>({});
  let reports = $derived.by(() => {
    void reportVersion;
    return [...reportedFields];
  });
  let messages = $derived(mergeFormItemMessages(errors, warnings, reports));
  let hasReportedMessages = $derived(reports.some(field => field.errors.length || field.warnings.length));
  let descriptionId = $derived(hasLayout && (hasName || hasReportedMessages)
    && (messages.errors.length || messages.warnings.length || hasHelp)
    ? `${id}-help` : undefined);
  let hasExtra = $derived(extra !== undefined && extra !== null && extra !== false && extra !== '');
  let extraId = $derived(hasLayout && hasName && hasExtra ? `${id}_extra` : undefined);
  let resetKey = $state.raw<object>({});
  let content: HTMLDivElement | undefined = $state();
  const controls = new Set<() => unknown>();
  let registration: FormFieldRegistration | undefined;
  let hasMetaEvent = false;
  let removeReport: (() => void) | undefined;
  const report: FormItemMessages = {
    get name() { return path; },
    get errors() { return errors; },
    get warnings() { return warnings; }
  };
  const collector: FormItemMetaContext = {
    get describedBy() { return descriptionId; },
    register(field) {
      reportedFields.add(field);
      reportVersion = {};

      return () => {
        // Canonical Set не читает прежние $state values во время teardown siblings.
        if (reportedFields.delete(field)) reportVersion = {};
      };
    }
  };

  function releaseReport() {
    removeReport?.();
    removeReport = undefined;
  }

  function syncReport() {
    if (!noStyle || !hasName || help === false || !hasMetaEvent || !parentMeta) {
      releaseReport();
      return;
    }
    removeReport ??= parentMeta.register(report);
  }

  function handleFieldMeta(value: FormFieldMeta | undefined) {
    hasMetaEvent = value !== undefined;
    syncReport();
  }

  function getControlInstance() {
    if (controlRef != null) return controlRef;
    for (const getInstance of controls) {
      const instance = getInstance();
      if (instance != null) return instance;
    }
  }

  function getControlElement() {
    const root = getFormFieldElement(getControlInstance());
    if (!root || root.id === id) return root;

    return [...root.querySelectorAll<HTMLElement>('[id]')].find(node => node.id === id) ?? root;
  }

  untrack(() => {
    if (hasName) form?.initializeField(path, initialValue);
    // SSR и поздний mount уже могут читать model-owned metadata до UI registration.
    hasMetaEvent = !!(errors.length || warnings.length || meta?.touched || meta?.validating);
    syncReport();
  });

  onDestroy(releaseReport);

  $effect.pre(() => {
    const active = noStyle && hasName && help !== false;
    untrack(() => {
      if (active && (errors.length || warnings.length || meta?.touched || meta?.validating)) {
        hasMetaEvent = true;
      }
      syncReport();
    });
  });

  $effect.pre(() => {
    if (!hasName) {
      registration = undefined;
      return;
    }

    // В списке metadata следует за key строки; обычное поле хранит её по имени модели.
    const registeredName = list ? undefined : path;

    registration = {
      mountKey: Symbol('ant-design-field-mount'),
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
      get initialValue() {
        return initialValue;
      },
      get onMetaChange() {
        return noStyle ? handleFieldMeta : undefined;
      },
      isListField: Boolean(list),
      getInstance: getControlInstance,
      getElement() {
        const host = content;
        if (!host?.isConnected) return getControlElement();

        // Сначала свой binding: одинаковый htmlFor соседней формы не выбирает чужой control.
        return [...host.querySelectorAll<HTMLElement>('[id]')].find((node) => node.id === id)
          ?? host.ownerDocument.getElementById(id) ?? undefined;
      },
      onReset() {
        const restoreFocus = hasLayout ? captureFormResetFocus(content, id)
          : captureFormControlResetFocus(getControlElement);
        resetKey = {};
        if (restoreFocus) void tick().then(restoreFocus);
      }
    };

    return form?.registerField?.(registration);
  });

  onMount(() => {
    if (registration?.mountKey) form?.markFieldMounted(registration.mountKey);
  });

  const itemStatus: FormItemStatus = {
    get status() { return status ?? ''; },
    get errors() { return errors; },
    get warnings() { return warnings; }
  };

  const fieldContext: FormFieldContext = {
    get id() {
      return hasName ? id : undefined;
    },
    get name() {
      return hasName ? path.map(String).join('_') : undefined;
    },
    get label() {
      return hasLayout && hasName && (typeof label === 'string' || typeof label === 'number')
        ? String(label) : undefined;
    },
    get labelledBy() {
      return labelledBy;
    },
    get disabled() {
      return form?.disabled;
    },
    get required() {
      return hasName && isRequired;
    },
    get status() {
      return status;
    },
    get invalid() {
      return hasName && (hasLayout ? messages.errors.length > 0 : errors.length > 0);
    },
    get describedBy() {
      if (!hasName) return;

      const controlDescription = hasLayout ? descriptionId
        : help !== false && (errors.length || warnings.length) ? parentMeta?.describedBy : undefined;

      return [controlDescription, extraId].filter(Boolean).join(' ') || undefined;
    },
    registerControl(getInstance) {
      controls.add(getInstance);
      return () => { controls.delete(getInstance); };
    },
    onBlur() {
      if (hasName) form?.touchField(path);
    }
  };

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

{#snippet itemLayout()}
  <div class={[
      'ant-form-item',
      componentTheme.className && `ant-form-css-var ${componentTheme.className}`,
      `ant-form-item-${resolvedLayout}`,
      hidden && 'ant-form-item-hidden',
      status === 'error' && 'ant-form-item-has-error',
      status === 'warning' && 'ant-form-item-has-warning',
      status === 'success' && 'ant-form-item-has-success',
      status === 'validating' && 'ant-form-item-is-validating',
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
          <NoFormItemBinding><label for={hasName ? id : htmlFor} id={labelledBy}
            class={form?.classNames?.label}
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
          </label></NoFormItemBinding>
        </Col>
      {/if}
      <NoFormItemColumns>
        <Col {...resolvedWrapperCol}
          class={['ant-form-item-control', resolvedWrapperCol?.class].filter(Boolean).join(' ')}>
          <div class="ant-form-item-control-input">
            <div bind:this={content}
              class={['ant-form-item-control-input-content', form?.classNames?.content]}
              style={form?.styles?.content}>{#key resetKey}<FormItemStatusProvider value={itemStatus} meta={collector}>{@render children()}</FormItemStatusProvider>{/key}</div>
          </div>
          {#if messages.errors.length || messages.warnings.length}
            <div id={descriptionId} class={['ant-form-item-explain', form?.classNames?.help]}
              style={form?.styles?.help} role={messages.errors.length ? 'alert' : 'status'}>
              {#each messages.errors as error}
                <div class={['ant-form-item-explain-error', form?.classNames?.helpItem]}
                  style={form?.styles?.helpItem}>{error}</div>
              {/each}
              {#each messages.warnings as warning}
                <div class={['ant-form-item-explain-warning', form?.classNames?.helpItem]}
                  style={form?.styles?.helpItem}>{warning}</div>
              {/each}
            </div>
          {:else if hasHelp}
            <div id={descriptionId} class={['ant-form-item-extra', form?.classNames?.help]}
              style={form?.styles?.help}>
              {#key resetKey}<NoFormItemBinding>{#if form?.classNames?.helpItem || form?.styles?.helpItem}
                <div class={form?.classNames?.helpItem} style={form?.styles?.helpItem}><RenderContent value={help} /></div>
              {:else}<RenderContent value={help} />{/if}</NoFormItemBinding>{/key}
            </div>
          {/if}
          {#if hasExtra}
            <div id={extraId} class={['ant-form-item-extra', form?.classNames?.extra]}
              style={form?.styles?.extra}>{#key resetKey}<NoFormItemBinding><RenderContent value={extra} /></NoFormItemBinding>{/key}</div>
          {/if}
        </Col>
      </NoFormItemColumns>
    </Row>
  </div>
{/snippet}

{#snippet itemBody()}
  {#if hasLayout}{@render itemLayout()}
  {:else}{#key resetKey}<FormItemStatusProvider value={itemStatus}>{@render children()}</FormItemStatusProvider>{/key}{/if}
{/snippet}

{#if hasName}
  <FormItemBinding field={fieldContext}>{@render itemBody()}</FormItemBinding>
{:else}
  <NoFormItemBinding><FormItemBinding field={fieldContext}>
    {@render itemBody()}
  </FormItemBinding></NoFormItemBinding>
{/if}
