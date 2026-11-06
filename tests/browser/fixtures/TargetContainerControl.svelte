<script lang="ts">
  import { Affix, Anchor, type GetTargetContainer } from 'antd-svelte';

  let { id, target, index, resolve, explicit = false }: {
    id: string;
    target: 'a' | 'b' | 'window';
    index: number;
    resolve: (name: 'a' | 'b' | 'window') => ReturnType<GetTargetContainer>;
    explicit?: boolean;
  } = $props();
  let changes = $state<boolean[]>([]);
  let anchors = $state<string[]>([]);
  let nativeElement = $state<HTMLDivElement>();
  let local = $derived(explicit ? () => resolve('a') : undefined);
</script>

<div data-target-consumer={id} data-target-name={target}>
  <Affix class="target-affix" offsetTop={7} target={local} bind:nativeElement
    onChange={value => changes = [...changes, Boolean(value)]}
    style={`position:absolute;top:${20 + 40 * index}px;width:260px`}>
    <div style="height:32px"><input aria-label={`Target draft ${id}`} name={id} value="Draft" /></div>
  </Affix>
  <Anchor class="target-anchor" affix={false} getContainer={local}
    onChange={value => anchors = [...anchors, value]}
    items={[{ key: 'one', href: `#${target}-1`, title: 'One' },
      { key: 'two', href: `#${target}-2`, title: 'Two' }]}
    style={`position:absolute;top:${20 + 100 * index}px;left:500px;width:180px`} />
  <output aria-label={`Target changes ${id}`}>{JSON.stringify(changes)}</output>
  <output aria-label={`Target ref ${id}`}>{nativeElement ? 'mounted' : 'empty'}</output>
  <output aria-label={`Target anchors ${id}`}>{JSON.stringify(anchors)}</output>
</div>
