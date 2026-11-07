<script lang="ts">
  import { ConfigProvider, Form, Input, createForm, enUS, theme } from 'antd-svelte';
  import ConfigVariantControls from './ConfigVariantControls.svelte';
  import { configVariant, configVariantProps } from './config-variants-presets';
  import reference from './ant-design-config-variants-reference.json' with { type: 'json' };

  let { sample }: { sample?: typeof reference.cases[number]; } = $props();
  let selectedCase = $state('default');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let globalOverride = $state('preset');
  let formOverride = $state('preset');
  let changes = $state(0);
  const form = createForm({ initialValues: {} });
  const nestedForm = createForm({ initialValues: {} });
  let outer = $derived(configVariantProps(current.config));
  let inner = $derived(configVariantProps(current.nested));
  let globalVariant = $derived(globalOverride === 'preset' ? outer.variant
    : configVariant(globalOverride));
  let formVariant = $derived(configVariant(formOverride === 'preset'
    ? current.formVariant : formOverride));

  function resetCase() {
    globalOverride = 'preset';
    formOverride = 'preset';
    changes = 0;
  }
</script>

{#snippet controls()}
  <ConfigVariantControls variant={configVariant(current.localVariant)}
    bordered={current.bordered} onChanged={() => { changes++; }} />
{/snippet}

<section id="config-variants-fixture">
  <h2>Global and Form variants</h2>
  <label>Config variant case<select aria-label="Config variant case" bind:value={selectedCase}
    onchange={resetCase}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label>Global variant override<select aria-label="Global variant override" bind:value={globalOverride}>
    <option>preset</option><option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <label>Form variant override<select aria-label="Form variant override" bind:value={formOverride}>
    <option>preset</option><option>inherit</option><option>outlined</option><option>filled</option>
    <option>borderless</option><option>underlined</option>
  </select></label>
  <ConfigProvider {...outer} variant={globalVariant} locale={enUS}
    theme={{ cssVar: {}, token: { motion: false }, algorithm: current.theme === 'dark'
      ? theme.darkAlgorithm : current.theme === 'compact' ? theme.compactAlgorithm
        : theme.defaultAlgorithm }}>
    <ConfigProvider {...inner}>
      <Form {form} variant={formVariant} aria-label="Variant controls form">
        {#if current.nestedForm}
          <Form form={nestedForm} component={false}
            variant={configVariant(current.nestedFormVariant)} id="variant-context-only"
            class="variant-context-wrapper" style="outline-offset:99px">
            {@render controls()}
          </Form>
        {:else}{@render controls()}{/if}
      </Form>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Input defaultValue="Outside" aria-label="Outside variant sibling" />
  </ConfigProvider>
  <output aria-label="Variant changes">{changes}</output>
</section>
