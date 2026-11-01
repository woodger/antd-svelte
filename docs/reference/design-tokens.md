# Статический расчёт design tokens

> Type: Reference. Статическая часть theme API Ant Design 6.6.8 для Svelte/TypeScript.

Публичный `theme` содержит `defaultSeed`, `defaultAlgorithm`, `darkAlgorithm`,
`compactAlgorithm` и `getDesignToken`. Они работают без DOM, React и CSS-in-JS
runtime. Точные типы принадлежат
[theme-token.types.ts](../../src/lib/theme-token.types.ts), вычисления —
[theme.engine.ts](../../src/lib/theme.engine.ts) и соседним engines.

```ts
import { theme, type DesignTokenConfig } from 'antd-svelte';

const config: DesignTokenConfig = {
  algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
  token: { colorPrimary: '#1677ff', borderRadius: 8 }
};

const token = theme.getDesignToken(config);
// token.colorPrimary === '#1668dc'
// token.fontSize === 12
// token.controlHeight === 28
```

## Seed, map и alias

`defaultSeed` — исходные значения Ant Design. `defaultAlgorithm(seed)` возвращает
MapToken с палитрами, размерами, шрифтами, радиусами и motion durations.
`darkAlgorithm(seed, previousMap?)` и `compactAlgorithm(seed, previousMap?)`
продолжают цепочку; без previousMap сначала используют defaultAlgorithm.

`getDesignToken(config?)` копирует defaultSeed и config.token, выполняет алгоритмы
по порядку и возвращает новый AliasToken. В стандартном результате 536 полей,
включая обе нотации палитр `blue1` и `blue-1`. Расчёт сохраняет исходные округления,
формулы и строки теней. Явные нули и отрицательные числовые значения не заменяются
дополнительными defaults библиотеки.

Seed overrides подаются алгоритмам. Остальные overrides применяются перед
расчётом aliases и повторно в конце. Например, fontSizeLG/lineHeightLG влияют на
fontHeightLG; явно переданный controlItemBgActive сохраняет своё значение.
`motion: false` обнуляет расчётные durations, `focusOutline: false` — lineWidthFocus;
явный финальный alias override может перекрыть эти значения, как в эталоне.

## Пользовательские алгоритмы

MappingAlgorithm получает тот же объект seed на каждом шаге и MapToken
предыдущего шага либо undefined на первом. Функции выполняются синхронно;
исключение передаётся вызывающему коду без замены. Цепочка использует reduce,
как исходный cssinjs: добавление callback в массив во время расчёта не запускает
его в текущем проходе.

```ts
import { theme, type MappingAlgorithm } from 'antd-svelte';

const largeControls: MappingAlgorithm = (seed, map) => ({
  ...(map ?? theme.defaultAlgorithm(seed)),
  controlHeight: 40
});

const token = theme.getDesignToken({
  algorithm: [theme.darkAlgorithm, largeControls]
});
```

Входной объект overrides не меняется. Ссылка на него фиксируется до вызова
алгоритмов, как в исходном getComputedToken. Пустой массив алгоритмов бросает
TypeError; это наблюдаемое поведение закреплённого cssinjs 2.1.2, а не выбор
алгоритма по умолчанию.

## Граница текущего этапа

Статический расчёт не меняет оформление компонентов и не вычисляет component
overrides. Runtime token/algorithm/components, наследование, useToken и глобальные
CSS variables описаны в [справочнике контекста темы](theme-context.md).
Применение всех component tokens к CSS и Wave ещё переносится.
DesignTokenConfig описывает статические token/algorithm; getDesignToken также
принимает полный [ThemeConfig](../../src/lib/types.ts), игнорируя runtime поля.

Исходные модули seed/map/alias не зависят от Svelte runtime. Поля textDecoration
в AliasToken представлены CSS-строками вместо React.CSSProperties.

## Эталон и проверки

Перенос сверяется с закреплёнными
[getDesignToken](https://github.com/ant-design/ant-design/blob/984592267de88fbf9cdaecc96a56629e721c709d/components/theme/getDesignToken.ts),
algorithms и alias formatter Ant Design 6.6.8. Изучены @ant-design/colors 8.0.1,
@ant-design/cssinjs 2.1.2 и @ant-design/fast-color 3.0.1. Их runtime dependencies
не добавлены в пакет.

[Эталонные данные](../../tools/fixtures/ant-design-theme-reference.json) получены
из официального `package/dist/antd.min.js` после проверки SHA-256 npm-архива.
Они содержат полные map/alias результаты для 25 настроек: цепочки алгоритмов,
custom seed, все preset colors, прозрачность, размеры, motion/focus, overrides
и ошибки. Encoding сохраняет undefined, NaN, infinities и negative zero;
он не нормализует результаты. Тесты проверяют также порядок ключей.
Для запуска сохранённого эталона локальный upstream или сеть не нужны.

- [Unit и boundary cases](../../src/lib/theme.engine.test.ts).
- [Сверка с официальным UMD](../../src/lib/theme-reference.test.ts).
- [SSR публичного пакета](../../tests/package/theme-tokens.ssr.test.ts).
- [Браузерный consumer](../../tests/browser/theme-tokens.spec.ts), маршрут
  `?fixture=theme-tokens`.

Лицензии: [Ant Design](../../src/lib/vendor/LICENSE.ant-design),
[colors](../../src/lib/vendor/LICENSE.ant-design-colors),
[cssinjs](../../src/lib/vendor/LICENSE.cssinjs) и
[FastColor](../../src/lib/vendor/LICENSE.fast-color).
