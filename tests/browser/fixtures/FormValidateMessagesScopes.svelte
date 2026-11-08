<script lang="ts">
  import { ConfigProvider } from 'antd-svelte';
  import FormValidateMessagesCase from './FormValidateMessagesCase.svelte';

  let updatedOuter = $state(false);
  let updatedInner = $state(false);
  let outer = $derived({ required: `${updatedOuter ? 'Updated outer' : 'Outer'} \${label}` });
  let inner = $derived({ required: `${updatedInner ? 'Updated inner' : 'Inner'} \${label}` });
</script>

<section id="form-validate-message-scopes" aria-label="Template scope cases">
  <ConfigProvider form={{ validateMessages: outer }}>
    <FormValidateMessagesCase sample={{ id: 'outer-scope', value: '', rule: { required: true } }} />
    <ConfigProvider form={{ validateMessages: inner }}>
      <FormValidateMessagesCase sample={{ id: 'inner-scope', value: '', rule: { required: true } }} />
    </ConfigProvider>
    <FormValidateMessagesCase sample={{ id: 'sibling-scope', value: '', rule: { required: true } }} />
  </ConfigProvider>
  <button type="button" onclick={() => { updatedOuter = !updatedOuter; }}>Toggle outer templates</button>
  <button type="button" onclick={() => { updatedInner = !updatedInner; }}>Toggle inner templates</button>
</section>
