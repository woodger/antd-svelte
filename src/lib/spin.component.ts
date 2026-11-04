import Spin from './Spin.svelte';
import { setDefaultSpinIndicator } from './spin-indicator';

/** Svelte component facade сохраняет исходный статический метод Spin. */
export default Object.assign(Spin, { setDefaultIndicator: setDefaultSpinIndicator });
