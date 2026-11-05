# Пустые состояния ConfigProvider

> Type: Reference. ConfigProvider.renderEmpty по Ant Design 6.6.8.

Точные типы — [RenderEmptyHandler/RenderEmptyContent](../../src/lib/types.ts).
Callback получает имя потребителя и возвращает текст, число, boolean, null/undefined,
Svelte Snippet или вложенные readonly arrays этих значений. Callback создаёт содержимое;
возвращённый Snippet затем отображается как обычный Svelte UI.

```svelte
<script lang="ts">
  import { ConfigProvider, Select } from 'antd-svelte';
</script>

{#snippet noData()}<p>Нет подходящих записей.</p>{/snippet}

<ConfigProvider renderEmpty={() => noData}>
  <Select options={[]} aria-label="Участник" />
</ConfigProvider>
```

## Потребители и приоритеты

| Потребитель | Имя callback | Локальное переопределение | Fallback результата callback |
| --- | --- | --- | --- |
| Select | Select | notFoundContent !== undefined | `||`, simple small Empty |
| TreeSelect | TreeSelect | notFoundContent !== undefined | `||`, simple small Empty |
| Cascader / CascaderPanel | Cascader | notFoundContent !== undefined | `||`, simple small Empty |
| Mentions | Mentions | notFoundContent !== undefined | `||`, simple small Empty |
| Transfer | Transfer | locale.notFoundContent после вычисления default | `||`, simple small Empty |
| Table | Table | Существующий empty Snippet | `||`, simple Empty |
| Фильтр Table | Table.filter | — | `??`, локализованный Empty с image height=24px |
| List | List | locale.emptyText через `||` | `||`, simple Empty |
| AutoComplete | Не вызывается | notFoundContent | Как в upstream combobox, глобальный renderer не используется |

В Select/TreeSelect/Cascader/Mentions локальные null, пустая строка и 0 не вызывают
глобальный callback. List сохраняет исходный `locale.emptyText || renderEmpty || default`:
локальные falsy используют следующий слой. Table сохраняет свой native empty Snippet
вместо ещё не перенесённого полного `locale.emptyText` API.

Для большинства потребителей глобальные null/undefined/false/0/пустая строка выбирают
исходный preset. True и пустой массив являются truthy и не рисуют содержимое, не включая
preset. У Table.filter только null/undefined выбирают fallback; false/пустая строка
оставляют пустой блок, 0 выводится текстом. Отдельный DefaultRenderEmpty для имени
Table.filter возвращает null; сам фильтр задаёт изображение 24px и описание
Locale.table.filterEmptyText. Фильтр доступен и для явно переданных filters=[] при
поддерживаемом native client/server режиме колонки.

Transfer сначала вычисляет общий renderer, затем применяет props.locale, включая
явный notFoundContent=undefined/null. Массив верхнего уровня выбирает содержимое по
направлению списка, как в исходнике; вложенные массивы выбранной стороны отображаются
рекурсивно. Общий callback не вызывается повторно отдельно для каждой стороны.

Вложенный ConfigProvider наследует renderEmpty при undefined. Собственная функция
заменяет родительскую: её falsy результат выбирает preset, а не родительский callback.
ConfigProvider.empty применяется к получившемуся Empty, но локальное preset image=simple
имеет приоритет над context image.

## Сохраняемые native contracts

Без настроенного renderEmpty сохраняются прежние локализованные тексты, loading и
разметка пустых состояний. Исходные presets подключаются при наличии callback и его
falsy результате. Local notFoundContent=0 у Select/TreeSelect по-прежнему показывает 0:
у upstream popup в этих случаях скрыт. Это отдельно сверяется со свежей сборкой
[8847e8d](../../tests/browser/fixtures/render-empty-native-reference.json).

Содержимое не получает дополнительный DOM-wrapper. Стабильный возвращаемый Snippet
сохраняет DOM/state при замене функции producer. Select допускает фокус в controls
пустого содержимого; выход наружу закрывает список. Native input blur-callback и
закрытие popup по Tab из combobox сохраняются. Для действия, которое должно оставить
фокус в поисковом поле, предотвращайте pointerdown default.

Callback должен быть чистым: он может вычисляться при SSR и создании скрытого popup.
В Svelte он вычисляется по потреблению пустой ветки; Transfer получает его при расчёте
локали. Число вызовов React render не переносится как контракт. AutoComplete не вызывает
глобальный renderer. Общий prefixCls ConfigProvider, полный React DOM и остальные
незавершённые API потребителей этим этапом не добавлены.

## Проверки и источники

- [Общий renderer](../../src/lib/RenderEmpty.svelte) и
  [presets](../../src/lib/DefaultRenderEmpty.svelte).
- [151 официальный сценарий и Select interaction trace](../../tests/browser/fixtures/ant-design-render-empty-reference.json)
  из закреплённого UMD; 149 сценариев сверяются напрямую, два — с native baseline.
- [Браузерные проверки](../../tests/browser/render-empty.spec.ts) и
  [public package SSR](../../tests/package/render-empty.ssr.test.ts).
- [Исходный defaultRenderEmpty](https://github.com/ant-design/ant-design/blob/984592267de88fbf9cdaecc96a56629e721c709d/components/config-provider/defaultRenderEmpty.tsx).
- Переходы фокуса изучены в @rc-component/select 1.10.1 BaseSelect; остальные
  приоритеты принадлежат закреплённым Ant Design wrappers, Transfer и FilterDropdown.
