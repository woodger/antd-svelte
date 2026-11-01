import { typographyCopyFallback } from './typography.engine';
import type { TypographyContent, TypographyCopyConfig } from './typography.types';

export function createTypographyCopy(options: {
  config: () => TypographyCopyConfig;
  children: () => TypographyContent;
  write: (text: string, format?: 'text/plain' | 'text/html') => Promise<boolean>;
}) {
  let copied = $state(false);
  let loading = $state(false);
  let active = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    const config = options.config();
    const children = options.children();
    loading = true;
    try {
      const text = typeof config.text === 'function' ? await config.text() : config.text;
      // False writer result также завершает действие; это намеренное поведение upstream.
      await options.write(text || typographyCopyFallback(children), config.format);
      loading = false;
      if (active) {
        copied = true;
        clearTimeout(timer);
        timer = setTimeout(() => { copied = false; }, 3000);
      }
      // Уже начатое копирование и его callback завершаются и после unmount, как в React.
      config.onCopy?.(event);
    } catch (error) {
      loading = false;
      throw error;
    }
  }

  return {
    get copied() { return copied; },
    get loading() { return loading; },
    copy,
    destroy() {
      active = false;
      clearTimeout(timer);
    }
  };
}
