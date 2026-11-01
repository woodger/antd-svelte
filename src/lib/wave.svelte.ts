import { useConfig } from './config-context';
import { useDesignTokenContext } from './theme-context.svelte';
import { connectWave } from './wave.dom';
import type { WaveColorSource, WaveComponent } from './wave.types';

/** Attachment сохраняет DOM control и читает актуальные config/token в отложенном callback. */
export function useWave(
  component: WaveComponent,
  getDisabled: () => boolean,
  getColorSource: () => WaveColorSource | undefined = () => undefined
) {
  const config = useConfig();
  const context = useDesignTokenContext();

  return (node: HTMLElement) => {
    const runtime = connectWave(node, () => ({
      config: config.wave,
      info: {
        className: ['ant-wave', context.state.hashId].filter(Boolean).join(' '),
        token: context.state.token,
        hashId: context.state.hashId,
        component,
        colorSource: getColorSource()
      }
    }));
    $effect(() => runtime.listen(getDisabled(), config.wave?.triggerType));

    return () => runtime.destroy();
  };
}
