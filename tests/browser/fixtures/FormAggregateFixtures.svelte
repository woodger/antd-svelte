<script lang="ts">
  import { Form, FormItem, FormList, Input, createForm, type NamePath } from 'antd-svelte';

  type Mode = 'fields' | 'empty' | 'list' | 'rows';
  const definitions: { name: NamePath; label: string }[] = [
    { name: ['user', 'name'], label: 'User name' },
    { name: ['user', 'role'], label: 'User role' },
    { name: 'user.name', label: 'Literal name' },
    { name: ['rows', 0, 'name'], label: 'Numeric row' },
    { name: ['rows', '0', 'name'], label: 'String row' }
  ];
  let mode = $state<Mode>('fields');
  let form = $state(createModel('fields'));
  let during = $state('');

  function createModel(mode: Mode) {
    return createForm<Record<string, unknown>>({ initialValues: mode === 'rows'
      ? { people: [{ name: 'Anna' }, { name: 'Bob' }] }
      : mode === 'list' ? { people: [] } : { user: {}, rows: [{}] }
    });
  }

  function choose(next: Mode) {
    mode = next;
    form = createModel(next);
    during = '';
  }

  function snapshot() {
    return {
      any: form.isFieldsTouched(), all: form.isFieldsTouched(true),
      userAny: form.isFieldsTouched([['user']]), userAll: form.isFieldsTouched([['user']], true),
      leavesAll: form.isFieldsTouched([['user', 'name'], ['user', 'role']], true),
      groupsAll: form.isFieldsTouched([['user'], 'user.name'], true),
      numeric: form.isFieldsTouched([['rows', 0]]), string: form.isFieldsTouched([['rows', '0']]),
      emptyAny: form.isFieldsTouched([]), emptyAll: form.isFieldsTouched([], true),
      missingAny: form.isFieldsTouched(['missing']), missingAll: form.isFieldsTouched(['missing'], true),
      rootAny: form.isFieldsTouched([[]]), rootAll: form.isFieldsTouched([[]], true),
      undefinedAll: form.isFieldsTouched(undefined, true),
      peopleAny: form.isFieldsTouched(['people']), peopleAll: form.isFieldsTouched(['people'], true),
      peopleRowsAll: form.isFieldsTouched([['people', 0], ['people', 1]], true)
    };
  }

  async function checkRuleless() {
    const validation = form.validateFields();
    during = JSON.stringify({ touched: snapshot(), validating: form.isFieldsValidating() });
    await validation;
  }
</script>

<section id="form-aggregate-fixture" aria-label="Form aggregate metadata">
  <Form {form}>
    {#if mode === 'fields'}
      {#each definitions as field (field.label)}
        <FormItem name={field.name} label={field.label}>
          <Input value={String(form.getFieldValue(field.name) ?? '')}
            onValueChange={(value) => form.setFieldValue(field.name, value)} />
        </FormItem>
      {/each}
    {:else if mode === 'list' || mode === 'rows'}
      <FormList name="people">
        {#snippet children(fields)}
          {#each fields as field (field.key)}
            <FormItem name={[field.name, 'name']} label={`Person ${field.name}`}>
              <Input value={String(form.getFieldValue(['people', field.name, 'name']) ?? '')} />
            </FormItem>
          {/each}
        {/snippet}
      </FormList>
    {/if}
  </Form>
  <button onclick={() => form.touchField(['user', 'name'])}>Touch name</button>
  <button onclick={() => form.touchField(['user', 'role'])}>Touch role</button>
  <button onclick={() => form.touchField('user.name')}>Touch literal</button>
  <button onclick={() => form.touchField(['rows', 0, 'name'])}>Touch numeric</button>
  <button onclick={() => form.touchField(['rows', '0', 'name'])}>Touch string</button>
  <button onclick={() => form.touchField(['people', 0, 'name'])}>Touch first person</button>
  <button onclick={() => form.touchField(['people', 1, 'name'])}>Touch second person</button>
  <button onclick={() => form.resetFields()}>Reset aggregate</button>
  <button onclick={checkRuleless}>Check ruleless</button>
  <button onclick={() => choose('empty')}>Show empty form</button>
  <button onclick={() => choose('list')}>Show empty list</button>
  <button onclick={() => choose('rows')}>Show rows</button>
  <button onclick={() => choose('fields')}>Show fields</button>
  <output aria-label="Aggregate touched">{JSON.stringify(snapshot())}</output>
  <output aria-label="Aggregate validating">{String(form.isFieldsValidating())}</output>
  <output aria-label="Ruleless during">{during}</output>
  <output aria-label="Aggregate fields">{JSON.stringify(form.getFieldsError())}</output>
</section>
