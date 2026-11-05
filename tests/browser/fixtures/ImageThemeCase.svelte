<script lang="ts">
  import { ConfigProvider, Image, ImagePreviewGroup, Modal, type ImageTransform } from 'antd-svelte';
  import { resolveImageTheme, type ImageThemeSample } from './image-theme-presets';
  import { imageOne, imageTwo } from './image-data';

  let {
    sample,
    enabled = true,
    mounted = true,
    inherit = true,
    operationSize,
    operationColor,
    zIndex,
    duration
  }: {
    sample: ImageThemeSample;
    enabled?: boolean;
    mounted?: boolean;
    inherit?: boolean;
    operationSize?: number;
    operationColor?: string;
    zIndex?: number;
    duration?: string;
  } = $props();
  let resolved = $derived(resolveImageTheme(sample.config));
  let configured = $derived({
    ...resolved,
    cssVar: resolved.cssVar ?? {},
    components: {
      ...resolved.components,
      Image: {
        ...resolved.components?.Image,
        ...(operationSize !== undefined ? { previewOperationSize: operationSize } : {}),
        ...(operationColor !== undefined ? { previewOperationColor: operationColor } : {}),
        ...(zIndex !== undefined ? { zIndexPopup: zIndex } : {}),
        ...(duration !== undefined ? { progressAnimationDuration: duration } : {})
      }
    }
  });
  let nativeElement = $state<HTMLElement>();
  let imageElement = $state<HTMLImageElement>();
  let transforms = $state<ImageTransform[]>([]);
  let openings = $state<boolean[]>([]);
  let modal = $state(false);
</script>

{#snippet control(id: string)}
  <ConfigProvider direction={id === 'rtl' ? 'rtl' : 'ltr'}>
    <div data-image-theme={id} dir={id === 'rtl' ? 'rtl' : 'ltr'}
      style="font-size:14px;color:rgb(31,41,51)">
      {#if id === 'group' || id === 'explicit-group'}
        <ImagePreviewGroup preview={{
          rootClassName: `image-theme-preview-${id}`,
          zIndex: id === 'explicit-group' ? 2300 : undefined
        }}>
          <Image src={imageOne} alt={`Theme ${id} one`} width={120} height={90}
            wrapperStyle={sample.priority ? '--ant-image-preview-operation-size:26px' : undefined} />
          <Image src={imageTwo} alt={`Theme ${id} two`} width={120} height={90}
            wrapperStyle={sample.priority ? '--ant-image-preview-operation-size:26px' : undefined} />
        </ImagePreviewGroup>
      {:else if id === 'single'}
        <Image src={imageOne} alt={`Theme ${id}`} width={120} height={90}
          bind:nativeElement bind:imageElement
          wrapperStyle={sample.priority ? '--ant-image-preview-operation-size:26px' : undefined}
          preview={{
            rootClassName: `image-theme-preview-${id}`,
            onTransform: info => transforms = [...transforms, info.transform],
            onOpenChange: next => openings = [...openings, next]
          }} />
      {:else}
        <Image src={imageOne} alt={`Theme ${id}`} width={120} height={90}
          wrapperStyle={sample.priority ? '--ant-image-preview-operation-size:26px' : undefined}
          preview={{
            rootClassName: `image-theme-preview-${id}`,
            zIndex: id === 'explicit' ? 2300 : undefined
          }} />
      {/if}
    </div>
  </ConfigProvider>
{/snippet}

{#if mounted}
  <ConfigProvider theme={enabled ? configured : undefined}>
    {#each ['single', 'group', 'explicit', 'explicit-group', 'rtl'] as id}
      {@render control(id)}
    {/each}
    <ConfigProvider theme={{ inherit, components: { Image: { previewOperationSize: 22 } } }}>
      {@render control('nested')}
    </ConfigProvider>
    <ConfigProvider theme={{
      inherit: false,
      token: { motion: false },
      components: { Image: { previewOperationSize: 24 } }
    }}>
      {@render control('reset')}
    </ConfigProvider>
    <button type="button" onclick={() => modal = true}>Open themed Image modal</button>
    <Modal bind:open={modal} title="Themed Image host modal" footer={null}>
      <Image src={imageOne} alt="Themed modal single" width={120}
        preview={{ rootClassName: 'image-theme-modal-single' }} />
      <ImagePreviewGroup preview={{ rootClassName: 'image-theme-modal-group' }}>
        <Image src={imageOne} alt="Themed modal group one" width={120} />
        <Image src={imageTwo} alt="Themed modal group two" width={120} />
      </ImagePreviewGroup>
    </Modal>
  </ConfigProvider>
{/if}
<ConfigProvider theme={{
  cssVar: {},
  token: { motion: false },
  components: { Image: { previewOperationSize: 20 } }
}}>
  {@render control('sibling')}
</ConfigProvider>
<ConfigProvider theme={{ cssVar: {}, token: { motion: false } }}>
  {@render control('outside')}
</ConfigProvider>
<output aria-label="Image theme native ref">{nativeElement ? 'mounted' : 'empty'}</output>
<output aria-label="Image theme img ref">{imageElement ? 'mounted' : 'empty'}</output>
<output aria-label="Image theme transforms">{JSON.stringify(transforms)}</output>
<output aria-label="Image theme openings">{JSON.stringify(openings)}</output>
