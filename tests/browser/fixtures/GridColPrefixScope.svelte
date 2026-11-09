<script lang="ts">
  import {
    Col, Row, Form, FormItem, ConfigProvider, createForm, type ColProps, type FormProps
  } from 'antd-svelte';

  export interface ColPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    responsive?: boolean;
    responsiveFlex?: boolean;
    zero?: boolean;
    offset?: boolean;
    flex?: boolean;
    media?: boolean;
    aliases?: boolean;
    userStyle?: boolean;
    formLocal?: boolean;
    formLayout?: FormProps<Record<string, unknown>>['layout'];
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: ColPrefixSample;
    local?: boolean;
  } = $props();
  const form = createForm({ initialValues: {} });
  let nativeElement = $state<HTMLDivElement>();
  let prefixCls = $derived(local ? sample.local : undefined);
  let colProps = $derived<ColProps>(sample.responsive ? {
    span: 6, xs: 24, sm: 18, md: 12, lg: 8, xl: 6, xxl: 4, xxxl: 3
  } : sample.responsiveFlex ? {
    xs: { flex: 1 }, md: { flex: 2 }, lg: { flex: '80px' }
  } : sample.zero ? {
    span: 6, xs: { span: 0 }, md: { span: 12, order: 0, push: 0, pull: 0, offset: 0 }
  } : sample.flex ? { flex: 1 } : {
    span: 6, ...(sample.offset ? { offset: 2, push: 1, order: 2 } : {})
  });
</script>

<div data-col-prefix-scope={scope} style="width:480px;padding:12px">
  <Row gutter={16} wrap={!sample.flex} class="fixture-col-row">
    <Col {...colProps} {prefixCls} bind:nativeElement data-fixture-col="first"
      style={sample.userStyle ? 'flex:0 0 100px;max-width:100px' : undefined}>
      <input name="draft" value="Draft" aria-label={`${scope} column draft`} style="width:80px" />
    </Col>
    <Col {prefixCls} span={sample.flex ? undefined : 12} flex={sample.flex ? 2 : undefined}
      data-fixture-col="second">Middle</Col>
    <Col {prefixCls} span={sample.flex ? undefined : 6} flex={sample.flex ? 3 : undefined}
      data-fixture-col="third">Last</Col>
  </Row>
  {#snippet columnForm()}
  <Form {form} layout={sample.formLayout ?? 'horizontal'}
    labelCol={{ xs: 24, sm: 6, class: 'fixture-col-label',
      prefixCls: sample.formLocal ? 'label-column' : undefined }}
    wrapperCol={{ xs: 24, sm: 18, class: 'fixture-col-control',
      prefixCls: sample.formLocal ? 'control-column' : undefined }}>
    <FormItem label="Label" class="fixture-col-form-item">
      <input value="Field" aria-label={`${scope} form field`} style="width:80px" />
    </FormItem>
    <FormItem label="Stacked" class="fixture-col-form-item"
      labelCol={{ span: 24, class: 'fixture-col-label',
        prefixCls: sample.formLocal ? 'label-column' : undefined }}
      wrapperCol={{ span: 24, class: 'fixture-col-control',
        prefixCls: sample.formLocal ? 'control-column' : undefined }}>
      <input value="Field" aria-label={`${scope} stacked field`} style="width:80px" />
    </FormItem>
  </Form>
  {/snippet}
  {#if sample.media}
    <ConfigProvider theme={{ inherit: false, cssVar: {} }}>{@render columnForm()}</ConfigProvider>
  {:else}
    {@render columnForm()}
  {/if}
  <output aria-label={`${scope} column ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
</div>
