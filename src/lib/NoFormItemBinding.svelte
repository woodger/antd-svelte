<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideConfig, useConfig, type ConfigContext } from './config-context';
  import { provideFormField, useForm } from './form-context';

  let { children }: { children: Snippet } = $props();
  const config = useConfig();
  const form = useForm();

  // Label/пояснения остаются в Form, но не являются controls текущего поля.
  provideFormField(undefined);
  if (form) {
    const context: ConfigContext = Object.create(config, {
      componentDisabled: { get: () => form.disabled }
    });
    provideConfig(context);
  }
</script>

{@render children()}
