import { getInlineStyleDeclarations, serializeInlineStyleLayers } from './inline-style.engine';
import type {
  TreeSelectClassNames, TreeSelectConfig, TreeSelectSemanticInfo, TreeSelectSemanticValue,
  TreeSelectStyles, TreeSelectValue
} from './tree-select.types';

const controlSlots = [
  'root', 'prefix', 'input', 'suffix', 'clear', 'content', 'placeholder', 'item', 'itemContent', 'itemRemove'
] as const;
const popupSlots = ['root', 'item', 'itemTitle', 'itemSwitcher'] as const;
type ResolvedClassNames = Omit<TreeSelectClassNames, 'popup'> & {
  popup: Exclude<TreeSelectClassNames['popup'], string | undefined>;
};

function popupClasses(value: TreeSelectClassNames['popup']) {
  return typeof value === 'string' ? { root: value } : value;
}

function join(before: string | undefined, after: string | undefined, separator: string) {
  return [before, after].filter(Boolean).join(separator) || undefined;
}

/** Merge order follows Ant Design useMergeSemantic. */
export function treeSelectSemantics<ValueType extends TreeSelectValue, Data extends object>(
  context: TreeSelectConfig | undefined,
  info: TreeSelectSemanticInfo<ValueType, Data>
) {
  function resolve<Slots>(value: TreeSelectSemanticValue<Slots, ValueType, Data> | undefined) {
    return typeof value === 'function'
      ? (value as (info: TreeSelectSemanticInfo<ValueType, Data>) => Slots | undefined)(info) : value;
  }
  const inheritedClasses = resolve<TreeSelectClassNames>(context?.classNames);
  const localClasses = resolve(info.props.classNames);
  const inheritedStyles = resolve<TreeSelectStyles>(context?.styles);
  const localStyles = resolve(info.props.styles);
  const inheritedPopupClasses = popupClasses(inheritedClasses?.popup);
  const localPopupClasses = popupClasses(localClasses?.popup);
  const classes: ResolvedClassNames = {
    ...Object.fromEntries(controlSlots.map(slot => [slot, join(inheritedClasses?.[slot], localClasses?.[slot], ' ')])),
    popup: Object.fromEntries(popupSlots.map(slot => [slot, join(inheritedPopupClasses?.[slot], localPopupClasses?.[slot], ' ')]))
  };
  const styles: TreeSelectStyles & { popup: NonNullable<TreeSelectStyles['popup']>; } = {
    ...Object.fromEntries(controlSlots.map(slot => [slot, join(inheritedStyles?.[slot], localStyles?.[slot], ';')])),
    // Popup merges by slot. A local item style replaces the provider item style.
    popup: { ...inheritedStyles?.popup, ...localStyles?.popup }
  };

  // The popup resolves its own z-index after inheriting styles.root.
  const root = Array.from(getInlineStyleDeclarations([styles.root]));
  const inheritedRootStyle = root.some(({ property }) => property === 'z-index')
    ? serializeInlineStyleLayers([root.filter(({ property }) => property !== 'z-index')
      .map(({ property, value, priority }) => [property, priority ? `${value} !important` : value] as const)])
    : styles.root;
  const popupRootStyle = join(inheritedRootStyle, styles.popup.root, ';');
  const popupProperties = new Set(Array.from(getInlineStyleDeclarations([popupRootStyle]), ({ property }) => property));
  const popupSizing = {
    width: popupProperties.has('width') || popupProperties.has('inline-size'),
    minWidth: popupProperties.has('min-width') || popupProperties.has('min-inline-size'),
    maxWidth: popupProperties.has('max-width') || popupProperties.has('max-inline-size')
  };

  return { classes, styles, popupRootStyle, popupSizing };
}
