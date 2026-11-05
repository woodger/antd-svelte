# Changelog

Все заметные изменения проекта документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
а версии проекта следуют [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Segmented: локальный prefixCls с CSS из закреплённого архива, независимыми
  defaults и сохранёнными CSS variables. Динамическая смена сохраняет radio,
  выбор/фокус/ref, отменяет старый thumb и очищает stylesheet при unmount.

- ConfigProvider.segmented: class/style и semantic slots с object/function callbacks,
  исходными приоритетами и заменой вложенных records. Сохранены native callback
  defaults, binding, radio/focus/ref и независимые scopes; добавлены Source/SSR/browser-проверки.

- Popover/Popconfirm: id/fallback, forceRender, fresh и локальный zIndex с передачей
  через AvatarGroup.max.popover. Скрытые title/content, slots/ID и кнопки следуют
  source cache; opaque Snippet captures сохраняют Svelte-реактивность.
  Force render прогревает portal и сохраняет SSR/hidden shell; ARIA IDREF ownership,
  draft/focus/selection, widget reset и ожидающий Promise проверены отдельно.
  Добавлены 52 UMD-сценария / 399 кадров и SSR/browser-проверки.

- Popover/Popconfirm: bind:ref с общим PopoverRef, текущими trigger/popup DOM
  и forceAlign на существующем контроллере позиции. Сохранены native div shell,
  SSR/unmount cleanup, popup/trigger replacement, portal, draft/focus/selection
  и ожидающий Promise; вызов не добавляет зависимости в пользовательский effect.
  Добавлены восемь UMD-сценариев lifecycle/manual alignment, coalesced calls
  и соответствующие проверки публичного пакета.

- Popover/Popconfirm: align/builtinPlacements/onPopupAlign с передачей через
  AvatarGroup.max.popover. Сохранены исходные offsets/points, overflow, htmlRegion,
  arrow/class selection и semantic priorities; native automatic tracking, DOM,
  draft/focus/selection и SSR cleanup. Добавлены 84 UMD-сценария; наблюдение
  о задержке выравнивания React после смены props записано для отдельного разбора.

- Popover/Popconfirm: независимые showAction/hideAction, focusDelay/blurDelay,
  touch fallback и source outside/popup focus actions; настройки проходят через
  AvatarGroup.max.popover. Popover.disabled сохраняет raw open и callbacks.
  Uncontrolled open переживает обновление props; сохранены native binding/focus,
  Promise guards и SSR cleanup. Добавлены 67 UMD-сценариев / 389 кадров и шесть
  cleanup traces с проверкой событий и кнопок подтверждения.

- Tooltip: независимые showAction/hideAction, пустые и реактивные наборы событий,
  focusDelay/blurDelay, исходный touch fallback и закрытие снаружи для новых actions.
  Настройки работают также в ellipsis Tooltip Typography; сохранены native defaults,
  controlled/bindable open и SSR cleanup. Добавлены 54 UMD-сценария / 310 кадров
  с проверкой callback timing, popup hover и отмены задержки после unmount.

- Tooltip: disabled с сохранением raw open и ожидающих событий, id с fallback/fresh
  cache, forceRender для скрытого содержимого и portal, явный zIndex с source style
  priority. Настройки передаются Slider и Typography; сохранены native shell/SSR,
  ARIA ownership, draft/focus/selection. Добавлены 19 UMD-сценариев, четыре consumer
  traces и SSR/browser-проверки; общий source zIndex context остаётся в работе.

- Tooltip: align/builtinPlacements и onPopupAlign с исходным приоритетом карт,
  offsets/targetOffset, overflow, htmlRegion, dynamicInset и autoArrow. Переданы
  Typography и single/range Slider; semantic styles сохраняют приоритет.
  ForceAlign объединяет вызовы в microtask по rc-trigger; сохранены native tracking,
  hidden shell/SSR, DOM, фокус и выделение. Добавлены 38 UMD-сценариев, числовые,
  SSR/browser-проверки и явные границы CSS-transform/scroll-container clipping.

- TooltipRef: bind:ref, текущие nativeElement/popupElement и forceAlign на общем
  контроллере позиции. Сохранены native shell/SSR, автоматическое отслеживание,
  cleanup, фокус и выделение; вызов не добавляет dependencies в пользовательский effect.
  Добавлены четыре UMD-сценария ref/lifecycle и browser-проверки с остановленными
  animation frames, заменой trigger и переносом popup в body.

- Tooltip: legacy overlay с исходным приоритетом title=0, boolean/array content
  и fresh cache содержимого, semantic class/style внутреннего container.
  Настройки передаются Typography и Slider; native eager SSR/hidden shell,
  whitespace policy, binding, ARIA и локальное состояние children сохранены.
  Добавлены 24 UMD-сценария и 80 кадров кэша; opaque Snippet captures остаются
  реактивными по правилам Svelte и описаны как граница полного React.memo.

- Collapse.Panel: compound children composition с прямым SSR, items precedence,
  context prefix/slots, nativeElement/ref и сбросом DOM при смене key. Общий renderer
  сохраняет native controls, hidden lifecycle, вложенные панели и focus recovery.
  Добавлены item HTML/events/headerClass, callback refs, 119 UMD-сценариев,
  traces capture/bubble/focus/refs, lifecycle и реальная hydration открытой панели.
  Границы implicit keys, native events и refs описаны отдельно.

- Collapse: числовые/индексные ключи, scalar/array content, legacy aliases,
  ConfigProvider.collapse, object/function semantic slots и item overrides,
  custom expandIcon Snippet, local prefixCls/rootClassName, refs и data/ARIA.
  Подключены десять component tokens/aliases/algorithm и 49 CSS rules; сохранены
  native heading/button, keyboard/focus, hidden lifecycle и независимость extra.
  Добавлены сверка с официальным UMD, callback traces и SSR/browser-проверки.

- Alert.ErrorBoundary: compound Svelte component, title/message/description/id,
  сохранение ошибки до remount и передача ошибок fallback к родительской границе.
  Здоровые children остаются без wrapper; SSR ошибки продолжают выбрасываться.
  Default description использует Error.stack вместо React componentStack.
  Добавлены 19 UMD-сценариев, source SSR/lifecycle/nesting evidence и проверки hydration.

- Alert: scalar/array content, legacy aliases, ConfigProvider.alert, object/function
  semantic slots, local prefixCls/rootClassName, refs и root/close data/ARIA.
  Подключены четыре component tokens/aliases/algorithm и 37 CSS rules. Source theme
  использует исходный fitted viewport пяти status icons; legacy viewport сохранён.
  Добавлены 110 UMD-сценариев, native SSR baseline, callback traces и SSR/browser-проверки.

- Result: четыре component tokens, aliases/algorithm, ConfigProvider.result,
  object/function semantic slots, local prefixCls/rootClassName, refs и data/ARIA.
  Перенесены scalar/array content и три static image components; сохранены native
  heading, decorative/inert icons, responsive/focus contracts. Все 20 CSS rules
  воспроизводятся инструментом; добавлены 81 официальный UMD-сценарий и SSR/browser-проверки.

- ConfigProvider.renderEmpty подключён к Select/TreeSelect, Cascader/Panel, Mentions,
  Transfer, Table и фильтру; List сохраняет своё подключение, AutoComplete — исключение.
  Перенесены source falsy/nullish presets и Transfer side arrays с сохранением native
  defaults без callback и локального нуля Select/TreeSelect. Select сохраняет popup при
  фокусе в кастомном содержимом. Добавлены 151 UMD-сценарий, interaction trace,
  свежий native baseline и SSR/browser-проверки.

- Empty: URL/scalar content, PRESENTED_IMAGE_DEFAULT/SIMPLE, ConfigProvider.empty,
  object/function semantic slots, local prefixCls, rootClassName, imageStyle и refs.
  Подключены Empty aliases/algorithm и исходные SVG colors с сохранением native режима,
  inert/ARIA, image=false, responsive/focus contracts. Добавлены все 15 CSS rules,
  57 официальных UMD-сценариев и SSR/browser-проверки.

- Основной Skeleton: ConfigProvider.skeleton, object/function semantic slots,
  local prefixCls, rootClassName, nativeElement/ref и вложенные class/prefix props.
  Сохранены native host, прежние class/style, status/focus, layout и normalization.
  Добавлена сверка с 34 официальными UMD-сценариями, SSR и lifecycle-проверки.

- Skeleton.Avatar/Button/Input/Image/Node и одинаковые named Svelte exports: исходные
  size context/shapes/block, object root/content semantic styles, local prefix и active.
  Общие восемь component tokens подключены также к основному Skeleton; его native
  host/status/focus/normalization сохранены. Добавлены 48 CSS rules, 116 UMD-сценариев,
  SSR/browser-проверки style priority, динамических обновлений и состояния Node snippet.

- Progress circle/dashboard: gap placement/degree, success segments, circular steps,
  conic gradients и Tooltip маленького круга по @rc-component/progress 1.0.3.
  Сохранены native bounds/ARIA/clipping и числовые SVG attributes; CSS-геометрия,
  status icons и rapid-update transitions сверяются с 81 UMD-сценарием и trace.
  Компонентные tokens и semantic styles применяются к новой SVG-разметке.

- Progress line: steps/rounding, gradients, success segment и percentPosition,
  formatter snippets и исходные aliases. Подключены ConfigProvider.progress, semantic slots,
  local prefixCls, nativeElement и шесть component tokens с aliases/algorithm.
  Сохранены native percent/dimensions/ARIA и clipping внешней текстовой подписи;
  статусные иконки используют исходную SVG-область. Добавлены 40 CSS rules,
  70 UMD-сценариев и baseline прежнего clipping. Circle/dashboard SVG остаётся отдельным этапом.

- Spin: fullscreen, percent/auto, ConfigProvider.spin, semantic slots, deprecated aliases,
  local prefixCls и static setDefaultIndicator. Подключены четыре component tokens,
  aliases/algorithm и SSR variables; сохранены native delay/inert/focus/ARIA и reduced motion.
  Извлечены 35 CSS rules, добавлены 52 официальных UMD-сценария и auto timeline,
  unit/SSR/browser-проверки состояния, scope isolation, refs и cleanup.

- Flex: custom Svelte component с generic props и необязательным nativeElement forwarding,
  локальный prefixCls и ConfigProvider.flex vertical/class/style. Подключены component
  aliases/algorithm без typography reset; сохранены children, native events, gap/style
  priorities, ref/focus/selection и custom state при updates. Добавлены 36 UMD-сценариев
  и CSS prefix template из 32 правил закреплённого архива.
- Divider: локальный prefixCls и ConfigProvider.divider с class/style и
  object/function semantic slots. Сохранены приоритет стилей, nativeElement,
  нормализованные callbacks и inline spacing; вложенный record заменяется целиком.
  Извлечён CSS prefix template из 33 правил; добавлены 28 официальных UMD-сценариев.
- Divider: textPaddingInline, orientationMargin и verticalMarginInline из
  ConfigProvider.theme.components.Divider, включая component aliases/algorithm,
  CSS-variable prefix и SSR. Сохранены native separator, размеры, default spacing
  и приоритет semantic/user styles; добавлена сверка с официальным UMD для 15 тем.
- Slider: локальный prefixCls для single/range и всех BEM-потомков; пустой prefix
  возвращает ant-slider. Подсказки получают исходный owner class независимо от
  собственного Tooltip prefix. Извлечены 54 CSS rules и добавлены 37 UMD-сценариев,
  SSR/browser-проверки prefix updates, portals, scope isolation и reduced motion.
  Native inputs/refs/FormData, фокус, palette presets и disabled Tooltip policy сохранены.
- Scalar Slider: marks/dots, step=null, included/track, общий с range semantic config,
  deprecated styles/vertical, handle ARIA/disabled arrays, autoFocus и числовой onChange
  перед bind update. Сохранены native numeric grid без marks, forms/reset, focus и
  completion/cancellation contracts. Добавлены UMD-эталоны для 31 сценария оформления и переходов,
  SSR/browser-проверки keyboard/pointer, RTL, вложенной config и live marks.
  Новые деления используют palette bridge range и без source-темы; plain native
  Slider сохраняет прежние цвета.
- Tooltip/Popconfirm: destroyOnHidden и legacy destroyTooltipOnHide с исходным
  приоритетом современного false, сбросом вложенного состояния и lazy SSR.
  Настройки работают в Typography ellipsis Tooltip и трёх режимах Slider;
  native shell/ARIA и default lifetime сохранены. Добавлены 44 UMD-сценария
  и SSR/browser-проверки, включая Popover, portals и ожидающий Promise Popconfirm.
- Typography Tooltip (ellipsis/copy/edit): trigger/delays из ConfigProvider.tooltip, локальный
  приоритет с 0/[], click/contextMenu и комбинации событий. Semantic callbacks видят
  разрешённые defaults; сохранены native измерения, lazy SSR, DOM и фокус.
  Добавлены 23 UMD-сценария и 21 event trace, включая raw open для неусечённого
  текста, controlled open, nested provider и ввод внутри popup.
- Tooltip/Popover/Popconfirm: локальный prefixCls, исходные popup/slot/color classes
  и openClassName trigger. Добавлены CSS templates из 58/72/11 правил и 123 UMD-сценария;
  поддержаны AvatarGroup, Slider и Typography Tooltip. Сохранены DOM/focus, native
  viewport limits и caller classes; Typography передаёт color и semantic styles
  общему popup. SSR не клонирует snippets, open class подключается после hydration.
- Tooltip/Popover/Popconfirm: preset и CSS color, исходные RGB contrast, inverse
  classes и приоритеты semantic/legacy styles. Цвет передаётся в AvatarGroup overflow
  и single/pinned/active range Slider. Извлечены 65 CSS rules; добавлены 129 UMD-сценариев,
  12 вложенных поверхностей и engine/SSR/browser-проверки. Native palette/DOM,
  черновики и фокус сохранены; private contrast изолирован между popup.
- ConfigProvider.tooltip/popover/popconfirm: defaults стрелки, trigger и задержек,
  class/style и semantic slots с callbacks, замена вложенным provider и исходная
  изоляция Tooltip от Popover/Popconfirm. Добавлены click/contextMenu у Tooltip,
  contextMenu у Popover, trigger/delays у Popconfirm и legacy semantic aliases.
  Сохранены native defaults без новой config, popup DOM, ввод и фокус; 60 UMD-сценариев
  и 18 event traces проверяют новые настройки, в том числе Slider и AvatarGroup.
- Tooltip/Popover/Popconfirm, AvatarGroup и Slider Tooltip: локальные
  arrow.pointAtCenter и object autoAdjustOverflow с исходными points, tokens,
  flip/shift и числовой семантикой adjustX/adjustY. Поддержаны активные и
  закреплённые range-подсказки; boolean defaults сохранены. Добавлены 84 UMD-эталона
  и unit/SSR/browser-проверки, включая сохранение DOM, draft, selection и focus.
- Tooltip/Popover/Popconfirm, AvatarGroup overflow и Slider Tooltip: все 12
  физических placement. Угловые варианты используют общий source useAlign,
  visibleFirst, dynamic inset rounding и flip cache до закрытия; прежние четыре
  native placement сохранены. Добавлены 99 UMD-эталонов, unit/SSR/browser-проверки
  и проверка сохранения ввода/выделения при смене placement.
- AvatarGroup: настройки текущего Svelte Popover в max.popover, custom title/content,
  controlled/default open, callback, container getters и native ARIA/classes/styles.
  Добавлены destroyOnHidden/legacy alias у Popover; Group удаляет содержимое по
  умолчанию и умеет сохранять его по запросу. SSR остаётся ленивым; 33 UMD-сценария
  фиксируют жизненный цикл. Повторное отклонённое открытие снова вызывает callback.
- AvatarGroup: deprecated maxCount/maxStyle/maxPopoverPlacement/maxPopoverTrigger
  с исходным truthy приоритетом max. Сохранены нормализация лимита, DOM, фокус и
  открытый список; добавлены 20 UMD-эталонов и SSR/browser-проверки.
- Avatar/AvatarGroup: локальный prefixCls, исходные root/string/group/popover classes
  и CSS template из 24 правил. Shared reset ограничен своим prefix; сохраняются
  соседние tokens, text fit, DOM/ref и открытый overflow. Добавлены 37 UMD-эталонов.
- Avatar: ConfigProvider.avatar class/style, rootClassName, native DOM attrs/events,
  onClick/onclick и bind:nativeElement; AvatarGroup получил rootClassName/div ref.
  Служебные поля items не попадают в DOM. Добавлены 31 UMD-эталон и SSR/browser-проверки.
- Tag/CheckableTag/CheckableTagGroup: локальный prefixCls с исходными classes,
  шаблоном из 90 CSS rules и SSR head. Смена prefix сохраняет DOM/focus и native
  themes; cleanup stylesheet не затрагивает соседей. Добавлены 60 UMD-эталонов.
- CheckableTagGroup: single/multiple, controlled/defaultValue, typed options,
  root/item semantics, ConfigProvider.tag и native div ref. Исходный gap извлечён
  из CSS; 34 UMD-эталона проверяют выбор, callbacks и обновления props.
- Tag: native href/target, DOM attrs/ref, closable и context closeIcon/closable.
  Перенесены исходные приоритеты, scalar/Snippet glyphs, ARIA, keyboard repeat
  и отмена навигации при закрытии. Link reset ограничен Tag; сохранены native
  close/focus и удаление содержимого. Добавлены 55 UMD-эталонов и SSR/browser-проверки.
- Tag styling: CSS colors с исходной HSL/alpha арифметикой, inverse/bordered
  aliases, semantic classes/styles и ConfigProvider.tag. Добавлены Tag tokens
  и исходный reactive style diff; CheckableTag наследует context class/style.
  Прежние snippets, native close/focus и controlled callbacks сохранены.
- CheckableTag: исходные click/keyboard callbacks, отмена и repeat Space,
  native aliases, DOM attrs и bind:nativeElement. Сохранены нативная кнопка,
  controlled checked, Enter и восстановление фокуса; добавлены 12 UMD-сценариев
  и SSR/browser-проверки.
- Badge prefixes: локальный prefixCls со своими styles и исходные
  scrollNumberPrefixCls classes для sup/custom count и разрядов.
  Сохранены глобальная CSS-связь ScrollNumber, active zoom/cache, DOM/ref/focus
  и caller state; стили живут вместе с Badge. Добавлены 31 UMD-вариант,
  шесть motion-последовательностей/30 кадров и SSR/browser-проверки cleanup.
- CSS extraction поддерживает portable ES-модули с default CSS string export.
  Preview all сохраняет CSS-вывод; hash/rule/keyframe checks и явный write сохранены.
  Добавлен проверенный Badge prefix template: 59 правил и шесть keyframes.
- Badge values: number/boolean/null text с исходными zero/presence правилами,
  строковые offset с parseFloat/CSS units и deprecated size="default".
  Сохранены numeric normalization, BadgeContext и прежний layout без нового API;
  raw offset использует DOM style setters, включая невалидные реактивные обновления.
  Добавлены 58 UMD-эталонов и unit/SSR/browser-проверки.
- Badge component config: ConfigProvider.badge, root/indicator semantic callbacks,
  CSS colors/gradients, исходные style priorities и inset border ScrollNumber.
  Добавлены rootClassName, native span attrs/events и bind:nativeElement;
  сохранены прежние native style/count/a11y contracts и состояние custom count.
  Добавлены 49 UMD-эталонов и unit/SSR/browser-проверки.
- Badge CSSMotion: исходные enter/leave, кеш count/dot/title, прерывание выхода,
  собственные end events и deadline, custom count и standalone/status branches.
  Перенесены четыре CSS-правила и четыре keyframes; сохранены SSR, фокус,
  немедленное обновление доступного описания и reduced motion. Добавлены
  17 UMD-последовательностей/87 кадров и SSR/browser-проверки cleanup.
- Badge SingleNumber: исходные пути прокрутки, reverse-position keys, abs-count
  направление, быстрые изменения, NaN/знаки и fallback 1000 ms с cleanup.
  Сохранены SSR, hydration, focus, reduced motion и мгновенный numeric offset;
  добавлены 18 UMD-последовательностей/68 кадров и engine/SSR/browser-проверки.
- Badge.count: строки, boolean/null и Snippet с атрибутами исходного custom root.
  Перенесены строковые overflow/zero правила, статические символьные slots,
  custom positioning/RTL, SSR и собственная интерактивность Snippet.
  Числовой BadgeContext и прежние native contracts сохранены; добавлены
  46 UMD-эталонов и unit/SSR/browser-проверки.
- BadgeRibbon для Badge.Ribbon 6.6.8: scalar/Snippet content, preset/CSS colors,
  логические placement/RTL, semantic callbacks, ConfigProvider.ribbon и native ref.
  Используются исходные Badge aliases/algorithm и 27 извлечённых CSS-правил;
  добавлены UMD-эталоны и SSR/browser-проверки состояния, фокуса и cleanup.
- Avatar.src принимает Svelte Snippet с исходным приоритетом и собственными
  атрибутами, событиями и состоянием. Поддержана интеграция с Image и preview,
  включая AvatarGroup overflow; перенесено исходное CSS-правило Image.
  Вложенный dialog сохраняет родительский popup и первым обрабатывает клавиатуру.
  Добавлены 14 UMD-эталонов и SSR/browser-проверки; прежние строковые изображения,
  icon/children, доступность и fallback сохранены.
- Адаптивный Avatar.size: семь source breakpoints, sparse/zero/undefined maps,
  исходный font-size, screen* tokens и приоритеты style/AvatarGroup/ConfigProvider.
  Сохранены SSR, DOM/focus, image fallback, text fit и overflow; добавлены
  20 UMD-эталонов с 274 наборами измерений, source subscription lifecycle и unit/SSR/browser checks.
- Контейнеры Modal/Drawer: getContainer с false, selector, DOM-узлом,
  DocumentFragment/ShadowRoot и ConfigProvider fallback с исходными аргументами.
  Сохранены native dialog, SSR, состояние при замене функции с тем же target,
  фокус, inert, scroll lock и lifecycle; смена target пересоздаёт содержимое.
  Добавлены 36 UMD-эталонов и SSR/browser-проверки. Source inline-геометрия Drawer
  остаётся в работе.
- Контейнеры Menu: локальный getter и ConfigProvider с исходным приоритетом
  own undefined, ShadowRoot, force render и скрытыми inline-копиями.
  Сохранены native refs, фокус/выделение, theme variables, hover и клавиатура
  вынесенных подменю; смена контейнера пересоздаёт popup contents, как upstream.
  Добавлены 32 UMD-эталона и SSR/browser-проверки; overflow More остаётся в работе.
- Контейнеры DatePicker/RangePicker и TimePicker/TimeRangePicker: local → global
  fallback, ShadowRoot, исходный root trigger и defaultOpen с учётом арности getter.
  Восстановлены source offset=4 px, округление координат вниз, min-width selector
  и default RTL placement;
  сохранены native refs, Dayjs/подтверждения и условный lifecycle панели.
  Добавлены 54 UMD-эталона и SSR/browser-проверки геометрии, state, focus и cleanup.
- Mentions: локальный getPopupContainer и popupRender со стандартным menu Snippet.
  Сохранены исходное отсутствие ConfigProvider fallback, prefix trigger и сброс
  custom state при закрытии/смене контейнера. Поддержаны ShadowRoot, изоляция
  FormItem/SpaceCompact, native refs, SSR и cleanup; добавлены 22 UMD-эталона
  и SSR/browser-проверки фокуса, выбора и живых обновлений.
- Контейнеры TreeSelect и Cascader: локальный getter, ConfigProvider fallback и
  ShadowRoot с исходным trigger, включая custom children Cascader. Native refs,
  поиск, lazy load, темы, клавиатура и SSR сохраняются; зазор до popup исправлен
  на исходные 4 px. CascaderPanel остаётся inline. Добавлены 40 UMD-эталонов
  и SSR/browser-проверки, controller width не перезаписывается variables предка.
- Контейнеры Select и AutoComplete: локальный getPopupContainer, наследование
  ConfigProvider и ShadowRoot, исходный DOM trigger и вызов только после открытия.
  Перенос сохраняет поиск, клавиатуру, фокус/выделение, FormData и Select tokens;
  default native размещение сохранено. Добавлены 32 UMD-эталона и SSR/browser-проверки.
  Внутренние DOM-ссылки AutoComplete сохраняются при обновлении spread props,
  публичные bind:nativeElement / bind:inputElement поддержаны.
  Повторное открытие Select не оставляет старых списков в исходной DOM-ветке.
- Контейнеры Tooltip/Popover/Popconfirm, Dropdown, Slider и Typography Tooltip:
  локальные и legacy getters, ConfigProvider fallback и исходный порядок Slider.
  Общий portal сохраняет DOM/state/focus при смене функции с тем же контейнером,
  собственные theme variables и native SSR/cleanup; добавлены 52 UMD-эталона
  и проверки SSR/browser. Default native размещение без getter сохранено.
- ConfigProvider.getPopupContainer: наследование для Tabs и ColorPicker с исходными
  приоритетами локальных props и undefined. Поддержан ShadowRoot в общем portal,
  сохранение состояния при смене функции с тем же контейнером, pointer/keyboard
  события и focus в shadow popup. Tour сохраняет собственный container API.
  Добавлены 30 UMD-эталонов и SSR/browser-проверки; остальные consumers ещё переносятся.
- Tabs More: arrow, align/alignPoint, placements/builtinPlacements и onPopupAlign
  с исходными offsets/regions/flip/shift, dynamic inset и приоритетом CSS. Общий
  числовой useAlign расширен с сохранением поведения Tour; native top layer,
  border-box measurement, state/focus и cleanup сохранены. Добавлены
  unit/SSR/browser-проверки и 51 UMD-эталон.
- Tabs More: raw overlay, autoDestroy после leave end, openClassName, исходная
  slide-анимация и transitionName/animation, раздельные showAction/hideAction и touch.
  Сохранены отдельные состояния OperationNode/Trigger при visible=undefined,
  lifecycle при reversal, native inert/SSR и cleanup portal. Добавлены 33 UMD-эталона
  и unit/SSR/browser-проверки.
- Tabs: renderTabBar со стандартной навигацией как Snippet, исходными props и
  overrides, per-tab children/attributes и Svelte attachments. Пользовательская
  шапка меняет только навигацию; панели, draft/state/focus и root ref сохраняются.
  Добавлены callback-ref стандартной панели, getTabsItemId для native ARIA-связей,
  35 UMD-эталонов и SSR/browser checks.
- Tabs: className/style отдельных панелей с исходным порядком semantic → item → motion.
  Добавлены восемь UMD-сценариев и SSR/browser-проверки изоляции заголовков,
  RTL, forceRender и обновлений без потери DOM/state/draft/selection/focus.
- Tabs: animated inkBar/tabPane, source switch и custom CSS motion с prepare,
  phase styles, end/deadline и visibility callbacks. Уходящие панели сохраняют
  DOM/state/FormData до leave end; reversal отменяет уничтожение, native focus,
  reduced motion и cleanup сохранены. Добавлены 33 UMD-эталона и unit/SSR/browser checks.
- Tabs: semantic classNames/styles, ConfigProvider.tabs, rootClassName и native
  attrs/events/bind:nativeElement. Сохранены исходные CSS-слои, callback props,
  icon/indicator precedence и замена config во вложенном provider. Добавлены
  23 UMD-эталона, unit/SSR/browser-проверки и живые обновления без потери DOM/фокуса.
- Theme Tabs: исходные defaults/aliases, card height → padding, component algorithms,
  CSS-variable prefix/hash и наследование More popup. Добавлены UMD conformance,
  SSR/browser-проверки 15 тем, 10 вариантов, LTR/RTL, zero/undefined и обновлений
  без потери DOM, drafts, focus и selection. Native-only темы сохраняются.
- Tabs: deprecated destroyInactiveTabPane у корня и items с приоритетом modern
  имени на том же уровне. Сохранены native item-before-root, forceRender,
  lazy lifecycle, local state, FormData и focus repair; добавлены 12 UMD-сценариев
  и SSR/browser-проверки, включая два документированных отличия приоритета.
- Tabs: indicator.size/align, deprecated indicatorSize и onTabScroll с исходными
  физическими направлениями. Добавлены 64 UMD-эталона индикатора и 8 сценариев
  прокрутки, unit/SSR/browser-проверки дробных размеров, RTL, приоритетов,
  сохранения DOM/фокуса/More и cleanup; native scroll сохраняется.
- Tabs: More с исходным visible range, listbox скрытых вкладок, trigger/icon/locale,
  popupRender, controlled visibility, portal и удалением через onEdit. Add сохраняет
  DOM-узел при переходе в operations; добавлены CSS-рецепт, 35 UMD-эталонов,
  unit/SSR/browser-проверки keyboard, RTL, focus, nested popup и lifecycle.
- Tabs: исходный size=medium и deprecated tabPosition с физическими сторонами,
  приоритетом tabPlacement и сохранением native mobile fallback. Добавлены
  unit/SSR/browser-проверки RTL, наследования размера и сохранения DOM/фокуса.
- Tabs: centered, tabBarGutter и tabBarStyle с исходными logical/vertical отступами,
  нулевыми и дробными значениями, отдельными header styles и CSS-рецептом.
  Добавлены 31 эталон официального UMD, SSR/browser-проверки live layout,
  прокрутки, индикатора, фокуса и сохранения панелей.
- Tabs: editable-card с onEdit, hideAdd, closable/closeIcon, add/remove icons
  и доступными именами действий. Delete/Backspace/middle mouse сохраняют исходные
  запросы и соседний фокус; items/selection меняет владелец. Добавлены native
  add/remove buttons, точные SVG, CSS-рецепт и UMD conformance, SSR/browser-проверки
  размеров, RTL, focus, callbacks, FormData и сохранения панелей.
- Theme Pagination: исходные defaults/aliases, quick-jumper Input tokens,
  отдельный Select scope, algorithms, CSS prefix/hash и wireframe из исходного
  bordered.ts. Добавлены UMD conformance, SSR и browser-проверки размеров,
  состояний, LTR/RTL и обновлений с сохранением native nav/buttons, drafts,
  фокуса, bind API и порядка callbacks.
- Theme Steps/Timeline: исходные defaults/aliases, component algorithms и
  совместный scope Steps → Timeline, CSS prefix/hash и приоритет пользовательских
  styles. Добавлены UMD conformance, SSR и browser-проверки метрик вариантов,
  RTL и смены темы с сохранением DOM, фокуса и нативного выбора шагов.
  Legacy токены, не используемые исходным CSS, сохраняют это поведение.
- Theme Breadcrumb: исходные defaults/aliases и component algorithms, CSS
  prefix/hash, отдельные цвета текста и стрелки меню, padding/margins overlay.
  Добавлены UMD conformance, SSR и browser-проверки LTR/RTL, custom icons,
  semantic styles, фокуса и навигации. Ссылки Dropdown используют автоматическую
  высоту и не наследуют высоту ссылок Breadcrumb через DOM предка.
- Theme Dropdown: исходные defaults/aliases, отдельный Menu scope для списка,
  source padding/box sizing, arrow offsets и gap, algorithms и CSS prefix/hash.
  Добавлены UMD conformance, SSR и browser-проверки метрик, hover, положений
  стрелки и смены темы без потери DOM, focus, native links или позиции popup.
  Native-only темы и существующий Svelte callback API сохранены.
- Theme Menu: исходные defaults, aliases и deprecated mapping, отдельные
  algorithms, CSS prefix и hash; размеры и light/dark оформление пунктов,
  inline-списков и popup. Добавлены UMD conformance, SSR и browser-проверки
  метрик, style priority, RTL, обновлений темы с сохранением DOM, фокуса,
  selected/open keys и позиции панели. Native-only темы сохранены.
- Theme Anchor: исходные component defaults и aliases для обычных/вложенных
  ссылок, source compact padding, отдельные algorithms, hash и CSS prefix.
  Оформление ссылок учитывает tokens обычного, hover/active и focus состояний.
  Добавлены UMD conformance, SSR и browser-проверки метрик, приоритета styles,
  RTL и обновлений темы с сохранением ссылок, focus, scroll/history и callbacks.
  Native-only темы и lifecycle indicator сохранены.
- Theme Cascader: исходные defaults и совместный Select/Cascader scope для поля
  и dropdown; standalone Panel получает только Cascader tokens. Добавлены UMD
  conformance, SSR и browser-проверки размеров/строк/checkbox, responsive tags
  и смены темы без потери DOM, поиска, выделения, focus и позиции popup.
  Сохранены native-only темы и приоритет semantic popup styles.
- Theme TreeSelect: исходные TreeSelect defaults и совместный Select/TreeSelect
  scope для поля и dropdown, размеры узлов, цвета/checkbox и порядок aliases.
  Добавлены UMD conformance, SSR и browser-проверки смены темы без потери дерева,
  поиска, выделения, focus, FormData и позиции панели. Native-only темы сохранены.
- Theme AutoComplete: общий Select token scope для поля, clear и popup,
  исходные метрики options/groups и отдельные tokens custom Input. Добавлены
  UMD, SSR и browser-проверки; смена темы сохраняет позицию popup, DOM,
  ввод, выделение, фокус и значения формы. Native-only темы сохранены.
- Theme Select: исходная подготовка tokens и aliases для selector/dropdown,
  размеров tags/options, arrow/clear и focus styles. Добавлены UMD conformance,
  SSR и browser-проверки нулей/undefined/algorithms/prefix и смены темы с
  сохранением DOM, поиска, выделения, фокуса, callbacks и формы. Native-only
  оформление и существующий Svelte API сохранены.
- Theme overlays: исходная подготовка Tooltip/Popover/Popconfirm tokens, arrow
  paths/offsets, wireframe padding, deprecated aliases и порядок вложенных style
  hooks. Source gap рассчитывается по глобальным tokens; native-only панели
  сохраняются. Добавлены UMD conformance, SSR и browser-проверки обновления темы
  с сохранением позиции, редактора, фокуса и ожидающего подтверждения.
- Theme display: исходная подготовка Avatar/AvatarGroup и Badge tokens, размеры,
  цвета, обводки, group spacing и Badge shadow. Сохранены native-only темы,
  numeric Avatar size и приоритет style; добавлены SSR, UMD conformance и
  browser-проверки. Popover scope сбрасывает Avatar aliases на значения provider,
  скрытые аватары сохраняют собственные tokens.
- Picker footer: общий Button в DatePicker/RangePicker и TimePicker/TimeRangePicker,
  как исходный PickerButton. Подтверждения получают button config, component tokens,
  Wave и scalar locale text с autoInsertSpace; native формы/disabled/focus и
  существующие Dayjs callbacks/precision сохраняются.
- Wave: source capture/RAF triggers, стандартный эффект для Button, Checkbox,
  Radio/RadioButton, Switch, интерактивного Tag и Steps; ConfigProvider.wave с
  disabled/showEffect/triggerType и полным GlobalToken. Сохранены source targets,
  colors/durations/deadline, native формы/фокус, SSR и cleanup. Добавлены Tag
  onClick/onclick и воспроизводимый CSS-рецепт wave из восьми исходных правил.
- Theme checkables: исходная подготовка Radio/Switch tokens и Checkbox aliases,
  группы и RadioButton, отдельные algorithms, unitless dimensions и SSR scopes.
  Явный undefined наследует CSS-переменную без возврата vendor defaults;
  native-only темы сохраняются.
- Theme controls: исходная подготовка Button/Input/TextArea/InputNumber tokens,
  SpaceAddon aliases, CSS roots в composed controls и изоляция вложенных aliases.
  Переменные и scope-правила доступны при SSR; native-only темы сохраняются.
- ConfigProvider: source token/algorithm inheritance, реактивный theme.useToken,
  полные component token types и overrides в GlobalToken, исходные hash/CSS-variable
  calculations и SSR scope. Применение всех ComponentToken к CSS продолжается.
- Theme: исходные seed/map/alias algorithms и статический getDesignToken,
  цепочки default/dark/compact, custom mappers и overrides. Полный эталон UMD
  сохранён для 25 настроек; подключение токенов к ConfigProvider продолжается.
- Switch: value/defaultValue, source click/change/arrow events, semantic config,
  refs и focus aliases. Native формы/reset/onclick сохранены; CSS-рецепт switch
  побайтно воспроизводит прежние 47 правил из Ant Design 6.6.8.
- Checkbox: children/context/skipGroup, rich options, semantic config, callbacks,
  refs и autoFocus. Children сохраняют исходные raw state и фильтрацию callbacks;
  прежние options/FormData/reset/indeterminate сохранены, Table selection изолирован.
- Radio: rich options, semantic config, исходные callbacks и click bubble lock,
  vertical alias, focus/blur refs и autoFocus. Сохранены native формы/reset/disabled;
  RadioGroup восстанавливает typed selection при отклонении function binding.
- InputNumber: stringMode с исходной mini-decimal арифметикой, spinner, variants,
  prefix/suffix и legacy addons, semantic config, refs, wheel/hold/Shift и callbacks.
  Сохранены native number/FormData/reset; различия числового режима и общих тем
  описаны в README и реестре. Добавлены CSS-рецепт и MIT mini-decimal.
- ColorPicker: исходная Color-модель, точность RGB/HSB/alpha, single/gradient,
  palette, editable gradient points, presets, semantic config/locale и native popup.
  Добавлены private slider hooks, InputNumber formatter/parser, CSS-рецепт и MIT
  upstream. Полные token/trigger/motion возможности остаются в реестре пробелов.
- Slider range: исходные multiple handles, marks/dots, push/cross, fixed disabled
  anchors, editable/minCount/maxCount, draggableTrack, callbacks, semantic config
  и refs. Сохранены прежние native single contracts; диапазон использует native
  input/form bridge и отдельный CSS-рецепт. Добавлены MIT rc-slider и проверки
  engine/public SSR/browser; неперенесённые scalar/Tooltip API описаны в README.
- Carousel: исходные геометрия/клоны, finite/infinite, rows, fade, native swipe,
  autoplay, lazy loading, responsive, callbacks, typed refs и custom renderers.
  Добавлены config/locale, темы/RTL, CSS-рецепт, MIT react-slick и unit/package
  SSR/browser проверки. Границы Svelte snippets и React instance описаны в README.
- Tour: controlled/default шаги, target/mask/gap, все 12 размещений и center,
  исходные flip/shift/arrow, keyboard/IME, custom panel/actions/indicators,
  semantic config/locale и живые theme portals. Добавлены CSS-рецепт, MIT-лицензии
  rc-tour/trigger/portal и unit/package SSR/browser проверки; границы zIndex/token
  engine и адаптация к native Modal/Drawer описаны в README.
- Typography/Text/Title/Paragraph/Link: исходные decorations, copyable с Clipboard API
  и document fallback, controlled editing, CSS/JS ellipsis, expand/collapse, semantic
  config, locale, native refs, темы/RTL и CSS-рецепт. Добавлены unit/package/browser
  проверки; адаптация opaque snippets и границы SSR описаны в README.
- Listy: группировка с исходными индексами, sticky headers, измеряемая виртуализация,
  scrollTo, native wheel/touch/selection drag и scrollbar. Добавлены ConfigProvider.listy/
  virtual, refs, CSS-рецепт, лицензии и unit/SSR/package/browser проверки; сохранены
  различия raw/virtual и native focus при перестановке строк.
- List/ListItem/ListItemMeta: исходная пагинация и server pages, responsive grid,
  Meta/actions/extra, semantic config, loading/empty, native refs и темы/RTL.
  Добавлен ConfigProvider.renderEmpty для List, CSS-рецепт и unit/SSR/package/browser
  проверки. Svelte children arrays и граница SSR для opaque snippets описаны отдельно.
- Pagination: simple/readOnly, quick jumper и подтверждение, align/responsive,
  source jump windows, itemRender/icons, locale aliases, semantic/config slots,
  custom size changer и deprecated adapter. Сохранены bind API, нормализация,
  сортировка размеров и доступный мобильный size changer. Общий engine используется
  с Transfer; добавлены CSS-рецепт и unit/SSR/package/browser проверки.
- Transfer: controlled targetKeys/selection, исходный порядок переноса, поиск,
  Shift/header selection, oneWay removal, independent simple/normal pagination,
  custom lists/footer/actions, semantic config/locale, темы/RTL и native checkbox.
  Добавлены CSS-рецепт, лицензия rc-pagination, unit/SSR/package/browser проверки
  и отдельная фикстура. React callbacks/snippets и границы API описаны в README.
- Cascader/CascaderPanel: single/multiple пути, checkbox conduction и стратегии,
  поиск/подсветка, custom fields, loadData с исходным lifecycle options, колонки,
  controlled/default состояния, native keyboard/refs, snippets, responsive tags,
  semantic config, темы/RTL и deprecated popup aliases. Добавлены CSS-рецепт,
  лицензия rc-cascader, unit/SSR/package/browser проверки и отдельная фикстура.
- TimeRangePicker переносит TimePicker.RangePicker: два поля, отдельные
  подтверждения и calendar draft, sorting/allowEmpty/disabled, dependent time
  restrictions, hover/scroll, pickerValue, mixed range/time config и snippets.
  Общий RangePickerCore сохраняет существующий календарный API; перенесены
  позиционирование узкой панели/стрелки и deferred focus с cleanup. Добавлены
  unit/SSR/package/browser-проверки, включая UTC, RTL и native form/refs.
- TimePicker: общий SinglePicker, time columns, строгие форматы, draft/confirm/
  controlled state, hover и scroll selection, ограничения, locale/config,
  semantic slots и snippets. Сохранены UTC/точность Dayjs и текущие DatePicker/
  RangePicker contracts; добавлены unit/SSR/package/browser-проверки.
  Multiple и mask format остаются в следующих этапах.
- Calendar: full/mini date/month panels, controlled value/mode и display state,
  исходные события/ограничения дат, header/cell snippets, week numbers,
  semantic config/locale, generic date adapter, native refs и доступный grid.
  Добавлены CSS-рецепт и unit/SSR/package/browser-проверки.
- RadioButton и кнопочный RadioGroup: children/options, optionType, size,
  outline/solid, block/vertical, Badge, темы и native refs. Существующие bind,
  reset/FormData и fieldset semantics сохранены. Добавлены CSS-рецепт и
  SSR/package/browser-проверки как основа для заголовка Calendar.
- QRCode переносит исходный encoder rc-qrcode/Nayuki, canvas/SVG, segmentation,
  ECC/boost, quiet zone, icon/CORS, статусы, locale и semantic/config API.
  Сохранены SSR, DPR, native attributes/ref, fallback и cleanup; добавлены
  лицензии, CSS-рецепт, 226 эталонных матриц и unit/SSR/package/browser-проверки.
- Splitter переносит размеры и ограничения панелей, mouse/touch drag, lazy preview,
  controlled callbacks, collapse с восстановлением, destroyOnHidden, motion,
  semantic config, темы, RTL и SSR. React Panel declarations заменены typed
  items/snippets. Добавлены CSS-рецепт и unit/SSR/package/browser-проверки.
- Masonry переносит измеряемую раскладку с responsive columns/gutters, fresh,
  keyed items, snippets, onLayoutChange и semantic/config API. Сохранены пустой
  SSR root, исходные CSS appear/leave и очистка observers/RAF; перестановка
  восстанавливает native focus/selection. Добавлены CSS-рецепт и проверки
  engine/SSR/DOM, публичного пакета и изолированного браузерного стенда.
- BorderBeam переносит CSS-декорацию рамки: несколько лучей с фазами, градиенты,
  размеры/outset, наследование radius, config и reduced motion. Явный target
  заменяет React child ref без новой обёртки; слои очищаются при смене контейнера.
  Добавлены CSS-рецепт, unit/SSR, package и изолированные browser-проверки.
- InputGroup переносит deprecated Input.Group через SpaceCompact с legacy size/
  compact классами, keyed items и bubbling events. FormItem status/disabled
  сохраняются без дублирования id/name/required на всех дочерних controls.
- InputOTP переносит Input.OTP: UTF-16 ячейки, formatter до ограничения длины,
  native paste/input, маску и разделители, focus/keyboard, otp config и callbacks
  полного кода. Сохранены source value/defaultValue и SSR semantics; CSS извлечён
  отдельным проверяемым рецептом.
- InputSearch переносит Input.Search из Ant Design 6.6.8: поиск по кнопке/Enter/
  очистке, loading/IME, semantic/config API и Compact. Пользовательские кнопки
  передаются через Svelte snippet с контекстом вместо React cloneElement.
- InputPassword переносит Input.Password из Ant Design 6.6.8: controlled/local
  visibility, click/hover/keyboard, сохранение focus/selection, очистку value
  attribute и ConfigProvider.inputPassword. Добавлены locale.global.show/hide,
  изолированная браузерная фикстура и проверки публичного пакета.

### Changed

- Описано ограничение доступности Splitter: свёрнутая панель с сохранённым DOM
  оставляет потомков в Tab-порядке, как Ant Design 6.6.8. Добавлена сверка с
  официальным UMD для обеих ориентаций, motion и destroyOnHidden; поведение не менялось.

- Завершён аудит согласованного v1 Tag/CheckableTag. В реестре отдельно описаны
  сохранённые native controls, DOM и Snippet boundaries; это не полный React DOM.
- Tabs: навигация выделена в приватный TabsNav по границе исходного TabNavList.
  Выбор и панели остаются в Tabs; native keyboard, overflow, размеры и focus
  recovery сохраняются.

- Исходники и тесты приведены к правилам длины строк и отдельных инструкций;
  публичные Props/config и ограничения API описаны в JSDoc исходных объявлений.
  Сохранены порядок вычислений, Svelte-разметка, имена и поведение компонентов.

- Объединены локальный и удалённый `develop` с сохранением обеих историй. Rate,
  Watermark, расширенный TextArea и наследование Watermark в Modal/Drawer перенесены
  в самостоятельный npm-пакет; примеры и браузерные проверки принадлежат homepage.
- Уточнён приоритет reduced-motion CSS TextArea при сборке npm-пакета, включая
  обычное, disabled и mouse-active состояния поля.
- Input расширен изменениями из `woodger/ant-design@cf3e20c`: prefix/suffix/addons,
  clear/count/IME, variants, semantic slots, ConfigProvider.input, native refs и
  focus/Enter. Сохранены string bind:value, onValueChange и нативные события.
- Служебные команды объединены в `npm run cli -- ...` на `icore`: `registry check`,
  `registry report`, `registry show` и `css`. Сохранены форматы вывода, код ошибки 1,
  проверка SHA-256 и явные флаги загрузки/записи. CLI остаётся dev-инструментом.
- Библиотека и сайт оформлены как самостоятельные Git-репозитории. Собственные
  документация, политики, инструменты переноса и upstream-кэш перенесены в библиотеку.
- Реестр schemaVersion 2 отделяет локальные пути от стабильных `integration:`
  контрактов. Потребитель проверяет свои подтверждения через npm-метаданные
  `antd-svelte/porting/registry.json`; исходники соседнего проекта не читаются.

- Библиотека выделена в `antd-svelte`, приложение с галереей, примерами
  и браузерными фикстурами — в `homepage`. Сайт использует публичный пакет
  `antd-svelte` через `file:../antd-svelte`. Тесты, проверки
  типов, реестр и CSS-инструменты приведены к новым путям. Библиотека собирается
  через `@sveltejs/package` в `dist` с декларациями типов; публикация отложена.
  Для табличных примеров экспортированы `getTableData` и `getPaginationState`;
  тип результата `createMessage` подготовлен к генерации деклараций.

### Fixed

- Реестр: зарегистрирован integration:result для существующей проверки
  потребителя; manifest больше не расходится с метаданными пакета по этому ключу.

- QRCode: alias tokens и algorithms подключены к общей теме; canvas/SVG используют
  global colorText с исходным fallback и приоритетом color. Background cover
  получает абсолютную alpha 0.96, включая полупрозрачный colorBgContainer.
  Добавлены Source/SSR/browser-проверки геометрии, цветов, scopes и реактивного redraw.

- Rate: подключены шесть компонентных токенов и исходная подготовка focus width.
  Добавлены сверка с Ant Design 6.6.8, SSR и browser для размеров, цветов,
  algorithms, scopes, стилей и сохранения оценки/фокуса. Для непримитивного
  starHoverScale сохранён native scale(1.1); потеря source CSS variable записана отдельно.

- Splitter: подключены три современных компонентных токена и deprecated
  resizeSpinnerSize. В token theme bar наследует настроенные aliases; native
  hover fallback сохранён. Добавлены сверка с Ant Design 6.6.8, SSR и browser
  для геометрии, provider scopes, приоритетов и обновления lazy preview во время drag.

- Segmented: убран лишний текстовый пробел между icon и label; пустая строка
  больше не добавляет пустой span с отступом, а числовой 0 сохраняется.
  Icon-only с пустой подписью использует title как native accessible label.

- Segmented: подключены все восемь компонентных токенов, включая trackPadding
  и цвета selected/hover/active. Сохранены native темы, radio selection/focus,
  semantic styles и отмена thumb при изменении размеров. Добавлена сверка
  CSS declarations, геометрии и состояний с Ant Design 6.6.8, SSR и browser.

- Statistic: titleFontSize/contentFontSize применяются через общую компонентную
  тему также в Timer и Countdown. Сохранены native compact, semantic/value styles,
  вложенные providers, snippets и интервалы при смене токенов. Добавлена сверка
  CSS declarations и оформления с Ant Design 6.6.8, SSR и browser.

- Descriptions: все десять компонентных токенов подключены к общей теме.
  Сохранены bordered/size priorities, responsive column/span, semantic/item styles
  и фокус при реактивном обновлении. Добавлена сверка с Ant Design 6.6.8 для
  horizontal/vertical, размеров, RTL, algorithms, вложенных providers и SSR.

- Carousel: компонентные токены теперь применяются к wrapper через общую тему.
  Сохранены семь современных токенов, deprecated dotWidthActive и его приоритеты,
  вертикальная геометрия, RTL, nested/reset providers и style внутреннего slider.
  Добавлена сверка CSS declarations и геометрии с Ant Design 6.6.8, SSR и browser.

- Card: подключены все 13 компонентных токенов к CSS корня. Body/header padding,
  header height/background и actions background теперь учитывают
  ConfigProvider.theme.components.Card; aliases, component algorithms,
  nested scopes и реактивные обновления сверяются с UMD 6.6.8.
  Сохранены semantic/user style priorities, Grid/Meta, loading, вкладки и фокус.

- Menu: восстановлен scoped link reset в стандартной теме и cssVar, включая
  inline/popup-подменю. Сохранены пользовательские decoration tokens, inline styles,
  цвета пунктов, href, выбор и клавиатура; добавлены CSS-рецепт и 39 UMD-сценариев.

- Проверка геометрии Typography сравнивает actions с изолированным DOM/CSS-снимком
  Ant Design 6.6.8. Разница метрик текста Chromium и Headless Shell больше не даёт
  ложного падения; точность и точные границы двухстрочного текста сохранены.

- Pagination: цвета active/hover/disabled теперь применяются к нативным кнопкам
  также без cssVar. Сохранены цвета пользовательских CSS-переменных и inline
  itemRender, размеры, binding, клавиатура и callbacks.

- Anchor/Breadcrumb: восстановлен scoped reset ссылок в стандартной теме без
  cssVar. Normal/hover/active/focus используют исходные link decoration tokens;
  inline overrides, focus outline, навигация и внешние links сохранены. Добавлена
  сверка с Ant Design 6.6.8 для обоих режимов темы, items/legacy и custom links.

- Slider: theme.components.Slider теперь применяет все 18 исходных токенов в single
  и range, горизонтально и вертикально. RailSize меняет толщину шкалы; focus native
  input оформляет видимый handle. Сохранены native-only темы, hit targets и приоритет
  пользовательских стилей. Добавлены UMD-эталоны 14 тем и проверки SSR, обновлений,
  изоляции provider, снятия темы, клавиатуры и cleanup.
- Tooltip/Popover/Typography: trigger=[] без component config больше не закрывает
  программно открытую панель на hover leave/blur. Прежние native defaults,
  геометрия, Escape/outside и callbacks сохранены. Добавлены 10 UMD-последовательностей
  и браузерные регрессии, в том числе для Popconfirm и AvatarGroup.
- Mentions: getPopupContainer с параметром ждёт DOM-префикс, как rc-trigger;
  предварительный undefined остаётся только для функций нулевой арности.
  Добавлены UMD-регрессии обычного и пользовательского popup.
- Dropdown: уход указателя не закрывает внешне открытое меню, если trigger
  не содержит hover; click и ручное управление сохраняют выбранный режим событий.
- Menu: theme подменю применяется только к его popup; вложенный default снова
  использует тему корневого Menu. CSS @scope ограничивает light/dark правила
  внутри native popover с сохранением DOM, клавиатуры и фокуса; базовые стили
  остаются fallback для браузеров без @scope.
- Cascader: поиск при уже выбранном пути сохраняет высоту поля и видимый цвет
  текста; повторный ввод не меняет выбранное значение.
- AutoComplete: onOpenChange сообщает открытие/закрытие локального popup и запросы
  при controlled open=false; сравнение выполняется с состоянием до обновления.
- Anchor: исправлена нормализация CSS scope переменных отступов в рецепте.
  Восстановлены горизонтальные/вертикальные и вложенные отступы; первый
  горизонтальный пункт сохраняет нулевой padding-inline, RTL и индикатор работают.
- Breadcrumb: обёртка Dropdown сохраняет базовую линию соседних пунктов без
  изменения шрифтов. Проверены links/native buttons/itemRender, перенос, RTL и
  native/source темы; возврат фокуса custom itemRender не добавляет остановку Tab,
  выравнивание самостоятельного Dropdown сохранено.
- CalendarHeader: мини-календарь 300/360px вмещает оба Select и переключатель
  режима на desktop; на mobile год и месяц находятся рядом, переключатель ниже.
  Исправлены только локальные обёртки шапки, сохранены Select/RadioGroup,
  клавиатура, dropdown, full/mini, month/year, темы и RTL.
- Native compact: согласованы fontSize/lineHeight/fontHeight и controlHeight с
  compactAlgorithm, применены font/padding metrics Button/Input/TextArea/InputNumber
  без включения source colors. Middle controls имеют 28px, large — 35px; small
  Input/Select/InputNumber сохраняют исходный минимум 22px, Button — 21px.
  Native цвета, вложенные provider, overrides, SSR и focus сохраняются.
- TimePicker в RTL сохраняет исходный порядок колонок времени и RTL-направление
  внутри колонок через marker PickerPanel.
- TreeSelect не выбирает удалённый активный узел по Enter и очищает устаревшую
  ARIA-связь после обновления данных. Controlled search восстанавливает ввод из
  searchValue при отказе владельца; удаление тегов отсутствующих узлов сохраняется.
- Стрелки Steps navigation наследуют disabled color активной light/dark темы;
  прямое переопределение CSS-переменной сохраняется.

- Compact spacing использует закреплённую size map Ant Design для padding,
  margin и content aliases; вложенный compact=false восстанавливает обычные
  интервалы, inline overrides сохраняются.
- Пример Layout автоматически скрывает боковую панель ниже md, сохраняя внешний
  переключатель доступным в узком viewport.
- StatisticTimer сохраняет различие upstream между default=0 при форматировании
  отсутствующего value и исходной отсутствующей целью в callbacks.
- Divider сохраняет стандартные отступы без явного size/componentSize и наследует
  явно заданный размер через вложенные ConfigProvider. Уточнён приоритет preset
  и custom gap в документации Flex; счётчик галереи обновлён до 39 компонентов.
- Production-страницы подключают локальный SVG favicon; браузер больше не
  запрашивает отсутствующий /favicon.ico при открытии галереи.

### Added

- ImagePreviewGroup: registration/items, controlled current/open, source callbacks,
  prev/next/keyboard, counter и общий preview. Сохранены порядок изображений и
  source transform lifecycle; добавлены unit/SSR/browser, галерея и фикстура.

- Image: native thumbnail/fallback/placeholder и управляемый preview, source
  zoom/rotate/flip/wheel/drag/touch, mask/focus/scroll и Snippet render hooks.
  Добавлены CSS-рецепт, official icons, RU/EN labels, галерея, фикстура и
  unit/SSR/browser. Расширенный semantic/config API и motion отмечены отдельно.

- Mentions: prefix/split, поиск и исходная вставка у каретки, rich options/loading,
  callbacks, getMentions, autoSize/resize, native popup, формы и темы. Добавлены
  CSS-рецепт, галерея, фикстура и unit/SSR/browser. Общий popup допускает source
  gap для текстовых подсказок, сохраняя прежние defaults остальных компонентов.

- AutoComplete: свободный ввод и options/groups, controlled/default value/open,
  исходные change/search/select, keyboard/backfill, custom input/textarea Snippet
  и native popup. Добавлены галерея, фикстура, unit/SSR/browser и реестр;
  публичные режимы Select сохранены.

- Menu: items/группы/разделители/подменю, controlled/default selected/open keys,
  single/multiple и исходные callbacks, horizontal/vertical/inline, native links,
  клавиатура, Sider collapse, темы/RTL/Compact и native popup. Добавлены
  CSS-рецепт, галерея, фикстура и unit/SSR/browser-проверки; horizontal overflow,
  исходные motion и расширенные API отмечены как следующий объём.

- TreeSelect: single/multiple и labelInValue, исходные check strategies/conduction,
  поиск с сохранением предков, loadData/expanded/loaded keys и native popup.
  Добавлены Form/raw values, темы/RTL/Compact, галерея, фикстура и unit/SSR/browser
  проверки; расширенные API и виртуализация отмечены отдельно в реестре.

- Tree: treeData, controlled/default раскрытие и выбор, checkable/checkStrictly
  с исходной conduction, async loadData/loadedKeys, retry, клавиатура и ARIA.
  Добавлены showLine/icons/title snippets, темы/RTL/Form disabled, галерея,
  изолированная фикстура и unit/SSR/browser-проверки.

- Upload/UploadDragger: controlled/default списки, beforeUpload/LIST_IGNORE,
  ручной сценарий, XHR multipart и customRequest, drop/accept, статусы, preview
  и удаление с veto/abort. Перенесены исходные CSS/icons/thumbnail, добавлены
  галерея, изолированная фикстура и unit/SSR/browser-проверки.

- RangePicker date/datetime с парой Dayjs, связанными календарями, исходной
  машиной подтверждения и переходов фокуса, ограничениями/from, allowEmpty,
  presets/hover и Form. Добавлены галерея, отдельная фикстура и проверки
  unit/SSR/Chromium, включая UTC в разных browser zones.

- DatePicker single/date+showTime с Dayjs|null: строгий ввод, календарь, время,
  подтверждение, ограничения, callbacks и локали. Перенесены date adapter и
  исходное выравнивание time steps; добавлены Day.js peer, CSS-рецепт, галерея
  и проверки SSR/клавиатуры/UTC в разных browser zones. Расширенный
  API остаётся отдельным этапом.

- Select: controlled remote search, filter bypass/predicate, loading/empty/error
  content и popup scroll callback. Выбранные label/disabled сохраняются при смене
  выдачи. Добавлены пример с debounce/abort/stale guards/pages/retry, отдельная
  фикстура и unit/SSR/Chromium-проверки.

- TextArea: native multiline input, bindings, constraints, selection ref, IME-aware
  Enter, FormItem/status/RTL и размеры. Добавлены изолированная фикстура, галерея,
  SSR/browser-проверки; зафиксирована очередь проектных приоритетов переноса.

- FloatButton/Group/BackTop: native actions, Badge/Tooltip, click/hover/controlled
  меню, physical placements, scroll targets и progress. Добавлены CSS-рецепт,
  unit/SSR/Chromium, изолированная фикстура и пример галереи. Semantic callbacks
  Button допускают undefined result, как upstream.

- Button/Group: color/variant/ghost, href, semantic slots, icon placement, delayed
  loading/custom icon, native refs и button config. Сохранены формы, Compact и
  native disabled loading; добавлены unit/SSR/Chromium, отдельная фикстура и галерея.

- Timeline: items, mode/placement, pending/loading/reverse, colors, titleSpan,
  horizontal и semantic styles поверх общих Steps. Сохранены passive ol/li,
  SSR, native content и keyed focus; добавлены CSS-рецепт, проверки и галерея.

- Steps: dot/inline/navigation/panel, outlined, initial/maxCount/percent/ellipsis,
  semantic slots, item callbacks, iconRender и legacy aliases. Базовый API,
  нативные кнопки и фокус сохранены. Tooltip поддерживает Snippet title для
  rich inline content; CSS Steps полностью воспроизводится рецептом.

- Anchor/AnchorLink: вложенные items, horizontal, Affix, scroll tracking, offsets,
  highlight mapping, push/replace history и отменяемая cubic-анимация. Добавлены
  semantic styles, CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.

- Affix: top/bottom, window/custom target, onChange, updatePosition/cancel,
  ResizeObserver и cleanup. Сохранены SSR, нативный контент и геометрия upstream;
  добавлены CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.

- Space/Compact/Addon: keyed items со Snippet, orientation/align/wrap, gaps,
  separator/split, компактные стыки и размеры controls, вложенность, addon
  variants/status и изоляция Popup-контекста. Добавлены CSS-рецепты и проверки
  DOM/фокуса, RTL и production-галереи.
- Breadcrumb: items/legacy routes, path/params, разделители, Snippet itemRender,
  semantic styles, темы/RTL и меню. Dropdown получил нативные href/target/rel
  items с Enter/Space, disabled и отменой навигации. Добавлены CSS-рецепт и проверки.
- Card/Grid/Meta: слоты, варианты оформления, загрузка с сохранением фокуса,
  автоопределение Grid, вкладки и semantic styles. Tabs получил left/right extra
  content и числовые labels. Добавлены CSS-рецепт, unit/SSR/Chromium и галерея.
- Descriptions: items/Snippet, responsive column/span/filled, таблицы обоих
  направлений, bordered, semantic styles с исходным приоритетом, темы и RTL.
  Добавлены CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.
- Layout/Header/Content/Footer/Sider: нативные секции, вложенные контексты,
  hasSider/SSR CSS fallback, collapsed/zero-width, accessible trigger и responsive
  callbacks с cleanup. Добавлены темы/locale, CSS-рецепт, unit/SSR/Chromium и галерея.
- Grid Row/Col: 24 колонки, responsive props xs–xxxl, CSS/числовые gutter,
  align/justify, flex и вложенные контексты. Добавлены createBreakpoint с cleanup,
  воспроизводимый CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.
- Segmented: типизированные options/value, defaultValue/onChange, native radio,
  клавиатура, размеры, block/round, semantic slots, темы и RTL. Добавлены thumb
  через Web Animations API с отменой/resize/reduced motion и option.tooltip через
  существующий Tooltip, включая disabled options и block/scale-геометрию.
  Добавлены CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.
- StatisticTimer и совместимый StatisticCountdown: countup/countdown, формат
  длительности, onChange/onFinish, стабильный SSR-placeholder, cleanup и защита
  от поздних callbacks. Добавлены unit/SSR/Chromium, отдельная фикстура и запуск
  отсчёта в галерее; реестр отмечает покрытый основной объём семейства Statistic.
- Statistic: строковое форматирование чисел с precision без округления,
  разделителями и formatter, title/prefix/suffix snippets, valueRender,
  semantic slots и loading через Skeleton. Добавлены CSS-рецепт, unit/SSR/Chromium,
  изолированная фикстура и пример галереи; Timer/Countdown пока не перенесены.
- Flex: направления, align/justify, wrap, preset/числовой/CSS gap и flex shorthand
  с прямыми детьми без обёрток. Добавлены нативный component/bind:nativeElement,
  CSS-рецепт, SSR/Chromium-проверки, изолированная фикстура и галерея.
- Divider: horizontal/vertical, подпись string/number/Snippet, titlePlacement,
  RTL, размеры, plain, dashed/dotted и совместимые aliases. Добавлены semantic
  slots, bind:nativeElement, воспроизводимый CSS-рецепт, SSR/Chromium-проверки,
  изолированная фикстура и пример галереи.
- Инструменты переноса Ant Design: версионируемый реестр 73 семейств со сводкой
  покрытия, проверкой ссылок/экспортов и пилотными аудитами Avatar/Select/DatePicker;
  извлечение Avatar/AvatarGroup/Badge CSS из закреплённого npm-архива с проверкой
  SHA-256 и явным preview/check/write. Добавлены 37 изолированных маршрутов фикстур
  с сохранением общей страницы и unit/Chromium-проверки инструментов и изоляции.
- AvatarGroup: типизированные items с ключами, общие size/shape, перекрытие,
  max.count и нативная кнопка +N с ленивым списком в Popover. Добавлены локаль,
  темы/compact/RTL, восстановление фокуса, unit/SSR/Chromium-проверки и галерея
  добавления/удаления/перестановки участников. Avatar сохраняет ошибку изображения
  при перестановке с тем же src/srcSet; Popover игнорирует blur после destroy.
- Avatar: изображения с src/srcSet, icon/children fallback, onError, circle/square,
  размеры из контекста или числовой size, gap и автоматическая подгонка текста.
  Добавлены стили Ant Design 6.6.8, устойчивое доступное имя, темы/compact/RTL,
  cleanup ResizeObserver/listeners, unit/SSR/Chromium-проверки и галерея участников
  с Badge, выбором изображения/инициалов и сохранением профиля в Drawer.
- Badge: числовой count, overflow/showZero/dot, пять статусов, 13 preset цветов,
  string/Snippet text, medium/small, offset и полное доступное значение.
  Добавлены стили Ant Design 6.6.8, локаль, темы/compact/RTL/reduced motion,
  unit/SSR/Chromium-проверки и галерея уведомлений с Drawer. Количество вычисляется
  из сообщений; чтение сохраняет записи, фокус и исходную кнопку открытия.
- Tag и CheckableTag: preset/status цвета, filled/outlined/solid, snippets,
  отменяемый onClose, disabled, нативные кнопки и восстановление фокуса.
  Добавлены стили Ant Design 6.6.8, темы/compact/RTL/reduced motion, SSR и
  Chromium-проверки. Галерея показывает защищённые метки, добавление/удаление/
  повторное создание и фильтрацию отдельной Table через управляемый checked.
- Steps: управляемый current/onChange, стабильные items, четыре статуса,
  title/subTitle/content/icon snippets, horizontal/vertical и medium/small.
  Добавлены стили Ant Design 6.6.8, локаль, темы/compact/RTL/reduced motion,
  responsive, нативная клавиатура и восстановление фокуса. Галерея показывает
  Form → проверка → отправка → Result с сохранением полей, retry и отменой
  pending work при reset/unmount; добавлены unit/SSR/Chromium-проверки.
- Result: семь статусов, официальные иконки и иллюстрации 403/404/500,
  string/Snippet title/subTitle, extra/children и семантический заголовок.
  Добавлены стили Ant Design 6.6.8, темы/compact/RTL, восстановление фокуса
  общим механизмом с Empty, SSR и Chromium-проверки. Галерея показывает
  Form → success/error → редактирование/retry без потери данных и отменяет
  позднее завершение при reset/unmount; маршруты и HTTP-статусы не изменены.
- Empty: default/simple SVG, image/description snippets, скрытые части,
  действия и восстановление фокуса при удалении. Добавлены стили Ant Design
  6.6.8, локаль, темы/compact/RTL, SSR и галерея создания первой записи,
  пустого поиска и сброса фильтра. Table использует simple Empty с сохранением
  colspan, переводов, приоритета empty snippet и loading; добавлены SSR/Chromium-проверки.
- Skeleton: loading/active/round, конфигурации avatar/title/paragraph,
  ширины и число строк, замена children, доступный статус и парковка фокуса.
  Добавлены стили Ant Design 6.6.8, темы/compact/RTL/reduced motion, SSR,
  галерея первой загрузки с обновлением через Spin и сохранением черновика,
  ошибки/retry, отмена/сброс и unit/SSR/Chromium-проверки.
- Spin: standalone и сохранённые children, spinning/delay, три размера,
  description/indicator snippets, немедленная блокировка через inert/aria-busy
  и восстановление фокуса. Добавлены стили Ant Design 6.6.8, локаль, темы/RTL/
  reduced motion, интеграция с Table, галерея с отменой/ошибкой/retry
  и unit/SSR/Chromium-проверки.
- Progress: line/circle, нормализация percent, явные/автоматические статусы,
  размеры, цвета, подпись/format, доступные значения и локаль. Добавлены стили
  Ant Design 6.6.8, SVG-дуга, темы/RTL/reduced motion, галерея и unit/SSR/Chromium.
  Пример экспорта Notification показывает этапы выполнения и отмену с повтором;
  отдельная модель отменяет таймеры и защищает от поздних результатов.
- Notification: createNotification и NotificationHolder, четыре статуса,
  title/description/actions snippets, шесть положений, ключи и обновления,
  duration/hover/focus-паузы, maxCount и закрытие. Добавлены доступная клавиатура,
  восстановление фокуса, SSR, ConfigProvider, Modal/Drawer, темы/RTL/reduced
  motion, пример экспорта с CSV/retry и unit/SSR/Chromium-проверки.
  Message и Notification используют общее внутреннее ядро очереди и DOM-видимости.
- Message: createMessage и MessageHolder, пять типов, строки/snippets,
  ключи и обновления, duration/hover-пауза/maxCount, destroy и callable/thenable
  handles. Добавлены изоляция SSR и контекст ConfigProvider, нативный popover
  внутри Modal/Drawer, темы/RTL/reduced motion, пример loading → success/error
  и unit/SSR/Chromium-проверки.
- Alert: success/info/warning/error, title/description/icon/action snippets,
  outlined/filled, banner, closable с callbacks, анимацией и reduced motion.
  Добавлены filled-иконки Ant Design с MIT-лицензией, доступные объявления,
  перенос фокуса, темы/RTL, мобильные действия, пример и SSR/Chromium-проверки.
  Ошибка загрузки удалённой Table использует Alert с прежним retry и query.
- Drawer: модальная панель на нативном dialog, bind:open, callbacks, четыре
  стороны и размеры, title/extra/footer snippets, анимация и reduced motion.
  Добавлены ленивое содержимое, сохранение state, forceRender/destroyOnHidden,
  клавиатура и возврат фокуса, стили Ant Design 6.6.8, темы/RTL, работа с Modal,
  редактор строки Table через Form/Tabs/Collapse и unit/SSR/Chromium-проверки.
- Collapse: типизированные items/snippets, extra, bind:activeKey, defaults и
  callbacks, независимые панели и accordion, header/icon/disabled и размеры.
  Добавлены ленивые панели с сохранением state, forceRender/destroyOnHidden,
  нативные заголовки с клавиатурой и восстановлением фокуса, стили Ant Design
  6.6.8, темы/RTL, вложенность, Modal, пример анкеты и unit/SSR/Chromium-проверки.
- Tabs: типизированные items/snippets, bind:activeKey, defaults и callbacks,
  ручная клавиатурная активация, line/card, четыре положения и размеры.
  Добавлены ленивые панели с сохранением state, forceRender/destroyOnHidden,
  восстановление фокуса, стили Ant Design 6.6.8, темы/RTL, прокрутка, Modal,
  пример профиля и unit/SSR/Chromium-проверки.
- Dropdown: типизированное плоское menu.items с иконками, disabled/danger и
  разделителями, bind:open, click/hover, клавиатура/typeahead, Tab/Escape и
  возврат фокуса. Добавлены стили Ant Design 6.6.8, шесть положений, переворот,
  темы/RTL, Modal, пример действий строки Table и unit/SSR/Chromium-проверки.
- Popconfirm: title/description/icon snippets, подтверждение и отмена,
  bind:open, disabled, настройки кнопок, Promise/loading, ошибки и повтор,
  защита от повторного запуска и поздних результатов. Добавлены стили Ant Design
  6.6.8, локализация, темы/RTL, Modal/Tooltip, пример удаления строки Table
  и unit/SSR/Chromium-проверки.
- Popover: строки и Svelte snippets, bind:open, defaults, click/hover/focus,
  интерактивные поля и кнопки, естественный порядок Tab, Escape и возврат фокуса.
  Добавлены стили Ant Design 6.6.8, четыре положения, переворот у края окна,
  совместная работа с Tooltip и Modal, темы/RTL, редактор профиля в галерее
  и SSR/Chromium-проверки.
- Tooltip: текст и числовой ноль, bind:open, defaults, hover/focus, задержки,
  Escape, четыре положения, стрелка, автоматический переворот, aria-describedby
  и нативный popover внутри Modal. Добавлены подсказки Slider с форматированием,
  стили Ant Design 6.6.8, темы/RTL, галерея и unit/SSR/Chromium-проверки.
- Slider с одним бегунком: bind:value, min/max/step, мышь и касание,
  клавиатура, onChangeComplete, ориентация, reverse/RTL, disabled, FormItem,
  FormData и reset. Добавлены стили Ant Design 6.6.8, темы, отмена активных
  действий, пример с InputNumber и unit/SSR/Chromium-проверки.
- InputNumber: bind:value с number/null, defaultValue, числовой черновик,
  min/max, дробный step, precision, кнопки и клавиатура, disabled/readonly,
  FormItem, FormData и reset. Добавлены стили Ant Design 6.6.8, темы, RTL,
  локаль, пример расчёта стоимости и unit/SSR/Chromium-проверки.
- Switch: bind:checked, defaults, loading, disabled, два размера, snippets
  состояний, клавиатура, FormData и FormItem. Добавлены стили Ant Design 6.6.8,
  темы/RTL/reduced motion, пример асинхронного сохранения с откатом ошибки,
  защитой от повторных запросов и поздних ответов, unit/SSR/Chromium-проверки.
- Radio и RadioGroup: типизированный одиночный выбор, нативные стрелки/Space,
  синхронизация соседних Radio, независимые имена групп, required и отменяемый
  reset. Добавлены официальные стили Ant Design 6.6.8, интеграция с FormItem, ориентация,
  темы, RTL, примеры с 0/false и unit/SSR/Chromium-проверки.
- CheckboxGroup: типизированные строковые, числовые и boolean-массивы,
  options, disabled, нативные checkbox и FormData, отменяемый reset и интеграция
  с FormItem. Галерея прав использует группу с проверкой количества и выбором всех;
  добавлены unit/SSR/Chromium-проверки, включая RTL и мобильный экран.
- Множественный Select: mode="multiple", типизированные массивы, поиск,
  удаление элементов, клавиатура, repeated FormData, native reset, required,
  темы и RTL. Form поддерживает плоские массивы, ограничения количества и
  независимые копии defaults/snapshots; добавлены примеры и unit/SSR/Chromium-проверки.
- Раскрываемые строки Table: типизированный expandedRowRender, rowExpandable,
  bind:expandedRowKeys, defaults и отдельные callbacks. Сохранение ключей между
  страницами, доступные кнопки, закрепление колонки, RTL, SSR и примеры с проверками
  клавиатуры, выбора строк, серверного режима и мобильной прокрутки.
- Закрепление заголовка и колонок Table: scroll.y, column.fixed start/end и
  rowSelection.fixed, измерение ширин, RTL, непрозрачные фоны и клавиатурная
  прокрутка. На узком экране закрепление колонок отключается, если они не
  помещаются; добавлены примеры и unit/SSR/Chromium-проверки.
- Серверный режим Table: внешний total, удалённая сортировка и фильтры без
  локальной обработки страницы, сохранение выбранных ключей. Модель загрузки
  с отменой, защитой от поздних ответов, ошибками/retry и коррекцией страницы
  при уменьшении total; демо API в галерее и unit/SSR/Chromium-проверки.
- Фильтры колонок Table: одиночный и множественный выбор, bind:filters и
  defaultFilters, подтверждение/сброс, порядок фильтрация → сортировка → пагинация.
  Сохранение скрытого выбора, локализация, RTL, клавиатура и нативный popover.
- Table v1 на Svelte 5: типизированные колонки и snippets, стабильная сортировка,
  локальная пагинация, выбор строк по ключам, loading и пустые данные. Стили
  Ant Design 6.6.8, темы, RTL, прокрутка с клавиатуры, примеры и unit/SSR/Chromium-проверки.
- Checkbox и Pagination на Svelte 5: смешанное состояние, boolean-поля Form,
  нативный reset и FormData; переходы по страницам, выбор размера, диапазоны,
  локаль и RTL. Официальные стили 6.6.8, примеры и unit/SSR/Chromium-проверки.
- Отдельный Playwright Chromium contour: `npm run test:e2e`, изолированный стенд
  компонентов, проверки production-галереи, отчёт и диагностические артефакты.
- Первый набор Ant Design 6.6.8 на Svelte 5 и TypeScript: ConfigProvider, Button,
  Input, Select, Modal, Form и FormItem; отдельный пакет исходников и примеры
  на `/ant-design`.
- Переключаемые темы, типизированная валидация форм с защитой от устаревших
  результатов, unit- и SSR-проверки компонентов.
- Минимальный каркас SvelteKit, Svelte 5 и TypeScript со стартовой страницей.
- Oxlint, Svelte/TypeScript check, Vitest и проверка архитектурных зависимостей.
- Production-сборка через adapter-node и документация по запуску через systemd.

### Fixed

- Select открывает список при нажатии на стрелку и отступы control.
- FormItem применяет vertical/horizontal layout формы и правильно располагает
  подписи полей.
