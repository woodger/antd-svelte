/* Ant Design 6.6.8 — MIT; см. LICENSE.ant-design.
 * Affix: reset, fixed position и z-index; корни ограничены :where(.ant-affix-css-var).
 * https://registry.npmjs.org/antd/-/antd-6.6.8.tgz
 * SHA-256: 8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa
 */
/** @type {string} */
const css = "/* Ant Design 6.6.8 — MIT; см. LICENSE.ant-design.\n * Affix: reset, fixed position и z-index; корни ограничены :where(.ant-affix-css-var).\n * https://registry.npmjs.org/antd/-/antd-6.6.8.tgz\n * SHA-256: 8eb361740b62dc79762f21d036dea685d5e7c1d714315ea3247b9aa5d2269dfa\n */\n.ant-affix:where(.ant-affix-css-var){font-family:var(--ant-font-family);font-size:var(--ant-font-size);box-sizing:border-box;}\n.ant-affix:where(.ant-affix-css-var)::before,.ant-affix:where(.ant-affix-css-var)::after{box-sizing:border-box;}\n.ant-affix:where(.ant-affix-css-var) [class^=\"ant-affix\"],.ant-affix:where(.ant-affix-css-var) [class*=\" ant-affix\"]{box-sizing:border-box;}\n.ant-affix:where(.ant-affix-css-var) [class^=\"ant-affix\"]::before,.ant-affix:where(.ant-affix-css-var) [class*=\" ant-affix\"]::before,.ant-affix:where(.ant-affix-css-var) [class^=\"ant-affix\"]::after,.ant-affix:where(.ant-affix-css-var) [class*=\" ant-affix\"]::after{box-sizing:border-box;}\n.ant-affix:where(.ant-affix-css-var){position:fixed;z-index:var(--ant-affix-z-index-popup);}\n.ant-affix-css-var{--ant-affix-z-index-popup:10;}\n";
export default css;
