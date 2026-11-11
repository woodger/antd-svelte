<script lang="ts">
  import { createRawSnippet, onMount, tick, untrack } from 'svelte';
  import { ConfigProvider, Form, FormItem, Input, InputNumber, InputOTP, InputPassword,
    InputSearch, TextArea, Select, Calendar, ColorPicker, Mentions, Pagination, createForm, type FormFeedbackIcons,
    type FormFeedbackInfo, type FormItemProps, type FormValidateStatus } from 'antd-svelte';
  import FormStatusReadout from './FormStatusReadout.svelte';
  import { feedbackCaption, type FeedbackAction, type FeedbackMode } from './form-feedback-cases';
  import type { FeedbackControlSample } from './form-feedback-control-cases';

  let { sample }: { sample: FeedbackControlSample } = $props();
  let status = $state<FormValidateStatus | undefined>(untrack(() => sample.status));
  let feedback = $state(untrack(() => sample.feedback !== false));
  let mode = $state<FeedbackMode | undefined>(untrack(() => sample.mode));
  let revision = $state(0);
  let changedPrefix = $state(false);
  let active = $state(true);
  let selectedAction = $state('0');
  let input = $state<HTMLInputElement>();
  let textarea = $state<HTMLTextAreaElement>();
  let nativeRoot = $state<HTMLElement>();
  let numberRoot = $state<HTMLDivElement>();
  let pending: { resolve(): void; reject(error: Error): void; } | undefined;
  const model = createForm<{ node: string | number | null | undefined }>({
    initialValues: { node: untrack(() => sample.control === 'number' ? 12 : sample.control === 'select' ? 'a' : 'Alpha') }
  });
  const inner = createForm({ initialValues: {} });
  onMount(() => {
    let mounted = true;
    void tick().then(() => {
      if (mounted && sample.initialTouched) model.setFields([{ name: 'node', touched: true }]);
    });
    return () => { mounted = false; };
  });
  let prefix = $derived(changedPrefix ? 'updated' : sample.rootPrefix ?? 'ant');
  let componentPrefix = $derived(sample.treePrefix ?? `${prefix}-${sample.control === 'number' ? 'input-number' : sample.control === 'select' ? 'select' : 'input'}`);
  let common = $derived({ 'aria-label': 'Feedback field', prefixCls: sample.treePrefix,
    status: sample.treeStatus, disabled: sample.disabled, size: sample.size,
    ...(sample.control === 'number' ? { prefix: sample.affixes ? 'Prefix' : undefined,
      suffix: sample.affixes ? 'Suffix' : undefined, style: 'width:320px' } : sample.control === 'select'
      ? { allowClear: sample.clear } : { allowClear: sample.clear, showCount: sample.counter,
        prefix: sample.affixes ? 'Prefix' : undefined, suffix: sample.affixes ? 'Suffix' : undefined }) });
  function escape(value: string) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  }
  function content(label: string, info: FormFeedbackInfo) {
    const caption = feedbackCaption(label, revision, info.status);
    return createRawSnippet(() => ({ render: () => `<b data-custom-feedback="${label}" data-feedback-info="${escape(JSON.stringify(info))}">${escape(caption)}</b>` }));
  }
  function icons(label: string, selected: FeedbackMode): FormFeedbackIcons {
    return info => selected === 'empty-map' ? {} : { [info.status]: selected === 'false' ? false
      : selected === 'null' ? null : selected === 'zero' ? 0 : selected === 'true' ? true
        : selected === 'empty-array' ? [] : selected === 'array' ? ['[', content(label, info), ']'] : content(label, info) };
  }
  let hasFeedback = $derived<FormItemProps['hasFeedback']>(feedback ? mode ? { icons: icons('local', mode) } : true : false);
  function apply(action: FeedbackAction) {
    if (action === 'error') status = 'error';
    if (action === 'success') status = 'success';
    if (action === 'empty-status') status = '';
    if (action === 'auto-status') status = undefined;
    if (action === 'toggle-feedback') feedback = !feedback;
    if (action === 'update-icon') revision++;
    if (action === 'hide-icon') mode = 'false';
    if (action === 'show-icon') mode = 'custom';
    if (action === 'change-prefix') changedPrefix = true;
    if (action === 'errors') model.setFields([{ name: 'node', errors: ['Invalid <node>'], warnings: [], touched: false }]);
    if (action === 'warnings') model.setFields([{ name: 'node', errors: [], warnings: ['Check node'], touched: false }]);
    if (action === 'validated') model.setFields([{ name: 'node', errors: [], warnings: [], validating: false, touched: false }]);
    if (action === 'validate') void model.validateFields(['node']).catch(() => {});
    if (action === 'resolve') pending?.resolve();
    if (action === 'reject') pending?.reject(new Error('Rejected node'));
    if (action === 'reset') model.resetFields();
  }
</script>

{#snippet field()}
  <FormStatusReadout scope="control"><div data-feedback-control>
    {#if sample.control === 'number'}<InputNumber {...common} bind:inputElement={input} bind:nativeElement={numberRoot}
      value={model.values.node as number | null | undefined} onChange={value => model.setFieldValue('node', value)} />
    {:else if sample.control === 'select'}<Select {...common} value={model.values.node as 'a' | 'b' | undefined}
      options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]}
      onValueChange={value => model.setFieldValue('node', value)} showSearch />
    {:else if sample.control === 'textarea'}<TextArea aria-label="Feedback field" prefixCls={sample.treePrefix}
      status={sample.treeStatus} disabled={sample.disabled} size={sample.size}
      allowClear={sample.clear} showCount={sample.counter} rows={3}
      bind:nativeElement={textarea} bind:rootElement={nativeRoot}
      value={model.values.node as string} onValueChange={value => model.setFieldValue('node', value)} />
    {:else if sample.control === 'password'}<InputPassword {...common} bind:inputElement={input} bind:nativeElement={nativeRoot}
      value={model.values.node as string} onValueChange={value => model.setFieldValue('node', value)} />
    {:else if sample.control === 'search'}<InputSearch {...common} bind:inputElement={input} bind:nativeElement={nativeRoot}
      value={model.values.node as string} onValueChange={value => model.setFieldValue('node', value)} />
    {:else}<Input {...common} bind:inputElement={input} bind:nativeElement={nativeRoot}
      value={model.values.node as string} onValueChange={value => model.setFieldValue('node', value)} />{/if}
  </div></FormStatusReadout>
{/snippet}
{#snippet child()}
  {#if sample.boundary === 'calendar'}<FormStatusReadout scope="control"><div data-feedback-control><Calendar fullscreen={false} /></div></FormStatusReadout>
  {:else if sample.boundary === 'pagination'}<FormStatusReadout scope="control"><div data-feedback-control><Pagination total={100} showSizeChanger /></div></FormStatusReadout>
  {:else if sample.boundary === 'color'}<ColorPicker value="#123456" open panelRender={field} />
  {:else if sample.boundary === 'mentions'}<Mentions aria-label="Feedback mentions trigger" options={[{ value: 'alice' }]} popupRender={field} />
  {:else if sample.otp}<InputOTP length={2} value="12" status="warning" separator={() => field} />
  {:else if sample.nestedForm}<Form form={inner} component={false}>{@render field()}</Form>
  {:else if sample.noStyle}<FormItem noStyle prefixCls="inner-field" validateStatus={sample.innerStatus}
      hasFeedback={sample.noStyle === 'false' ? false : sample.noStyle === 'own' ? true : undefined}>
    {@render field()}</FormItem>{:else}{@render field()}{/if}
{/snippet}
<div data-feedback-case={sample.id} data-feedback-prefix={componentPrefix} data-feedback-kind={sample.control}
  data-feedback-refs={Boolean((input || textarea) && (nativeRoot || numberRoot))} style="margin:64px;width:420px">
  <ConfigProvider prefixCls={prefix} direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: { key: 'form-feedback-controls' }, token: { motion: false },
    mode: sample.theme === 'dark' ? 'dark' : 'light', compact: sample.theme === 'compact'
  }}>
    {#if active}<Form form={model} component={false} prefixCls={sample.formPrefix}
      feedbackIcons={sample.formIcons ? icons('form', 'custom') : undefined}>
      <FormItem name={sample.nameless ? undefined : 'node'} validateStatus={status} {hasFeedback} prefixCls={sample.itemPrefix}
        class="feedback-item" rules={sample.async ? [{
          validator: () => new Promise<void>((resolve, reject) => { pending = { resolve, reject }; })
        }] : [{}]}>{@render child()}</FormItem>
    </Form>{/if}
  </ConfigProvider>
</div>
<button type="button">Outside feedback</button>
<label>Feedback action<select bind:value={selectedAction}>
  {#each sample.actions ?? [] as action, index}<option value={String(index)}>{action}</option>{/each}
</select></label>
<button type="button" onclick={() => apply(sample.actions![Number(selectedAction)])}>Apply feedback action</button>
<button type="button" onclick={() => { active = false; }}>Unmount feedback</button>
