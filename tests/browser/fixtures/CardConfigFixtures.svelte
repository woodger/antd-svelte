<script lang="ts">
  import {
    ConfigProvider, Form, Card, CardMeta, Input, createForm, theme,
    type CardConfig, type CardMetaConfig, type CardProps
  } from 'antd-svelte';
  import { cardConfigProfile, cardMetaConfigProfile } from './card-config-presets';
  import reference from './ant-design-card-config-reference.json' with { type: 'json' };

  let { sample, probeDefaults = false }: {
    sample?: typeof reference.cases[number];
    probeDefaults?: boolean;
  } = $props();
  let selectedCase = $state('default');
  let current = $derived(sample ?? reference.cases.find(item => item.name === selectedCase)
    ?? reference.cases[0]);
  let updated = $state(false);
  let small = $state(false);
  let showTitle = $state(true);
  let tabs = $state(false);
  let active = $state<string>();
  let changes = $state(0);
  const form = createForm({ initialValues: {} });
  let contextCard = $derived<CardConfig>({ ...cardConfigProfile(current.context),
    ...(updated ? { class: 'context-card-updated', style: 'opacity:0.6;outline-offset:7px' } : {}) });
  let contextMeta = $derived<CardMetaConfig>({ ...cardMetaConfigProfile(current.context),
    ...(updated ? { class: 'context-meta-updated', style: 'opacity:0.6;outline-offset:7px' } : {}) });
  let nestedCard = $derived<CardConfig | undefined>(current.nested === 'empty' ? {}
    : current.nested === 'replace' ? { class: 'context-card-replaced' } : undefined);
  let nestedMeta = $derived<CardMetaConfig | undefined>(current.nested === 'empty' ? {}
    : current.nested === 'replace' ? { class: 'context-meta-replaced' } : undefined);
  let localCard = $derived(cardConfigProfile(current.local, true));
  let localMeta = $derived(cardMetaConfigProfile(current.local, true));
  let size = $derived<CardProps['size']>(small || current.size === 'small' ? 'small' : undefined);
  let variant = $derived<CardProps['variant']>(current.variant === 'outlined' ? 'outlined' : undefined);

  function resetCase() {
    updated = false;
    small = false;
    showTitle = true;
    tabs = false;
    changes = 0;
  }
</script>

{#snippet cover()}<span>Cover</span>{/snippet}
{#snippet action()}<span>Action</span>{/snippet}
{#snippet avatar()}<span>Avatar</span>{/snippet}
{#snippet description()}
  Meta description
  <Input defaultValue="Meta draft" name="meta-draft" aria-label="Card Meta draft" />
{/snippet}

<section id="card-config-fixture">
  <h2>Card component configuration</h2>
  <label>Card config preset<select aria-label="Card config preset" bind:value={selectedCase}
    onchange={resetCase}>
    {#each reference.cases as item}<option value={item.name}>{item.name}</option>{/each}
  </select></label>
  <label><input type="checkbox" bind:checked={tabs} /> Enable configured Card tabs</label>
  <button onclick={() => { updated = !updated; }}>Update Card configuration</button>
  <button onclick={() => { small = !small; }}>Toggle configured Card size</button>
  <button onclick={() => { showTitle = !showTitle; }}>Toggle configured Meta title</button>
  <ConfigProvider card={contextCard} cardMeta={contextMeta} componentSize="medium"
    direction={current.direction === 'rtl' ? 'rtl' : 'ltr'}
    theme={{ cssVar: {}, token: { motion: false }, algorithm: current.theme === 'dark'
      ? theme.darkAlgorithm : current.theme === 'compact' ? theme.compactAlgorithm
        : theme.defaultAlgorithm, components: current.token ? { Card: { algorithm: true,
          colorPrimary: '#eb2f96', bodyPadding: 32, headerBg: '#fff0f6' } } : undefined }}>
    <ConfigProvider card={nestedCard} cardMeta={nestedMeta}>
      <Form {form} component={false}
        variant={current.formVariant === 'outlined' ? 'outlined' : undefined}>
        <form aria-label="Configured Card form" onsubmit={event => event.preventDefault()}>
          <Card {...localCard} title="Card title" extra="Extra" {cover} actions={[action]}
            loading={probeDefaults ? undefined : false}
            hoverable={probeDefaults ? undefined : false} tabProps={probeDefaults ? undefined : {}}
            classNames={probeDefaults ? ({ props }) => ({
              root: `native-defaults-${props.loading}-${props.hoverable}-${typeof props.tabProps}`
            }) : localCard.classNames}
            {size} {variant}
            tabList={tabs ? [{ key: 'one', label: 'One' }, { key: 'two', label: 'Two' }] : undefined}
            defaultActiveTabKey="one" bind:activeTabKey={active} onTabChange={() => { changes++; }}>
            <CardMeta {...localMeta} {avatar} title={showTitle ? 'Meta title' : ''} {description} />
            <Input defaultValue="Card draft" name="card-draft" aria-label="Card body draft" />
          </Card>
        </form>
      </Form>
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
    <Card class="outside-card-config" title="Outside">Outside Card</Card>
  </ConfigProvider>
  <output aria-label="Configured Card changes">{changes}</output>
</section>
