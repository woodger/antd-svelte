# Индикатор Anchor после изменения стилей

> Type: Reference. Наблюдение Ant Design 6.6.8 для отдельного разбора upstream behavior.

Эталон — commit 984592267de88fbf9cdaecc96a56629e721c709d и неизменённый
`package/dist/antd.min.js` из закреплённого npm-архива. SHA-256 и фактические
замеры сохранены в [raw observation](../../tests/browser/fixtures/ant-design-anchor-config-layout-observation.json).
React и ReactDOM — 18.3.1; theme.cssVar включён, motion выключен.

У вертикального Anchor два пункта, affix=false, showInkInFixed=true. Массив items
и функция getCurrentAnchor, возвращающая второй href, остаются теми же.
Меняется только ConfigProvider.anchor.styles.itemTitle: paddingTop/paddingBottom
с 4px на 20px.

| Замер | Padding 4px | Padding 20px |
| --- | --- | --- |
| clientHeight активной ссылки | 30px | 62px |
| offsetTop активной ссылки | 42px | 74px |
| Computed height индикатора | 30px | 30px |
| Computed top индикатора | 57px | 57px |

Правильные новые размеры по собственному алгоритму Anchor — height=62px и
top=105px. Upstream effect, вызывающий updateInk, зависит от direction,
getCurrentAnchor, зарегистрированных href и activeLink; изменения styles или
classNames не запускают его. Это дефект синхронизации, а не правило приоритета
стилей. Исходные результаты оставлены без исправления.

Svelte пересчитывает top/height или left/width после изменения semantic styles
и classes. Это также сохраняет координаты при обновлении CSS-строки indicator:
Svelte заменяет атрибут style целиком, включая прежние императивные координаты.
Эти четыре координаты принадлежат runtime, как в исходном updateInk; цвет и
остальное оформление остаются пользовательскими. DOM ссылок и индикатора,
фокус, href/history и callbacks сохраняются.

[Обычная reference matrix](../../tests/browser/fixtures/ant-design-anchor-config-reference.json)
содержит независимые начальные состояния нового Anchor; их геометрия сравнивается
с исходником точно. [Browser tests](../../tests/browser/anchor-config.spec.ts)
отдельно проверяют корректные обновления provider/local styles у вертикального
и горизонтального Anchor. Reference не выдаёт исправленные Svelte обновления
за поведение исходного Ant Design. Изменения размеров от внешнего CSS без
изменения semantic props, а также resize не входят в это исправление;
ResizeObserver не добавляется.
