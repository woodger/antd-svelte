import InternalCollapse from './Collapse.svelte';
import CollapsePanel from './CollapseLegacyPanel.svelte';

const Collapse = Object.assign(InternalCollapse, { Panel: CollapsePanel });
export default Collapse;
