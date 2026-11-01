<script lang="ts">
  import { flushSync } from 'svelte';
  import {
    ConfigProvider,
    InputNumber,
    type InputNumberFocusOptions,
    type InputNumberRef,
    type InputNumberStepInfo,
    type InputVariant
  } from 'antd-svelte';

  const initialString = '9007199254740993.00000000000001';
  let high = $state<string | null>(initialString);
  let number = $state<number | null>(1.2);
  let formatted = $state<number | null>(1234);
  let freeze = $state(false);
  let removeOnChange = $state(false);
  let mounted = $state(true);
  let disabled = $state(false);
  let readOnly = $state(false);
  let wheel = $state(false);
  let blurChange = $state(true);
  let keyboard = $state(true);
  let spinner = $state(false);
  let customIcons = $state(false);
  let controls = $state(true);
  let affixes = $state(false);
  let addons = $state(false);
  let styled = $state(false);
  let inherited = $state(false);
  let dark = $state(false);
  let compact = $state(false);
  let comma = $state(false);
  let percent = $state(false);
  let precision = $state<number | undefined>();
  let maximum = $state(10);
  let variant = $state<InputVariant>('outlined');
  let size = $state<'small' | 'middle' | 'large'>('middle');
  let events = $state<string[]>([]);
  let highEvents = $state<(string | null)[]>([]);
  let formatInputs = $state<string[]>([]);
  let step = $state<InputNumberStepInfo>();
  let submissions = $state(0);
  let data = $state('');
  let ref = $state<InputNumberRef>();
  let input = $state<HTMLInputElement>();
  let root = $state<HTMLDivElement>();
  let generation = $state(0);
  let keyedEvents = $state<string[]>([]);
  let mouseEvents = $state<string[]>([]);
  let instance = $state<{
    focus(options?: InputNumberFocusOptions): void;
    blur(): void;
  }>();

  function formatCurrency(value: number | string | undefined) {
    return `$ ${String(value ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  function keyedProps(version: number) {
    return { defaultValue: version + 1, precision: 2 };
  }

  function formatPercent(value: number | string | undefined, info: { userTyping: boolean; input: string; }) {
    if (info.userTyping) return info.input;

    return `${value ?? ''}%`;
  }
</script>

<style>
  section { padding: 20px; }
  .controls, .actions, .numbers { display: flex; flex-wrap: wrap; gap: 8px 16px; }
  .numbers { margin-block: 20px; }
  output { display: block; overflow-wrap: anywhere; }
</style>

<section id="input-number-features-fixture">
  <h2>InputNumber source features</h2>
  <div class="controls">
    <label><input type="checkbox" bind:checked={mounted} /> Mount source number</label>
    <label><input type="checkbox" bind:checked={freeze} /> Freeze source number</label>
    <label><input type="checkbox" bind:checked={removeOnChange} /> Remove source number on change</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disable source number</label>
    <label><input type="checkbox" bind:checked={readOnly} /> Read only source number</label>
    <label><input type="checkbox" bind:checked={wheel} /> Wheel source number</label>
    <label><input type="checkbox" bind:checked={blurChange} /> Commit source number on blur</label>
    <label><input type="checkbox" bind:checked={keyboard} /> Keyboard source number</label>
    <label><input type="checkbox" bind:checked={spinner} /> Spinner source number</label>
    <label><input type="checkbox" bind:checked={controls} /> Source number controls</label>
    <label><input type="checkbox" bind:checked={customIcons} /> Custom source number icons</label>
    <label><input type="checkbox" bind:checked={affixes} /> Source number affixes</label>
    <label><input type="checkbox" bind:checked={addons} /> Source number addons</label>
    <label><input type="checkbox" bind:checked={styled} /> Source number config</label>
    <label><input type="checkbox" bind:checked={inherited} /> Inherit source number variant</label>
    <label><input type="checkbox" bind:checked={dark} /> Dark source number</label>
    <label><input type="checkbox" bind:checked={compact} /> Compact source number</label>
    <label><input type="checkbox" bind:checked={comma} /> Comma source number</label>
    <label><input type="checkbox" bind:checked={percent} /> Percent source formatter</label>
    <label>Source number variant <select bind:value={variant} aria-label="Source number variant">
      <option>outlined</option><option>filled</option><option>borderless</option><option>underlined</option>
    </select></label>
    <label>Source number size <select bind:value={size} aria-label="Source number size">
      <option>small</option><option>middle</option><option>large</option>
    </select></label>
  </div>
  <div class="actions">
    <button type="button" onclick={() => { events = []; }}>Clear source number events</button>
    <button type="button" onclick={() => { number = 1.2; }}>Reset source number owner</button>
    <button type="button" onclick={() => { number = 15; }}>Exceed source number owner</button>
    <button type="button" onclick={() => { high = '9007199254740995'; }}>Exceed precise number owner</button>
    <button type="button" onclick={() => { maximum = 2; }}>Shrink source number max</button>
    <button type="button" onclick={() => { precision = 2; }}>Source number precision two</button>
    <button type="button" onclick={() => ref?.focus({ cursor: 'start' })}>Ref focus source start</button>
    <button type="button" onclick={() => ref?.focus({ cursor: 'end' })}>Ref focus source end</button>
    <button type="button" onclick={() => ref?.focus({ cursor: 'all' })}>Ref focus source all</button>
    <button type="button" onclick={() => instance?.focus({ cursor: 'all' })}>Instance focus source</button>
    <button type="button" onclick={() => ref?.blur()}>Ref blur source number</button>
  </div>
  <ConfigProvider componentSize={size} theme={{ mode: dark ? 'dark' : 'light', compact }}
    inputNumber={styled ? {
      class: 'number-context',
      style: 'color:red',
      variant: 'filled',
      classNames: { input: 'number-context-input' },
      styles: { root: 'color:blue', prefix: 'color:purple' }
    } : undefined}>
    <form id="source-number-form" onsubmit={event => {
      event.preventDefault();
      submissions++;
      data = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
    }}>
      <div class="numbers">
        {#if mounted}
          <InputNumber bind:this={instance} bind:ref bind:inputElement={input} bind:nativeElement={root}
            bind:value={() => number, next => { if (!freeze) number = next; }}
            aria-label="Source number" name="amount" defaultValue={1.2} min={-10} max={maximum}
            step={.1} {precision} {keyboard} {readOnly} disabled={disabled || undefined}
            mode={spinner ? 'spinner' : 'input'} changeOnWheel={wheel} changeOnBlur={blurChange}
            decimalSeparator={comma ? ',' : undefined}
            controls={controls ? customIcons ? { upIcon: 'UP', downIcon: 'DOWN' } : true : false}
            prefix={affixes ? '$' : undefined} suffix={affixes ? 'kg' : undefined}
            addonBefore={addons ? 'Before' : undefined} addonAfter={addons ? 'After' : undefined}
            variant={inherited ? undefined : variant} rootClassName="number-feature-root"
            classNames={info => ({ root: `number-local-${info.props.size}`, action: 'number-local-action' })}
            styles={styled ? { root: 'color:green', input: 'text-align:center' } : undefined}
            style={styled ? 'color:orange' : undefined}
            onChange={value => {
              events = [...events, `change:${value}`];
              if (removeOnChange) flushSync(() => { mounted = false; });
            }}
            onValueChange={value => { events = [...events, `value:${value}`]; }}
            onInput={text => { events = [...events, `input:${text}`]; }}
            onPressEnter={() => { events = [...events, 'enter']; }}
            onMouseDown={event => { mouseEvents = [...mouseEvents, `down:${event.currentTarget === root}`]; }}
            onMouseUp={event => { mouseEvents = [...mouseEvents, `up:${event.currentTarget === root}`]; }}
            onClick={event => { mouseEvents = [...mouseEvents, `click:${event.currentTarget === root}`]; }}
            onStep={(_, info) => {
              step = info;
              events = [...events, `step:${info.emitter}`];
            }} />
        {/if}
        <InputNumber stringMode bind:value={high} defaultValue={initialString} name="high"
          aria-label="Precise string number" min="9007199254740993" max="9007199254740994"
          step="0.00000000000001" style="width:290px"
          onChange={value => { highEvents = [...highEvents, value]; }} />
        <InputNumber bind:value={formatted} name="formatted" aria-label="Currency number"
          formatter={percent ? formatPercent : formatCurrency}
          parser={text => text!.replace(/[$,%\s]/g, '')}
          onInput={text => { formatInputs = [...formatInputs, text]; }} />
      </div>
      <button type="submit">Submit source numbers</button>
      <button type="reset">Reset source numbers</button>
    </form>
    <ConfigProvider>
      <InputNumber aria-label="Inherited source number" defaultValue={2} />
    </ConfigProvider>
  </ConfigProvider>
  <output aria-label="Source number owner">{JSON.stringify(number)}</output>
  <output aria-label="Source number events">{events.join('|')}</output>
  <output aria-label="Source number step">{JSON.stringify(step)}</output>
  <output aria-label="Precise number owner">{JSON.stringify(high)}</output>
  <output aria-label="Precise number changes">{JSON.stringify(highEvents)}</output>
  <output aria-label="Currency number owner">{JSON.stringify(formatted)}</output>
  <output aria-label="Currency number inputs">{JSON.stringify(formatInputs)}</output>
  <output aria-label="Source number submissions">{submissions}</output>
  <output aria-label="Source number form data">{data}</output>
  <output aria-label="Source number refs">{Boolean(ref && input && root && ref.nativeElement === root)}</output>
  {#key generation}
    <InputNumber {...keyedProps(generation)} aria-label="Keyed source number"
      onChange={value => { keyedEvents = [...keyedEvents, `change:${value}`]; }}
      onBlur={() => { keyedEvents = [...keyedEvents, 'blur']; }} />
  {/key}
  <button type="button" onpointerdown={event => event.preventDefault()}
    onclick={() => { generation++; }}>Replace keyed source number</button>
  <output aria-label="Keyed source events">{keyedEvents.join('|')}</output>
  <output aria-label="Source number mouse events">{mouseEvents.join('|')}</output>
</section>
