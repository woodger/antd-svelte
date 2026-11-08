<script lang="ts">
  import {
    Avatar,
    AvatarGroup,
    Badge,
    BadgeRibbon,
    Tag,
    CheckableTag,
    CheckableTagGroup,
    Empty,
    Skeleton,
    SkeletonAvatar,
    SkeletonButton,
    SkeletonInput,
    SkeletonImage,
    SkeletonNode,
    Spin,
    Progress,
    Result
  } from 'antd-svelte';

  export interface StatusPrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    rtl?: boolean;
    local?: string;
  }
  let { scope, sample, local = true, count = 5 }: {
    scope: string;
    sample: StatusPrefixSample;
    local?: boolean;
    count?: number;
  } = $props();

  function prefix(name: string) {
    return local && sample.local !== undefined
      ? sample.local ? `${sample.local}-${name}` : '' : undefined;
  }
</script>

<div data-status-prefix-scope={scope} style="width:480px">
  <div data-prefix-widget="avatar"><Avatar prefixCls={prefix('avatar')}>A</Avatar></div>
  <div data-prefix-widget="avatar-group">
    <AvatarGroup prefixCls={prefix('avatar')} items={[
      { key: 'a', label: 'A', text: 'A' }, { key: 'b', label: 'B', text: 'B' }
    ]} />
  </div>
  <div data-prefix-widget="badge"><Badge prefixCls={prefix('badge')} {count}>
    <span>Item</span>
  </Badge></div>
  <div data-prefix-widget="ribbon"><BadgeRibbon prefixCls={prefix('ribbon')} text="Badge">
    <div style="width:120px;height:40px">Item</div>
  </BadgeRibbon></div>
  <div data-prefix-widget="tag"><Tag prefixCls={prefix('tag')}>Tag</Tag></div>
  <div data-prefix-widget="checkable-tag">
    <CheckableTag prefixCls={prefix('tag')} checked>Tag</CheckableTag>
  </div>
  <div data-prefix-widget="checkable-tag-group">
    <CheckableTagGroup prefixCls={prefix('tag')} options={['one', 'two']} defaultValue="one" />
  </div>
  <div data-prefix-widget="empty"><Empty prefixCls={prefix('empty')} /></div>
  <div data-prefix-widget="skeleton">
    <Skeleton prefixCls={prefix('skeleton')} loading avatar paragraph={false} />
  </div>
  <div data-prefix-widget="skeleton-avatar">
    <SkeletonAvatar prefixCls={prefix('skeleton')} />
  </div>
  <div data-prefix-widget="skeleton-button">
    <SkeletonButton prefixCls={prefix('skeleton')} />
  </div>
  <div data-prefix-widget="skeleton-input">
    <SkeletonInput prefixCls={prefix('skeleton')} />
  </div>
  <div data-prefix-widget="skeleton-image">
    <SkeletonImage prefixCls={prefix('skeleton')} />
  </div>
  <div data-prefix-widget="skeleton-node">
    <SkeletonNode prefixCls={prefix('skeleton')}>X</SkeletonNode>
  </div>
  <div data-prefix-widget="spin"><Spin prefixCls={prefix('spin')} /></div>
  <div data-prefix-widget="progress">
    <Progress prefixCls={prefix('progress')} percent={60} showInfo={false} />
  </div>
  <div data-prefix-widget="result"><Result prefixCls={prefix('result')} title="Ready" /></div>
  <input aria-label={`${scope} widget draft`} value="initial draft" />
</div>
