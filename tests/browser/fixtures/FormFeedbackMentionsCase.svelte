<script lang="ts">
  import { createRawSnippet, untrack } from 'svelte';
  import { ConfigProvider, Form, FormItem, Mentions, Transfer, createForm,
    type FormFeedbackIcons, type FormItemProps, type FormValidateStatus } from 'antd-svelte';
  import FormStatusReadout from './FormStatusReadout.svelte';
  import { feedbackCaption, type FeedbackMode } from './form-feedback-cases';
  import type { MentionsFeedbackAction, MentionsFeedbackSample } from './form-feedback-mentions-cases';
  let { sample }: { sample: MentionsFeedbackSample } = $props();
  let status = $state<FormValidateStatus | undefined>(untrack(() => sample.status));
  let feedback = $state(untrack(() => sample.feedback !== false));
  let clear = $state(untrack(() => sample.clear));
  let mode = $state<FeedbackMode | undefined>(untrack(() => sample.mode));
  let revision = $state(0);
  let selectedAction = $state('0');
  let mounted = $state(true);
  let root = $state<HTMLDivElement>();
  let pending: { resolve(): void; reject(error: Error): void; } | undefined;
  const model = createForm<{ node: string | string[] }>({ initialValues: {
    node: untrack(() => sample.component === 'transfer' ? ['b'] : sample.id === 'mentions-interaction' ? '' : 'Alpha')
  } });
  const inner = createForm({ initialValues: {} });
  let prefix = $derived(sample.rootPrefix ?? 'ant');
  let componentPrefix = $derived(sample.treePrefix ?? `${prefix}-${sample.component}`);
  function escape(value: string) {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  }
  function icons(label: string, selected: FeedbackMode): FormFeedbackIcons {
    return info => {
      const caption = feedbackCaption(label, revision, info.status);
      const node = createRawSnippet(() => ({ render: () => `<b data-custom-feedback="${label}" data-feedback-info="${escape(JSON.stringify(info))}">${escape(caption)}</b>` }));
      return selected === 'empty-map' ? {} : { [info.status]: selected === 'false' ? false
        : selected === 'null' ? null : selected === 'zero' ? 0 : selected === 'true' ? true
          : selected === 'empty-array' ? [] : selected === 'array' ? ['[', node, ']'] : node };
    };
  }
  let hasFeedback = $derived<FormItemProps['hasFeedback']>(feedback ? mode ? { icons: icons('local', mode) } : true : false);
  function apply(action: MentionsFeedbackAction) {
    if (action === 'error') status = 'error';
    if (action === 'update-icon') revision++;
    if (action === 'toggle-feedback') feedback = !feedback;
    if (action === 'swap-affixes') { feedback = !feedback; clear = !clear; }
    if (action === 'hide-icon') mode = 'false';
    if (action === 'show-icon') mode = 'custom';
    if (action === 'validate') void model.validateFields(['node']).catch(() => {});
    if (action === 'resolve') pending?.resolve();
    if (action === 'reject') pending?.reject(new Error('Rejected node'));
    if (action === 'reset') model.resetFields();
  }
</script>
{#snippet control()}
  <FormStatusReadout scope="control"><div data-feedback-control>
    {#if sample.component === 'mentions'}<Mentions aria-label="Feedback mentions" prefixCls={sample.treePrefix}
      bind:nativeElement={root} value={model.values.node as string} onChange={value => model.setFieldValue('node', value)}
      options={[{ value: 'alice' }, { value: 'bob' }]} allowClear={clear} size={sample.size}
      onSelect={sample.toggleOnSelect ? () => { feedback = !feedback; } : undefined}
      status={sample.treeStatus} disabled={sample.disabled} style="width:320px" />
    {:else}<Transfer prefixCls={sample.treePrefix} bind:nativeElement={root} status={sample.treeStatus}
      showSearch={sample.search} targetKeys={model.values.node as string[]}
      onChange={value => model.setFieldValue('node', [...value] as string[])}
      dataSource={[{ key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' }, { key: 'c', title: 'Gamma' }]}
      render={item => item.title} titles={['Source', 'Target']} actions={['Move right', 'Move left']}
      styles={{ section: 'width:320px' }} locale={{ searchPlaceholder: 'Feedback search' }} />{/if}
  </div></FormStatusReadout>
{/snippet}
{#snippet child()}
  {#if sample.nestedForm}<Form form={inner} component={false}>{@render control()}</Form>
  {:else if sample.noStyle}<FormItem noStyle prefixCls="inner-field" validateStatus={sample.innerStatus}
      hasFeedback={sample.noStyle === 'false' ? false : sample.noStyle === 'own' ? true : undefined}>
    {@render control()}</FormItem>{:else}{@render control()}{/if}
{/snippet}
<div data-feedback-case={sample.id} data-feedback-prefix={componentPrefix} data-feedback-kind={sample.component}
  data-feedback-root-ref={Boolean(root)} style="margin:64px;width:800px">
  <ConfigProvider prefixCls={prefix} direction={sample.rtl ? 'rtl' : 'ltr'} theme={{
    cssVar: { key: 'form-feedback-mentions' }, token: { motion: false },
    mode: sample.theme === 'dark' ? 'dark' : 'light', compact: sample.theme === 'compact'
  }}>
    {#if mounted}<Form form={model} component={false} prefixCls={sample.formPrefix}
      feedbackIcons={sample.formIcons ? icons('form', 'custom') : undefined}>
      <FormItem name="node" validateStatus={status} {hasFeedback} prefixCls={sample.itemPrefix} class="feedback-item"
        rules={sample.async ? [{ validator: () => new Promise<void>((resolve, reject) => { pending = { resolve, reject }; }) }]
          : [{ type: sample.component === 'transfer' ? 'array' : 'string' }]}>
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
<button type="button" onclick={() => { mounted = false; }}>Unmount feedback</button>
