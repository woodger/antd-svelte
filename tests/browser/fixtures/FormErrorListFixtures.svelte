<script lang="ts">
  import {
    ConfigProvider, Form, FormErrorList, FormItem, FormList, createForm,
    type FormErrorListProps
  } from 'antd-svelte';
  import { onDestroy, untrack } from 'svelte';

  let { initial }: { initial?: FormErrorListProps } = $props();
  const form = createForm({ initialValues: { people: [] } });
  let messages = $state<FormErrorListProps>(untrack(() => initial ?? {}));
  let prefix = $state('ant-form');
  let mounted = $state(true);
  let callbacks = $state<boolean[]>([]);
  let reviewed = $state(0);
  let motion = $state(true);
  let recovery: ReturnType<typeof setTimeout> | undefined;

  onDestroy(() => clearTimeout(recovery));

  function recover() {
    messages = { errors: [], warnings: [] };
    clearTimeout(recovery);
    recovery = setTimeout(() => { messages = { errors: ['Recovered'], fieldId: 'people' }; }, 5);
  }
</script>

{#snippet review()}<button type="button" onclick={() => { reviewed++; }}>Review message</button>{/snippet}

<section id="form-error-list-fixture" aria-label="Form error list">
  <ConfigProvider theme={{
    cssVar: {}, token: { motion },
    components: { Form: { fontSize: 18, colorError: '#b81234', colorWarning: '#945600' } }
  }}>
    <Form {form}>
      <FormList name="people" prefixCls={prefix}>
        {#snippet children()}
          <FormItem name="feedback" label="Messages">
            <div class={prefix === 'ant-form' ? undefined : `${prefix}-item`}>
              {#if mounted}
                <FormErrorList {...messages} class="custom-help"
                  onVisibleChanged={(visible) => { callbacks.push(visible); }} />
              {/if}
            </div>
          </FormItem>
        {/snippet}
      </FormList>
    </Form>
  </ConfigProvider>
  <button onclick={() => {
    messages = { errors: ['First', 'Second'], warnings: ['Warning'], fieldId: 'people' };
  }}>Show errors</button>
  <button onclick={() => {
    messages = { help: 'Advice', helpStatus: 'warning', errors: ['Ignored'],
      warnings: ['Ignored warning'], fieldId: 'people' };
  }}>Show help</button>
  <button onclick={() => {
    messages = { help: '', helpStatus: 'error', errors: ['Ignored'] };
  }}>Show empty help</button>
  <button onclick={() => { messages = { help: false, errors: ['Ignored'] }; }}>Show false help</button>
  <button onclick={() => {
    messages = { help: 0, helpStatus: 'success', errors: ['Ignored'] };
  }}>Show zero help</button>
  <button onclick={() => {
    messages = { help: null, errors: ['Visible error'], fieldId: 'people' };
  }}>Show null help</button>
  <button onclick={() => {
    messages = { errors: ['toString', 'toString', 'constructor', '__proto__'],
      warnings: ['toString'], fieldId: 'people' };
  }}>Show duplicate messages</button>
  <button onclick={() => {
    messages = { errors: [], warnings: [], fieldId: 'people' };
  }}>Clear messages</button>
  <button onclick={() => {
    messages = { errors: ['Second', 'First'], warnings: ['Warning'], fieldId: 'people' };
  }}>Reorder messages</button>
  <button onclick={() => { messages = { errors: [review] }; }}>Show snippet message</button>
  <button onclick={recover}>Replace after short clear</button>
  <button onclick={() => { prefix = prefix === 'ant-form' ? 'custom-form' : 'ant-form'; }}>
    Toggle error prefix
  </button>
  <button onclick={() => { mounted = !mounted; }}>Toggle error list</button>
  <button onclick={() => { motion = !motion; }}>Toggle error motion</button>
  <output aria-label="Error list callbacks">{JSON.stringify(callbacks)}</output>
  <output aria-label="Reviewed messages">{reviewed}</output>
</section>
