# Текущий medium и устаревшие размеры Ant Design

> Type: Reference. Замеры Ant Design 6.6.8 на закреплённом commit
> 984592267de88fbf9cdaecc96a56629e721c709d.

В Svelte используются `small`, `medium` и `large`; обычный размер
ConfigProvider — `medium`. Значения `middle` и `size="default"` удалены
из поддерживавших их API. `Row.align="middle"`, CSS vertical-align и
Skeleton.shape="default" остаются текущими API.

[Raw замеры](../../tools/fixtures/ant-design-current-size-observation.json) получены
из неизменённого официального UMD, без статического antd.css: 171 профиль,
29 семейств, локальный размер и наследование от ConfigProvider,
default/dark/compact algorithms. Измерены размеры, шрифт, отступы, gap,
границы и цвета. У 166 профилей измеренный CSS совпал; semantic callbacks
получают новое имя размера и не объявляются равными старым.

У Table наследуемый `middle` в default/dark даёт cell padding 16px,
а `medium` — 12px по вертикали и 8px по горизонтали. В compact отличаются
горизонтальные отступы: 8px и 4px. Локальные размеры middle/medium совпадают.
У Descriptions локальный `default` даёт вертикальный padding 16px,
а `medium` — 12px в default/dark. Эти отличия сохранены в raw данных;
переименование старого значения не считается доказательством одинакового CSS.

В прежних эталонах имена некоторых наборов и DOM-меток содержат `middle`.
Эти имена сохранены для сопоставления с raw измерениями;
[адаптер фикстур](../../tests/browser/fixtures/reference-size.ts) передаёт
в компоненты актуальный `medium`. Для semantic callbacks Card/Descriptions
и пяти профилей Collapse сделаны новые замеры с явным componentSize=medium.
Два профиля Divider заново измерены с локальным size=medium.
Старые профили, проверявшие deprecated размеры как самостоятельный API, удалены.
