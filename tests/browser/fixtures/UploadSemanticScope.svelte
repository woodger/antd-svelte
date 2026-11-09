<script module lang="ts">
  export interface UploadSemanticSample {
    id: string;
    mode?: string;
    listType?: string;
    drag?: boolean;
    hasControlInside?: boolean;
    hiddenList?: boolean;
    hiddenChildren?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    priority?: boolean;
    error?: boolean;
  }
</script>

<script lang="ts">
  import {
    ConfigProvider,
    Upload,
    enUS,
    type UploadProps,
    type UploadSemanticInfo,
    type UploadSemanticSlots
  } from 'antd-svelte';

  let { sample }: { sample: UploadSemanticSample } = $props();
  let listType = $derived<UploadProps['listType']>(
    sample.listType === 'picture' || sample.listType === 'picture-card'
      || sample.listType === 'picture-circle' ? sample.listType : undefined
  );
  const names: UploadSemanticSlots = {
    root: 'custom-root',
    list: 'custom-list',
    item: 'custom-item',
    trigger: 'custom-trigger'
  };
  const slots: UploadSemanticSlots = {
    root: 'color:#135790;padding-top:3px',
    list: 'margin-top:7px',
    item: 'min-height:33px',
    trigger: 'color:#357913;background-color:#f0f2f4;padding-top:5px'
  };
  let classNames = $derived.by<UploadProps['classNames']>(() => {
    if (sample.mode === 'default') return undefined;
    if (sample.mode === 'empty') return {};
    if (sample.mode === 'callback') {
      return ({ props }: UploadSemanticInfo) => ({
        ...names,
        root: `${names.root} props-${props.listType}-${props.type}-${props.multiple}-${props.hasControlInside}-${props.disabled}-${props.showUploadList} raw-${props.prefixCls || 'none'}`
      });
    }
    return names;
  });
  let styles = $derived.by<UploadProps['styles']>(() => {
    if (sample.mode === 'default') return undefined;
    if (sample.mode === 'empty') return {};
    if (sample.mode === 'callback') {
      return ({ props }: UploadSemanticInfo) => ({
        ...slots,
        item: `min-height:${props.disabled ? 47 : 39}px`
      });
    }
    if (sample.mode?.startsWith('variable')) {
      return {
        ...slots,
        root: `${slots.root};--ant-upload-picture-card-size:120px`,
        trigger: sample.mode === 'variable-priority'
          ? `${slots.trigger};--ant-upload-picture-card-size:140px` : slots.trigger
      };
    }
    return slots;
  });
</script>

{#snippet control()}<button type="button">Upload</button>{/snippet}
<ConfigProvider locale={enUS} theme={{ cssVar: {}, token: { motion: false } }}>
  <section data-upload-semantic-host
    data-measure-tokens={sample.mode?.startsWith('variable') ? '' : undefined} style="width:320px">
    <Upload {listType} type={sample.drag ? 'drag' : undefined}
      fileList={[{ uid: 'one', name: 'alpha.txt', status: sample.error ? 'error' : 'done' }]}
      hasControlInside={sample.hasControlInside}
      showUploadList={sample.hiddenList ? false : undefined}
      disabled={sample.disabled} multiple={sample.multiple} isImageUrl={() => false}
      class="local-root" rootClassName="local-extra" {classNames} {styles}
      style={sample.priority ? 'color:#975310;padding-top:11px' : undefined}
      children={sample.hiddenChildren ? undefined : control} />
  </section>
</ConfigProvider>
