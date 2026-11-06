<script module lang="ts">
  export interface ListyThemeRecordData {
    id: string;
    team: string;
    index: number;
  }
</script>

<script lang="ts">
  let {
    item,
    id,
    part
  }: { item: ListyThemeRecordData; id: string; part: string; } = $props();
  let draft = $state('Draft');
</script>

<div data-record={item.id}>
  <span>Record {item.id} </span><input
    aria-label={`Listy theme draft ${id} ${part} ${item.id}`} bind:value={draft} style="width:100px" />
</div>
