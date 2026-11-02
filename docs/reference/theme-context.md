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
Подключены также Avatar/AvatarGroup, Badge, Tooltip, Popover, Popconfirm,
Select, AutoComplete, TreeSelect и Cascader/CascaderPanel.
Anchor, Breadcrumb, Menu, Dropdown, Steps, Timeline, Pagination и Tabs получают собственные
defaults и aliases.
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

Avatar рассчитывает container/text/icon sizes и токены группы из текущей темы.
AvatarGroup, кнопка +N и скрытые аватары используют те же component overrides.
groupOverlapping/groupBorderColor задают перекрытие и обводку, groupSpace —
расстояние между строками существующего именованного overflow-списка.
Числовой size Avatar сохраняет исходные width/height и font-size текста 18px
или иконки size/2; plain style имеет приоритет.

Badge рассчитывает размеры count/dot/status, font metrics и padding. Тень
индикатора использует colorBorderBg. Numeric indicatorZIndex/textFontWeight
получают px, как в исходном hook 6.6.8; строковые значения сохраняются без единиц.
Это правило проверяется по CSS declarations и computed styles официального UMD.
Native-only Avatar/Badge сохраняют прежние размеры и оформление.

Явный undefined в ComponentToken не восстанавливает default: соответствующая
переменная наследуется, как при отсутствии декларации upstream. На CSS-корнях
это явно перекрывает статические vendor defaults; нулевые значения сохраняются.

Группы, affix wrappers и native input/textarea получают необходимые переменные;
собственный CSS-корень вложенного control сбрасывает чужие alias overrides.
Приоритет semantic/plain style и inline variables ConfigProvider сохраняется.
Scope-правила появляются в Svelte head уже при SSR и удаляются вместе с provider.
При ручном svelte/server render нужно включить result.head в HTML страницы.
Корень панели Popover также получает scope-класс: Avatar aliases не меняют
оформление самой панели.

Footer-кнопки DatePicker/RangePicker и TimePicker/TimeRangePicker используют общий
Button. Они получают его component tokens и semantic config при фиксированном
source размере small, независимо от Compact и размера picker.

## Токены Select

Select рассчитывает высоты tags через min(controlHeight - 2 * paddingXXS,
controlHeight - 2 * lineWidth), внутренний margin через floor(paddingXXS / 2),
padding и font metrics options, цвета selector/selection/focus и zIndexPopup.
После подготовки явные component overrides сохраняют исходный приоритет.
optionLineHeight, optionSelectedFontWeight и zIndexPopup сериализуются без px.
Нулевые paddingXXS и lineWidthFocus сохраняют source-расчёт.

Обёртка и dropdown получают key/hash scope, selector — собственные CSS variables.
Родительские aliases сбрасываются к provider; отдельный Select algorithm и custom
CSS prefix работают независимо от остальных controls. Значения уже присутствуют
в SSR-разметке. Обновления сохраняют native input/option nodes, поисковый текст,
выделение, фокус и данные формы; удаление source-настроек возвращает native стили.

Поле multiple использует line-height высоты tag плюс два внутренних margin.
Options размещены в flex column без сжатия, как внутренний virtual-list;
пустая выдача, как в OptionList, остаётся вне этого flex-контекста. Это сохраняет
геометрию в том числе при undefined optionHeight. При source compact
small одиночный Select имеет высоту 22px, multiple — 21px, как официальный UMD.
Стрелка/clear используют fontSizeIcon, focus включает исходные active tokens;
кнопка очистки сохраняет нативный Tab и возврат фокуса в поле.

В outlined multiple исходные стили 6.6.8 задают прозрачную границу tag и наследуют
disabled color. multipleItemBorderColor/multipleItemBorderColorDisabled и
multipleItemColorDisabled сериализуются, но не меняют это поведение upstream.
Наличие ComponentToken не означает, что источник использует его в каждой ветке CSS.
Полные variants/semantic config/prefixCls, virtualization и остальные rc-select
props ещё не перенесены. Общие Select-style consumers AutoComplete, TreeSelect и
Cascader используют те же upstream стили и получают соответствующие component
tokens. Native-only темы сохранены.

AutoComplete использует Select scope для обычного поля, clear и popup, включая
group indentation и font metrics. Custom Input получает собственные Input tokens;
оболочка customize наследует шрифт provider и не задаёт минимальную высоту Select.
Нативная textarea сохраняет rows и собственные style/constraints. При обновлении
темы меняются CSS variables панели, а left/top/ширина остаются у DOM-controller
и соответствующих props. Фокус, selection, текст, options и FormData сохраняются.

TreeSelect объединяет style hooks Select и TreeSelect в исходном порядке;
aliases TreeSelect применяются к полю и dropdown после aliases Select.
Семь TreeSelect defaults берутся из tree.initComponentToken: titleHeight,
switcherSize и indentSize зависят от controlHeightSM, цвета — от глобальных
control/text tokens. Поэтому source compact использует высоту узла 21px.
Внутренний Tree наследует этот scope без применения `components.Tree`.
Нативные checkbox-кнопки в source панели сохраняют border/background vendor CSS,
а в native-only теме — прежнее оформление. SSR получает переменные на корнях;
снимок popup создаётся вместе с ним, последующие изменения затрагивают только
theme variables и сохраняют controller left/top и размеры из props.

Cascader объединяет Select и Cascader scopes в исходном порядке. Восемь Cascader
defaults задают ширину поля/колонок, высоту dropdown, отступы и выбранную строку;
optionPadding рассчитывается с Math.round, optionSelectedFontWeight остаётся
безразмерным. Настройки `components.Checkbox` не меняют checkbox внутри Cascader.
Standalone CascaderPanel получает только Cascader scope и наследует шрифт/цвет
provider без Select aliases; фон панели остаётся прозрачным, как upstream.

Обёртки tags/input сохраняются при смене темы: source overflow измеряет каждый
tag отдельно, native-only тема использует display:contents. Это сохраняет также
геометрию при нулевой controlWidth и responsive maxTagCount. Переменные popup
присутствуют при SSR и обновляются отдельно от controller left/top; semantic
styles.popup.root сохраняет приоритет, в том числе при смене ширины поиска.
Смена темы сохраняет input/rows, поисковый текст, выделение, фокус и callbacks.

## Токены Anchor

Anchor подготавливает linkPaddingBlock из paddingXXS, linkPaddingInlineStart —
из padding. Явные component overrides применяются после defaults. Первый
горизонтальный пункт сохраняет нулевой inline-отступ. Вложенные ссылки используют
paddingXXS / 2, а отступ заголовка с детьми — fontSize / 14 * 3, независимо от
linkPaddingBlock. Source compact использует inline-отступ 8px; native-only compact
сохраняет прежние 16px.

Aliases и отдельный component algorithm задают шрифт, цвета и границы. Hash/key
scope и CSS variables присутствуют при SSR, включая Anchor внутри Affix.
Нули сохраняются, undefined не возвращает vendor defaults; custom CSS prefix
связан с опубликованным ant CSS. Semantic root style и plain style сохраняют
приоритет. Source-ссылки используют linkDecoration, linkHoverDecoration и
linkFocusDecoration для обычного, hover/active и focus состояний; по умолчанию
подчёркивания нет. Native-only оформление сохраняется. Обновления сохраняют DOM ссылок,
фокус, scroll/history и callbacks. Измерение indicator и отслеживание scroll
сохраняют исходный lifecycle.

## Токены Breadcrumb

Семь defaults задают itemColor, lastItemColor, iconFontSize, linkColor,
linkHoverColor, separatorColor и separatorMargin. Они рассчитываются из общих
tokens и aliases Breadcrumb; явные component overrides применяются последними.
Поддержаны component algorithms, CSS prefix/hash, нули/undefined и переданные
во время выполнения CSS-строки размеров. Semantic root styles и plain style
сохраняют приоритет после tokens.

В upstream внешний overlay наследует цвет пункта, а вложенная ссылка получает
linkColor. Svelte сохраняет нативный trigger-link: отдельный span текста передаёт
этот цвет, padding и margins; стрелка наследует цвет пункта, включая последний
пункт и semantic styles.item. Default SVG, custom SVG/anticon и текстовые стрелки
сохраняют исходные размеры и выравнивание. Dropdown/Menu scopes отделяют aliases
popup; автоматическая высота его ссылок перекрывает правило ссылок Breadcrumb,
которое иначе попадает в native popover через DOM предка.

Declarations и computed metrics LTR/RTL сверяются с официальным UMD для 17 тем;
отдельно проверяются девять сочетаний rich title, dropdownIcon, последнего пункта
и semantic color. SSR и обновления сохраняют DOM ссылок, фокус, навигацию,
callbacks и native-only оформление. PrefixCls и глобальный breadcrumb config
вне темы ещё не перенесены.

## Токены Steps и Timeline

Steps подготавливает 18 defaults, включая descriptionMaxWidth=undefined.
Размеры обычной/small иконки, dot/active dot, custom icon font и navigation
используют исходные CSS-переменные. TitleLineHeight, customIconSize/customIconTop,
iconTop и legacy waitIcon*/finishIcon* defaults по-прежнему сериализуются,
но CSS 6.6.8 их не читает; дополнительные правила для них не вводятся.
Wireframe меняет исходные defaults без добавления отсутствующего source-оформления.

Timeline подготавливает шесть defaults: tailColor/tailWidth, dotBorderWidth,
dotBg/dotSize и itemPaddingBottom. Неопределённые dotBg/dotSize сохраняют fallback
на Steps. Оба scope находятся на одном ol: сначала Steps tokens/aliases,
затем Timeline. Например, Timeline.fontSize меняет заголовок, а размер шрифта
иконки остаётся отдельным Steps.iconFontSize. Semantic root styles и plain style
применяются после tokens; вычисленный Timeline.titleSpan сохраняет приоритет.

Поддержаны component algorithms, custom CSS prefix/hash, нули/undefined и runtime
CSS lengths. Scoped declarations и 328 наборов computed metrics для 18 тем
получены из официального UMD: LTR/RTL, размеры/статусы, custom icons, dot,
navigation, outlined, vertical, title-vertical, panel, inline, progress и обе
ориентации Timeline. SSR и обновления сохраняют DOM, нативные кнопки и поля,
фокус, выделение и callbacks. Native-only темы и согласованные отличия Steps
не меняются. Произвольные prefixCls и component config вне темы остаются в работе.

## Токены Pagination

Pagination подготавливает 12 собственных defaults и 18 общих Input defaults для
quick jumper. Исходный miniOptionsSizeChangerTop сериализуется, но не читается CSS
6.6.8. Поддержаны component algorithms, aliases, нули/undefined, runtime CSS
lengths и CSS prefix/hash. Навигационный nav получает token scope перед
semantic/plain styles; styled ul наследует defaults без повторного provider
reset. Это сохраняет приоритет существующего styles.root/style на nav.
Внутренний Select получает собственные aliases, а components.Input не меняет
quick jumper: его defaults принадлежат Pagination.

Глобальный wireframe добавляет bordered независимо от component alias wireframe.
Дополнительные правила из pagination/style/bordered.ts находятся в scoped styles
Pagination.svelte: закреплённый dist/antd.css их не содержит. Цвета и padding
исходных ссылок применяются также к native page buttons. Prev/next используют
source line-height: normal, чтобы неопределённая itemSize не меняла высоту кнопки.

Scoped declarations и 240 наборов computed metrics для 18 тем сверяются с
официальным UMD: три размера, disabled/simple, input variants, собственный Select
scope, wireframe и LTR/RTL. Hover страниц/active/prev/disabled и focus quick jumper
имеют отдельный эталон. SSR и обновления сохраняют кнопки, поля, ввод/выделение,
фокус, callbacks и bind API. Native-only темы, nav semantic root и доступный size
changer на XS сохраняются; полный Form variant и произвольный prefixCls остаются
в работе.

## Токены Tabs

Tabs подготавливает 26 defaults из глобальных aliases и `components.Tabs`.
Переопределённые cardHeight/SM/LG участвуют в расчёте padding до наложения
явных component values. Нулевые heights используют исходный fallback при расчёте
padding, но сами нули сохраняются в CSS. Undefined наследуется и не возвращает
vendor defaults. HorizontalItemMargin/RTL регистрируются, но закреплённый CSS
их не использует; horizontalItemGutter продолжает определять отступы.

Root получает собственные component declarations, CSS-variable prefix и hash.
More popup сбрасывает vendor defaults и копирует вычисленные variables своего
origin; user overlay styles сохраняют приоритет. Source-тема снимает прежний
native минимум 32px у списка заголовков: zero/undefined могут давать более низкую
шапку, как в Ant Design. Native-only темы сохраняют прежние цвета и размеры.

Официальный UMD задаёт declarations для 15 тем, 300 наборов метрик для десяти
вариантов в LTR/RTL и 30 наборов popup metrics. Проверяются aliases, algorithms,
padding/height, zero/undefined, scope reset и style priority; live updates сохраняют
DOM, drafts, selection, focus и открытое содержимое More. Полный semantic/config,
произвольный prefixCls и исходный motion остаются отдельными задачами.

## Токены Menu

Menu подготавливает 79 defaults, включая устаревшие имена, из глобальных tokens
и `components.Menu`. Aliases и отдельный algorithm задают размеры, отступы,
шрифты, active bar, группы и light/dark палитру. `groupTitleLineHeight` и
`zIndexPopup` безразмерны. CSS-строки передаются без нормализации, нули сохраняются,
а undefined не возвращает vendor defaults. Source compact использует
itemHeight=35px и collapsedWidth=70px.

Deprecated mapping выполняется после подготовки defaults и перед финальными
overrides, как cssinjs-utils 2.1.2. Например, старый colorActiveBarWidth меняет
activeBarWidth, но не пересчитывает уже подготовленный itemWidth. Текущее явно
заданное значение 0 имеет приоритет над устаревшим именем.

Корневой Menu и popup получают собственный key/hash scope; внутренние списки
наследуют переменные своего меню вместо статических vendor defaults. Plain root
style сохраняет приоритет во вложенных inline-списках; popup получает собственные
component tokens, как отдельная поверхность upstream. Native button заголовка
сохраняет ширину исходного block div, включая fallback некорректного CSS-размера.
Source popup использует paddingXS как промежуток до заголовка и отдельный
borderRadiusLG. Обновление цвета не заменяет DOM и не перезаписывает left/top
controller, фокус, selected/open keys или callbacks. Native-only темы сохраняются.

## Токены всплывающих панелей

Dropdown подготавливает семь defaults: zIndexPopup, paddingBlock, два arrow
offsets, shadow width и два arrow paths. PaddingBlock рассчитывается из
controlHeight, fontSize и lineHeight; component overrides применяются после
расчёта. Поддержаны aliases, отдельные algorithms, нули/undefined, CSS-строки,
hash и CSS prefix. Source compact paddingBlock=4px.

Popup получает Dropdown scope, внутренний список — переменные Menu. Menu aliases
дополняют Dropdown aliases; общий provider reset на списке не применяется.
Menu component defaults также присутствуют, как в upstream при отключённых
правилах Menu, но оформление строк использует Dropdown CSS. Например,
Menu.fontSize меняет строки, а Menu.itemHeight не задаёт их высоту. Source
padding/box sizing и шесть положений стрелки сверяются с официальным UMD.
Промежуток до trigger использует глобальный marginXXS и половину sizePopupArrow
при включённой стрелке; component aliases не меняют этот глобальный расчёт.
Смена темы обновляет variables отдельно от controller left/top и сохраняет
DOM, фокус, native link navigation и существующие Svelte callbacks.
Native-only оформление сохраняется.

Tooltip рассчитывает maxWidth, zIndexPopup, смещения и форму стрелки. Popover
добавляет titleMinWidth, собственный zIndexPopup и arrow tokens, padding и
wireframe-разделение заголовка/содержимого. Deprecated width имеет приоритет
перед minWidth; оба используются только для отсутствующего titleMinWidth.
Нулевой titleMinWidth сохраняется, нулевые deprecated aliases игнорируются,
как в source cssinjs-utils. Popconfirm подготавливает собственный zIndexPopup.

Popover использует также scope внутреннего Tooltip. На корне Popconfirm aliases
применяются в исходном порядке Tooltip → Popover → Popconfirm. Вложенный Popover
получает собственные aliases, не наследуя overrides внешнего Popconfirm.
Component algorithms, undefined, нули и custom CSS prefix поддерживаются;
zIndexPopup сериализуется без px, path/polygon стрелок — как строки CSS.

Позиционирование читает глобальные sizePopupArrow и marginXXS: отступ равен
sizePopupArrow / 2 + marginXXS со стрелкой и marginXXS без неё. Component aliases
влияют на CSS, но не подменяют глобальные tokens в этом расчёте — так устроен
исходный Tooltip. При обычной source-теме отступы равны 12px и 4px; native-only
панели сохраняют прежний отступ 8px.

Переменные появляются уже в SSR-разметке. Реактивные обновления меняют только
theme variables и сохраняют inline-позицию, DOM содержимого, редактор, фокус и
ожидающий Promise Popconfirm. Отключение source-темы удаляет эти переменные.
Существующие четыре placement, viewport limits, native top layer и ARIA-контракты
сохраняются. Полные source corner placements, zIndex context и motion ещё не
перенесены; наличие zIndexPopup не меняет порядок native top layer.

## CSS и совместимость

При source-настройках provider размещает рассчитанные глобальные CSS variables
в своём scope уже при SSR. Числа получают px, кроме исходных unitless tokens;
breakpoints и параметры motionBase/motionUnit не сериализуются в CSS.
Произвольный cssVar.prefix поддерживается через source variables и совместимые
aliases для опубликованного CSS с префиксом ant. Пользовательский style provider
записывается последним и сохраняет приоритет, не меняя значения useToken.

Дополнительные theme boundaries ColorPicker и Tour получают те же переменные,
включая перенос popup в другой DOM container. Нативные темы без source-настроек
сохраняют прежние цвета и CSS-переопределения. При `compact: true` fontSize/lineHeight/
fontHeight и controlHeight согласованы с compactAlgorithm. Button/Input/TextArea/
InputNumber получают рассчитанные font/padding metrics уже при SSR, без включения
source colors, hash-классов и scope-правил.

В compact режиме middle у Input, Select, InputNumber и Button имеет высоту 28px,
large — 35px. Для small Input, одиночный Select и InputNumber имеют минимум 22px: строка 20px
и две рамки по 1px. Button имеет фиксированную высоту 21px. Эти значения получены
в официальном React-компоненте 6.6.8; одинаковая высота всех small controls не
является исходным поведением. Явный `compact: false`, наследование provider,
пользовательские component styles и обычная тема сохраняются.

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
- [Эталон Avatar/Badge](../../src/lib/theme-display-tokens-reference.test.ts):
  все scoped declarations для 13 настроек официального UMD, включая нули,
  undefined, component algorithms, numeric units и custom CSS prefix.
  [Браузерные метрики и композиция](../../tests/browser/avatar-badge-theme.spec.ts),
  [SSR](../../tests/package/avatar-badge-theme.ssr.test.ts),
  маршрут `?fixture=avatar-badge-theme`. Проверяются также AvatarGroup/Popover,
  alias isolation, подгонка текста и сохранение native DOM/focus.
- [Эталон Tooltip/Popover/Popconfirm](../../src/lib/theme-overlay-tokens-reference.test.ts):
  все scoped declarations официального UMD для 19 настроек, включая wireframe,
  deprecated aliases, нули/undefined, component algorithms и custom CSS prefix.
  [Браузерная геометрия и lifecycle](../../tests/browser/overlay-theme.spec.ts),
  [SSR](../../tests/package/overlay-theme.ssr.test.ts),
  маршрут `?fixture=overlay-theme`. Проверяются исходные отступы/стрелки,
  порядок aliases, сохранение позиции/редактора/фокуса и ожидающего подтверждения.
- [Compact metrics](../../tests/browser/compact-theme.spec.ts),
  [SSR](../../tests/package/compact-theme.ssr.test.ts), маршрут `?fixture=compact-theme`.
  Эталон размеров, шрифтов и padding для 15 сочетаний темы/размера получен из
  [официального UMD](../../tests/browser/fixtures/ant-design-compact-metrics.json)
  после проверки SHA-256. Проверяются native/source пути, dark, пустой token,
  родительский source-контекст, обновления, вложенные provider и изоляция.
- [Эталон Select](../../src/lib/theme-select-tokens-reference.test.ts): полные CSS
  declarations официального UMD для 16 настроек, включая algorithms, нули/undefined,
  custom prefix, внутренние margins и unitless fields.
  [Браузерные размеры и поведение](../../tests/browser/select-theme.spec.ts),
  [SSR](../../tests/package/select-theme.ssr.test.ts), маршрут `?fixture=select-theme`.
  Проверяются single/multiple всех размеров, disabled, options, стрелка/clear,
  изоляция aliases и смена темы без потери редактора, выделения, фокуса и FormData.
- [Метрики AutoComplete](../../tests/browser/fixtures/ant-design-auto-complete-metrics.json)
  получены из закреплённого официального UMD: 17 настроек, три размера и variants,
  disabled, custom Input/textarea, groups/options и пустая выдача.
  [Браузерные проверки](../../tests/browser/auto-complete-theme.spec.ts),
  [SSR](../../tests/package/auto-complete-theme.ssr.test.ts),
  маршрут `?fixture=auto-complete-theme`. Проверяются изоляция Select/Input tokens,
  нули/undefined, custom prefix/hash, RTL, смена темы и размеров открытой панели
  без потери inline-позиции, DOM, ввода, выделения, фокуса или значений формы.
- [Эталон TreeSelect](../../src/lib/theme-tree-select-tokens-reference.test.ts):
  все scoped declarations для 17 настроек официального UMD; порядок aliases двух
  hooks, отдельные algorithms, нули/undefined и custom prefix.
  [Браузерные метрики](../../tests/browser/fixtures/ant-design-tree-select-metrics.json),
  [поведение](../../tests/browser/tree-select-theme.spec.ts),
  [SSR](../../tests/package/tree-select-theme.ssr.test.ts),
  маршрут `?fixture=tree-select-theme`. Проверяются single/multiple трёх размеров,
  disabled, tree rows/titles/switchers/indent, четыре состояния checkbox,
  сохранение DOM, поиска/выделения/фокуса, FormData и положения открытой панели.

- [Эталон Steps/Timeline](../../src/lib/theme-steps-tokens-reference.test.ts):
  scoped declarations и [computed metrics](../../tests/browser/fixtures/ant-design-steps-metrics.json)
  из официального UMD для 18 тем, включая совместные aliases и component algorithms.
  [Браузерные проверки](../../tests/browser/steps-theme.spec.ts),
  [SSR](../../tests/package/steps-theme.ssr.test.ts), маршрут `?fixture=steps-theme`.
  Проверяются варианты Steps, обе ориентации Timeline, приоритет styles, сохранение
  DOM/focus, нативных кнопок выбора и callbacks при обновлении темы.

- [Эталон Pagination](../../src/lib/theme-pagination-tokens-reference.test.ts),
  [computed metrics и состояния](../../tests/browser/fixtures/ant-design-pagination-metrics.json),
  [SSR](../../tests/package/pagination-theme.ssr.test.ts) и
  [браузерные проверки](../../tests/browser/pagination-theme.spec.ts),
  маршрут `?fixture=pagination-theme`. Проверяются также style priority,
  нативные кнопки, сохранение drafts/focus и callback order size changer.

- [Эталон Tabs](../../src/lib/theme-tabs-tokens-reference.test.ts),
  [computed metrics](../../tests/browser/fixtures/ant-design-tabs-theme-metrics.json),
  [SSR](../../tests/package/tabs-theme.ssr.test.ts) и
  [браузерные проверки](../../tests/browser/tabs-theme.spec.ts), маршрут `?fixture=tabs-theme`.

Лицензии: [Ant Design](../../src/lib/vendor/LICENSE.ant-design),
[cssinjs](../../src/lib/vendor/LICENSE.cssinjs),
[cssinjs-utils](../../src/lib/vendor/LICENSE.cssinjs-utils) и
[emotion/hash](../../src/lib/vendor/LICENSE.emotion-hash).
