<script lang="ts">
  import { Row, Col, type RowProps } from 'antd-svelte';

  export interface GridRowPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    nowrap?: boolean;
    responsive?: boolean;
    aliases?: boolean;
  }

  let { scope, sample, local = true }: {
    scope: string;
    sample: GridRowPrefixSample;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLDivElement>();
  let gutter = $derived<RowProps['gutter']>(sample.responsive ? [{ xs: 8, md: 24 }, 12] : [16, 12]);
  let align = $derived<RowProps['align']>(sample.responsive ? { xs: 'top', md: 'bottom' } : 'middle');
  let justify = $derived<RowProps['justify']>(sample.responsive
    ? { xs: 'start', md: 'space-around' } : 'space-between');
</script>

<form data-grid-row-prefix-scope={scope} style="width:480px" onsubmit={event => event.preventDefault()}>
  <Row bind:nativeElement prefixCls={local ? sample.local : undefined}
    class="fixture-row-prefix" {gutter} {align} {justify} wrap={sample.nowrap ? false : undefined}>
    <Col span={sample.nowrap ? undefined : 6} flex={sample.nowrap ? 1 : undefined}>
      <input aria-label={`${scope} row editor`} name="draft" value="Draft"
        style="width:90px;height:32px;box-sizing:border-box;font:inherit;padding:0;border:1px solid" />
    </Col>
    <Col span={sample.nowrap ? undefined : 12} offset={sample.nowrap ? undefined : 2}
      flex={sample.nowrap ? 2 : undefined}><div style="height:36px">Second</div></Col>
    <Col span={sample.nowrap ? undefined : 4} flex={sample.nowrap ? '80px' : undefined}>
      <div style="height:24px">Last</div>
    </Col>
  </Row>
  <output aria-label={`${scope} Row prefix ref`}>{nativeElement ? 'mounted' : 'empty'}</output>
</form>
