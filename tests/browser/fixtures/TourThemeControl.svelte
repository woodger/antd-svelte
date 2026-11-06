<script lang="ts">
  import { Tour } from 'antd-svelte';

  let {
    mode = 'default',
    scope = 'normal',
    prefix = 'ant',
    priority = false,
    draft = false,
    zIndex
  }: {
    mode?: string;
    scope?: string;
    prefix?: string;
    priority?: boolean;
    draft?: boolean;
    zIndex?: number;
  } = $props();
  let target = $state<HTMLButtonElement>();
  let targeted = $derived(mode === 'target' || mode === 'right');
  let styled = $derived(priority || scope === 'priority');
  let value = $state('unfinished');
  let events = $state<string[]>([]);
</script>

{#snippet description()}
  <label>Tour draft<input bind:value aria-label="Tour draft" /></label>
{/snippet}

<button bind:this={target} type="button" id="tour-theme-target"
  style="position:absolute;left:350px;top:160px;width:140px;height:38px">Target</button>
<Tour open defaultCurrent={1} mask={false} {zIndex}
  type={mode === 'primary' ? 'primary' : 'default'}
  placement={targeted ? mode === 'right' ? 'right' : 'bottomLeft' : undefined}
  styles={styled ? { section: 'padding:17px', close: 'width:31px' } : undefined}
  steps={[
    { title: 'First', description: 'First description' },
    { title: 'Stored step', description: draft ? description : 'Stored description',
      target: targeted ? () => target : undefined,
      style: [styled && 'color:rgb(0,128,0)',
        scope === 'variable' && `--${prefix}-tour-close-btn-size:39px`].filter(Boolean).join(';') },
    { title: 'Last', description: 'Last description' }
  ]}
  onChange={current => events.push(`change:${current}`)}
  onClose={current => events.push(`close:${current}`)}
  onFinish={() => events.push('finish')} />
<output aria-label="Tour theme events">{JSON.stringify(events)}</output>
