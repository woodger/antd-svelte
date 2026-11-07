<script lang="ts">
  import { BackTop, ConfigProvider } from 'antd-svelte';
  import type { BackTopTarget } from 'antd-svelte';

  let first = $state<HTMLDivElement>();
  let second = $state<HTMLDivElement>();
  let root = $state<HTMLDivElement>();
  let threshold = $state<number | undefined>(400);
  let duration = $state<number | undefined>(0);
  let targetKind = $state('first');
  let changed = $state(false);
  let customPrefix = $state(false);
  let localStyle = $state(false);
  let custom = $state('default');
  let replaced = $state(false);
  let mounted = $state(true);
  let animated = $state(false);
  let clicks = $state(0);
  let currentTarget = $state('');
  const getTarget = (): BackTopTarget | null => targetKind === 'first' ? first ?? null
    : targetKind === 'second' ? second ?? null : targetKind === 'window' ? window
      : targetKind === 'document' ? document : null;
</script>

{#snippet content()}{#if custom === 'empty'}{:else if custom === 'text'}Up{:else if replaced}<span
      data-back-top-custom style="display:block;width:180px;height:40px;background:#eee"><input
        aria-label="BackTop draft" name="draft" value="Draft" style="width:90px" /><button
        type="button">Custom top</button></span>{:else}<div data-back-top-custom
      style="display:flex;width:180px;height:40px;background:#eee"><input aria-label="BackTop draft"
        name="draft" value="Draft" style="width:90px" /><button type="button">Custom top</button></div>{/if}{/snippet}

<section id="back-top-fixture" aria-label="Deprecated BackTop fixture">
  <label>Deprecated BackTop threshold<input type="number" bind:value={threshold} /></label>
  <label>Deprecated BackTop duration<input type="number" bind:value={duration} /></label>
  <label>Deprecated BackTop target<select aria-label="Deprecated BackTop target"
      bind:value={targetKind}><option>first</option><option>second</option><option>window</option>
      <option>document</option><option>null</option></select></label>
  <label>Deprecated BackTop content<select aria-label="Deprecated BackTop content"
      bind:value={custom}><option>default</option><option>control</option><option>empty</option>
      <option>text</option></select></label>
  <label><input type="checkbox" bind:checked={customPrefix} /> Custom BackTop prefix</label>
  <label><input type="checkbox" bind:checked={localStyle} /> Local BackTop style</label>
  <label><input type="checkbox" bind:checked={replaced} /> Replace BackTop custom root</label>
  <label><input type="checkbox" bind:checked={mounted} /> Mount deprecated BackTop</label>
  <label><input type="checkbox" bind:checked={animated} /> Animate deprecated BackTop</label>
  <button type="button" onclick={() => { changed = !changed; }}>Update deprecated BackTop theme</button>
  <div id="back-top-first" bind:this={first} style="height:140px;overflow:auto">
    <div style="height:1000px">First scroll target</div>
  </div>
  <div id="back-top-second" bind:this={second} style="height:140px;overflow:auto">
    <div style="height:1000px">Second scroll target</div>
  </div>
  <form aria-label="Deprecated BackTop form">
    <ConfigProvider theme={{ cssVar: {}, token: { motion: animated }, components: { BackTop: changed
      ? { zIndexPopup: 777, controlHeightLG: 48, fontSizeHeading3: 32, fontFamily: 'monospace' }
      : {} } }}>
      {#if mounted}
        <BackTop id="fixture-deprecated-back-top" target={getTarget} visibilityHeight={threshold}
          {duration} prefixCls={customPrefix ? 'owned-top' : undefined}
          children={custom === 'default' ? undefined : content}
          class="user-back-top" rootClassName="user-back-top-root"
          style={localStyle ? 'z-index:901;--ant-control-height-lg:56px' : undefined}
          bind:nativeElement={root} onClick={event => {
            clicks++;
            currentTarget = (event.currentTarget as HTMLElement).id;
          }} />
      {/if}
    </ConfigProvider>
  </form>
  <output aria-label="Deprecated BackTop clicks">{clicks}</output>
  <output aria-label="Deprecated BackTop current target">{currentTarget}</output>
  <output aria-label="Deprecated BackTop ref">{root?.id ?? 'none'}</output>
</section>
