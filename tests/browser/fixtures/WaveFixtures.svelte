<script lang="ts">
  import { Button, Checkbox, CheckableTag, ConfigProvider, Radio, RadioGroup, Steps,
    Switch, Tag, theme, type WaveConfig, type WaveEffectInfo, type WaveTriggerType } from 'antd-svelte';

  let mounted = $state(true);
  let disabled = $state(false);
  let custom = $state(false);
  let trigger = $state<WaveTriggerType>('click');
  let hashed = $state(true);
  let motion = $state(true);
  let dark = $state(false);
  let customPrefix = $state(false);
  let childOwn = $state(false);
  let removeOnClick = $state(false);
  let unborderOnClick = $state(false);
  let borderless = $state(false);
  let tagInteractive = $state(true);
  let tagLink = $state(true);
  let primary = $state('#1677ff');
  let filter = $state('');
  let changes = $state(0);
  let current = $state(0);
  let reports = $state<Record<string, unknown>[]>([]);

  function showEffect(this: unknown, target: HTMLElement, info: WaveEffectInfo) {
    reports.push({
      component: info.component,
      receiver: this === undefined ? 'undefined' : typeof this,
      target: target.id,
      targetClass: target.className,
      event: info.event.type,
      detail: info.event.detail,
      className: info.className,
      hashId: info.hashId,
      primary: info.token.colorPrimary,
      fontSize: info.token.fontSize,
      fields: Object.keys(info.token).length,
      buttonPrimary: info.token.Button && 'colorPrimary' in info.token.Button
        ? info.token.Button.colorPrimary : undefined,
      colorSource: info.colorSource ?? null,
      checked: target.querySelector('input')?.checked ?? null
    });
  }
  let wave = $derived<WaveConfig>({ disabled, triggerType: trigger,
    ...(custom ? { showEffect } : {}) });
</script>

<section id="wave-fixture">
  <h2>Source Wave</h2>
  <label><input type="checkbox" bind:checked={mounted} /> Mount wave controls</label>
  <label><input type="checkbox" bind:checked={disabled} /> Disable wave effect</label>
  <label><input type="checkbox" bind:checked={custom} /> Custom wave effect</label>
  <label><input type="checkbox" bind:checked={hashed} /> Hash wave controls</label>
  <label><input type="checkbox" bind:checked={motion} /> Source wave motion</label>
  <label><input type="checkbox" bind:checked={dark} /> Dark wave theme</label>
  <label><input type="checkbox" bind:checked={customPrefix} /> Custom wave CSS prefix</label>
  <label><input type="checkbox" bind:checked={childOwn} /> Replace child wave config</label>
  <label><input type="checkbox" bind:checked={removeOnClick} /> Remove controls during click</label>
  <label><input type="checkbox" bind:checked={unborderOnClick} /> Unborder button during click</label>
  <label><input type="checkbox" bind:checked={tagInteractive} /> Interactive wave tag</label>
  <label><input type="checkbox" bind:checked={tagLink} /> Link in wave tag</label>
  <label>Wave trigger <select aria-label="Wave trigger" bind:value={trigger}>
    <option>click</option><option>mousedown</option><option>mouseup</option>
    <option>pointerdown</option><option>pointerup</option>
  </select></label>
  <label>Wave root class <select aria-label="Wave root class" bind:value={filter}>
    <option value="">ordinary</option><option value="sample-disabled">disabled</option>
    <option value="disabled:sample">utility</option><option value="sample-leave">leaving</option>
  </select></label>
  <label>Wave primary <input bind:value={primary} /></label>
  <button type="button" onclick={() => { reports = []; }}>Clear wave reports</button>
  {#if mounted}
    <ConfigProvider {wave} theme={{
      token: { colorPrimary: primary, fontSize: 17, motion },
      algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      cssVar: { key: 'wave-source', prefix: customPrefix ? 'Wave2' : 'ant' },
      hashed,
      components: { Button: { colorPrimary: '#ff0000', algorithm: true } }
    }}>
      <form id="wave-form">
        <Button id="wave-primary" type="primary" color="primary" variant={borderless ? 'text' : undefined}
          class={filter} onClick={() => {
          changes++;
          if (removeOnClick) mounted = false;
          if (unborderOnClick) borderless = true;
        }}>Wave button</Button>
        <Button id="wave-text" type="text">Wave text</Button>
        <Button id="wave-link" type="link">Wave link</Button>
        <Button id="wave-href" href="#wave-fixture">Wave anchor</Button>
        <Button id="wave-disabled" disabled>Disabled wave button</Button>
        <Button id="wave-loading" loading>Loading wave button</Button>
        <Button id="wave-white" style="border-color:white;background-color:white">Fallback wave</Button>
        <Checkbox id="wave-checkbox" name="wave-check" value="yes"
          onChange={() => changes++}>Wave checkbox</Checkbox>
        <Radio id="wave-radio" name="wave-radio" onChange={() => changes++}>Wave radio</Radio>
        <RadioGroup id="wave-radio-buttons" name="wave-buttons" defaultValue="one"
          optionType="button" options={['one', 'two']} />
        <Switch id="wave-switch" name="wave-switch" aria-label="Wave switch"
          onChange={() => changes++} />
        <Steps id="wave-steps" items={[{ title: 'Wave first' }, { title: 'Wave second' }]}
          {current} onChange={value => { current = value; }} />
        <Steps id="wave-readonly-steps" items={[{ title: 'Read only step' }]} />
        <Tag id="wave-tag" onClick={tagInteractive ? () => changes++ : undefined}>Wave tag</Tag>
        <Tag id="wave-link-tag">
          {#if tagLink}<a href="#wave-fixture">Wave tag link</a>{:else}<span>Wave tag text</span>{/if}
        </Tag>
        <Tag id="wave-plain-tag">Plain tag</Tag>
        <Tag id="wave-close-tag" closeIcon onClick={() => changes++}>Close wave tag</Tag>
        <CheckableTag id="wave-checkable-tag" onChange={() => changes++}>Checkable tag</CheckableTag>
        <ConfigProvider wave={childOwn ? {} : undefined}>
          <Button id="wave-child">Child wave button</Button>
        </ConfigProvider>
        <button type="reset">Reset wave form</button>
      </form>
    </ConfigProvider>
  {/if}
  <output aria-label="Wave callback reports">{JSON.stringify(reports)}</output>
  <output aria-label="Wave control changes">{changes}</output>
</section>
