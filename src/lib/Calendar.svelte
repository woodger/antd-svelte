<script lang="ts">
  import CalendarCore from './CalendarCore.svelte';
  import { dayjsGenerateConfig } from './date-picker-dayjs.engine';
  import type { CalendarProps } from './calendar.types';

  let { nativeElement = $bindable(), ...props }: CalendarProps = $props();
</script>

<CalendarCore {...props} generateConfig={dayjsGenerateConfig} bind:nativeElement />
