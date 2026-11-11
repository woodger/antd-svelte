<script lang="ts">
  import { createRawSnippet, onMount, tick, untrack } from 'svelte';
  import dayjs, { type Dayjs } from 'dayjs';
  import { ConfigProvider, Form, FormItem, DatePicker, RangePicker, TimePicker, TimeRangePicker, InputOTP, createForm, type RangePickerValue, type FormFeedbackIcons,
    type FormFeedbackInfo, type FormItemProps, type FormValidateStatus } from 'antd-svelte';
  import FormStatusReadout from './FormStatusReadout.svelte';
  import { feedbackCaption, type FeedbackMode } from './form-feedback-cases';
  import type { FeedbackPickerSample, FeedbackPickerAction } from './form-feedback-picker-cases';

  let { sample }: { sample: FeedbackPickerSample } = $props();
  let status = $state<FormValidateStatus | undefined>(untrack(() => sample.status));
  let feedback = $state(untrack(() => sample.feedback !== false));
  let mode = $state<FeedbackMode | undefined>(untrack(() => sample.mode));
  let revision = $state(0);
  let changedPrefix = $state(false);
  let active = $state(true);
  let selectedAction = $state('0');
  let suffixValue = $state(untrack(() => sample.suffix));
  let nativeRoot = $state<HTMLDivElement>();
  let pending: { resolve(): void; reject(error: Error): void; } | undefined;
  const model = createForm<{ node: Dayjs | RangePickerValue | null }>({ initialValues: {
    node: untrack((): Dayjs | RangePickerValue | null => sample.picker === 'range' || sample.picker === 'time-range'
      ? [dayjs('2025-03-04T12:13:14'), dayjs('2025-03-05T15:16:17')]
      : dayjs('2025-03-04T12:13:14'))
  } });
  const inner = createForm({ initialValues: {} });
  onMount(() => {
    let mounted = true;
    void tick().then(() => {
      if (mounted && sample.initialTouched) model.setFields([{ name: 'node', touched: true }]);
    });
    return () => { mounted = false; };
  });
  let prefix = $derived(changedPrefix ? 'updated' : sample.rootPrefix ?? 'ant');
  let componentPrefix = $derived(sample.treePrefix ?? `${prefix}-picker`);
  let common = $derived({ 'aria-label': 'Feedback picker', prefixCls: sample.treePrefix,
    status: sample.treeStatus, disabled: sample.disabled, size: sample.size, allowClear: true,
    style: 'width:360px' });
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
  function apply(action: FeedbackPickerAction) {
    if (action === 'suffix-default') suffixValue = undefined;
    if (action === 'suffix-null') suffixValue = null;
    if (action === 'suffix-false') suffixValue = false;
    if (action === 'suffix-empty') suffixValue = '';
    if (action === 'suffix-custom') suffixValue = 'custom';
    if (action === 'suffix-zero') suffixValue = 0;
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

{#snippet customSuffix()}<b data-picker-custom-suffix>Suffix</b>{/snippet}
{#snippet field()}
  <FormStatusReadout scope="control"><div data-feedback-picker-control>
    {#if sample.picker === 'date'}<DatePicker {...common} bind:nativeElement={nativeRoot}
      suffixIcon={suffixValue === 'custom' ? customSuffix : suffixValue === 'text' ? 'Scalar' : suffixValue}
      value={model.values.node as Dayjs | null} onChange={value => model.setFieldValue('node', value)} />
    {:else if sample.picker === 'range'}<RangePicker {...common} bind:nativeElement={nativeRoot}
      suffixIcon={suffixValue === 'custom' ? customSuffix : suffixValue === 'text' ? 'Scalar' : suffixValue}
      value={model.values.node as RangePickerValue} onChange={value => model.setFieldValue('node', value)} />
    {:else if sample.picker === 'time'}<TimePicker {...common} bind:nativeElement={nativeRoot}
      suffixIcon={suffixValue === 'custom' ? customSuffix : suffixValue === 'text' ? 'Scalar' : suffixValue}
      value={model.values.node as Dayjs | null} onChange={value => model.setFieldValue('node', value)} />
    {:else}<TimeRangePicker {...common} bind:nativeElement={nativeRoot}
      suffixIcon={suffixValue === 'custom' ? customSuffix : suffixValue === 'text' ? 'Scalar' : suffixValue}
      value={model.values.node as RangePickerValue} onChange={value => model.setFieldValue('node', value)} />{/if}
  </div></FormStatusReadout>
{/snippet}
{#snippet child()}
  {#if sample.otp}<InputOTP length={2} value="12" status="warning" separator={() => field} />
  {:else if sample.nestedForm}<Form form={inner} component={false}>{@render field()}</Form>
  {:else if sample.noStyle}<FormItem noStyle prefixCls="inner-field" validateStatus={sample.innerStatus}
      hasFeedback={sample.noStyle === 'false' ? false : sample.noStyle === 'own' ? true : undefined}>
    {@render field()}</FormItem>{:else}{@render field()}{/if}
{/snippet}
<div data-feedback-picker-case={sample.id} data-feedback-prefix={componentPrefix} data-feedback-picker-kind={sample.picker}
  data-feedback-refs={Boolean(nativeRoot)} style="margin:64px;width:420px">
  <ConfigProvider prefixCls={prefix} direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: { key: 'form-feedback-pickers' }, token: { motion: false },
    mode: sample.theme === 'dark' ? 'dark' : 'light', compact: sample.theme === 'compact'
  }} timePicker={{ suffixIcon: sample.configSuffix === 'custom' ? customSuffix : sample.configSuffix === 'text' ? 'Scalar' : sample.configSuffix }}
    datePicker={{ suffixIcon: sample.configSuffix === 'custom' ? customSuffix : sample.configSuffix === 'text' ? 'Scalar' : sample.configSuffix }}>
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
