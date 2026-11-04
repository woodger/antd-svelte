import { describe, expect, it } from 'vitest';
import { getOverlayPrefixCss } from './overlay-prefix.engine';
import tooltip from './vendor/tooltip-prefix.css.js';
import popover from './vendor/popover-prefix.css.js';
import popconfirm from './vendor/popconfirm-prefix.css.js';

const templates = { tooltip, popover, popconfirm };

describe('Overlay prefix stylesheets', () => {
  for (const kind of ['tooltip', 'popover', 'popconfirm'] as const) {
    it(`uses the existing ${kind} stylesheet for its default prefix`, () => {
      expect(getOverlayPrefixCss(kind, `ant-${kind}`, templates[kind])).toBeUndefined();
    });

    it(`scopes ${kind} slots while preserving variables and global integrations`, () => {
      const css = getOverlayPrefixCss(kind, `tenant-${kind}`, templates[kind])!;

      expect(css).toContain(`.tenant-${kind}`);
      expect(css).toContain(`--ant-${kind}-`);
      expect(css).not.toContain(`--tenant-${kind}-`);
      expect(css).not.toContain('.css-var-_R_0_');
      expect(css).not.toMatch(/@keyframes|ant-(?:fade|zoom)|unique-container/);
      if (kind === 'popconfirm') {
        expect(css).toContain('.tenant-popconfirm.ant-popover');
        expect(css).toContain('.tenant-popconfirm-message-icon .anticon');
        expect(css).not.toContain('.tenant-popover');
      } else {
        expect(css).toContain(`.tenant-${kind}:where(.ant-${kind}-css-var)`);
        expect(css).not.toMatch(new RegExp(`(?:^|\n)\\.ant-${kind}-css-var[\\s:{]`));
        expect(css).toContain(`.tenant-${kind}.tenant-${kind}-blue`);
        expect(css).toContain(`.tenant-${kind}-placement-topRight`);
      }
    });

    it(`keeps ${kind} replacement characters literal and escapes a closing style tag`, () => {
      expect(getOverlayPrefixCss(kind, 'popup-$&', templates[kind])).toContain('.popup-$&');
      expect(getOverlayPrefixCss(kind, 'popup-</style><script>', templates[kind]))
        .not.toContain('</style');
    });
  }
});
