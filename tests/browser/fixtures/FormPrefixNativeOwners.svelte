<script lang="ts">
  import { ConfigProvider, Form, FormItem, FormList, FormErrorList, createForm } from 'antd-svelte';

  const model = createForm({ initialValues: { rows: [] } });
  const mediaModel = createForm({ initialValues: {} });
</script>

<Form form={model} component={false}>
  <div data-prefix-errors="item">
    <FormItem prefixCls="owner-field">
      <FormErrorList errors={['Item error']} />
    </FormItem>
  </div>
  <div data-prefix-errors="no-style">
    <FormItem prefixCls="owner-field">
      <FormItem prefixCls="ignored-field" noStyle>
        <FormErrorList errors={['Nested error']} />
      </FormItem>
    </FormItem>
  </div>
  <div data-prefix-errors="list">
    <FormList name="rows" prefixCls="list-feedback">
      {#snippet children()}
        <FormItem prefixCls="owner-field">
          <div class="list-feedback-item"><FormErrorList errors={['List error']} /></div>
        </FormItem>
      {/snippet}
    </FormList>
  </div>
</Form>

<ConfigProvider prefixCls="ant" theme={{ cssVar: {}, token: {
  screenXSMax: 639, screenSMMin: 640, screenSM: 640
} }}>
  <div data-prefix-errors="canonical-media">
    <Form form={mediaModel} component={false}>
      <FormItem><FormErrorList errors={['Media error']} /></FormItem>
    </Form>
  </div>
</ConfigProvider>
