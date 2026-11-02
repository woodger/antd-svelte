import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import StepsThemeFixture from './StepsThemeFixture.svelte';

describe('Source Steps/Timeline theme SSR', () => {
  it('renders both scoped defaults and native lists before browser callbacks', () => {
    const { body, head } = render(StepsThemeFixture);

    expect(body).toContain('--ant-steps-icon-size:32px');
    expect(body).toContain('--ant-steps-description-max-width:inherit');
    expect(body).toContain('--ant-timeline-tail-width:2px');
    expect(body).toContain('--ant-timeline-dot-size:inherit');
    expect(body).toContain('ant-steps-source-theme');
    expect(body).toContain('ant-timeline-source-theme');
    expect(body.match(/<ol\b/g)).toHaveLength(2);
    expect(body).toContain('type="button"');
    expect(body).toContain('aria-current="step"');
    expect(head).toContain('data-ant-svelte-theme="steps-ssr"');
  });

  it('uses source compact dimensions for icons and rails', () => {
    const { body } = render(StepsThemeFixture, { props: { preset: 'compact' } });

    expect(body).toContain('--ant-steps-icon-size:28px');
    expect(body).toContain('--ant-steps-icon-size-sm:20px');
    expect(body).toContain('--ant-steps-dot-size:7px');
    expect(body).toContain('--ant-timeline-item-padding-bottom:10px');
  });

  it('keeps source tokens including legacy declarations that do not affect layout', () => {
    const { body } = render(StepsThemeFixture, { props: { preset: 'steps-tokens' } });

    expect(body).toContain('--ant-steps-icon-size:38px');
    expect(body).toContain('--ant-steps-custom-icon-font-size:30px');
    expect(body).toContain('--ant-steps-title-line-height:27px');
    expect(body).toContain('--ant-steps-custom-icon-top:5px');
    expect(body).toContain('--ant-steps-description-max-width:160px');
  });

  it('applies Timeline overrides after the shared Steps scope', () => {
    const { body } = render(StepsThemeFixture, { props: { preset: 'both-aliases' } });
    const timeline = body.slice(body.indexOf('ant-timeline ant-timeline-css-var'));

    expect(timeline.indexOf('--ant-font-size:20px')).toBeLessThan(
      timeline.indexOf('--ant-font-size:26px')
    );
    expect(timeline).toContain('--ant-steps-dot-size:12px');
    expect(timeline).toContain('--ant-timeline-dot-size:20px');
  });

  it('preserves zero dimensions and inherits undefined values', () => {
    const zero = render(StepsThemeFixture, { props: { preset: 'zero' } }).body;
    const missing = render(StepsThemeFixture, { props: { preset: 'undefined' } }).body;

    expect(zero).toContain('--ant-steps-icon-size:0px');
    expect(zero).toContain('--ant-timeline-dot-size:0px');
    expect(zero).toContain('--ant-timeline-tail-width:0px');
    expect(missing).toContain('--ant-steps-icon-size:inherit');
    expect(missing).toContain('--ant-timeline-tail-width:inherit');
  });

  it('bridges custom prefixes and retains runtime CSS lengths', () => {
    const prefix = render(StepsThemeFixture, { props: { preset: 'custom-prefix' } }).body;
    const lengths = render(StepsThemeFixture, { props: { preset: 'css-lengths' } }).body;

    expect(prefix).toContain('--steps-2-steps-icon-size:36px');
    expect(prefix).toContain('--ant-steps-icon-size:var(--steps-2-steps-icon-size)');
    expect(prefix).toContain('--ant-timeline-dot-size:var(--steps-2-timeline-dot-size)');
    expect(lengths).toContain('--ant-steps-icon-size:2.5em');
    expect(lengths).toContain('--ant-timeline-tail-width:0.2em');
  });

  it('keeps semantic and plain styles after component defaults', () => {
    const { body } = render(StepsThemeFixture, { props: { semantic: true } });

    expect(body).toContain('--ant-steps-icon-size:41px;--ant-steps-icon-size:47px');
    expect(body.indexOf('--ant-timeline-dot-size:inherit')).toBeLessThan(
      body.indexOf('--ant-timeline-dot-size:21px')
    );
    expect(body).toContain('--ant-timeline-dot-size:21px;--ant-timeline-dot-size:27px');
  });

  it('leaves native-only themes free of source markers and declarations', () => {
    const { body, head } = render(StepsThemeFixture, { props: { native: true } });

    expect(body).not.toContain('ant-steps-source-theme');
    expect(body).not.toContain('ant-timeline-source-theme');
    expect(body).not.toContain('--ant-steps-icon-size:');
    expect(head).not.toContain('data-ant-svelte-theme=');
  });
});
