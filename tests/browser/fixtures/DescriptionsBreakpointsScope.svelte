<script module lang="ts">
  import type { ThemeConfig } from 'antd-svelte';

  export interface DescriptionsBreakpointsSample {
    id: string;
    token?: ThemeConfig['token'];
    spans?: boolean;
    bordered?: boolean;
    vertical?: boolean;
    defaultColumn?: boolean;
  }
</script>

<script lang="ts">
  import { Descriptions, type DescriptionsItem } from 'antd-svelte';

  let { sample }: { sample: DescriptionsBreakpointsSample } = $props();
  const column = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6, xxxl: 7 };
  let nativeElement = $state<HTMLDivElement>();
  let items = $derived<DescriptionsItem[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(
    (key, index) => ({
      key, label: `Label ${key}`, children: index === 0 ? draft : `Value ${key}`,
      ...(sample.spans ? { span: index === 1 ? { xs: 1, sm: 1, md: 2, lg: 2, xxxl: 3 }
        : index === 4 ? 'filled' as const : undefined } : {})
    })
  ));
</script>

{#snippet draft()}<input aria-label="Descriptions responsive draft" name="draft" value="Draft" />{/snippet}
<form aria-label="Descriptions responsive form">
  <section data-descriptions-breakpoints-host style="width:720px">
    <Descriptions class="fixture-descriptions-breakpoints" {items} bind:nativeElement
      column={sample.defaultColumn ? undefined : column} bordered={sample.bordered}
      layout={sample.vertical ? 'vertical' : 'horizontal'} />
  </section>
</form>
<output aria-label="Descriptions responsive ref">{nativeElement?.classList
  .contains('fixture-descriptions-breakpoints') ?? false}</output>
