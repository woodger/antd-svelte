# Changelog

Все заметные изменения проекта документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
а версии проекта следуют [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
