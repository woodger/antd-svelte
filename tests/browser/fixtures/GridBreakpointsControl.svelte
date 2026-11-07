<script lang="ts">
  import { Row, Col } from 'antd-svelte';

  let { stateful = false }: { stateful?: boolean; } = $props();
  let rowElement = $state<HTMLDivElement>();
  let colElement = $state<HTMLDivElement>();
</script>

<div id="grid-breakpoints-control" style="width:640px;max-width:calc(100vw - 48px)">
  <form aria-label="Grid breakpoint form">
    <Row gutter={[
      { xs: 4, sm: 10, md: 16, lg: 20, xl: 24, xxl: 28, xxxl: 32 },
      { xs: 6, sm: 12, md: 18, lg: 24, xl: 30, xxl: 36, xxxl: 42 }
    ]} align={{ xs: 'top', sm: 'middle', md: 'bottom' }}
      justify={{ xs: 'start', sm: 'center', md: 'end' }} bind:nativeElement={rowElement}>
      <Col xs={24} sm={12} md={8} bind:nativeElement={colElement}>Column A{#if stateful}<input
          aria-label="Grid breakpoint draft" name="draft" value="Draft" style="width:100px" />{/if}</Col>
      <Col md={8}>Column B</Col>
    </Row>
    <Row gutter={[10, 12]} wrap={false}>
      <Col span={16} offset={2} order={3} push={2} pull={1}
        xs={{ span: 24, offset: 0, order: 0, push: 0, pull: 0 }}
        sm={{ span: 12, offset: 1, order: 2, push: 2, pull: 1 }}
        md={{ span: 0, offset: 0, order: 0, push: 0, pull: 0 }}
        lg={{ span: 8, offset: 2, order: 1, push: 0, pull: 0 }}
        xl={{ span: 10 }} xxl={{ span: 6 }} xxxl={{ span: 4 }}>Reset</Col>
      <Col xs={{ flex: 'auto' }} sm={{ flex: '100px' }} md={{ flex: 2 }}
        lg={{ flex: 0 }} xl={{ flex: '25%' }} xxl={{ flex: 'auto' }}
        xxxl={{ flex: '0 0 40%' }}>Flex</Col>
      <Col xs={24} sm={12} md={8}
        style="flex:0 0 73px;max-width:73px;order:8;--ant-grid-display:flex">Styled</Col>
    </Row>
    <Row><Col span={24} xs={24} sm={20} md={16} lg={12} xl={8} xxl={4} xxxl={2}>All screens</Col></Row>
  </form>
  <output aria-label="Grid breakpoint refs">{Boolean(rowElement)}:{Boolean(colElement)}</output>
</div>
