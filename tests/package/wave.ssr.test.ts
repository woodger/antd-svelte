import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import WaveFixture from './WaveFixture.svelte';

describe('Wave public package SSR', () => {
  it('keeps native controls, their values and targets without creating effect DOM on the server', () => {
    const { body } = render(WaveFixture);

    expect(body).toContain('name="ssr-check"');
    expect(body).toContain('name="ssr-radio"');
    expect(body).toContain('type="hidden" name="ssr-switch" value="on"');
    expect(body).toContain('ant-checkbox ant-wave-target');
    expect(body).toContain('ant-radio ant-wave-target');
    expect(body).toContain('ant-steps-item-icon ant-wave-target');
    expect(body).not.toContain('wave-motion-appear');
    expect(body).not.toContain('class="ant-wave ');
  });

  it('does not invoke a custom effect during SSR', () => {
    const showEffect = vi.fn();

    const { body } = render(WaveFixture, { props: { wave: { showEffect } } });

    expect(body).toContain('SSR wave button');
    expect(showEffect).not.toHaveBeenCalled();
  });
});
