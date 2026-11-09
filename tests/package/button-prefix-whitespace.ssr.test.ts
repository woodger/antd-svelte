import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { Button } from 'antd-svelte';

describe('Button native text boundaries', () => {
  for (const prefixCls of [undefined, 'action']) {
    for (const href of [undefined, '#action']) {
      it(`keeps text inside its ${href ? 'anchor' : 'button'} with prefix ${prefixCls}`, () => {
        const rendered = render(Button, { props: { prefixCls, href, children: 'Action' } });
        const body = rendered.body.replace(/<!--[\s\S]*?-->/g, '');
        const tag = href ? 'a' : 'button';

        expect(body).toMatch(new RegExp(`^<${tag}\\b`));
        expect(body).toMatch(new RegExp(`</${tag}>$`));
        expect(body).toContain('>Action<');
      });
    }
  }
});
