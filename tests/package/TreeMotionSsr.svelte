<script lang="ts">
  import { ConfigProvider, DirectoryTree, Tree, type TreeMotionConfig, type TreeProps } from 'antd-svelte';
  import { treeMotionData, type TreeMotionSample } from '../browser/fixtures/tree-motion-cases';
  let { sample, onSemantic, onCallback }: {
    sample: TreeMotionSample;
    onSemantic: (motion: TreeProps['motion'], original: TreeProps['motion']) => void;
    onCallback: (type: string) => void;
  } = $props();
  let Component = $derived(sample.directory ? DirectoryTree : Tree);
  let motion = $derived.by<TreeMotionConfig | false | undefined>(() => sample.motion === 'off' ? false
    : sample.motion === 'empty' ? {} : sample.motion ? {
      motionName: sample.motion === 'object' ? { appear: 'open' } : 'custom-motion',
      motionDeadline: 500, onAppearPrepare: () => { onCallback('prepare'); }
    } : undefined);
</script>

<ConfigProvider prefixCls={sample.prefix} theme={{ token: { motion: sample.globalMotion !== false } }}>
  <Component treeData={treeMotionData(sample.children)} prefixCls={sample.localPrefix} {motion}
    defaultExpandParent={false} defaultExpandedKeys={sample.initial ?? []}
    height={sample.height} virtual={sample.virtual} titleRender={title}
    onExpand={() => onCallback('expand')}
    classNames={({ props }) => {
      onSemantic(props.motion, motion);
      return { root: 'motion-semantic' };
    }} />
</ConfigProvider>
{#snippet title(node: ReturnType<typeof treeMotionData>[number])}
  <span data-tree-motion-key={node.key}>{node.title}</span>
{/snippet}
