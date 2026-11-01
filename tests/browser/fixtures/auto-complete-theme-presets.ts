import type { ThemeConfig } from 'antd-svelte';
import { selectThemePresets } from './select-theme-presets';

export const autoCompleteThemePresets: Record<string, ThemeConfig> = {
  ...selectThemePresets,
  'custom-input-tokens': {
    components: {
      Select: { fontSize: 20, controlHeight: 48, colorText: '#123456', selectorBg: '#ffedcc' },
      Input: {
        fontSize: 17, controlHeight: 36, inputFontSize: 18, colorPrimary: '#009955', algorithm: true
      }
    }
  }
};
