<script lang="ts">
  import { ConfigProvider, Slider } from 'antd-svelte';
</script>

<ConfigProvider direction="rtl" slider={{ class: 'provider-range', style: 'color:red',
  classNames: { rail: 'provider-rail', track: 'provider-track' } }}>
  <Slider range defaultValue={[20, 50, 80]} class="local-range" style="color:green"
    classNames={{ root: 'semantic-root', tracks: 'semantic-tracks', handle: 'semantic-handle' }}
    styles={{ track: 'height:6px' }} disabled={[false, true, false]} name="interval"
    ariaLabelForHandle={['Start', 'Middle', 'End']} />
</ConfigProvider>
