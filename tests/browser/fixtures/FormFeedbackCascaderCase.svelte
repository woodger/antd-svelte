<script lang="ts">
  import { createRawSnippet, onMount, tick, untrack } from 'svelte';
  import { ConfigProvider, Form, FormItem, InputOTP, Cascader, CascaderPanel, Input, createForm,
    type FormFeedbackIcons, type FormFeedbackInfo, type FormItemProps, type FormValidateStatus, type CascaderValue, type CascaderTriggerInfo } from 'antd-svelte';
  import FormStatusReadout from './FormStatusReadout.svelte';
  import { feedbackCaption, type FeedbackAction, type FeedbackMode } from './form-feedback-cases';
  import type { FeedbackCascaderSample } from './form-feedback-cascader-cases';
  let { sample }: { sample: FeedbackCascaderSample } = $props();
  let status = $state<FormValidateStatus | undefined>(untrack(() => sample.status));
  let feedback = $state(untrack(() => sample.feedback !== false));
  let mode = $state<FeedbackMode | undefined>(untrack(() => sample.mode));
  let revision = $state(0);
  let changedPrefix = $state(false);
  let active = $state(true);
  let selectedAction = $state('0');
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let pending: { resolve(): void; reject(error: Error): void; } | undefined;
  const model = createForm<{ node: CascaderValue<boolean> | undefined }>({
    initialValues: { node: untrack(() => sample.multiple ? [['p', 'a']] : ['p', 'a']) }
  });
  untrack(() => { if (sample.initialTouched) model.setFields([{ name: 'node', touched: true }]); });
  onMount(() => {
    let mounted = true;
    void tick().then(() => {
      if (mounted && sample.initialTouched) model.setFields([{ name: 'node', touched: true }]);
    });
    return () => { mounted = false; };
  });
  const inner = createForm({ initialValues: {} });
  let prefix = $derived(changedPrefix ? 'updated' : sample.rootPrefix ?? 'ant');
  function escape(value: string) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  }
  function content(label: string, info: FormFeedbackInfo) {
    const caption = feedbackCaption(label, revision, info.status);
    const data = JSON.stringify(info);
    return createRawSnippet(() => ({ render: () => `<b data-custom-feedback="${label}" data-feedback-info="${escape(data)}">${escape(caption)}</b>` }));
  }
  function icons(label: string, selectedMode: FeedbackMode): FormFeedbackIcons {
    return info => selectedMode === 'empty-map' ? {} : { [info.status]:
      selectedMode === 'false' ? false : selectedMode === 'null' ? null : selectedMode === 'zero' ? 0
        : selectedMode === 'true' ? true : selectedMode === 'empty-array' ? []
          : selectedMode === 'array' ? ['[', content(label, info), ']'] : content(label, info) };
  }
  let hasFeedback = $derived<FormItemProps['hasFeedback']>(feedback ? mode ? { icons: icons('local', mode) } : true : false);
  let globalIcons = $derived(sample.formIcons ? icons('form', 'custom') : undefined);
  async function validate() {
    await model.validateFields(['node']).catch(() => {});
  }
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
    if (action === 'validate') void validate();
    if (action === 'resolve') pending?.resolve();
    if (action === 'reject') pending?.reject(new Error('Rejected node'));
    if (action === 'reset') model.resetFields();
  }
</script>

{#snippet popup(menu: import('svelte').Snippet)}
  <FormStatusReadout scope="popup"><Input aria-label="Feedback popup control" /></FormStatusReadout>
  {@render menu()}
{/snippet}
{#snippet customSuffix()}<b data-custom-suffix>Suffix</b>{/snippet}
{#snippet trigger(info: CascaderTriggerInfo)}<button type="button" data-custom-trigger disabled={info.disabled}
  aria-expanded={info['aria-expanded']} aria-controls={info['aria-controls']}
  onclick={info.onClick} onkeydown={info.onKeyDown} onkeyup={info.onKeyUp}>Custom choice</button>{/snippet}
{#snippet tree()}
  <FormStatusReadout scope="control">
    <div data-feedback-control>
      {#if sample.panel}<CascaderPanel aria-label="Feedback choices" options={[{ value: 'p', label: 'Parent', children: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }] }]}
        value={model.values.node} multiple={sample.multiple} />
      {:else}<Cascader bind:nativeElement={root} bind:inputElement={input} prefixCls={sample.treePrefix}
        aria-label="Feedback selection" style="width:320px"
        options={[{ value: 'p', label: 'Parent', children: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }] }]}
        value={model.values.node} onChange={value => model.setFieldValue('node', value)}
        multiple={sample.multiple} loading={sample.loading} disabled={sample.disabled} status={sample.treeStatus}
        suffixIcon={sample.cascaderSuffix === 'null' ? null : sample.cascaderSuffix === 'false' ? false
          : sample.cascaderSuffix === 'custom' ? customSuffix : undefined}
        popupRender={sample.popup ? popup : undefined} children={sample.customTrigger ? trigger : undefined}
        showSearch allowClear size={sample.size} />{/if}
    </div>
  </FormStatusReadout>
{/snippet}
{#snippet child()}
  {#if sample.otp}<InputOTP length={2} value="12" status="warning" separator={() => tree} />
  {:else if sample.nestedForm}<Form form={inner} component={false}>{@render tree()}</Form>
  {:else if sample.noStyle}<FormItem noStyle hidden={sample.hidden} prefixCls="inner-field"
      validateStatus={sample.innerStatus}
      hasFeedback={sample.noStyle === 'false' ? false : sample.noStyle === 'own' ? true : undefined}>
    {@render tree()}
  </FormItem>{:else}{@render tree()}{/if}
{/snippet}

<div data-feedback-case={sample.id} data-feedback-prefix={sample.treePrefix ?? `${prefix}-select`}
  style="margin:64px;width:420px" data-feedback-ref={Boolean(root && input)}>
  <ConfigProvider prefixCls={prefix} direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: { key: 'form-feedback-source' }, token: { motion: false },
    mode: sample.theme === 'dark' ? 'dark' : 'light', compact: sample.theme === 'compact'
  }}>
    {#if active}<Form form={model} component={false} prefixCls={sample.formPrefix} feedbackIcons={globalIcons}>
      <FormItem name={sample.nameless ? undefined : 'node'} validateStatus={status} {hasFeedback}
        prefixCls={sample.itemPrefix} class="feedback-item" rules={sample.async ? [{
          validator: () => new Promise<void>((resolve, reject) => { pending = { resolve, reject }; })
        }] : [{}]}>
        {@render child()}
      </FormItem>
    </Form>{/if}
  </ConfigProvider>
</div>
<button type="button">Outside feedback</button>
<label>Feedback action<select bind:value={selectedAction}>
  {#each sample.actions ?? [] as action, index}<option value={String(index)}>{action}</option>{/each}
</select></label>
<button type="button" onclick={() => apply(sample.actions![Number(selectedAction)])}>Apply feedback action</button>
<button type="button" data-feedback-unmount onclick={() => { active = false; }}>Unmount feedback</button>
