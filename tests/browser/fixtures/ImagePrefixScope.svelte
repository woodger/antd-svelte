<script lang="ts">
  import { Image, ImagePreviewGroup, type ImageTransform } from 'antd-svelte';
  import { imageOne, imageTwo } from './image-data';

  export interface ImagePrefixSample {
    id: string;
    prefix?: string;
    childPrefix?: string;
    variablePrefix?: string;
    local?: string;
    groupLocal?: string;
    rtl?: boolean;
    aliases?: boolean;
    group?: boolean;
    disabled?: boolean;
    placeholder?: boolean;
    cover?: 'top' | 'bottom' | 'center';
    userStyle?: boolean;
  }

  let { sample, scope = 'normal', local = true }: {
    sample: ImagePrefixSample;
    scope?: string;
    local?: boolean;
  } = $props();
  let nativeElement = $state<HTMLElement>();
  let imageElement = $state<HTMLImageElement>();
  let transforms = $state<ImageTransform[]>([]);
  let openings = $state<boolean[]>([]);
  let preview = $derived(sample.disabled ? false : {
    cover: sample.cover ? { placement: sample.cover, coverNode: cover } : undefined,
    onOpenChange: (value: boolean) => openings.push(value),
    onTransform: (info: { transform: ImageTransform }) => transforms.push(info.transform)
  });
</script>

{#snippet cover()}Cover{/snippet}
{#snippet first()}
  <Image prefixCls={local ? sample.local : undefined} src={imageOne} alt="First image"
    width={120} height={90} {preview} placeholder={sample.placeholder}
    rootClassName="fixture-image-prefix" classNames={{ popup: { root: 'fixture-image-preview' } }}
    style={sample.userStyle ? 'border-radius:9px' : undefined}
    bind:nativeElement bind:imageElement />
{/snippet}

<section data-image-prefix-scope={scope} style="width:480px;padding:12px">
  {#if sample.group}
    <ImagePreviewGroup previewPrefixCls={local ? sample.groupLocal : undefined}
      classNames={{ popup: { root: 'fixture-image-preview' } }}
      preview={{ onOpenChange: value => openings.push(value),
        onTransform: info => transforms.push(info.transform) }}>
      {@render first()}
      <Image prefixCls={local ? sample.local : undefined} src={imageTwo} alt="Second image"
        width={120} height={90} />
    </ImagePreviewGroup>
  {:else}{@render first()}{/if}
  <output aria-label="Image prefix refs">{nativeElement && imageElement ? 'mounted' : 'empty'}</output>
  <output aria-label="Image prefix transforms">{JSON.stringify(transforms)}</output>
  <output aria-label="Image prefix openings">{JSON.stringify(openings)}</output>
</section>
