<script lang="ts">
  import { createRawSnippet, onMount, tick, untrack } from 'svelte';
  import { AutoComplete, ConfigProvider, Form, FormItem, InputOTP, createForm,
    type AutoCompleteInput, type FormFeedbackIcons, type FormFeedbackInfo, type FormItemProps, type FormValidateStatus } from 'antd-svelte';
  import AutoCompletePrefixInput from './AutoCompletePrefixInput.svelte';
  import FormStatusReadout from './FormStatusReadout.svelte';
  import { feedbackCaption, type FeedbackAction, type FeedbackMode } from './form-feedback-cases';
  import type { FeedbackAutoCompleteSample } from './form-feedback-autocomplete-cases';
  let { sample }: { sample: FeedbackAutoCompleteSample } = $props();
  let status = $state<FormValidateStatus | undefined>(untrack(() => sample.status));
  let feedback = $state(untrack(() => sample.feedback !== false));
  let mode = $state<FeedbackMode | undefined>(untrack(() => sample.mode));
  let revision = $state(0);
  let changedPrefix = $state(false);
  let active = $state(true);
  let selectedAction = $state('0');
  let events = $state<(string | boolean)[][]>([]);
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement | HTMLTextAreaElement>();
  let pending: { resolve(): void; reject(error: Error): void; } | undefined;
  const model = createForm<{ node: string }>({ initialValues: { node: 'Alpha' } });
  const inner = createForm({ initialValues: {} });
  onMount(() => {
    let mounted = true;
    void tick().then(() => { if (mounted && sample.initialTouched) model.setFields([{ name: 'node', touched: true }]); });
    return () => { mounted = false; };
  });
  let prefix = $derived(changedPrefix ? 'updated' : sample.rootPrefix ?? 'ant');
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
    if (action === 'validate') void model.validateFields(['node']).catch(() => {});
    if (action === 'resolve') pending?.resolve();
    if (action === 'reset') model.resetFields();
  }
</script>

{#snippet customInput(control: AutoCompleteInput)}
  {#if sample.input === 'native-input'}<input {...control.attributes} use:control.register />
  {:else if sample.input === 'native-textarea'}<textarea {...control.attributes} use:control.register rows="3"></textarea>
  {:else}<AutoCompletePrefixInput {control} textarea={sample.input === 'textarea'} />{/if}
{/snippet}
{#snippet field()}
  <FormStatusReadout scope="control"><div data-feedback-autocomplete-control>
    <AutoComplete bind:nativeElement={root} bind:inputElement={input}
      aria-label="Feedback completion" prefixCls={sample.treePrefix} status={sample.treeStatus}
      disabled={sample.disabled} size={sample.size} allowClear={sample.clear} style="width:320px"
      open={sample.controlledOpen ? true : undefined}
      options={[{ value: 'Alpha' }, { value: 'Beta' }]} value={model.values.node}
      onChange={value => { events.push(['change', value === undefined ? 'undefined' : value]); model.setFieldValue('node', value ?? ''); }}
      onOpenChange={value => events.push(['open', value])} onClear={() => events.push(['clear'])}
      showSearch={{ onSearch: value => events.push(['search', value]) }}
      children={sample.input ? customInput : undefined} />
  </div></FormStatusReadout>
{/snippet}
{#snippet child()}
  {#if sample.otp}<InputOTP length={2} value="12" status="warning" separator={() => field} />
  {:else if sample.nestedForm}<Form form={inner} component={false}>{@render field()}</Form>
  {:else if sample.noStyle}<FormItem noStyle prefixCls="inner-field" validateStatus={sample.innerStatus}
    hasFeedback={sample.noStyle === 'false' ? false : sample.noStyle === 'own' ? true : undefined}>
    {@render field()}</FormItem>{:else}{@render field()}{/if}
{/snippet}
<div data-feedback-autocomplete={sample.id} data-feedback-prefix={sample.treePrefix ?? `${prefix}-select`}
  data-feedback-refs={Boolean(root && input)} style="margin:64px;width:420px">
  <ConfigProvider prefixCls={prefix} direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: { key: 'form-feedback-autocomplete' }, token: { motion: false },
    mode: sample.theme === 'dark' ? 'dark' : 'light', compact: sample.theme === 'compact'
  }}>
    {#if active}<Form form={model} component={false} prefixCls={sample.formPrefix}
      feedbackIcons={sample.formIcons ? icons('form', 'custom') : undefined}>
      <FormItem name="node" validateStatus={status} {hasFeedback} prefixCls={sample.itemPrefix}
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
<output data-feedback-completion-events>{JSON.stringify(events)}</output>
