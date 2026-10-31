<script lang="ts">
  import { Badge, ConfigProvider, Radio, RadioButton, RadioGroup } from 'antd-svelte';

  let size = $state<'small' | 'middle' | 'large' | 'inherit'>('inherit');
  let parentSize = $state<'small' | 'middle' | 'large'>('middle');
  let optionType = $state<'button' | 'default' | 'inherit'>('button');
  let buttonStyle = $state<'outline' | 'solid'>('outline');
  let block = $state(false);
  let vertical = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let disabled = $state(false);
  let locked = $state(false);
  let mounted = $state(true);
  let useOptions = $state(false);
  let value = $state<string | undefined>('month');
  let checked = $state(false);
  let inputElement = $state<HTMLInputElement>();
  let nativeElement = $state<HTMLSpanElement>();
  let events = $state<string[]>([]);
  let data = $state('');
  let form: HTMLFormElement;
</script>

<style>
  .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .holder { width: 360px; max-width: 100%; margin-block: 16px; }
  output { display: block; }
</style>

<section id="radio-button-fixture">
  <h2>RadioButton</h2>
  <div class="controls">
    <label>Radio button size<select bind:value={size}>
      <option value="inherit">Button inherit size</option><option value="small">Button small</option>
      <option value="middle">Button middle</option><option value="large">Button large</option>
    </select></label>
    <label>Radio button parent size<select bind:value={parentSize}>
      <option value="small">Parent small</option><option value="middle">Parent middle</option>
      <option value="large">Parent large</option>
    </select></label>
    <label>Radio button option type<select bind:value={optionType}>
      <option value="button">Group button</option><option value="default">Group default</option>
      <option value="inherit">Group unspecified</option>
    </select></label>
    <label>Radio button style<select bind:value={buttonStyle}>
      <option value="outline">Button outline</option><option value="solid">Button solid</option>
    </select></label>
    <label><input type="checkbox" bind:checked={block} /> Block radio buttons</label>
    <label><input type="checkbox" bind:checked={vertical} /> Vertical radio buttons</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark radio buttons</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact radio buttons</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable radio buttons</label>
    <label><input type="checkbox" bind:checked={locked} /> Lock year radio button</label>
    <label><input type="checkbox" bind:checked={mounted} /> Mount radio buttons</label>
    <label><input type="checkbox" bind:checked={useOptions} /> Use radio button options</label>
  </div>
  <ConfigProvider theme={{ mode: dark ? 'dark' : 'light', compact, primary: 'purple' }} componentSize={parentSize}>
    <form bind:this={form} onsubmit={event => {
      event.preventDefault();
      data = JSON.stringify([...new FormData(form)]);
    }}>
      <div class="holder">
        {#if mounted}<RadioGroup
          options={useOptions ? [
            { value: 'day', label: 'Options day' },
            { value: 'week', label: 'Options week' }
          ] : []}
          bind:value
          name="period"
          aria-label="Calendar mode buttons"
          size={size === 'inherit' ? undefined : size}
          optionType={optionType === 'inherit' ? undefined : optionType}
          {buttonStyle}
          {block}
          {disabled}
          orientation={vertical ? 'vertical' : 'horizontal'}
          onValueChange={next => events.push(String(next))}
          class="fixture-radio-buttons"
        >
          <RadioButton value="month" bind:inputElement bind:nativeElement>Button month</RadioButton>
          <RadioButton value="year" disabled={locked}>Button year</RadioButton>
          <Radio value="day">Button day</Radio>
        </RadioGroup>{/if}
      </div>
      <RadioButton name="standalone-button" value="yes" bind:checked>Standalone button</RadioButton>
      <div>
        <button type="submit">Read button FormData</button>
        <button type="reset">Reset button form</button>
        <button type="button" onclick={() => inputElement?.focus()}>Focus button ref</button>
      </div>
    </form>
    <RadioGroup class="badge-radio-buttons" aria-label="Badge radio buttons" defaultValue="a" orientation="vertical" size="small">
      <Badge count={1}><RadioButton value="a">Badge A</RadioButton></Badge>
      <Badge count={2}><RadioButton value="b">Badge B</RadioButton></Badge>
    </RadioGroup>
  </ConfigProvider>
  <output aria-label="Radio button value">{String(value)}</output>
  <output aria-label="Radio button events">{events.join(',')}</output>
  <output aria-label="Radio button data">{data}</output>
  <output aria-label="Radio button refs">{nativeElement?.tagName ?? 'none'}/{inputElement?.tagName ?? 'none'}</output>
</section>
