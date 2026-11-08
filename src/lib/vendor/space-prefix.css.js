/* Ant Design 6.6.8 — MIT; см. LICENSE.ant-design.
 * Space: orientation, align, gaps, empty wrappers и Badge; без Compact/Addon.
 * Без typography reset; корни ограничены :where(.ant-space-css-var).
 * https://registry.npmjs.org/antd/-/antd-6.6.8.tgz
 * SHA-256: 8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa
 */
/** @type {string} */
const css = "/* Ant Design 6.6.8 — MIT; см. LICENSE.ant-design.\n * Space: orientation, align, gaps, empty wrappers и Badge; без Compact/Addon.\n * Без typography reset; корни ограничены :where(.ant-space-css-var).\n * https://registry.npmjs.org/antd/-/antd-6.6.8.tgz\n * SHA-256: 8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa\n */\n.ant-space:where(.ant-space-css-var){display:inline-flex;}\n.ant-space-rtl{direction:rtl;}\n.ant-space-vertical{flex-direction:column;}\n.ant-space-align{flex-direction:column;}\n.ant-space-align-center{align-items:center;}\n.ant-space-align-start{align-items:flex-start;}\n.ant-space-align-end{align-items:flex-end;}\n.ant-space-align-baseline{align-items:baseline;}\n.ant-space:where(.ant-space-css-var) .ant-space-item:empty{display:none;}\n.ant-space:where(.ant-space-css-var) .ant-space-item>.ant-badge-not-a-wrapper:only-child{display:block;}\n.ant-space-gap-row-small{row-gap:var(--ant-padding-xs);}\n.ant-space-gap-row-medium{row-gap:var(--ant-padding);}\n.ant-space-gap-row-large{row-gap:var(--ant-padding-lg);}\n.ant-space-gap-col-small{column-gap:var(--ant-padding-xs);}\n.ant-space-gap-col-medium{column-gap:var(--ant-padding);}\n.ant-space-gap-col-large{column-gap:var(--ant-padding-lg);}\n";
export default css;
