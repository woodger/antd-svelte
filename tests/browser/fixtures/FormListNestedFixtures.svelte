<script lang="ts">
  import { Button, Form, FormItem, FormList, Input, createForm } from 'antd-svelte';

  interface Group {
    title: string;
    users?: { name: string }[];
  }

  const form = createForm<{ groups: Group[] }>({ initialValues: {
    groups: [{ title: 'First', users: [{ name: 'Ada' }] }, { title: 'Second' }]
  } });
  const independent = createForm({ initialValues: { title: 'Independent' } });
  let submitted = $state('');
</script>

<section id="form-list-nested-fixture" aria-label="Nested lists">
  <Form {form} onFinish={(values) => { submitted = JSON.stringify(values); }}>
    <FormList name="groups">
      {#snippet children(groups, outer)}
        {#each groups as group (group.key)}
          <div data-group-key={group.key}>
            <FormItem name={[group.name, 'title']} label={`Group ${group.key}`}>
              <Input
                value={form.values.groups[group.name]?.title ?? ''}
                onValueChange={(value) => form.setFieldValue(['groups', group.name, 'title'], value)}
              />
            </FormItem>
            <FormList name={[group.name, 'users']} initialValue={[{ name: 'Nested default' }]}>
              {#snippet children(users, inner)}
                {#each users as user (user.key)}
                  <FormItem
                    name={[user.name, 'name']}
                    label={`Group ${group.key} user ${user.key}`}
                    rules={[{ required: true, message: 'Nested name required' }]}
                  >
                    <Input
                      value={form.values.groups[group.name]?.users?.[user.name]?.name ?? ''}
                      onValueChange={(value) => form.setFieldValue([
                        'groups', group.name, 'users', user.name, 'name'
                      ], value)}
                    />
                  </FormItem>
                {/each}
                <button type="button" onclick={() => inner.add({ name: 'New nested' })}>
                  Add user to group {group.key}
                </button>
              {/snippet}
            </FormList>
            <button type="button" onclick={() => outer.move(group.name, 0)}>
              Move group {group.key} to first
            </button>
            <button type="button" onclick={() => outer.remove(group.name)}>
              Remove group {group.key}
            </button>
          </div>
        {/each}
        <button type="button" onclick={() => outer.add({ title: 'New group' })}>Add group</button>
        <Form form={independent} component={false}>
          <FormItem name="title" label="Independent title">
            <Input
              value={independent.values.title}
              onValueChange={(value) => independent.setFieldValue('title', value)}
            />
          </FormItem>
        </Form>
      {/snippet}
    </FormList>
    <Button htmlType="submit">Submit nested lists</Button>
    <Button htmlType="reset">Reset nested lists</Button>
  </Form>
  <output aria-label="Nested list values">{JSON.stringify(form.values)}</output>
  <output aria-label="Submitted nested lists">{submitted}</output>
</section>
