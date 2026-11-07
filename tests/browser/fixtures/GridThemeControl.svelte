<script lang="ts">
  import { Row, Col } from 'antd-svelte';

  let { mode = 'default', prefix = 'ant' }: { mode?: string; prefix?: string; } = $props();
  let rowElement = $state<HTMLDivElement>();
  let colElement = $state<HTMLDivElement>();
  let clicks = $state(0);
</script>

<div id="grid-theme-control" style="width:640px;max-width:100%">
  <form aria-label="Grid theme form">
    <Row gutter={mode === 'no-gutter' ? 0 : [
      { xs: 4, sm: 10, md: 16 }, { xs: 6, sm: 12, md: 18 }
    ]} align={{ xs: 'top', sm: 'middle', md: 'bottom' }}
      justify={{ xs: 'start', sm: 'center', md: 'end' }} wrap={mode !== 'nowrap'}
      style={mode === 'row-style' ? `--${prefix}-font-size:27px;margin-inline:7px`
        : mode === 'row-style-canonical' ? '--ant-font-size:27px;margin-inline:7px' : undefined}
      bind:nativeElement={rowElement}>
      <Col xs={24} sm={12} md={8} flex={mode === 'nowrap' ? 'auto' : undefined}
        style={mode === 'col-style' ? `--${prefix}-font-size:29px;padding-inline:11px`
          : mode === 'col-style-canonical' ? '--ant-font-size:29px;padding-inline:11px' : undefined}
        bind:nativeElement={colElement}>Column A{#if mode === 'stateful'}<input
          aria-label="Grid draft" name="draft" value="Draft" style="width:100px" />{/if}</Col>
      <Col md={8} flex={mode === 'nowrap' ? 'auto' : undefined}>Column B{#if mode === 'stateful'}<button
          type="button" onclick={() => { clicks++; }}>Grid action</button>{/if}</Col>
    </Row>
  </form>
  <output aria-label="Grid theme refs">{Boolean(rowElement)}:{Boolean(colElement)}</output>
  <output aria-label="Grid theme actions">{clicks}</output>
</div>
