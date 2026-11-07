# Варианты оформления полей

> Type: Reference. Локальное оформление и наследование через ConfigProvider и Form.

`ConfigProvider.variant` задаёт общее оформление полей: outlined, filled, borderless
или underlined. `Form.variant` задаёт оформление внутри ближайшего Form.
Точная форма API принадлежит [ConfigProvider](../../src/lib/ConfigProvider.svelte),
[FormProps](../../src/lib/form.types.ts) и типам отдельных компонентов.

```svelte
<ConfigProvider variant="filled" input={{ variant: 'underlined' }}>
  <Input />
  <Form {form} variant="borderless">
    <Input />
    <Select {options} variant="outlined" />
  </Form>
</ConfigProvider>
```

Первый Input будет underlined, второй — borderless, Select — outlined.
Без настройки используется outlined. Приоритет повторяет Ant Design 6.6.8:

1. Локальный variant.
2. Локальный legacy bordered=false, если компонент поддерживает этот prop.
3. Variant ближайшего Form.
4. Variant из component config.
5. Fallback component config у Password, Search и OTP: input.variant.
6. Общий ConfigProvider.variant.
7. Outlined.

Bordered=true не отменяет наследование. У Search fallback input.variant меняет
только поле. Кнопка читает собственный inputSearch.variant, Form или global variant;
без этих настроек она сохраняет обычное оформление Button.

Общий механизм подключён к Input, TextArea, InputPassword, InputSearch, InputOTP,
InputNumber, Mentions, Select single/multiple, AutoComplete, TreeSelect, Cascader,
DatePicker, TimePicker, RangePicker, TimeRangePicker, Card и Pagination.
AutoComplete читает config Select. TimePicker читает timePicker.variant,
TimeRangePicker — rangePicker.variant. Pagination использует variant поля Input;
size changer сохраняет отдельный Select config.

Card имеет локальные варианты outlined/borderless. Унаследованные filled и
underlined, как в исходнике, сохраняют рамку Card; отдельное оформление для них
не добавляется. Button, Tag и SpaceAddon имеют собственные правила и не читают
общий variant через этот механизм.

ColorPicker задаёт своему внутреннему выбору формата borderless, как исходный
ColorInput. Это локальное правило сохраняется внутри любого Form/ConfigProvider;
остальные поля ColorPicker читают обычные настройки Input/InputNumber.

Вложенный ConfigProvider наследует отсутствующий component config. Явный объект,
включая пустой, заменяет соответствующий родительский объект целиком. Настройка
global variant во вложенном provider не отменяет унаследованный component variant.
Theme.inherit=false сбрасывает тему, сохраняя настройки variant.

Вложенный Form с variant=undefined сбрасывает variant внешнего Form и возвращает
приоритет component/global config. `component={false}` сохраняет контекст Form
без нативной обёртки: его можно использовать внутри существующей формы.
По умолчанию Form рендерит прежний native form с submit/reset и validation.

Изменения оформления после mount сохраняют DOM контролов, введённый текст,
фокус, выделение, выбранные значения и FormData. Они не вызывают change callbacks.
Существующие native events, bindings, semantic styles и theme tokens сохраняют
свои контракты.

ConfigProvider.select/treeSelect/datePicker/mentions на этом этапе принимают
только variant. Их остальные исходные component config props пока не перенесены.
Card и Meta также поддерживают [class/style и semantic config](../../readme.md#card).
MentionsComponentConfig относится к provider; прежний MentionsConfig остаётся
настройкой функции getMentions. Form component поддерживает form/false;
произвольные wrapper tags остаются отдельным пробелом.

Эталон — неизменённый UMD Ant Design 6.6.8 из закреплённого npm-архива. Raw computed
colors/borders и классы всех потребителей находятся в
[reference matrix](../../tests/browser/fixtures/ant-design-config-variants-reference.json).
Приоритеты проверяют [unit tests](../../src/lib/variant.engine.test.ts), публичный
SSR — [package tests](../../tests/package/config-variants.ssr.test.ts), оформление,
обновления и изоляцию — [browser tests](../../tests/browser/config-variants.spec.ts).
