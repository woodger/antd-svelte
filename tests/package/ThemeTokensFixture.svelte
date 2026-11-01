<script lang="ts">
  import { theme } from 'antd-svelte';

  const token = theme.getDesignToken({
    algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
    token: { colorPrimary: '#1677ff', motion: false }
  });
</script>

<div style:color={token.colorPrimary} style:font-size={`${token.fontSize}px`}
  data-height={token.controlHeight} data-motion={token.motionDurationSlow}>
  Source tokens
</div>
