<script lang="ts">
  import { untrack } from 'svelte';
  import { useForm } from './form-context';
  import { provideFormList, useFormList } from './form-list-context';
  import { changeFormList, syncFormListKeys } from './form-list.engine';
  import { formNamePath } from './form-store.engine';
  import type { FormListOperation, FormListProps } from './form-list.types';

  let { name, initialValue, rules, children, prefixCls }: FormListProps = $props();
  const form = useForm();
  const parent = useFormList();
  if (!form) throw new Error('FormList requires Form');

  let prefixName = $derived([...(parent?.prefixName ?? []), ...formNamePath(name)]);
  untrack(() => form.initializeList(prefixName, initialValue));

  function readValues(): readonly unknown[] {
    const value = form!.getFieldValue(prefixName);

    return Array.isArray(value) ? value : [];
  }

  let values = $derived(readValues());
  let keys = $state.raw(untrack(() => syncFormListKeys(
    { keys: [], nextKey: 0 }, readValues()
  )));
  // React map пропускает holes; each получает плотный список реально существующих позиций.
  let fields = $derived(values.flatMap((_, index) => ({ name: index, key: keys.keys[index] })));
  let meta = $derived({
    errors: form.getFieldError(prefixName), warnings: form.getFieldWarning(prefixName)
  });

  provideFormList({
    get prefixCls() {
      return prefixCls || 'ant-form';
    },
    get prefixName() {
      return prefixName;
    }
  });

  $effect.pre(() => form.registerField?.({
    get name() {
      return prefixName;
    },
    get rules() {
      return rules;
    },
    get initialValue() {
      return initialValue;
    },
    isList: true,
    isListField: Boolean(parent)
  }));

  $effect.pre(() => {
    const current = values;
    untrack(() => {
      const next = syncFormListKeys(keys, current);
      if (next !== keys) keys = next;
    });
  });

  const operation: FormListOperation = {
    add(value, index) {
      const next = changeFormList(readValues(), keys, { type: 'add', value, index });
      if (!next) return;

      keys = next.state;
      form.changeList(prefixName, next.values);
    },
    remove(index) {
      const next = changeFormList(readValues(), keys, { type: 'remove', index });
      if (!next) return;

      keys = next.state;
      form.changeList(prefixName, next.values);
    },
    move(from, to) {
      const next = changeFormList(readValues(), keys, { type: 'move', from, to });
      if (!next) return;

      keys = next.state;
      form.changeList(prefixName, next.values);
    }
  };
</script>

{#key form.resetKey}
  {@render children(fields, operation, meta)}
{/key}
