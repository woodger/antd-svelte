<script lang="ts">
  import { Descriptions, type DescriptionsProps } from 'antd-svelte';

  let { id, kind = 'bordered', priority = false }: {
    id: string;
    kind?: string;
    priority?: boolean;
  } = $props();
  let bordered = $derived(!['plain', 'vertical', 'small', 'medium'].includes(kind));
  let items = $derived<DescriptionsProps['items']>([
    {
      key: 'a',
      label: 'Name',
      children: content,
      span: id === 'responsive' ? { xs: 1, md: 2 } : 1,
      labelStyle: priority ? 'color:#237804' : undefined,
      contentStyle: priority ? 'color:#c41d7f' : undefined,
      styles: priority ? { label: 'color:#531dab', content: 'color:#ad4e00' } : undefined
    },
    { key: 'b', label: 'Status', children: 'Active' },
    { key: 'c', label: 'Notes', children: 'Description', span: 'filled' },
    { key: 'd', label: 'Last', children: 'Value' }
  ]);
</script>

{#snippet content()}<input aria-label="Descriptions theme draft" value="Draft" />{/snippet}
<Descriptions data-descriptions-theme={id} title="Parameters" extra="Extra" {items} {bordered}
  column={id === 'responsive' ? { xs: 1, md: 3 } : 3}
  layout={kind.startsWith('vertical') ? 'vertical' : 'horizontal'}
  size={kind.startsWith('small') ? 'small' : kind.startsWith('medium') ? 'medium' : undefined}
  style={priority ? '--ant-descriptions-colon-margin-left:17px' : undefined}
  labelStyle={priority ? 'color:#08979c' : undefined}
  contentStyle={priority ? 'color:#08979c' : undefined}
  styles={priority ? {
    root: '--ant-descriptions-colon-margin-left:13px',
    header: 'margin-bottom:37px',
    title: 'color:#0958d9',
    extra: 'color:#c41d7f',
    label: 'background-color:#fff1f0;color:#d4380d',
    content: 'color:#0958d9'
  } : undefined} />
