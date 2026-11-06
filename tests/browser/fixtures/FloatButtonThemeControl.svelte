<script lang="ts">
  import { ConfigProvider, FloatButton, FloatButtonBackTop, FloatButtonGroup } from 'antd-svelte';

  let {
    id,
    priority = false,
    prefix = 'ant',
    buttonStyle = false
  }: { id: string; priority?: boolean; prefix?: string; buttonStyle?: boolean; } = $props();
  let element = $state<HTMLButtonElement | HTMLAnchorElement>();
  let group = $state<HTMLDivElement>();
  let submissions = $state(0);
  let data = $state('');
  let grouped = $derived(['group-circle', 'group-square', 'group-menu', 'rtl'].includes(id));
  let menu = $derived(id === 'group-menu' || id === 'rtl');
  let styled = $derived(priority || id === 'priority');
  let style = $derived(styled
    ? 'width:58px;bottom:19px;gap:9px;color:rgb(255,0,0);z-index:77'
    : id === 'variable' ? `--${prefix}-control-height-lg:61px` : undefined);
  let styles = $derived(styled ? {
    root: `width:62px;color:rgb(0,128,0);--${prefix}-padding-xxs:7px`,
    icon: 'color:rgb(0,0,255)'
  } : undefined);
</script>

<ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'} button={buttonStyle ? {
  style: `--${prefix}-padding-xxs:5px;color:rgb(255,0,255)`
} : undefined}>
  <div data-float-theme={id} style="width:360px;height:260px;transform:translateZ(0)">
    <form onsubmit={event => {
      event.preventDefault();
      submissions++;
      data = String(new FormData(event.currentTarget).get('draft') ?? '');
    }}>
      {#if id === 'normal'}
        <input name="draft" aria-label="Float theme draft normal" value="Draft" />
      {/if}
      {#if grouped}
        <FloatButtonGroup
          bind:nativeElement={group}
          class="float-theme-group"
          shape={id === 'group-square' ? 'square' : 'circle'}
          trigger={menu ? 'click' : undefined}
          open={menu ? true : undefined}
          placement={id === 'rtl' ? 'right' : 'top'}
          type="primary"
          style={styled ? 'bottom:19px;gap:9px;z-index:77' : undefined}
          styles={styled ? {
            root: 'gap:13px', list: 'gap:11px', item: 'color:rgb(0,128,0)',
            trigger: 'color:rgb(0,0,255)'
          } : undefined}
          aria-label={`Float theme group ${id}`}
        >
          <FloatButton aria-label={`Float theme first ${id}`} />
          <FloatButton content="?" shape="square" aria-label={`Float theme second ${id}`} />
        </FloatButtonGroup>
      {:else if id === 'backtop'}
        <FloatButtonBackTop bind:nativeElement={element} class="float-theme-action"
          visibilityHeight={0} showProgress {style} {styles} aria-label={`Float theme action ${id}`} />
      {:else}
        <FloatButton
          bind:nativeElement={element}
          class="float-theme-action"
          type={id === 'primary' || id === 'disabled' ? 'primary' : 'default'}
          shape={id === 'content' ? 'square' : 'circle'}
          content={id === 'content' ? '?' : undefined}
          disabled={id === 'disabled'}
          badge={id === 'disabled' ? { count: 7 } : undefined}
          htmlType={id === 'normal' ? 'submit' : 'button'}
          {style} {styles} aria-label={`Float theme action ${id}`}
        />
      {/if}
    </form>
    <output aria-label={`Float theme ref ${id}`}>{element || group ? 'mounted' : 'none'}</output>
    <output aria-label={`Float theme submissions ${id}`}>{submissions}</output>
    <output aria-label={`Float theme data ${id}`}>{data}</output>
  </div>
</ConfigProvider>
