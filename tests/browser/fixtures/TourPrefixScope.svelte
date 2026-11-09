<script lang="ts">
  import { Tour, type TourProps } from 'antd-svelte';

  export interface TourPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    rtl?: boolean;
    aliases?: boolean;
    userStyle?: boolean;
    primary?: boolean;
    stepPrimary?: boolean;
    placement?: TourProps['placement'];
    noArrow?: boolean;
    center?: boolean;
    cover?: boolean;
  }

  let { sample, local = true, draft = false }: {
    sample: TourPrefixSample;
    local?: boolean;
    draft?: boolean;
  } = $props();
  let target = $state<HTMLButtonElement>();
  let value = $state('unfinished');
  let events = $state<string[]>([]);
</script>

{#snippet description()}<label>Tour draft<input bind:value aria-label="Tour prefix draft" /></label>{/snippet}
{#snippet cover()}<div style="height:40px">Cover</div>{/snippet}

<button bind:this={target} type="button" id="tour-prefix-target"
  style="position:absolute;left:570px;top:400px;width:140px;height:38px">Target</button>
<Tour open defaultCurrent={1} mask={false} prefixCls={local ? sample.local : undefined}
  type={sample.primary ? 'primary' : 'default'}
  placement={sample.placement ?? 'bottomLeft'} arrow={!sample.noArrow}
  rootClassName="fixture-tour-prefix"
  classNames={{ section: 'fixture-tour-section', header: 'fixture-tour-header',
    title: 'fixture-tour-title', description: 'fixture-tour-description', close: 'fixture-tour-close',
    footer: 'fixture-tour-footer', indicator: 'fixture-tour-indicator' }}
  styles={sample.userStyle ? { section: 'padding:17px', close: 'width:31px' } : undefined}
  steps={[
    { title: 'First', description: 'First description', target: sample.center ? undefined : () => target },
    { title: 'Stored step', description: draft ? description : 'Stored description',
      cover: sample.cover ? cover : undefined,
      type: sample.stepPrimary ? 'primary' : undefined,
      target: sample.center ? undefined : () => target,
      style: sample.userStyle ? 'color:rgb(0,128,0)' : undefined },
    { title: 'Last', description: 'Last description', target: sample.center ? undefined : () => target }
  ]}
  onChange={current => events.push(`change:${current}`)}
  onClose={current => events.push(`close:${current}`)}
  onFinish={() => events.push('finish')} />
<output aria-label="Tour prefix events">{events.join('|')}</output>
