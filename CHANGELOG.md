# Changelog

Все заметные изменения проекта документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
а версии проекта следуют [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Upload.itemRender получает originNode snippet, файл, текущий список и действия
  preview/download/remove. Можно обернуть или заменить строку, включая пустой
  результат; контейнеры, input и привязка действий к файлу сохраняются.

- Upload.iconRender заменяет иконку файла через snippet с file/listType, сохраняя
  default icons, image thumbnail priority и пустое/нулевое содержимое renderer.
  Изменения renderer сохраняют item/filename/input DOM и внешний focus/selection.

- Upload/UploadDragger поддерживают directory: выбор папки, обход вложенных drop/paste
  в ширину, порционное чтение и webkitRelativePath. Нечитаемый файл пропускается
  без зависания остальных; callbacks после disable/unmount не публикуются.

- Upload/UploadDragger поддерживают pastable: файлы из paste проходят существующие
  accept/beforeUpload/controller/customRequest. Listener обновляется при смене props
  и удаляется при unmount; disabled блокирует paste, пропущенный guard upstream записан raw.

- Masonry columns/gutter и responsive Pagination учитывают глобальные theme.token.screen*.
  Queries обновляются без remount, сохраняя editors, focus/selection, Masonry ref
  и страницу Pagination. Raw stale observer Source отделён от public fresh mount.

- Descriptions учитывает глобальные theme.token.screen* при responsive column/span,
  заменяет media queries после смены токенов и очищает listeners при unmount.
  Raw stale observer Source сохранён отдельно от public fresh-mount counterpart.

- Table поддерживает local/shared prefixCls и независимый dropdownPrefixCls списка
  фильтров. Смена префикса сохраняет controls, sort/selection, открытый фильтр,
  draft/focus раскрытой строки и fixed scroll; component tokens остаются canonical.

- DatePicker/RangePicker и TimePicker/TimeRangePicker поддерживают local/shared
  prefixCls для поля, date/time panels и popup; Button и private affix namespaces
  независимы. Черновики, caret/focus, refs/IDs и pending datetime сохраняются,
  а изменение value/format продолжает синхронизировать поле.

- Calendar поддерживает local/shared picker prefixCls для корня, ячеек и renderers
  с независимыми Select/Radio шапки. DOM/ref/IDs, выбор даты, точность timestamp,
  focus/selection и прежний запрет переноса кнопок режима сохранены.

- ColorPicker поддерживает local/shared prefixCls с независимыми namespaces
  popup, полей и presets. Незавершённый HEX, caret/focus, цвет, раскрытие presets
  и custom container/trigger сохраняются; сбой кеша child selectors Source записан отдельно.

- Cascader/CascaderPanel поддерживают local/shared prefixCls для поля, tags,
  колонок/checkbox и popup. Canonical tokens, нативная ширина input и callbacks
  сохранены; raw local popup padding upstream отделён от public counterpart.

- TreeSelect поддерживает local/shared prefixCls для Select control/tags и popup,
  сохраняя общий Native Tree adapter, query/selection/focus, refs/IDs и форму.
  Несогласованность локальных tree classes/style hooks upstream записана отдельно.

- AutoComplete поддерживает local/shared prefixCls через Select CSS, сохраняя
  отдельный namespace вложенного Input/TextArea. Editor, refs, IDs, query/selection,
  focus, FormData и открытый popup сохраняются при обновлении префиксов.

- Select поддерживает local/shared prefixCls для control/tags/popup и независимый
  namespace служебных CSS variables. Сохранены native forms/reset, compact geometry,
  поиск, text selection, focus и открытый popup, включая внешний container.

- Transfer поддерживает local/shared prefixCls с независимыми namespaces внутренних
  Checkbox/Input/Button/Pagination. Canonical tokens и прежние semantic priorities,
  query/selection/focus, refs, перенос и draft пагинации сохранены.

- Tree поддерживает local/shared prefixCls для nodes, checkbox, switcher и линий.
  Canonical tokens, native focus/ARIA IDs, selection/check и pending load сохранены;
  TreeSelect сохраняет свой текущий CSS-адаптер. Raw readonly-selection observation
  отделён от public counterpart.

- Upload/UploadDragger поддерживают local/shared prefixCls для trigger, списка
  и состояний. Canonical tokens/link reset и отдельные Button/Progress/Tooltip
  namespaces сохранены; DOM/refs/focus и выполняющийся запрос не пересоздаются.

- NotificationHolder и App.notification поддерживают local/shared prefixCls
  во всех placements и частях карточки. Canonical tokens/status backgrounds,
  native viewport/motion, DOM/ARIA IDs, draft/focus/selection, очередь и deadlines
  сохраняются. Source stale status classes записаны raw/refreshed.

- MessageHolder и App.message поддерживают local/shared prefixCls для списка,
  сообщений и иконок. Native popover, очередь, handles, deadlines и внешний фокус
  сохраняются. Source stale status classes записаны raw/refreshed.

- Modal и контекстные подтверждения поддерживают local/shared prefixCls.
  Button namespace и canonical tokens независимы; открытый dialog, draft,
  selection/focus, IDs и callbacks сохраняются. Source лишний Confirm header
  при local prefix записан raw/matched; Native сохраняет один заголовок.

- Drawer поддерживает local/shared prefixCls для panel/mask/placements и частей
  содержимого. Native dialog/motion/backdrop, draft/focus/selection, IDs и scroll
  сохраняются; Button namespace и canonical tokens независимы.

- Pagination поддерживает local/shared prefixCls со стилями и private metric
  namespaces. Native buttons/active colors/wireframe, отдельный Select, bindings,
  current/active DOM и jumper draft/focus/selection сохраняются.

- Menu поддерживает local/shared prefixCls во всех режимах, пунктах и подменю.
  Scoped темы, canonical tokens/link reset, DOM/refs, selection/open и фокус
  сохраняются. Source dashed Divider owner omission записан raw/matched.

- Dropdown поддерживает local/shared prefixCls для trigger, popup, внутреннего
  меню, стрелок и состояний. Button namespace и canonical tokens независимы;
  открытый popup, команды, фокус, typeahead и native binding/callbacks сохраняются.

- Image.previewPrefixCls задаёт независимый полный префикс viewer, включая пустой.
  CSS подключается для нового namespace; upstream omission записан raw/styled.
  Смена имени сохраняет открытый dialog, image/action DOM, масштаб и фокус.

- Image поддерживает local/shared prefixCls для миниатюры и preview;
  ImagePreviewGroup.previewPrefixCls задаёт независимый базовый prefix viewer.
  Canonical tokens, DOM/refs, открытый viewer, масштаб, текущий кадр и фокус сохраняются.

- Mentions поддерживает local/shared prefixCls для editor/mirror, variants/status
  и popup/menu. Private input variables используют общий namespace; trigger prefix,
  native value/IME, refs, query/popup, focus/selection и FormData сохраняются.

- Tour поддерживает local/shared prefixCls для панелей, маски, placements и стрелок.
  Button selectors/private Tooltip variables используют независимый общий prefix;
  шаг, portal DOM, draft/focus/selection и callbacks сохраняются. Source shared-class
  cache с пропущенными Button margins записан raw/fresh.

- Listy поддерживает local/shared prefixCls в raw/virtual ветках, группах, sticky
  headers и scrollbar. Canonical tokens/link reset, native focus/reduced motion,
  refs, измерения строк и прокрутка сохраняются.

- Rate поддерживает local/shared prefixCls для корня, состояний и слоёв звёзд,
  включая character context. Сохранены canonical tokens, Tooltip composition,
  native keyboard/buttons, value, DOM/ref и focus при смене prefix.

- Form/FormItem/FormList поддерживают local/shared prefixCls; Form media CSS
  использует global screen*Max tokens с изоляцией scopes. Сохранены store,
  validation/reset/submit, field DOM/ref и focus/selection; ErrorList использует
  native List priority и fallback styled Item/noStyle. Source cache defects записаны.

- Col поддерживает local/shared prefixCls с полным responsive CSS и независимым
  private namespace. FormItem сохраняет раскладку через span/breakpoint attributes
  и display bridge. Source shared-class flex cache записан raw/fresh; DOM/ref,
  draft/focus/selection и прежний default Form layout сохранены.

- InputNumber поддерживает local/shared prefixCls со стилями обоих modes, вариантов,
  affixes, actions и Compact. Native geometry adapters, арифметика, draft/selection,
  refs, клавиатура и canonical FormData сохранены.

- InputOTP поддерживает local/shared prefixCls для группы, ячеек, separators и маски.
  Source tokens применяются к группе; global Input namespace и прежние значения,
  клавиатура, refs/focus сохранены. Source mask prefix defect записан raw/matched.

- InputSearch поддерживает независимые Search/Input prefixes и общий Button/private
  namespace. Source tokens действуют на корень Search; DOM/ref, value, поиск,
  selection/focus сохраняются. Source Compact/cache observations записаны отдельно.

- InputPassword поддерживает независимые prefixCls/inputPrefixCls и общий prefix.
  Иконка сохраняет Source CSS при любом сочетании имён; исходный пропуск её стилей
  в React сохранён отдельными raw/matched замерами. Видимость, refs и focus прежние.

- Input/TextArea поддерживают local/shared prefixCls для leaf, affix, вариантов,
  clear/count и Compact. Native value/IME, resize/autoSize, refs, формы, focus и
  selection сохранены; отдельные prefix API Password/Search/OTP ещё в работе.

- Switch поддерживает local/shared prefixCls для корня, ручки, подписей и loading.
  Bindings, клавиатура, native форма, refs, checked state и focus сохранены.

- Checkbox/CheckboxGroup поддерживает local/shared prefixCls и независимый Row
  namespace. Mixed/disabled, выбор, формы, refs и focus сохранены; Source stale
  Row selector записан raw/fresh замерами и не перенесён.

- Radio/RadioButton/RadioGroup поддерживают local/shared prefixCls и независимый
  Badge namespace. Native fieldset/input, checked state, формы, refs и focus
  сохранены; Source defaultChecked wrapper observation записан raw/matched.

- В CSS RadioButton восстановлены исходные Group/Badge правила: ширина вертикальных
  кнопок, стык соседних границ и слой счётчика теперь одинаковы при любом prefix.

- FloatButton/Group/BackTop поддерживает local/shared prefixCls с наследованием
  от Group. Progress и анимация используют общий namespace; DOM/ref, открытое меню,
  scroll и focus сохранены. Source owner/cache observations записаны отдельно.

- Button поддерживает local/shared prefixCls для вариантов, размеров, shapes,
  icon/loading и Compact. Общий namespace служебных variables независим от local
  class; темы, приоритет стилей, DOM/ref, focus и native form actions сохранены.

- Card/Grid/Meta поддерживает local/shared prefixCls и наследование от владельца.
  Typography/Tabs namespaces независимы; direct Grid detection, DOM/ref, active tab
  и draft/selection/focus/FormData сохранены. Source пропуск child prefix и shared
  class cache observation записаны raw/matched/fresh замерами.

- Tabs поддерживает local/shared prefixCls для навигации, панелей, More и motion.
  DOM/ref, активная вкладка и draft/selection/focus внутри панели и открытого popup
  сохраняются; canonical theme markers и shared slide keyframes не переименованы.

- Descriptions поддерживает local/shared prefixCls для всех частей и ячеек,
  включая Table expanded-row selectors с независимым общим prefix. Responsive
  layout, semantic props, DOM/ref и draft/selection/focus/FormData сохранены.
  Source пропуск local prefix в Table записан отдельно; Native сохраняет оформление.

- Carousel поддерживает local/shared prefixCls для wrapper, RTL/vertical CSS и
  duration keyframes. Общий prefix Radio/Checkbox selectors независим от local
  wrapper. Смена prefix сохраняет текущий слайд, DOM/ref и draft/selection/focus.

- Typography поддерживает local/shared prefixCls для текста, заголовков,
  decorations, actions, ellipsis и редактора. DOM, draft/selection/focus и copy
  success сохраняются. Source stale action classes записаны raw/fresh замерами;
  Native обновляет действия вместе с корнем.

- Row поддерживает local/shared prefixCls для корня, wrap/align/justify и RTL.
  Responsive gutters, layout, child context, refs, draft/selection/focus и FormData
  сохраняются; перенос Col namespace и связанных правил FormItem идёт отдельно.

- Breadcrumb поддерживает local/shared prefixCls, включая разделители и меню
  пункта. Source потеря separator margins при local prefix записана raw/matched
  замерами. DOM, focus, baseline, link decorations и navigation сохранены.

- Space, SpaceCompact и SpaceAddon поддерживают local/shared prefixCls. Badge
  selector и служебные Addon variables используют общий prefix независимо от
  local layout classes. Source shared-class cache observation сохранён отдельно;
  keyed DOM, refs, draft/selection/focus и прежние Compact adapters сохранены.

- Anchor поддерживает local/shared prefixCls и отдельный item override. Links
  наследуют prefix владельца; Source пропуск этого наследования записан raw/matched
  замерами. Сохранены отступы, indicator, link decorations, DOM/focus и history.

- Splitter поддерживает локальный prefixCls и общий ConfigProvider.prefixCls для
  всех частей и namespace lazy preview. Смена prefix сохраняет панели, editor/focus
  и текущий drag. Source cache defect при shared local class записан отдельно;
  Native изолирует оформление по классу и namespace.

- Masonry поддерживает локальный prefixCls и общий ConfigProvider.prefixCls,
  включая item/motion classes и namespace служебной ширины. Смена prefix сохраняет
  раскладку, DOM, focus/selection и текущую анимацию. Source RTL alias collision
  записан в raw/fresh-page эталонах; Native сохраняет настроенное направление.

- BorderBeam наследует ConfigProvider.prefixCls для классов и служебных CSS variables.
  Local class и namespace изолированы; исходный cache defect при shared local class
  записан в raw/fresh-page эталонах и не перенесён. DOM/focus и reduced motion сохранены.

- Tooltip, Popover, Popconfirm и оба режима Slider наследуют ConfigProvider.prefixCls.
  Префиксы Tooltip у ручек и внешнего Popover независимы от local owner prefix;
  при обновлении сохраняются открытые поверхности, DOM, фокус и клавиатура Slider.

- Alert, Collapse и Affix наследуют ConfigProvider.prefixCls. Смена prefix
  сохраняет fixed node, раскрытые панели, их поля и фокус; SSR не закрепляет Affix.

- Avatar/Group, Badge/Ribbon, Tag/CheckableTag/Group, Empty, Skeleton с primitives,
  Spin, Progress и Result наследуют ConfigProvider.prefixCls. ScrollNumber и CSS
  Ribbon используют общий prefix отдельно от локального. Сохранены native
  wrappers/classes/spacing, DOM/focus и reduced motion цифр Badge.

- Divider, Flex и Segmented наследуют ConfigProvider.prefixCls с локальным
  приоритетом. Смена prefix сохраняет DOM, выбор, FormData, callbacks и фокус.

- Statistic/Timer, QRCode, Timeline и Steps наследуют ConfigProvider.prefixCls.
  Локальный prefix имеет приоритет; вложенный Steps в Timeline получает общий
  prefix отдельно. Сохранены темы, SSR, DOM, фокус и выделение при обновлении.

- ConfigProvider.prefixCls: наследуемый class prefix для App и Layout/sections,
  local priority и source theme CSS-variable fallback. Смена prefix сохраняет
  DOM/focus; legacy namespace и неподключённые семейства отмечены отдельно.

- Select.open/defaultOpen и bind:open: controlled запросы, безопасный SSR,
  selected active option и переходы disabled. Пустой popup скрывается для
  null/false/пустой строки; numeric 0 сохранён, исходное исключение записано.

- Select.optionRender: Snippet с исходными data, key/value/label и текущим index;
  фильтрация, сортировка, synthetic tags, maxCount и выбранные labels сохранены.

- App и App.useApp()/useApp(): общий контекст Message/Notification/Modal,
  встроенные holders, наследование настроек вложенных App, реактивные defaults,
  HTML-root/fragment, local prefix, ConfigProvider.app и nativeElement.

- createModal и ModalHolder: пять контекстных подтверждений, update/destroy,
  await результата, ручные/async callbacks, loading и retry. Тема, locale, RTL,
  native modality и focus сохраняются; source dangling await при destroy записан
  отдельно. Удаление открытого Modal возвращает фокус после удаления DOM.

- Modal поддерживает необязательные title/children, scalar/Snippet title и явные
  ARIA-имена. Native dialog, центрирование, focus и callbacks сохранены; исходные
  потеря title=0 и игнорирование ARIA props записаны и не воспроизводятся.

- Select поддерживает tagRender Snippet с normal/rest metadata, typed values,
  label Snippet и onClose. Сохранены custom mousedown/close event order, focus,
  native Tag composition, смена renderer и responsive overflow. Source disabled
  запрос открытия не воспроизводится; raw observation сохранён.

- Select разрешает опускать options, как текущий upstream. Пустой список по
  умолчанию сохраняет single/multiple defaults, свободные tags, remote cache и native формы.

- Select поддерживает maxTagCount="responsive" с общими измерениями Cascader,
  динамическим input width, inert hidden tags и cleanup observer/RAF. Full-fit
  проверка сохраняет видимые tags при длинном custom rest; raw дефект upstream записан.

- Select поддерживает числовой maxTagCount и scalar/Snippet maxTagPlaceholder.
  Полные hidden values сохраняются в формах, reset и Backspace; скрываемая remove
  button передаёт focus input. Source исчезновение списка при NaN не воспроизводится.

- Select поддерживает maxTagTextLength с полными title, remove names и form values.
  Общая с Cascader функция сохраняет правила rc-select и не разрывает UTF-16 пары;
  исходные Unicode-дефекты сохранены в raw reference.

- Select поддерживает maxCount в multiple/tags: доступность options, ввод,
  tokenSeparators, reactive limit и сохранение существующих values. Native
  исправляет записанный обход лимита через controlled query на Enter/blur.

- Select поддерживает showSearch.filterSort с текущим searchValue, стабильными
  равными элементами и сортировкой synthetic tags. Массив options, порядок выбранных
  значений, controlled query, focus и DOM input сохраняются.

- Select поддерживает массивы и функции tokenSeparators в multiple/tags,
  многострочный paste и отложенное разделение IME. Сохранены controlled search,
  порядок callbacks и native формы/events; исходные disabled/blank ошибки
  записаны в raw reference и не воспроизводятся при добавлении новых значений.

- Select поддерживает mode="tags": свободные строки, Enter/blur/Escape, cache
  выбранных options, typed numeric/string values, native формы и readonly defaults.
  Добавлены showSearch.optionFilterProp и autoClearSearchValue; прежние single/multiple
  defaults сохранены. Исходный whitespace-only tag не создаётся, raw observation сохранён.

- LayoutHeader/LayoutContent/LayoutFooter поддерживают literal prefixCls,
  shared names и возврат стандартного класса. Секции сохраняют собственное
  оформление, inherited variables и controls при смене prefix; ошибочное
  контейнерное оформление upstream сохранено в парных raw/reference замерах.

- Layout и LayoutSider поддерживают независимые локальные prefixCls. Новый
  CSS-рецепт layout-prefix воспроизводит 35 правил; сохранены namespace токенов,
  native SSR-определение Sider, состояния, ids, ARIA, темы и keyed DOM.
  Исходные prefix collisions/cache leaks и дефект префиксов секций сохранены в raw data.

- ConfigProvider.layout задаёт общие class/style только для контейнеров Layout.
  Сохранены локальные приоритеты, nested replacement, секции, темы, native RTL,
  DOM, drafts/selection/focus и collapse-состояние Sider при обновлении config.

- Steps поддерживает локальный prefixCls для root, layout, частей и progress.
  Новый CSS-рецепт steps-prefix воспроизводит 137 правил; сохранены namespace
  токенов, ids, native keyboard/focus, mapped Icon и изоляция соседних Steps.

- Timeline поддерживает локальный prefixCls для root, частей, placement/color
  и layout states. Новый CSS-рецепт timeline-prefix воспроизводит 43 исходных
  правила; namespace Steps, переменные темы, titleSpan и keyed root сохраняются.

- ConfigProvider.steps задаёт общие классы и semantic styles/callbacks.
  Сохранены локальные/item приоритеты и native поведение. В Timeline передаются
  только plain class/style Steps; исключённые semantic callbacks не вызываются.

- ConfigProvider.timeline задаёт общие классы и semantic styles/callbacks.
  Сохранены локальные/item приоритеты, titleSpan, reverse, ol/li, refs и фокус;
  вложенный record заменяет родительский, reactive config не пересоздаёт корень.

- QRCode поддерживает локальный prefixCls для root, cover и status classes.
  Новый CSS-рецепт qrcode-prefix воспроизводит 11 исходных правил; сохранены
  canvas/SVG, статусы, темы, refs, keyboard refresh и изоляция соседних QRCode.

- Statistic и StatisticTimer поддерживают локальный prefixCls, fallback пустой
  строки, смену namespace частей без замены DOM корня и изолированный CSS.
  Новый рецепт statistic-prefix воспроизводит 14 правил закреплённого архива;
  сохранены semantic styles, темы, compact defaults и соседние показатели.

- ConfigProvider.statistic задаёт общие классы, стили и semantic callbacks для
  Statistic и StatisticTimer. Сохранены локальные приоритеты, defaults callbacks,
  вложенные scopes, native RTL/loading, форматирование и работа таймеров.
  Обновление config и props сохраняет DOM корня.

- Form.validateMessages, ConfigProvider.form.validateMessages и
  locale.Form.defaultValidateMessages настраивают общие строки и функции шаблонов,
  включая source printf, приоритеты групп, reactive scopes и messageVariables.
  Сохранены native русские defaults; undefined и исключения template callback
  дают обычную ошибку поля без исходных console/page errors.

- FormItem.messageVariables и строковые сообщения правил поддерживают однократную
  подстановку label/name и параметров правила, включая вложенные поля и экранирование.
  Сохранены native defaults и literal metadata setFields; исправлены исходные ошибки
  подписи 0, inherited переменных и контекста вложенного object.

- Правила Form поддерживают вложенные fields и defaultField, readonly-массивы
  дочерних правил и рекурсивные схемы. Сохранены корневые bindings, transform,
  validator snapshot, validateFirst и async/reset guards. Исправлены source ошибки
  вложенных warningOnly, sparse arrays, преобразованных массивов и inherited field names.

- FormRule поддерживает фабрики `(form) => rule` в createForm и FormItem.
  Они получают текущую модель, вычисляют required/constraints перед проверкой
  и фиксируют настройки до debounce. Сохранены object rules и native validator API;
  required mark работает при SSR, исключение фабрики не оставляет validating.

- Rule.type дополнен enum/email/url/hex/tel/pattern, pattern принимает строку или
  RegExp. Сохранены строгий enum, readonly choices и caller RegExp state.
  Исправлены четыре исходные ошибки URL IPv6/ports; malformed pattern даёт
  validation error без console/page exceptions. Полная type union содержит 17 значений.

- ValidationRule.type поддерживает primitive string/number/integer/float/boolean/
  array/object/date/regexp/method/any с исходным выбором constraints и пустых значений.
  Правила без type сохраняют прежнее поведение. Исправлены исходные классификации
  scientific-notation integers; BigInt/Symbol дают ошибку правила без console/page errors.

- Правила Form поддерживают len и whitespace. Точная длина учитывает Unicode
  code points и элементы массива, имеет приоритет над min/max и проверяет
  пустой массив; whitespace запрещает непустую строку из одних пробелов.
  Сохранены transform, warningOnly, исходные значения и прежние правила без новых props.

- ValidationRule.transform преобразует значение только для проверки отдельного
  правила, сохраняя исходный store, native FormData, submit payload и reset defaults.
  Исключение преобразования становится ошибкой validation, сохраняя warningOnly;
  исходный дефект 6.6.8 с успешной проверкой после исключения записан отдельно.

- FormItem.noStyle сохраняет field binding без layout и собирает ошибки и
  предупреждения в ближайшем оформленном FormItem. Сохранены собственные статусы,
  keyed строки FormList, reset и native focus/selection. Описание control связано
  с реальным списком сообщений; переключение noStyle/help и удаление поля
  освобождают сообщения без двух подтверждённых дефектов исходного 6.6.8.

### Removed

- У Modal удалён maskClosable; закрытие по фону настраивается через mask.closable.
  Сохранены native dialog, pointer origin, callbacks и возврат фокуса.

- У DatePicker/RangePicker/TimePicker/TimeRangePicker удалены popupClassName,
  popupStyle/dropdownClassName, showToday, прямые disabledHours/Minutes/Seconds,
  прежний clearIcon (включая timePicker config), addon/onSelect и deprecated
  второй аргумент onKeyDown. У локалей удалён dayFormat. Сохранены
  classNames.popup.root, semantic styles, showNow, disabledTime, allowClear.clearIcon,
  renderExtraFooter/onCalendarChange и cellDateFormat.

- У Cascader удалены прежние popup callbacks, root clearIcon/showArrow,
  popup/dropdown class/style/render aliases и column styles; сохранены
  onOpenChange, allowClear.clearIcon, suffixIcon, popupRender и semantic slots.
  У AutoComplete/TreeSelect popupClassName заменён на classNames.popup.root;
  у TreeSelect extra удалены preValue/checked/selected, сохранены triggerValue
  и onSelect/onDeselect.

- У Table удалены root expandedRowKeys/defaultExpandedRowKeys/onExpand/
  onExpandedRowsChange; текущие поля перенесены внутрь expandable. У Slider range
  удалён onBeforeChange, у Mentions — deprecated textarea ref, у публичного
  низкоуровневого QRProps — includeMargin. Сохранены текущие callbacks, nativeElement
  и marginSize.

- У Image удалены wrapperStyle и preview.rootClassName, включая групповой preview.
  Сохранены настройки обёртки через styles.root и viewer через classNames.popup.root;
  class/style по-прежнему относятся к img.

- У Select, AutoComplete, TreeSelect и Cascader удалены deprecated top-level
  настройки поиска. Сохранены showSearch object, controlled query, callbacks,
  remote selection cache, фильтрация и режим без локальной фильтрации.

- У Timeline удалены pending/pendingDot, item.label/children/dot/position,
  mode="left"/"right" и тип TimelinePosition. Сохранены title/content/icon/placement,
  mode=start/end/alternate и loading-элементы в items.

- У Breadcrumb удалены routes, item.breadcrumbName/children, прежнее имя в menu item
  и принадлежащий им adapter. Сохранены items/title/menu, path/params,
  itemRender с исходным массивом items и нативные ссылки.

- У Progress удалены trailColor, width, gapPosition и strokeWidth для line/steps.
  Сохранены railColor, size, gapPlacement и актуальный strokeWidth у circle/dashboard.

- У Steps удалены direction, labelPlacement, progressDot и item.description,
  а также принадлежащие progressDot тип и renderer. Сохранены orientation,
  titlePlacement, type="dot", iconRender и content.

- У Slider удалены vertical, count, onAfterChange и handleStyle/trackStyle/railStyle
  в обоих режимах. Сохранены orientation, range.minCount/maxCount,
  onChangeComplete, semantic styles, native формы, фокус и gestures.

- У Tabs удалены tabPosition, indicatorSize, popupClassName и destroyInactiveTabPane
  у корня/items; ConfigProvider.tabs.indicatorSize также удалён. Сохранены
  tabPlacement, indicator, semantic popup.root, destroyOnHidden и текущий
  renderTabBar API закреплённого rc-tabs.

- Удалены Alert.message/closeText/closeIcon/onClose/afterClose на корне,
  ErrorBoundary.message и ConfigProvider.alert.closeIcon; сохранён актуальный
  closable с closeIcon/onClose/afterClose. У Spin удалены tip/wrapperClassName
  и semantic aliases tip/mask; актуальные description/root и lifecycle сохранены.

- Удалены FloatButton.description (включая Group/BackTop),
  Transfer.operations/listStyle/operationStyle и Pagination.selectComponentClass.
  Сохранены content, actions/semantic styles и components.sizeChanger.

- Удалены addonBefore/addonAfter у Input/Password/Search и InputNumber,
  их внутренние wrappers, context adapter и CSS-селекторы. Текущие prefix/suffix,
  Search button и композиция SpaceCompact/SpaceAddon сохранены.

- Удалён bordered у Input/TextArea/Password/Search, InputNumber, Select, TreeSelect,
  Cascader, AutoComplete и date/time pickers. Оформление задаётся через variant;
  приоритет local → Form → component/fallback → global сохранён.

- Удалены destroyTooltipOnHide, getTooltipContainer и overlayClassName/Style/InnerStyle
  из Tooltip, Popover и Popconfirm и их consumers, включая Slider, Typography,
  AvatarGroup и ColorPicker. Сохранены destroyOnHidden, getPopupContainer
  и текущие semantic styles.

- Удалены deprecated component token aliases Button, Menu, Layout, Skeleton,
  Steps, Carousel, Splitter и Popover, seed pink, controlTmpOutline и старые
  ключи палитр blue-1. Сохранены текущие tokens, UI preset pink и CSS-палитры.

- Удалены размеры `middle` и `default` из соответствующих component API;
  обычный `ComponentSize` и fallback ConfigProvider теперь `medium`.
  Текущие `Row.align="middle"` и `Skeleton.shape="default"` сохранены.

- Удалены `Card.bordered/headStyle/bodyStyle`, `CardTabItem.tab` и
  `Descriptions.labelStyle/contentStyle` на корне и item. Сохранены
  `variant`, `label` и semantic styles вместе с текущими приоритетами.

- Удалены старые date/month CellRender и FullCellRender у Calendar,
  `Carousel.dotPosition`, `Splitter.layout/collapsibleIcon`,
  `Space.direction/split` и `SpaceCompact.direction`. Текущие
  `cellRender/fullCellRender`, `dotPlacement`, `orientation`,
  `collapsible.icon` и `separator` сохранены.

- Удалены `AvatarGroup.maxCount`, `maxStyle`, `maxPopoverPlacement` и
  `maxPopoverTrigger`; актуальная настройка через `max` сохранена.

- Удалены `Button.iconPosition`, `Empty.imageStyle`, `Tag.bordered` и цвета
  Tag с суффиксом `-inverse`, `Divider.type`, `Divider.orientationMargin`
  и значения размещения подписи в `Divider.orientation`. Сохранены их актуальные
  замены и одноимённый компонентный токен Divider.

- Удалены публичный `AnchorLink`, его тип и `Anchor.children`;
  вложенные ссылки остаются доступны через `items[].children`.

- Удалены deprecated `Collapse.Panel`, композиция через `children`,
  `expandIconPosition` и `destroyInactivePanel`; актуальный `items` сохранён.

- Deprecated List/ListItem/ListItemMeta, их types/config/tokens, CSS-рецепт,
  отдельные tests/fixtures и List-ветка renderEmpty. Актуальный Listy сохранён;
  общий reset ссылок ограничен Listy и сверяется с его собственным UMD.

- Deprecated StatisticCountdown и Statistic.valueStyle. Обратный отсчёт задаётся
  через StatisticTimer type="countdown", оформление значения — styles.content.

- Deprecated ButtonGroup/InputGroup, их типы, контекст размера Button.Group,
  отдельные CSS-правила и фикстуры. Для композиции используется SpaceCompact;
  размер Button определяется local prop, Compact и ConfigProvider.

- Deprecated BackTop и BackTopProps, его компонентные токены, runtime CSS,
  отдельные тесты, фикстуры и документация. Актуальный FloatButtonBackTop
  и его общие scroll/motion механизмы сохранены.

### Added

- Form: useFormItemStatus с reactive getters status/errors/warnings для собственных
  controls. Перенесены вложенные границы Form/Item и OTP, SSR и reset; API не меняет refs.

- FormItem: initialValue с приоритетом store/Form defaults, SSR, обновлением
  будущего reset и dirty validation. Сохранены копии значений, touched и binding;
  вложенные defaults следуют mount order, сценарии FormList сверены с upstream.

- FormItem: validateStatus с явным пустым значением и автоматическими
  validating/success. Статус работает без name; ошибки остаются доступны
  при изменении оформления. Сверены source классы и цвета, темы и controls.

- FormItem: name стал необязательным для layout-строк. Без него controls не получают
  binding/rules поля и сохраняют локальный state при reset модели; required-mark,
  явный htmlFor, оформление Form и lifecycle перехода к name соответствуют upstream.

- FormItem: rich help с числами, массивами и Svelte snippets, reset локального
  состояния и изоляция вспомогательных controls. Ноль входит в описание поля;
  прежний приоритет errors/warnings и оформление semantic help/helpItem сохранены.

- FormItem: tooltip с content/options, собственным icon и defaults Form/ConfigProvider.
  Подсказка входит в custom requiredMark; сохранены label click, исходная геометрия,
  RTL, темы и native field state. Массивы отображаются как content, декоративный SVG
  не добавляет техническое имя значка к доступному имени поля.

- Form: scrollToFirstError и ConfigProvider.form.scrollToFirstError с локальным
  приоритетом, options и opt-in focus. Сохранён прежний автофокус без настройки;
  устаревшие submit, reset, смена модели и unmount не прокручивают старые controls.

- Form: size с наследованием Form/ConfigProvider и передачей размера вложенным
  controls/Compact. Small/large задают исходные высоты label/control; сохранены
  приоритеты local props, изоляция соседей, semantic callbacks и native field state.

- Form: semantic classNames/styles для root/label/content/help/helpItem/extra,
  callbacks и defaults ConfigProvider.form. Slots наследуются полями/ErrorList;
  сохранены приоритеты CSS, native help/ARIA и фокус при динамическом оформлении.

- Form/FormItem: rootClassName, inline style поля и ConfigProvider.form.class/style.
  Сверены накопление классов, приоритет CSS, nested record replacement и
  component=false; динамическое оформление сохраняет DOM/focus/metadata.

- FormItem: label с числами, массивами и Svelte snippets; исходные renderability,
  title/colon и аргументы requiredMark. Reset сбрасывает локальный content label,
  rich label именует composite controls с сохранением пользовательских ARIA.

- FormItem: необязательная текстовая label и label=null с исходным выравниванием
  controls по колонкам Form. Сохранены explicit offsets и native validation;
  числовой responsive shorthand сохраняет span/offset вместо ошибок upstream.

- Form/FormItem: labelCol и wrapperCol через существующие Row/Col, с responsive
  размерами, локальным приоритетом и сбросом колонок вложенных полей. Проверены
  исходные метрики, RTL, три layouts и сохранение native control/focus/metadata.

- FormItem: validateDebounce задерживает автоматическую validation, заменяет
  устаревшие таймеры и отменяет работу при reset/unmount. Явные проверки и submit
  работают сразу; validateOnly сохраняет ожидающую видимую проверку.

- Form: requiredMark=true/false/'optional'/Snippet и defaults ConfigProvider.form.
  Сохранены исходные классы, приоритеты, обработка colon, локализация Locale.Form
  и замена группы locale; отметка не меняет native required, validation и значения.

- Form/FormItem: colon и labelAlign, Form.labelWrap и defaults ConfigProvider.form.
  Добавлены приоритеты Form/Item, сброс record, RTL, удаление последнего colon
  из отображаемой подписи и сохранение title/native label association. Динамические
  настройки сохраняют DOM, значения, focus/selection и metadata.

- FormItem: extra с текстом, числами, массивами и snippets отображается вместе с
  errors/warnings и входит в aria-describedby. Сохранены 0, текущая renderability,
  внешние описания, фокус/выделение и прежний приоритет help.

- FormItem: hidden скрывает весь блок без удаления binding, значения, refs и local
  state. Скрытое поле участвует в validation/submit/FormData; Tab пропускает его
  controls. Reset сохраняет прежний remount, а показ возвращает доступные ошибки.

- Form: layout=inline с исходными отступами, переносом строк и component tokens;
  FormItem.layout задаёт локальный horizontal/vertical override. Сверены desktop,
  mobile, RTL, compact и нулевые отступы. Прежний vertical default, DOM controls,
  фокус/выделение, values/metadata, native submit/reset и component=false сохранены.

- FormItem: validateFirst для последовательной остановки и первого параллельного
  отказа. По умолчанию правила запускаются параллельно и сохраняют порядок сообщений.
  Errors идут перед warningOnly; раннее предупреждение ждёт блокирующие проверки.
  Дефект upstream, допускающий успешный submit до поздней ошибки, записан отдельно.
  Сохранены silent validation, outOfDate, reset/unmount, native фокус и выделение.

- Form: getFieldInstance, focusField и scrollToField с автоматическими refs controls,
  custom controlRef, native id fallback, точными NamePath и lifecycle FormList/reset.
  Поддержаны scroll boundaries, alignment, smooth/custom behavior и optional focus.
  Подтверждённые коллизии refs и scroll-margin drift upstream записаны отдельно;
  CSS margins пока не участвуют в программном расчёте прокрутки.

- Form: resetFields принимает список точных NamePath. Выбранные FormItem и строки
  FormList пересоздают содержимое; общий reset очищает локальное состояние обычных
  controls, соседи сохраняют DOM/фокус/черновики. Добавлены empty/root paths,
  List initialValue priority/conflicts и защита от поздней validation. Подтверждённый
  stale input upstream записан отдельно; в Svelte видимое значение совпадает со store.

- Form: setFields для пакетных значений, errors/warnings и ручных touched/validating
  без автоматической validation. Сохранены metadata полей без rules, native inputs,
  прежняя errors-проекция и защита snapshot; дефекты upstream с поздней ошибкой
  прежнего значения и undefined touched записаны отдельно и не повторяются.

- Form: getFieldsValue с проекцией bindings/путей, чтением всего store и nullable
  metadata filter. Списки и lifecycle validated сверены с текущими исходниками;
  deprecated strict не переносится. Сохранены прежние модельные правила и touched.

- Form: isFieldsTouched и isFieldsValidating, включая allTouched, группы путей,
  списки и пустые выборки. Сохранены правила модели без UI; запросы metadata
  ничего не меняют. Исключения upstream для пустого пути и undefined names
  зафиксированы отдельно и не воспроизводятся.

- Form: validateFields принимает validateOnly, recursive и dirty, включая их
  сочетания. Тихая проверка сохраняет UI metadata, recursive различает сегменты
  пути, dirty учитывает defaults, проверки, записи и reset. Параллельные запросы
  сверены с upstream; полный snapshot и прежние правила touched сохранены.
  Второй аргумент после undefined применяется; дефект upstream записан отдельно.

- FormErrorList: ошибки и предупреждения FormList, приоритет help, snippets,
  fieldId, темы, prefixCls списка и callback видимости. Сохранены задержка
  очистки и порядок leaving rows; motion и таймеры отменяются при unmount.
  Дефект upstream с повторяющимся текстом toString зафиксирован отдельно;
  лишние сообщения в Svelte не создаются.

- Form: warningOnly, getFieldWarning и warnings в getFieldsError/FormList meta.
  Предупреждения не блокируют submit, не делают поле required и не выставляют
  aria-invalid; ошибки сохраняют приоритет. Поздняя validation не возвращает
  предупреждения после reset, изменения значения или удаления локального поля.
  Прежние предупреждения очищаются при запуске следующей проверки, как upstream.

- FormList: вложенные списки, initialValue, add/remove/move, устойчивые ключи,
  custom validation и reset. Сохранены controls, фокус и полевые ошибки при
  перестановке; ошибки удалённых строк не возвращаются после async validation.
  Дробный индекс move игнорируется: подтверждённая потеря строки в upstream
  не воспроизводится.

- Form поддерживает вложенные NamePath, getFieldValue/getFieldsError,
  FormItem.rules и errorFields. Строки с точками остаются буквальными ключами;
  setFieldsValue объединяет объекты и заменяет массивы. Сохранены createForm,
  изоляция значений, native submit/reset и защита от устаревшей validation.

- Breadcrumb: общие class/style/semantic defaults, separator и dropdownIcon из
  ConfigProvider с исходным nullish приоритетом и whole-record replacement.
  Callbacks читают resolved separator; native params defaults, типы itemRender,
  ссылки, фокус и работа открытого меню сохраняются.

- Anchor: class/style и object/function semantic defaults из ConfigProvider,
  исходные root style слои и whole-record replacement. Индикатор обновляется
  после смены semantic styles/classes без потери DOM, фокуса и callbacks;
  исходный дефект stale geometry сохранён в отдельном raw observation.

- Descriptions: class/style и object/function semantic defaults из ConfigProvider
  с nested record replacement, исходными root слоями и приоритетами legacy/item
  ячеек. Общий flat semantic engine используется также Card/Meta; native callback
  defaults сохранены рядом с отдельным raw source observation.

- Card/CardMeta: class/style и object/function semantic defaults из ConfigProvider,
  независимые records с nested replacement и исходные четыре root style слоя.
  Header/body semantic styles перекрывают legacy; editors, focus/selection,
  FormData, tabs и callbacks сохраняются. Прежние native callback defaults
  сопоставлены с отдельным raw source observation без изменения контракта.

- ConfigProvider/Form: общий variant с исходным приоритетом local/bordered/Form/
  component/fallback/global для всех потребителей, включая Card и Pagination.
  Подключены variant-only Select/TreeSelect/DatePicker/Card/Mentions config;
  Search сохраняет отдельный fallback поля и настройки кнопки.
  Внутренний Select формата ColorPicker сохраняет исходный explicit borderless.

- Form.component=false: контекст без native wrapper для вложенных форм;
  undefined variant ближайшего Form сбрасывает оформление внешнего Form.
  Default form, validation, submit/reset и существующие bindings сохранены.

- Select: локальные outlined/filled/borderless/underlined и legacy bordered=false
  с исходным приоритетом explicit variant. Смена оформления сохраняет поиск,
  focus/selection, DOM и FormData; single/multiple сверены с официальным UMD 6.6.8.

- TableColumn.hidden: видимые col/header/body cells и fixed offsets обновляются
  без сброса sort/filter. Полностью скрытые данные сохраняют selection/expand
  либо исходную пустую колонку; соседние editors и expanded content сохраняются.

- TableColumn.rowScope: нативные th с scope=row/rowgroup, исходные header colors,
  selection/hover и fixed columns. Обновление scope сохраняет editor/focus/selection;
  обычные ячейки, column headers и expanded rows сохраняют свою семантику.

- TableColumn.className: пользовательские классы заголовка и ячеек своей колонки,
  с сохранением sort/fixed/selection classes и DOM редактора при обновлении.

- Grid: глобальные screen tokens управляют Row observer и scoped Col media CSS,
  включая SSR без JavaScript, вложенные/соседние темы и обновление после mount.
  Сохранены source-пороги screen*/screen*Min, reset-классы и приоритет локальных
  стилей. Зависание раскладки при обновлении темы в upstream записано отдельно.

- Grid Row/Col: общие component aliases/algorithms и scoped variables уже при SSR,
  включая typography, nested providers и custom CSS prefix. Сохранены приоритеты
  gutter/flex/style, refs и содержимое slots. Ограничение component media variables
  upstream записано отдельно; глобальные breakpoint tokens ещё требуют переноса.

- Table: showHeader с default true, source no-header corners и сохранением caption,
  панелей и состояния строк. При скрытой шапке fixed offsets измеряются по tbody
  и обновляются после смены/опустошения данных. Добавлены UMD/SSR/browser-проверки.

- Table: rowClassName как строка/callback и rowHoverable с default true. Классы
  дополняют состояние строки, hover отключается сразу при смене prop. Добавлены
  UMD-сравнения классов и цветов, SSR/browser-проверки; stale hover upstream
  записан отдельно и в native CSS не перенесён. Legacy-стили сохранены.

- Table: title/footer snippets получают записи текущей страницы после сортировки
  и фильтрации, включая пустые данные и ручной server mode. Исходная структура
  панелей и footer tokens проверяются по 84 UMD-состояниям; caption, editor DOM,
  draft/focus и controls сохраняются при обновлениях.

- Table: 37 исходных component defaults, aliases/algorithms и реактивная тема
  ячеек, служебных колонок, sort/hover, раскрытых строк и фильтров. Добавлены
  15 UMD-профилей, исходные caret icons и unit/SSR/browser-проверки. Обновления
  сохраняют controls,
  draft/focus, выбор и fixed offsets; legacy-тема и local style priority сохранены.

- Notification: семь component defaults, aliases/algorithms и reactive holder/notice
  theme, 17 UMD-тем и unit/SSR/browser-проверки. Actions повторяют source structure;
  legacy layout, editor DOM/focus, viewport styles и deadlines сохранены.
  Явные status colors не теряются при равенстве global alias или другом cssVar prefix;
  ошибки upstream и width:undefined записаны отдельно, native guards сохранены.

- Message: три component tokens, aliases/algorithms и scoped variables, включая
  notice/Holder style priority и custom prefix. Добавлены 16 UMD-тем и unit/SSR/browser
  проверки; обновления сохраняют viewport styles, очередь, handles и timer deadlines.
  Восстановлена source-высота иконки; прежний перенос длинных слов сохранён,
  наблюдаемое переполнение upstream записано отдельно.

- Modal: основные и внутренние component tokens, aliases/algorithms и wireframe,
  portal theme sync и исходный close icon wrapper. Добавлены 19 UMD-тем и
  unit/SSR/browser-проверки. Native modality, draft/selection/focus, width,
  callbacks и legacy-оформление сохранены; static confirm API ещё не перенесён.

- Drawer: component tokens, aliases и algorithms на native dialog, включая portal
  sync и приоритет локальных CSS variables; title наследует цвет source-панели.
  Добавлены 16 UMD-тем и unit/SSR/browser-проверки. Обновления сохраняют
  модальность, editor DOM, draft, selection и focus; legacy-оформление сохранено.

- Upload/Dragger: два component tokens, aliases/algorithms и локальные CSS variables
  на области выбора/drop; 16 UMD-тем и unit/SSR/browser-проверки. Восстановлены
  link reset, канонические icon classes и полная высота error cards; theme updates
  сохраняют список, input/focus и запросы. Нулевая карточка отмечена как наблюдение upstream.

- Mentions: shared Input/component tokens, aliases и algorithms на textarea/popup,
  16 UMD-тем с размерами/variants, disabled/error и вложенными контекстами.
  Обновления сохраняют draft, caret/focus и активный option; native button reset
  больше не перекрывает исходный фон активной подсказки. Добавлены unit/SSR/browser-проверки.

- Tour: девять исходных CSS defaults, alias overrides и algorithms для panel,
  close и primary controls, независимая тема Button. Обновления сохраняют шаг,
  portal/editor DOM и фокус; добавлены 15 UMD-тем и unit/SSR/browser-проверки.
  Исходный приоритет runtime zIndex=1001 над CSS token записан отдельно.

- ColorPicker: alias overrides и algorithms, независимые темы Popover/Collapse
  и внутренних полей. Theme updates сохраняют popup position, HEX draft/focus
  и пресеты; восстановлены source body reset, flex-размеры полей и bright-state
  от глобального colorBgElevated. Добавлены 15 UMD-тем / 120 scope-наборов,
  60 popup-измерений и SSR/browser-проверки.

- DatePicker, RangePicker, TimePicker и TimeRangePicker: общие component tokens
  через `components.DatePicker`, aliases/algorithms и независимые темы popup.
  Обновления сохраняют draft, фокус, выделение и исходную прокрутку колонок.
  Восстановлены datetime header, пустое выделение и отсутствие пустого footer.
  Добавлены 15 UMD-тем, сравнения focus/popup CSS и unit/SSR/browser-проверки.

- Calendar: подключены шесть public component tokens, 21 внутренний picker panel
  default, aliases/algorithms и независимые темы шапки. Source min-width controls
  сохраняет intrinsic текст при малых размерах без смены public defaults Select.
  Добавлены 17 UMD-тем / 136 наборов, mobile measurements и unit/SSR/browser-проверки.

- Transfer: подключены шесть component tokens, alias overrides и algorithms,
  независимые темы внутренних Checkbox/Pagination и исходный CSS scope пагинации.
  Сохранены search draft, выделение, фокус, страницы и move callbacks. Добавлены
  17 UMD-тем / 136 наборов CSS-измерений и unit/SSR/browser-проверки;
  прежнее native наследование шрифта remove button зафиксировано отдельно.

- Tree: подключены component tokens, alias overrides и algorithms с независимой
  темой внутреннего дерева TreeSelect. Сохранены native style contract, DOM,
  фокус, active descendant, отметки и pending load при theme update. Добавлены
  14 UMD-тем / 112 наборов CSS-измерений и unit/SSR/browser-проверки.

- Listy: component tokens, alias overrides и algorithms для raw/virtual списков,
  исходная оценка высоты строк и обновление живого cache. Сохранены semantic
  priorities, ввод, фокус, refs и sticky scrollTo. Добавлены 16 UMD-тем / 128
  наборов измерений CSS и виртуального окна, unit/SSR/browser-проверки.

- List: подключены 11 component tokens, font/color/spacing aliases и algorithms.
  Восстановлены source scopes root/container/Col; theme updates сохраняют
  keyed rows, ввод, фокус и pagination. Добавлены 17 UMD-тем / 136 наборов
  измерений, включая grid, empty и узкие экраны, unit/SSR/browser-проверки.

- Typography: компонентные heading margins, alias overrides и algorithms
  для текста и редактора. Сохранены style priorities, draft/selection/focus
  и ожидающее async-копирование. Добавлены 15 UMD-тем / 120 наборов измерений
  текста, заголовков, ссылок и textarea, unit/SSR/browser-проверки.

- Form/FormItem: подключены 11 component tokens, alias overrides и algorithms.
  LabelHeight задаёт vertical height по исходному правилу; сохранены native model,
  validation/submit/reset, labels, фокус и CSS scopes внутренних Row/Col.
  Добавлены 17 UMD-тем / 170 наборов CSS-измерений и unit/SSR/browser-проверки.

- FloatButton/Group/BackTop: компонентная тема с alias overrides и algorithms,
  наследованием и custom cssVar prefix. Сохранены Button tokens, приоритеты
  config/semantic/local styles, native refs, фокус и формы. Добавлены 15 UMD-тем
  с 225 наборами измерений и unit/SSR/browser-проверки.

- ConfigProvider.getTargetContainer: общий Window/HTMLElement target для Affix
  и Anchor с вложенным наследованием и приоритетом локальных параметров.
  Смена target сохраняет DOM, поля и focus; регистрации Anchor не теряются
  при одновременной смене href. Source ShadowRoot error и stale Affix position
  сохранены отдельно; native поддерживает немедленное обновление позиции.

- Affix: перенесены ConfigProvider.affix class/style и локальный prefixCls.
  Сохранены whole-record inheritance, local style priority и независимые CSS
  variables. Prefix/config updates сохраняют fixed DOM, поля и callbacks;
  scoped CSS очищается при reset/unmount. Добавлена сверка с официальным UMD.

- ConfigProvider.space: size, class/style и object/function root/item/separator slots
  с исходными приоритетами и заменой вложенных records. Space получил alias tokens
  и algorithms без typography reset; Compact/Addon сохраняют независимые настройки.
  Добавлены Source/SSR/browser-проверки gaps, scopes, callbacks и сохранения
  keyed DOM, draft/selection/focus при обновлениях.

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

- Date/TimePicker не добавляют внешние пробелы между snippets, head stylesheet,
  корнем поля и скрытым popup; текст соседнего содержимого сохраняется.

- Prefix CSS Date/TimePicker и Calendar сохраняет Native defaults при поздней
  вставке в head: тень фокуса, dark background и compact cell metrics совпадают
  с canonical ant. Source theme overrides сохраняют приоритет.

- Подключаемые prefix/theme стили больше не добавляют пробелы вокруг корней
  компонентов и ConfigProvider. Inline-композиция сохраняет исходную ширину;
  текст внутри controls, snippets и пользовательские пробелы не меняются.

- Button не добавляет text nodes перед native button/anchor при default/local prefix.
  Граница разметки сохраняет ширину inline actions и панелей Tour.

- Подключение prefix CSS Input/TextArea больше не добавляет whitespace text nodes
  вокруг native control. Input внутри rich help снова имеет пустой textContent;
  SSR сохраняет тот же контракт для canonical и custom prefixes.

- Editable/custom Tabs прокручивает выбранную ячейку целиком, включая remove.
  Активная вкладка больше не попадает в More, когда виден только её внутренний текст.

- Dropdown сохраняет неконтролируемое open/closed состояние и focus при обновлении
  spread props. DefaultOpen остаётся initial-only; снятие внешнего open сохраняет
  прежний fallback, binding и callbacks.

- Responsive overflow Select/Cascader измеряет собственные tags/rest/input.
  Input внутри maxTagPlaceholder больше не скрывает все выбранные tags.

- Standalone Layout sections получают fallback variables и border-box до hydration,
  включая legacy light/dark/compact. Внутри Layout сохранены inherited variables
  и overrides владельца, локальные styles остаются последними.

- Sider сохраняет восстановление фокуса при обновляемых props и сворачивании
  содержимого до нулевой ширины. Внутренний focus lifecycle использует реальный DOM
  body; явный переход владельца на другой control не перезаписывается.

- Transfer: model errors передают aria-invalid и description на корень,
  в том числе при ручном success/validating/пустом статусе FormItem.

- Form: disabled распространяется на controls без FormItem; вложенный
  ConfigProvider и явный prop control сохраняют исходный приоритет.
  Значения, выделение и прежняя блокировка при отправке сохранены.

- FormItem: controls в label/extra/tooltip не наследуют binding основного поля.
  Убраны дубли id/name, лишние required/error ARIA и влияние helper blur на touched;
  getFieldInstance возвращает основной control. Настройки Form и явные props сохранены.

- FormItem: resetFields сбрасывает локальное состояние extra выбранного поля,
  как label/tooltip и upstream. Соседние slots, значения и фокус сохраняются.

- FormItem: удалён лишний error-класс контейнера пояснений, как в upstream.
  Классы и цвета отдельных сообщений, role alert/status сохранены.

- Form: поля без validation rules не получают временный validating; одиночный
  запрос учитывает все bindings с выбранным именем, как upstream.
- FormList: после полного reset сохраняются регистрации новых контролов,
  их validation rules и фокус первого ошибочного поля при submit.

- Form: isFieldTouched родительского пути учитывает touched потомков с различием
  literal и numeric/string paths. Запрос [] безопасно проверяет всю модель;
  падение upstream записано в raw reference.

- Segmented: проверка thumb под scale ожидает завершение CSS transform корня
  перед новым выбором. Сравнение геометрии, пауза thumb и допуск 1px сохранены.

- Descriptions: тест смены темы ожидает поле перед чтением исходных colspan;
  сравнение ячеек, DOM, focus/selection и изоляция тем сохранены.

- Affix: проверка удаления configured owner ожидает все scroll targets перед
  прокруткой; проверки очистки prefix CSS и снятия фиксации сохранены.

- Typography: browser-сценарии ожидают загрузку ленивой фикстуры до проверки
  autofocus. Проверки focus/selection, async copy и общий лимит теста сохранены.

- TimeRangePicker: тест Now сбрасывает часы перед pauseAt, чтобы загрузка фикстуры
  не переносила целевое время в прошлое. Ожидаемые UTC/precision и callbacks сохранены.

- Statistic: browser-проверка timer/countdown ожидает оба узла ленивой фикстуры
  перед сохранением refs и текста; управление часами и identity checks сохранены.

- Input/Select: общий интеграционный browser-набор использует отдельный маршрут
  с прежними BasicFixtures и shared controls. Проверки keyboard/search/disabled,
  numeric values и FormData выполняются без загрузки всей страницы компонентов.

- Browser fixtures: Affix ждёт mount всех scroll targets перед прокруткой;
  ConfigProvider проверяет прежние Select/Modal и shared controls в отдельном
  маршруте без загрузки общей страницы. Assertions и таймауты сохранены.

- TimePicker/TimeRangePicker: подтверждение первого выбранного пункта сохраняется,
  когда автопрокрутка переносит второй click/dblclick с ячейки на колонку. Пустая
  область не подтверждает предыдущий выбор; отдельные range confirmations и
  callbacks без onOk сохранены.

- FloatButtonBackTop: fade использует исходную linear-кривую и не сбрасывает
  пользовательский transform. Enter/leave проверяются на промежуточном кадре UMD.

- Progress Circle: browser-проверка rapid/spaced updates останавливает часы;
  интервалы 20/150 мс сохраняются независимо от времени выполнения DOM-действий.

- DatePicker/RangePicker datetime: восстановлены приоритет panel/input/locale
  formats, fallback колонок при date-only формате и вывод 12-hour режима.
  Добавлены 40 raw UMD-измерений, unit/SSR/browser-проверки и проверки UTC/precision;
  ошибочная обработка literal `[Hours]` в исходнике зафиксирована отдельно.

- List/Listy: восстановлены source link reset, цвета и подчёркивания в обычном,
  hover/active/focus состояниях. Сохранены Meta colors, inline priority, native
  focus, навигация и оформление внешних ссылок; CSS извлекается из pin 6.6.8.

- Portal: сохранены пустые и guaranteed-invalid CSS variables, включая очищенные
  component tokens Tabs. Vendor defaults больше не возвращаются после переноса;
  различие var() fallbacks проверено также без CSS Typed OM.

- TimePicker/TimeRangePicker: двойной клик подтверждает первый выбранный пункт,
  даже если автопрокрутка сместила колонку между кликами. Сохранены keyboard,
  callbacks, UTC/precision и отдельные подтверждения диапазона. Дефект upstream
  сохранён в наблюдении с реальными pointer events закреплённого UMD.

- Portal: theme variables копируются одним снимком без пересчёта стилей popup
  после каждой записи. Сохранены вычисленные значения var(), удаление устаревших
  variables, component overrides, DOM, фокус и выделение, включая TimePicker в ShadowRoot.

- Affix: компонентный zIndexPopup и alias/algorithm overrides применяются к
  закреплённому узлу. Смена темы сохраняет геометрию, placeholder, refs и поля
  без лишних onChange; обычный поток и legacy defaults сохранены.

- Watermark: Canvas defaults и z-index подключены к глобальным source tokens.
  Seed/alias/algorithm updates сохраняют wrapper, mark, refs и focus, включая
  унаследованные Modal/Drawer. Явные параметры и legacy CSS defaults сохранены.
  Проверки сравнивают реальную Canvas-отрисовку, PNG и scoped layer styles с UMD.

- BorderBeam: alias tokens и algorithms подключены к декоративным слоям.
  Внешний target получает тему владельца с CSS overrides; смена темы сохраняет
  слои, focus/selection и измеренную рамку. Добавлены Source/SSR/browser-проверки
  priority, scopes, updates и освобождения observer/listener.

- BorderBeam: перенесён локальный prefixCls, включая пустое значение,
  selectors/pseudo-elements, supports/media и reduced motion. Смена префикса
  сохраняет слои и focus; динамический stylesheet очищается при reset/unmount.

- Masonry: подключены alias tokens/algorithms и глобальный theme.token.motion.
  Fresh remeasure сохраняет DOM/draft/selection/focus; отключение motion завершает
  текущий переход, отсутствие реальной анимации больше не задерживает удаление.
  Отсутствующий source CSS marker и зависший CSS0 leave записаны отдельно;
  Source CSS/geometry сверяются через публичный rootClassName без правки upstream.

- Layout: подключены 16 современных component tokens и три deprecated aliases
  для Layout/Sider с наследованием variables секциями и сохранёнными style priorities.
  Добавлены Source/SSR/browser-проверки scopes, геометрии, collapse/focus/refs.
  Standalone-секции получают собственные variables; отсутствие их в upstream
  записано отдельно для разбора.

- Image: шесть компонентных токенов подключены к миниатюре и общему viewer
  ImagePreviewGroup. Сохранены приоритет preview.zIndex/wrapperStyle, native dialog
  stack, transforms/current/focus и refs. Добавлены сверка с Ant Design 6.6.8,
  SSR и browser; duration пока проверяется только как переменная без progress API.

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
  тему также в обоих режимах Timer. Сохранены native compact и semantic styles,
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
- StatisticTimer: countup/countdown, формат
  длительности, onChange/onFinish, стабильный SSR-placeholder, cleanup и защита
  от поздних callbacks. Добавлены unit/SSR/Chromium, отдельная фикстура и запуск
  отсчёта в галерее; реестр отмечает покрытый основной объём семейства Statistic.
- Statistic: строковое форматирование чисел с precision без округления,
  разделителями и formatter, title/prefix/suffix snippets, valueRender,
  semantic slots и loading через Skeleton. Добавлены CSS-рецепт, unit/SSR/Chromium,
  изолированная фикстура и пример галереи; Timer на этом этапе ещё не перенесён.
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
