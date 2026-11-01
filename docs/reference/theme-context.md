# Токены темы в ConfigProvider

> Type: Reference. Реактивный theme context Ant Design 6.6.8 для Svelte 5.

ConfigProvider принимает source `token`, `algorithm`, `components`, `inherit`,
`hashed` и `cssVar` вместе с существующими mode/primary/compact. Точные объявления
находятся в [ThemeConfig](../../src/lib/types.ts),
[ComponentTokenMap](../../src/lib/theme-component-token.types.ts) и
[ThemeTokenResult](../../src/lib/theme-context.types.ts).

Расчёт и наследование принадлежат [theme-config.engine.ts](../../src/lib/theme-config.engine.ts),
Svelte context — [theme-context.svelte.ts](../../src/lib/theme-context.svelte.ts).
Пакет не зависит от React или CSS-in-JS runtime.

## Использование

```svelte
<script lang="ts">
  import { ConfigProvider, theme } from 'antd-svelte';
  import TokenConsumer from './TokenConsumer.svelte';

  let primary = $state('#00b96b');
</script>

<ConfigProvider theme={{
  algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
  token: { colorPrimary: primary, borderRadius: 8 }
}}>
  <TokenConsumer />
</ConfigProvider>
```

TokenConsumer.svelte:

```svelte
<script lang="ts">
  import { theme } from 'antd-svelte';
  const current = theme.useToken();
</script>

<p style:color={current.token.colorPrimary}>
  Current primary: {current.token.colorPrimary}
</p>
```

useToken вызывается при инициализации компонента, как другие Svelte context API.
Возвращаемый объект содержит getters: чтение current.token в markup или $derived
следит за изменениями provider. Однократное destructuring сохраняет текущее
значение и не подписывает переменную на последующие изменения.

| API | Результат | Контекст |
| --- | --- | --- |
| theme.getDesignToken(config) | AliasToken | Статический расчёт, без component overrides |
| theme.useToken().token | GlobalToken | Текущая тема и компонентные overrides |
| theme.useToken().theme | Объект с id/getDerivativeToken | Кэш по упорядоченной цепочке функций |
| theme.useToken().cssVar | CSSVariableToken | Примитивы заменены на var(...), breakpoints сохранены |

Название cssVar в публичном useToken повторяет Ant Design 6.6.8: это transformed
token, а не объект настроек prefix/key. Типы не требуют React.CSSProperties;
CSS lengths и font metrics представлены string/number, как исходные поля.

## Наследование и алгоритмы

Provider без theme сохраняет родительский context. Локальная theme объединяет
token overrides и каждый компонентный record по одному уровню. Локальное
значение поля, включая явный undefined, перекрывает родительское.

inherit=false сбрасывает родительские tokens, algorithms, component overrides и
native mode/primary/compact. Настройки hashed, cssVar и zeroRuntime продолжают
наследоваться. Локальная theme получает собственный cssVar.key; явный непустой key
сохраняется, а пустой key включает генерацию. Generated key стабилен между SSR и
гидратацией благодаря Svelte $props.id().

Runtime algorithm=[] включает defaultAlgorithm, как ConfigProvider upstream.
Это отличается от [статического getDesignToken](design-tokens.md), где пустой
массив бросает TypeError. Custom mappers выполняются синхронно и должны оставаться
чистыми при реактивном расчёте; исключения не заменяются fallback.

Без явного source algorithm старые mode/compact выбирают соответствующие source
algorithms. Native primary выбирает seed colorPrimary; явный token.colorPrimary
имеет приоритет. Явный algorithm определяет расчёт независимо от mode/compact.

## Компонентные overrides

ComponentTokenMap сохраняет все 70 записей и 679 полей закреплённого upstream.
components.Input.algorithm=true повторно использует общий Theme, false сохраняет
только переданные компонентные overrides. Отдельная функция или массив задают
собственный алгоритм компонента. Пересчёт не меняет глобальные и соседние токены.

```ts
import { theme, type ThemeConfig } from 'antd-svelte';

const config: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  components: {
    Input: { colorPrimary: '#00b96b', algorithm: true },
    InputNumber: { handleWidth: 50.1234 }
  }
};
```

Эти records доступны в GlobalToken. Исходные prepareComponentToken и применение
CSS-переменных подключены для Button, Input, TextArea, InputNumber, SpaceAddon,
Radio/RadioButton/RadioGroup, Checkbox/CheckboxGroup и Switch.
InputPassword, InputSearch и ячейки InputOTP используют общий Input token scope.
Остальные компонентные CSS-потребители ещё переносятся: наличие поля в
ComponentTokenMap не подтверждает его визуальное покрытие.

## Токены controls

Подготовка получает глобальные токены, объединённые с record компонента;
после расчёта явные component overrides сохраняют приоритет. Button использует
собственные font/line-height metrics, preset shadows и padding; Input/TextArea —
общий расчёт размеров и теней фокуса. Нулевые значения сохраняют source-поведение:
Button font overrides используют ??, Input inputFontSize — ||.

InputNumber рассчитывает controlWidth, размеры и видимость handles, padding и
filled backgrounds. При handleVisible=true исходный handleVisibleWidth вычисляется
из controlHeightSM; отдельный handleWidth задаёт ширину при hover/focus. Это разные
токены. Например, handleWidth=36 при стандартном размере оставляет 22px в покое и
использует 36px при наведении.

Radio подготавливает размеры круга и точки, цвета обычного/кнопочного режима и
отступы. radioSize/dotSize — unitless CSS variables; размеры точки вычисляются
до окончательных component overrides. Checkbox использует alias tokens без
отдельных ComponentToken defaults. Switch рассчитывает track/handle/margin tokens
для обычного и small-размера. Отдельные component algorithms меняют эти controls
независимо от глобальной темы.

Явный undefined в ComponentToken не восстанавливает default: соответствующая
переменная наследуется, как при отсутствии декларации upstream. На CSS-корнях
это явно перекрывает статические vendor defaults; нулевые значения сохраняются.

Группы, affix wrappers и native input/textarea получают необходимые переменные;
собственный CSS-корень вложенного control сбрасывает чужие alias overrides.
Приоритет semantic/plain style и inline variables ConfigProvider сохраняется.
Scope-правила появляются в Svelte head уже при SSR и удаляются вместе с provider.
При ручном svelte/server render нужно включить result.head в HTML страницы.

Footer-кнопки DatePicker/RangePicker и TimePicker/TimeRangePicker используют общий
Button. Они получают его component tokens и semantic config при фиксированном
source размере small, независимо от Compact и размера picker.

## CSS и совместимость

При source-настройках provider размещает рассчитанные глобальные CSS variables
в своём scope уже при SSR. Числа получают px, кроме исходных unitless tokens;
breakpoints и параметры motionBase/motionUnit не сериализуются в CSS.
Произвольный cssVar.prefix поддерживается через source variables и совместимые
aliases для опубликованного CSS с префиксом ant. Пользовательский style provider
записывается последним и сохраняет приоритет, не меняя значения useToken.

Дополнительные theme boundaries ColorPicker и Tour получают те же переменные,
включая перенос popup в другой DOM container. Нативные темы без source-настроек
сохраняют прежние CSS-переопределения и геометрию.

hashId и внутренний token key используют исходную арифметику cssinjs 2.1.2 и
@emotion/hash 0.8.0; hashed=false возвращает пустой hashId. Классы hash/cssVar
добавлены к scope provider и перечисленным выше controls при source-настройках.
Остальные компонентные roots, prefixCls и полная подготовка component styles остаются
в работе. [Wave](wave.md) использует настоящий GlobalToken в showEffect и исходные
CSS variables/durations для стандартного эффекта.
zeroRuntime наследуется; опубликованные стили компонентов уже статические,
отдельный CSS-in-JS renderer библиотеки не добавлен.

## Эталон и проверки

Изучены исходные
[useTheme](https://github.com/ant-design/ant-design/blob/984592267de88fbf9cdaecc96a56629e721c709d/components/config-provider/hooks/useTheme.ts),
[ConfigProvider](https://github.com/ant-design/ant-design/blob/984592267de88fbf9cdaecc96a56629e721c709d/components/config-provider/index.tsx)
и [useToken](https://github.com/ant-design/ant-design/blob/984592267de88fbf9cdaecc96a56629e721c709d/components/theme/useToken.ts),
а также cssinjs/cssinjs-utils 2.1.2 и emotion/hash 0.8.0.

[Эталон контекста](../../tools/fixtures/ant-design-theme-context-reference.json)
получен из официального antd.min.js после проверки SHA-256 архива. Он сохраняет
полные raw tokens, CSS-variable tokens, порядок ключей, hashes и derivative output
для 23 сценариев. Тесты не требуют React, сети или локального upstream.

- [Source conformance](../../src/lib/theme-context-reference.test.ts).
- [Наследование и runtime boundary](../../src/lib/theme-config.engine.test.ts).
- [SSR публичного пакета](../../tests/package/theme-context.ssr.test.ts).
- [Браузерные consumers](../../tests/browser/theme-context.spec.ts),
  маршрут `?fixture=theme-context`.
- [Эталон компонентных CSS-переменных](../../src/lib/theme-control-tokens-reference.test.ts)
  из официального UMD: 12 настроек Button/Input/InputNumber/Addon, включая нули,
  отдельные алгоритмы, custom prefix и fractional handle width.
- [SSR controls](../../tests/package/control-theme.ssr.test.ts) и
  [браузерное применение](../../tests/browser/control-theme.spec.ts),
  маршрут `?fixture=control-theme`.
- [Эталон Radio/Checkbox/Switch](../../src/lib/theme-toggle-tokens-reference.test.ts)
  из официального UMD: 13 настроек, включая wireframe, отдельные algorithms,
  нули, undefined и custom prefix.
- [SSR checkables](../../tests/package/toggle-theme.ssr.test.ts) и
  [браузерная геометрия/состояния](../../tests/browser/toggle-theme.spec.ts),
  маршрут `?fixture=toggle-theme`. Ожидаемые размеры и цвета получены из computed
  styles официального UMD и принадлежат браузерному test contour.
- [Композиция PickerButton](../../tests/browser/picker-button.spec.ts): четыре
  footer-ветки, Button tokens/config/Wave, scalar locale text и native focus/формы.

Лицензии: [Ant Design](../../src/lib/vendor/LICENSE.ant-design),
[cssinjs](../../src/lib/vendor/LICENSE.cssinjs),
[cssinjs-utils](../../src/lib/vendor/LICENSE.cssinjs-utils) и
[emotion/hash](../../src/lib/vendor/LICENSE.emotion-hash).
