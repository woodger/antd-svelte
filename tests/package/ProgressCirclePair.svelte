<script lang="ts">
  import { Progress } from 'antd-svelte';
</script>

<Progress type="circle" percent={65} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
<Progress type="dashboard" percent={40} strokeColor={{ '0%': 'red', '100%': 'blue' }} />
