# Ant Design для Svelte 5

> Type: Reference. Первая версия community-переноса компонентов Ant Design
> 6.6.8 на Svelte 5 и TypeScript.

Библиотека содержит компоненты, модели форм, темы и локализацию. Подтверждённый
объём переноса и известные пробелы описаны в [реестре покрытия](docs/reference/ant-design-porting/status.md).
Публичная точка входа — [index.ts](./src/lib/index.ts). Компоненты работают без
React и SvelteKit API. Живые примеры доступны на [домашней странице](https://woodger.org/ant-design).

## Подключение

Подключайте компоненты через публичную точку входа `antd-svelte`:

```svelte
<script lang="ts">
  import { Button, ConfigProvider, Input, Select } from 'antd-svelte';

  let name = $state('');
  let role = $state<string | undefined>('developer');
</script>

<ConfigProvider theme={{ mode: 'light', primary: 'blue' }}>
  <label for="name">Имя</label>
  <Input id="name" bind:value={name} />

  <label for="role">Роль</label>
  <Select
    id="role"
    bind:value={role}
    options={[
      { value: 'developer', label: 'Разработчик' },
      { value: 'designer', label: 'Дизайнер' }
    ]}
    showSearch
    allowClear
  />

  <Button type="primary" onclick={() => console.log(name, role)}>Сохранить</Button>
</ConfigProvider>
```

ConfigProvider подключает стили. Для использования отдельных компонентов без
провайдера импортируйте `antd-svelte/styles.css` один раз в корневом layout.

## Локальная разработка

Это самостоятельный Git-репозиторий библиотеки. Для установки, проверки и сборки
исходники сайта не нужны:

```sh
npm ci
npm run lint
npm run check
npm run check:tests
npm test
npm run build
npm run test:package
```

Служебный CLI библиотеки запускается через `npm run cli -- ...`:

```sh
npm run cli -- --help
npm run cli -- registry check
npm run cli -- registry report
npm run cli -- registry show avatar
npm run cli -- css all --check
```

`npm run build` использует официальный `@sveltejs/package` и создаёт `dist`:
Svelte-компоненты, JavaScript-модули, декларации `.d.ts`, CSS и лицензии vendor.
`npm run dev` обновляет этот каталог в watch-режиме. Тесты исключены из npm-архива.

Браузерные проверки компонентов находятся в `tests/browser`, SSR-проверки
собранного публичного пакета — в `tests/package`. Они используют собственные
фикстуры и не требуют homepage. Для браузерных проверок установите Chromium:

```sh
npm exec -- playwright install chromium
npm run test:browser
```

Playwright собирает текущий пакет и запускает Vite-стенд на `127.0.0.1:4175`.
`npm run test:package` также начинает со сборки. `npm test` остаётся отдельной
проверкой исходников и инструментов; `check:tests` проверяет типы обоих стендов.

Для `check:tests` используется стандартный TypeScript-движок `svelte-check`.
Опциональный `--tsgo` в этой схеме неверно разрешает часть модулей self-reference
пакета; обычная проверка сохраняет строгие настройки и проверяет тот же набор файлов.

Имя пакета — `antd-svelte`; пока он имеет статус `private`. Упаковка собранного
пакета для локальной проверки:

```sh
npm pack --ignore-scripts
```

Сайт является отдельным потребителем пакета. До публикации он может подключать
его как `"antd-svelte": "file:../antd-svelte"`; затем этот путь заменяется версией
из npm. Компоненты подключаются через `antd-svelte`, стили — через
`antd-svelte/styles.css`. Потребителю нужен сборщик с поддержкой Svelte 5.
Day.js должен удовлетворять peer-диапазону ^1.11.11; разработка использует 1.11.23.

Реестр переноса, CSS-рецепты и собственная документация находятся в этом
репозитории. `npm run cli -- registry check` проверяет локальные подтверждения;
`integration:` обозначает стабильный идентификатор проверки потребителя.
Метаданные доступны потребителю через `antd-svelte/porting/registry.json`.
Его исходные файлы и фикстуры проверяются его собственным инструментом; проверка
реестра не подтверждает выполнение тестов; их команды запускаются отдельно.

Живые примеры опубликованного проекта предназначены для
[домашней страницы](https://woodger.org/ant-design).
Модели табличных примеров используют публичные чистые функции `getTableData`
(фильтрация и сортировка) и `getPaginationState` (нормализация страницы).

## Компоненты

Точные Props, callbacks, snippets и refs определены рядом с компонентами и
экспортируются через [index.ts](./src/lib/index.ts). JSDoc у исходных объявлений
описывает defaults, приоритеты и ограничения; сборка сохраняет его в декларациях
пакета. Таблица ниже описывает поведение и не заменяет эти объявления.

| Компонент | Поддерживаемое поведение |
| --- | --- |
| ConfigProvider | Светлая и тёмная темы, три основных цвета, компактная плотность, размеры, disabled, направление и локаль |
| Button | Native button/href, color/variant/ghost, loading delay/icon, semantic slots, config и Compact |
| Typography / TypographyText / TypographyTitle / TypographyParagraph / TypographyLink | Нативный текст, decorations, copy/edit, CSS/JS ellipsis, expand/collapse и semantic config |
| FloatButton / FloatButtonGroup / FloatButtonBackTop | Плавающие native actions, Badge/Tooltip, меню групп и возврат с прогрессом прокрутки |
| Watermark | Text/image Canvas tiles, per-line fonts, offsets, mutation repair, наследование Modal/Drawer |
| BorderBeam | CSS-лучи по рамке нативного контейнера, градиенты, фазы, размеры и reduced motion |
| Rate | Value/defaultValue, half/clear, hover, keyboard/RTL, character/tooltips, размеры и focus ref |
| Input | Native text/events/forms, prefix/suffix, clear/count, variants, semantic slots и input config |
| InputPassword | Видимость пароля, click/hover/keyboard, controlled toggle, focus/selection и возможности Input |
| InputSearch | Поиск по кнопке/Enter/очистке, loading/IME, custom button snippet и композиция Compact |
| InputOTP | UTF-16 ячейки, formatter/paste, mask/separator, keyboard/focus и callbacks полного кода |
| DatePicker | Single Dayjs date/datetime, input/calendar/time, confirmation, clear, ограничения, locale и native формы |
| RangePicker | Пара Dayjs, связанные календари, время и подтверждение границ, allowEmpty/disabled, presets и hover |
| Calendar | Full/mini date/month panels, controlled value/mode, header, week numbers, snippets и custom date adapter |
| Upload / UploadDragger | Выбор/drop, controlled list, beforeUpload, XHR/customRequest, статусы и удаление |
| Tree | TreeData, раскрытие/выбор/отметки, strict/conduction, loadData, клавиатура и showLine |
| TreeSelect | Single/multiple, labelInValue, check strategies, поиск, loadData и native popup |
| Cascader / CascaderPanel | Полные пути, multiple/check strategies, поиск, lazy children, колонки и standalone Panel |
| Transfer | Два списка, controlled targetKeys, выделение/Shift, поиск, oneWay, пагинация и custom lists |
| Listy | Группы, sticky headers, измеряемая виртуализация, scrollTo и native scroll |
| Carousel | Слайды, infinite/finite, rows, fade, swipe, autoplay, lazy loading, responsive и refs |
| TextArea | Многострочное значение, native constraints/events/selection, формы, размеры, статусы и RTL |
| InputNumber | Число/null и stringMode, точные десятичные шаги, formatter/parser, spinner, variants, prefix/suffix, refs, FormData и reset |
| Slider | Число или диапазон, marks/dots, editable/draggableTrack, push/cross, клавиатура, подсказки, темы/RTL, native формы и refs |
| ColorPicker | Color-модель, RGB/HSB/hex/alpha, palette, single/gradient, presets, semantic config и native popup |
| Image / ImagePreviewGroup | Native img/fallback/placeholder, preview transforms/focus и групповая навигация по images/items |
| Mentions | Prefix/split, поиск у каретки, loading, autoSize, popupRender и контейнер |
| AutoComplete | Свободный текст, options/groups, поиск, keyboard backfill, custom input и controlled popup |
| Select | Одиночный и множественный выбор строковых/числовых значений; поиск, очистка, disabled options, клавиатура и FormData |
| Checkbox | Checked/defaultChecked, mixed state, semantic config, callbacks/refs, native формы и участие в группе |
| CheckboxGroup | Типизированный массив, options/children, skipGroup, semantic options, FormData, disabled и reset |
| Radio | Checked/defaultChecked, semantic config, callbacks/refs, нативные группы и FormData |
| RadioButton | Кнопочное оформление Radio, native input, group context и refs |
| RadioGroup | Типизированный одиночный выбор, options, уникальное имя группы, горизонтальное/вертикальное расположение, required, reset и FormItem |
| Switch | Checked/value aliases, source events, semantic config, refs, loading, клавиатура и native формы |
| Pagination | Страницы, переходы по пять страниц, выбор pageSize, диапазон записей, размеры, RTL и локаль |
| Table | Типизированные колонки и snippets, фильтры, стабильная сортировка одной колонки, локальная и серверная пагинация, выбор и раскрытие строк, закрепление заголовка и колонок, loading и пустые данные |
| Modal | Нативный dialog, заголовок, footer snippet, закрытие, confirmLoading и callbacks |
| Tour | Шаги, target/mask/gap, 12 размещений, controlled/default state, keyboard, snippets и semantic config |
| Tooltip | Текст, hover/focus, bind:open, задержки, Escape, 12 положений, стрелка, автоматический переворот и aria-describedby |
| Popover | Интерактивные snippets, click/hover/focus, bind:open, 12 положений, стрелка, автоматический переворот, клавиатура и возврат фокуса |
| Popconfirm | Подтверждение и отмена, Promise/loading, повтор после ошибки, защита от поздних результатов, snippets, локализация и клавиатура |
| Dropdown | Плоское меню команд, click/hover, bind:open, disabled/danger, snippets, шесть положений, стрелки/typeahead и возврат фокуса |
| Menu | Items/группы/подменю, selected/open keys, horizontal/vertical/inline, native links, клавиатура и collapse |
| Tabs | Типизированные панели, bind:activeKey, line/card/editable-card, четыре положения, centered/gutter, меню more, ручная клавиатурная активация, сохранение содержимого и destroyOnHidden |
| Collapse | Независимые панели и accordion, bind:activeKey, snippets, extra, header/icon/disabled, сохранение содержимого и destroyOnHidden |
| Drawer | Модальная выдвижная панель, bind:open, четыре стороны, размеры, snippets, анимация, сохранение содержимого и destroyOnHidden |
| Alert | Четыре статуса, scalar/snippet content, semantic/provider config, component tokens, prefix/ref и закрытие с доступным фокусом |
| MessageHolder / createMessage | Изолированная очередь пяти типов сообщений, ключи и обновления, таймеры, hover-пауза, maxCount, callable/thenable handle и контекст ConfigProvider |
| NotificationHolder / createNotification | Подробные уведомления с title/description/actions snippets, четыре статуса, шесть положений, ключи, таймеры, hover/focus-пауза и закрытие |
| Progress | Line/circle/dashboard, steps, gradients, success и percentPosition; component tokens, semantic/provider config, local prefix и formatter snippets; ARIA/RTL/SSR |
| Spin | Standalone/children/fullscreen, percent/auto, component tokens, prefixCls, semantic/provider config, indicator snippets и static fallback; сохранены inert и восстановление фокуса |
| Skeleton | Каркас первой загрузки и Avatar/Button/Input/Image/Node; размеры, темы, active/round, semantic slots, ConfigProvider, prefix, refs, замена children, доступный статус и фокус |
| Empty | Пустое состояние, default/simple SVG, image/description snippets, действия, локаль, темы и восстановление фокуса |
| Result | Семь статусов, официальные иконки/SVG, static images, component tokens, semantic/provider config, prefix/ref и восстановление фокуса |
| Steps | Управляемые этапы, статусы, snippets, нативные кнопки, horizontal/vertical, medium/small, локаль, темы и восстановление фокуса |
| Tag | Preset/status/CSS colors, варианты, semantic styles, ConfigProvider.tag, snippets и отменяемое закрытие |
| CheckableTag | Управляемый checked/onChange, click/keyboard callbacks, DOM attrs/ref, нативная toggle-кнопка, aria-pressed и disabled |
| CheckableTagGroup | Одиночный/множественный выбор, controlled/defaultValue, options, семантические стили и native ref |
| Badge | Числовой счётчик, overflow/showZero/dot, статусы/preset цвета, string/Snippet text, размеры, offset и доступное полное значение |
| Avatar | Изображение, icon/children fallback, circle/square, именованные/числовые/адаптивные размеры, подгонка текста и доступное имя |
| AvatarGroup | Типизированные items, стабильные ключи, общие размеры/форма, перекрытие, max.count и скрытые участники в Popover |
| Divider | Направления, подпись, titlePlacement, варианты линий, размеры, semantic slots и nativeElement |
| Flex | Прямые дети, направления, align/justify, wrap, gap/flex, нативный component и nativeElement |
| Statistic | Числа/строки, precision без округления, разделители, formatter, snippets, semantic slots и loading |
| StatisticTimer | Отсчёт времени вверх/вниз, формат, callbacks, SSR-placeholder и отмена интервалов |
| Segmented | Типизированный одиночный выбор, native radio, стрелки, размеры, block/round, snippets и semantic slots |
| Row / Col | 24 колонки, responsive span/offset/order/push/pull/flex, gutter, align/justify и вложенные контексты |
| Masonry | DOM-высоты, кратчайшие колонки, responsive gutters, fresh, keyed items и CSS appear/leave |
| Layout / LayoutHeader / LayoutContent / LayoutFooter / LayoutSider | Нативная структура, hasSider, collapse/trigger, responsive sidebar, темы и RTL |
| Descriptions | Таблица read-only полей, responsive column/span/filled, horizontal/vertical, bordered и semantic slots |
| Card / CardGrid / CardMeta | Header/cover/body/actions, loading, grid, tabs, metadata, semantic slots и варианты оформления |
| Breadcrumb | Items/routes, params, separator items, custom Snippet renderer, меню и native navigation |
| Space / SpaceCompact / SpaceAddon | Wrappers/gaps/separators, компактные стыки controls, размеры, вложенность и addon variants/status |
| Form | Типизированная модель, валидация, submit, reset и обработка ошибок |
| FormItem | Label, required, help, ошибки и контекст доступности одного control |
| FormList | Вложенные массивы, initialValue, add/remove/move, устойчивые ключи и custom validation |
| FormErrorList | Ошибки и предупреждения FormList, help, темы и lifecycle сообщений |

Input и Select поддерживают `bind:value` и `onValueChange`. Очистка одиночного
Select возвращает `undefined`, множественного — `[]`; числовой `0` остаётся допустимым значением. `defaultValue`
используется как начальное значение отдельного control. Для control с
`bind:value` задавайте начальное значение у владельца и не передавайте
`defaultValue`. Для сброса привязанного значения изменяйте состояние владельца.

Button `type` задаёт оформление, `htmlType` задаёт нативный тип кнопки и по
умолчанию равен `button`. Вариант `link` остаётся кнопкой действия без href;
при href создаётся нативная ссылка. Кнопка loading недоступна для повторного
нажатия. Подробности — в разделе Button ниже.

## Button

Button сохраняет прежние props и native onclick; добавлены href, color/variant,
ghost, square shape, iconPlacement,
classNames/styles и rootClassName. Children/icon принимают Snippet, текст,
число или boolean; 0 отображается, true создаёт пустой присутствующий контент.
ButtonProps остаётся интерфейсом native button и доступен по прежнему пути
Button.svelte; ButtonLinkProps описывает ссылку. Компонент выводит тип currentTarget
из href: существующий onclick без href получает HTMLButtonElement, с href —
HTMLAnchorElement. OnClick поддержан как alias; native onclick имеет приоритет.
Bind:nativeElement возвращает фактический button или a.

```svelte
<Button color="purple" variant="filled" iconPlacement="end">Действие</Button>
<Button href="#details">К подробностям</Button>
<SpaceCompact size="small"><Button>Назад</Button><Button>Вперёд</Button></SpaceCompact>
```

Полная пара color+variant имеет приоритет над type/danger. Без пары явный type
либо danger выбирает исходную sugar-map. Отдельный variant=solid выбирает primary;
неполные остальные пары fallback используют ConfigProvider.button либо default/
outlined, как в коде Ant Design 6.6.8. Color включает default/primary/danger и
13 preset colors. Ghost превращает solid в outlined и включает прозрачный фон;
для text/link ghost не применяется. Square использует обычный border radius без
дополнительного shape-класса. Block и размеры сохраняют прежнее поведение.

Loading принимает boolean или {delay,icon}. Положительный delay откладывает
spinner; смена delay/отмена/удаление очищают deadline. Loading.icon имеет приоритет
над button.loadingIcon. SSR не создаёт timer и не показывает отложенный spinner.
Согласованный v1 native button во время loading остаётся disabled и aria-busy;
это сохраняет существующее отличие от React click guard. Для ссылки loading
отменяет переход через preventDefault; disabled дополнительно убирает href,
ставит aria-disabled и tabindex=-1. Enabled anchor получает tabindex=0 как upstream.
Native button сохраняет htmlType/button/submit/reset и form-атрибуты; href не
превращает type=link в навигацию автоматически. AutoFocus фокусирует при mount.

ClassNames/styles — объект или функция от {props}; слоты root/icon/content.
Классы объединяются. Стилевые слои: context.styles → context.style(root) →
local styles → local style(root). ConfigProvider.button задаёт autoInsertSpace,
shape/color/variant, loadingIcon, class/style и semantic slots. Omitted button
наследует config; явный объект, включая {}, заменяет его целиком как в upstream.
FloatButton может пропустить semantic slots этого config через внутренний
_skipSemantic; обычные пользователи не должны использовать этот prop.

Размер Button берётся из local size, затем Compact, затем ConfigProvider.
Для плотных групп используется SpaceCompact; native Tab-порядок сохраняется.

AutoInsertSpace по умолчанию true: scalar children из ровно двух символов
U+4E00–U+9FA5 получают пробел на SSR, если нет icon и variant не text/link.
Svelte Snippet непрозрачен для SSR; после hydration проверяется единственный
отрендеренный text/element и применяется исходный HOC-класс letter-spacing.
Текст и DOM владельца не переписываются; такой Snippet сохраняет textContent без
ASCII-пробела, в отличие от scalar children. Изменения текста наблюдаются с cleanup.
Эта адаптация явно учитывается как partial coverage в реестре.

Enter/leave анимация loading icon и prefixCls пока отсутствуют; прежний spinner
сохранён. Source component tokens и [Wave](./docs/reference/wave.md) подключены.
Общий механизм тем,
RTL, Form disabled и Compact остаётся прежним. Фикстура — ?fixture=button;
расширенный пример — /ant-design#buttons. Unit/SSR/Chromium проверяют приоритеты,
формы/ссылки, delay/cancel, CJK, nested config, Group/Compact и совместимость
с Popconfirm. CSS Button уже входит в vendor/antd.css и не дублируется.

## Divider

```svelte
<Divider titlePlacement="start" variant="dashed">Раздел проекта</Divider>
<Divider orientation="vertical" />
```

Divider сохраняет структуру Ant Design 6.6.8: корневой div с role=separator,
две rail и inner-text для горизонтальной подписи. Children принимает строку,
число или Snippet; 0 отображается, null/false/пустая строка дают линию без подписи.
Переданный Snippet считается подписью, даже если он выводит пустое содержимое.
Вертикальный Divider не монтирует подпись. Aria-orientation отражает направление;
компонент не добавляет tabindex и не меняет фокус.

Orientation=horizontal/vertical имеет приоритет над boolean vertical.
TitlePlacement задаёт положение подписи: start/end зависят от RTL,
left/right сохраняют физическую сторону, default=center. Отступ подписи
задаётся через styles.content.

Variant=solid/dashed/dotted, dashed alias и plain повторяют классы эталона.
Size=small/medium/large наследуется от явно заданного componentSize в ConfigProvider,
включая вложенные провайдеры. Без явного
размера Divider сохраняет стандартный отступ 24px без подписи и 16px с подписью.
В semantic callbacks size в этом случае undefined. Без подписи large имеет
отступ 24px, medium — 16px, small — 8px;
с подписью large использует 16px, как upstream. Размеры действуют горизонтально.
Темы, compact, RTL и componentDisabled не скрывают разделитель.

Class/style и нативные атрибуты/события передаются корню. Bind:nativeElement
даёт HTMLDivElement после mount. RootClassName добавляет корневой класс.
ClassNames/styles принимают объект со слотами root/rail/content либо callback
({ props }) с нормализованными orientation/titlePlacement/size. Значения styles —
CSS-строки, как style остальных Svelte-компонентов. Root style имеет приоритет
над styles.root; без подписи styles.rail также применяется к корню.

Пример доступен на `/ant-design#divider`, изолированная фикстура — `?fixture=divider`.
SSR и Chromium-проверки покрывают aliases, ноль, snippets, варианты, размеры,
semantic slots, геометрию размещения, темы, RTL и узкий экран.
`ConfigProvider.theme.components.Divider` поддерживает textPaddingInline,
orientationMargin и verticalMarginInline, локальные alias-токены и algorithm.
Токен orientationMargin задаёт долю ширины rail. Тема применяется уже при SSR,
обновляется без замены DOM и предшествует semantic styles и пользовательскому style.
Нули, CSS-единицы, явный undefined и собственный cssVar.prefix сохраняются.
Проверки: [SSR](./tests/package/divider-theme.ssr.test.ts),
[browser](./tests/browser/divider-theme.spec.ts),
[эталон UMD](./tests/browser/fixtures/ant-design-divider-theme-reference.json),
фикстура `?fixture=divider-theme`.

Локальный prefixCls меняет BEM-классы корня, вариантов и потомков; пустой prefix
использует ant-divider. CSS variables и общий marker сохраняют прежние имена.
Собственный stylesheet из 27 правил добавляется при SSR и очищается при unmount.
Defaults ограничены владельцем, включая prefix, совпадающий с общим marker.

ConfigProvider.divider задаёт class/style и object/function classNames/styles.
Undefined наследует родительский record; явный объект, включая {}, заменяет его
целиком. Приоритет root styles: provider styles.root → provider style → local
styles.root → local style. Без подписи merged styles.rail идёт перед local style.
Callbacks получают прежние нормализованные props и могут вернуть undefined.
Prefix/config updates сохраняют nativeElement, DOM, фокус и состояние соседних полей;
строчный vertical Divider не добавляет пробелы. Проверки:
[SSR](./tests/package/divider-config.ssr.test.ts),
[browser](./tests/browser/divider-config.spec.ts),
[эталон UMD](./tests/browser/fixtures/ant-design-divider-config-reference.json),
фикстура `?fixture=divider-config`. Общий prefix ConfigProvider и React development
warnings ещё не перенесены.

Vendor/divider.css содержит 27 правил из закреплённого архива; рецепт divider
исключает интеграцию ColorPicker и воспроизводится через `npm run cli -- css`.
Рецепт divider-prefix выводит CSS data module для локального prefix из тех же правил.

## Flex

```svelte
<Flex gap="small" justify="space-between" wrap>
  <Button>Первое действие</Button>
  <Button>Второе действие</Button>
</Flex>
```

Flex не оборачивает детей; нативный component создаёт один корневой элемент. Children — Snippet;
без содержимого контейнер скрывается CSS-правилом :empty, как в Ant Design.
Orientation=horizontal/vertical имеет приоритет над vertical. В вертикальном
режиме без align используется stretch. Align/justify поддерживают значения,
для которых эталон генерирует классы; остальные CSS-настройки доступны через style.
Wrap принимает boolean или wrap/nowrap/wrap-reverse; false не добавляет класс.

Gap принимает small/medium/large, число в px или CSS-строку, включая
составной row/column gap. Preset-интервалы используют токены padding: 8/16/24px.
Ноль сохраняется. Flex принимает CSS shorthand либо число без единицы.
Числовой и произвольный CSS gap, а также flex имеют приоритет над одноимёнными
декларациями style. Preset gap задаёт CSS-класс, поэтому inline style имеет
приоритет: gap="small" со style="gap:99px" даёт 99px, gap={12} — 12px.
Component выбирает нативный HTML-тег (default=div) или Svelte-компонент; bind:nativeElement даёт
текущий HTMLElement и обновляется при смене тега. Class/rootClassName/style,
нативные атрибуты и события передаются корню. Собственные роли, tabindex,
reset шрифта и обработчики клавиатуры не добавляются. RTL меняет визуальное
направление, сохраняя DOM-порядок и нативный Tab.

Галерея — `/ant-design#flex`, отдельная фикстура — `?fixture=flex`.
SSR/Chromium-проверки покрывают структуру, направления, выравнивание, gap/flex,
перенос строк, пустое содержимое, смену тега, события, фокус, темы и RTL.
ConfigProvider.flex задаёт vertical/class/style. Undefined наследует record,
явный объект, включая {}, заменяет его целиком. Приоритет направления:
orientation → local vertical → provider vertical → horizontal. Provider style
идёт перед local style, затем применяются flex и custom gap; preset gap остаётся классом.
Локальный prefixCls меняет корень и все layout-классы; пустая строка выбирает ant-flex.
CSS variables сохраняют namespace, собственный stylesheet добавляется при SSR и
не меняет соседние Flex, включая prefix, совпадающий с private marker.

Пользовательский component получает атрибуты, события, class/style/dir и children
без дополнительного элемента. Class поддерживает стандартные Svelte ClassValue.
Layout props потребляются Flex. Дополнительные параметры проверяются через generic
FlexComponentProps; FlexProps остаётся расширяемым интерфейсом для прежних потребителей.
Для nativeElement custom root должен объявить `$bindable()` без fallback и связать
его с корнем; без forwarding Flex не подставляет найденный DOM-элемент.

```svelte
<!-- CustomRoot.svelte -->
<script lang="ts">
  import type { FlexRootProps } from 'antd-svelte';
  let { children, nativeElement = $bindable(), ...rest }: FlexRootProps = $props();
</script>

<section {...rest} bind:this={nativeElement}>{@render children?.()}</section>
```

`components.Flex` принимает alias overrides и algorithm; собственных component defaults
у upstream нет. PaddingXS/padding/paddingLG меняют preset gaps, а font/color reset не
добавляется. CSS-variable prefix настраивается независимо от BEM prefix.
Сверка с 33 официальными UMD-сценариями:
[browser](./tests/browser/flex-source.spec.ts),
[SSR](./tests/package/flex-source.ssr.test.ts),
[эталон](./tests/browser/fixtures/ant-design-flex-source-reference.json),
фикстура `?fixture=flex-source`. Live updates сохраняют custom state, DOM/ref,
фокус и selection; смена component заменяет корень, как в React.
Рецепты flex и flex-prefix воспроизводят 32 правила закреплённого CSS без reset типографики.
Общий prefix ConfigProvider остаётся в работе.

## Statistic

```svelte
<Statistic title="Баланс" value="123456.789" precision={2} suffix="₽" />
```

Value — число или строка (default=0). Встроенное форматирование повторяет
Ant Design Number.tsx: группа из трёх цифр, groupSeparator="," и decimalSeparator=".".
Precision дополняет нулями или обрезает дробную часть без округления; отрицательная
precision убирает её. Длинные числовые строки не преобразуются в number.
Пустая строка и .5 превращаются в 0 и 0.5; неподдержанная запись, например
"1e6", "-" или "1.", отображается как текст. Числа с JS-научной нотацией также
не разворачиваются. Formatter(value) получает исходный value и возвращает
строку, число или Snippet; его результат заменяет встроенное форматирование.

Title/prefix/suffix принимают string/number/Snippet, null или false. Ноль
отображается, пустые scalar-значения не создают узел. Snippet считается
присутствующим даже при пустом выводе. ValueRender — Snippet<[Snippet]>:
полученный snippet выводит готовый span значения, который можно обернуть.
ClassNames/styles поддерживают root/header/title/content/value/prefix/suffix
и callback ({ props }) с default value/loading/separators. Styles передаются CSS-строками; style перекрывает styles.root,
styles.content задаёт оформление значения. Bind:nativeElement даёт HTMLDivElement.

ConfigProvider.statistic задаёт общие class/style/classNames/styles для Statistic
и StatisticTimer. Классы config и local накапливаются. Root styles применяются
в порядке config.styles.root → config.style → local styles.root → local style;
остальные slots объединяются с приоритетом local. Оба callback получают те же
props с разрешёнными value/loading/separators. Undefined наследует родительский
statistic-record, любой собственный объект, включая {}, заменяет его целиком.

```svelte
<ConfigProvider statistic={{ class: 'metric', styles: { value: 'font-weight:600' } }}>
  <Statistic title="Баланс" value={1234.5} styles={{ value: 'color:green' }} />
</ConfigProvider>
```

Реактивная смена config и callback props сохраняет DOM корня, вложенные и соседние
провайдеры изолированы. Сверка: [26 исходных случаев и 4 обновления](./tests/browser/fixtures/ant-design-statistic-config-reference.json),
[браузерные метрики](./tests/browser/statistic-config.spec.ts),
[публичные типы и SSR](./tests/package/statistic-config.ssr.test.ts), `?fixture=statistic-config`.
Прежние Svelte defaults, native RTL direction и доступный loading Skeleton сохранены.

Локальный `prefixCls` меняет root и имена частей Statistic/Timer; пустая строка
возвращает ant-statistic. CSS variables сохраняют namespace Statistic, marker
ограничивает динамический CSS своим корнем. Соседние default-компоненты не меняются,
включая prefix, совпадающий с ant-statistic-content или ant-statistic-css-var.
Смена prefix сохраняет DOM корня, semantic styles, темы и native compact defaults.
Сверка: [22 исходных случая и 4 смены prefix](./tests/browser/fixtures/ant-design-statistic-prefix-reference.json),
[браузер](./tests/browser/statistic-prefix.spec.ts),
[CSS boundary](./src/lib/statistic-prefix.test.ts),
[публичный пакет и SSR](./tests/package/statistic-prefix.ssr.test.ts), `?fixture=statistic-prefix`.
Глобальный ConfigProvider.prefixCls пока не перенесён.

Loading сохраняет заголовок и заменяет content существующим Skeleton с active
и paragraph=false. Используются его доступный статус и служебные обёртки;
formatter и valueRender скрытого значения не вызываются. Statistic не добавляет
роль, tabindex или live region для обычного значения; их можно задать нативными
атрибутами. В RTL значение остаётся LTR, интервалы prefix/suffix логические.
Темы наследуют цвета; compact меняет title/content с 14/24px на 12/20px.

ConfigProvider.theme.components.Statistic задаёт titleFontSize/contentFontSize
также для обоих режимов Timer. Defaults рассчитываются из fontSize/fontSizeHeading3;
поддержаны числовой 0, строковый contentFontSize, alias tokens, глобальные
и компонентные algorithms, cssVar.prefix и вложенные providers.
Реактивная смена темы сохраняет содержимое, snippets, фокус и работу таймеров.
Переменные темы применяются перед styles.root/style; semantic styles сохраняются.
Отступ loading host берётся из собственной темы Skeleton, включая его
component aliases/algorithm; Statistic.padding не перекрывает этот отступ.
В эталоне 6.6.8 RTL class Statistic не задаёт direction в LTR-документе.
Svelte сохраняет существующий dir=rtl и LTR value; наблюдение записано в реестре.
Сверка: [официальные CSS tokens](./tools/fixtures/ant-design-statistic-tokens-reference.json),
[оформление normal/loading/Timer countup/countdown](./tests/browser/fixtures/ant-design-statistic-theme-reference.json),
[SSR](./tests/package/statistic-theme.ssr.test.ts) и
[browser](./tests/browser/statistic-theme.spec.ts), `?fixture=statistic-theme`.

Пример — `/ant-design#statistic`, фикстура — `?fixture=statistic`. Unit/SSR/Chromium
проверяют форматирование, loading, snippets, semantic styles, темы, RTL и фокус.
Рецепт statistic воспроизводит 14 правил vendor/statistic.css из закреплённого
архива; statistic-prefix выводит те же 14 правил CSS-модулем для локального prefixCls.

StatisticTimer переносит актуальный Statistic.Timer и требует type=countdown/countup;
Остальные props
Statistic, включая loading и semantic slots, передаются показателю, но formatter
и valueRender заменяются встроенным выводом времени, как в upstream.

Value — timestamp в ms либо строка, которую принимает new Date(value).
При пропущенном value отображение использует default=0 самого Statistic,
но callbacks получают NaN от исходной отсутствующей цели, как в upstream.
SSR и первый hydration render выводят `-` без часов и callbacks. После mount
таймер отображает разницу с Date.now(), обновляясь через setInterval(1000/60).
Format по умолчанию HH:mm:ss; Y/M/D/H/m/s/S обозначают фиксированные единицы
365 дней/30 дней/день/час/минута/секунда/ms. Повтор токена дополняет нулями,
текст в квадратных скобках сохраняется буквально. Это формат длительности,
не календарный formatter и не полный API dayjs. Пропущенные крупные единицы
накапливаются в следующей: HH может превышать 24.

Отображаемая разница ограничена нулём, onChange(number) получает исходную
знаковую разницу на каждом тике. В режиме countdown onFinish вызывается один раз на первом
тике строго после цели и останавливается; на точном равенстве времени не завершает
интервал. Countup не вызывает onFinish. При смене value/type интервал перезапускается,
смена format/callbacks не требует перезапуска. Loading скрывает значение, сохраняя
работу таймера. При удалении компонента интервал очищается; поздние callbacks
отменённого или заменённого запуска игнорируются. Невалидная дата сохраняет
поведение upstream (NaN в форматировании/callback, без автоматического завершения).
Bind:nativeElement даёт корневой div Statistic. Фикстура — `?fixture=statistic-timer`.

## Segmented

```svelte
<Segmented options={['День', 'Неделя', 'Месяц']} bind:value={period} />
```

Options — строки/числа или объекты value/label/icon/title/tooltip/disabled/class.
Значения должны быть уникальными; число 0 и строка "0" различаются. Label —
строка, число или Snippet; icon — Snippet. Для icon-only задавайте title либо
aria-label option. Пустая строка рядом с icon не создаёт текстовый span и считается
icon-only; числовой 0 отображается. Интервал icon/label задаётся CSS margin.
Title по умолчанию берётся из scalar label без icon,
как в Ant Design. ClassNames/styles поддерживают root/item/label/icon, объект
либо callback ({ props }); styles — CSS-строки. Style перекрывает styles.root.

ConfigProvider.segmented задаёт class/style и classNames/styles всех четырёх slots.
Undefined наследует родительский record; явный record, включая {}, заменяет его
целиком. Slot classes объединяются context → local; root styles идут в порядке
context styles.root → context style → local styles.root → local style.
Callbacks могут возвращать undefined. Они сохраняют существующие native props:
generated name и defaults disabled/block/vertical; size остаётся локальным prop,
даже при наследуемом componentSize. Глобальный callback типизирован для разных
value/options и не меняет выбор значения.
Сверка: [UMD](./tests/browser/fixtures/ant-design-segmented-config-reference.json),
[SSR](./tests/package/segmented-config.ssr.test.ts),
[browser](./tests/browser/segmented-config.spec.ts), `?fixture=segmented-config`.

ConfigProvider.theme.components.Segmented применяет все восемь компонентных
токенов: padding/фон track, обычный/selected/hover текст и фоны selected/hover/active.
Поддержаны числовой 0, строковая CSS-длина trackPadding, alias tokens,
глобальные и компонентные algorithms, cssVar.prefix и вложенные providers.
Тема обновляет размеры и состояния без сброса selection, focus или radio DOM;
изменение геометрии завершает существующий thumb через ResizeObserver.
Переменные темы идут перед semantic/user styles; native light/dark/compact
сохраняют прежние цвета и размеры.
Сверка: [официальные CSS tokens](./tools/fixtures/ant-design-segmented-tokens-reference.json),
[размеры и pseudo states](./tests/browser/fixtures/ant-design-segmented-theme-reference.json),
[SSR](./tests/package/segmented-theme.ssr.test.ts) и
[browser](./tests/browser/segmented-theme.spec.ts), `?fixture=segmented-theme`.

Value поддерживает binding, defaultValue читается при создании; без него выбран
первый option, даже disabled. Внешняя смена value не вызывает onChange(value).
Удаление выбранного option не исправляет значение; восстановление option
возвращает checked. Size наследует ConfigProvider, orientation имеет приоритет
над vertical; block и shape=round повторяют оформление эталона. Disabled влияет
на все radio, option.disabled — на один. Как Ant Design 6.6.8, Segmented не
наследует ConfigProvider.componentDisabled; передавайте disabled явно.

Внутри radiogroup — нативные label/input[type=radio]/div label. Name общий
для inputs и уникален между экземплярами по умолчанию. Корень имеет tabindex=0,
если не disabled; native Tab также достигает выбранного radio. Стрелки циклически
выбирают enabled options в порядке массива независимо от RTL и направления.
Смена по стрелке подавляет второе нативное переключение и переводит фокус
на выбранный radio. Bind:nativeElement даёт корневой div.

Сохраняется upstream-контракт FormData: у radio нет value-атрибута, поэтому
выбранный enabled option отправляет "on" под name. Типизированное значение
получайте через binding/onChange. Native reset не меняет модель и не вызывает
onChange; checked после reset приводится к текущему value. Интеграция с FormItem
и сериализация option.value не добавляются скрыто.

Галерея — `/ant-design#segmented`, фикстура — `?fixture=segmented`.
Рецепт segmented воспроизводит 38 правил vendor/segmented.css; цвета адаптированы
к существующим темам, размеры используют токены controls. Изучена зависимость
@rc-component/segmented 1.4.0 (commit 8cbec0b3a0a4097b683a55b39b565ea1e249b47f),
её npm-архив сверяется по опубликованному SHA-512 и хранится только в .upstream.
При смене значения между существующими видимыми options создаётся штатный thumb.
Layout-геометрия labels (offset/client, без повторного применения CSS scale)
измеряется после обновления DOM; Web Animations API перемещает
индикатор с duration/easing токенов. Во время движения сохраняется selected-text,
а обычный selected фон возвращается после завершения. Повторная смена отменяет
предыдущий запуск. ResizeObserver, смена оси/RTL, изменения options и удаление
компонента очищают animation/observer; reduced motion пропускает либо завершает
движение. SSR не создаёт thumb, observers или animations.

Option.tooltip принимает строку либо props существующего Svelte Tooltip без
children. Поддержаны hover/focus/Escape, в том числе для disabled option.
Локальный Tooltip добавляет служебный span с display:contents и native popover;
label остаётся flex-item для block и измерений thumb. Пользовательский tooltip.style
может переопределить display; это меняет компоновку по явному выбору владельца.
Локальный prefixCls меняет классы корня, options, icon и thumb и подключает
извлечённый CSS для этого префикса. Пустая строка использует ant-segmented.
Имена CSS variables и общий marker сохраняются; defaults ограничены собственным
корнем. Смена префикса сохраняет radio, значение, фокус и ref, отменяя старый thumb;
при unmount удаляется локальный stylesheet. Поддержаны native и token themes,
размеры, block/round, vertical/RTL, disabled, semantic styles и option Tooltip.
Сверка: [UMD](./tests/browser/fixtures/ant-design-segmented-prefix-reference.json),
[SSR](./tests/package/segmented-prefix.ssr.test.ts),
[browser](./tests/browser/segmented-prefix.spec.ts), `?fixture=segmented-prefix`.
Глобальный ConfigProvider.prefixCls пока отсутствует.

## Grid: Row, Col и breakpoints

```svelte
<Row gutter={[16, 8]}>
  <Col xs={24} md={12}>Первая колонка</Col>
  <Col xs={24} md={12}>Вторая колонка</Col>
</Row>
```

Row/Col сохраняют нативные div и 24-колоночные CSS-классы Ant Design. Span=0
скрывает колонку, order/offset/push/pull задают порядок и логическое смещение.
Responsive props xs/sm/md/lg/xl/xxl/xxxl принимают число или объект ColSize.
Span в объекте и базовый span также принимают строку; строковый shorthand
breakpoint, например md="12", игнорируется как в реализации Col эталона.
ColSize поддерживает span/order/offset/push/pull/flex, включая нулевые значения
для сброса responsive свойств. Базовые order/offset/push/pull=0 не добавляют класс.

Row.gutter — число в px, CSS-строка, responsive map чисел либо пара [horizontal,
vertical]. Горизонтальный интервал даёт отрицательный margin-inline у Row и
половину padding-inline у Col; вертикальный использует row-gap. Вложенный Row
создаёт независимый контекст. Wrap=false добавляет nowrap; Col с flex также
получает min-width:0. Flex=number даёт n n auto, auto — 1 1 auto, строка с px/em/
rem/% — 0 0 размер, остальные строки передаются как CSS shorthand. Row.style
перекрывает рассчитанные margin/gap, Col.style — padding/flex; responsive flex
CSS-переменные записываются после style, как в upstream.

Align=top/middle/bottom/stretch и justify=start/end/center/space-around/
space-between/space-evenly принимают responsive maps. Breakpoints: xs<576,
sm≥576, md≥768, lg≥992, xl≥1200, xxl≥1600, xxxl≥1920. В CSS Col класс xs —
базовый без media query, а Row выбирает xs-map только при фактическом совпадении
xs. Побеждает наибольший активный breakpoint с заданным значением.

При SSR Row не выбирает responsive align/justify, но gutter при неизвестной
ширине выбирает наибольший заданный breakpoint (поведение useGutter эталона).
После mount media queries обновляют Row; Col адаптируется CSS без JS/hydration.
CreateBreakpoint заменяет React Grid.useBreakpoint явной Svelte-моделью:
`const breakpoint = createBreakpoint();` и
`$effect(() => breakpoint.connect(window));`. Реактивное breakpoint.screens
при SSR равно {}, подключение публикует карту семи MediaQueryList, cleanup
удаляет listeners и игнорирует запоздалые события. Breakpoint.connected сообщает
наличие подключения; повторный connect завершает предыдущее.
Необязательный второй аргумент connect(view, mediaQueries) задаёт полную карту
семи запросов; без него используются прежние стандартные пороги Grid.

Оба компонента поддерживают class/style, нативные атрибуты/события,
bind:nativeElement и RTL без изменения DOM-порядка. Галерея — `/ant-design#grid`,
фикстура — `?fixture=grid`. Рецепт grid извлекает 1043 правила с исходными media
scopes и без keyframes. Unit/SSR/Chromium проверяют gutters, вложенность, ширины,
границы media, нулевые reset-значения, CSS units, RTL и cleanup.
Theme.components.Grid применяет aliases и algorithms к Row/Col, включая
fontSize/fontFamily, вложенные provider и custom cssVar prefix. Собственных defaults
у Grid нет. Component variables ставятся перед прежними gutter/flex/style layers;
локальный style сохраняет приоритет. Обновления сохраняют Row/Col refs, slots,
редактируемое значение, focus/selection и responsive layout.
14 тем / 140 CSS-состояний UMD сверяются в
[browser](tests/browser/grid-theme.spec.ts), declarations —
в [unit](src/lib/theme-grid-tokens-reference.test.ts), серверная граница —
в [SSR](tests/package/grid-theme.ssr.test.ts). Fixture `?fixture=grid-theme`.

Глобальные theme.token.screen* задают Row observer, а screen*Min — Col media CSS.
Пороги могут различаться: между screenSMMin и screenSM меняется ширина Col,
но Row ещё не выбирает sm gutter/align/justify. Сохраняются source validation
порядка порогов и безусловные xs column styles. Пользовательские media работают
при SSR без JavaScript и обновляются после mount; nested/reset/sibling providers
изолированы, включая одинаковый cssVar.key и hashed=false. Стандартный режим
и createBreakpoint().connect(window) без явных queries сохраняют прежние пороги.
5 конфигураций / 126 состояний на свежих pages эталона сверяются в
[browser](tests/browser/grid-breakpoints.spec.ts); загрузка CSS в обоих порядках
без JavaScript — [отдельно](tests/browser/grid-breakpoints-ssr.spec.ts).
Source не обновляет Row/Col layout при смене глобальных порогов после mount,
хотя публичные tokens уже изменились. [Наблюдение](tests/browser/fixtures/ant-design-grid-breakpoints-update-observation.json)
сохранено; Svelte обновляет обе части без потери DOM и состояния slot input.

PrefixCls ещё не подключён.
В CSS-variable режиме эталон записывает components.Grid.screen*Min в CSS variables,
но Col media queries продолжают использовать глобальные thresholds. Это
[наблюдение](tests/browser/fixtures/ant-design-grid-media-observation.json) сохранено;
declarations сами по себе не заявляют изменения media layout.

## Masonry

Masonry переносит Ant Design 6.6.8: Masonry/MasonryItem, usePositions/useDelay/
useRefs и style. Изучены @rc-component/motion 1.3.3 (^1.3.3),
@rc-component/resize-observer 1.1.2 (^1.1.2) и @rc-component/util 1.14.0 (^1.14.0).
Используются native ResizeObserver/RAF и CSS transitions без React dependencies;
[лицензии motion](./src/lib/vendor/LICENSE.rc-motion),
[resize-observer](./src/lib/vendor/LICENSE.rc-resize-observer) и
[util](./src/lib/vendor/LICENSE.rc-util) включены в пакет.
Точные Props, semantic callbacks и тип данных — в
[исходных объявлениях](./src/lib/masonry.types.ts).

```svelte
<script lang="ts">
  import { Masonry } from 'antd-svelte';

  const items = [100, 60, 120, 80].map((height, index) => ({ key: index, data: height }));
</script>

<Masonry {items} columns={{ xs: 1, sm: 2, md: 3 }} gutter={[12, 24]} fresh>
  {#snippet itemRender({ data, index, column })}
    <div style={`height:${data}px`}>
      Карточка {index + 1}, колонка {column + 1}
    </div>
  {/snippet}
</Masonry>
```

Корневой children принимается и игнорируется, как в React PropsWithChildren;
для ячеек используются items. Items появляются после mount; SSR выводит пустой div
с высотой 0, не вызывает renderer или onLayoutChange и не читает DOM. ItemRender — snippet
с данными item, исходным index и текущим column. Item.children принимает scalar
или snippet без аргументов и имеет приоритет над renderer, включая false, 0 и
пустую строку. Поле item.height, как в реализации эталона, не задаёт CSS-высоту:
размер определяет содержимое, а раскладка читает getBoundingClientRect().height.

Элементы обрабатываются в исходном порядке. Следующий попадает в самую короткую
колонку; при равенстве выбирается первая. Item.column закрепляет колонку и
ограничивается сверху columns - 1. Числовые columns не округляются: 0/NaN
выбирают default 3, отрицательные и дробные значения сохраняют RangeError
исходника. Для responsive map используется наибольший совпавший breakpoint;
если совпадений нет — xs, затем 1. Поддерживаются xs/sm/md/lg/xl/xxl/xxxl из Grid.

Одиночный числовой gutter действует по обеим осям, пара разделяет horizontal и
vertical. Каждая ось принимает responsive map. Нижнего gutter после последнего
элемента нет. Хотя общий тип Row.gutter допускает CSS-строку, Masonry эталона
не преобразует её: horizontal участвует в `${value}px`, vertical — в JS-сложении
с высотой. Используйте числа или responsive maps чисел для рабочей геометрии.

Root наблюдается всегда. Fresh дополнительно наблюдает ячейки; без fresh смена
их содержимого сама по себе не запускает замер. Новый массив items, columns,
resize root и захваченные load/error вызывают RAF-замер с объединением событий.
Resize dedup использует floored rect и offset sizes, но для раскладки сохраняется
дробная DOM-высота. При unmount observers/listeners/frames очищаются, поздние
observer microtasks не обновляют состояние.

OnLayoutChange сообщает элементы с исходными полями и вычисленным column.
Сравнение соответствует util isEqual: одинаковые данные и распределение не
вызывают повторный callback. Результат можно записывать обратно в item.column,
как в upstream demo. Функции/snippets сравниваются по ссылке. Ключи должны быть
уникальны после String(key): CSSMotionList использует строковые ключи, тогда
как geometry map сохраняет исходный number/string key.

CSS-рецепт masonry воспроизводит все 12 правил эталона, без keyframes, с
проверкой SHA-256. Appear/leave используют исходные CSS classes и два RAF до
active. Удаляемая ячейка остаётся до собственного transitionend/animationend;
события вложенного содержимого её не удаляют. Возврат того же key сохраняет DOM
и отменяет удаление. Если браузер не создал собственную анимацию, phase завершается
после обновления CSS. Это сохраняет удаление при нулевой длительности, когда
upstream без deadline остаётся в leave-active. Наблюдение записано в реестре.

Bind:nativeElement заменяет React MasonryRef. Перестановка сохраняет native draft,
focus и selection input/textarea, а также selection остающихся contenteditable
узлов; внешний фокус не перехватывается. RTL использует inset-inline-start без
изменения DOM-порядка и column в данных. Controls содержимого сохраняют свою
нативную семантику, Masonry не добавляет собственную keyboard navigation.

ConfigProvider.masonry задаёт class/style/classNames/styles; явно заданный
nested config заменяет родительский объект целиком. Semantic callbacks получают
resolved columns. Root style идёт после semantic root и может перекрыть height;
геометрия ячейки идёт после semantic item. Light/dark и CSS variables наследуются.
Components.Masonry поддерживает alias overrides и algorithms; собственных
component tokens в 6.6.8 нет. Шрифт меняет измеренные высоты: с fresh ячейки
пересчитываются, без fresh сохраняют старый layout до load/error/resize либо смены
items/columns. Обновления сохраняют DOM, refs, draft/selection/focus и не создают
повторный onLayoutChange, если распределение и данные не изменились.
Theme.token.motion=false завершает текущий appear/leave и удаляет без ожидания end;
повторное включение не перезапускает appear уже видимых ячеек.

В 6.6.8 Source Masonry вычисляет ant-masonry-css-var, но пропускает этот класс на
корне: font/alias настройки не доходят до CSS. Native marker сохранён; для сверки
эталон получает его через публичный rootClassName без изменения исходников.
Исходные значения без marker и зависший zero-duration leave сохранены в
[эталоне](./tests/browser/fixtures/ant-design-masonry-theme-reference.json).
PrefixCls пока не перенесён. В закреплённом CSS нет отдельного reduced-motion override.

Fixture — `?fixture=masonry`. Engine, SSR, DOM lifecycle, package SSR и browser
проверяют геометрию, breakpoints, fresh/load/error, данные/callbacks, motion,
focus/selection, semantic/config, темы, RTL и cleanup.

## Splitter

Splitter переносит размеры панелей, drag/lazy, collapse и оформление Ant Design
6.6.8. Изучены Splitter/SplitBar/Panel, hooks, demos и tests, а также
@rc-component/resize-observer 1.1.2, util 1.14.0 и Ant Design icons 6.3.4
(icons-svg 4.6.0). Точные Props и callbacks — в
[исходных объявлениях](./src/lib/splitter.types.ts).

```svelte
<script lang="ts">
  import { Splitter } from 'antd-svelte';
</script>

{#snippet navigation()}<nav>Разделы</nav>{/snippet}
{#snippet content()}<article>Содержимое</article>{/snippet}

<Splitter
  style="height:320px"
  items={[
    { defaultSize: '30%', min: 120, collapsible: true, children: navigation },
    { min: '20%', children: content }
  ]}
/>
```

React Splitter.Panel declarations заменены массивом items с scalar/snippet
children: Svelte не предоставляет синхронный разбор дочерних snippets до SSR.
Отдельного публичного SplitterPanel нет. Панели сохраняются по позиции, как в
upstream; key не участвует в их идентичности. DefaultSize читается при создании
Splitter. Если size задан хотя бы у одной панели, вся группа становится
controlled, а defaults остальных панелей не используются. Для controlled
режима записывайте предложенные размеры обратно в items[].size.

Числа задают px, строки с % — долю контейнера. Остаток делится между панелями;
при изменении контейнера размеры нормализуются с исходными правилами min/max.
Полностью заданные размеры сохраняют пропорции с поправкой на ограничения;
несовместимые ограничения не имеют отдельного error callback. В ненулевой группе
размер 0 остаётся collapsed даже при min > 0; если все размеры равны 0, группа
делится поровну. Orientation имеет приоритет над boolean vertical,
по умолчанию horizontal.

Mouse и одиночный touch считают смещение от начала gesture. Normal drag
вызывает onResizeStart, onResize и onResizeEnd; end сообщает текущие размеры,
поэтому при controlled rejection возвращает исходную геометрию. Lazy показывает
preview и вызывает onResizeEnd с предложением только при release, без onResize;
controlled lazy принимает размеры в onResizeEnd. RTL меняет знак horizontal
drag. Как в закреплённом SplitBar, lazy сначала ограничивает физическое смещение
по ARIA-границам, затем меняет знак для RTL; при несимметричных ограничениях это
может отличаться от normal drag. Вертикальное направление знак не меняет.

Collapsible задаётся у соседних панелей; его объект управляет start/end и
showCollapsibleIcon (true/false/auto). Collapse вызывает resize, resizeEnd, затем
collapse, сохраняет прежний размер и проверяет текущие ограничения при
восстановлении. Resizable=false блокирует drag, сохраняя collapse и double-click.
Скрытое содержимое остаётся в DOM; destroyOnHidden удаляет его, а одноимённое
поле панели переопределяет root. Collapsible.motion включает CSS transition,
который отключается на время drag и при prefers-reduced-motion.

Как в Ant Design 6.6.8, при destroyOnHidden=false свёрнутая панель только
обрезает содержимое: её controls остаются в Tab-порядке и доступном дереве.
Панель не получает inert или aria-hidden, фокус автоматически не переносится.
Это ограничение доступности upstream. DestroyOnHidden=true удаляет потомков;
после раскрытия они создаются заново, неконтролируемые значения сбрасываются.
Для сохранения значений при таком режиме храните их снаружи панели.

Разделитель сохраняет role=separator, ориентацию и числовые ARIA-границы; как в
эталоне, он не получает фокус и не имеет keyboard resize. Кнопки collapse —
native button type=button с Enter/Space и исходными английскими именами
Toggle start/end panel. Content controls сохраняют нативную семантику;
componentDisabled сам по себе не отключает Splitter. Bind:nativeElement заменяет
React ref. При unmount очищаются ResizeObserver и node/window listeners,
поздние события не вызывают callbacks.

SSR выводит панели и snippets без измерения, сохраняет исходные px/% и auto для
неуказанного размера. После mount ResizeObserver рассчитывает px; нулевой замер
не затирает последний размер. Смена orientation без изменения размеров root сама
по себе не запускает новый замер — это поведение закреплённого upstream.

ConfigProvider.splitter задаёт class/style и semantic root/panel/dragger;
nested config заменяет объект целиком. Root style идёт после semantic styles,
а вычисленные flex-basis/flex-grow панели — после её style. Dragger classes
принимают строку или default/active; как в upstream, из styles.dragger применяется
только default. Semantic callbacks получают resolved orientation/vertical.
Collapsible.icon задаёт иконки сворачивания; пустой объект сохраняет defaults.
Null/false icons оставляют пустой custom wrapper.

CSS-рецепт splitter воспроизводит все 59 правил эталона, включая reduced motion,
с проверкой SHA-256. Темы, primary и RTL наследуются; локальный hover alias bar
сохраняется для native темы, а в token theme bar наследует настроенные aliases.

ConfigProvider.theme.components.Splitter применяет splitBarSize, splitTriggerSize
и splitBarDraggableSize, включая 0; обычный splitBarDraggableSize равен 20.
Поддержаны global/component
aliases и algorithms, cssVar.prefix, undefined, вложенные/reset/sibling scopes.
Тематические переменные идут перед semantic/user styles. Реактивные изменения
сохраняют размеры панелей, draft/selection/focus и текущий lazy drag/preview.
Сверка: [UMD](./tests/browser/fixtures/ant-design-splitter-theme-reference.json),
[SSR](./tests/package/splitter-theme.ssr.test.ts),
[browser](./tests/browser/splitter-theme.spec.ts), `?fixture=splitter-theme`.
RTL-метрики измерены с явным dir=rtl на host; отдельно записано source-наследование
LTR без этого host. Существующий native direction провайдера сохранён.
Произвольный prefixCls пока не перенесён.

Fixture — `?fixture=splitter`. Engine, DOM lifecycle, SSR, package и browser
проверяют размеры, ограничения, callbacks, controlled/lazy, collapse, native
controls, touch, RTL, темы, semantic styles и cleanup.

## Layout

Layout, LayoutHeader, LayoutContent, LayoutFooter и LayoutSider соответствуют
Layout и его секциям Header/Content/Footer/Sider. Они сохраняют div/header/main/
footer/aside без дополнительных контейнеров. Children — Snippet, нативные props,
class/rootClassName/style и bind:nativeElement относятся к корню.

Layout.hasSider явно задаёт наличие sidebar; false отключает автоматическое
определение. На клиенте Sider регистрируется в ближайшем Layout; вложенные
Layout независимы. Snippet нельзя проинспектировать как React children до SSR,
поэтому автоматический SSR-ряд определяется CSS :has(> .ant-layout-sider),
а класс ant-layout-has-sider появляется после mount. Для серверного класса
передавайте hasSider=true. Это сохраняет геометрию до hydration и не вызывает
предварительного исполнения children. Явный false отключает CSS fallback.

Sider: width=200, collapsedWidth=80, defaultCollapsed=false, collapsible=false,
theme=dark. Число или числовая строка ширины получают px, другие CSS-строки
сохраняются. Calculated flex/max-width/min-width/width перекрывают style, как
в upstream; semantic styles.root идёт перед style, styles.body — на children.
ClassNames/styles принимают root/body, объект либо callback ({ props }).
Collapsed поддерживает binding; onCollapse(next, source) вызывается при клике
или responsive изменении с source=clickTrigger/responsive. Черновики/DOM children
сохраняются. Trigger — пассивный string/number/Snippet внутри нативной кнопки;
null скрывает кнопку. Для собственного интерактивного trigger используйте null
и внешний control, меняющий bind:collapsed. ReverseArrow меняет стрелку и сторону
zero-width trigger. CollapsedWidth=0 создаёт специальный переключатель; при
нулевой фактической ширине children становятся inert, фокус из них переносится
на trigger либо соседний доступный control. Это Svelte-адаптация доступности;
React Sider не блокирует невидимые focus targets через inert.

Breakpoint подписывает один MediaQueryList, сообщает начальное/изменённое
состояние через onBreakpoint и при необходимости вызывает onCollapse. Listener
очищается при смене breakpoint/unmount, запоздалые события игнорируются.
Порог берётся из Sider.tsx: xs=479.98, sm=575.98, md=767.98, lg=991.98,
xl=1199.98, xxl=1599.98, xxxl=1839.98px. Последнее значение отличается от
таблицы upstream docs (1920); эталоном оставлен код. Ни SSR, ни первый hydration
render не вычисляют media. Ручное раскрытие ниже порога сохраняется до следующего
media change. ComponentDisabled не отключает навигационный trigger.

Темы sidebar light/dark независимы от общей темы; light наследует container/text
токены текущего режима, dark сохраняет #001529. Compact использует меньшие control
tokens. Trigger поддерживает Enter/Space, aria-expanded/controls и locale.layout
expand/collapse, с expandLabel/collapseLabel override. Reduced motion отключает
переходы. Галерея — `/ant-design#layout`, фикстура — `?fixture=layout`; unit/SSR/
Chromium покрывают структуру, SSR без JS, callbacks, размеры, breakpoint/cleanup,
фокус, locale и темы. Рецепт layout извлекает 35 правил, включая Menu-интеграции.
ConfigProvider.theme.components.Layout поддерживает 16 актуальных токенов. Aliases, отдельный
algorithm и cssVar prefix/key применяются к Layout/Sider; секции внутри Layout
наследуют его переменные, включая CSS overrides в style. Semantic styles.root
идут перед style, вычисляемая
ширина Sider — последней. Смена темы сохраняет collapse, DOM, refs, фокус и черновики.
Отдельные Header/Content/Footer получают собственные переменные: в закреплённом
upstream standalone-секции остаются без Layout variables. Наблюдение и выбранное
поведение записаны в реестре; это отличие не переносится в Svelte.
ConfigProvider.layout задаёт общие class/style только для контейнеров Layout.
Классы config и local накапливаются; локальный style перекрывает общий, оба идут
после переменных темы. Undefined наследует родительский record; собственный объект,
включая {}, заменяет его целиком. Header/Content/Footer/Sider напрямую этот record
не получают. Обновление config сохраняет DOM, черновики, выделение/фокус и collapse.
Самостоятельные секции сохраняют native variables/RTL; исходные отличия записаны
в raw reference и учтены явно при сравнении.
В эталоне также зафиксирован сброс неизменившегося padding после удаления
локального paddingTop при React update; native строка стилей сохраняет отступ.

Layout.prefixCls и LayoutSider.prefixCls независимы; пустая строка возвращает
ant-layout и ant-layout-sider. Классы состояний, children и trigger следуют своему
prefix; namespace --ant-layout-* и общий marker ant-layout-css-var сохраняются.
Рецепт layout-prefix извлекает 35 правил, runtime выбирает свою группу Layout/Sider.
Native SSR-определение прямого Sider использует внутренние атрибуты; смена prefix
сохраняет DOM, ids/aria-controls, collapse, черновики, выделение и фокус.
Восстановление фокуса использует фактический DOM body и сохраняет явный выбор владельца.
LayoutHeader/LayoutContent/LayoutFooter принимают собственный literal prefixCls:
он задаёт полный класс секции, без добавления suffix. Пустая строка возвращает
стандартный класс. Префикс контейнера не меняет префиксы секций.
Общий prefix ConfigProvider ещё не перенесён.

Исходные коллизии prefix с Layout/Sider/variable classes и сохранённым CSS-кэшем
записаны в [raw reference](tests/browser/fixtures/ant-design-layout-prefix-reference.json).
Native markers защищают измеренные роли и соседние scopes; expected corrections
ограничены фоном, position и flex-direction известных alias cases. Замеры каждого
варианта получены в новом документе, transitions — отдельно в одном документе.
У секций upstream [свой дефект prefix](tests/browser/fixtures/ant-design-layout-section-prefix-observation.json):
Header/Content/Footer получают оформление контейнера; наблюдение сохранено для отдельного разбора.
Svelte сохраняет оформление своей секции, включая explicit default/shared prefix.
В [парных замерах](tests/browser/fixtures/ant-design-layout-section-prefix-reference.json)
raw custom-prefix сравнивается с обычной секцией в независимом документе upstream.
Текстовый контейнер эталона берёт font/color/line-height из его getDesignToken
для сверки с текстовым контекстом native provider.
Standalone fallback variables и border-box доступны до hydration, включая legacy
dark/compact; внутри Layout новые variables не объявляются и parent style наследуется.
Локальные style сохраняют приоритет; обновление prefix не заменяет controls и их drafts/selection.

## Descriptions

Descriptions отображает items: массив { key?, label?, children?, span? }.
Label/children/title/extra принимают string, number или Snippet; 0 отображается,
пустые значения не создают соответствующий wrapper. React Descriptions.Item
служит только JSX sugar; в Svelte используется items без предварительного
исполнения snippets. Корень — div, затем view/table/tbody/tr и нативные th/td;
bind:nativeElement возвращает div, нативные attrs передаются корню.

Column — число либо responsive map xs–xxxl; по умолчанию xs=1, sm=2,
md/lg/xl/xxl=3, xxxl=4. Пользовательская map проверяется от большего активного
breakpoint к меньшему; затем используется default map. При SSR screens={}
и column=3; media подключаются после mount и очищаются при unmount.
Span — число, responsive map либо filled. Переполнение ограничивается остатком
строки; последняя ячейка неполной строки растягивается на свободные колонки.
Filled завершает текущую строку и занимает оставшуюся часть. Входные items не
мутируются. Как в upstream, responsive перестройка строк может пересоздать
содержимое ячейки, переместившейся между строками; state таких controls храните
снаружи в модели.

Layout=horizontal по умолчанию; vertical создаёт отдельные строки labels/content.
Bordered=false, colon=true. В horizontal bordered label получает th/span=1,
content — td/span=2*span-1; vertical сохраняет span на обеих строках. Colon
управляет псевдоэлементом label только без рамки. Без явного size/componentSize
используется размер large; medium и small уменьшают отступы.
ComponentDisabled не меняет read-only поля.

ClassNames/styles поддерживают root/header/title/extra/label/content, объект
либо callback ({ props }) с разрешёнными column/items/size. У items есть
class/style и classNames/styles.label/content.
Приоритет label/content: root semantic style → item semantic style. В bordered
эти стили относятся к th/td и перекрывают item.style; без рамки — к внутренним span. Style корня идёт после styles.root.
Вложенные таблицы сохраняют собственные bordered/size и не получают row-стили
внешней таблицы. Темы/RTL наследуются через ConfigProvider.

ConfigProvider.descriptions задаёт class/style и object/function classNames/styles
для тех же semantic slots. Классы context/local объединяются; root style layers:
context semantic → context style → local semantic → local style. Для ячеек общий
semantic слой идёт перед item semantic styles. Явный вложенный
record, включая {}, заменяет родительский; undefined наследует его. Обновления
сохраняют editor/focus/selection и FormData первой ячейки при смене column/size.
Фикстура — `?fixture=descriptions-config`,
[браузерная сверка](./tests/browser/descriptions-config.spec.ts) сохраняет raw UMD
classes/tags/colspan/computed styles; проверка классов учитывает состав и количество.

Callbacks сохраняют прежние native bordered=false, layout=horizontal и colon=true
при отсутствии этих props. У upstream raw mergedProps они отсутствуют; наблюдение
записано отдельно в [эталоне](./tests/browser/fixtures/ant-design-descriptions-config-reference.json).
Column/items/size разрешены в обоих вариантах.

ConfigProvider.theme.components.Descriptions применяет все десять компонентных
токенов, включая цвета title/extra/label/content, фон label, отступ заголовка,
ячеек и двоеточия. Значения рассчитываются из общих alias tokens; поддержаны
глобальные и компонентные algorithms, cssVar.prefix, вложенные providers
и обновление после mount. Переменные темы идут перед semantic/user styles.
Сохраняются исходные правила 6.6.8: bordered использует labelBg и общий
colorTextSecondary вместо labelColor, а размеры и рамка могут перекрывать
itemPaddingBottom/itemPaddingEnd собственными отступами.
Сверка: [официальные CSS tokens](./tools/fixtures/ant-design-descriptions-tokens-reference.json),
[варианты и responsive spans](./tests/browser/fixtures/ant-design-descriptions-theme-reference.json),
[SSR](./tests/package/descriptions-theme.ssr.test.ts) и
[browser](./tests/browser/descriptions-theme.spec.ts), `?fixture=descriptions-theme`.

Галерея — `/ant-design#descriptions`, фикстура — `?fixture=descriptions`.
Unit/SSR/Chromium проверяют раскладку, media, приоритет стилей и вложенность.
Рецепт descriptions извлекает 40 правил без keyframes, включая две интеграции
Table expanded-row. PrefixCls и произвольные breakpoints пока не поддержаны
и остаются в полном объёме миграции.

## Card

Card, CardGrid и CardMeta соответствуют Card/Grid/Meta эталона 6.6.8. Слоты
title/extra/cover/actions и Meta.avatar/title/description принимают text/number/
boolean/Snippet; 0 и true считаются присутствующими, но boolean не выводит текст.
Children Card/Grid — Snippet. Все три компонента поддерживают нативные attrs,
class/style и bind:nativeElement; Card дополнительно rootClassName.
Корни остаются div, actions — ul/li/span с равными долями ширины. Интерактивный
контент actions задавайте нативными buttons/links; hoverable не добавляет роль
button или клавиатурную активацию контейнеру.

Пустой Card не создаёт body. Loading заменяет только children на активный
Skeleton без title с четырьмя строками; header/cover/actions остаются. State
заменённого содержимого уничтожается, как в upstream. Если фокус был внутри
body, он паркуется на body (tabindex=-1, aria-busy); unmount передаёт его соседнему
control. Это доступная Svelte-адаптация поверх исходной разметки.

Variant=outlined/borderless. Hoverable
по умолчанию false, type=inner меняет header/body. Small наследуется из явно
заданного ConfigProvider.componentSize; medium/large используют
обычную геометрию. По умолчанию small body/header padding равен 12px;
остальные размеры/цвета используют theme/compact tokens.
ClassNames/styles Card принимают root/header/body/extra/title/actions/cover,
Meta — root/section/avatar/title/description, объект либо callback ({ props }).
Style корня перекрывает styles.root; styles.header/body оформляют header/body.
Meta root следует тому же приоритету.

ConfigProvider.card задаёт variant, class/style и те же semantic classNames/styles;
ConfigProvider.cardMeta независимо настраивает Meta через class/style и semantic
slots. Классы context/local объединяются. Стили корня: context semantic → context
style → local semantic → local style; переменные темы идут перед ними.
Явный вложенный record, включая {}, заменяет соответствующий родительский целиком;
undefined наследует его. Обновления сохраняют editors, focus/selection, FormData,
выбранную вкладку и существующие callbacks. Фикстура — `?fixture=card-config`,
[проверки](./tests/browser/card-config.spec.ts) используют неизменённый UMD 6.6.8.

Semantic callbacks Card сохраняют прежние native defaults: loading/hoverable=false
и tabProps={} при отсутствии этих props. Raw source mergedProps оставляет их
undefined; size/variant разрешены в обоих случаях. Это отличие записано в
[эталоне](./tests/browser/fixtures/ant-design-card-config-reference.json)
отдельно от CSS-сценариев с явно заданными flags.

ConfigProvider.theme.components.Card применяет все 13 компонентных токенов
эталона, включая bodyPadding/bodyPaddingSM, headerHeight/headerHeightSM,
headerBg и actionsBg. Defaults пересчитываются из aliases и component algorithm;
вложенные providers, inherit=false, dark/compact и реактивные изменения изолированы.
Переменные темы идут перед semantic/user styles. Grid/Meta наследуют scope Card;
padding Grid использует paddingLG, а не bodyPadding, как в upstream.
Настройки theme.cssVar описаны в [справочнике темы](docs/reference/theme-context.md).

CardGrid по умолчанию hoverable=true и width=33.33%; style переопределяет ширину.
Card определяет только прямые Grid внутри body. При SSR CSS :has сохраняет
геометрию до mount, затем direct-child MutationObserver обновляет класс
ant-card-contain-grid; listener очищается, отложенные callbacks игнорируются.
Для точного SSR-класса и начального loading с Grid задавайте containGrid=true;
false отключает auto detection. Это адаптация непрозрачного Snippet вместо
React children inspection. Флаг сохраняется во время загрузки уже показанного
Grid. Meta вне Card не подключает самостоятельные стили, как в upstream.

TabList задаёт заголовки Tabs, а body остаётся children Card; выбор поддерживает
bind:activeTabKey/onTabChange. DefaultActiveTabKey (включая пустую строку) имеет
приоритет над tabProps.defaultActiveKey. Label задаёт заголовок, включая
явные null/undefined. Размер вкладок large или small по размеру Card;
tabProps.size переопределяет его. Card переопределяет tabProps items/class/onChange/
tabBarExtraContent; остальные поддерживаемые Tabs props передаются. Верхний
activeTabKey имеет приоритет над tabProps.activeKey. TabBarExtraContent поддерживает
правый слот либо { left, right }. Клавиатура и fallback ключей следуют ранее
согласованному Svelte Tabs; полный React Tabs API пока не перенесён.

Галерея — `/ant-design#card`, фикстура — `?fixture=card`; unit/SSR/Chromium
проверяют стили, слоты, Grid, загрузку/фокус и вкладки. Рецепт card извлекает
59 правил без keyframes. Компонентные темы отдельно сверяются с UMD 6.6.8 в
`tests/browser/card-theme.spec.ts`, фикстура — `?fixture=card-theme`.
PrefixCls
и отсутствующие возможности Tabs остаются в полном объёме миграции.

## Breadcrumb

Breadcrumb использует nav/ol/li и items: { key?, title?, href?, path?, menu? }.
Title/separator/dropdownIcon принимают string/number/boolean/Snippet. Snippet
title должен быть пассивным; для собственных интерактивных элементов используйте
itemRender. Default title=0 отображается как "0", true — как "true" после
строкового преобразования upstream; null/undefined/false/пустая строка пропускают
item без menu. Нативные props, class/rootClassName/style и bind:nativeElement
относятся к nav. Имя landmark задавайте через aria-label/aria-labelledby.

Path удаляет один начальный slash, подставляет каждый params[key] один раз и
добавляет сегмент к предыдущим path: href="#/" + paths.join('/'). Пустые сегменты
сохраняются; URL encoding не выполняется. Path перекрывает href только на самом
item с path; item с одним href не добавляет сегмент. Title подставляет все
совпадения :key, но falsy parameter оставляет исходный текст. Эти особенности
взяты из getPath/getBreadcrumbName 6.6.8.
React children sugar Breadcrumb.Item/Separator заменён массивом items.

Separator берётся из local prop, ConfigProvider.breadcrumb.separator, затем "/";
null/undefined переходят к следующему уровню, false/"" отключают
автоматический разделитель. { type:'separator', separator? } создаёт отдельный
aria-hidden li, даже при отключённых автоматических разделителях; его default
также "/". Как в исходнике, последний видимый item может сохранить разделитель,
если после него есть пустые items. Последний href не удаляется автоматически.
Aria/data атрибуты item и class передаются default a/span/button. OnClick без
href создаёт нативную кнопку type=button вместо clickable span upstream.

ItemRender — Snippet<[route, params, originalItemsOrRoutes, paths]>, который
полностью задаёт содержимое li. Paths содержит накопленный префикс текущего item.
Шаблон непрозрачен для родителя: пустой Snippet сохраняет li; React callback с
null мог удалить его. В custom menu template задайте свой нативный trigger.
ClassNames/styles поддерживают root/item/separator, объект либо callback ({ props });
ConfigProvider.breadcrumb задаёт общие class/style и semantic defaults. Классы
накапливаются; root style слои идут после component variables: context semantic,
context plain, local semantic, local plain. Item/separator styles применяются на li.
Callbacks получают resolved separator и прежние native defaults остальных Props:
в частности, params={} при отсутствии prop. Исходное отсутствие params в callbacks
сохранено отдельно в [raw reference](tests/browser/fixtures/ant-design-breadcrumb-config-reference.json).
Конкретный тип params и itemRender сохраняется; config принимает те же semantic
callbacks, что локальные Props.
Item.style в закреплённом BreadcrumbItem.tsx не применяется; сохранено поведение
кода, для стилей элемента используйте styles.item либо itemRender.

Menu.items принимает key/title/label/path/disabled/danger/onClick. Label имеет
приоритет над title; truthy path конкатенируется с разрешённым href родителя без
добавления slash. Raw menu.items.href сам по себе не создаёт ссылку в upstream
и здесь не используется; навигацию задаёт path. DropdownProps передаются текущему
Svelte Dropdown с placement=bottom по умолчанию. DropdownIcon берётся из local
prop, ConfigProvider.breadcrumb.dropdownIcon, затем используется обычная стрелка;
null/undefined переходят к следующему уровню, false скрывает её, 0 отображается.
Нативные links меню сохраняют href и
поддерживают Enter/Space, callback/preventDefault, typeahead и disabled. Это
адаптация прежнего плоского Dropdown; произвольные React Menu options ещё не
поддержаны. Тема/compact/RTL наследуются через ConfigProvider.

Undefined component config наследует родительский record; явно заданный объект,
включая {}, заменяет его целиком. Смена стилей, separator/icon и items сохраняет
ключевые DOM nodes, native href, фокус и callbacks. Иконки и разделители могут
быть Snippet; существующая нативная обёртка Dropdown сохраняется.

Обёртка Dropdown внутри пункта Breadcrumb сохраняет базовую линию текста
соседних links/span/button, в том числе при переносе цепочки и custom itemRender.
Это локальное правило Breadcrumb; шрифты и выравнивание отдельного Dropdown
не меняются.
Ссылки Breadcrumb во всех режимах темы используют linkDecoration,
linkHoverDecoration и linkFocusDecoration, по умолчанию none. Reset ограничен
компонентом; inline стили ссылок имеют приоритет, оформление внешних links не меняется.
В menu с custom itemRender внешняя обёртка не добавляет остановку Tab;
возврат фокуса после Escape направляет его в первый доступный нативный control
этого пункта.

При source-настройках темы `components.Breadcrumb` получает семь исходных defaults:
цвета пунктов, ссылок, последнего пункта и разделителей, размер иконок и отступ
разделителя. Поддержаны aliases, component algorithms, CSS prefix/hash,
нули и undefined. Цвет стрелки меню наследуется от пункта, цвет текста ссылки
задаётся отдельно; custom dropdownIcon и semantic styles сохраняют этот порядок.
Semantic root styles и plain style имеют приоритет после component tokens.
Popup использует собственные Dropdown/Menu scopes. Обновление темы сохраняет
нативные ссылки, фокус, навигацию и callbacks; native-only оформление сохранено.

Галерея — `/ant-design#breadcrumb`, фикстуры — `?fixture=breadcrumb`,
`?fixture=breadcrumb-theme` и `?fixture=breadcrumb-config`.
Unit/SSR/Chromium покрывают маршруты, параметры, разделители, шаблон, стили,
меню, отмену перехода и production hydration. Рецепт breadcrumb извлекает 21
правило без keyframes. PrefixCls и полный Menu API остаются в полном объёме миграции.

Raw reference сохраняет полный textContent исходника. Сверка текста использует
видимые trigger/separator fragments: закрытый native Dropdown сохраняется в DOM,
а пробелы между элементами Svelte не меняют содержимое пунктов.

## Anchor

`Anchor` содержит `items` с key/href/title/target/class, вложенными children,
replace и targetOffset; title принимает текст, число или Snippet. В horizontal
вложенные items не монтируются. Ссылки остаются
нативными a: Tab и Enter работают без дополнительного keyboard engine.

```svelte
<Anchor affix={false} showInkInFixed items={[
  { key: 'intro', href: '#intro', title: 'Введение' },
  { key: 'api', href: '#api', title: 'API', targetOffset: 48 }
]} />
```

По умолчанию Affix включён; `affix` принимает false/true или дополнительные
Affix props без offsetTop/target/children. getContainer возвращает окно
или HTMLElement и используется для scroll и Affix. Приоритет контейнера:
getContainer → ConfigProvider.getTargetContainer → window. Undefined во вложенном
provider сохраняет родительскую функцию; локальный prop имеет приоритет. `offsetTop`
задаёт закрепление; `targetOffset` переопределяет scroll offset, per-link
`targetOffset` имеет высший приоритет, включая 0. `bounds` по умолчанию 5px.
Выбирается наиболее близкий к границе уже достигнутый раздел; порядок items
не заменяет сравнение координат. Raw fragment после # не декодируется, пробелы
сохраняются; используется исходное регулярное выражение Ant Design.

`onClick(event,{title,href})` вызывается перед scroll. preventDefault отменяет
только изменение URL; выбор и анимация всё равно выполняются как в upstream.
Внутренние href используют history.pushState/replaceState (без :target эффекта),
HTTP(S) сохраняют нативный переход, при replace — location.replace.
Item.replace переопределяет общий replace.
`getCurrentAnchor(rawHref)` меняет визуальное выделение; onChange получает
исходный href. Повторная прокрутка с тем же mapped highlight не дублирует callback,
выбор другой raw ссылки сохраняет callback даже при одинаковом highlight.

Прокрутка использует исходную cubic easing длительностью 450ms. Во время
анимации scroll tracking приостановлен; повторный выбор той же ссылки не
перезапускает анимацию, другая ссылка отменяет предыдущую. Удаление компонента
снимает scroll listener и отменяет RAF. SSR не читает getContainer/DOM,
не выбирает active link и не закрепляет контент. Фокус остаётся на ссылке.

`classNames`/`styles` — объект либо функция от {props}, слоты root/item/itemTitle/
indicator. `ConfigProvider.anchor` задаёт общие class/style и semantic defaults.
Undefined наследует родительский record; явно заданный объект, включая {},
заменяет его целиком. Semantic classes накапливаются; root style слои идут после
component variables и вычисленного max-height: context semantic, context plain,
local semantic, local plain. Callback получает текущие Props с resolved direction;
прежние native defaults остальных Props сохранены. Class/rootClassName и
bind:nativeElement относятся к wrapper. `showInkInFixed` сохраняет исходный
класс ant-anchor-fixed при false/affix=false. Тема и RTL наследуются; horizontal
indicator использует offsetLeft/clientWidth и раскрывает активную ссылку
в scrollable ancestors как upstream.

Изменения semantic styles/classes сохраняют ссылки, фокус и callbacks и обновляют
геометрию индикатора. Runtime владеет top/height/left/width индикатора; изменение
его цвета сохраняет эти координаты. Обнаруженный upstream дефект пересчёта
сохранён [отдельно с raw замерами](docs/reference/anchor-indicator-observation.md).

Базовые отступы пункта Anchor — 4px по вертикали и 16px перед текстом.
У первого горизонтального пункта отступ по inline-оси нулевой; у вложенного
вертикального пункта padding-block равен paddingXXS / 2, обычно 2px.
Переменные отступов объявлены в том же CSS scope, который использует корень
компонента; пользовательский gap для разделения ссылок не требуется.

При source-настройках темы Anchor применяет `components.Anchor`: defaults берутся
из paddingXXS/padding, затем действуют component overrides и отдельный algorithm.
Source compact уменьшает inline-отступ до 8px; native-only compact сохраняет 16px.
Вложенный padding-block по-прежнему равен paddingXXS / 2, независимо от
linkPaddingBlock. Aliases меняют шрифт, цвета и границы; нули/undefined и custom
CSS prefix поддерживаются. Переменные доступны при SSR, semantic/plain styles
сохраняют приоритет. Source-ссылки используют linkDecoration/linkHoverDecoration/
linkFocusDecoration; по умолчанию подчёркивания нет.
Смена темы сохраняет ссылки, фокус, scroll и callbacks.

Для раскрытия ссылки сохранён framework-independent compute-scroll-into-view
3.0.2 (git 0c45c0afce9650b8cc96dd23ea8efdc90cbd32fe), удовлетворяющий ^3.0.2
делегата scroll-into-view-if-needed 3.1.0 (git
8ac397fc9119014eae13069615b16ef4e45b3d9f). Исходник находится в vendor,
единственное изменение алгоритмического файла — удаление неиспользуемого
catch binding; MIT-лицензии обоих пакетов сохранены рядом. Обёртка ограничена
опциями Anchor (if-needed/nearest и scroll margins); npm-зависимости не добавлены.
Сохранено ограничение делегата 3.0.2: отрицательный scrollLeft RTL-контейнера
не поддерживается при автоматическом раскрытии; нативная ручная прокрутка,
выбор и геометрия indicator доступны.
Глобальные component config и prefixCls ещё не перенесены.

Фикстура — `?fixture=anchor`, пример — `/ant-design#anchor`. Unit/SSR/Chromium
проверяют приоритеты offsets, callbacks/history, анимацию/cleanup, nested items,
RTL/indicator и production hydration. Source tokens и метрики проверяются
[по официальному UMD](./src/lib/theme-anchor-tokens-reference.test.ts) и
[в браузере](./tests/browser/anchor-theme.spec.ts). CSS-рецепт anchor содержит 22 правила.

Ссылки items используют linkDecoration/linkHoverDecoration/
linkFocusDecoration также без cssVar; defaults равны none. Пользовательские
переменные и inline styles.itemTitle сохраняют приоритет.

## Affix

`Affix` закрепляет содержимое относительно окна либо DOM-контейнера `target`.
`offsetTop`/`offsetBottom` — числа в px; без обоих используется top=0. При
одновременном выполнении обоих условий приоритет у top. Сравнения координат
округляются как в Ant Design 6.6.8. `onChange(affixed)` вызывается только при
переходе между fixed и обычным потоком, после начального измерения в браузере.
Контейнер выбирается через target → ConfigProvider.getTargetContainer → window.
Функция вызывается только в браузере; общий тип GetTargetContainer экспортирован.

```svelte
<script lang="ts">
  import { Affix, Button } from 'antd-svelte';
  let container = $state<HTMLDivElement>();
</script>
<div bind:this={container} style="height:200px;overflow:auto">
  <Affix target={() => container ?? null} offsetTop={8}>
    <Button>Действие</Button>
  </Affix>
  <div style="height:600px"></div>
</div>
```

`class`/`style` и нативные div-атрибуты относятся к внешнему узлу;
`rootClassName` применяется к внутреннему узлу только при закреплении.
`bind:nativeElement` возвращает внешний div. Через `bind:this` доступны
`updatePosition()` и `updatePosition.cancel()` — отмена очередного принудительного
измерения; scroll-очередь независима. ResizeObserver следит за внешним узлом
и непосредственными DOM-детьми контента. Обработчики слушают фактический target
и снимаются при смене target/удалении; очереди и наблюдатели также очищаются.

SSR не читает target/DOM и оставляет контент в потоке. При закреплении добавляется
пустой aria-hidden placeholder исходных размеров; контент не клонируется и не
перемонтируется, поля сохраняют value, focus и участие в FormData. Affix не
создаёт интерактивной роли и не перехватывает клавиатуру. Типографика, цвета
и RTL наследуются; z-index фиксированного узла берётся из CSS-переменной.

Source theme.components.Affix задаёт zIndexPopup и alias overrides/algorithm.
Default zIndexPopup равен глобальному zIndexBase + 10; число остаётся без единиц,
включая 0. Переменные и scope применяются к закреплённому внутреннему узлу;
обычный поток сохраняет шрифт контейнера. Изменения темы сохраняют DOM, ref,
поля и focus, не вызывая повторного onChange при неизменном fixed-состоянии.
Style внешнего узла и вычисленные top/bottom/width/height сохраняют назначение.
Source aliases, scopes и geometry проверяются в `?fixture=affix-theme`.

ConfigProvider.affix задаёт class/style внешнего узла: локальные class идут
первыми, style — после контекстного. Вложенный record заменяет настройки целиком;
undefined наследует, {} очищает. Локальный prefixCls меняет fixed class и CSS
selectors, сохраняя имена variables. Пустое значение возвращает ant-affix.
Prefix/theme/config updates сохраняют wrapper, fixed content, placeholder,
draft/selection/focus и onChange; динамический stylesheet очищается при reset
и unmount. Проверки — `?fixture=affix-config`.

Сохранены ограничения upstream: горизонтальная прокрутка не компенсируется;
при custom target слушается сам контейнер, поэтому перемещение контейнера
внешней прокруткой требует явного updatePosition. Null target или полностью
нулевой скрытый root сохраняют последнее состояние до следующего измерения.
Глобальный ConfigProvider prefix пока отсутствует. React ref заменён Svelte bind:this,
children — Snippet без React-клонирования.

GetTargetContainer поддерживает Window/HTMLElement, как runtime context upstream.
В props Ant Design 6.6.8 дополнительно заявлен ShadowRoot, но официальный UMD
вызывает отсутствующий getBoundingClientRect в Affix и Anchor. Эта ветка исключена
из нашего типа и записана для отдельного разбора. При смене общей функции native
Affix сразу меняет target/позицию и снимает старые listeners. Исходник сохраняет
старую позицию до явного updatePosition(); raw frames и корректное состояние после
этого публичного вызова сохранены в [эталоне](./tests/browser/fixtures/ant-design-target-container-reference.json).
Проверки наследования, приоритетов, href updates, refs/focus и cleanup —
`?fixture=target-container`.

Фикстура — `?fixture=affix`, пример — `/ant-design#affix`. Engine/DOM-тесты
проверяют округление, очереди, смену target и очистку; SSR/Chromium — нативный
контент, placeholder, размеры, callbacks и hydration. Vendor CSS воспроизводится
рецептом affix (6 правил) из закреплённого архива. Affix-prefix извлекает те же
правила в CSS data template для локального prefixCls; проверяются SHA-256,
scoped defaults, overlapping prefixes и независимый default sibling.

## Space

Space добавляет отдельный div.ant-space-item вокруг каждого элемента, а Flex
сохраняет children без wrappers. Для нескольких элементов используйте items:
readonly-массив string/number/Snippet либо { key, children }. Key сохраняет DOM
и state при перестановке. Children Snippet без items представляет одну группу;
его содержимое нельзя проинспектировать и разделить как React children.
Пустой items имеет приоритет над children и не создаёт root. Непустой массив
из одних пустых значений сохраняет пустой root, как исходник.

Boolean/null/undefined/пустые строки не создают item wrappers, 0 отображается.
Это учитывает React.Children, который нормализует оба boolean в null перед
rc-component/util.toArray. Snippet, ничего не отрисовавший, сохраняет wrapper,
скрытый CSS :empty; как React child component с null, он всё ещё участвует в
расчёте позиции разделителя. Separator задаёт span между renderable
entries, кроме последнего; falsy separator, включая 0, не создаёт span. Такой
separator не помечается aria-hidden автоматически: Snippet может содержать
собственный содержательный элемент.

Orientation имеет приоритет над явным vertical;
по умолчанию horizontal. Align=start/end/center/baseline, horizontal по умолчанию
center, vertical без align использует естественное stretch. Size выбирается из
локального prop, ConfigProvider.space.size и затем small; componentSize не участвует.
Поддержаны small/medium/large
либо число, tuple [horizontal, vertical]. Числовой 0 не создаёт inline gap,
NaN игнорируется. Wrap добавляет flex-wrap:wrap. Gap/wrap styles идут перед
styles.root и style: пользовательский inline style перекрывает также числовой
gap. Presets используют общие padding tokens, включая compact 4/8/16px.

Root — div с нативными attrs, class/rootClassName/style и bind:nativeElement.
ClassNames/styles root/item/separator принимают объект либо callback ({ props })
с разрешёнными size/orientation/align. Space не сбрасывает typography и наследует
тему/RTL. Галерея — `/ant-design#space`, фикстура — `?fixture=space`. Unit/SSR/
Chromium проверяют gaps, пустые значения, keyed DOM/фокус и production hydration.
Рецепт space извлекает 16 правил без Compact/Addon, reset и keyframes.
ConfigProvider.space задаёт size, class/style и object/function classNames/styles
для root/item/separator. Явный вложенный record заменяет родительский целиком;
undefined наследует, {} очищает. Semantic callbacks получают разрешённые
size/orientation/align и могут вернуть undefined. Порядок styles: gap/wrap →
provider styles.root → provider style → local styles.root → local style.
ConfigProvider.space не применяется к Compact/Addon.

```svelte
<script lang="ts">
  import { ConfigProvider, Space } from 'antd-svelte';
</script>

<ConfigProvider space={{ size: ['small', 'large'], styles: { item: 'color:#531dab' } }}
  theme={{ components: { Space: { paddingXS: 12 } } }}>
  <Space items={['Первый', 'Второй']} separator="|" />
</ConfigProvider>
```

Theme.components.Space принимает alias overrides и отдельный algorithm; собственных
component tokens в 6.6.8 нет. Preset gaps читают paddingXS/padding/paddingLG,
numeric gaps сохраняют inline priority, typography reset не добавляется. Поддержаны
именованные cssVar, нули/undefined и независимые provider scopes; обновление темы
или config сохраняет keyed DOM, черновики, выделение и фокус.
Произвольный prefixCls остаётся в полном объёме миграции.

### SpaceCompact и SpaceAddon

SpaceCompact соответствует Space.Compact: тот же items/children Snippet API,
один div без дополнительных item wrappers. Каждый item задаёт отдельный context
для первого/последнего элемента и размера. Для нескольких controls используйте
items; один children Snippet представляет одну позицию, как компонент React,
вернувший несколько узлов. Null/undefined/boolean удаляются из позиций, пустая
строка и 0 сохраняются, как rc-component/util.toArray без keepEmpty.

Size=small/medium/large, по умолчанию явно заданный componentSize;
приоритет control.size → Compact.size → ConfigProvider.componentSize. Block
включает width=100% и display=flex, иначе inline-flex. Orientation/vertical следуют приоритету Space. Нативные attrs, class/rootClassName/
style и bind:nativeElement относятся к root. Подключены Button, Input,
InputNumber и Select. Горизонтальные стыки используют логические углы и
перекрытие на lineWidth; vertical compact-стыки поддержаны для Button, как
в исходнике. Select сохраняет существующий внешний container: его радиусы
наследует внутренняя рамка. Keyed DOM и фокус сохраняются при перестановке.

Вложенный Compact получает крайние flags с учётом положения во внешней группе;
его собственный size снова разрешается из props/ConfigProvider, а не из размера
родительского Compact. Это соответствует Compact.tsx 6.6.8. Контекст остаётся
на Popup triggers, но сбрасывается внутри Modal/Drawer и содержимого Tooltip/
Popover/Dropdown. Общие ConfigProvider/Form contexts при этом не меняются.

SpaceAddon соответствует Space.Addon, использует div и children Snippet.
Variant=outlined/filled/borderless/underlined, default=outlined;
status=error/warning меняет границу/фон/текст. Disabled задаёт только внешний
вид: не наследуется из componentDisabled автоматически и не отключает children.
Размер берётся только из Compact context; вне Compact componentSize не меняет
Addon. Поддержаны нативные attrs, class/style и bind:nativeElement.

Фикстура — `?fixture=space-compact`, пример — `/ant-design#space`. Unit/SSR/
Chromium проверяют размеры, границы/RTL, вложенность, фокус, Popup isolation,
variants/status/disabled и hydration. Рецепты space-compact/space-addon/
input-number-compact извлекают 4/29/8 правил без keyframes. InputSearch использует
внутренний Compact с отдельными items для Input и кнопки. Состояние
Compact-интеграций остальных семейств описано в реестре.

## InputNumber

InputNumber редактирует `number | null` через `bind:value` и
`onValueChange(value)`. Очистка возвращает null, а `0` остаётся числом.
`defaultValue` фиксируется при создании отдельного control. При использовании
привязки задайте начальное число или null у владельца без defaultValue.

```svelte
<script lang="ts">
  import { InputNumber } from 'antd-svelte';

  let quantity = $state<number | null>(2);
</script>

<label for="quantity">Количество</label>
<InputNumber id="quantity" name="quantity" bind:value={quantity} min={0} max={99} step={1} precision={0} />
```

Компонент хранит редактируемый текст отдельно от числа. Промежуточные `-`,
`1.` и завершающие нули остаются в поле при наборе. Корректное число в пределах
min/max сразу обновляет модель; пустая строка обновляет её на null. Нечисловой
или выходящий за границы черновик не заменяет последнее принятое число.
Поддерживаются знак, десятичная точка и экспонента. DecimalSeparator задаёт другой
разделитель; без него прежний строгий parser не принимает запятую. Составной ввод IME публикует число
после compositionend.

Blur и Enter завершают редактирование: числовой черновик ограничивается
min/max и округляется с precision, нечисловой возвращается к последнему числу.
Precision задаёт от 0 до 100 знаков после точки; равные половины округляются
от нуля, например `1.005` с precision=2 становится `1.01`. Округление остаётся
внутри границ. Отображение дополняется нулями до precision. Если диапазон
не содержит числа с указанной precision, значение не меняется. Это обычный
JavaScript number; precision не добавляет произвольную числовую точность.

По умолчанию min/max равны Number.MIN_SAFE_INTEGER/Number.MAX_SAFE_INTEGER,
step равен 1. Дробный положительный step поддерживается без хвостов вроде
`0.30000000000000004` при сложении десятичных шагов. Неположительный или
нечисловой step заменяется на 1, нечисловые границы — на defaults; некорректная
precision игнорируется. При min > max изменение числа блокируется, очистка
остаётся доступной. Внешние value и изменения min/max не вызывают callbacks
и не ограничивают число автоматически. Выход за границы виден в оформлении;
NaN и Infinity отображаются как пустое значение без callback.

ArrowUp/ArrowDown и кнопки меняют число на step, сохраняя фокус в поле.
На границе недоступно движение наружу. `keyboard={false}` отключает стрелки,
`controls={false}` скрывает кнопки; эти настройки независимы. Enter завершает
ввод и сохраняет нативную отправку формы. `onkeydown` вызывается до обработки
клавиш; preventDefault отменяет её. Shift увеличивает шаг в десять раз.
Удержание кнопки повторяет изменение после 600ms с интервалом 200ms.
Колесо по умолчанию число не меняет; `changeOnWheel` включает его только для
сфокусированного поля. `changeOnBlur={false}` сохраняет черновик при blur;
Enter по-прежнему подтверждает ввод, в том числе при keyboard=false.
`oninput` и остальные нативные события получают DOM-текст; числовое значение
получайте через onValueChange.

Размеры small/medium/large, disabled и направление наследуются из
ConfigProvider. Явные props переопределяют наследование. Readonly задаётся
нативным `readonly` либо alias readOnly; disabled/readonly блокируют изменение числа и скрывают
кнопки. Status принимает error/warning и наследует ошибку FormItem.
Поддерживаются светлая/тёмная темы, основные цвета, компактный режим, RTL и
prefers-reduced-motion. Кнопки и сообщение нативной проверки локализуются
через `locale.inputNumber`; вложенный провайдер объединяет отдельные подписи.

Поле использует input с role=spinbutton и aria-valuenow/min/max. Доступное имя
задаётся label, FormItem либо aria-label/aria-labelledby; кнопки изменения
не добавляют остановки Tab. Нативные required и проверка числового черновика
работают в обычной HTML-форме. В Form правила модели управляют проверкой,
а FormItem передаёт id, name, required, статус, описание ошибки и blur/touched.
Передавайте `value={form.values.quantity}` и
`onValueChange={(value) => form.setFieldValue('quantity', value)}`.
Required считает `0` заданным значением, min/max сравнивают числа.

С name либо FormItem.name FormData содержит одно поле с канонической строкой
числа, например '1.2' для текста `1.20`, или '' для null. Disabled исключает
поле, readonly сохраняет его. Атрибут form связывает input и скрытое поле
с внешней формой. Нативный reset восстанавливает исходный defaultValue либо
null и обновляет привязку в следующей задаче без callback. Отменённый reset
сохраняет значение; удаление control отменяет ожидающую задачу. Reset модели
Form восстанавливает её initialValues и сбрасывает черновик, даже если число
осталось прежним.

StringMode переносит арифметику @rc-component/input-number 1.6.2 и mini-decimal 1.0.1:
значение и callbacks используют string/null, не теряя дробные разряды за пределами
safe integer. Step и границы могут быть строками; без заданных границ stringMode
не вводит safe-integer ограничение. Precision и дополнение до точности step
следуют исходному алгоритму. Для произвольной точности нужен BigInt; fallback
mini-decimal использует обычный Number с его ограничениями.

```svelte
<script lang="ts">
  import { InputNumber } from 'antd-svelte';
  let amount = $state<string | null>('1');
</script>

<InputNumber stringMode bind:value={amount} min="0" max="10" step="0.00000000000001" />
```

Опциональные formatter/parser разделяют текст и модель; parser может вернуть
строку для stringMode. Formatter получает строковое число и `{ userTyping, input }`.
Каретка восстанавливается после форматирования, без снятия выделения при фокусе.
OnChange получает тот же тип значения, что onValueChange, и вызывается перед ним;
onInput получает исходный текст после обновления модели. OnStep сообщает emitter
handler/keyboard/wheel, направление и offset; onPressEnter вызывается после commit.
Для отклонения обновлений владельцем используйте function binding с getter/setter.

Есть outlined/filled/borderless/underlined, mode="spinner", prefix/suffix и custom
иконки в controls. Контент принимает строки, числа и snippets. RootClassName
и nativeElement относятся к control; для внешней композиции используйте
SpaceCompact/SpaceAddon. ConfigProvider.inputNumber задаёт
variant, class/style и semantic slots. Локальные styles имеют приоритет.

Bind:inputElement возвращает input, bind:nativeElement — корень control, bind:ref —
proxy native input с nativeElement и focus({ cursor, preventScroll })/blur(). Методы
focus/blur доступны также через bind:this. Mouse callbacks с именами Ant Design
относятся к корню; нативные lowercase handlers сохраняют события input.
Публичные типы и JSDoc находятся в [input-number.types.ts](./src/lib/input-number.types.ts).

Обычный числовой режим сохраняет прежние native контракты выше: строгий parser,
finite number/null, safe-integer defaults, проверку формы и commit черновика.
Точность step не добавляет нули к отображению автоматически. Это явно отличается
от rc-input-number; stringMode использует исходный десятичный алгоритм.
Общий token engine, точное соответствие compact/focus цветов и React diagnostics/
PurePanel остаются пробелами переноса. Нативные кнопки и Svelte snippets заменяют
React spans/nodes. CSS-рецепт input-number-features извлекает 65 новых правил,
не перезаписывая прежние outlined/compact стили; арифметика сопровождается
[MIT mini-decimal](./src/lib/vendor/LICENSE.rc-mini-decimal).

Пример количества, цены и расчёта стоимости доступен на `/ant-design#input-number`.
Новые сценарии: `?fixture=input-number-features`,
[browser](./tests/browser/input-number-features.spec.ts) и
[package SSR](./tests/package/input-number-features.ssr.test.ts).

## ColorPicker

ColorPicker переносит Ant Design 6.6.8, @rc-component/color-picker 3.1.1,
FastColor 3.0.1 и gradient slider 1.1.1. Точные props и snippets описаны в
[color-picker.types.ts](./src/lib/color-picker.types.ts); методы Color — в
[color.ts](./src/lib/color.ts). React runtime в пакет не добавляется.

```svelte
<script lang="ts">
  import { ColorPicker, type ColorPickerProps } from 'antd-svelte';
  let color = $state<ColorPickerProps['value']>('#1677ff');
</script>

<ColorPicker value={color} onChange={next => { color = next; }}
  mode={['single', 'gradient']} showText allowClear />
```

Value принимает строку, объект Color из callback, null или массив `{ color, percent }`.
Color сохраняет точность HSV и alpha; повторный разбор строки может её потерять.
Пустое начальное значение очищено. Cleared отличается от прозрачного цвета;
clear сохраняет оттенок и насыщенность, а повторный clear не вызывает callbacks.
`onChange(color, css)` возвращает RGB/linear-gradient CSS независимо от format.
Заданные value/open/format управляются владельцем. Для обновления только после
drag передайте обработчик onChangeComplete; локальный preview до завершения
не меняет текст trigger. DefaultValue/defaultFormat читаются при создании.

Есть HEX sanitization, RGB/HSB inputs, Hue/Alpha и двумерный palette. Native handler
добавляет стрелки клавиатуры для saturation/brightness. Gradient mode поддерживает
добавление interpolated points, crossing, active color, drag deletion и исходный
keyboard Delete, включая удаление последних точек. Переход gradient → single →
gradient восстанавливает кеш, пока single color не изменён. DisabledAlpha сохраняет
исходное условие: текущий alpha учитывается при следующем изменении.

Presets принимают цвета/градиенты, ключи, label/snippet и initial defaultOpen.
ShowText может быть snippet с Color; children заменяет trigger. PanelRender получает
исходный panel snippet и `extra.components.Picker/Presets`, которые можно разместить
в своей композиции. ConfigProvider.colorPicker задаёт class/style, semantic slots
и arrow; локальный style имеет приоритет. Поддерживаются en/ru, alias locale.ColorPicker,
унаследованный размер, Compact, темы и RTL; внутренние цветовые дорожки всегда LTR.

Trigger, clear и presets — native buttons; popup использует native popover,
12 placement, click/hover, arrow/pointAtCenter и getPopupContainer. По умолчанию portal
находится в body; внутри native modal остаётся в dialog. CSS-переменные темы
переносятся общим механизмом с Tour. Локальная функция getPopupContainer имеет
приоритет над ConfigProvider.getPopupContainer; undefined использует provider.
Getter не вызывается до первого открытия. Escape возвращает фокус; outside закрывает
popup. DestroyOnHidden управляет сохранением черновиков;
portal, listeners и timers очищаются. Panel изолирует FormItem и Compact. Как upstream,
ColorPicker не добавляет скрытое поле в FormData; значение передаётся callbacks.

`ConfigProvider.theme.components.ColorPicker` поддерживает alias overrides и
component algorithms, dark/compact, cssVar prefix и вложенные темы. Собственных
public component tokens у ColorPicker 6.6.8 нет. Trigger и popup получают общую
тему; Popover, Collapse пресетов и поля сохраняют независимые темы и исходные
приоритеты CSS. Bright-state пресетов использует глобальный colorBgElevated.

Обновление темы сохраняет popup DOM/position, цвет, незавершённый HEX input,
caret/focus и раскрытие пресетов. Локальные и semantic styles сохраняют приоритет;
popup.root.color меняет внешний popup, содержимое сохраняет исходный colorText
reset. Проверки и 15 UMD-тем — [color-picker-theme](./tests/browser/color-picker-theme.spec.ts),
`?fixture=color-picker-theme`.

Остаются произвольный prefix CSS, полный rc-trigger overflow/motion API и React
development/PurePanel API. Native DOM и Svelte snippets заменяют React nodes/refs.
Извлечённый [CSS](./src/lib/vendor/color-picker.css) воспроизводится рецептом из 94 правил.
Логика сопровождается MIT [FastColor](./src/lib/vendor/LICENSE.fast-color) и
[rc-color-picker](./src/lib/vendor/LICENSE.rc-color-picker). Formatter/parser опираются
на [rc-input-number 1.6.2](./src/lib/vendor/LICENSE.rc-input-number).
Проверки: [engine](./src/lib/color-picker.engine.test.ts),
[package SSR](./tests/package/color-picker.ssr.test.ts),
[browser](./tests/browser/color-picker.spec.ts); fixture: `?fixture=color-picker`.

## Slider

По умолчанию Slider выбирает одно число через `bind:value` и `onValueChange(value)`.
`defaultValue` фиксируется при создании отдельного control и по умолчанию
равен 0. При привязке задавайте начальное число у владельца без defaultValue.
В одиночном режиме значение всегда числовое. Следующие положения описывают этот
сохранённый native API; режим `range` описан отдельно ниже.

```svelte
<script lang="ts">
  import { Slider } from 'antd-svelte';

  let volume = $state(40);
</script>

<label for="volume">Громкость</label>
<Slider id="volume" name="volume" bind:value={volume} min={0} max={100} step={5} />
```

Основой служит нативный input[type=range]. Нажатие на дорожку и перетаскивание
мышью или касанием меняют число сразу; выход указателя за границы ограничивает
значение. `onChangeComplete(value)` вызывается один раз после отпускания
указателя или завершения последовательности клавиш, если число изменилось.
Удержание клавиши может вызвать несколько onValueChange, но один
onChangeComplete при отпускании. Действие на уже достигнутой границе не
создаёт callbacks. Нативная пара input/change без pointer/key также
поддерживается. Для числовой модели используйте onValueChange, нативные
события остаются доступны через HTML props.

`onChange(next)` получает число перед обновлением `bind:value`; `onValueChange`
вызывается после. Этот alias не меняет сохранённые native правила завершения и
отмены действий. Deprecated onBeforeChange исключён; полная унификация lifecycle
с range пока остаётся отдельной задачей.

По умолчанию min=0, max=100, step=1. Число ограничивается границами и
выравнивается по ближайшему шагу от min; равные расстояния округляются
к большему значению. Дробные шаги вычисляются без накопления хвостов вроде
`0.30000000000000004`. Задавайте step так, чтобы он делил max - min.
Если деления нет, последняя достижимая ступень находится ниже max,
как у нативного range. Некорректный step заменяется на 1, нечисловые границы —
на defaults; max < min сворачивается в min. Равные границы дают фиксированное
значение без изменений и callbacks.

Scalar также поддерживает `marks`, `dots`, `step={null}`, `included` и `track`.
При наличии marks или step=null значение выравнивается общим с range алгоритмом
rc-slider: выбирается ближайший mark/step/min/max с исходным порядком разрешения
равных расстояний. При step=null доступны только marks и границы, даже если marks
нет. Dots добавляет визуальные деления и само не ограничивает значения.
Included=false убирает track и active marks/dots; track=false скрывает только track.
Подпись mark принимает текст, число, snippet или `{ label, style }` с CSS-строкой.
Marks — нативные кнопки: доступны Tab/Enter/Space и исключаются при disabled.
Изменение marks нормализует отображение и FormData без записи в owner и callbacks.
Отображаемые marks/dots используют тот же мост native presets, что и range;
обычный числовой Slider без делений сохраняет прежнее оформление.

Внешние value и изменения границ не вызывают callbacks и не изменяют состояние
владельца. Для отображения и FormData используется нормализованное число.
NaN и Infinity отображаются как min. При пользовательском изменении владелец
получает новое допустимое число.

Стрелки меняют число на один шаг, Home/End выбирают первую/последнюю
достижимую ступень, PageUp/PageDown — два шага. `keyboard={false}` отключает
эти клавиши, сохраняя мышь и касание. Нативный onkeydown вызывается первым;
preventDefault отменяет обработку. PreventDefault в onpointerdown отменяет
начало перетаскивания. Имя задаётся label, FormItem или aria-label/aria-labelledby;
aria-valuetext позволяет описать единицу измерения. Фокус остаётся у input,
а видимый бегунок показывает кольцо клавиатурного фокуса.

Orientation принимает horizontal/vertical.
Вертикальному Slider задайте высоту,
например `style="height: 160px"`; min по умолчанию находится снизу. Reverse
меняет направление. В RTL горизонтальный min находится справа; reverse
меняет это правило обратно. Вертикальное направление от RTL не меняется.
Стрелки следуют расположению: вправо двигает бегунок вправо, вверх — вверх;
в горизонтальном режиме вверх увеличивает число. Поддерживаются светлая/тёмная
темы, основные цвета, компактный режим и prefers-reduced-motion.

Disabled наследуется из Form/FormItem и ConfigProvider; disabled=false
переопределяет наследование. Disabled исключает input из Tab и FormData.
Смена владельца, диапазона или направления, отключение, потеря захвата,
blur и удаление control отменяют активное действие без позднего
onChangeComplete. Новое действие работает независимо от отменённого.
Слушатели и ожидающие reset освобождаются при удалении.

Scalar принимает исходные ariaLabelForHandle/ariaLabelledByForHandle,
ariaValueTextFormatterForHandle, ariaRequired, tabIndex и autoFocus, включая
первый элемент массивов handle props. Массив disabled использует только первую
отображаемую точку. AutoFocus фиксируется при mount; ref.focus()/blur() обращаются
к native input. TabIndex=[] исключает control из Tab, но сохраняет программный
фокус native input, в отличие от div без tabindex в rc-slider.

Для Form передавайте `value={form.values.volume}` и
`onValueChange={(value) => form.setFieldValue('volume', value)}`.
FormItem передаёт id, name, label, ошибку, описание и blur/touched.
Проверкой числа управляют правила Form: required принимает 0, min/max
сравнивают числа; нативный range всегда имеет значение. При ошибке Form
фокусирует input. Reset модели восстанавливает initialValues и отменяет
незавершённое действие, включая reset к прежнему числу.

Нативная FormData содержит одно поле с числом в строковом виде, включая '0'.
Атрибут form связывает control с внешней формой. Любой reset этой формы
отменяет активное действие. Если reset не отменён через preventDefault,
привязка получает исходный defaultValue с учётом текущих границ и шага
в следующей задаче, без callbacks. Отменённый reset сохраняет текущее число.

Галерея `/ant-design#slider` содержит Slider и InputNumber с одним владельцем
состояния. Числовое поле использует function binding; пустой ввод означает 0
и после blur отображается как 0. Применённая громкость обновляется после
завершения действия. Числовое поле не имеет name, поэтому FormData содержит
громкость один раз. Также показаны ориентация, reverse, disabled, проверка и reset.

Tooltip по умолчанию показывает число при наведении, фокусе и перетаскивании;
подсказка следует за видимым бегунком. `tooltip={{ formatter: (value) => value + '%' }}`
задаёт формат. `tooltip={false}`, `tooltip={{ open: false }}`, formatter=null
или результат formatter=null отключают подсказку и её описание. `open: true`
показывает её постоянно у доступного Slider. Также поддерживаются placement
и arrow, включая `{ pointAtCenter: true }`, а также boolean/object autoAdjustOverflow.
Это относится к single, активной подсказке range и закреплённым подсказкам всех
бегунков. По умолчанию положение top, для вертикального Slider — right, в RTL — left.
Escape скрывает подсказку, сохраняя фокус и число; следующее действие открывает
её снова. Disabled скрывает подсказку. Текст дополняет aria-describedby поля,
сохраняя help/ошибку FormItem. Числовые callbacks от показа подсказки не вызываются.
Поле tooltip.destroyOnHidden работает во всех
трёх режимах подсказок Slider. Правила приоритета и lazy SSR
такие же, как у самостоятельного Tooltip; по умолчанию содержимое сохраняется.

`ConfigProvider.theme.components.Slider` применяет все 18 исходных токенов к обоим
режимам и ориентациям. Например, `railSize: 6` задаёт горизонтальную высоту или
вертикальную ширину шкалы 6px. Поддержаны aliases, component algorithms, нули,
явный undefined и CSS-variable prefix. Обновление темы сохраняет значения, DOM,
фокус и callbacks; локальные root/semantic styles сохраняют приоритет.
Фокус native input оформляет видимый handle по source-токенам. Native-only темы
и интерактивные области input сохраняют прежнее поведение.
Подробнее: [токены Slider](./docs/reference/theme-context.md#токены-slider),
[SSR](./tests/package/slider-theme.ssr.test.ts),
[browser](./tests/browser/slider-theme.spec.ts), маршрут `?fixture=slider-theme`.

### Диапазон Slider

`Range` включает исходный multiple-handle API Ant Design 6.6.8 и
@rc-component/slider 1.1.1. Старые одиночные bind, normalization, callbacks,
native events и reset сохраняются. Точные интерфейсы:
[slider.types.ts](./src/lib/slider.types.ts) и
[slider-range.types.ts](./src/lib/slider-range.types.ts).

```svelte
<script lang="ts">
  import { Slider, type SliderRef } from 'antd-svelte';

  let interval = $state([20, 80]);
  let slider = $state<SliderRef>();
</script>

<Slider range bind:value={interval} bind:ref={slider} name="interval"
  ariaLabelForHandle={['Начало', 'Конец']} />
```

Значения сортируются в новую копию; внешний массив не меняется. Без value и
defaultValue создаются две точки у min. Null и [] оставляют диапазон пустым;
нажатие на дорожку восстанавливает две совпадающие точки. `SliderProps` по умолчанию описывает
одиночные callbacks; `SliderProps<true>` и `SliderRangeProps` описывают массив.
При прямом SSR-вызове TypeScript можно уточнить компонент как `Slider<true>`.

Range использует исходное выравнивание по step/marks/min/max rc-slider. Step=null
оставляет только marks и endpoints, включая max. Dots добавляет деления;
сам алгоритм выбора точки определяется step/marks. Marks принимает текст,
числа, snippets либо label/style. Интерактивные подписи — native buttons;
они доступны с клавиатуры и не отправляют форму. Included/track управляют
дорожками, а start/end подсветки определяются крайними значениями.

AllowCross по умолчанию true. Pushable задаёт минимальный разрыв и выталкивает
соседей; true использует step. Disabled принимает boolean или массив: выключенные
точки остаются неподвижными anchors. Любая выключенная отображаемая точка
отключает editable и draggableTrack; лишние элементы массива disabled не учитываются.
Range.draggableTrack двигает группу с сохранением расстояний и ограничением границ.

Range.editable добавляет точки по нажатию на дорожку и учитывает minCount/maxCount.
Delete/Backspace удаляет выбранную точку; перенос дальше 130px поперёк дорожки
помечает её для удаления. Editable имеет приоритет над draggableTrack; при
step=null перенос всей дорожки отключён. Во время пересечения сохраняется drag
identity; после завершения и keyboard crossing фокус следует новому индексу.

OnChange получает отсортированный массив перед обновлением bind:value;
onValueChange — после него.
Range вызывает onChangeComplete по navigation keyup и release
даже без изменения; Delete вызывает change без дополнительного complete.
Click mark завершает изменение сразу. Keyboard=false блокирует перемещение,
но сохраняет исходный callback keyup. Нативные input/change доступны отдельно;
для pointer/keyboard действий диапазона они отправляются после DOM update и
имеют isTrusted=false. Для числового массива используйте компонентные callbacks.

Каждый включённый native input отправляет своё значение под общим name;
FormData.getAll(name) возвращает диапазон. Id и связь label относятся к первому
input, form поддерживает внешнего владельца. Native reset восстанавливает
initial defaultValue с текущими границами и удаляет добавленные точки; без
defaultValue возвращаются две точки у min. Отменённый reset сохраняет значения.
Form/FormItem передают name/id, disabled, описание, ошибку и blur/touched.

Ref.focus()/blur() работают в обоих режимах; bind:nativeElement и
ref.nativeElement дают внешний div. При unmount очищаются pointer/touch listeners,
capture, reset timers и ref. SSR не измеряет DOM, не фокусирует controls и не
запускает callbacks/timers. Темы light/dark/compact и три существующих primary
переключаются через ConfigProvider. Direction/reverse и orientation
сохраняют исходные физические направления.

ConfigProvider.slider задаёт class/style и semantic slots обоих режимов.
ClassNames объединяются, styles применяются по порядку с приоритетом локального
слоя. Есть slots root/tracks/track/rail/handle.
Provider styles.root → provider style → local styles.root → local style.
Callback видит входные props и разрешённый disabled; проверяйте props.range
перед обращением к числовому/массивному value. Явный вложенный record заменяет
родительскую config целиком; undefined наследует её. Root style применяется после
theme variables и сохраняет приоритет при обновлении темы.
Сохраняется текущий SliderTooltipConfig: 12 placement, text formatter,
native popover и описание input. Контейнер выбирается в исходном порядке:
tooltip.getPopupContainer → ConfigProvider.getPopupContainer. Корневого getPopupContainer у Slider нет.
Полный SliderTooltipProps и исходное управление focus-open остаются частично
перенесёнными. Полный scalar lifecycle/callback API
ещё не закрыты; сохранены описанные выше native numeric/form/event contracts.

Локальный `prefixCls` меняет BEM-классы обоих режимов, tracks, marks/dots и handles.
Пустой prefix, как и undefined, выбирает `ant-slider`. Для собственного prefix
stylesheet из 54 исходных правил добавляется уже при SSR; defaults ограничены
владельцем и не меняют соседние Slider. CSS variables сохраняют пространство
Slider, а `theme.cssVar.prefix` настраивает их независимо от BEM-классов.
Смена prefix сохраняет DOM, refs, значения, фокус и callbacks.

Все подсказки получают исходный classNames.root `${prefix}-tooltip` с разрешённым prefix, включая
active и pinned range. Собственный `tooltip.prefixCls` остаётся независимым;
при стандартном Tooltip prefix применяется исходный reset min-width контейнера.
Native disabled по-прежнему скрывает подсказки даже при open=true; upstream в этом
случае оставляет принудительно открытую подсказку. При сверке RTL учитывается
унаследованный DOM dir, который задаёт Svelte ConfigProvider.

Prefix: [SSR](./tests/package/slider-prefix.ssr.test.ts),
[browser](./tests/browser/slider-prefix.spec.ts),
[эталон UMD](./tests/browser/fixtures/ant-design-slider-prefix-reference.json),
маршрут `?fixture=slider-prefix`.

Scalar source API: [SSR](./tests/package/slider-scalar.ssr.test.ts),
[browser](./tests/browser/slider-scalar.spec.ts),
[эталон официального UMD](./tests/browser/fixtures/ant-design-slider-scalar-reference.json),
маршрут `?fixture=slider-scalar`. Проверяются также semantic config, ARIA, native
focus/form/reset и отсутствие callbacks при обновлении marks.

Проверки: [engine](./src/lib/slider-range.engine.test.ts),
[public SSR](./tests/package/slider-range.ssr.test.ts),
[browser](./tests/browser/slider-range.spec.ts) и `?fixture=slider-range`.
Новый [CSS](./src/lib/vendor/slider-range.css) воспроизводится рецептом из 54 правил;
прежний [slider.css](./src/lib/vendor/slider.css) сохранён. Перенесённая логика
снабжена [MIT rc-slider](./src/lib/vendor/LICENSE.rc-slider).

## Tooltip

```svelte
<script lang="ts">
  import { Button, Tooltip, type TooltipRef } from 'antd-svelte';

  let open = $state(false);
  let tooltipRef = $state<TooltipRef>();
</script>

<Tooltip title="Сохранить изменения" bind:open bind:ref={tooltipRef} placement="top">
  <Button>Сохранить</Button>
</Tooltip>
```

Title принимает строку, число, boolean, пассивный Snippet, вложенные массивы или null.
Legacy `overlay` приоритетнее title, кроме title=0; falsy overlay использует title.
Boolean не создаёт текст: true и пустой массив позволяют открыть пустую подсказку,
false и NaN без fallback отключают её. Snippet рендерится внутри изолированного
popup-контекста; его пустоту компонент не определяет заранее. Пустая строка,
пробелы, undefined и null сохраняют native подавление показа и связи описания;
это отличается от whitespace и controlled empty title upstream. Число 0 отображается.
Текст экранируется.
Children — snippet с одним основным DOM-элементом, например Button, Input или
нативной кнопкой. Этот элемент служит anchor и получает aria-describedby.
Wrapper сохраняет обработчики дочернего элемента и не добавляет остановку Tab;
для клавиатурного доступа используйте фокусируемый дочерний элемент.
Hover работает и вокруг disabled Button; disabled ConfigProvider не отключает
объясняющую подсказку.

`bind:open` передаёт видимость владельцу; без привязки компонент хранит её сам.
DefaultOpen задаёт начальное состояние. `onOpenChange(open)` вызывается при
пользовательском открытии/закрытии; внешнее изменение open и начальное состояние
не вызывают callback. Как и другие bindable props модуля, open следует модели
Svelte; для синхронизации владельца используйте bind:open.

`disabled` скрывает подсказку и её open class, сохраняя raw open. Trigger-события
и ожидающий mouseEnterDelay продолжают менять это состояние и вызывать
onOpenChange, как в rc-trigger. Изменение самого disabled не вызывает callback;
повторное включение может показать уже открытую подсказку. ConfigProvider.disabled
по-прежнему не отключает объясняющий Tooltip.

`id` задаёт ID popup; пустая строка использует стабильный автоматически созданный
fallback. При fresh=false скрытый ID кэшируется вместе с содержимым и обновляется
при открытии. Существующая native связь aria-describedby сохраняется также при
закрытии; disabled снимает только собственную связь Tooltip. Описания владельца
не удаляются при смене ID или отключении.

`zIndex` задаёт inline z-index popup, включая 0 и отрицательные значения.
Provider root styles и local styles.root идут после него;
без prop сохраняется тематический zIndexPopup. Настройки передаются single/range
Slider и ellipsis Tooltip Typography. В Typography disabled вычисляет сам ellipsis
и перекрывает значение из tooltip options, как в upstream. Общий source zIndex
context и порядок native top layer этим prop не меняются.

`bind:ref` выдаёт TooltipRef после mount и очищает его при unmount. NativeElement
указывает на основной DOM trigger, включая SVG; popupElement — на существующий
native span shell. Getters отражают замену trigger и перенос popup в контейнер.
Shell доступен также до первого открытия и при destroyOnHidden: исходный lazy div
и его удаление не подменяют согласованный native lifecycle.

`tooltipRef?.forceAlign()` пересчитывает открытый popup текущим контроллером
placement/arrow/overflow. После изменения разметки вызовите его после `await tick()`
либо в `$effect`. Метод не создаёт дополнительный animation loop, не открывает
закрытый или уничтоженный popup и не вызывает onOpenChange; DOM, ввод, фокус и
выделение сохраняются. Прежнее автоматическое отслеживание anchor продолжает работать.
Вызовы в одном turn объединяются в одну microtask, как в rc-trigger; возвращаемое
значение — void. Императивный вызов не подписывает `$effect` на внутреннее состояние Tooltip.

Как в исходном interface, TooltipProps не содержит ref; полный тип Svelte-компонента
с binding доступен через `ComponentProps<typeof Tooltip>`. Сверка DOM/ref и layout:
[четыре UMD-сценария](./tests/browser/fixtures/ant-design-tooltip-ref-reference.json),
[SSR](./tests/package/tooltip-ref.ssr.test.ts) и
[browser](./tests/browser/tooltip-ref.spec.ts), `?fixture=tooltip-ref`.

Trigger без component config по умолчанию `['hover', 'focus']`; можно выбрать одно
событие или передать пустой массив для программного показа. MouseEnterDelay и mouseLeaveDelay
задаются в секундах, по умолчанию 0.1. Фокус открывает подсказку сразу. Pointer
с типом touch не имитирует hover. На подсказку можно перевести указатель, она
остаётся видимой; клик по ней сохраняет фокус. Escape и нажатие снаружи закрывают
её. После Escape она остаётся скрытой до нового наведения/фокуса. В Modal первый
Escape закрывает Tooltip, следующий — Modal.

`showAction` и `hideAction` независимо заменяют события открытия и закрытия из
trigger, в том числе при trigger=[]. Undefined возвращает соответствующий набор
trigger; пустой массив отключает только выбранное направление. `focusDelay` и
`blurDelay` задаются в секундах, по умолчанию 0, независимо от mouse delays.
Если событие закрытия отключено, blur/leave не отменяет ожидающее открытие;
сама замена списка событий также не сбрасывает уже запущенную задержку.

При явных action overrides hover без click добавляет touch отдельно для каждого
направления, как в rc-trigger. Touchstart переключает разрешённое направление,
последующие hover-события подавляются до обработанного click. Source config
также использует этот touch fallback; прежний native default без новых actions
сохраняет подавление touch hover. Для явных overrides закрытие снаружи происходит
по mousedown/contextmenu и только при hide click/contextMenu либо неявном touch;
hideAction=[] отключает его. Escape продолжает закрывать открытую подсказку.
Настройки работают также в ellipsis Tooltip Typography; его видимость по-прежнему
зависит от измеренного усечения, а onOpenChange сообщает raw open.
Controlled-сверка использует getter/setter binding с отклонением записи владельцем;
обычный open сохраняет прежнюю Svelte-семантику, описанную выше.
Native blur без relatedTarget проверяет доступность trigger в следующей microtask,
чтобы удаление focused DOM не вызывало callback. Это граница синхронного callback
rc-trigger; переход фокуса с relatedTarget сохраняет его исходное время вызова.
Сверка: [54 UMD-сценария / 310 кадров](./tests/browser/fixtures/ant-design-tooltip-actions-reference.json),
[SSR](./tests/package/tooltip-actions.ssr.test.ts) и
[browser](./tests/browser/tooltip-actions.spec.ts), `?fixture=tooltip-actions`.

По умолчанию содержимое скрытой подсказки сохраняется. `fresh=false` фиксирует
последнее открытое содержимое и semantic class/style внутреннего container;
`fresh=true` обновляет их также при закрытом popup. При открытии всегда применяется
текущее значение. Массивы сохраняются снимком, включая вложенные значения.
Внешние root/arrow styles и наследуемые CSS-переменные продолжают обновляться.
Кэш фиксирует выбранный Snippet, но реактивные значения и эффекты внутри него
продолжают работать по правилам Svelte: полный React.memo для opaque captures
не воспроизводится. Политика fresh передаётся в ellipsis Tooltip Typography
и single/range Slider; Typography сохраняет поддержку bigint и whitespace.

DestroyOnHidden=true без forceRender удаляет содержимое при закрытии и создаёт заново при открытии:
DOM-состояние и состояние вложенного
компонента сбрасываются. Смена destroyOnHidden у открытой подсказки сохраняет
её DOM, ввод и фокус; включение удаления у закрытой без forceRender сразу очищает содержимое.
При включённом удалении SSR не вызывает title snippet, включая начальный open/defaultOpen.
Прежний скрытый native shell и его ID/ARIA сохраняются; default SSR остаётся eager.
Это также работает в ellipsis Tooltip Typography и подсказках Slider.
Удаление следует native закрытию без ожидания исходной CSS motion.

`forceRender=true` заранее монтирует скрытое содержимое после hydration и вызывает
getPopupContainer, даже без открытия и при disabled. При destroyOnHidden=true оно
сохраняет скрытое содержимое; выключение forceRender у закрытой подсказки удаляет
его. Новый force mount получает текущий payload, затем действует fresh cache.
ForceRender не открывает popup и не вызывает onOpenChange. Native shell сохраняется;
SSR при destroyOnHidden остаётся lazy, portal getter на сервере не вызывается.
Сверка: [19 UMD-сценариев и четыре consumer traces](./tests/browser/fixtures/ant-design-tooltip-lifecycle-reference.json),
[SSR](./tests/package/tooltip-lifecycle.ssr.test.ts) и
[browser](./tests/browser/tooltip-lifecycle.spec.ts), `?fixture=tooltip-lifecycle`.
У active range Slider сохраняется существующий один native shell до выбора ручки;
исходная conditional composition не подменяет его lifecycle.

Жизненный цикл сверяется с
[44 UMD-сценариями / 224 кадрами](./tests/browser/fixtures/ant-design-overlay-lifecycle-reference.json),
[SSR](./tests/package/overlay-lifecycle.ssr.test.ts) и
[browser](./tests/browser/overlay-lifecycle.spec.ts), `?fixture=overlay-lifecycle`.
Эталоны получены с отключённой motion из runtime CSS официального UMD.
Исходное lazy mount до первого открытия записано отдельно: существующий native
SSR и eagerly mounted default content остаются согласованной границей.
Title/overlay и fresh дополнительно сверяются с
[24 UMD-сценариями содержимого и 80 кадрами кэша](./tests/browser/fixtures/ant-design-tooltip-content-reference.json),
[SSR](./tests/package/tooltip-content.ssr.test.ts) и
[browser](./tests/browser/tooltip-content.spec.ts), `?fixture=tooltip-content`.
Исходные motion/UniqueProvider и оставшиеся delegated props ещё требуют переноса.

Placement принимает top/bottom/left/right, topLeft/topRight/bottomLeft/bottomRight
и leftTop/leftBottom/rightTop/rightBottom. Направления физические и не меняются
при RTL. Arrow=false скрывает стрелку. Arrow={{ pointAtCenter: true }} привязывает
tip стрелки к центру trigger. Угловые варианты с pointAtCenter=false или arrow={{}}
сохраняют исходную привязку к краю. Локальные object arrow и object autoAdjustOverflow включают исходный
расчёт всех 12 направлений, включая shift центральных вариантов. Без object props
у четырёх прежних вариантов сохраняются
переворот в сторону с большим местом и сдвиг внутри viewport.
Угловые варианты используют исходные points, visibleFirst и flip по обеим осям
без сдвига вдоль края. Выбранный flip сохраняется до закрытия; после открытия
расчёт начинается заново. AutoAdjustOverflow=false отключает переворот и сдвиг.
Положение обновляется при прокрутке, resize и перемещении anchor, пока подсказка
открыта. Class и style относятся к wrapper.

`align` накладывается поверх выбранной записи placements; вложенный `overflow`
заменяется целиком. `builtinPlacements` заменяет всю автоматическую карту, включая
пустой объект. Points задают точки popup/target; offset считается относительно popup,
targetOffset — относительно target. Поддержаны числа, проценты и строки через
parseFloat, включая исходную трактовку `5px` как числа 5. TooltipAlignConfig также
содержит htmlRegion, dynamicInset/_experimental.dynamicInset и autoArrow.
UseCssRight/useCssBottom/useCssTransform/ignoreShake сохраняются в metadata,
но rc-trigger 3.10.1 их не использует.

Класс placement выбирается по первому совпадению points в текущей карте: возможен
пользовательский ключ или отсутствие класса. Стрелка использует итоговые points;
semantic styles.arrow и styles.root сохраняют приоритет над координатами.
Новые align/builtinPlacements/onPopupAlign включают исходную геометрию и gap также
без source-настроек; прежние defaults без этих props сохраняются.

`onPopupAlign(node, info)` получает реальный popup и итоговые points после flip,
до применения новых координат. Он вызывается при открытии, фактическом изменении
геометрии и явном forceAlign; запросы forceAlign в одном turn объединяются.
Прежнее native отслеживание anchor продолжает работать, callback не вызывается
на каждом неизменившемся animation frame. SSR и закрытый popup не вызывают callback.
Настройки передаются Typography и single/active range/pinned range Slider.
Сверка: [38 UMD-сценариев](./tests/browser/fixtures/ant-design-tooltip-align-reference.json),
[числовой движок](./src/lib/tooltip-align-reference.test.ts),
[SSR](./tests/package/tooltip-align.ssr.test.ts) и
[browser](./tests/browser/tooltip-align.spec.ts), `?fixture=tooltip-align`.
Размеры box заданы явно для проверки геометрии; native fixed/top-layer и viewport
ограничения сохраняются, полный CSS-transform/scroll-container clipping здесь не заявлен.

При source-настройках ConfigProvider панель использует Tooltip tokens: maxWidth,
zIndexPopup, offsets и форму стрелки, включая component aliases/algorithm.
Отступ от anchor рассчитывается по глобальным sizePopupArrow и marginXXS, как
в исходном Tooltip: обычно 12px со стрелкой и 4px без неё. Угловые варианты
используют эти source defaults и без source-настроек; у четырёх прежних вариантов
в native-темах сохраняется отступ 8px. Object arrow/autoAdjustOverflow используют
source gap и глобальный borderRadius даже без source-настроек. Component aliases
меняют оформление стрелки, но не её исходную привязку. Подробности — в
[описании темы](./docs/reference/theme-context.md#токены-всплывающих-панелей).

Поверхность использует нативный `popover="manual"` в верхнем слое браузера.
Без container getter DOM остаётся на месте: overflow не обрезает её, контекст темы и
модальность dialog сохраняются. Нужен браузер с Popover API, как для фильтров Table.
Скрытый или находящийся за пределами viewport anchor скрывает поверхность;
при возвращении anchor внешний open сохраняется. В SSR поверхность скрыта,
позиционирование и aria-describedby подключаются после гидратации. Добавление
описания сохраняет существующие ID и отслеживает их изменения; cleanup удаляет
только ID Tooltip.

Контейнер выбирается через getPopupContainer → ConfigProvider.getPopupContainer. Undefined сохраняет fallback; функция получает
исходный DOM trigger, включая SVG, и вызывается только в браузере после открытия.
Смена функции с тем же контейнером сохраняет DOM, state, focus и selection.
Portal переносит наследуемые variables и сохраняет приоритет собственных component tokens.
Вложенные popup сохраняют собственные координаты и цвет стрелки.

Галерея находится на `/ant-design#tooltip`. Поддерживаются строки, числа и rich snippets.
Исходные motion/UniqueProvider и оставшиеся delegated props ещё не перенесены.
AutoAdjustOverflow принимает также `{ adjustX?: 0 | 1, adjustY?: 0 | 1 }`.
Числовой 0 тоже разрешает flip, как в rc-trigger; отключение обеих коррекций
задаётся boolean false.

```svelte
<Tooltip title="Подсказка" placement="topLeft"
  arrow={{ pointAtCenter: true }} autoAdjustOverflow={{ adjustX: 1, adjustY: 1 }}>
  <button type="button">Подробнее</button>
</Tooltip>
```

Локальные arrow/overflow настройки сверяются с
[84 UMD-эталонами](./tests/browser/fixtures/ant-design-overlay-options-reference.json),
[unit](./src/lib/tooltip-options-reference.test.ts),
[SSR](./tests/package/overlay-options.ssr.test.ts) и
[browser](./tests/browser/overlay-options.spec.ts). Они включают настройки tokens,
обновления открытой карточки, оба режима range Tooltip и сохранение draft/focus.
Расчёт угловых позиций использует общий
[движок rc-trigger](./src/lib/popup-position.engine.ts). Координаты, CSS стрелки,
fractional sizes, flip history и смена placement проверяются по
[99 UMD-эталонам](./tests/browser/fixtures/ant-design-overlay-corner-reference.json),
[unit](./src/lib/tooltip-corner-reference.test.ts),
[SSR](./tests/package/overlay-corner.ssr.test.ts) и
[browser](./tests/browser/overlay-corner.spec.ts). Явные размеры в части эталонов
отделяют позиционирование от layout остальных компонентов.

### ConfigProvider и semantic slots

ConfigProvider.tooltip/popover/popconfirm задают class/style, classNames/styles,
arrow, trigger и hover delays. Отсутствующий объект наследуется; явный объект,
включая {}, заменяет родительский целиком. Локальные trigger и delays приоритетнее;
0 сохраняется, undefined наследует следующий слой. При trigger=[] события hover,
focus, click и contextMenu на trigger и popup не открывают и не закрывают панель.
Это работает и без component config: уход указателя и blur не закрывают панель
и не вызывают onOpenChange. События содержимого работают, contextmenu не подавляется.
Escape и нажатие снаружи закрывают панель по прежним native правилам.
Правило для trigger=[] работает также в Popconfirm, Typography ellipsis Tooltip
и AvatarGroup.max.popover.

```svelte
<ConfigProvider tooltip={{ trigger: 'click', arrow: { pointAtCenter: true },
  class: 'help-popup', styles: { container: 'padding:12px' } }}>
  <Tooltip title="Подсказка"><button type="button">Подробнее</button></Tooltip>
</ConfigProvider>
```

Новая component config включает исходные defaults: hover для Tooltip/Popover,
click для Popconfirm и source geometry всех 12 направлений. В обычной теме это
12px со стрелкой, 4px без неё. Без component config сохраняются прежние
hover/focus и native gap/flip/shift четырёх центральных направлений с boolean
arrow/overflow. Локальный arrow boolean меняет видимость, сохраняя унаследованный
pointAtCenter; объект
перекрывает только свои поля. Настройки tooltip не попадают в Popover/Popconfirm.
Popover defaults участвуют в наружной поверхности Popconfirm; его собственные
trigger/delays и видимость стрелки приоритетнее.

Поддерживаются hover, focus, click и contextMenu, а также их массивы. Повторный
contextMenu переключает видимость; обычный click закрывает такую поверхность.
Browser context menu подавляется только при включённом contextMenu. Положение
привязывается к trigger, как в исходном Tooltip без alignPoint.
В source config события действуют независимо: hover leave закрывает панель,
открытую click/focus, если hover тоже включён. События, отсутствующие в trigger,
не закрывают программно открытую поверхность.

Class/style provider относятся к popup. Прежние локальные class/style относятся
к wrapper trigger; rootClassName задаёт дополнительный класс popup. ClassNames
и styles принимают slot records либо callback({ props }); стили задаются CSS-строками.
Tooltip имеет root/container/arrow, Popover добавляет title/content, Popconfirm —
icon. У Popconfirm title/content оформляют заголовок и описание подтверждения.
Callbacks видят разрешённые trigger и delays, у Popover/Popconfirm — placement,
у Tooltip — исходные builtinPlacements и container getter.
Open в callback — исходный prop владельца; неконтролируемое открытие не подставляет
в него внутреннее состояние.
Callbacks выполняются и при SSR, когда DOM ещё недоступен.

Классы слоёв накапливаются. Порядок CSS: context styles → context style(root) →
local styles. Цветовой слой color применяется после semantic container styles.
Класс popup задаётся через rootClassName и classNames.root.
Root styles имеют приоритет над вычисленными координатами, как в rc-trigger;
их обновление не сбрасывает variables темы, DOM, ввод, selection и focus.
Настройки наследуются также подсказками Slider, overflow AvatarGroup и ellipsis
Tooltip Typography. У Typography без config сохраняется исходный hover trigger;
его Tooltip создаётся лениво после DOM-измерения и не вызывает semantic callbacks при SSR.

Проверки конфигурации:
[60 UMD-сценариев и 18 последовательностей событий](./tests/browser/fixtures/ant-design-overlay-config-reference.json),
[SSR](./tests/package/overlay-config.ssr.test.ts) и
[browser](./tests/browser/overlay-config.spec.ts).
Без component config поведение пустого trigger дополнительно сверяется с
[10 UMD-последовательностями / 130 кадрами](./tests/browser/fixtures/ant-design-overlay-empty-trigger-reference.json)
для controlled/default open и удаления focused содержимого:
[browser](./tests/browser/overlay-empty-trigger.spec.ts).
Tooltip.unique, motion, source zIndex context и остальные delegated rc-trigger props
ещё требуют переноса. Границы fresh cache для Snippet и CSS-transform/clipping описаны выше.

### Цвет Tooltip, Popover и Popconfirm

`color` принимает 13 preset-имён Ant Design либо CSS background. Имена чувствительны
к регистру: `blue` использует палитру Ant Design, `Blue` — CSS named color. Имена
`*-inverse` получают исходный класс, но у Tooltip/Popover 6.6.8 для них нет цветовой
заливки. Preset CSS использует текущие `--ant-<color>-6`, включая component aliases
и algorithm. Прежние native-темы сохраняют свои палитры; source-тема использует
исходные tokens Ant Design.

```svelte
<Tooltip title="Сохранено" color="#fadb14">
  <button type="button">Статус</button>
</Tooltip>
<Slider defaultValue={40} tooltip={{ color: 'purple' }} />
```

У пользовательского background Tooltip выбирает чёрный или белый текст по исходной
RGB luminance с порогом 0.5; alpha не участвует. Color parser не разрешает CSS
variables перед расчётом контраста, хотя browser использует их при отрисовке.
Popover и Popconfirm сохраняют собственные цвета title/content, как upstream.
Semantic `color` текста может их переопределить.

Цветовой background следует после container styles. Root styles
могут переопределить цвет стрелки; у preset Tooltip variable задана на самой стрелке,
поэтому для неё используется styles.arrow. Raw background передаётся одним CSS value,
а не списком declarations. Реактивное невалидное значение может сохранить прежний
background, как React style setter; удаление shorthand сохраняет исходный style diff.

Цвет работает также в `AvatarGroup.max.popover` и обоих режимах Slider Tooltip.
Обновление открытой панели сохраняет DOM, ввод, выделение и фокус. Private contrast
родительской панели не копируется в body portal и изолирован у вложенного native
Tooltip без getter. Явный контейнер внутри родительской панели наследует его,
как исходный getPopupContainer.

Проверки цвета: [129 UMD-сценариев и 12 вложенных поверхностей](./tests/browser/fixtures/ant-design-overlay-color-reference.json),
[engine](./src/lib/tooltip-color.engine.test.ts), [SSR](./tests/package/overlay-color.ssr.test.ts)
и [browser](./tests/browser/overlay-color.spec.ts). Эталоны цвета задают явные размеры
popup/anchor; геометрия проверяется отдельными наборами выше.

### Локальные префиксы и классы открытого trigger

`prefixCls` меняет классы Tooltip/Popover, их slots, placements и preset colors.
Defaults — `ant-tooltip` и `ant-popover`; пустая строка также выбирает default.
У Popconfirm default `ant-popconfirm`: его локальный prefix меняет только классы
подтверждения, наружный Popover остаётся `ant-popover`, как upstream.
CSS variables и глобальные `.anticon` сохраняют имена. Это отдельная настройка
от `theme.cssVar.prefix`; совместимые aliases и существующие native markers/hash
остаются частью Svelte-адаптации.

```svelte
<Popover prefixCls="project-card" title="Настройки" content="Сохранены">
  <button type="button">Показать</button>
</Popover>
```

`openClassName` задаёт класс открытого trigger, включая несколько tokens. Без него
или при пустой строке используется `${prefixCls}-open`; у Popconfirm это по умолчанию
`ant-popover-open`. Класс добавляется к фактическому DOM trigger после hydration.
Собственные классы ребёнка сохраняются, при закрытии и unmount удаляются только
добавленные компонентом tokens. Обновление caller class во время показа не снимает
open class. SSR не клонирует непрозрачный children snippet; скрытый shell, стабильные
ID, native wrapper и ARIA-поведение сохраняются.

Настройки работают также в AvatarGroup.max.popover, Slider.tooltip и ellipsis Tooltip
Typography. Последний передаёт color и semantic styles общему popup.
Смена prefix сохраняет DOM, ввод, выделение и фокус; stylesheet удаляется вместе
с владельцем. Portal и native ограничения viewport остаются прежними, включая
заголовок Popover на узком экране и восстановление фокуса AvatarGroup.

Источник CSS — отдельные templates Tooltip (58 rules), Popover (72) и Popconfirm
(11); motion/unique этим этапом не переносились. Проверки:
[123 UMD-сценария / 172 кадра](./tests/browser/fixtures/ant-design-overlay-prefix-reference.json),
[CSS engine](./src/lib/overlay-prefix.engine.test.ts),
[SSR](./tests/package/overlay-prefix.ssr.test.ts) и
[browser](./tests/browser/overlay-prefix.spec.ts). UMD сам генерирует runtime CSS;
статический antd.css в этой сверке не подключается. Явные размеры popup/anchor
изолируют классы и оформление от измерения содержимого; trigger classes проверяются
также при закрытии. Точный React DOM и Svelte markers не сравниваются.

## Popover

```svelte
<script lang="ts">
  import { Button, Popover } from 'antd-svelte';

  let open = $state(false);
</script>

{#snippet content()}
  <p>Настройки сохранены.</p>
  <Button onclick={() => { open = false; }}>Закрыть</Button>
{/snippet}

<Popover title="Настройки" {content} trigger="click" bind:open>
  <Button>Открыть настройки</Button>
</Popover>
```

Title и content принимают строку, число или Svelte snippet; число 0 отображается,
строки экранируются. False не создаёт секцию; true создаёт пустую секцию без текста,
как исходный isReactRenderable. Children — snippet с одним основным DOM-элементом, например
Button или нативной кнопкой. Он служит anchor и получает aria-haspopup=dialog,
aria-controls и aria-expanded. Для клавиатурного доступа используйте фокусируемый
элемент. Карточка получает role=dialog и имя от title; при отсутствии заголовка
задайте aria-label. Она сохраняет немодальное поведение.

`bind:open`, defaultOpen и `onOpenChange(open)` следуют модели Svelte, как у
Tooltip. DefaultOpen учитывается один раз; внешнее изменение open и начальное
состояние не вызывают callback. Обработчики дочернего элемента сохраняются;
без явных showAction/hideAction preventDefault в его onclick отменяет открытие по клику.

Trigger без component config по умолчанию `['hover', 'focus']`. Поддерживаются
click, hover, focus, contextMenu, их массив и пустой массив для программного показа. MouseEnterDelay и
mouseLeaveDelay задаются в секундах, по умолчанию 0.1; фокус открывает карточку
сразу. Touch не имитирует hover. В прежнем native режиме (hover/focus/click без
component config) наведение на карточку и фокус внутри неё
сохраняют видимость. При сочетании hover/focus с click первый клик закрепляет
открытую карточку, второй закрывает её.

В этом режиме открытие кликом, Enter или Space переводит фокус на первый доступный
control в содержимом; для текстовой карточки фокусируется сама поверхность. Открытие
наведением, фокусом или внешним open сохраняет текущий фокус. Tab/Shift+Tab
следуют DOM-порядку между trigger, содержимым и соседними controls. В native режиме
выход фокуса за пределы карточки и trigger закрывает её, если нет активного наведения.
Escape закрывает карточку и возвращает фокус из содержимого к trigger;
нажатие снаружи сохраняет фокус на выбранном внешнем элементе. Закрытие через
bind:open возвращает фокус, если он находился внутри карточки.
Function binding может отклонить изменение open; отклонённое закрытие сохраняет
фокус и текущие способы удержания карточки открытой.
При новой component config или contextMenu открытие кликом сохраняет текущий
фокус, как upstream; сочетания trigger следуют правилам source config выше.

`showAction`/`hideAction` независимо заменяют события trigger; focusDelay/blurDelay
задаются в секундах с default 0 независимо от hover delays, как у
[Tooltip](#tooltip). Пустой hideAction отключает trigger/outside-закрытие,
сохраняя Escape и действия содержимого. Явные списки используют source click,
contextMenu и touch fallback: click не переводит фокус в popup и не блокируется
preventDefault дочернего handler. Фокус внутри панели не отменяет отложенное
закрытие, а blur trigger следует hideAction также при переходе в содержимое.
Прежнее native удержание и перевод фокуса без overrides сохраняются.
Blur без relatedTarget ждёт microtask для проверки connected/cleanup;
возврат фокуса перед скрытием/удалением содержимого остаётся native адаптацией.
Изменение и удаление action props не отменяет уже запущенную задержку;
uncontrolled open сохраняется при обновлении spread props.

`Popover.disabled` скрывает панель/open class, сохраняя raw open, callbacks
и ожидающие события. Изменение самого disabled не вызывает onOpenChange;
повторное включение может показать уже открытую панель.
Сверка: [67 UMD-сценариев / 389 кадров и шесть cleanup traces](./tests/browser/fixtures/ant-design-popover-actions-reference.json),
[SSR](./tests/package/popover-actions.ssr.test.ts) и
[browser](./tests/browser/popover-actions.spec.ts), `?fixture=popover-actions`.
Эталоны включают Popconfirm и передачу настроек через AvatarGroup.max.popover.
Controlled-сценарии используют getter/setter binding с отклонением записи;
обычный open продолжает следовать модели Svelte.

Placement принимает те же 12 направлений, что Tooltip; arrow=false скрывает стрелку.
AutoAdjustOverflow по умолчанию переворачивает и сдвигает поверхность у края
viewport; false сохраняет запрошенное положение. Позиция обновляется при
прокрутке, resize, перемещении anchor и изменении размеров содержимого.
Смена положения сохраняет текущий ввод, выделение и фокус. Class и style
относятся к wrapper. Поддерживаются темы ConfigProvider, compact, RTL и
prefers-reduced-motion.
PopupClass относится к самой поверхности. Aria-labelledby, aria-describedby
и aria-busy позволяют связать её с содержимым составного компонента;
aria-label имеет приоритет при выборе имени.

`align`, `builtinPlacements` и `onPopupAlign` следуют правилам [Tooltip](#tooltip):
align перекрывает выбранную запись, карта заменяется целиком, включая {},
класс placement выбирается по первому совпадению points. Callback получает
реальную поверхность Popover и итоговый align до применения новых координат.
Semantic root/arrow styles сохраняют приоритет. Эти настройки включают исходную
геометрию также без component config и передаются через Popconfirm и
AvatarGroup.max.popover; прежние defaults без новых props сохраняются.

Сверка: [84 UMD-сценария](./tests/browser/fixtures/ant-design-popover-align-reference.json),
[SSR](./tests/package/popover-align.ssr.test.ts) и
[browser](./tests/browser/popover-align.spec.ts), `?fixture=popover-align`.
В 6.6.8/rc-trigger 3.10.1 изменение align или существующей записи placements
само по себе оставляет прежнюю геометрию до forceAlign либо другого события
выравнивания; состояния до/после forceAlign записаны в эталоне для отдельного
разбора. Svelte сохраняет автоматическое отслеживание новых props, draft,
выделение и фокус. Fixed/top-layer, viewport и CSS-transform/scroll-container
границы остаются теми же, что у Tooltip.

`bind:ref` возвращает общий PopoverRef для Popover и Popconfirm после mount;
при SSR и после unmount binding равен undefined. Стабильный объект содержит
getters nativeElement (основной trigger, включая SVG) и popupElement (наружный div).
Они отслеживают замену trigger и перенос popup в другой контейнер.
ForceAlign пересчитывает открытый popup без ожидания animation frame; несколько
синхронных вызовов объединяются в microtask. Он не открывает скрытую карточку,
не меняет open/confirm callbacks и не создаёт зависимостей в пользовательском
$effect. Сохранённый handle после unmount безопасен: forceAlign ничего не делает,
DOM getters возвращают undefined.

Native div shell существует также до первого открытия и при destroyOnHidden;
ref возвращает этот же узел, а удаление относится к содержимому. В React ref
до первого открытия не содержит popup, после destroy может ссылаться на удалённый
div; существующий Svelte lifecycle сохраняется. Nullable DOM types отражают
эти состояния и поддерживают SVG без приведения к HTMLElement.
Сверка: [восемь UMD-сценариев](./tests/browser/fixtures/ant-design-popover-ref-reference.json),
[SSR](./tests/package/popover-ref.ssr.test.ts) и
[browser](./tests/browser/popover-ref.spec.ts), `?fixture=popover-ref`.
Bind:ref задаётся непосредственно компоненту; max.popover остаётся объектом PopoverProps.

`id` задаёт ID native dialog; пустая строка использует стабильный generated ID.
Скрытый ID обновляется вместе с кэшем содержимого. Aria-controls trigger меняется
без потери caller IDREF tokens, включая совпадение нового ID с существующим token.
`zIndex`, включая 0 и отрицательные числа, задаёт явный слой перед semantic root styles; общий source zIndex context и порядок native top layer
этот prop не заменяет.

`forceRender=true` прогревает скрытое содержимое и portal после mount/hydration,
также при disabled и destroyOnHidden. Выключение forceRender у закрытой панели
с destroyOnHidden удаляет содержимое; новый force mount получает текущие props.
`fresh=false` сохраняет скрытые title/content, container/title/content class/style
и ID до открытия; root/arrow styles обновляются сразу. Fresh=true обновляет
скрытый payload. В Popconfirm кэшируются также icon и props кнопок; loading,
disabled guards и локализация остаются текущими. Внутреннее состояние виджета
сохраняется до его удаления, а opaque Snippet captures остаются реактивными по
правилам Svelte: полная заморозка React.memo здесь не обещается.
Сверка: [50 UMD-сценария / 399 кадров](./tests/browser/fixtures/ant-design-popover-lifecycle-reference.json),
[SSR](./tests/package/popover-lifecycle.ssr.test.ts) и
[browser](./tests/browser/popover-lifecycle.spec.ts), `?fixture=popover-lifecycle`.

Source-тема подготавливает Tooltip и Popover tokens в исходном порядке:
maxWidth и стрелку внутреннего Tooltip, затем собственные titleMinWidth,
zIndexPopup, padding и wireframe-разделение заголовка/содержимого. Deprecated
width/minWidth сохраняют исходный приоритет перед titleMinWidth по умолчанию.
Обновление темы сохраняет позицию панели, введённый текст и фокус.

Popover использует нативный `popover="manual"` и требует Popover API.
Без container getter поверхность остаётся в исходном DOM-поддереве и верхнем слое:
overflow контейнера не обрезает её, темы и работа внутри Modal сохраняются.
Вложенный Tooltip обрабатывает Escape первым; затем закрывается Popover,
следующим Escape — Modal. Существующий aria-describedby trigger сохраняется.
Aria-controls объединяется с имеющимися ID; при отключении карточки её ID
удаляется, а aria-haspopup/aria-expanded восстанавливаются с учётом изменений
владельца. Позиционирование и связь с trigger подключаются после гидратации;
в SSR поверхность скрыта.

GetPopupContainer выбирает контейнер по тем же
правилам, что Tooltip; локальный undefined сохраняет provider fallback.
Getter не вызывается до первого открытия или forceRender и при SSR. Обновление контейнера
и темы сохраняет native popup lifecycle; неизменный контейнер не перемещает DOM.

Пустые title и content отключают показ и ARIA-связь. Если один из них является
snippet, компонент считает содержимое доступным; условное отсутствие текста
внутри snippet контролирует его владелец. Закрытое содержимое остаётся
смонтированным и сохраняет состояние. Без forceRender destroyOnHidden=true удаляет title/content
при закрытии и создаёт их заново при открытии; при SSR такие snippets не вызываются,
включая начальный open/defaultOpen.
Фокус возвращается к trigger перед удалением содержимого. Отложенные открытия отменяются при
удалении компонента, очистке содержимого и замене trigger.

Галерея `/ant-design#popover` содержит редактор профиля и информационную
карточку с кнопкой. Arrow и autoAdjustOverflow принимают те же object настройки,
что Tooltip; они передаются также через Popconfirm и AvatarGroup.max.popover.
ContextMenu и color поддержаны по общим правилам Tooltip выше.

## Popconfirm

GetPopupContainer передаётся Popover с теми же приоритетами.
Контекст темы и Promise действия сохраняются при переносе popup в контейнер.
Trigger и hover delays наследуются из ConfigProvider.popconfirm; локальные props
имеют приоритет. Без настройки trigger остаётся click.
ShowAction/hideAction и focusDelay/blurDelay передаются Popover с теми же
приоритетами и native границами, описанными выше. Пустой hideAction не отключает
кнопки подтверждения/отмены. Защита ожидающего Promise и прежний disabled contract
сохраняются; Popover.disabled и Popconfirm.disabled имеют собственные правила.
Align/builtinPlacements/onPopupAlign также передаются наружному Popover;
callback получает его DOM, перемещение не заменяет description и кнопки.
Bind:ref передаётся тому же Popover и использует общий PopoverRef; forceAlign
не прерывает ожидающее подтверждение и сохраняет припаркованный фокус.
Id/forceRender/fresh/zIndex передаются также. Смена ID/слоя сохраняет ожидающий
Promise, текущее содержимое и припаркованный фокус; его результат по-прежнему
подчиняется controlled owner и защите от устаревших запросов.
DestroyOnHidden передаётся Popover, включая явный false. При удалении содержимого заново
создаются description snippet и кнопки; сам контроллер подтверждения сохраняет
защиту от результата прежнего Promise после закрытия или повторного открытия.
При включённом удалении SSR-содержимое остаётся ленивым даже при начальном open/defaultOpen;
native shell, focus и ARIA следуют прежним правилам Popover.

```svelte
<script lang="ts">
  import { Button, Popconfirm } from 'antd-svelte';

  let open = $state(false);

  async function remove() {
    // Здесь владелец выполняет запрос и обновляет данные после успеха.
  }
</script>

<Popconfirm
  title="Удалить запись?"
  description="Запись исчезнет из списка."
  bind:open
  okText="Удалить"
  okButtonProps={{ danger: true }}
  onConfirm={remove}
>
  <Button danger>Удалить</Button>
</Popconfirm>
```

Title обязателен; title и description принимают строку, число или Svelte
snippet. Число 0 отображается, строки экранируются. Пустая строка title отключает
карточку; snippet должен содержать доступный заголовок. Icon — декоративный snippet;
по умолчанию показан знак предупреждения,
icon=null скрывает его. Children содержит один основной DOM-элемент, обычно
Button. Его атрибуты и обработчики сохраняются.

Popover обеспечивает открытие кликом, Enter/Space нативной кнопки, 12
положений Tooltip, arrow и autoAdjustOverflow. В содержимом
сначала находится отмена, затем подтверждение; showCancel=false скрывает
отмену. При открытии фокусируется первый доступный control, для обычного
описания — кнопка отмены. Tab следует естественному порядку, Escape закрывает
карточку и возвращает фокус. Поддерживаются Modal, вложенный Tooltip, темы,
compact, RTL и prefers-reduced-motion. Требуется нативный Popover API.

При source-настройках ConfigProvider aliases применяются в порядке
Tooltip → Popover → Popconfirm; Popconfirm подготавливает собственный zIndexPopup.
Вложенный самостоятельный Popover использует свои tokens без aliases Popconfirm.
Смена темы не прерывает ожидающее подтверждение.

`bind:open`, defaultOpen и `onOpenChange(open)` следуют модели Svelte.
DefaultOpen учитывается один раз; внешние изменения open не вызывают
onOpenChange. `onConfirm(event)` вызывается только кнопкой подтверждения.
Синхронное завершение и успешный Promise закрывают карточку; без onConfirm
подтверждение просто закрывает её. `onCancel(event)` вызывается только кнопкой
отмены. Escape, клик снаружи и повторный клик trigger меняют видимость через
onOpenChange и не вызывают onCancel.

Во время Promise подтверждение показывает loading, обе кнопки отключены;
повторный запуск, Escape, клик снаружи, повторный клик trigger и уход фокуса
не закрывают карточку. Внешнее open остаётся под контролем владельца.
Закрытие, повторное открытие, disabled и удаление компонента делают старый
результат неактуальным: он не закрывает новую карточку, не сбрасывает её
loading и не вызывает onError. Эта защита относится к состоянию Popconfirm;
отменой запроса и изменениями данных управляет владелец onConfirm.

Синхронный throw и отклонение Promise оставляют карточку открытой и показывают
безопасное сообщение с role=alert. `onError(error)` получает исходную ошибку
как unknown; её технический текст автоматически не выводится. Повторная
попытка очищает сообщение. Кнопки используют okText/cancelText или
locale.okText/cancelText; сообщение ошибки задаётся locale.confirmErrorText.
Поддерживаются ruRU и enUS, а частичная locale наследуется из ConfigProvider.

OkType задаёт тип подтверждения; okButtonProps/cancelButtonProps настраивают
размер, danger, disabled, атрибуты и события кнопок. Их onclick вызывается перед
внутренним действием: preventDefault отменяет подтверждение или отмену.
HtmlType всегда button, loading управляется Popconfirm. Disabled наследуется
из Form и ConfigProvider; disabled=false переопределяет наследование.
Disabled скрывает карточку и блокирует её действия, сохраняя open владельца;
исходный trigger не заменяется и сам по себе не отключается этим prop.

Карточка получает role=dialog, имя от title и описание от description.
Trigger сохраняет существующий aria-describedby и связан с карточкой через
aria-controls/aria-expanded. Во время ожидания выставляется aria-busy;
фокус из отключаемых кнопок сохраняется на содержимом. Class/style относятся
к wrapper trigger, как у Popover. Содержимое закрытой карточки остаётся
смонтированным, состояние ошибки сбрасывается для нового открытия.

Галерея `/ant-design#popconfirm` показывает удаление строки Table с задержкой,
отменой, ошибкой и повтором. После удаления trigger фокус переходит к кнопке
восстановления записей. Пример освобождает ожидающие таймеры при удалении.
Поддерживаются открытие по клику и все 12 направлений Tooltip;
hover/focus/contextMenu и независимые action props доступны также через Popconfirm.

## Menu

Первый этап следует Ant Design 6.6.8 и @rc-component/menu 1.5.0
(диапазон upstream ~1.5.0). React/rc-menu runtime не устанавливается;
[MIT-лицензия rc-menu](./src/lib/vendor/LICENSE.rc-menu) сохранена в пакете.

```svelte
<script lang="ts">
  import { Menu, type MenuItemType } from 'antd-svelte';
  let selected = $state<string[]>(['overview']);
  let opened = $state<string[]>(['guides']);
  const items: MenuItemType[] = [
    { key: 'overview', label: overview },
    { key: 'guides', label: 'Руководства', children: [
      { key: 'setup', label: 'Подключение' },
      { key: 'forms', label: 'Формы' }
    ] }
  ];
</script>

{#snippet overview()}<a href="/overview">Обзор</a>{/snippet}
<Menu {items} mode="inline" selectedKeys={selected} openKeys={opened}
  onSelect={info => { selected = info.selectedKeys; }}
  onDeselect={info => { selected = info.selectedKeys; }}
  onOpenChange={keys => { opened = keys; }} aria-label="Навигация" />
```

Items принимает MenuItemType: обычный пункт, подменю с children,
`type='group'` с label/children, `type='divider'` с dashed либо null.
У пунктов и подменю обязательны стабильные key. Числовой key нормализуется в
строку для selection/open/events; исходное значение остаётся в itemData.
Label и extra пункта — string/number/Snippet, icon — Snippet. Поддержаны
item.disabled/danger/title, class/style; у подменю также theme/popupClassName
и onTitleClick. Группы не добавляют уровень отступа и не входят в keyPath.
Theme подменю меняет только его popup; следующее подменю без собственного theme
использует тему корневого Menu. Для native popover правила light/dark дополнительно
ограничены CSS @scope: тема родителя не переходит во вложенный popup. Базовые
нескопированные правила сохранены для браузеров без поддержки @scope.

SelectedKeys/openKeys задают controlled state; defaultSelectedKeys/defaultOpenKeys
читаются при создании для uncontrolled state. По умолчанию выбран один пункт,
selectable=true, multiple=false. OnClick пункта, его подменю от ближайшего к корню
и Menu вызываются до onSelect/onDeselect. Info содержит key, keyPath от листа
к корню, domEvent и itemData — поверхностную копию исходного пункта. Select info
добавляет selectedKeys. Устаревший React instance info.item отсутствует.
Повторная активация выбранного single-пункта сохраняет `[key]`, но вызывает
onDeselect: это поведение rc-menu 1.5.0. В multiple выбранный key удаляется.
Selectable=false сохраняет onClick и закрытие popup без изменения selection.

Mode по умолчанию vertical; поддержаны horizontal и inline. Hover открывает
popup-подменю; triggerSubMenuAction='click' переключает их по клику. Inline
раскрывается по клику независимо от этого prop. SubMenuOpenDelay и
subMenuCloseDelay — секунды, обе задержки по умолчанию 0.1, как runtime rc-menu
1.5.0 (таблица Ant Design указывает open delay=0). OnTitleClick относится к
клику заголовка; keyboard opening меняет openKeys без этого callback.
Single selection закрывает все popup-подменю, multiple сохраняет их.
Закрытие inline-подменю сохраняет descendant openKeys; закрытие popup удаляет их.

InlineIndent по умолчанию 24 px. InlineCollapsed переводит inline в vertical;
при отсутствии prop учитывается LayoutSider.collapsed. Возврат в inline
восстанавливает кэш uncontrolled openKeys. Controlled openKeys остаются у владельца:
если он принял `[]` при сворачивании, компонент не заменяет этот массив кэшем.
Первый уровень без icon сокращается до первого символа; доступное имя и native
подсказка title сохраняют текст. Полный Tooltip API для collapsed items пока отсутствует.

Закрытые подменю монтируются при первом открытии; forceSubMenuRender монтирует
их заранее, сохраняя закрытые popup скрытыми в том числе в horizontal mode.
Inline скрывает сохранённый DOM через hidden, popup использует native
popover и общий механизм позиционирования. Боковое подменю выравнивается по верху
заголовка, horizontal popup — по нижнему левому краю, в RTL по правому; поверхность
переворачивается/сдвигается в пределах viewport. Outside click закрывает её;
Escape внутри popup закрывает текущий уровень и возвращает фокус к родителю.
Таймеры, listeners и animation frames очищаются при unmount.

GetPopupContainer задаёт HTMLElement или ShadowRoot для popup каждого подменю.
Без локального prop используется ConfigProvider.getPopupContainer; собственный
`getPopupContainer={undefined}` отключает это наследование, как Ant wrapper.
Getter получает native button заголовка (в React это div). Без getter сохраняется
прежнее native-размещение. Обычный inline не вызывает getter; при
forceSubMenuRender с getter создаются также скрытые popup-копии inline-подменю,
которые не заменяют refs основного списка. Getter с объявленным параметром ждёт
DOM-заголовок; zero-arity getter при force render может сначала получить undefined.
SSR getter не вызывает. Смена функции с тем же контейнером сохраняет DOM, draft,
выделение и фокус; смена самого контейнера пересоздаёт popup contents, как React portal.
Вынесенные подменю сохраняют клавиатуру, hover-задержки, callbacks и theme variables.
Стили внутри ShadowRoot подключает потребитель. Сверка существующих подменю покрыта
32 снимками официального UMD и фикстурой `?fixture=menu-container`; горизонтальный
overflow More в эти гарантии пока не входит и остаётся отдельным этапом.

Структура — ul/li с role=menu/menuitem/group/separator. Заголовки подменю используют
native button, a[href] в label остаётся настоящей ссылкой. Menu не перехватывает
переход, модификаторы, target/rel; native Enter на ссылке запускает callback
один раз через click вместо дублирования legacy React keydown/click.
Ссылки label и групп используют исходный link reset во всех режимах Menu,
включая inline/popup-подменю и отдельный popup container, без зависимости от cssVar.
LinkDecoration/linkHoverDecoration/linkFocusDecoration и inline styles сохраняют
приоритет; ссылки вне Menu не меняются. Рецепт menu-link-reset извлекает 14 общих
правил из закреплённого CSS. Сверка:
[39 UMD-сценариев](./tests/browser/fixtures/ant-design-menu-link-decoration-reference.json) и
[browser](./tests/browser/menu-link-decoration.spec.ts), `?fixture=menu-link-decoration`.

Inline Up/Down обходят все видимые доступные пункты, Enter переключает подменю.
Horizontal Left/Right меняют пункты первого уровня с учётом RTL, Down/Enter входят
в popup. В popup Up/Down обходят текущий уровень, Left/Right входят/возвращаются
с учётом RTL. Home/End переходят к границам текущего списка; в inline — всего
видимого дерева. Disabled пропускается. Space не активирует пункты/подменю, как
upstream. Ref.focus(options) предпочитает ссылку в пункте; findItem({key}) возвращает
смонтированный элемент пункта/заголовка, bind:nativeElement — корневой ul.

Theme='light' по умолчанию независимо от алгоритма страницы; theme='dark' задаёт
тёмную палитру Menu с фоном #001529. Глобальные primary/compact/RTL наследуются.
При source-настройках темы `components.Menu` получает исходные defaults и aliases:
размеры пунктов/иконок/групп, отступы, active bar и light/dark цвета. Отдельные
component algorithms, CSS prefix и hash поддержаны. Устаревшие имена токенов
сопоставляются после расчёта defaults, как upstream; явно переданные нули сохраняются.
Вложенные inline-списки наследуют переменные корневого Menu, popup получает
собственный scope. Его переменные обновляются без потери позиции и фокуса.
Plain style имеет приоритет на корневом меню; popup использует component tokens,
как отдельная поверхность upstream. Native-only темы сохраняют прежнее оформление.
Source compact использует itemHeight=35px и collapsedWidth=70px.
Как Ant wrapper, Menu учитывает только свой disabled и disabled пунктов:
Form.disabled и ConfigProvider.componentDisabled не отключают навигацию.
Галерея — `/ant-design#menu`, изолированная фикстура — `?fixture=menu`.

Первый этап не включает responsive horizontal overflow/overflowedIndicator,
исходные popup/collapse motion, controlled activeKey/defaultActiveFirst,
component config вне темы, semantic classNames/styles, prefixCls, render hooks,
placements/offset и overrides expandIcon/itemIcon. Deprecated
Menu.Item/SubMenu/ItemGroup/Divider children wrappers исключены из переноса; данные
задаются items. Standalone Menu пока не расширяет существующий контракт Dropdown.

## Dropdown

```svelte
<script lang="ts">
  import { Button, Dropdown } from 'antd-svelte';

  let open = $state(false);
  let lastAction = $state('');
</script>

<Dropdown
  bind:open
  trigger={['click']}
  menu={{
    items: [
      { key: 'details', label: 'Открыть карточку' },
      { key: 'export', label: 'Экспорт', disabled: true },
      { key: 'divider', type: 'divider' },
      { key: 'archive', label: 'В архив', danger: true }
    ],
    onClick: ({ key }) => { lastAction = key; }
  }}
>
  <Button>Действия</Button>
</Dropdown>
<output>{lastAction}</output>
```

`menu.items` принимает readonly-массив DropdownItem. Команда имеет строковый key,
label (строку или пассивный Snippet), необязательные icon, textValue, disabled,
danger и onClick. Разделитель имеет `{ key, type: 'divider' }`. Пустой строковый
ключ допустим; при повторении ключа используется первое вхождение. Icon декоративный.
Для snippet со сложным или нетекстовым содержимым задайте textValue: он служит
доступным именем команды и текстом поиска. В label не следует вкладывать кнопки,
ссылки и поля ввода. Пустой список показывает ConfigProvider.locale.emptyText.

Для навигации item поддерживает href/target/rel: вместо button создаётся a с
role=menuitem. Это Svelte-адаптация link label исходного Menu без вложения ссылки
в кнопку. Disabled link не получает href и имеет aria-disabled=true. Enter и
Space активируют его; preventDefault в callbacks отменяет и нативный переход,
и закрытие меню. Без href сохраняется прежняя нативная кнопка команды.

Open поддерживает bind:open; defaultOpen читается при создании компонента.
`onOpenChange(boolean)` сообщает запросы видимости от trigger, hover, Escape,
Tab и клика снаружи. Изменение open владельцем и закрытие из-за disabled
не вызывают callback. В существующем Svelte API выбор команды закрывает меню и обновляет
binding **без onOpenChange(false)**; для команды используйте menu.onClick.
Исходный Ant Design 6.6.8 вызывает callback и при выборе команды, передавая
второй аргумент с source; это расширение текущего Svelte API ещё не перенесено.
Сначала вызывается onClick пункта, затем menu.onClick; оба получают
`{ key, domEvent: MouseEvent }`. PreventDefault в пункте отменяет следующий
обработчик и закрытие, в menu.onClick — закрытие. Асинхронные операции и их ошибки
обрабатывает владелец; Dropdown не показывает loading и не ожидает Promise.

По умолчанию trigger равен `['hover']`; допустимы `'hover'`, `'click'`, их массив
и `[]` для внешнего управления. MouseEnterDelay/MouseLeaveDelay задаются в
секундах, по умолчанию 0.1. Уход указателя закрывает меню только при включённом
hover: внешне открытое меню с click или `[]` остаётся открытым. Hover не перемещает
фокус; click, Enter, Space и
ArrowDown фокусируют первую доступную команду, ArrowUp — последнюю. Стрелки
обходят команды по кругу, Home/End выбирают крайние, ввод букв ищет по префиксу.
Повтор буквы перебирает совпадения; пауза в секунду начинает новый поиск.
Disabled-пункты и разделители пропускаются. Если доступных команд нет, фокус
получает сам menu. Tab/ShiftTab закрывают меню и продолжают нативный порядок.
Escape и выбор команды возвращают фокус к trigger, если он оставался в меню.
При удалении trigger после действия новый фокус назначает владелец.

В children передавайте один нативный focusable control, обычно Button.
Dropdown связывает первый дочерний элемент с menu через aria-haspopup="menu",
aria-controls и aria-expanded, сохраняя исходные ARIA-атрибуты владельца.
`aria-label` именует меню; по умолчанию имя берётся от trigger. Class/style
относятся к wrapper trigger. Disabled наследуется от Form/ConfigProvider;
явное false переопределяет контекст. Нативный disabled trigger также не открывает меню.

Placement: top, topLeft, topRight, bottom, bottomLeft, bottomRight. По умолчанию
bottomLeft, в RTL — bottomRight. AutoAdjustOverflow по умолчанию true:
меню переворачивается и сдвигается в границах окна; false сохраняет запрошенное
положение. Минимальная ширина соответствует trigger, длинный список прокручивается.
Arrow по умолчанию false. Поверхность использует native popover, сохраняет
контекст темы и работает внутри Modal; закрытое меню остаётся смонтированным.
GetPopupContainer выбирает локальную функцию или ConfigProvider fallback;
undefined наследует provider. До первого открытия функция не вызывается.

При source-настройках темы `components.Dropdown` рассчитывает paddingBlock,
zIndexPopup и tokens стрелки; aliases задают шрифт, цвета, отступы и радиусы.
Внутренний список получает отдельный scope Menu: его aliases дополняют Dropdown,
как в исходной реализации. Например, `components.Menu.fontSize` меняет строки,
а `components.Menu.itemHeight` не заменяет `Dropdown.paddingBlock`.
Поддержаны component algorithms, CSS prefix/hash, нули, undefined и CSS-строки.
Source gap равен глобальному marginXXS плюс половина sizePopupArrow при arrow;
corner placements используют исходные arrowOffsetHorizontal. Обновления темы
сохраняют DOM, фокус и inline-позицию popup. Native-only оформление и существующие
bind:open/callback contracts сохранены.

Галерея `/ant-design#dropdown` показывает действия строки Table: открытие Modal,
копирование и архивирование участника. Первая версия ограничена плоскими командами:
интеграция standalone Menu, подменю, selectable/checkable items, contextMenu
и popupRender пока отсутствуют. Пункты с href уже создают нативные ссылки.
Deprecated Dropdown.Button исключён из переноса; актуальная композиция —
SpaceCompact с Dropdown и Button.

## Tabs

```svelte
<script lang="ts">
  import { Input, Tabs } from 'antd-svelte';

  let activeKey = $state<string | undefined>('profile');
</script>

{#snippet profile()}
  <label>Имя<Input defaultValue="Анна" /></label>
{/snippet}
{#snippet history()}<p>Последние изменения профиля.</p>{/snippet}

<Tabs
  aria-label="Разделы участника"
  bind:activeKey
  items={[
    { key: 'profile', label: 'Профиль', children: profile },
    { key: 'access', label: 'Доступ', disabled: true },
    { key: 'history', label: 'История', children: history }
  ]}
/>
```

`items` принимает readonly-массив TabsItem: строковый key, label (строку, число,
boolean/null или пассивный Snippet), необязательные children (Snippet), icon, disabled,
forceRender, destroyOnHidden, closable и closeIcon. Ключи идентифицируют панели при перестановке;
содержимое и его фокус сохраняются.
Пустой строковый ключ допустим; при повторении используется первое вхождение.
Icon декоративный. Label должен давать вкладке доступное имя; интерактивные
элементы внутри label не поддерживаются. `aria-label` или `aria-labelledby`
именует список вкладок. Id/class/style относятся к корневому контейнеру.

`items[].className` и `items[].style` относятся к соответствующему tabpanel,
а не к заголовку. Классы добавляются после classNames.content. CSS-строки применяются
в порядке styles.content → item.style → motion style; у каждой панели свои overrides.
Например: `{ key: 'profile', label: 'Профиль', children: profile, className: 'profile-panel', style: 'padding-inline:12px' }`.
Живое обновление оформления сохраняет DOM, local state, draft, selection и focus.

`bind:activeKey` хранит выбранный ключ. DefaultActiveKey читается при создании;
без ключа выбирается первая доступная вкладка. Для binding задавайте начальное
значение у владельца без defaultActiveKey. При неизвестном, удалённом или
отключённом ключе отображается первая доступная панель. Внешнее значение при
этом сохраняется: его восстановление снова выберет соответствующую вкладку.
Если доступных вкладок нет, ни одна панель не выбрана, а фокус может получить
сам tablist. Пустой items показывает ConfigProvider.locale.emptyText.

`onTabClick(key, MouseEvent)` вызывается и по клику, и при нативной активации
Enter/Space, включая уже выбранную вкладку. PreventDefault отменяет смену
панели. Затем обновляется binding и вызывается onChange(key), если выбранная
вкладка действительно изменилась. Обновления владельцем, изменение defaults,
fallback при удалении/disabled и перемещение фокуса не вызывают onChange.
После onTabClick доступность пункта проверяется повторно: обработчик может
удалить или отключить вкладку.

Клавиатура использует ручную активацию. Стрелки перемещают фокус по кругу,
пропуская disabled; Home/End выбирают первый/последний доступный заголовок.
В горизонтальном списке действуют Left/Right с учётом RTL, в вертикальном —
Up/Down. Enter и Space активируют сфокусированную вкладку. Заголовки добавляют
одну остановку Tab; после выхода повторный вход возвращает фокус к выбранной
вкладке. В line/card Tab из списка переходит к именованной активной панели, затем к её
полям и кнопкам. При скрытии сфокусированной панели или удалении/disabled
сфокусированного заголовка фокус переходит на доступный заголовок либо tablist.
Изменения при фокусе снаружи Tabs не перемещают его внутрь.

Содержимое ленивое: впервые монтируется при активации и по умолчанию сохраняется
в скрытой панели, включая локальный state дочерних компонентов и DOM-черновики.
DestroyOnHidden=true удаляет содержимое при скрытии, а при анимации панели — после
завершения leave; следующий визит создаёт
новый экземпляр. После уничтожения отключение destroyOnHidden само по себе
не монтирует панель заново. Значение на отдельном item переопределяет общее,
включая явное false. Это сохранённый контракт native v1: rc-tabs 1.13.0 отдаёт
приоритет явно заданному общему destroyOnHidden. ForceRender=true монтирует содержимое сразу и сохраняет
его даже вместе с destroyOnHidden. Удаление key всегда уничтожает панель.
Состояние, которое владелец хранит снаружи Tabs, уничтожение панели не сбрасывает.

Фикстура `?fixture=tabs-destroy` сопоставляет восемь актуальных сценариев официального
UMD: шесть совпадают с upstream, два фиксируют сохранённый приоритет item.

Сохранённая скрытая панель остаётся в DOM; её таймеры и подписки продолжают
работать. Поля посещённых/forceRender-панелей участвуют в нативной FormData,
даже когда скрыты; ещё не смонтированных или уничтоженных полей в FormData нет.
Tabs не является полем формы и не наследует disabled от Form/ConfigProvider:
доступность навигации задаётся disabled отдельных items. Заголовки используют
button type=button и не отправляют окружающую форму.

Type поддерживает line/card/editable-card, tabPlacement — top, bottom, start, end.
Start/end разрешаются относительно RTL. На экране шириной до 575px вертикальный
список переходит наверх. Переполнение прокручивается; навигация показывает
сфокусированный заголовок без прокрутки всей страницы. Size использует общий
ComponentSize: small/medium/large;
по умолчанию используется ConfigProvider.componentSize. Явный medium имеет
приоритет над размером провайдера.
Тема, compact, RTL и reduced motion применяются через существующие токены.

Source-тема применяет `theme.components.Tabs`: 26 исходных defaults, aliases и
component algorithms. Высоты карточек участвуют в вычислении padding до наложения
явных overrides; zero и undefined сохраняют исходное поведение. More popup наследует
тот же scope, включая CSS-variable prefix и hash. Стандартные native-темы сохраняют
прежнее оформление; source-тема допускает шапку ниже native минимума 32px.
Фикстура `?fixture=tabs-theme` сверяет 15 тем, 10 вариантов в LTR/RTL и popup
с официальным UMD; смена темы сохраняет DOM, черновики, выделение и фокус.

`animated` по умолчанию равен `{ inkBar: true, tabPane: false }`. False отключает обе
анимации, true включает обе без initial appear панели. Объект задаёт переключатели
независимо. `tabPane=true` заменяет весь переданный tabPaneMotion стандартным
`ant-tabs-switch`, включая его callbacks, как в 6.6.8.

Для собственного перехода передайте `animated={{ tabPaneMotion: motion }}` без
tabPane: rc-tabs включает его автоматически. Явное tabPane=false сохраняет motion,
но отключает body animated class. MotionName принимает строку с suffix фаз либо
объект имён. Поддержаны appear/enter/leave flags, leaveImmediately, deadline в ms,
visible/forceRender/removeOnLeave overrides, leavedClassName и lifecycle callbacks.
EventProps.className/style применяются в стабильном состоянии; CSS-фазы перекрывают
их. У скрытой forceRender-панели motion задаёт display:none, у сохранённой панели
leavedClassName перекрывает eventProps.className, как в исходном CSSMotion.
Собственный motionName требует CSS для перехода; положительный motionDeadline
завершает его без CSS end event. Prepare может вернуть Promise и работает даже
при `theme.token.motion=false`. Start/active получают native div и event=null,
возвращают CSS-строку после content styles; end получает native event либо
`{ deadline: true }`. Возврат false из end оставляет переход незавершённым.
Prepare/start читают DOM с prepare classes, active — со start classes.

Во время leave сохраняются DOM, local state и FormData уходящей панели. Aria-hidden
и inert сразу исключают её из навигации; owned focus переходит к новому заголовку.
Быстрое возвращение отменяет уничтожение. OnVisibleChanged вызывается после DOM
commit; первый невидимый mount не вызывает callback. Независимые deadline timers
не задают порядок между панелями, в том числе в upstream.
Native prefers-reduced-motion и живое отключение motion завершают CSS-переходы;
unmount отменяет frames, timers и продолжения prepare. Пустые native panel shells
и согласованный приоритет item destroy сохраняются.

`classNames` и `styles` принимают объект либо чистую функцию `({ props }) => slots`.
Доступны root/item/remove/indicator/body/content/header и popup.root; строка popup
сокращает запись popup.root. Styles используют CSS-строки. Remove применяется
к кнопкам удаления и в заголовках, и в More. Callback получает source size:
undefined без явного размера у компонента/провайдера, физический tabPlacement до
mobile fallback и items с нормализованным destroyOnHidden.
Остальные поля сохраняют переданные Svelte props; bind:activeKey остаётся живым.

`ConfigProvider.tabs` задаёт class/style, semantic slots, add/remove/more icons и
indicator. Отсутствующий record наследуется; явно переданный объект
во вложенном провайдере заменяет его целиком, как в Ant Design. Классы провайдера
и компонента накапливаются. Порядок root CSS: provider styles.root → provider style
→ local styles.root → local style; tabBarStyle идёт после styles.header.
Semantic indicator styles идут после вычисленной геометрии линии.

```svelte
<ConfigProvider tabs={{
  classNames: { header: 'section-tabs' },
  styles: { item: 'padding-inline:12px' },
  indicator: { size: 24, align: 'start' }
}}>
  <Tabs {items} classNames={{ content: 'section-panel' }} />
</ConfigProvider>
```

У More сохраняется исходный порядок: локальное more.icon, затем глобальные
tabs.more.icon ?? tabs.moreIcon, затем локальное moreIcon. Явное локальное
more.icon, включая null/false/undefined, перекрывает fallback. Глобальный tabs.more
использует только icon, как в 6.6.8; trigger и остальные параметры задаются локально.
Собственные поля more.overlayClassName/overlayStyle перекрывают semantic popup.root, даже при явном undefined.

`rootClassName` добавляет класс корню; нативные title/data-атрибуты и обработчики
передаются HTMLDivElement. `bind:nativeElement` предоставляет сам корневой div
после mount и очищается при unmount; SSR его не заполняет. Это Svelte binding,
без React ref wrapper. Aria-label/aria-labelledby сохраняют прежнее назначение:
именуют tablist. Обновления config/semantic styles сохраняют DOM, draft и фокус.

`indicator={{ size: 12.5, align: 'center' }}` задаёт длину и выравнивание линии.
Size также принимает чистую функцию `(origin) => origin - 20`: origin — полная
ширина горизонтального или высота вертикального заголовка с дробной точностью.
По умолчанию используется полный размер и align=center; start/end учитывают RTL.
Нули и отрицательные значения передаются в CSS без ограничения. Nullish
indicator.size наследует ConfigProvider.tabs.indicator.size.
Align наследуется отдельно.
Формулы, включая
end transform в RTL, повторяют rc-tabs 1.13.0. Измерение выполняется после mount;
SSR не вызывает size callbacks. Обновление откладывается на кадр, а сравнение
округлённых значений подавляет дрожание индикатора. Смена indicator не сбрасывает
прокрутку и не меняет фокус, выбранную вкладку или состояние панели.

OnTabScroll получает `{ direction: 'left' | 'right' | 'top' | 'bottom' }` при
изменении native scroll заголовков на текущей оси. Направления физические,
в том числе в RTL; фокусировка заголовка тоже может вызвать прокрутку.
Повторные scroll events при прежней позиции не вызывают callback. Браузер
может объединять соседние изменения в одно native событие; согласованная
прокрутка остаётся нативной, вместо transform/wheel/touch механизма React.
Смена callback не сбрасывает позицию, listener удаляется при unmount.

Centered=true центрирует горизонтальный список заголовков, пока хватает места.
Как в исходной реализации, вертикальный список растягивается по высоте, а
заголовки остаются сверху. TabBarGutter
задаёт отступ в px перед всеми заголовками, кроме первого, и перед кнопкой
добавления, если список не пуст. Нулевое значение убирает исходный отступ;
дробные и отрицательные значения сохраняются. По горизонтали используется
margin-inline-start с учётом RTL, по вертикали — margin-top; при мобильном
переходе наверх меняется и ось отступа. TabBarStyle принимает CSS-строку для
всей панели заголовков, включая extra content. Корневой style действует отдельно.
Например: `<Tabs {items} centered tabBarGutter={12} tabBarStyle="margin-bottom:8px" />`.

TabBarExtraContent задаёт правый слот либо { left, right }: string/number/boolean/
Snippet. Слоты находятся вне tablist и допускают нативные интерактивные controls;
они не участвуют в навигации стрелками. Как @rc-component/tabs 1.13.0, falsy extra
(включая 0) не создаёт wrapper; числовой label=0 при этом отображается.

В editable-card `onEdit(target, action)` запрашивает изменение у владельца:
add получает native click event, remove — строковый key, включая пустой.
Items и activeKey меняет владелец; edit сам по себе не вызывает onChange/onTabClick.
HideAdd=true скрывает добавление. Disabled и closable=false запрещают удаление;
closeIcon=null/false скрывают кнопку только при не заданном closable.
Closable=true сохраняет кнопку и использует fallback иконки. Приоритет —
truthy closeIcon, removeIcon, затем «×»; nullish removeIcon использует CloseOutlined.
Falsy addIcon использует PlusOutlined. Boolean true создаёт пустую иконку,
сохраняя доступное имя кнопки. Иконки — пассивные TabsContent/Snippet.

Delete/Backspace и средняя кнопка мыши запрашивают удаление и перемещают фокус
вперёд, а для последней доступной вкладки — назад; disabled пропускаются.
Это происходит и при отказе владельца менять items. Обычный click на close
не активирует вкладку. Фокус, явно заданный владельцем снаружи Tabs, сохраняется.
Close выбранной вкладки и Add доступны через Tab; остальные close имеют tabindex=-1.
Locale.addAriaLabel/removeAriaLabel задают имена с defaults «Add tab»/«remove».
Locale.dropdownAriaLabel именует listbox скрытых вкладок, по умолчанию «expanded dropdown»;
явная пустая строка сохраняется.

```svelte
<script lang="ts">
  import { Tabs, type TabsItem } from 'antd-svelte';

  let items = $state<TabsItem[]>([{ key: 'first', label: 'Первая вкладка' }]);
  let next = 1;
</script>

<Tabs type="editable-card" aria-label="Разделы" {items}
  locale={{ addAriaLabel: 'Добавить вкладку', removeAriaLabel: 'Закрыть вкладку' }}
  onEdit={(target, action) => {
    if (action === 'add') {
      const key = `new-${next++}`;
      items = [...items, { key, label: 'Новая вкладка' }];
    } else if (typeof target === 'string') {
      items = items.filter(item => item.key !== target);
    }
  }} />
```

При переполнении More показывает вкладки вне видимого диапазона, включая частично
обрезанные и disabled. Native scroll сохраняется; Add переходит в блок операций
с сохранением DOM-узла, фокуса и исходного card gutter. Определение мобильного
устройства повторяет default is-mobile 5.0.0, отдельно от breakpoint расположения:
на мобильном user agent More скрыт, прокрутка и Add остаются доступны.

More открывается через hover с задержками 0.1/0.1 секунды. `more.trigger` также
поддерживает click, focus, contextMenu и массив событий. `showAction` и `hideAction`
раздельно заменяют действия открытия и закрытия; пустой массив отключает сторону.
У contextMenu исходное закрытие — click. Hover без click получает touch toggle;
после touch hover игнорируется до следующего обработанного click.
Закрывающий focus срабатывает на blur кнопки, включая переход внутрь popup,
как в исходном Trigger.
ArrowDown/Enter/Space на
кнопке открывают список без выбора; Up/Down затем меняют активный пункт, пропуская
disabled. Первый Up сохраняет исходный выбор предпоследнего enabled-пункта.
Tab переносит фокус в список; его стрелки/Home/End двигают фокус по native options.
Выбор с кнопки More при hover оставляет список открытым, клик по option закрывает.
Клавиатурный выбор использует native click: публичный onTabClick по-прежнему получает
MouseEvent, включая его подтип PointerEvent. Close вызывает только onEdit, не закрывая
список; items меняет владелец. Escape сначала закрывает вложенную поверхность,
затем More, затем содержащий Modal.

`more.icon` перекрывает исторический moreIcon, включая null/false/0 и пустую строку.
Без них используется исходный EllipsisOutlined; явно заданный more.icon=undefined
даёт строку «More», как rc-tabs. У пустой декоративной кнопки остаётся native имя
«ellipsis». More принимает placement, mouseEnterDelay/mouseLeaveDelay, autoFocus,
minOverlayWidthMatchTrigger, overlayClassName/overlayStyle, onOverlayClick и
getPopupContainer; CSS styles задаются строкой. Корневой getPopupContainer
также поддерживается; одноимённый more override имеет приоритет,
включая явно заданный undefined. Portal сохраняет тему и собственные CSS variables popup.
ConfigProvider.getPopupContainer наследуется, если корневой prop Tabs отсутствует.
Явный root getPopupContainer=undefined выключает provider, как исходный spread props.
More имеет следующий приоритет, включая собственный undefined. Эти правила сохраняются
в props стандартной панели при renderTabBar; semantic callbacks получают raw props.

Выравнивание More повторяет rc-dropdown/rc-trigger 3.10.1. `placements` заменяет
таблицу целиком, `builtinPlacements` имеет приоритет; его явный undefined даёт пустую
таблицу Trigger. `align` неглубоко перекрывает выбранный placement, в том числе весь
overflow. Points физические и не отражаются в RTL. Offset и targetOffset принимают
числа или проценты от popup и target соответственно. Поддержаны flip/shift, исходное
значение adjust=0, области htmlRegion visible/scroll/visibleFirst и dynamicInset
для right/bottom, включая legacy _experimental.dynamicInset. Старые useCssRight,
useCssBottom, useCssTransform и ignoreShake исходный 3.10.1 не использует.

`alignPoint` использует последнюю client-точку click/hover/contextMenu. Без точки
keyboard/touch используют кнопку. В point mode default stretch выключен;
minOverlayWidthMatchTrigger=true включает его, собственный undefined выключает.
Point menu с click-hide закрывается при scroll/resize; hover сохраняет точку,
включая уход кнопки за viewport. `onPopupAlign` получает popup и фактический align
после flip, перед записью offsets. Количество вызовов не фиксируется; idle frames
не создают callback loop. При нулевом scale выравнивание/callback пропускается.
CSS overlayStyle имеет приоритет над offsets и arrow variables.

```svelte
<Tabs {items} more={{
  trigger: 'contextMenu',
  alignPoint: true,
  align: { offset: ['10%', 4], overflow: { adjustX: true, adjustY: true } }
}} />
```

`arrow=true` добавляет div-arrow и show-arrow class низкоуровневого Dropdown.
Tabs upstream не задаёт стили этому div; потребитель может оформить его через
semantic popup.root. AutoFocus/Tab работают с overlay, пропуская div-arrow.
AutoFocus запускается при открытии; обновление align/размеров внутри сеанса
сохраняет фокус в пользовательском поле. Смена getPopupContainer callback с тем же
DOM-контейнером сохраняет portal и выделение текста. Flip переключает CSS insets даже тогда,
когда числовые координаты остаются теми же.
Native popover остаётся в fixed top layer и отслеживает изменения layout;
клиппинг предков участвует в расчёте доступной области. Сохраняется измерение
реального border box при пользовательском box-sizing:content-box.
Исходная логика сопровождается MIT-лицензиями
[rc-dropdown](./src/lib/vendor/LICENSE.rc-dropdown) и
[rc-trigger](./src/lib/vendor/LICENSE.rc-trigger).

`more.visible` со значением true/false перекрывает внутренние запросы и onClose.
Как в rc-tabs,
more.onVisibleChange заменяет внутренний pointer/dismiss callback; для controlled
режима передавайте оба поля. Клавиатурное открытие и aria-expanded используют
внутренний флаг OperationNode. Явный more.visible=undefined включает отдельный
uncontrolled Trigger: pointer actions управляют popup, а keyboard/onClose меняют
только флаг OperationNode. В этой ветке Dropdown не добавляет open class и не
переносит фокус по autoFocus/Tab. Изменение visible сбрасывает внутреннее значение
Trigger, как useControlledState исходника.

PopupRender получает menu Snippet и { restTabs, onClose }; `more.overlay` — Snippet,
который заменяет и menu, и popupRender. Клавиатурный выбор с More работает даже
без исходного menu DOM. Содержимое ленивое и сохраняется после
первого открытия. `autoDestroy=true` удаляет его вместе с popup после leave end;
повторное открытие во время leave сохраняет DOM/state. Уходящая поверхность остаётся
aria-hidden/inert и не перехватывает Escape у следующего popup/Modal.

По умолчанию More использует ant-slide-up с placement overrides. `transitionName`
задаёт другой CSS motion prefix; пустая строка отключает motion. Непустой animation
имеет приоритет и добавляет префикс ant-tabs-dropdown-. CSS для собственного имени
задаёт потребитель. Theme motion=false и reduced motion завершают переход;
`openClassName` заменяет класс открытой кнопки, пустая строка убирает его.
Прежний native SSR shell сохраняется без содержимого; при autoDestroy=true его нет.

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Tabs, type TabsMoreRenderInfo } from 'antd-svelte';

  const items = Array.from({ length: 12 }, (_, index) => ({
    key: String(index),
    label: `Вкладка ${index + 1}`
  }));
</script>

{#snippet popup(menu: Snippet, info: TabsMoreRenderInfo)}
  {@render menu()}
  <button type="button" onclick={info.onClose}>Закрыть список</button>
{/snippet}
<Tabs {items} aria-label="Разделы" more={{ trigger: 'click', popupRender: popup }} />
```

`renderTabBar` получает разрешённые props навигации и Snippet стандартной панели.
Он может обернуть её, заменить props или построить собственную шапку:

```svelte
<script lang="ts">
  import { Tabs, type TabsDefaultTabBar, type TabsTabBarProps } from 'antd-svelte';

  const items = [{ key: 'profile', label: 'Профиль' }, { key: 'history', label: 'История' }];
</script>

{#snippet bar(props: TabsTabBarProps, DefaultTabBar: TabsDefaultTabBar)}
  <div class="custom-bar">
    {@render DefaultTabBar({ ...props, className: 'custom-header', style: 'padding-top:8px' })}
  </div>
{/snippet}
<Tabs {items} renderTabBar={bar} />
```

Стандартной панели передают полный набор props через spread. Её overrides меняют
только навигацию: например, activeKey управляет выделением заголовка, а активная
панель остаётся под управлением Tabs. Переданный onTabClick выполняет native выбор;
его можно заменить или вызвать из своего обработчика. KeyboardEvent из полностью
пользовательской шапки преобразуется в MouseEvent для публичного onTabClick,
сохраняя modifiers, target/currentTarget и отмену события.
Callback-ref `ref` предоставляет DOM-узел стандартной панели и получает null
при замене ref или unmount; во время SSR он не вызывается.

Сохраняется native наследование темы popup. В исходном UMD замена
more.overlayClassName может удалить служебный CSS-variable scope и сбросить цвет
текста до browser default; native portal продолжает наследовать тему Tabs.

`children` стандартной панели — Snippet `(node, item, attributes)`. Он оборачивает
каждый заголовок; `node(overrides)` дополняет или заменяет его исходные DOM attributes.
Attributes позволяют сохранить class/style/handlers и добавить Svelte attachments.
Как в исходном TabNode, внешний узел отделён от нативной кнопки tab: её клик
останавливает всплытие до внешнего onclick. Для перехвата выбора всей шапки
используйте props.onTabClick. Перестановка items и интеграция с drag-and-drop
остаются у владельца, как в официальном примере.

Собственная шапка отвечает за клавиатуру и ARIA. Публичный
`getTabsItemId(props.id, key, 'tab' | 'panel')` связывает её controls с native
панелями, включая пустые и Unicode keys. Панели, их состояние и корневой ref
не пересоздаются при обновлении или замене renderer'а. Точные типы находятся в
[tabs-nav.types.ts](src/lib/tabs-nav.types.ts).
Поля tabPosition/popupClassName стандартной панели следуют текущему интерфейсу
TabNavList закреплённого rc-tabs; они независимы от удалённых корневых props Tabs.

Фикстура `?fixture=tabs-editable` сверяет truthiness, иконки и размеры с Ant Design
6.6.8 и @rc-component/tabs 1.13.0. Проверяются callbacks, принятие/отказ владельца,
фокус, FormData, layout/RTL и сохранение панелей. Фикстура `?fixture=tabs-layout`
сравнивает centered/gutter/header style с 31 эталоном официального UMD, включая
все типы и положения в LTR/RTL, нулевой отступ и пустой editable список.
Здесь же проверяются medium, наследование размера и сохранение панелей
при смене расположения.
Галерея `/ant-design#tabs`
показывает профиль, настройки, историю Table, destroyOnHidden и Tabs внутри Modal.
Фикстура `?fixture=tabs-overflow` сверяет 35 эталонов More из официального UMD:
скрытые вкладки, CSS метрики, SVG, icon precedence, RTL и locale. Проверяются также
keyboard, control/owner callbacks, popupRender, portal, вложенные поверхности и focus.
Фикстура `?fixture=tabs-more-runtime` сверяет lifecycle, overlay precedence,
раздельные actions/touch, visible=undefined и motion phases с 33 эталонами UMD.
Здесь же проверяются autoDestroy после leave, reversal, смена motion и cleanup portal.
Фикстура `?fixture=tabs-more-position` сверяет 51 эталон геометрии официального UMD:
placements, offsets, overflow/regions, point targeting, arrow, callback payload и
container. Живые проверки защищают DOM/state/draft/selection/focus, callback loop,
scroll/resize, уход anchor за viewport и cleanup. Общий числовой engine проверяется
также прежними сценариями Tour.
Фикстура `?fixture=tabs-indicator` сверяет 52 эталона indicator из
официального UMD и направления onTabScroll в восьми сочетаниях RTL/placement.
Здесь же проверяются сохранение DOM, focus, More, прокрутки и cleanup кадров/listeners.
Фикстура `?fixture=tabs-semantic` сравнивает 22 эталона semantic slots, CSS-слоёв,
callback props, provider inheritance и icon precedence с официальным UMD.
Проверяются native attrs/events/ref и живое обновление открытого popup.
Фикстура `?fixture=tabs-motion` сверяет 41 UMD-эталон фаз, CSS, callbacks,
приоритетов, RTL и lifecycle; дополнительно проверяются незавершённые переходы,
FormData, focus, reversal, end=false, async prepare, reduced motion и cleanup.
Восемь сценариев задают per-item class/style, semantic/motion precedence, hidden
forceRender и RTL; живое обновление проверяется также во время перехода.
Фикстура `?fixture=tabs-render` сверяет 35 UMD-эталонов props, overrides,
per-tab wrappers/attributes, callbacks, More, RTL и пустого editable набора.
Проверяются также SSR, native keyboard/cancellation, attachments и обновления
шапки без потери DOM/state/draft/selection/focus и открытого More.
Остаются произвольный prefixCls и общий ConfigProvider.getPopupContainer;
приоритет уничтожения панелей сохраняет native v1.
Полные low-level Dropdown props в more ещё не перенесены: arrow, align/alignPoint,
placements, showAction/hideAction, onPopupAlign, autoDestroy, raw overlay и motion/prefix.

## Collapse

```svelte
<script lang="ts">
  import { Collapse, Input, type CollapseActiveKey } from 'antd-svelte';

  let activeKey = $state<CollapseActiveKey>(['contacts']);
</script>

{#snippet contacts()}<label>Имя<Input defaultValue="Анна" /></label>{/snippet}
{#snippet preferences()}<p>Настройки участника.</p>{/snippet}

<Collapse
  aria-label="Анкета участника"
  bind:activeKey
  items={[
    { key: 'contacts', label: 'Контакты', children: contacts },
    { key: 'preferences', label: 'Настройки', children: preferences }
  ]}
/>
```

`items` принимает readonly-массив CollapseItem: необязательный строковый/числовой
key, label, children и extra (scalar, вложенный readonly-массив или Snippet),
collapsible, showArrow, forceRender и destroyOnHidden. Без key используется
строковый индекс; числа преобразуются в строки. Пустой ключ допустим; при повторении
используется первое вхождение. Ключ сохраняет экземпляр панели и фокус при
перестановке. Интерактивные элементы размещаются в extra или children; label
должен давать кнопке доступное имя и не содержать других controls.
Extra находится рядом с заголовком, вне кнопки раскрытия: его действия не
переключают панель. Id/class/style относятся к корневому контейнеру;
aria-label или aria-labelledby именует группу.

`bind:activeKey` принимает строку, число или readonly-массив таких ключей. Активация пользователем
сначала записывает в binding новый массив, затем вызывает onChange с отдельным
массивом; изменение массива callback не меняет значение владельца. Затем вызывается
item.onItemClick со строковым ключом. Ключи дедуплицируются с сохранением порядка активации. DefaultActiveKey читается при
создании; без начального значения все панели закрыты, в том числе в accordion.
Для binding задавайте начальное значение у владельца без defaultActiveKey.
Внешние изменения, defaults и переключение accordion не вызывают onChange.

Без accordion можно открыть несколько панелей. В accordion отображается только
первый запрошенный ключ; повторная активация закрывает его. Неизвестные ключи
сохраняются без подстановки другой панели и без перезаписи владельца. Отключение
accordion снова показывает остальные запрошенные панели. Удаление item не
удаляет его ключ из значения владельца. Пустой items показывает locale.emptyText.

Collapsible поддерживает header (вся кнопка заголовка), icon (только стрелка
для указателя) и disabled. Enter/Space активируют нативную кнопку и в режиме
icon. Значение item переопределяет общее, включая header поверх disabled.
ShowArrow=false скрывает стрелку; вместе с icon используется header, чтобы
сохранить доступную зону активации. Disabled запрещает переключение пользователем,
но не скрывает панель, открываемую владельцем. Collapse не наследует disabled
от Form/ConfigProvider; поля внутри получают собственный контекст.

Каждый заголовок содержит button type=button внутри heading. HeadingLevel
задаёт уровень 2–6 (по умолчанию 3); вложенному Collapse задавайте следующий
уровень. Aria-expanded/aria-controls связывают кнопку с содержимым. В accordion
и группах до шести items панели получают именованный role=region; в больших
группах без accordion лишние landmarks не создаются. Все доступные заголовки,
extra и поля обходятся обычным Tab; стрелки не перехватываются. Escape остаётся
содержащему Modal. При скрытии сфокусированного содержимого фокус возвращается
к его доступному заголовку. При удалении/disabled заголовка выбирается открытый
доступный заголовок, затем первый доступный либо сама группа. Изменения при
фокусе снаружи Collapse не перемещают его внутрь.

Содержимое впервые монтируется при открытии и по умолчанию сохраняет локальный
state и DOM-черновики в скрытой панели. DestroyOnHidden=true удаляет содержимое
при закрытии; отключение этой настройки не монтирует уже уничтоженную панель.
Значение item переопределяет общее, включая false. ForceRender=true монтирует
содержимое сразу и сохраняет его даже с destroyOnHidden. Удаление key уничтожает
панель; состояние вне неё сохраняется. Скрытые сохранённые панели остаются в DOM,
их таймеры и подписки продолжают работать. Поля посещённых/forceRender-панелей
участвуют в FormData даже при скрытии; ещё не смонтированных или уничтоженных
полей в FormData нет. Перед фокусом ошибки скрытой панели владелец формы должен
открыть её. Кнопки заголовков не отправляют окружающую форму.

Size использует small/medium/large и ConfigProvider.componentSize. Bordered=false
убирает внешнюю рамку, ghost — фон и разделители. ExpandIconPlacement задаёт
start/end относительно кнопки заголовка и направления RTL; extra остаётся
отдельным элементом после заголовка. ExpandIcon — Snippet с данными панели:
isActive, header, panelKey, prefixCls, исходными showArrow/collapsible/accordion
и объединёнными item slots. Его onItemClick переключает доступную панель и вызывает
root/item callbacks. Пользовательская стрелка не поворачивается автоматически.

ConfigProvider.collapse задаёт expandIcon, class/style и classNames/styles;
локальная стрелка приоритетнее контекстной. Вложенный явный record заменяет
родительский. Semantic object/function slots: root, header, title, body, icon.
Callback получает props с разрешёнными size, bordered и expandIconPlacement.
Root style: context slots → context style → local slots → local style; component
variables идут перед ними. Item slots добавляют classes и перекрывают styles.
Header slot применяется к нативной кнопке, body — к внутреннему содержимому;
extra остаётся вне кнопки. Item id/class/style и data/ARIA относятся к обёртке
панели, rootClassName — к корню. Bind:nativeElement и bind:ref получают HTMLDivElement
после mount и очищаются при unmount. Смена config/theme/prefix сохраняет панели и поля.

Theme.components.Collapse подключает все десять токенов: headerPadding/SM/LG,
headerBg, contentPadding/SM/LG, contentBg, borderlessContentPadding/Bg. Aliases,
component algorithm, cssVar prefix/key, dark и compact используют общий механизм
темы. Local prefixCls поддерживается CSS template из того же закреплённого архива;
все 49 CSS rules воспроизводятся инструментом. Высота содержимого меняется сразу;
анимируется только стрелка, с учётом reduced motion.

Галерея `/ant-design#collapse` показывает анкету, вложенные панели, сохранение
черновиков, destroyOnHidden и независимую кнопку сброса в extra. Сброс примера
пересоздаёт поля с исходными значениями, сохраняя открытые внешние панели.
Item поддерживает headerClass, HTML attributes, native lowercase events и camelCase
aliases (включая Capture). Click/capture/bubble/stopPropagation/preventDefault,
focus/blur, key и mouse traces сверяются с оригиналом. События остаются native DOM:
React SyntheticEvent и его input/change normalization не создаются. Enter/Space
сохраняют порядок активации нативной кнопки, включая возможность отменить default.
Item.ref — callback с node после mount и null при замене ref или unmount; стабильный
callback не вызывается повторно из-за label updates. Он использует post-DOM lifecycle
Svelte; React RefObject не мутируется.

React-анимация высоты пока не перенесена. Native group, heading/button/region,
ARIA-связи, Space, full button hit area, независимость extra, focus recovery
и icon/showArrow fallback сохранены; это явные отличия от DOM React. Пустой custom
expandIcon Snippet сохраняет wrapper. Глобальный ConfigProvider.prefixCls и React
DEV diagnostics пока не поддерживаются.

## Modal

Modal сохраняет нативный dialog, `bind:open`, footer/children snippets и существующие
правила onOk/onCancel, confirmLoading, Escape и закрытия по фону.
Закрытие по фону настраивается через mask={{ closable: false }}; по умолчанию
разрешено. Прежний maskClosable удалён. Остальные настройки mask пока не перенесены.

`theme.components.Modal` настраивает header/content/footer background, title color,
font size/line height, внутренние отступы и wireframe. Поддерживаются aliases,
component algorithms, CSS lengths и custom prefix; Button/Input внутри сохраняют
собственные tokens. Source close wrapper задаёт размер иконки; legacy-размер сохранён.
Тема обновляется без потери модальности, DOM, draft, selection и focus, включая
getContainer. Нативное центрирование и резерв места title под close сохранены.
[Сверка с официальным UMD](./docs/reference/theme-context.md#тема-modal) не означает
поддержку пока отсутствующих static confirm methods и полного render/config API.

GetContainer принимает DOM-узел, DocumentFragment (включая ShadowRoot), CSS-селектор,
функцию без аргументов либо false. Локальное undefined использует
ConfigProvider.getPopupContainer; Modal вызывает глобальный getter без trigger,
как Ant Design 6.6.8. False оставляет DOM на месте и отключает global fallback.
Без обеих настроек сохраняется прежнее native-размещение.

```svelte
<script lang="ts">
  import { Modal } from 'antd-svelte';
  let open = $state(false);
</script>

<button type="button" onclick={() => open = true}>Открыть редактор</button>
<div id="modal-container"></div>
<Modal bind:open title="Редактор" getContainer="#modal-container">
  <input name="description" aria-label="Описание" />
</Modal>
```

Getter вызывается только после browser mount, в том числе у закрытого Modal.
Первый перенос готового контейнера сохраняет SSR DOM. Смена функции с тем же
контейнером сохраняет содержимое, draft, выделение и фокус; смена самого
контейнера пересоздаёт dialog и содержимое, как React portal. Отсутствующий
selector или пустой результат getter используют body. Для отключённого DOM-узла
и DocumentFragment открытие ждёт вставки в document. Стили ShadowRoot подключает
потребитель. Нативная модальность, fullscreen-размещение, inert, scroll lock и
возврат фокуса сохраняются в любом контейнере. Прежний SSR shell и eagerly mounted
children сохранены; полное API Modal, semantic styles и render hooks ещё требуют переноса.

Эталонные зависимости — @rc-component/dialog 1.10.0 и portal 2.1.3;
лицензии сохранены в [LICENSE.rc-dialog](./src/lib/vendor/LICENSE.rc-dialog) и
[LICENSE.rc-portal](./src/lib/vendor/LICENSE.rc-portal).
Сверка Modal/Drawer использует 36 снимков официального UMD,
[browser-проверки](./tests/browser/dialog-container.spec.ts) и
[проверки взаимодействия](./tests/browser/dialog-container-interaction.spec.ts),
фикстура — `?fixture=dialog-container`.

## Drawer

```svelte
<script lang="ts">
  import { Button, Drawer, Input } from 'antd-svelte';

  let open = $state(false);
</script>

{#snippet footer()}<Button onclick={() => { open = false; }}>Закрыть</Button>{/snippet}

<Button onclick={() => { open = true; }}>Редактировать</Button>
<Drawer bind:open title="Карточка участника" {footer}>
  <label>Имя<Input defaultValue="Анна" /></label>
</Drawer>
```

Drawer v1 — модальная панель на нативном dialog. `bind:open` передаёт запрос
видимости владельцу; без binding компонент может закрываться самостоятельно.
Начальное open=true подготавливает содержимое в SSR и открывает настоящий
модальный dialog после гидратации. Атрибут open не выводится в SSR, чтобы
избежать промежуточного немодального окна.

Title принимает строку или пассивный Snippet, children/extra/footer — Snippet.
Заголовок использует h2; интерактивные действия размещайте в extra/footer.
Без footer нижняя область отсутствует. Без title именуйте dialog через
aria-label или aria-labelledby. Внешнее aria-labelledby имеет приоритет;
aria-label заменяет автоматически созданную связь с визуальным title.
Aria-describedby связывает внешнее описание. Id/class/style относятся к
корневому dialog; дополнительные semantic classNames/styles не поддерживаются.

Placement — физическая сторона top/right/bottom/left, по умолчанию right.
RTL меняет направление содержимого, сохраняя выбранную сторону. Size задаёт
ширину для left/right и высоту для top/bottom: default=378px, large=736px,
положительное число в px или корректную CSS-длину, например 50% или 30rem.
Размер ограничен viewport; пустая строка и неположительное/нефинитное число
используют default. Header и footer остаются на месте, длинное body прокручивается.

Closable=false убирает кнопку закрытия. Keyboard=false отключает закрытие по
Escape. Mask принимает объект с closable (по умолчанию true) и blur (false).
Закрытие по фону требует начала и конца основного pointer-действия на фоне;
перетаскивание из панели или в панель не закрывает её. Маска всегда включена,
фон страницы остаётся inert. Drawer не наследует disabled от Form/ConfigProvider;
его поля и пользовательские кнопки получают собственный контекст.

Пользовательское закрытие сначала записывает open=false в binding, затем
вызывает onClose(Event) один раз: click для кнопки, cancel для Escape,
pointerup для фона. Callback уведомляет о запросе и не отменяет его.
Изменение open владельцем, нативный dialog.close() и удаление компонента
не вызывают onClose. Нативное закрытие синхронизирует binding; позднее событие
старого закрытия не закрывает заново открытый dialog.

При открытии фокус получает первый доступный control; без controls — сам
dialog. Нативная модальность удерживает фон inert и ограничивает Tab;
после закрытия фокус возвращается к доступному opener. Select, Tooltip и
Popover потребляют свой Escape раньше Drawer. Поддерживается стек с Modal
и другими модальными Drawer без push. Прокрутка страницы заблокирована,
пока остаётся открытый модальный Drawer или Modal.

Содержимое ленивое и после первого открытия сохраняет локальный state и
DOM-черновики в закрытом dialog. ForceRender монтирует его сразу и сохраняет
даже при destroyOnHidden. DestroyOnHidden удаляет header/body/footer после
завершения ухода панели; отключение настройки не монтирует уничтоженное
содержимое заново. Удаление Drawer уничтожает его содержимое и освобождает
модальность. Состояние, хранимое снаружи, не сбрасывается.
Сохранённые скрытые поля остаются в DOM и нативной FormData своей формы;
их таймеры и подписки продолжают работать. Для фокуса ошибки закрытую панель
сначала должен открыть владелец формы.

Панель выдвигается от выбранной стороны, маска меняет прозрачность.
При запросе закрытия dialog сохраняет модальность до завершения анимации.
Повторное открытие прерывает уход без уничтожения черновика. Reduced motion
отключает анимацию; изменение этой настройки завершает текущую анимацию.
`theme.components.Drawer` настраивает zIndexPopup, footerPaddingBlock и
footerPaddingInline, aliases и component algorithms. Пользовательский style
корневого dialog сохраняет приоритет. Title наследует цвет панели, как 6.6.8;
Button и Input внутри сохраняют собственные tokens. DraggerSize вычисляется
как в upstream, но resize-handle пока не реализован.
Обновление темы и inherit reset сохраняют модальность, DOM, draft, selection
и focus, в том числе после переноса через getContainer. Legacy-темы сохраняют
прежнее оформление. [Сверка с UMD и проверки](./docs/reference/theme-context.md#тема-drawer)
учитывают типографику внешнего ConfigProvider: в React она задана на статическом
host через публичный theme.useToken(), в Svelte — на DOM-контейнере provider.

Галерея `/ant-design#drawer` редактирует строку Table через Form с валидацией,
Tabs и Collapse. Черновик сохраняется при закрытии той же карточки; переход
к другому участнику создаёт отдельный редактор. DestroyOnHidden пересоздаёт
редактор из сохранённой строки. Сохранение обновляет Table и закрывает панель.
Первая версия не поддерживает немодальный режим, mask=false, resizable, push,
loading/Skeleton, focusable и afterOpenChange.

GetContainer поддерживает те же DOM-узлы, DocumentFragment, selectors, функции и
false, что [Modal](#modal). Undefined наследует ConfigProvider.getPopupContainer;
Drawer передаёт ему document.body, как Ant wrapper. Getter вызывается и в закрытом
состоянии, кроме destroyOnHidden без forceRender, пока содержимое не требуется.
Смена контейнера пересоздаёт панель и отменяет прежнюю анимацию; замена функции
с тем же контейнером сохраняет DOM/state/focus. Нативные SSR, lifecycle children,
модальность и fullscreen-геометрия сохранены. Source absolute-размещение inline
Drawer при getContainer=false ещё не перенесено: false пока выбирает исходную
DOM-ветку. Эталон — @rc-component/drawer 1.4.2 и portal 2.1.3;
[LICENSE.rc-drawer](./src/lib/vendor/LICENSE.rc-drawer) сохранена в пакете.

## Alert

```svelte
<script lang="ts">
  import { Alert, Button } from 'antd-svelte';

  let revision = $state(0);
</script>

{#key revision}
  <Alert
    type="warning"
    title="Есть несохранённые изменения"
    description="Сохраните настройки перед выходом."
    showIcon
    closable
  />
{/key}
<Button onclick={() => { revision++; }}>Показать сообщение снова</Button>
```

Type поддерживает success/info/warning/error, по умолчанию info. Variant —
outlined или filled; filled сохраняет фон статуса и убирает видимую рамку.
Banner убирает рамку и скругления; без явно заданных type/showIcon использует
warning и видимую иконку. В обычном режиме showIcon=false.

Title/description/icon/action принимают строку, число, boolean, null, Snippet
и вложенные массивы такого содержимого. Null/undefined/false/пустая строка не
создают title/description/actions; 0, true и массивы создают контейнеры,
но boolean не выводится текстом. Явные 0/false/пустая строка сохраняются. Snippet
считается присутствующим; условное отсутствие содержимого выражайте через
undefined у владельца. Description включает увеличенные отступы и иконку.
Icon декоративный и отображается только при showIcon, включая пользовательский
snippet. Для интерактивных controls используйте description/action;
icon и closable.closeIcon не должны содержать интерактивных элементов.
Действия не закрывают Alert и не вызывают callbacks закрытия.

Без ConfigProvider.alert закрытие отключено по умолчанию. True добавляет кнопку type=button с
ConfigProvider.locale.closeText. Объект дополнительно поддерживает disabled,
closeIcon (строка или Snippet), aria-label/aria-labelledby/aria-describedby,
onClose(MouseEvent) и afterClose(). Пользовательский текст closeIcon остаётся
декоративным содержимым; доступное имя задаётся через aria-label или локаль.
Явный boolean closable приоритетнее context, а объект включает кнопку.
Содержимое задаёт truthy local closable.closeIcon, затем context closable.closeIcon.
Пустой local closable.closeIcon='' сохраняет пустую кнопку; Source выбирает fallback.
Callbacks задаются в локальном closable.
Disabled запрещает закрытие, сохраняя действия. Alert не наследует disabled
от Form/ConfigProvider; вложенные controls используют собственный контекст.

Enter/Space и нажатие на кнопку запускают закрытие ровно один раз. OnClose
уведомляет о запросе и не отменяет его через preventDefault; callbacks
фиксируются на момент запроса. После onClose панель плавно сворачивается.
Во время ухода содержимое остаётся в DOM, но получает inert и aria-hidden.
AfterClose вызывается после удаления содержимого, включая при reduced motion.
Удаление или замена компонента отменяет анимацию и ожидающий afterClose.
При включении reduced motion текущий уход завершается сразу.

Закрытый экземпляр остаётся закрытым при изменении props. Для повторного показа
создайте новый экземпляр через условное монтирование или новый key; публичного
open/bind:open нет. Изменение типа и содержимого открытого сообщения сохраняет
его дочерние экземпляры. SSR показывает открытое сообщение без вызова callbacks;
анимация запускается только при пользовательском закрытии.

Role по умолчанию alert с неотложным объявлением, как в Ant Design. Для обычного
результата действия задавайте role=status с мягким объявлением. Aria-atomic=true
по умолчанию; aria-live и aria-atomic можно переопределить. Aria-label,
aria-labelledby и aria-describedby именуют и описывают корневой контейнер.
Id/class/style, data-* и остальные aria-* также относятся к корню.
OnClick/onMouseEnter/onMouseLeave уведомляют о событиях контейнера; controls остаются
нативными, stopPropagation в onClose предотвращает root click. Появление и обновление не перемещают
фокус. При закрытии фокус из сообщения переходит к следующему доступному control
в DOM, затем к предыдущему либо содержащему нативному dialog. Поиск внутри
Modal/Drawer ограничен активным dialog. Фокус снаружи и фокус, выбранный onClose
у владельца, сохраняются. Иконки не добавляют остановок Tab. Кнопка закрытия
использует естественную клавиатуру и не отправляет окружающую форму;
тип пользовательских action-кнопок задаёт их владелец.

ConfigProvider.alert поддерживает variant, closable с closeIcon, четыре status icons,
class/style и object/function classNames/styles для root/icon/section/title/
description/actions/close. Undefined наследует record, явный объект заменяет его
целиком. Callbacks получают входные props с разрешёнными prefixCls/variant/type/
showIcon/boolean closable. Root style priority: provider.styles.root → provider.style
→ local.styles.root → local.style. Local prefixCls/rootClassName и bind:nativeElement/ref
поддержаны; refs присваиваются после mount и очищаются при unmount. Ref хранит snapshot
root, включая отсоединённый узел после закрытия; nativeElement отражает текущий DOM.
Обновления оформления сохраняют DOM, поля, focus и selection.

Все четыре [токена Alert](docs/reference/theme-context.md#токены-alert), aliases и
component algorithm применяются перед semantic/user styles. Source theme использует
fitted viewBox статусных иконок из icons-svg 4.6.0; legacy сохраняет прежний viewport.
На ширине
до 575px action переносится на отдельную строку, оставляя место длинному тексту.
Кнопка закрытия имеет зону не меньше 24px. Галерея `/ant-design#alert` показывает
настройки сообщения, действие и повторное создание закрытого экземпляра.
Ошибка загрузки `/ant-design#server-table` использует Alert с прежним retry:
текущая страница и query сохраняются.

94 официальных UMD-сценария фиксируют API, computed styles, геометрию status icons,
порядок callbacks и исходные corner cases. Отдельный свежий SSR baseline подтверждает
прежний пустой local closeIcon. Сохранены native atomic/ARIA, локализованное имя,
декоративный close wrapper/glyph/palette, hit target и responsive/focus guards.
WAAPI закрытие сохраняет snapshot callbacks, afterClose после удаления и reduced motion;
в Source afterClose видит ещё подключённый узел. Эти различия исключены из source metrics.
Alert.ErrorBoundary возвращает здоровые children без контейнера. Ошибка дочернего
render или синхронного effect заменяет их на Alert type=error. Title ?? Error.toString()
задаёт заголовок; description ?? Error.stack выводится внутри
pre с font-size:0.9em и overflow-x:auto. Явные 0/false/пустая строка сохраняются,
id относится только к fallback. Изменение props обновляет тот же Alert, но не
сбрасывает ошибку даже при здоровых новых children; для сброса нужен remount/key.
Ошибку самого fallback ловит внешняя ErrorBoundary. Event handlers, отдельные
Promise/timer callbacks и SSR ошибки эта граница не перехватывает, как исходник.
Безопасный SSR сохраняет DOM/focus/selection при hydration, затем умеет показать fallback.

Вместо React componentStack используется доступный Error.stack Svelte/JavaScript;
React recovery diagnostics не воспроизводятся. Эти framework differences отделены
от [16 официальных сценариев](tests/browser/fixtures/ant-design-alert-boundary-reference.json),
SSR, hydration и lifecycle-проверок. Общий ConfigProvider prefix и React diagnostics
ещё не перенесены.

## Message

Создавайте экземпляр у владельца, чтобы компоненты и SSR-запросы не разделяли
очередь. Один экземпляр поддерживает один смонтированный MessageHolder:

```svelte
<script lang="ts">
  import { Button, MessageHolder, createMessage } from 'antd-svelte';

  const message = createMessage({ maxCount: 3 });

  async function save() {
    const close = message.loading({ key: 'save', content: 'Сохраняем…', duration: 0 });
    try {
      const response = await fetch('/api/settings', { method: 'POST' });
      if (!response.ok) throw new Error('Save failed');
      message.success({ key: 'save', content: 'Настройки сохранены.' });
    } catch {
      message.error({ key: 'save', content: 'Не удалось сохранить настройки.' });
    }
    // close() закроет обновлённое сообщение; await дождётся его удаления.
    const closed = await close;
    if (closed) console.log('Сообщение удалено');
  }
</script>

<MessageHolder {message} />
<Button onclick={save}>Сохранить</Button>
```

Open принимает MessageConfig с обязательным content. Методы info/success/warning/
error/loading принимают строку, пассивный Snippet или объект с content. После
первого аргумента можно передать duration и onClose, либо сразу onClose.
Типизированный метод задаёт свой type; open без type использует info.
Icon принимает декоративный Snippet; по умолчанию используются filled-иконки
статусов и вращающийся loading. Class/style относятся к отдельному сообщению.
Snippet содержимого и иконки должен обходиться без ссылок, кнопок и полей ввода.

Duration задаётся в секундах, по умолчанию 3; 0 отключает автоудаление.
CreateMessage фиксирует defaults duration, pauseOnHover=true и maxCount;
конфигурация сообщения может переопределить duration/pauseOnHover.
Невалидная duration использует default. MaxCount ограничивает активные сообщения
по FIFO, положительное конечное значение округляется вниз; без допустимого
значения ограничения нет. Уходящие сообщения остаются в DOM до конца анимации
и не занимают активные места. Hover сохраняет оставшееся время, уход указателя
возобновляет отсчёт. На touch hover-пауза не включается.

Key — string или number; 0 и пустая строка являются допустимыми ключами.
Повтор активного ключа обновляет содержимое на том же месте, перезапускает
duration и заменяет onClose. Все handles этого активного сообщения ждут одно
завершение. Уходящий ключ можно открыть заново: это отдельное сообщение,
старый handle его не закроет. Destroy(key) закрывает ключ, destroy() — всю
очередь экземпляра. Другие экземпляры независимы.

Возвращаемый MessageHandle можно вызвать для закрытия или ожидать через await/
then. OnClose вызывается один раз при запросе закрытия, включая timer и FIFO;
handle завершается true после анимации и фактического удаления DOM. Уходящий
контент получает inert/aria-hidden. При reduced motion уход завершается сразу,
включение этого режима завершает уже запущенную анимацию. Ошибка onClose не
мешает закрытию остальных сообщений destroy(), после обработки она передаётся
вызывающему коду.

До первого монтирования сообщения можно поставить в очередь: SSR выводит
скрытую поверхность без таймеров и callbacks. Отсчёт начинается после показа.
Удаление holder или замена его message отменяет таймеры/анимации, очищает очередь
без onClose и завершает ожидающие handles false. Поздние вызовы такого экземпляра
возвращают false без постановки в очередь; повторное монтирование разрешает
новые сообщения. Для последовательных действий проверяйте результат await,
чтобы не продолжать сценарий после удаления holder.

Holder наследует тему, compact и направление ближайшего ConfigProvider.
`theme.components.Message` настраивает zIndexPopup, contentBg и contentPadding,
aliases и component algorithms. Отступ по умолчанию вычисляется без округления.
Style сообщения и Holder сохраняют приоритет; локальные component variables
другого cssVar prefix разрешаются на самом сообщении. Обновления меняют отдельные
CSS declarations, сохраняя native viewport styles, очередь, handles и deadline
таймеров. В теме Ant Design контейнер иконки повторяет исходную высоту строки;
legacy-оформление сохраняется. [Проверки и исходные замеры](./docs/reference/theme-context.md#тема-message).

Прежние min-width:0/overflow-wrap:anywhere у title сохранены. В официальной
6.6.8 длинное неразрывное слово дало scrollWidth 3871px при карточке 1352px;
это [отдельное наблюдение upstream](./tests/browser/fixtures/ant-design-message-wrap-observation.json).
Raw CSS эталона не изменены; browser-сравнение явно учитывает только это отличие переноса.

Нативный manual popover показывает обычный вертикальный список по центру сверху.
Top по умолчанию 8px: число задаёт px, строка — CSS-длину. Id/class/style
относятся к поверхности списка. Фокус и клавиши Tab/Escape остаются у страницы;
сообщение использует role=status, aria-atomic=true и декоративную иконку.
Для срочного объявления можно явно задать role=alert. ConfigProvider.disabled
не отключает обратную связь.

Внутри Modal/Drawer размещайте holder в содержимом нужного dialog. При закрытом,
скрытом или перекрытом другим модальным окном контексте поверхность скрыта,
таймеры приостановлены; после возврата продолжается оставшееся время.
При скрытии вкладки отсчёт также приостанавливается.
Фоновые holders также ждут закрытия верхнего dialog. Отдельный holder нужен
для сообщений другого контекста. Галерея `/ant-design#message` показывает
loading → success/error, повтор, последовательные сообщения и отмену при сбросе.

В первой версии нет глобального static API/config, getContainer, collapsing
stack, других положений, интерактивных действий и semantic classNames/styles.

## Notification

Создавайте экземпляр у владельца и размещайте один NotificationHolder в нужном
контексте ConfigProvider. Очереди компонентов и SSR-запросов независимы:

```svelte
<script lang="ts">
  import { Button, NotificationHolder, createNotification } from 'antd-svelte';

  const notification = createNotification({ maxCount: 3 });
</script>

{#snippet actions()}
  <Button onclick={() => notification.destroy('report')}>Понятно</Button>
{/snippet}

<NotificationHolder {notification} />
<Button onclick={() => notification.success({
  key: 'report',
  title: 'Отчёт готов',
  description: 'Подготовлены две записи.',
  duration: 0,
  actions
})}>Показать результат экспорта</Button>
```

Open/success/info/warning/error принимают объект NotificationConfig и возвращают
void. Open без type не добавляет статусную иконку; типизированные методы задают
свой type. Title/description принимают строку или Snippet; пустые строки не
создают соответствующую область. Actions — интерактивный Snippet, действия не
закрывают уведомление автоматически. Icon и closeIcon декоративные; используйте
actions/description для кнопок, ссылок и полей ввода. Class/style относятся к
карточке. Корень поддерживает aria-label/aria-labelledby/aria-describedby;
по умолчанию доступное имя связано с title, описание — с description.

Duration задаётся в секундах, по умолчанию 4.5. Значения 0 и false отключают
автоудаление; отрицательные и неконечные значения используют default.
CreateNotification фиксирует defaults duration, pauseOnHover=true, placement и
maxCount. Конфигурация карточки переопределяет duration/pauseOnHover/placement.
Наведение сохраняет оставшееся время; pauseOnHover=false разрешает отсчёт при
наведении. Фокус внутри всегда приостанавливает таймер, включая переходы Tab
между действиями и обновление ключа. Отсчёт продолжается после ухода фокуса и,
если включена hover-пауза, указателя. Touch не включает hover-паузу.

Key — string или number, включая 0 и пустую строку. Повтор активного ключа
обновляет содержимое на прежнем месте, перезапускает duration и заменяет onClose.
В одном placement сохраняются экземпляры неизменённых snippets и их controls.
Изменение placement переносит карточку в другую группу и пересоздаёт snippets.
Уходящий ключ можно открыть заново: это отдельная карточка, позднее завершение
старой анимации её не удалит. Destroy(key) закрывает ключ, destroy() — всю
очередь экземпляра. MaxCount ограничивает активные уведомления суммарно во всех
положениях по FIFO; обновления ключа не меняют очередь. Положительное конечное
значение округляется вниз, без допустимого значения ограничения нет.

Closable=true по умолчанию. False убирает кнопку; объект поддерживает disabled,
closeIcon и aria-label/aria-labelledby/aria-describedby кнопки. CloseIcon также
можно задать на верхнем уровне; false/null скрывает кнопку. Доступное имя берётся
из locale.closeText либо closable.aria-label. Disabled запрещает только кнопку;
destroy и таймер продолжают действовать. ConfigProvider.disabled не отключает
закрытие уведомления, а вложенные компоненты действий наследуют свой контекст.

OnClose вызывается один раз при запросе закрытия: кнопкой, destroy, таймером или
FIFO. Уходящая карточка получает inert/aria-hidden и остаётся в DOM до конца
анимации. Ошибка callback не мешает обработать остальные карточки destroy(),
после обработки она передаётся вызывающему коду. При reduced motion анимация
пропускается; включение режима завершает уже запущенный уход.

Появление не захватывает фокус. Кнопки используют нативные Enter/Space и обычный
Tab; Escape остаётся у страницы или содержащего Modal/Drawer. При закрытии или
удалении сфокусированного action фокус переходит к следующему доступному control
в DOM, затем к предыдущему либо активному dialog. Фокус, выбранный onClose
снаружи карточки, сохраняется. Role по умолчанию alert, для обычного результата
используйте status; aria-atomic=true. Иконки не создают остановок Tab.

Placement поддерживает top/topLeft/topRight/bottom/bottomLeft/bottomRight,
по умолчанию topRight. Left/right задают физическую сторону и не меняются в RTL.
Карточки растут к середине viewport; список прокручивается при переполнении.
Top/bottom у holder задают отступ в px, по умолчанию 24; невалидные значения
используют 24. Id/class/style относятся к нативной popover-поверхности holder;
ширину карточек можно настроить CSS-переменной --ant-notification-width
(по умолчанию 384px). Ширина ограничивается viewport, длинный текст переносится.
Темы, compact и RTL наследуются от ConfigProvider. `theme.components.Notification`
настраивает width, zIndexPopup, status backgrounds, aliases и component algorithms.
ProgressBg подготавливается, но showProgress пока отсутствует. Локальные CSS variables
другого prefix разрешаются на notice; пользовательские variables Holder имеют приоритет.
Обновления сохраняют viewport styles, очередь, deadlines, actions DOM, draft/focus/selection.
Actions находятся на уровне корня, как в эталоне; wrapper выводится только с иконкой,
section — только для пары title/description. Legacy grid сохраняет прежние отступы
и расположение. Source flow-root сохраняет высоту float actions
при native relative positioning; тема переключается без пересоздания controls.
[Сверка и проверки](./docs/reference/theme-context.md#тема-notification).

Явные status backgrounds применяются и при равенстве global alias, и при другом
cssVar prefix. В 6.6.8 такие настройки иногда теряются: [исходные замеры](./tests/browser/fixtures/ant-design-notification-background-observation.json).
В Svelte эти ошибки не повторяются. Сохраняются native close target минимум 24px,
padding:0, root/actions max-width:100% и перенос title/description; сравнение задаёт
те же условия через публичные semantic styles эталона.
Raw замер [width:undefined](./tests/browser/fixtures/ant-design-notification-width-observation.json)
также сохранён: Source обрезает close, а native относительный список сохраняет доступную кнопку.

До первого монтирования можно поставить уведомления в очередь. SSR выводит
закрытый popover без таймеров и callbacks; отсчёт начинается после показа.
Скрытый контекст, скрытая вкладка или верхний чужой dialog приостанавливают
очередь. Внутри Modal/Drawer размещайте holder в содержимом нужного dialog;
фоновые holders ждут его закрытия. Удаление holder или замена notification
очищает очередь и отменяет таймеры/анимации без onClose. Поздние вызовы такого
экземпляра игнорируются до повторного монтирования; новый holder начинает
пустую очередь. Общая модель очереди находится в notice-queue.model.svelte.ts,
DOM-видимость и фокус — в notice.dom.ts; ими также пользуются Message и Alert.

Галерея `/ant-design#notification` готовит CSV-отчёт, обновляет уведомление по
ключу, скачивает настоящий файл и предлагает повтор после ошибки. Сброс и
удаление примера отменяют ожидающий результат и освобождают download URL.
Подготовка показывает Progress с этапами 0 → 25 → 65 → 90 → 100 и кнопкой
отмены. Отмена сохраняет достигнутый процент; повтор начинает новую попытку с 0.

Первая версия не поддерживает collapsing stack, showProgress, getContainer,
глобальный static API/config, onClick на карточке и semantic classNames/styles.
Устаревшие message/btn заменены title/actions.

## Progress

Компонент отображает переданный percent и не запускает работу самостоятельно:

```svelte
<script lang="ts">
  import { Progress } from 'antd-svelte';

  let percent = $state(42.5);
</script>

<Progress {percent} aria-label="Подготовка отчёта" />
<Progress type="circle" {percent} size={120} aria-label="Проверка файлов" />
```

Type по умолчанию line, также поддерживаются circle и dashboard. Percent по умолчанию 0;
конечные значения ограничиваются 0–100 без округления. Undefined, NaN и ±Infinity
заменяются на 0. Отображение, ширина/дуга и aria-valuenow используют одно
нормализованное значение. Percent не bindable; владелец операции передаёт
обновления через props. У Progress нет собственных таймеров и callbacks работы.

Status поддерживает normal/success/exception/active. Без явного
status значение 100 включает success, остальные значения — normal. Явный
normal/exception/success сохраняется при любом проценте. Active добавляет
декоративную анимацию line и не изменяет percent; circle/dashboard с active остаются
статичными. Success/exception показывают декоративную иконку вместо
подписи, если не задан format. Цвета статусов используют токены темы.

ShowInfo=true по умолчанию. Format получает нормализованный percent и может вернуть
строку, число или пассивный Snippet. При success либо format.length > 1 вторым аргументом
передаётся нормализованный success percent (по умолчанию 0). Прежний callback с
format.length <= 1 без success получает один аргумент, как раньше. Callback вычисляется
один раз; строка/число используются в aria-valuetext. Для Snippet доступное значение
сохраняет числовой percent; его можно уточнить через aria-valuetext. HTML в строке экранируется. При showInfo=false
подпись скрывается, доступные значения сохраняются. Длинная внешняя текстовая подпись
сокращается многоточием; полный текст остаётся в title и aria-valuetext. Это сохранённый
native contract: при size=24 подпись ограничена 12px, тогда как React допускает её выход
за body. В line статусные иконки используют исходную SVG-область и не получают текстовую обрезку.

Size по умолчанию medium. Для line medium/small задают высоту 8/6px; число
задаёт ширину и высоту в px. Пара [width, height] и объект { width?, height? }
настраивают line отдельно: ширина — число в px или CSS-строка, по умолчанию
100%, высота — положительное конечное число. Невалидные числовые размеры
заменяются defaults. Например, size={{ height: 4 }} сохраняет ширину 100%.
Доступная ширина контейнера ограничивает индикатор на узких экранах.

Для circle/dashboard size принимает medium=120px, small=60px или положительный конечный
диаметр в px. Совместимая пара использует первый размер. Невалидный диаметр заменяется
на 120px. SVG сохраняет пропорции и помещается в контейнер. При диаметре ≤20px подпись
показывается в Tooltip; доступные значения сохраняются, остановка Tab не добавляется.
Подпись Tooltip создаётся при первом открытии и сохраняется при закрытии. У circle strokeWidth задаётся
в процентах viewBox; default — не меньше 6% и 3px при заданном диаметре.
Невалидное значение использует default, чрезмерное ограничивается 99.9%, чтобы
радиус оставался положительным. Нулевой процент не рисует цветной дуги.
При сжатии контейнер круга сохраняет квадрат и центрирование подписи. Явный
styles.body.width сохраняет исходную высоту; styles.body.height задаёт её напрямую.
CSS-геометрия следует @rc-component/progress 1.0.3: круглые концы корректируют длину
сегмента, а быстрые обновления с интервалом менее 100ms отключают переход. Числовые
dash attributes сохраняют прежнюю геометрию для измеряющих её consumers; видимую дугу
определяют CSS declarations. Минимальная толщина вычисляется в исходном порядке операций.

StrokeColor/railColor принимают CSS-цвета и переопределяют цвет заполнения/фона,
включая при success/exception.
Для line strokeColor также принимает { from, to, direction? } или record процентных
stops: ключи сортируются по исходному parseFloat, direction по умолчанию to right/to left
в LTR/RTL. В обычном line массив strokeColor использует первый цвет; в steps цвета
применяются по индексу. Gradient object в line steps игнорируется, как upstream. StrokeLinecap поддерживает round/butt/square;
у line butt/square убирают скругления, у circle задают SVG stroke-linecap.
Круговой градиент использует record процентных stops, SVG mask и conic/linear background;
порядок ключей сохраняется, концы становятся butt. From/to не преобразуются в процентные
stops, как и в исходном круговом renderer.
Темы и compact используют существующие токены. RTL меняет начало заполнения
line на правое и направление active-анимации; circle сохраняет обход по часовой
стрелке. Reduced motion отключает active-анимацию и переходы значений/цвета.

Корень имеет role=progressbar и aria-valuemin=0/aria-valuemax=100. Доступное имя
по умолчанию берётся из locale.progress.label; задавайте aria-label либо
aria-labelledby для конкретной операции. Aria-describedby связывает пояснение.
Без format aria-valuetext содержит процент и локализованный success/exception;
явный aria-valuetext имеет приоритет. Locale.progress поддерживает label,
successText и exceptionText, включая частичные переопределения; отсутствующие
поля используют ruRU. Иконки, подпись и SVG декоративные.

Progress не создаёт live region, остановку Tab и обработчики клавиатуры, не
захватывает фокус и не блокирует Escape содержащего Modal/Drawer.
ConfigProvider.disabled не скрывает обратную связь. Id/class/style относятся
к корню. SSR сразу выводит корректные значения и SVG-геометрию без таймеров
и DOM-измерений; независимые экземпляры не разделяют состояние.

Галерея `/ant-design#progress` связывает line/circle со Slider и InputNumber,
показывает статусы, размеры и форматирование. `/ant-design#notification`
использует Progress для экспорта: модель notification-export.model.svelte.ts
владеет процентом и этапами, отменяет ожидающие callbacks при отмене/сбросе/
unmount и защищает повтор от результата предыдущей попытки. Скачиваемый CSV
и успешное завершение через 700ms сохранены.

Line поддерживает success={{ percent, strokeColor? }} как отдельный track поверх основного.
Наличие success.percent определяет автоматический status вместо общего percent, в том числе
при success.percent=0. Длины обоих tracks ограничиваются отдельно; success может выходить
за основной track, как в upstream. Высота line задаётся через size.

Steps задаёт число отдельных элементов line. Math.round определяет активное количество;
rounding получает steps*percent/100. Size задаёт размер одного элемента, а не общей полосы.
По умолчанию ширина 14px (2px при small), высота 8px. Object steps использует
count; gap в этой ветке не меняет интервалы. PercentPosition выбирает start/center/end и
inner/outer. Внутренняя подпись всегда текстовая, в том числе при success/exception;
яркость первого заданного цвета выбирает контраст подписи по исходному FastColor.

ConfigProvider.progress задаёт class/style и object/function classNames/styles для
root/body/rail/track/indicator. Undefined наследует record, явный объект заменяет его.
Callbacks получают props с defaults для type/percent/size/showInfo/percentPosition.
Provider styles.root → provider style → local styles.root → local style сохраняют приоритет;
styles отдельных частей применяются после вычисленных размеров/цветов.
PrefixCls меняет BEM classes с fallback ant-progress для undefined/пустой строки.
Bind:nativeElement возвращает текущий root после mount и очищается при unmount.
Тема Progress подключает шесть исходных component tokens, aliases/algorithm и CSS-variable
prefix/key/hash; переменные идут перед semantic/user styles.

Dashboard использует gapDegree=75, circle — 0. GapPlacement принимает top/bottom/start/end;
start/end учитывают RTL. Для circle с положительным gapDegree задавайте placement:
без него исходный renderer не применяет rotation. Success у круга рисуется отдельным
сегментом перед остатком percent-success, с исходным порядком наложения.

Круговые steps используют Math.round независимо от rounding. Object steps задаёт count/gap,
по умолчанию промежуток 2 единицы viewBox; отдельная непрерывная rail не рисуется.
Success вычитается из процента перед расчётом активных steps. Сохранены особенности
6.6.8: без railColor неактивные steps наследуют основной stroke, а градиентные steps
ссылаются на отсутствующее gradient definition. Эти случаи входят в source-проверки.

[Эталоны line/steps](./tests/browser/fixtures/ant-design-progress-line-reference.json)
сняты из официального UMD в стандартном режиме браузера для 65 сценариев.
Для узкого size=24 отдельно сохранён
[эталон native clipping](./tests/browser/fixtures/progress-native-clipping-reference.json)
из свежей сборки прежнего коммита библиотеки. Для circle/dashboard есть
[69 UMD-сценариев и transition trace](./tests/browser/fixtures/ant-design-progress-circle-reference.json).
Сохранены native finite bounds, clipping длинной подписи и числовые SVG attributes;
Tooltip использует существующую Svelte-обёртку. Общий ConfigProvider prefix и React
development warnings остаются следующими этапами. Исходная лицензия
[@rc-component/progress](./src/lib/vendor/LICENSE.rc-progress) включена в пакет.

## Spin

```svelte
<script lang="ts">
  import { Button, Input, Spin } from 'antd-svelte';

  let loading = $state(false);
  let draft = $state<string | undefined>('Анна');
</script>

<Button onclick={() => { loading = !loading; }}>Переключить загрузку</Button>
<Spin spinning={loading} delay={200} description="Обновляем профиль…" aria-label="Профиль">
  <label for="profile-name">Имя</label>
  <Input id="profile-name" bind:value={draft} />
</Spin>
```

Без children Spin показывает отдельный индикатор; spinning по умолчанию true.
С children компонент сохраняет их DOM и локальное состояние между загрузками.
Запросами, результатом и отменой операции управляет владелец; Spin отображает
переданный spinning и не выполняет запросов.

Delay задаётся в миллисекундах и откладывает только индикатор. Busy-контент
сразу получает inert и aria-busy=true, даже когда индикатор ещё скрыт.
Положительная конечная задержка округляется вниз и ограничивается 2147483647;
отрицательные, NaN и Infinity означают 0. При короткой загрузке индикатор не
появляется. Изменение spinning или нормализованной delay отменяет старый таймер;
новая задержка отсчитывается заново, в том числе после показа индикатора.
Изменение содержимого, подписи или размера не перезапускает задержку.
Unmount отменяет таймер; SSR не создаёт таймеров и скрывает отложенный индикатор.

Size принимает small, medium и large с точками 14, 20 и 32px по умолчанию. Без size
используется ConfigProvider.componentSize.
`theme.components.Spin` меняет размеры независимо от других компонентов. Поддерживаются темы,
compact, primary, RTL и динамический prefers-reduced-motion. Стандартная анимация
и CSS-анимации/переходы внутри indicator отключаются при reduced motion;
таймерами, SVG/JavaScript-анимацией собственного snippet управляет его владелец.
Высота wrapper определяется содержимым.

Description принимает строку, число или пассивный Snippet.
Indicator — пассивный Snippet, заменяющий четыре точки.
Он получает аргумент { percent, prefixCls, class, style }; прежние snippets без аргументов
работают как раньше. В отличие от React cloneElement, Svelte не клонирует содержимое snippet:
класс dot и semantic style применяются к декоративному span вокруг него. Строки экранируются. Indicator декоративный, без controls
и остановок Tab. Id/class/style относятся к корню. Отдельный индикатор можно
сделать декоративным через aria-hidden, когда текстовый статус уже есть рядом.

Видимый индикатор использует role=status, polite и atomic. Wrapper — именованная
group; её status находится рядом с busy-контентом, вне inert. Объявление не
охватывает форму. Имя задаётся aria-label/aria-labelledby; без них используется
строковая description или Locale.spin.loadingText. Для snippet-description
нужно содержательное доступное имя. ruRU/enUS включают «Загрузка…»/«Loading…»;
частичная locale.spin использует ruRU для отсутствующих полей.

Если фокус был внутри блокируемых children, он временно переходит на wrapper
с tabindex=-1, вне обычного Tab. После загрузки он возвращается в прежний
доступный control, затем в доступный control внутри children или соседний control
текущего dialog/документа. Если пользователь уже перевёл фокус наружу, Spin
его не возвращает. При unmount сфокусированного wrapper используются сохранённые
доступные соседи. Escape остаётся у содержащего Modal/Drawer.
ConfigProvider.disabled не скрывает обратную связь.

Table использует отдельный декоративный Spin в существующей строке загрузки.
Текстовый status, aria-busy таблицы, блокировка её controls и данные сохранены;
таблица не оборачивается в Spin.

Галерея `/ant-design#spin` показывает размеры, задержку, быстрый/медленный ответ,
сохранение имени, checkbox и счётчика, ошибку с Alert/retry, отмену и сброс.
При retry фокус переходит с удаляемой кнопки Alert на карточку профиля.
Её [модель](https://woodger.org/ant-design#spin) отменяет
ожидающий результат при cancel/reset/unmount и защищает новую попытку от старой.

Fullscreen добавляет фиксированный backdrop в текущей DOM-ветке. Он не использует portal,
не блокирует внешний документ через inert и не перехватывает фокус. При spinning=false
корень остаётся в DOM с opacity=0 и pointer-events=none; отдельный обычный Spin по-прежнему
использует hidden. Для children сохраняется описанная выше блокировка и восстановление фокуса.

Percent принимает число или auto. Число ограничивается 0–100 для SVG-кольца; дробная часть
сохраняется. При нуле показываются четыре точки; после первого ненулевого percent кольцо
остаётся смонтированным и скрывается при возврате к нулю. Как в upstream, SVG появляется
после mount и отсутствует в SSR. Auto обновляется каждые 200 мс после появления индикатора:
5%, 3% и 1% от остатка до 100 при текущем значении до 30, 70 и 96 включительно.
Значение останавливается на 96.01238963686535; новый цикл видимой загрузки начинает с нуля.
Переход к числу, остановка и unmount освобождают interval. Размер, описание, тема и prefix
не перезапускают auto.

ConfigProvider.spin задаёт indicator, class/style и object/function classNames/styles.
Undefined наследует record целиком; явный объект, включая {}, заменяет родительский.
Локальный indicator имеет приоритет над provider, затем Spin.setDefaultIndicator(snippet).
Статический setter хранит модульный fallback, принимает null/undefined для сброса и сам
не обновляет смонтированные Spin: новое значение читается при следующем обновлении props.
Semantic callbacks получают нормализованные size, spinning, description, fullscreen и
числовой percent. Поддержаны root, section, indicator, description и container.
Provider styles.root → provider style → local styles.root; для standalone затем идут section,
а локальный style применяется последним. RootClassName, native attrs/events, bind:nativeElement
и bind:ref с nativeElement сохраняются при обновлениях; refs очищаются при unmount.

PrefixCls меняет BEM classes; undefined/пустая строка возвращают ant-spin. CSS template из
35 правил закреплённого архива сохраняет namespace переменных и изолирует root defaults.
Component tokens, aliases, algorithm и CSS-variable prefix/key/hash работают через общий
[контекст темы](./docs/reference/theme-context.md#токены-spin).
Сверка 49 Source-профилей и auto timeline принадлежит библиотеке; примеры потребителя
не заменяют эти проверки. Сохранённые native delay/inert/focus/ARIA и reduced motion — явные
отличия от React. Общий ConfigProvider prefix и React development warnings ещё не перенесены.

## Skeleton

```svelte
<script lang="ts">
  import { Skeleton } from 'antd-svelte';

  let loading = $state(true);
</script>

<Skeleton {loading} active avatar paragraph={{ rows: 3 }} aria-label="Профиль участника">
  <p>Анна — разработчик.</p>
</Skeleton>
```

Skeleton показывает структуру будущего содержимого при первой загрузке.
Loading по умолчанию true; active и round — false, avatar — false,
title и paragraph — true. При loading=true children не монтируются;
при переходе к false монтируется Snippet children. Повторный переход к true
размонтирует содержимое и уничтожает его локальное состояние и нативные черновики.
Данные, которые должны переживать такую замену, хранит владелец. Для обновления
уже показанной формы используйте Spin с сохранёнными children.

Avatar принимает boolean или объект с shape=circle/square и size=small/medium/
large либо числом в px. По умолчанию составной Skeleton использует large:
40px, compact — 36px. Small/medium соответствуют control-height-sm/control-height;
ConfigProvider.componentSize не меняет выбранный размер. Без paragraph, но с
title автоматическая форма square, в остальных случаях circle. Числовой размер
0 допустим; отрицательный или неконечный размер использует large.

Title принимает boolean или { width }; paragraph — boolean или { rows, width }.
Ширина — неотрицательное число в px или CSS-строка. Для title по умолчанию
используется 38% без avatar и 50% с avatar при наличии paragraph; без paragraph
заголовок занимает полную ширину. Paragraph по умолчанию содержит три строки
без avatar при наличии title, в остальных сочетаниях — две.
Скалярная ширина задаёт последнюю строку; массив задаёт ширину каждой строки.
Пропущенные элементы массива используют обычные CSS-правила, включая стандартные
61% для последней строки из трёх и более. Без avatar или title последняя строка
также получает 61%. Rows округляется вниз и ограничивается 1000; 0 допустим,
отрицательные/NaN/Infinity используют рассчитанное число строк по умолчанию.
Пустые строки и некорректные числовые ширины используют значения по умолчанию.

Round скругляет title и строки paragraph. Active включает CSS-анимацию;
prefers-reduced-motion отключает её динамически. Каркас наследует цвета,
плотность и направление из ConfigProvider. Аватар основного каркаса сохраняет пропорцию 1:1;
большие размеры и ширины ограничены доступным контейнером. Компонент не
выполняет запросов, не создаёт таймеров и не измеряет DOM для разметки.
SSR сразу выводит каркас или готовое содержимое согласно loading.

Корень — постоянная именованная group; id/class/style и aria-label/labelledby/
describedby относятся к ней. Busy-контейнер получает aria-busy; отдельный
status вне него объявляет Locale.skeleton.loadingText с polite/atomic.
Плейсхолдеры декоративные, без доступных заголовков, controls и остановок Tab.
Ru/en-тексты — «Загрузка…»/«Loading…»; отсутствующие поля locale.skeleton
используют ruRU. Для статического превью aria-hidden скрывает всю группу и
подавляет status. ConfigProvider.disabled не скрывает обратную связь.

ConfigProvider.skeleton задаёт class/style и object/function classNames/styles.
Вложенный record заменяется целиком; undefined наследует родительский.
Semantic slots root/header/section/avatar/title/paragraph объединяются с локальными;
callbacks получают defaults avatar=false, title=true, paragraph=true и исходные
optional props, включая отсутствующие active/loading.
Root styles применяются в порядке context styles.root → context style → local styles.root.
Существующие локальные class/style остаются на постоянной group. Новые rootClassName,
context class/style и semantic root относятся к декоративному каркасу и отсутствуют
при loading=false. Это сохраняет прежний native контракт без дублирования padding.

Локальный prefixCls меняет BEM-классы каркаса с fallback ant-skeleton;
переменные темы сохраняют свой namespace. Вложенные avatar/title/paragraph принимают
class и prefixCls, которые заменяют соответствующие semantic class и default prefix,
как при spread в исходнике. Их style заменяется объединённым semantic style;
для оформления этих частей используйте styles.avatar/title/paragraph.
Bind:nativeElement указывает на div каркаса, при loading=false и unmount очищается
до undefined. Bind:ref даёт объект с nativeElement, равным null без каркаса;
при unmount сам ref очищается до undefined. Refs не присваиваются при SSR.

Если loading удаляет сфокусированные children, фокус предварительно переходит
на постоянную group с tabindex=-1. Он остаётся там после завершения; Tab входит
в новое содержимое. Skeleton не фокусирует новые controls автоматически и не
меняет фокус, выбранный снаружи. При unmount припаркованный фокус переходит к
доступному сохранённому соседу в текущем dialog/документе. Escape остаётся
у содержащего Modal/Drawer.

Галерея `/ant-design#skeleton` настраивает каркас и показывает первую загрузку,
быстрый ответ, ошибки с Alert/retry, отмену и сброс. После получения данных
обновления используют Spin и сохраняют имя, checkbox, счётчик и DOM карточки.
Примеры Skeleton и Spin используют одну
[модель загрузки](https://woodger.org/ant-design#spin),
которая отменяет ожидание при cancel/reset/unmount и защищает новую попытку
от старого результата. При retry фокус переходит на постоянную группу карточки.

Самостоятельные `Skeleton.Avatar`, `Skeleton.Button`, `Skeleton.Input`, `Skeleton.Image`
и `Skeleton.Node` доступны также как SkeletonAvatar/Button/Input/Image/Node. Это одни
и те же Svelte-компоненты. Avatar/Button/Input наследуют componentSize; локальный size
имеет приоритет, включая 0 у Avatar. Поддержаны small/medium/large;
Avatar принимает числовой размер. У основного Skeleton default avatar остаётся large.

Button принимает circle/square/round/default и block; Input поддерживает block.
Это span-плейсхолдеры, которые не добавляют button/input, live status или остановку Tab.
Image выводит исходный декоративный SVG; Node рисует пустую область либо Svelte children
snippet и сохраняет её состояние при изменении темы/размера/prefix. Active анимирует
placeholder; reduced motion отключает его анимацию.
Node поддерживает исходный internalClassName: он заменяет стандартный content class.
При reduced motion фон сохраняется, а загрузочная анимация останавливается.

У primitives object classNames/styles задают root/content. Class/rootClassName относятся
к внешнему div, styles.root применяется к нему после component variables. Style относится
к content и имеет приоритет над styles.content и числовым размером Avatar. Локальный
prefixCls меняет BEM-классы с fallback ant-skeleton; переменные темы сохраняют namespace.
Primitives повторяют исходную изоляцию от ConfigProvider.skeleton: используют размер,
тему и prefix, а component record основного Skeleton к ним не применяется.

Тема Skeleton подготавливает шесть текущих tokens для основного каркаса и primitives,
поддерживает gradientFromColor/gradientToColor, overrides, aliases/algorithm и
CSS-variable prefix/key/hash. Основной Skeleton сохраняет native host/status/focus,
размеры и normalization. Общий ConfigProvider prefix и React development warnings
остаются следующими этапами.

[98 UMD-сценариев](./tests/browser/fixtures/ant-design-skeleton-element-reference.json)
сверяют каждый primitive с Ant Design 6.6.8 в стандартном режиме браузера, с одинаковой
унаследованной typography/color из global design tokens.
[34 сценария основного Skeleton](./tests/browser/fixtures/ant-design-skeleton-main-reference.json)
сверяют классы, объявленные slot styles, наследование и вложенные props.
Постоянная группа, title/div, flex/responsive layout и нормализация сохраняют
native поведение и не выдаются за исходную React-разметку.

## Empty

```svelte
<script lang="ts">
  import { Button, Empty } from 'antd-svelte';

  let hasRecords = $state(false);
</script>

<Button onclick={() => { hasRecords = false; }}>Очистить список</Button>
{#if hasRecords}
  <p>Первый участник создан.</p>
{:else}
  <Empty image="simple" description="Участников пока нет.">
    <Button type="primary" onclick={() => { hasRecords = true; }}>Создать участника</Button>
  </Empty>
{/if}
```

Empty показывает отсутствие данных и предлагает действие через Snippet children.
Данными, фильтром и результатом действия управляет владелец; компонент не
выполняет запросов и не создаёт таймеров.

Image принимает default (по умолчанию), simple, URL, собственный Snippet или scalar.
Empty.PRESENTED_IMAGE_DEFAULT/SIMPLE дают прежние aliases default/simple;
остальные строки трактуются как URL и выводятся через img с draggable=false.
Alt берётся из строкового description, иначе используется empty.
False удаляет изображение вместе с контейнером. Встроенные иллюстрации — SVG
Ant Design 6.6.8. В нативном режиме их цвета используют текущие CSS-токены; SVG-паттерны совмещают
полупрозрачный fill с colorBgContainer, сохраняя непрозрачную заливку при
перекрытии частей. Идентификаторы уникальны для каждого экземпляра и стабильны
между SSR и гидратацией. При явной source theme используется исходный getAsSolidColor
и цвета глобальной темы, независимо от component aliases Empty. CSS-переменные
сохраняются без предварительного смешивания; декоративный SVG получает исходный title.
Контейнер изображения декоративный: aria-hidden и inert исключают
его содержимое из accessibility tree, Tab и взаимодействий.

Description принимает scalar или Snippet. Undefined использует
Locale.empty.description: ruRU — «Нет данных», enUS — «No data»; отсутствующие
поля используют ruRU. False, null и пустая строка убирают описание без fallback.
Ноль выводится текстом; true сохраняет пустой description div, как в закреплённом upstream.
Строки экранируются. Generic locale.emptyText для Select и других компонентов
сохраняет прежний смысл и значения.

Children принимает scalar или Snippet и выводится в footer с обычными controls и Tab-навигацией.
Ноль сохраняется; false/null/пустая строка убирают footer, true оставляет пустой div. Изменение
image/description не пересоздаёт сохранённые действия. Без явного aria-label
или aria-labelledby корень остаётся обычным div; с ними — именованная group.
Id/class/style и aria-describedby относятся к корню. Empty не создаёт live-region,
не добавляет остановку Tab и не переносит фокус при показе. Объявление результата
операции и выбор конкретного control после неё остаются у владельца.

При удалении сфокусированного действия внутри сохранённого Empty фокус
переходит к доступному control внутри него, затем к соседу снаружи. При удалении
всего Empty используются сохранённые соседи текущего dialog/документа: сначала
следующий, затем предыдущий, затем сам dialog. Проверка после tick сохраняет
фокус, уже выбранный владельцем. Выбор снаружи также сохраняется. Ресурсы
focusin/MutationObserver освобождаются при unmount; SSR не обращается к DOM.
Escape остаётся у содержащего Modal/Drawer.

Компонент наследует темы, compact и RTL из ConfigProvider. Высота изображения
default — 2.5 controlHeightLG, simple — controlHeightLG; compact уменьшает их
с 100/40 до 90/36px. Изображения ограничены контейнером, длинное описание
переносится, действия footer переходят на следующую строку. Встроенной анимации
нет; reduced motion не требует таймеров или переходов. ConfigProvider.disabled
не скрывает описание и иллюстрацию; disabled controls задаёт их владелец.

Table использует simple Empty в прежней единственной ячейке пустой строки.
Colspan и нативная семантика таблицы сохранены. Description получает
Locale.table.emptyText, включая существующие переопределения. Snippet empty
имеет приоритет; во время loading оба варианта пустого состояния не выводятся.

Галерея `/ant-design#empty` настраивает изображение, описание и действия.
Пример списка создаёт первую запись, показывает пустой результат поиска,
восстанавливает записи при сбросе фильтра и очищает список. Владелец выбирает
стабильный region таблицы после создания/сброса поиска и поле имени после очистки.

ConfigProvider.empty задаёт image, class/style и object/function classNames/styles;
вложенный record заменяется целиком, undefined наследует родительский.
Локальный image имеет приоритет, null/undefined используют context image и затем default.
Semantic slots root/image/description/footer получают исходные props без defaults.
Root styles: context styles.root → context style → local styles.root → local style.
Styles.image задаёт оформление изображения. PrefixCls меняет
BEM-классы с fallback ant-empty; rootClassName относится к корню.
Bind:nativeElement и поле nativeElement объекта bind:ref указывают на корневой div после mount;
при unmount bindings очищаются до undefined, при SSR не присваиваются.

Empty не имеет собственных component tokens; theme.components.Empty поддерживает
общие aliases/algorithm, variable prefix/key/hash, dark и compact. Все 15 исходных
CSS rules включают small; для совместимого размера можно добавить class="ant-empty-small".
[55 UMD-сценариев](./tests/browser/fixtures/ant-design-empty-reference.json) сверяют классы,
slot styles, изображения и их исходные цвета при явной source theme.
Native image=false, inert/ARIA, responsive guards, footer wrapping, paint patterns
прежнего режима и восстановление фокуса сохранены.
Общий ConfigProvider prefix и React diagnostics остаются в работе.
[RenderEmpty](./docs/reference/render-empty.md) подключён к Select/TreeSelect,
Cascader/Panel, Mentions, Transfer, Table/фильтру; AutoComplete сохраняет
исходное исключение combobox. Без callback действуют прежние native defaults.
Собственный image Snippet отвечает за свои ресурсы и анимацию.

## Result

```svelte
<script lang="ts">
  import { Button, Result } from 'antd-svelte';
  let { edit }: { edit: () => void } = $props();
</script>

<Result status="success" title="Заявка отправлена"
  subTitle="Данные сохранены." headingLevel={2}>
  {#snippet extra()}<Button onclick={edit}>Изменить заявку</Button>{/snippet}
  <p>Номер заявки: 42.</p>
</Result>
```

Обработчик edit принадлежит владельцу формы. Result показывает итог операции;
встроенных запросов, таймеров и управления данными в компоненте нет.
Status: success/error/info/warning и 403/404/500 в строковой или числовой форме.
По умолчанию — info. У первых четырёх статусов официальные filled-иконки;
у 403/404/500 — отдельные иллюстрации Ant Design с исходной палитрой.
Эти варианты не меняют маршруты и HTTP-статусы приложения.

Title, subTitle, extra и children принимают строки, числа, boolean, null, Snippet
и вложенные массивы такого содержимого. Undefined/null/false/пустая строка
не создают контейнеров; 0, true и массивы создают, но boolean не выводится текстом.
Строки экранируются. Title — нативный
заголовок: headingLevel от 1 до 6, по умолчанию 2. Владелец выбирает уровень
под структуру страницы и передаёт текстовое содержимое без вложенного заголовка.
Extra содержит действия; children — подробности. Порядок чтения:
иконка, заголовок, описание, действия, подробности. Действия остаются обычными
controls с естественным Tab/Shift+Tab и своей клавиатурной семантикой.

Icon принимает такое же декоративное содержимое; null/false скрывают обычную иконку,
undefined/пустая строка оставляют встроенную, 0 выводится буквально.
Как в исходном Ant Design, иллюстрации 403/404/500 имеют приоритет над icon,
включая false. Контейнер изображения aria-hidden/inert: иконка не дублирует
заголовок и не создаёт остановок фокуса. Собственный icon отвечает за ресурсы
и анимацию; интерактивные элементы следует передавать в extra/children.

Result.PRESENTED_IMAGE_403/404/500 — Svelte-компоненты исходных иллюстраций:
`<Result.PRESENTED_IMAGE_404 />`. Самостоятельные изображения сохраняют исходные
SVG-геометрию, цвета и title (Unauthorized / No Found / Server Error), без добавленных
viewBox/ARIA. Внутри exception Result остаются decorative viewBox-иллюстрации без title;
один контейнер имеет оба класса icon/image, как upstream.

Id/class/style, data-* и aria-* относятся к корню. Aria-label или
aria-labelledby создают именованную group; явный role имеет приоритет. Собственных live-region,
автофокуса и перехвата Tab нет. Владелец решает, нужно ли объявление результата
или явный перенос фокуса после отправки. Если сфокусированное действие исчезает,
фокус восстанавливается на доступном control внутри Result или рядом с ним.
При unmount используются сохранённые соседи текущего dialog/документа;
явный выбор фокуса владельцем сохраняется. Механизм общий с Empty.

ConfigProvider.result задаёт class/style и object/function classNames/styles
для root/title/subTitle/body/extra/icon. Callbacks получают входные props с
разрешённым status='info'. Классы объединяются; root styles следуют порядку
provider.styles.root → provider.style → local.styles.root → local.style.
Undefined наследует provider record; явный объект, включая {}, заменяет его целиком.
Локальные prefixCls/rootClassName и bind:nativeElement/ref поддержаны; refs
присваиваются после mount и очищаются при unmount. Обновления оформления сохраняют
DOM действий, value, focus и selection.

ConfigProvider передаёт тему, compact и direction. Все четыре
[токена Result](docs/reference/theme-context.md#токены-result), aliases и component
algorithms применяются к корню перед пользовательскими styles. Цвета обычных иконок,
текст и фон подробностей используют токены; иллюстрации сохраняют исходные цвета.
Текст и действия переносятся, SVG уменьшается на узком экране.
Заголовок, описание и текст действий вместе с их переводами задаёт владелец.

Галерея `/ant-design#result` переключает все статусы и показывает Form →
success/error → редактирование/retry без потери полей. После отправки владелец
фокусирует область итога, при редактировании — поле имени. Отдельная модель
имитирует ответ, отклоняет повторный старт и отменяет ожидание при reset/unmount,
поэтому позднее завершение не заменяет новый экран. Это локальный пример без API.

Сохранены native heading вместо div, именованная group, декоративные inert icons,
responsive inline padding/image, flex/wrapping действий и восстановление фокуса.
81 официальный UMD-сценарий сверяет остальной API, slot styles и полную геометрию SVG;
path d сравнивается через браузерный CSSOM, который разбирает compact arc flags.
Source theme использует исходный fitted viewBox статусных иконок; legacy viewport сохранён.
Эти native layout/ARIA boundaries исключены из source snapshots и проверяются
отдельно. Общий prefix ConfigProvider и React development warnings ещё не перенесены.

## Steps

```svelte
<script lang="ts">
  import { Steps } from 'antd-svelte';
  let current = $state(0);
</script>

<Steps {current} onChange={index => { current = index; }} items={[
  { key: 'data', title: 'Данные', content: 'Заполните форму' },
  { key: 'review', title: 'Проверка', subTitle: 'Перед отправкой' },
  { key: 'send', title: 'Отправка', disabled: true }
]} />
```

Steps показывает этапы процесса. Current управляется владельцем и отсчитывается
от нуля; onChange сообщает запрошенный индекс, не меняя current самостоятельно.
Владелец может проверить поля перед принятием перехода. Повторный выбор текущего
шага, disabled и внешние обновления не вызывают callback. Без onChange список
пассивный и не создаёт остановок Tab. Привязка bind:current не используется.

Существующий тип StepsItem сохраняет стабильные строковые key и title.
StepsDataItem дополнительно принимает необязательные/numeric key и title;
для отсутствующих ключей используются позиции. При повторении string key
остаётся первое вхождение; индексы относятся к этому нормализованному списку.
Пустой список допустим. Конечное current округляется вниз и ограничивается
диапазоном 0..items.length; NaN/Infinity дают 0. Current=items.length отмечает
все автоматические шаги завершёнными без aria-current. Нормализация не
перезаписывает значение владельца и не генерирует callbacks.

Автоматические статусы: finish до current, process на current, wait после него.
Status меняет состояние текущего шага на wait/process/finish/error;
items.status имеет приоритет над вычисленным состоянием. Disabled ограничивает
выбор и не меняет статус или current. Корневой disabled наследует
ConfigProvider.componentDisabled; false явно снимает его, сохраняя items.disabled.

Существующий StepsItem принимает string или Snippet в title/subTitle/content;
новый StepsDataItem также принимает number/boolean/null. Ноль отображается,
boolean не создаёт текст. Icon может быть текстом, числом или декоративным Snippet.
Строки экранируются. Заголовок и подзаголовок находятся в нативной кнопке выбора
и должны содержать только текст/phrasing-разметку без вложенных controls.
Content находится отдельно и допускает блочную разметку; панели с полями
и действиями остаются у владельца. Иконки и линии
aria-hidden; icon также inert. Check/close используют существующий Icon.
Выбранный шаг помечен aria-current="step"; доступное описание кнопки содержит
локализованный статус и content. Собственных live-region и автофокуса нет.

Список использует ol/list, кнопки — естественные Tab/Shift+Tab, Enter и Space.
Это не tablist: содержимое и переходы принадлежат владельцу. При удалении или
отключении сфокусированного шага фокус переходит на следующий доступный шаг,
затем предыдущий. Keyed-перестановка сохраняет сфокусированную кнопку.
Если шагов/кнопок больше нет или Steps размонтирован, выбирается доступный
сосед текущего dialog/документа. Явный выбор владельца сохраняется.

Orientation: horizontal/vertical, по умолчанию horizontal. Responsive=true
переключает горизонтальный список в вертикальный при ширине viewport меньше
532px; SSR до гидратации не измеряет viewport и использует orientation.
При responsive=false сохраняется горизонтальная ориентация с внутренней
прокруткой при нехватке места. Size: medium/small; отсутствующий size наследует
small из ConfigProvider, остальные общие размеры дают medium.
Темы, compact, primary и RTL используют токены. Reduced motion отключает
встроенные transitions. Id/class/style и aria-describedby относятся к ol;
aria-label/aria-labelledby задают имя, по умолчанию locale.steps.label.

Locale.steps содержит label/wait/process/finish/error. RuRU и enUS предоставляют
все строки; вложенные частичные переводы сохраняют значения родительского
ConfigProvider. Отсутствующие значения дополняются ruRU. Тексты items задаёт владелец.

Галерея `/ant-design#steps` показывает независимый предпросмотр и многошаговую
заявку: данные → проверка → отправка → Result. Form проверяет поля, владелец
открывает следующие шаги и фокусирует панель/ошибочное поле. Возврат и retry
сохраняют данные; reset/unmount отменяют ожидание и игнорируют поздние результаты.
Модель отправки общая с примером Result. Сетевых запросов и сохранения в storage нет.

Type поддерживает default/dot/inline/navigation/panel, variant — filled/outlined.
Panel всегда горизонтальный. Dot/inline используют вертикальные заголовки в
горизонтальном списке; navigation сохраняет горизонтальные заголовки.
Orientation задаёт направление списка, titlePlacement — размещение заголовков.
Inline скрывает content в строке и показывает его в Tooltip по hover/focus;
Snippet title сохраняет rich content, Escape закрывает tooltip без смены фокуса.
Wrapper Tooltip находится внутри li, сохраняя нативную ol/li-семантику.

Initial сдвигает нумерацию, current и onChange в исходное пространство индексов;
согласованная нормализация current и first-wins keys сохранена. MaxCount>=3
ограничивает число реальных видимых шагов: первый, последний, текущий и ближайшие
соседи по исходному приоритету. Разрывы заменяются disabled ellipsis; сами ellipsis
не входят в maxCount. Номер и callback относятся к исходному item. Status ellipsis
сохраняет error скрытого диапазона либо finish/wait по current. Ellipsis=true
отдельно включает CSS-обрезку текста; offset задаёт начальную inline flex-cell.

Percent добавляет SVG progressbar к process-номеру, с исходной формулой dasharray;
в inline percent игнорируется. Progressbar доступен assistive technology,
декоративные иконки и стрелки panel скрыты. Новая ellipsis-иконка — точный SVG
@ant-design/icons-svg 4.6.0 (git 7f2516ac91226d2b41f93b35cb5197c8d94f7189),
MIT-лицензия уже включена в vendor/LICENSE.ant-design-icons.

ClassNames/styles принимают объект или функцию от {props}; root и item* слоты
совпадают с upstream. Item classNames/styles используют root/wrapper/icon/section/
header/title/subtitle/content/rail; локальные слои перекрывают общие, item.style
перекрывает styles.root. Root style имеет приоритет над styles.root. Стрелки navigation наследуют
colorTextDisabled активной темы; прямой --ant-steps-nav-arrow-color имеет приоритет.
Item.onClick вызывается перед onChange, включая повторный выбор current;
в disabled оба callback подавлены. Содержимое шага задаётся через content.

ConfigProvider.steps задаёт общие class/style/classNames/styles для десяти slots.
Классы config и local накапливаются. Root styles идут в порядке config.styles.root
→ config.style → local styles.root → local style; item-specific слои сохраняют приоритет.
Callbacks получают прежние native props с вычисленными layout/type/titlePlacement
и percent; текущие defaults/status/size и правила current не меняются.
Undefined наследует steps-record, любой собственный объект, включая {}, заменяет его.
В композиции Timeline, как в Source InternalContext, действуют только plain class/style:
semantic classNames/styles Steps не применяются и их callbacks не вызываются.

Локальный prefixCls меняет классы root, layout, item и progress; пустая строка
восстанавливает ant-steps. CSS извлечён из закреплённого архива отдельным рецептом
steps-prefix. Namespace --ant-steps-* / --ant-cmp-steps-* и общий marker
ant-steps-css-var сохраняются. Смена prefix не пересоздаёт ol или кнопки, не меняет
их ids, выбор и фокус. Components.Icon из iconRender наследует тот же prefix;
восстановление фокуса при удалении шага от классов не зависит. Соседние Steps
изолированы, локальные/semantic styles и компонентные токены сохраняют приоритет.
Общий prefix ConfigProvider ещё не перенесён.
Настройки самого ConfigProvider.timeline и локальные Timeline слои сохраняют приоритет.
Сверка: [36 исходных случаев и 4 обновления](./tests/browser/fixtures/ant-design-steps-config-reference.json),
[браузер](./tests/browser/steps-config.spec.ts),
[публичные типы и SSR](./tests/package/steps-config.ssr.test.ts), `?fixture=steps-config`.

IconRender — Snippet<[originalIcon, info]>, где info содержит index/active/item/
components.Icon. Можно отрендерить исходный Snippet или использовать переданный
Svelte Icon-компонент.
Bind:nativeElement возвращает ol; rootClassName добавляется к его class.

Сохранены согласованные отличия v1 от React: нативные кнопки внутри именованного
списка, keyed focus recovery, clamp current, responsive-порог 532px (исходный
useBreakpoint версии 6.6.8 использует xs), componentDisabled и locale.steps.
Произвольный prefixCls пока не перенесён.
Wave работает для доступных items при общем onChange.
Новые сценарии находятся в ?fixture=steps-variants и втором примере #steps;
unit/SSR/Chromium проверяют layouts, collapse/index mapping, render Snippets,
rich tooltip и доступность процента.

Source `theme.components.Steps` применяет исходные defaults, aliases и отдельные
algorithms к размерам иконок/точек, шрифтам, цветам и navigation. Поддержаны
CSS prefix/hash, нули/undefined и переданные во время выполнения CSS lengths.
Semantic root styles и plain style сохраняют приоритет. CustomIconSize/customIconTop
и iconTop создают переменные, но не меняют оформление,
как в 6.6.8; то же относится к legacy waitIcon*/finishIcon* defaults.
Метрики вариантов и композиции Timeline сверяются с официальным UMD в
`?fixture=steps-theme`; native-only темы сохраняют прежнее оформление.

## DatePicker

DatePicker переносит single date/showTime из Ant Design 6.6.8 и rc-picker 1.12.2.
Public value — Dayjs или null при очистке; undefined включает внутреннее состояние
с defaultValue. OnChange(value, dateString) получает объект даты и отображаемую
строку. Это не контракт ISO/timestamp. Day.js 1.11.23 установлен в стенде; пакет
компонентов объявляет peer dayjs ^1.11.11 наряду со Svelte. React/rc-picker runtime
не устанавливаются. CSS-рецепт извлекает 262 правила из
[закреплённого npm-архива](https://registry.npmjs.org/antd/-/antd-6.6.8.tgz);
глобальный Calendar CSS исключён, корни DatePicker ограничены собственным marker. Чистый GenerateConfig и Day.js adapter перенесены отдельно;
лицензия rc-picker сохранена в vendor/LICENSE.rc-picker.

```svelte
<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import { DatePicker } from 'antd-svelte';
  let value = $state<Dayjs | null>(dayjs('2026-10-29T10:30:15'));
</script>
<label for="when">Дата и время</label>
<DatePicker id="when" name="when" {value} showTime onChange={next => { value = next; }} />
```

Value/open/pickerValue — controlled props с callbacks: владелец может отклонить
изменение; component сам не переписывает переданный value. Без value/open
используются defaultValue/defaultOpen и внутреннее состояние. DefaultPickerValue
задаёт исходный месяц при каждом открытии. Навигация date/month/year/decade
относится к выбору одной даты; отдельные picker="month" и другие режимы ещё не
перенесены. NativeElement с bind указывает на root div; bind:this даёт методы
focus({preventScroll,cursor:'start'|'end'|'all'}) и blur().

Format принимает строку, массив допустимых форматов или display callback; input
с callback-only format автоматически readonly. По умолчанию дата YYYY-MM-DD,
showTime — YYYY-MM-DD HH:mm:ss. Разбор строгий: переполнения и неверные високосные
дни не нормализуются. Невалидный текст не меняет value и при blur восстанавливается;
preserveInvalidOnBlur сохраняет его. InputReadOnly блокирует текстовый ввод, но
сохраняет календарь и очистку. AllowClear=true по умолчанию.

ShowTime=true или объект добавляет time columns. Поддержаны format, видимость
units, шаги, use12Hours, hideDisabledOptions и defaultOpenValue. Ограничения
времени задаются через disabledTime, а не через поля showTime. NeedConfirm по умолчанию true для datetime и false для date. Выбор
с подтверждением меняет draft/onCalendarChange; OK меняет value/onChange и вызывает
onOk. Escape/внешний клик отменяют неподтверждённый draft. Now использует исходный
путь preset submit и сразу применяет допустимое текущее время.

Кнопки подтверждения DatePicker, RangePicker, TimePicker и TimeRangePicker используют
общий Button с size=small и type=primary, как исходный PickerButton. Они наследуют
ConfigProvider.button, components.Button и Wave; переданная строка локали сохраняет
Button autoInsertSpace и semantic props. Нативные disabled/type=button, порядок
подтверждения, точность Dayjs и возврат фокуса сохраняются. Проверки —
[picker-button](./tests/browser/picker-button.spec.ts), `?fixture=picker-button`.

Точность повторяет rc-picker: panel selection выравнивает все time units, даже
скрытые; default millisecondStep=100, ближайшее разрешённое значение слева либо
первое разрешённое. ShowTime.format задаёт формат time panel; формат input
задаётся DatePicker.format либо locale.lang.fieldDateTimeFormat, как в upstream.
Колонки определяются по showTime.format, затем первому элементу format, если это
строка, затем datetime-формату locale. Явные showHour/showMinute/showSecond/
showMillisecond имеют приоритет; use12Hours выводится из формата, если не задан.
Формат поля только с датой сохраняет стандартные часы, минуты и секунды.
Для миллисекундного шага задайте showTime={{millisecondStep:1}}.
Ручной ввод через format с SSS использует строгий parser и не округляется этим
panel helper. Адаптер не навязывает timezone: календарные операции сохраняют
режим входного Dayjs, parser использует обычный dayjs(text,format), getNow учитывает
подключённый потребителем timezone plugin как upstream. UTC/timezone плагины не
включаются библиотекой автоматически.

Текст формата в квадратных скобках не включает time units. Это сохранённое
native правило: Ant Design 6.6.8 для `YYYY-MM-DD [Hours]` ошибочно оставляет только
часы и секунды. У нас применяется обычный fallback часов/минут/секунд; raw source
сохранён в [измерениях datetime config](./tests/browser/fixtures/ant-design-datetime-config-reference.json),
отличие проверяется в [browser suite](./tests/browser/datetime-config.spec.ts).

MinDate/maxDate и disabledDate ограничивают календарь; disabledTime возвращает
запрещённые часы/минуты/секунды/миллисекунды. Size, status, variant, disabled,
Compact, RTL, тема, locale.lang и ConfigProvider.locale.datePicker наследуют
существующие контексты. Встроены исходные RU/EN строки. Input использует native
name/id/required: FormData содержит отображаемый текст, без скрытой ISO-копии.
FormItem контекст даёт id/name/status/disabled. Form model хранит immutable Dayjs
напрямую: value={form.values.when}, onChange={next => form.setFieldValue('when', next)}.
OnFinish получает объект Dayjs, resetFields восстанавливает исходное значение;
преобразование в wire-формат остаётся у потребителя, как в upstream.

Клавиатура: Enter открывает/применяет корректный ввод, ArrowDown переводит фокус
в календарь; стрелки/PageUp/PageDown/Home/End перемещаются по grid; Escape закрывает
popup с возвратом фокуса. Время доступно через native buttons и стрелки в колонках.
Поверхность использует существующий native popover lifecycle библиотеки, включая
изоляцию Compact, закрытие снаружи и поддержку dialog top layer.

DatePicker, RangePicker, TimePicker и TimeRangePicker поддерживают локальный
getPopupContainer с fallback на ConfigProvider.getPopupContainer; undefined
наследует provider. Getter получает root div.ant-picker и возвращает HTMLElement
или ShadowRoot. При defaultOpen функция без параметров сначала вызывается с
undefined, затем с root; функция с параметром ждёт DOM ref, как rc-trigger.
SSR не вызывает getter. Без выбранной функции сохраняется native размещение.

Исходный offset до поля — 4 px; координаты при единичном масштабе округляются
вниз, как rc-trigger. Минимальная ширина popup равна ширине selector.
Default placement — bottomLeft в LTR и bottomRight в RTL, явное значение имеет
приоритет. Смена getter с тем же контейнером сохраняет DOM панели, пользовательский
state, фокус/выделение и draft поля; смена самого контейнера пересоздаёт панель,
как исходный portal. Стили ShadowRoot задаёт потребитель. Getter не меняет
Dayjs/UTC/precision, FormData и порядок подтверждения границ.

Native панель по-прежнему удаляется при закрытии; custom footer/panel state
при следующем открытии создаётся заново. Это сохранённое отличие от retained
popup rc-trigger. Проверки и 54 эталона официального UMD —
[picker-container](./tests/browser/picker-container.spec.ts), `?fixture=picker-container`.

Component tokens всех четырёх date/time single/range controls задаются через
`ConfigProvider.theme.components.DatePicker`, как в Ant Design. Input, calendar,
time columns, presets и popup используют общую тему; Button подтверждения
сохраняет независимые `components.Button`. Поддержаны aliases, component algorithms,
dark/compact, вложенные provider, `inherit:false` и собственный cssVar prefix.
Локальные style и существующие semantic styles сохраняют приоритет.

Обновление токенов сохраняет DOM поля и открытой панели, draft, фокус/выделение
и значение Dayjs. При смене высоты time cells существующая прокрутка сохраняется
в пикселях, как в исходнике; новое открытие выравнивает выбранное время заново.
Datetime header показывает выбранное время в panel format; пустое значение
не подсвечивает время запасной даты. Проверки и 15 UMD-тем —
[picker-theme](./tests/browser/picker-theme.spec.ts), `?fixture=picker-theme`.

Остальные picker/multiple modes, generatePicker factory, single presets,
cellRender/panelRender, mask format, hover preview, полный semantic/component config
и полный rc-trigger/motion API ещё не перенесены. Реестр перечисляет эти пробелы
отдельно; данный этап не заявляет полноту семейства DatePicker.

## TimePicker

TimePicker переносит выбор одного времени из Ant Design 6.6.8 и rc-picker 1.12.2.
Он использует общий SinglePicker, Day.js adapter и CSS DatePicker. Существующие
публичные контракты DatePicker и RangePicker сохраняются.

```svelte
<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import { TimePicker } from 'antd-svelte';

  let value = $state<Dayjs | null>(dayjs('2024-09-15T10:30:15'));
</script>

<label for="meeting-time">Время встречи</label>
<TimePicker id="meeting-time" name="time" {value} onChange={next => { value = next; }} />
```

`value`, `open` и `pickerValue` управляются props/callbacks. Без value/open
используются defaultValue/defaultOpen. Пустое значение остаётся пустым: начало
панели берётся из текущего дня с нулевым временем. DefaultOpenValue заполняет
только панель и кандидат для OK, не input или onCalendarChange до выбора.
DefaultPickerValue задаёт время панели при открытии; pickerValue независим от value.

По умолчанию format — HH:mm:ss; use12Hours включает hh:mm:ss A. Format принимает
строку, массив допустимых форматов или display callback. Callback делает input
readonly, даже при inputReadOnly={false}. Флаги showHour/showMinute/showSecond/
showMillisecond задают колонки; остальные выводятся из формата по правилам
rc-picker. Шаги и disabledTime управляют
единицами; hideDisabledOptions скрывает запрещённые пункты.

Panel selection выравнивает все четыре единицы, включая скрытые: default
millisecondStep=100, ближайшее разрешённое значение слева либо первое
разрешённое. Для точности до миллисекунды задайте millisecondStep={1}.
Ручной ввод разбирается строго и не округляется. Дата и UTC/timezone режим
входного Dayjs сохраняются при редактировании панели; parser/getNow используют
общий адаптер без прикладной сериализации.

`needConfirm` по умолчанию true. Выбор в колонке меняет только calendar draft.
OK вызывает onOk перед onChange; Enter/Tab подтверждают допустимый ввод без
onOk. Двойной клик по единице подтверждает первый выбранный пункт без onOk.
Если автопрокрутка меняет цель между вторыми down/up, подтверждение обрабатывается
на колонке. Новый двойной клик по пустой области не подтверждает прежний выбор.
В [закреплённом upstream](./tests/browser/fixtures/ant-design-time-column-double-click-observation.json)
автопрокрутка между двумя кликами может выбрать соседний час; это поведение
намеренно не воспроизводится. При needConfirm={false}
onChange вызывается при завершении ввода/закрытии, а не при каждом клике колонки.
Escape отменяет draft; закрытие снаружи при needConfirm=true тоже отменяет его.
Now и presets применяют значение сразу. OnCalendarChange получает пустой info
объект. При полной очистке onChange
получает `(null, null)`, а onCalendarChange — `(null, '', {})`, как SinglePicker.

`previewValue='hover'` временно показывает время под указателем, включая disabled
units, без callbacks. False отключает preview. ChangeOnScroll выбирает ближайшую
разрешённую единицу через 300 ms после прокрутки; программное выравнивание колонок
не считается вводом. RAF, scroll listeners и delayed callbacks очищаются при
изменении выбора и удалении панели.

Locale имеет общую форму DatePickerLocale: lang плюс timePickerLocale.placeholder.
Он объединяется с ConfigProvider.locale.datePicker. Default ruRU и переключение
enUS сохраняются. ConfigProvider.timePicker задаёт variant, class/style, icons,
clear и semantic config; вложенный объект заменяет родительский целиком.
Semantic classNames/styles поддерживают root/prefix/input/suffix и popup
root/content/item/footer/container. Локальный callback получает исходные props
с разрешённым variant; контекст проходит оба исходных слоя TimePicker/SinglePicker.
Локальный style применяется последним к root.

Prefix/suffixIcon/allowClear.clearIcon, cellRender, panelRender, renderExtraFooter
и presets принимают Svelte snippets вместо React nodes/render functions.
Cell info.originNode — snippet
нативной кнопки, остальные поля описаны в [time-picker.types.ts](./src/lib/time-picker.types.ts).
Bind:nativeElement даёт root div, bind:this — focus({cursor,preventScroll})/blur().
Native name/id/required и FormItem работают без скрытого ISO input; FormData
содержит отображаемую строку, Form model хранит Dayjs напрямую.

Адаптация доступности использует native buttons для единиц, стрелки/Home/End,
ArrowDown из input, Enter/Tab и Escape с возвратом фокуса. Popup использует общий
native popover lifecycle библиотеки. Класс popup задаётся через classNames.popup.root
у всех четырёх picker-компонентов; остальные semantic slots у DatePicker/RangePicker
ещё не перенесены. ShowNow управляет Today/Now, ограничения времени задаются
функцией disabledTime, иконка очистки — allowClear.clearIcon. Прежние popup aliases,
showToday, прямые disabled units, addon/onSelect и второй аргумент onKeyDown удалены. Темы, compact, RTL, status и размеры
наследуют текущие контексты.

Проверки: [engine](./src/lib/time-picker.engine.test.ts),
[SSR](./src/lib/time-picker.ssr.test.ts),
[public package](./tests/package/time-picker.ssr.test.ts),
[browser](./tests/browser/time-picker.spec.ts) и `?fixture=time-picker`.
Общие component tokens настраиваются через `components.DatePicker`; подробности
и правила обновления открытой панели описаны в разделе DatePicker.
Multiple, mask format, generatePicker, произвольный prefix,
полный каталог locales, React diagnostics и полный rc-trigger/
motion API пока не перенесены. Контейнеры popup описаны в разделе DatePicker.
Диапазон экспортируется как TimeRangePicker.
Переполненный 32-bit step вызывает RangeError вместо бесконечного цикла upstream.

## TimeRangePicker (TimePicker.RangePicker)

TimeRangePicker переносит picker=time из общего RangePicker Ant Design 6.6.8 /
rc-picker 1.12.2. Он использует RangePickerCore, nullable time columns и CSS
DatePicker; существующие контракты календарного RangePicker сохраняются.

```svelte
<script lang="ts">
  import dayjs from 'dayjs';
  import { TimeRangePicker, type RangePickerValue } from 'antd-svelte';

  let value = $state<RangePickerValue | null>([
    dayjs('2024-09-15T09:00:00'), dayjs('2024-09-15T18:00:00')
  ]);
</script>

<TimeRangePicker name="interval" {value} onChange={next => { value = next; }} />
```

Value/open — controlled props, defaultValue/defaultOpen читаются при создании.
Удаление controlled value очищает локальный диапазон, без возврата к defaultValue.
Calendar draft, подтверждённые границы и значение владельца хранятся отдельно.
OnCalendarChange сообщает пару и info.range в текущем порядке полей; onChange
получает итог после завершения обеих границ. При order=true пара сортируется
перед публикацией; disabled-граница отключает сортировку. Сравнение сохраняет
правила Dayjs/rc-picker, включая календарную часть дат.

NeedConfirm=true по умолчанию. OK подтверждает активную границу и переводит фокус
к следующей; onOk вызывается до перехода и onChange. Enter/Tab и двойной клик
подтверждают без onOk. Неподтверждённая граница удерживает фокус при попытке перейти
в соседнее поле. Без needConfirm выбор в колонках всё равно остаётся черновиком:
завершение первой границы переводит выбор ко второй. Закрытие после такого выбора
может снова открыть панель второй границы, как useFocusLock upstream.

Escape отменяет calendar draft. Неразобранный текст при неизменившемся calendar
value сохраняется до blur; preserveInvalidOnBlur управляет его восстановлением.
AllowEmpty допускает null в соответствующей границе и подтверждение через Tab,
но не включает OK для пустой панели. При очистке обеих границ onChange получает
`(null, null)`; disabled-граница сохраняется. Now по явному showNow подтверждает
только активное поле без onOk; presets сразу применяют всю пару.

Format, 12-hour, show flags, steps, disabled units, hover preview и changeOnScroll
используют ту же логику, что TimePicker. DefaultOpenValue задаёт отдельные кандидаты
для обеих панелей, не заполняя inputs; одиночный Dayjs относится только к start.
PickerValue управляет шаблонами времени независимо от value, defaultPickerValue
восстанавливается при открытии и переключении полей. DisabledTime получает
`(date, partial, {from})`; при итоговой проверке end получает start, включая null
для разрешённой пустой границы.

Panel edits сохраняют дату и UTC/timezone входного Dayjs. Default millisecondStep
равен 100 и действует даже для скрытых разрядов; шаг 1 сохраняет миллисекунды.
Ручной ввод использует строгий общий Day.js parser без panel rounding или
принудительного UTC. Native name создаёт два поля с отображаемыми строками;
Form model и onFinish получают объекты Dayjs без скрытой ISO-копии.

Конфигурация повторяет разделение upstream: ConfigProvider.timePicker даёт
icons/allowClear и semantic classNames/styles; ConfigProvider.rangePicker даёт
variant, separator, class и обычный style. TimePicker.style/class/variant
на range-обёртку не переносятся. Вложенный rangePicker config заменяется целиком.
Semantic callback выполняется в одном слое с разрешёнными size/disabled и исходным
variant. Локальный callback типизирован TimeRangePickerProps; общий timePicker
callback получает range props в runtime, как в upstream, поэтому перед работой
с value в нём нужна проверка Array.isArray. Приоритет root styles: timePicker
styles.root → rangePicker style → local styles.root → local style.

Prefix/icons, cellRender с info.range и originNode, panelRender, presets и footer
используют Svelte snippets. Footer получает mode='time'. Полная форма находится в
[time-range-picker.types.ts](./src/lib/time-range-picker.types.ts).
Bind:nativeElement/startInput/endInput возвращают native refs и очищаются при
unmount. Focus принимает объект с index/cursor/preventScroll либо число 0/1;
индекс по умолчанию 0. Один focus не открывает закрытую панель. Keyboard и native
popover используют согласованную Svelte adaptation; deferred focus, RAF геометрии,
scroll timers и observers очищаются при удалении.

Popup наследует общий container API DatePicker, сохраняет минимальную ширину selector
и сдвигает узкую time panel со стрелкой под активное
поле. В RTL колонки времени сохраняют исходный порядок hours → minutes → seconds,
а направление внутри колонок меняется. Темы, compact, размеры, locale и status
используют текущие контексты библиотеки.

Проверки: [engine](./src/lib/time-range-picker.engine.test.ts),
[SSR](./src/lib/time-range-picker.ssr.test.ts),
[public package](./tests/package/time-range-picker.ssr.test.ts),
[browser](./tests/browser/time-range-picker.spec.ts) и `?fixture=time-range-picker`.
Полные mask/generatePicker/trigger/token/locale API и React diagnostics остаются
в следующих этапах; v1-ready в реестре не означает полного покрытия React API.

## RangePicker (DatePicker.RangePicker)

Отдельный экспорт RangePicker использует общий Day.js adapter, календарь, time
panel и извлечённый CSS DatePicker. Переходы выбора перенесены из
useRangeValueChange rc-picker 1.12.2: calendar draft, подтверждённые границы и
принятое владельцем value хранятся отдельно.

RangePickerCore также используется TimeRangePicker. ConfigProvider.rangePicker
задаёт общий variant/class/style/separator; локальные props имеют приоритет.
Объект вложенного провайдера заменяет родительский целиком.

```svelte
<script lang="ts">
  import dayjs from 'dayjs';
  import { RangePicker, type RangePickerValue } from 'antd-svelte';
  let period = $state<RangePickerValue | null>([dayjs('2026-10-10'), dayjs('2026-10-20')]);
</script>
<label for="period-start">Начало</label><label for="period-end">Конец</label>
<RangePicker id={{start:'period-start',end:'period-end'}} name="period"
  value={period} onChange={next => { period = next; }} />
```

Value/defaultValue — пара Dayjs|null|undefined; отсутствующие границы внутри
нормализуются в null. Value=null очищает обе границы, undefined включает внутреннее
состояние. OnChange получает пару Dayjs|null либо null при полной очистке.
Второй аргумент — пара отображаемых строк либо null при полной очистке: это
фактическое поведение rc-picker 1.12.2, хотя его declaration обещает только tuple.
OnCalendarChange всегда получает пару значений, пару строк и {range:'start'|'end'}
для первой изменённой границы. OnOk получает текущую календарную пару после
подтверждения каждой границы; первое подтверждение ещё не означает onChange.

Date показывает два соседних календаря, showTime — календарь и время активной
границы. Переход к следующему полю, Tab, Enter, OK, Escape и закрытие снаружи
различаются как в исходной машине переходов. NeedConfirm по умолчанию включён
для datetime. Неподтверждённые изменения отменяются; controlled value/open могут
отклонить предложение компонента. DefaultPickerValue/pickerValue принимают дату
или пару дат панели; onPickerValueChange сообщает range/source/mode.

Order=true сортирует отправляемую пару, если обе границы доступны. Order=false
сохраняет позиции. Disabled принимает boolean либо [start,end], allowEmpty —
boolean либо [start,end]. Очистка сохраняет заблокированную границу. DisabledDate
получает {type,from}, disabledTime — (date,'start'|'end',{from}); from зависит от
порядка посещения полей, как в rc-picker. Проверяются границы диапазона:
запрещённая дата внутри него сама по себе не запрещает диапазон. MinDate/maxDate
ограничивают выбор и навигацию. Presets принимают пару либо фабрику, previewValue
по умолчанию 'hover'; false отключает предварительный просмотр. ShowNow
по умолчанию выключен для диапазона; явное включение подтверждает текущую границу.

Format, showTime units/steps/defaultOpenValue, inputReadOnly,
preserveInvalidOnBlur, size/status/variant/Compact, локали, тема и RTL используют
общие механизмы DatePicker. ShowTime.defaultOpenValue принимает пару дат времени.
Календарные операции сохраняют режим входного Dayjs; UTC и wire-сериализация не
навязываются. Native FormData.getAll(name) содержит две отображаемые строки под
одним name. Form хранит пару объектов Dayjs, копирует tuple при snapshot и
восстанавливает исходные даты при reset. Id-строка относится к первому полю,
id={{start,end}} задаёт оба. Bind:nativeElement/startInput/endInput возвращают DOM;
bind:this даёт focus({index:0|1,preventScroll,cursor}) и blur(). Native onfocus/onblur
относятся к input; полный semantic event API upstream ещё не перенесён.

Подтверждены SSR без browser APIs, ввод/ошибки/очистка, переходы фокуса,
подтверждение времени, ограничения/from, nullable границы, controlled rejection,
Form/нативная отправка и UTC в разных browser zones. Остальные picker modes,
mask, render hooks, полный semantic/config/motion API остаются пробелами
семейства; наличие RangePicker не означает полного покрытия React DatePicker.

## Calendar

Calendar переносит самостоятельную панель из Ant Design 6.6.8 и
@rc-component/picker 1.12.2. По умолчанию отображает полный месяц с шестью
строками дат; fullscreen={false} включает мини-календарь. Режим year показывает
12 месяцев и сохраняется после выбора месяца.

```svelte
<script lang="ts">
  import dayjs from 'dayjs';
  import { Calendar } from 'antd-svelte';

  let value = $state(dayjs('2024-09-15'));
</script>

<Calendar {value} onChange={next => { value = next; }}>
  {#snippet cellRender(date, info)}
    {#if info.type === 'date' && date.date() === 15}<span>Событие</span>{/if}
  {/snippet}
</Calendar>
```

Без value используются defaultValue или getNow(); defaultValue читается один
раз. Заданные value и mode управляются владельцем через callbacks, без
bind:value/mode. Отказ обновить prop сохраняет выбор и режим. Как PickerPanel,
сама панель сдвигает отображаемый месяц при клике соседней даты даже при
отклонённом value; заголовок продолжает показывать выбранное значение.
При удалении controlled prop локальное значение очищается, без возврата к
defaultValue/month: это поведение useControlledState изученной версии.

Порядок выбора — onPanelChange при смене месяца/года панели, затем onChange
при смене календарного дня, затем onSelect. Повторный выбор дня вызывает только
onSelect. CalendarSelectInfo.source различает date, month, year и customize. Переключатель
режима вызывает только onPanelChange. Компонент использует общий Dayjs adapter
без прикладной сериализации или нормализации; проверены UTC, timezone offset,
время и milliseconds.

`validRange` сравнивает полные timestamps включительно, до вызова disabledDate.
Month disabled вычисляется по первому и последнему дню месяца с сохранённым
временем; содержимое месяца не сканируется. Поэтому диапазон внутри одного
месяца может отключить весь этот месяц, как в rc-picker. Годы/месяцы заголовка
ограничиваются validRange, но его действия не проходят disabledDate и не
ограничивают день месяца границами диапазона.

`headerRender` получает value/type/onChange/onTypeChange и полностью заменяет
заголовок. `fullCellRender` заменяет содержимое ячейки; cellRender добавляет
содержимое в стандартный date-content. FullCellRender имеет приоритет
над cellRender. OriginNode в
CalendarCellRenderInfo — Svelte snippet исходного rc-picker inner. Date info.locale
содержит filled formats, month info.locale — исходный lang. `showWeek` добавляет
отдельные ячейки без render snippets; они выбирают начало строки с source=date.
Ячейки сохраняются по позиции строки/столбца, как в upstream.

Locale берётся из ConfigProvider.locale.calendar, независимо от DatePicker.
Глобальные enUS/ruRU включают Calendar; default locale библиотеки остаётся ruRU.
Словарь Calendar в ConfigProvider заменяется целиком, как DatePicker. Локальный
Calendar.locale объединяет поля lang с базовым словарём и контекстом. Загрузка
остальных Day.js locales остаётся у потребителя.

`classNames`/`styles` принимают объекты или callbacks для root/header/body/content/
item/itemContent. Callback props сохраняют переданные mode/showWeek, fullscreen
получает default true. Приоритет root styles после компонентной темы: context styles.root → context
style → local styles.root → local style. Вложенный ConfigProvider.calendar
заменяет component config целиком. `bind:nativeElement` возвращает root div и
очищается при unmount. Календарь не добавляет скрытое поле с сериализованной
датой; внутренние controls заголовка не получают name/id/required FormItem.

`generateCalendar(adapter)` — отдельный экспорт вместо React-статики
Calendar.generateCalendar. Фабрика возвращает Svelte component с теми же Props,
реактивными value/mode и bind:nativeElement; CalendarGenerateConfig описывает
исходные операции над датой. Типы и defaults находятся в
[calendar.types.ts](./src/lib/calendar.types.ts).

Адаптация доступности: table имеет роль grid, ячейки — gridcell с selected,
disabled, today и одним tab stop. Стрелки/Home/End перемещают только фокус,
Enter/Space выбирают. В standalone rc-picker эти keyboard handlers отсутствуют.
Вложенные inputs/buttons сохраняют свою клавиатуру; stopPropagation у custom
control предотвращает выбор родительской ячейки. В заголовке используются
существующие native Select/RadioGroup с доступными именами.

Из архива извлечены 123 CSS-правила Calendar, включая full/mini, week и mobile
header. Темы, primary, compact и RTL используют текущие tokens библиотеки.
В desktop-шапке legacy обёртки Select сохраняют ширины 80/70px. При source theme
yearControlWidth/monthControlWidth задают минимальную ширину, как upstream;
скрытый текстовый sizer сохраняет intrinsic размер readonly input даже при 0/10px.
Переключатель режима не переносит отдельные кнопки.
При viewport до 480px год и месяц располагаются рядом, переключатель — ниже,
как в исходном Calendar. Эти правила принадлежат CalendarHeader и не меняют
геометрию остальных Select/RadioGroup. Границы полей и кнопок в мини-календарях
300/360px, mobile/RTL и работа dropdown/клавиатуры проверяются в
[calendar-header](./tests/browser/calendar-header.spec.ts).

`ConfigProvider.theme.components.Calendar` применяет все шесть public tokens,
alias overrides и global/component algorithms. Общий picker panel helper
воспроизводит 21 внутренний default; это не добавляет TimePicker/multiple API
в Calendar. Локальные CSS variables и config/semantic/local styles сохраняют
приоритет. Внутренние Select/Radio используют свои темы; intrinsic sizing
включён только для source-шапки Calendar, public default Select остаётся прежним.

[UMD-эталон](tests/browser/fixtures/ant-design-calendar-theme-reference.json)
содержит 17 тем / 136 наборов для восьми scopes: full/mini month/year панели
сверяются в normal/RTL/priority, mini-month — также в variable/nested/reset/sibling/
outside. Дополнительные замеры сделаны при viewport 400px. Проверяются цвета,
метрики ячеек и шапки, string/zero/undefined размеры и независимые child themes.
[Browser-проверки](tests/browser/calendar-theme.spec.ts) защищают фокус/выбор даты,
точные timestamps callbacks, открытые options и DOM input при theme update,
inherit reset и возврате к legacy. Декларации сверяются с UMD отдельным
[unit-набором](src/lib/theme-calendar-tokens-reference.test.ts),
[SSR](tests/package/calendar-theme.ssr.test.ts) не создаёт browser resources.

Проверки: [engine](./src/lib/calendar.engine.test.ts),
[SSR](./src/lib/calendar.ssr.test.ts),
[public package](./tests/package/calendar.ssr.test.ts),
[browser](./tests/browser/calendar.spec.ts) и `?fixture=calendar`, включая
фабрику с собственным UTC Date adapter. PrefixCls,
полный каталог locales, React warnings и неперенесённые возможности используемых
Select/Radio остаются за пределами подтверждённого объёма этого этапа.

## Cascader / CascaderPanel

Cascader переносит Ant Design 6.6.8 и @rc-component/cascader 1.22.0.
Selector сверён с @rc-component/select 1.10.1, каскадные checkbox — с
@rc-component/tree 1.4.0. Чистая логика путей и поиска находится в
[cascader.engine.ts](./src/lib/cascader.engine.ts), публичные типы и defaults — в
[cascader.types.ts](./src/lib/cascader.types.ts).
React-зависимости не устанавливаются. [Лицензия rc-cascader](./src/lib/vendor/LICENSE.rc-cascader)
включена в пакет; CSS-рецепт извлекает 108 правил selector/columns/checkbox/Panel/RTL.

```svelte
<script lang="ts">
  import { Cascader, CascaderPanel, type CascaderPath } from 'antd-svelte';

  let path = $state<CascaderPath>([]);
  const options = [
    { value: 'asia', label: 'Asia', children: [
      { value: 'japan', label: 'Japan' }
    ] }
  ];
</script>

<Cascader {options} value={path} onChange={next => { path = next ?? []; }} />
<CascaderPanel {options} value={path} onChange={next => { path = next ?? []; }} />
```

Value/defaultValue — полный путь string/number; multiple использует массив
путей. Value управляется владельцем через onChange, defaultValue читается при
создании. Очистка single вызывает onChange(undefined, undefined), multiple —
onChange([], []). Второй аргумент содержит исходные options в порядке пути;
отсутствующие узлы сохраняют undefined. Missing paths остаются видимыми, с
fallback к raw values. Повторный выбор single тоже вызывает onChange.
Компонент не задаёт прикладную сериализацию путей в FormData.

В multiple каскадный выбор проходит только через разрешённые checkbox; disabled
и disableCheckbox разрывают conduction. Отображение и onChange используют
SHOW_PARENT по умолчанию или SHOW_CHILD. Константы экспортируются как
CASCADER_SHOW_PARENT/CASCADER_SHOW_CHILD. Клик по содержимому родителя раскрывает
колонку, checkbox выбирает ветку. Default display — весь путь через ` / ` для
single и последний label для multiple. MaxTagCount, responsive, maxTagTextLength,
tagRender и maxTagPlaceholder меняют отображение, сохраняя выбранные пути.

ShowSearch по умолчанию false. True включает поиск по любому label в пути;
объект настраивает controlled searchValue/onSearch, filter/sort/render, limit,
matchInputWidth, searchIcon и autoClearSearchValue. Default limit=50; false и неположительное число
снимают лимит. Без sort лимит останавливает обход, с sort применяется после
сортировки. ChangeOnSelect/multiple включают промежуточные пути в выдачу;
disabled родителя распространяется на результаты его детей.
Label snippet остаётся непрозрачным для default filter, как ReactNode;
для поиска по содержимому snippets задайте filter.

Выбор очищает локальный поиск без отдельного onSearch; multiple с autoClearSearchValue=false
сохраняет запрос до blur. Полная очистка и закрытие single могут вызвать
onSearch(''); при controlled search решение об изменении остаётся у владельца.

LoadData получает исходные options активного пути, когда последний узел не leaf.
Его Promise не ожидается: индикатор снимается после обновления children,
isLeaf=true либо удаления узла из options. Пустой children=[] тоже снимает
индикатор. Во время поиска загрузка не запускается.
Явный isLeaf=false сохраняется в выдаче: single без changeOnSelect не выбирает
такой узел. Сетевые запросы, ошибки и обновление options принадлежат потребителю,
как в upstream; компонент не
выполняет скрытую загрузку и не добавляет собственные состояния ответа.

Popup поддерживает controlled/defaultOpen, changeOnSelect, click/hover,
размещение, ширину и popupRender; deprecated dropdown aliases удалены.
Поле удерживает focus при выборе; Up/Down обходят разрешённые строки,
Left/Right переходят между колонками и меняются местами в RTL, Backspace
возвращает родителя, Enter выбирает, Escape закрывает.
При непустом запросе Left/Right сохраняют нативную работу каретки и выделения.
Поле поиска сохраняет высоту строки и цвет текста после скрытия выбранного label;
повторный ввод оставляет выбранный путь без изменений.
В multiple Backspace также удаляет последний разрешённый tag. Clear — нативная кнопка с клавиатурной
активацией. FormItem передаёт label/id, description, required и status;
bind:nativeElement/inputElement и focus/blur доступны после mount.

ConfigProvider.cascader задаёт variant, class/style, semantic slots и icons.
Локальные поля уточняют конфигурацию; root style идёт после styles.root,
для popup/list/listItem применяются соответствующие semantic slots.
AllowClear=true наследует ConfigProvider.cascader.clearIcon и обычную иконку Ant
по умолчанию. Объект allowClear передаётся без наследования; его отсутствующий
или falsy clearIcon использует fallback `×`.
Semantic callbacks получают исходные props, включая raw
multiple, и resolved disabled/size/variant/status. Panel наследует disabled/direction и expand/loading icons,
а root class/style и popup semantic config Cascader к ней не применяются.
Темы и compact используют текущие tokens библиотеки; locale — общий ConfigProvider.

При source-настройках темы поле и dropdown объединяют `components.Select` и
`components.Cascader` в исходном порядке. Cascader задаёт ширину поля/колонок,
высоту dropdown, отступы и оформление выбранной строки. Component algorithms,
нули/undefined и custom CSS prefix поддерживаются; настройки `components.Checkbox`
не меняют внутренние checkbox. Standalone Panel получает только Cascader tokens,
наследует шрифт/цвет provider и сохраняет прозрачный фон. Смена темы сохраняет
DOM, поиск, выделение, фокус и позицию popup; semantic popup styles сохраняют
приоритет. Native-only темы остаются прежними. Подробности —
[в справочнике темы](./docs/reference/theme-context.md).

ReactNode/render callbacks заменены Svelte snippets. OptionRender получает
исходный option и info с path/searchValue/originNode: для поисковой подсветки
используйте originNode. В React search option.label содержит уже отрисованный
узел; Svelte сохраняет исходный label и передаёт содержимое отдельно.
TagRender получает label snippet, closable/onClose и rc path key; сводный tag
maxTagCount имеет isMaxTag=true без value/index/onClose.
MaxTagPlaceholder получает default label и исходные labels/options каждого
скрытого пути; собственный displayRender можно повторно вызвать с ними.
Custom children получает handlers/ARIA для нативного trigger, который заменяет
React cloneElement. При нём inputElement отсутствует.

GetPopupContainer получает корень `.ant-select`, а при custom children — DOM trigger
из snippet. NativeElement при этом сохраняет прежний div обёртки. Локальная функция
перекрывает ConfigProvider.getPopupContainer; undefined наследует provider.
Getter выполняется в браузере после первого открытия. ShadowRoot требует собственных
стилей. Панель сохраняет state, поиск, фокус и выделение при замене функции с тем же
контейнером; зазор до trigger — исходные 4 px. CascaderPanel остаётся inline и не
использует глобальный getter.

Standalone Panel использует нативные строки-кнопки и клавиатурный focus между
ними. Это явная Svelte accessibility adaptation к исходной pointer-only Panel.
SSR не обращается к DOM и не вызывает loadData; initially open popup отрисован
hidden до mount. RenderEmpty, prefixCls, произвольные
popup align/motion, React-specific components/refs/warnings и
вывод типа value по произвольному generic ValueField остаются вне этого этапа.

Проверки: [engine](./src/lib/cascader.engine.test.ts),
[SSR](./src/lib/cascader.ssr.test.ts),
[public package](./tests/package/cascader.ssr.test.ts),
[browser](./tests/browser/cascader.spec.ts),
[source theme](./tests/browser/cascader-theme.spec.ts) и `?fixture=cascader`.

## Transfer

Transfer переносит списки и логику Ant Design 6.6.8. `targetKeys` всегда задаёт
владелец; `onChange(nextKeys, direction, moveKeys)` предлагает перенос. Измените
targetKeys в callback, чтобы его принять. Локального defaultTargetKeys нет.

```svelte
<script lang="ts">
  import { Transfer, type TransferKey } from 'antd-svelte';

  const dataSource = [
    { key: 'a', title: 'Alpha' },
    { key: 'b', title: 'Beta' },
    { key: 'locked', title: 'Locked', disabled: true }
  ];
  let targetKeys = $state<TransferKey[]>(['b']);
</script>

<Transfer
  {dataSource}
  {targetKeys}
  render={record => record.title}
  onChange={next => { targetKeys = next; }}
  showSearch
/>
```

Строке нужен стабильный string/number/bigint key либо rowKey. Числовой `0`,
строка `'0'` и bigint не смешиваются. Без rowKey callbacks получают исходные
объекты; с rowKey — копии с вычисленным key. Входные данные не изменяются.
Порядок source задаёт dataSource, порядок target — targetKeys. Неизвестные
target keys сохраняются в onChange, хотя соответствующих строк пока нет.
Перенос вправо добавляет выбранные enabled keys в начало targetKeys.

Выделение локальное, пока selectedKeys не задан. Управляемый selectedKeys
обновляется владельцем через onSelectChange(sourceKeys, targetKeys).
Возврат к undefined сбрасывает его в пустое локальное выделение. Disabled строки
не переключаются и не переносятся; disabled-only selection не включает actions.
При переносе onSelectChange с очищенной стороной вызывается перед onChange.
Удаление данных очищает устаревшее локальное выделение без callbacks.

Нативные checkbox поддерживают Tab/Space; label переключает всю строку.
Shift выбирает диапазон enabled строк, а полностью выбранный диапазон снимает.
Поиск сбрасывает anchor; выделенные строки вне выдачи сохраняются.
Default filter использует case-sensitive includes. ShowSearch допускает
placeholder/defaultValue; defaultValue читается один раз для каждого списка.
OnSearch/onScroll и onChange используют логические left/source и right/target.
FilterOption, footer и children получают физическую сторону: она меняется в RTL.

Render остаётся callback, возвращающим текст либо `{ label, value }`:
label показывает строку, value задаёт title и текст поиска. Вместо JSX callback
может вернуть Svelte snippet, которому передаётся record. Для результата без
metadata текст поиска берётся из первого string/number среди результата,
item.title и item.key. Без render видимая подпись пустая, как в upstream.

```svelte
{#snippet row(record: { key: string; title: string; })}
  <strong>{record.title}</strong>
{/snippet}

<Transfer
  {dataSource}
  {targetKeys}
  render={record => ({ label: row, value: record.title })}
  onChange={next => { targetKeys = next; }}
/>
```

Pagination использует независимые страницы, default pageSize=10 и simple=true;
поддержаны normal mode, showLessItems и showSizeChanger. Явный pageSize задаёт
управляемый размер. Select current/invert действуют на текущую страницу,
select all — на все enabled строки выдачи. Пустая выдача сбрасывает страницу и
локальный pageSize; временное отключение pagination сохраняет текущую страницу.
OneWay оставляет только перенос вправо; удаление и remove current/all не затрагивают
disabled строки. ShowSelectAll=false скрывает header controls, сохраняя счётчик.

Children snippet получает dataSource, filteredItems/filteredRenderItems,
selectedKeys, direction, disabled, semantic slots и callbacks onItemSelect,
onItemSelectAll/onItemRemove/onScroll. При children встроенная пагинация выключена.
Footer snippet получает полные props списка и `{ direction }`.
Наличие children/footer snippet задаёт layout даже при пустом содержимом snippet;
проверка возвращённого ReactNode на truthiness заменена присутствием snippet.

Actions принимает текст либо snippet с disabled/direction/icon/onClick.
Для собственного disabled/callback используйте `{ children, disabled, onClick }`.
Свяжите info.disabled/info.onClick с native control: это замена React cloneElement.
Собственный onClick вызывается перед переносом; preventDefault его не отменяет,
как в Ant Design. Последующие actions отображаются отдельно; в oneWay это
все entries после первого.
SelectAllLabels принимает текст либо callback, который возвращает текст/snippet.
Значение 0 показывается; null/false/пустая строка включают стандартный счётчик.

ConfigProvider.transfer задаёт class/style, semantic classNames/styles и
selectionsIcon. Common slots дополняются source/target slots; стили конкретной
стороны имеют приоритет над common, локальные слои — над соответствующими context.
Root style имеет приоритет над styles.root; styles.section/actions задают
оформление списков и действий. Поддержаны locale, темы/compact, RTL и status.
Success/validating из исходного InputStatus сохраняют классы без отдельного оформления;
пустой status наследует FormItem.
В корень передаются только aria-/data-атрибуты. NativeElement привязывается к div;
служебные checkbox/search не получают имя/ID внешнего FormItem и не сериализуют keys.
Native reset не меняет state Transfer или поисковую строку. Как у
[React input](https://github.com/facebook/react/blob/v19.2.0/packages/react-dom-bindings/src/client/ReactDOMInput.js),
checkbox возвращает начальный checked DOM до следующего обновления selection;
внутреннее выделение при этом сохраняется. Для сброса keys обновите controlled props.
SSR не публикует callbacks и не обращается к DOM. Состояния и ресурсы принадлежат
экземпляру; меню использует существующий Dropdown.

RenderEmpty подключён через ConfigProvider с исходными fallback/locale приоритетами
и выбором array content по стороне. Генерация CSS для произвольного prefixCls и
React-specific refs/dev warnings остаются вне этого этапа. PrefixCls меняет DOM
классы; встроенный vendor CSS рассчитан на ant-transfer.

`ConfigProvider.theme.components.Transfer` применяет шесть component tokens,
alias overrides и global/component algorithms. Сохранены числовые и строковые
CSS-размеры, zero/undefined и приоритет config/semantic/local styles. Внутренний
header padding рассчитывается по исходному правилу с округлением вверх;
fontHeight берётся из `Math.round(fontSize * lineHeight)`, а не из одноимённого
переопределённого alias. Checkbox, Input, Button и Pagination используют свои
компонентные темы. У внутренней пагинации восстановлен CSS scope, включая
стандартное оформление без source theme.

[UMD-эталон](tests/browser/fixtures/ant-design-transfer-theme-reference.json)
содержит 17 тем / 136 наборов для восьми независимых scopes. Basic списки проверены
во всех scopes; oneWay, pagination, empty и custom lists — в normal/RTL/priority.
Сохранено прежнее native отличие: кнопка удаления наследует шрифт строки, тогда
как в исходном UMD остаётся браузерный размер `13.33px`. Исходный размер сохранён
в raw measurements; сравнение явно проверяет native inheritance по source item font.
Ещё одно прежнее отличие — обычный simple Empty без source `ant-empty-small`.
В эталоне оставлены стандартный source fallback и отдельный замер с явным
`locale.notFoundContent`, соответствующим native fallback. Последний применяется
только для сверки естественной высоты пустой секции с undefined metrics.
[Browser-проверки темы](tests/browser/transfer-theme.spec.ts) также проверяют
draft/selection/focus, страницы, keyed rows и порядок move callbacks при обновлении.
В исходном UMD переход вложенного provider к `inherit:false` в конфигурации эталона
заменяет input и теряет query/focus; raw observation сохранено отдельно.
Native сохраняет поле и введённую строку. Для CSS-сверки эталон дополнительно
восстанавливает ту же строку и фокус через публичный Input.
Декларации сверяются с UMD отдельным
[unit-набором](src/lib/theme-transfer-tokens-reference.test.ts),
[SSR](tests/package/transfer-theme.ssr.test.ts) не создаёт браузерные ресурсы.

Проверки: [engine](./src/lib/transfer.engine.test.ts),
[SSR](./src/lib/transfer.ssr.test.ts),
[public package](./tests/package/transfer.ssr.test.ts),
[browser](./tests/browser/transfer.spec.ts) и `?fixture=transfer`.
Оформление: [54 исходных CSS rules](./src/lib/vendor/transfer.css),
[рецепт](./tools/ant-design-css-recipes.json); legacy defaults остаются в theme.css.
Числовая/simple пагинация сверена с @rc-component/pagination 1.4.0;
алгоритм страниц включён с [MIT-лицензией](./src/lib/vendor/LICENSE.rc-pagination).
Delete icon перенесён из @ant-design/icons-svg 4.6.0 под существующей
[MIT-лицензией](./src/lib/vendor/LICENSE.ant-design-icons).

## Carousel

Carousel переносит Ant Design 6.6.8 и @ant-design/react-slick 2.0.0 без React
runtime. Геометрия, клоны и переходы следуют исходному Slick. Публичные Props,
render snippets и refs описаны в [carousel.types.ts](./src/lib/carousel.types.ts).

```svelte
<script lang="ts">
  import { Carousel, type CarouselRef } from 'antd-svelte';

  let carousel = $state<CarouselRef>();
</script>

<Carousel arrows autoplay={{ dotDuration: true }} bind:ref={carousel}
  children={['Первый слайд', 'Второй слайд', 'Третий слайд']} />
<button type="button" onclick={() => carousel?.goTo(0)}>В начало</button>
```

Каждый элемент массива children — отдельный логический слайд. Один непрозрачный
snippet тоже образует один слайд: его внутренние DOM-узлы не разбираются.
Для нескольких snippets и метаданных используйте items: каждый элемент задаёт
children, class, attributes и width исходного child div. Items имеет приоритет
над children. Числовой width нужен для variableWidth, включая SSR; строки rows
и slidesPerRow группируются до создания клонов. Как в Slick, группировка заменяет
child style своими width/display; произвольный стиль содержимого задавайте внутри
snippet. Клоны создают независимые экземпляры snippets, поэтому их DOM ids должны
учитывать возможное повторение.

По умолчанию dots включены, arrows/draggable/autoplay/waitForAnimate выключены,
infinite включён, speed равен 500ms. Effect="fade" включает fade и один слайд на
страницу; centerMode устанавливает slidesToScroll=1. DotPlacement принимает
top/bottom/start/end.
Start/end включают vertical по умолчанию; явный vertical имеет приоритет.
Вертикальный режим отключает наследуемое зеркалирование RTL. В горизонтальном
RTL currentSlide зеркальный, но next/prev сохраняют исходное направление Slick.

InitialSlide задаёт начальную позицию и повторно применяется при изменении этого
prop или root RTL. Смена количества слайдов сама по себе его не применяет.
Как в Ant Design, RTL reset считает исходные children до rows grouping.
BeforeChange/afterChange сохраняют порядок и прерывание перехода; waitForAnimate
блокирует повторный переход. GoTo/next/prev откладываются на native timer, как
исходные методы. Ref появляется после mount, nativeElement указывает на внешний
div. InnerSlider предоставляет типизированные state/list/track и методы Slick;
это Svelte adapter, а не произвольный React class instance. В responsive unslick
innerSlider отсутствует, а методы Carousel ничего не переключают.

Autoplay использует интервал autoplaySpeed+50ms; duration dots — autoplaySpeed.
PauseOnHover/pauseOnDotsHover/pauseOnFocus сохраняют исходные состояния
playing/paused/hovered/focused. Focus pause относится к самому slick-slide,
а не к вложенному input. CSS-прогресс dots не останавливается вместе с JS autoplay.
LazyLoad поддерживает ondemand, anticipated и progressive с исходными индексами
onLazyLoad, включая клоны. AdaptiveHeight обновляется после измерений и image load.
Responsive регистрирует media listeners при mount и применяет breakpoint по
событию matchMedia; исходного принудительного применения при mount нет.

Клавиатура использует physical Left/Right и RTL, пропуская input/textarea/select.
Мышиный drag требует draggable; touch учитывает swipe/touchMove/touchThreshold,
edgeFriction и swipeToSlide. Controls — native button с type="button"; они не
отправляют форму. У arrows, dots и слайдов есть видимый keyboard focus. Отключённая
стрелка сохраняет исходные class/pointer semantics без добавления native disabled.
FocusOnSelect фокусирует прежний current DOM slide до commit, как react-slick.

PrevArrow/nextArrow получают class/style/onClick/currentSlide/slideCount;
customPaging — индекс и onClick, appendDots — default dots snippet и root props.
Пользовательский renderer явно применяет эти props к своим элементам.
ConfigProvider.carousel задаёт class/style внутреннего slick-slider; локальные
значения имеют приоритет. RootClassName/id относятся к внешнему wrapper.
Locale.carousel и исходный alias Carousel задают имена стрелок; локальный
Carousel имеет приоритет. Темы light/dark/compact и RTL используют общие CSS variables.

ConfigProvider.theme.components.Carousel применяет семь компонентных токенов:
размеры и отступ стрелок, ширину/высоту/отступ/интервал точек и ширину активной
точки. Вертикальный режим меняет местами размеры точек по исходным правилам.
Поддержаны alias tokens, глобальные и компонентные algorithms, cssVar.prefix,
вложенные providers и реактивное обновление без пересоздания слайдов.
DotActiveWidth поддерживает явный 0; по умолчанию используется 24.
Тематические переменные задаются wrapper; пользовательские class/style и
ConfigProvider.carousel по-прежнему относятся к inner slider и сохраняют приоритет.
Сверка: [официальные CSS tokens](./tools/fixtures/ant-design-carousel-tokens-reference.json),
[геометрия четырёх размещений](./tests/browser/fixtures/ant-design-carousel-theme-reference.json),
[SSR](./tests/package/carousel-theme.ssr.test.ts) и
[browser](./tests/browser/carousel-theme.spec.ts), `?fixture=carousel-theme`.

SSR выводит исходную процентную либо variable-width геометрию и lazy placeholders
без DOM, callbacks, timers или media queries. При уничтожении очищаются timers,
ResizeObserver, image/focus/touch/media listeners и refs; поздние callbacks не
вызываются. Генерация CSS для произвольного prefixCls,
React development diagnostics и устаревшие IE fallbacks остаются вне этапа.

Проверки: [engine](./src/lib/carousel.engine.test.ts),
[public package SSR](./tests/package/carousel.ssr.test.ts),
[browser](./tests/browser/carousel.spec.ts) и `?fixture=carousel`.
[CSS](./src/lib/vendor/carousel.css) воспроизводится рецептом: 58 правил и два
keyframes. Перенесённая логика снабжена [MIT react-slick](./src/lib/vendor/LICENSE.react-slick),
стили — существующей [MIT Ant Design](./src/lib/vendor/LICENSE.ant-design).

## Tour

Tour переносит Ant Design 6.6.8 и @rc-component/tour 2.4.0. Состояния, маска и
панель сверены с исходниками; выравнивание использует алгоритм rc-trigger 3.10.1.
Точные Props/snippets описаны в [tour.types.ts](./src/lib/tour.types.ts).

```svelte
<script lang="ts">
  import { Tour } from 'antd-svelte';

  let open = $state(false);
  let target = $state<HTMLButtonElement>();
</script>

<button type="button" bind:this={target} onclick={() => { open = true; }}>
  Начать знакомство
</button>
<Tour {open} onClose={() => { open = false; }}
  steps={[{ title: 'Первый шаг', description: 'Описание', target: () => target }]} />
```

`Open` и `current` — controlled props: компонент сообщает изменения через
callbacks, владелец может их отклонить. Без open/defaultOpen непустой Tour открыт.
Default props читаются при создании; повторное открытие сбрасывает uncontrolled
current в ноль. Индекс вне steps закрывает Tour. OnChange получает новый индекс;
штатное завершение вызывает onClose, onFinish, затем nextButtonProps.onClick.
Поля шага заменяют общие panel callbacks/metadata, даже если явно равны undefined.

Target принимает DOM-элемент, getter либо null; getter вызывается только в браузере.
Без цели default placement — center, стрелка скрыта. Есть 12 направлений,
pointAtCenter, flip/shift, сохранение исходного flip cache и onPopupAlign.
Gap по умолчанию равен 6px по обеим осям, radius — 2px. Mask поддерживает color/style;
disabledInteraction блокирует pointer в подсвеченной области. Внешний click не
закрывает Tour. Mask=false с целью оставляет страницу интерактивной, но body scroll
по-прежнему блокируется; без цели прозрачный слой перехватывает pointer, как upstream.

Автопрокрутка зависит от raw open: одного defaultOpen недостаточно. Обычный шаг
получает собственный scrollIntoViewOptions={block:'center',inline:'center'} до
fallback к корневой настройке. Явный false передаётся native scrollIntoView(false),
а не отключает прокрутку. Animated и builtinPlacements принимаются в типах, но
Ant Design принудительно включает placeholder animation и подставляет свои placements.

Title/description/cover и подписи кнопок принимают текст, массивы и Svelte snippets.
ActionsRender получает исходные actions как snippet и current/total;
indicatorsRender — current/total. Step.renderPanel заменяет всю панель. Собственный
renderPanel=undefined выбирает базовую rc-tour панель с native Prev/Next/Finish.
Стабильный description snippet сохраняет native input draft при смене шагов.

ConfigProvider.tour задаёт class/style, closeIcon и semantic slots/callbacks.
Callback получает raw props с объединёнными steps и primary-классами. Root style
и styles.root относятся к маске; step styles/classNames целиком заменяют panel
slots. Локальные слои имеют приоритет. Locale.tour и исходный Tour alias задают
подписи кнопок; локальный Tour перекрывает tour. Global.close задаёт имя закрытия.
Темы light/dark/compact и RTL config сохраняются в portal. Физическое направление
текста наследуется от фактического контейнера: body остаётся LTR при RTL config,
как в React-эталоне; класс ant-tour-rtl и контекст кнопок при этом сохраняются.

По умолчанию mask/placeholder/popup находятся в body. GetPopupContainer=false
оставляет их inline без body lock; функция задаёт собственный контейнер. Как в
rc-tour, mask/placeholder вызывают getter без аргумента, popup передаёт placeholder.
Внутри native Modal/Drawer стандартный portal остаётся в dialog top layer, чтобы
сохранить интерактивность. CSS variables обновляются при смене наследуемой темы.

Tour не устанавливает autofocus/focus trap и не возвращает фокус при закрытии.
Physical Left/Right меняют шаги, кроме событий из editable controls. Escape
учитывает keyboard, closable и 200ms после IME compositionend. Все открытые Tour
реагируют на Escape, как исходный rc-tour. SSR не рендерит portal layers и не
вызывает DOM getters/snippets. При закрытии/unmount удаляются DOM, locks, listeners
и observers; отложенное выравнивание не публикует callbacks после уничтожения.

`ConfigProvider.theme.components.Tour` подготавливает девять исходных CSS tokens,
alias overrides и algorithms для default/primary panels, close, indicators и arrows.
Button сохраняет независимую тему; local step/semantic styles имеют исходный приоритет.
CSS Tour подключён перед Button, как в исходном runtime: при наведении на Next
в primary panel Button задаёт цвет текста и рамки, Tour — фон.
Обновления темы сохраняют шаг, portal DOM, focus/caret и пользовательский input.
Проверки и 15 UMD-тем — [tour-theme](./tests/browser/tour-theme.spec.ts), `?fixture=tour-theme`.

Runtime `zIndex` имеет приоритет над CSS token `zIndexPopup`: обычное окно без prop
сохраняет слой 1001, даже при другом token/base. Это ограничение Ant Design 6.6.8,
подтверждённое [raw observation](./tests/browser/fixtures/ant-design-tour-z-index-observation.json).
Для изменения фактического слоя используйте prop `zIndex`; его default сохранён.

CSS для произвольного prefixCls и общий zIndex context всех
popup families остаются вне этого этапа.
React private PurePanel и development diagnostics не экспортируются.

Проверки: [engine](./src/lib/tour.engine.test.ts),
[public package SSR](./tests/package/tour.ssr.test.ts),
[browser](./tests/browser/tour.spec.ts) и `?fixture=tour`.
[61 исходное CSS-правило](./src/lib/vendor/tour.css) воспроизводится
[рецептом](./tools/ant-design-css-recipes.json). Перенесённая логика снабжена
MIT-лицензиями [rc-tour](./src/lib/vendor/LICENSE.rc-tour),
[rc-trigger](./src/lib/vendor/LICENSE.rc-trigger) и
[rc-portal](./src/lib/vendor/LICENSE.rc-portal). CloseOutlined из icons-svg 4.6.0
использует существующую [MIT-лицензию icons](./src/lib/vendor/LICENSE.ant-design-icons).

## Typography

`Typography` — нативный `article` с типографическими стилями; `component` меняет
его тег. `TypographyText`, `TypographyTitle`, `TypographyParagraph` и
`TypographyLink` соответствуют Text/Title/Paragraph/Link Ant Design 6.6.8 и
добавляют операции над текстом. Точные контракты находятся в
[typography.types.ts](./src/lib/typography.types.ts).

```svelte
<script lang="ts">
  import { TypographyTitle, TypographyParagraph, TypographyLink } from 'antd-svelte';

  let text = $state('Длинный текст статьи');
  let expanded = $state(false);
</script>

<TypographyTitle level={2}>Название статьи</TypographyTitle>
<TypographyParagraph children={text} copyable
  editable={{ onChange: value => { text = value; } }}
  ellipsis={{ rows: 2, expandable: 'collapsible', expanded,
    onExpand: (_event, info) => { expanded = info.expanded; } }} />
<TypographyLink href="/articles" target="_blank">Все статьи</TypographyLink>
```

Text рендерит `span`, Title — `h1`–`h5` (по умолчанию `h1`), Paragraph — `div`,
Link — `a`. У Link с `target="_blank"` и не заданным `rel` добавляется
`noopener noreferrer`. `disabled` меняет оформление; кнопки copy/edit/expand
сохраняют интерактивность, как в upstream. Decorations оборачивают текст вместе
с действиями; `actions.placement` переносит панель в начало или конец.

`copyable` принимает настройки text, format, icon, tooltips, tabIndex и onCopy.
Async producer вызывается по клику; пустой text использует исходный children
fallback. HTML копируется как `text/html` и `text/plain`; при отказе Clipboard API
применяется document copy fallback. Успешное состояние сбрасывается через три
секунды. Уже начатая операция и callback завершаются после unmount без нового
таймера. Для богатого содержимого указывайте `copyable.text`: исходный array
fallback объединяет верхний уровень, а узлы элементов превращает в
`[object Object]`.

`editable` управляет режимом через editing; callbacks сами не заменяют children.
Редактор получает editable.text или строковые children. Ввод удаляет CR/LF,
сохранение применяет trim. Enter вызывает onChange и onEnd, Escape — onCancel,
blur — только onChange; IME и модификаторы Enter учитываются. Поддержаны
triggerType, maxLength, autoSize, tooltip, icon и tabIndex. `enterIcon={null}`
скрывает подтверждение; custom enterIcon snippet получает CSS class первым
аргументом вместо React cloneElement. При закрытии фокус возвращается к edit icon.
Редактор не становится control внешнего FormItem. При blur без relatedTarget
проверка connected выполняется после Svelte tick: удаление focused DOM не должно
сохранять draft. `bind:nativeElement` отсутствует во время editing и очищается
при unmount.

Без действий и других настроек ellipsis использует native CSS. JS-ветка измеряет
строки и операции, ищет границу по UTF-16, сохраняет suffix и полный aria-label.
Поддержаны rows, expandable/collapsible, symbol, defaultExpanded, expanded,
onExpand, onEllipsis и tooltip. DefaultExpanded читается один раз. Text исключает
rows/expandable/onExpand; для responsive ширины Text задайте style. Link принимает
boolean ellipsis. Tooltip измеряет native overflow при наведении и скрывается
над панелью действий. Его trigger и hover delays наследуют ConfigProvider.tooltip;
локальные options приоритетнее, включая 0 и trigger=[]. Вложенный tooltip record
заменяет родительский целиком. Без настроек trigger=hover и обе задержки равны 0.1s.
Поддержаны focus/click/contextMenu и массивы событий; source config разделяет
их действия, поэтому hover leave может закрыть подсказку, открытую click/focus.
Повторный contextMenu переключает видимость, обычный click её закрывает.
Локальные showAction/hideAction независимо заменяют эти действия; focusDelay и
blurDelay не наследуют mouse delays. Их приоритет, touch fallback и поведение
внешнего закрытия описаны в [Tooltip](#tooltip).
Подсказки copy/edit наследуют те же настройки; копирование, success title и вход
в редактор сохраняют свои обычные действия.
Ellipsis Tooltip также принимает destroyOnHidden:
при закрытии удаляется его содержимое, измерение текста и native shell сохраняются.
Как в upstream, onOpenChange сообщает raw open даже для текста без усечения,
но сама подсказка остаётся скрытой. Для native CSS ellipsis сначала требуется
измерение при наведении; JS ellipsis измеряется независимо от Tooltip trigger.

Scalar children и массивы передают точные границы текста до SSR. В массиве snippet
остаётся атомом. Обычный текстовый children snippet распознаётся после mount через
DOM; при JS truncation и editing исходный snippet остаётся в скрытом `span`, чтобы
получать обновления. Его полный текст поэтому остаётся в textContent, а видимый обрезанный
текст доступен через innerText. Для точного initial SSR editing используйте
scalar children или editable.text. Богатый snippet не разбирается как React tree.

ConfigProvider.typography задаёт class/style и semantic root/actions/action/textarea;
локальные слои имеют приоритет. Callback видит разрешённые prefixCls/direction и
фактический component. Locale.typography и исходный locale.Text задают подписи
действий; Text имеет приоритет при совместном использовании. Сохранены dark,
compact, RTL, native focus и исходные heading margins.

`theme.components.Typography` применяет `titleMarginTop`/`titleMarginBottom`,
alias overrides и algorithms к обычному тексту и редактору. Global tokens,
вложенные/reset/sibling scopes и отдельный CSS-variable prefix следуют source;
semantic и локальный style сохраняют приоритет. Смена темы сохраняет DOM,
draft/selection/focus редактора и ожидающее async-копирование. Без source theme
сохраняются прежние CSS defaults.

Tooltip использует общий native popover внутри корня вместо React body portal.
Доступны общие 12 placement, container getters, color, локальные popup prefixCls и
openClassName и semantic styles. Callbacks получают разрешённые trigger/delays
и входной open владельца. Изменение config сохраняет popup DOM, ввод, выделение
и фокус. Остальные delegated Tooltip props, включая UniqueProvider/motion
и полную геометрию CSS-transform/scroll-container,
ещё требуют переноса. Граница fresh для opaque Snippet описана в Tooltip.
Vendor CSS рассчитан на `ant-typography`, произвольный prefix
не генерирует новый CSS.

Проверки: [engine](./src/lib/typography.engine.test.ts),
[copy lifecycle](./src/lib/typography-copy.model.test.ts),
[public package SSR](./tests/package/typography.ssr.test.ts),
[browser](./tests/browser/typography.spec.ts), `?fixture=typography`.
Темы сверяются с [официальным UMD](./tests/browser/fixtures/ant-design-typography-theme-reference.json)
в [unit](./src/lib/theme-typography-tokens-reference.test.ts),
[SSR](./tests/package/typography-theme.ssr.test.ts) и
[браузере](./tests/browser/typography-theme.spec.ts), `?fixture=typography-theme`.

Ширина actions сверяется с
[DOM/CSS-снимком Ant Design 6.6.8](./tests/browser/fixtures/ant-design-typography-actions-reference.json)
в изолированном ShadowRoot. Так сравнение использует одинаковые шрифты текущего
браузера в Chromium и Headless Shell; точность и границы двухстрочного текста сохранены.

Ellipsis Tooltip defaults, semantic callbacks и события сверяются с
[23 UMD-сценариями / 29 кадрами и 21 event trace](./tests/browser/fixtures/ant-design-typography-tooltip-reference.json):
[SSR](./tests/package/typography-tooltip.ssr.test.ts),
[browser](./tests/browser/typography-tooltip.spec.ts), `?fixture=typography-tooltip`.
Эталон использует runtime CSS официального UMD без статического antd.css;
native overflow измеряется под trigger=[] до записи последовательностей событий.
[73 исходных CSS rules](./src/lib/vendor/typography.css) воспроизводятся
[рецептом](./tools/ant-design-css-recipes.json). Иконки взяты из
@ant-design/icons-svg 4.6.0 под существующей
[MIT-лицензией](./src/lib/vendor/LICENSE.ant-design-icons).

## Listy

Listy переносит Ant Design 6.6.8, @rc-component/listy 1.2.3 и
@rc-component/virtual-list 1.5.1. Последняя версия удовлетворяет runtime range
`^1.4.0` Listy и соответствует dev-зависимости закреплённого Ant Design и коду
его официального browser bundle. React runtime не добавляется в пакет.

```svelte
<script lang="ts">
  import { Listy, type ListyRef } from 'antd-svelte';
  const items = [
    { id: 'one', team: 'A', name: 'Alpha' },
    { id: 'two', team: 'B', name: 'Beta' },
    { id: 'three', team: 'A', name: 'Gamma' }
  ];
  let list = $state<ListyRef>();
</script>

{#snippet title(team: string, members: typeof items)}
  <strong>{team} ({members.length})</strong>
{/snippet}
<Listy {items} rowKey="id" height={240} virtual sticky
  group={{ key: item => item.team, title }} bind:ref={list}>
  {#snippet itemRender(item, index)}<a href={`#${item.id}`}>{index}: {item.name}</a>{/snippet}
</Listy>
<button onclick={() => list?.scrollTo({ key: 'three', align: 'top' })}>Show Gamma</button>
```

Точные props, semantic slots и refs описаны в [исходных типах](./src/lib/listy.types.ts).
Items принимает readonly массив; rowKey обязателен и не подменяется индексом.
Группы собираются по всему массиву в порядке первого появления ключа, даже когда
записи группы идут вперемежку. Title получает исходные объекты группы;
itemRender — исходный индекс записи. Ноль и пустая строка сохраняются в ключах.
При некорректных duplicate keys записи не удаляются; внутренние occurrence keys
предотвращают фатальную ошибку Svelte. Для корректной идентичности нужны уникальные keys.

Virtual выбирается как `local ?? ConfigProvider.virtual ?? false`. Без ненулевой
height виртуальная ветка выводит все строки; height=0 в raw mode схлопывает viewport.
Виртуальное окно использует исходную оценку высоты, измерения строк с margins,
overscan и сохранение cache по ключам. Поддержаны переменные высоты, resize,
замена/сокращение данных, колесо, nested lists, touch momentum, selection drag и
scrollbar с track click/drag и задержкой скрытия. При смене raw/virtual создаётся
новая ветка со своей прокруткой и cache, как в React.

Ref содержит только scrollTo. Число и `{ top, left }` задают позицию;
`{ key }` и `{ groupKey }` поддерживают top/bottom/auto и offset. В raw mode
используется native scrollIntoView с временными scroll margins; группа означает
целую section. В virtual mode группа означает строку заголовка, выравнивание
повторяется после измерений. Sticky offset применяется для top, включая auto,
который разрешился в top; до измерения заголовка используется оценочная высота.
Отсутствующий ключ сохраняет позицию; виртуальная ветка повторно ищет его во время
обновления данных. Без аргумента либо с null raw mode ничего не меняет, virtual
показывает scrollbar. При одновременно переданных key/groupKey raw mode выбирает
item, virtual mode — group. Горизонтальная виртуализация не входит в API Listy.

ConfigProvider.listy задаёт class/style и semantic root/item/groupHeader.
Локальные значения дополняют классы и перекрывают стили; style перекрывает
styles.root. Callback получает сырые props до defaults/context; generic callbacks
в metadata имеют тип unknown. Virtual root принудительно сохраняет position:relative,
а top закреплённого clone перекрывает пользовательский top.

OnScroll (либо native onscroll) получает native UIEvent: currentTarget — raw root
либо virtual holder. Bind:ref и bind:nativeElement появляются после mount и
очищаются при unmount. SSR не создаёт timers/observers; sticky clone появляется
после mount. Нативные ссылки, controls, выделение и focus сохраняются; доступны
RTL, dark, compact и reduced motion. Компонент не добавляет выбор строк,
прикладную навигацию или собственное пустое состояние.
Ссылки itemRender используют source color/decoration, hover/active/focus и inline
priority. Общий [link reset](./src/lib/vendor/list-link-reset.css) действует внутри
Listy; прежний native focus-visible ring и внешние ссылки сохраняются.

`theme.components.Listy` применяет `itemPaddingBlock`/`itemPaddingInline`,
font/color/spacing aliases и algorithms в raw/virtual ветках. Оценка высоты строки
следует source: fontHeight плюс удвоенный вертикальный padding, без lineWidth;
фактические высоты уточняются измерением DOM. Явный undefined padding использует
source fallback для оценки. LineHeight темы применяется до semantic/local styles;
без source theme сохраняются прежние CSS и оценки высоты.
Смена темы сохраняет DOM, draft/selection/focus, refs и живой cache измерений.
Поддержаны named CSS variables, nested/reset/sibling scopes, dark/compact и RTL.

В virtual-list 1.5.1 обнаружена пропущенная зависимость `itemHeight` в `useMemo`.
Если semantic styles сохраняют высоты видимых строк, новая оценка не обновляет
невидимую часть до другого изменения списка. Native пересчитывает её сразу,
как свежий mount исходного компонента. Raw измерения 2555→2555px против свежих
2835px сохранены в `staleEstimateObservation` эталона; это отличие оставлено
для отдельного разбора.

Генерация CSS для произвольного prefixCls и React development warnings остаются
за пределами этого этапа. CSS рассчитан на ant-listy.
Проверки: [engine](./src/lib/listy.engine.test.ts),
[публичный пакет/SSR](./tests/package/listy.ssr.test.ts),
[браузер](./tests/browser/listy.spec.ts), `?fixture=listy`.
Темы, видимое окно и высота виртуального содержимого сверяются с
[официальным UMD](./tests/browser/fixtures/ant-design-listy-theme-reference.json)
в [unit](./src/lib/theme-listy-tokens-reference.test.ts),
[SSR](./tests/package/listy-theme.ssr.test.ts) и
[браузере](./tests/browser/listy-theme.spec.ts), `?fixture=listy-theme`.
[CSS-рецепт](./tools/ant-design-css-recipes.json) воспроизводит
[16 правил](./src/lib/vendor/listy.css) без keyframes;
[MIT Listy](./src/lib/vendor/LICENSE.rc-listy) и
[MIT virtual-list](./src/lib/vendor/LICENSE.rc-virtual-list) включены в пакет.

## TreeSelect

TreeSelect переносит первый объём Ant Design 6.6.8 / rc-tree-select 1.16.1.
Панель использует существующий Tree; checkbox conduction считается по полному
дереву, а display values и фильтрованная панель вычисляются отдельно.
React-зависимости не устанавливаются. Лицензия сохранена в
vendor/LICENSE.rc-tree-select. Рецепт CSS извлекает 92 правила dropdown/checkbox/RTL;
внутренний prefix .ant-select-tree нормализован к общему .ant-tree. Selector
использует существующие стили Select и theme aliases.

```svelte
<script lang="ts">
  import { TreeSelect } from 'antd-svelte';
  const data = [{value:'docs',title:'Документы',children:[{value:'intro',title:'Введение'}]}];
  let value = $state<string[]>([]);
</script>
<TreeSelect treeData={data} {value} treeCheckable treeDefaultExpandAll
  showSearch={{treeNodeFilterProp:'title'}} onChange={next => { value = next; }} />
```

Узел содержит уникальный value (string/number), title/label, children,
disabled/disableCheckbox/checkable/selectable/isLeaf. Внутренняя идентичность —
value, как в upstream fieldNames; key можно не задавать. Значения должны быть
уникальны также после String(value). Title/label могут быть string/number/Snippet.
TreeTitleRender принимает snippet с исходным TreeSelectNode и задаёт заголовки
панели и выбранных значений.

Value/defaultValue принимают scalar, массив или {value,label?,halfChecked?}.
Null очищает; undefined включает внутреннее состояние. Value/open/showSearch.searchValue —
controlled props с callbacks, без автоматического переписывания владельца.
При отказе владельца принять onSearch поле восстанавливается из searchValue.
Enter игнорирует активный узел, удалённый из treeData; выбранные отсутствующие
значения по-прежнему можно удалить через теги.
Multiple включает массивы. TreeCheckable включает checkbox и multiple;
treeCheckStrictly также включает checkbox/multiple и принудительно labelInValue.
Параметр типа TreeSelectProps<ValueType> сохраняет конкретный тип callback value;
режим и переданный тип должны соответствовать друг другу, как в upstream.

OnChange(value,labels,extra) получает scalar либо массив; при labelInValue/strict
это объекты с value/label/halfChecked/disabled, а labels=null. При полной очистке
single возвращается undefined, multiple — []; labels=[] в raw mode. Extra включает
triggerValue; deprecated preValue/checked/selected удалены.
OnSelect/onDeselect(value,node) вызываются для конкретного узла; clear вызывает
onClear/onChange без onDeselect для каждого тега. Deprecated React getters
triggerNode/allCheckedNodes и wrappers node.props исключены из переноса.

В checkbox-режиме исходная conduction уважает disabled/disableCheckbox/checkable
границы. ShowCheckedStrategy по умолчанию SHOW_CHILD; отдельные экспорты
TREE_SELECT_SHOW_CHILD/SHOW_PARENT/SHOW_ALL соответствуют константам React TreeSelect.
Стратегия влияет и на теги, и на onChange при conduction. Внутренние полные отметки
сохраняются отдельно: снятие потомка или удаление тега корректирует родителей.
Без treeCheckable стратегия равна SHOW_ALL, включая independent strict mode.
HalfChecked объекты в strict value не показываются отдельными тегами, но
сохраняются в callback до явной отметки этого значения.

Missing values не удаляются при смене treeData. Подпись отсутствующего узла
сохраняется из labeled value либо внутреннего labeled состояния; raw controlled
value без подписи отображается самим значением. Индивидуальный тег disabled узла
не удаляется, но clear очищает весь набор, как в upstream.

ShowSearch по умолчанию false для single и true для multiple. Объект showSearch
поддерживает searchValue/onSearch, autoClearSearchValue, filterTreeNode и
treeNodeFilterProp. Одноимённые deprecated top-level props удалены.
Default filter prop — value, не title. Поиск без учёта регистра сохраняет предков
совпадения и всех потомков совпавшего родителя. FilterTreeNode=false сохраняет
всё дерево; callback задаёт predicate. Отметка фильтрованного родителя всё равно
считается по полному дереву. AutoClearSearchValue=true очищает внутренний search
после выбора; controlled search очищает владелец. Само автоматическое очищение
не вызывает onSearch. Загрузка узлов во время поиска отключена.

LoadData(node), treeLoadedKeys/onTreeLoad и treeExpandedKeys/onTreeExpand
используют механизмы Tree; children добавляет потребитель. TreeDefaultExpandAll
и treeDefaultExpandedKeys задают начальное раскрытие. В TreeSelect раскрытие
панели хранится снаружи Tree: после load rejection раскрытая ветка может повторять
загрузку до исходного лимита Tree. Отдельного error callback/слота нет. Закрытый
popup не начинает новых загрузок; уже начатый Promise может завершиться и вызвать
onTreeLoad. После unmount результаты игнорируются.

Native combobox удерживает фокус при действиях в панели. Arrows перемещаются/
раскрывают дерево через его keyboard engine; Enter выбирает активный узел, а не
переключает раскрытие. Escape/Tab закрывают popup; Backspace удаляет последний
доступный тег при пустом search. Single закрывает popup после выбора, multiple
оставляет его открытым. Popup использует существующий native popover lifecycle;
listHeight ограничивает viewport, onPopupScroll получает его scroll event.
PopupMatchSelectWidth, placement, size/status/variant, treeLine/treeIcon/switcherIcon,
notFoundContent/loading, RTL, темы, Compact и ConfigProvider/Form disabled поддержаны.
Bind:nativeElement/inputElement дают DOM; bind:this — focus(options)/blur().

Name/FormItem создают hidden inputs с raw values для native FormData. Form model
хранит raw scalar/массивы, поддерживает required/submit/reset; библиотека не меняет
объектный контракт labelInValue ради ограничений Form v1. Его общий object store
остаётся отдельным этапом. SSR не запускает loadData, popover или browser APIs.

Source theme объединяет `components.Select` и `components.TreeSelect` в исходном
порядке: aliases TreeSelect могут менять также поле. Select оформляет теги,
стрелку/clear и focus, TreeSelect — размеры/отступы узлов, цвета и checkbox панели.
Настройки `components.Tree` не меняют дерево внутри TreeSelect. Токены доступны
при SSR; смена темы сохраняет DOM, поиск, выделение, focus, raw FormData и позицию
открытой панели. В source compact высота узла — 21px. Native-only темы сохранены.

GetPopupContainer получает корневой `.ant-select`; локальная функция перекрывает
ConfigProvider.getPopupContainer, undefined наследует provider. Getter не вызывается
на сервере и до первого открытия. Перенос в HTMLElement/ShadowRoot сохраняет
Select/TreeSelect tokens, поиск, keyboard engine, lazy load и native FormData.
Зазор до поля — исходные 4 px. При замене функции с тем же контейнером сохраняются
DOM панели, фокус и выделение; ShadowRoot требует собственных стилей. Сверка
TreeSelect/Cascader с 40 сценариями официального UMD —
[choice-container](./tests/browser/choice-container.spec.ts), `?fixture=choice-container`.

Virtual/scrollTo, fieldNames/simple mode, TreeNode children, maxCount/maxTagCount,
tag/popup render hooks, treeExpandAction, остальные semantic slots/config/ref API
и исходные motion API ещё не перенесены. Deprecated React extras исключены.
Класс popup задаётся через classNames.popup.root; popupClassName удалён.

## Tree

Tree переносит Ant Design 6.6.8 и @rc-component/tree 1.4.0. Чистые engines отвечают
за flatten/родителей, исходную checkbox conduction и async load lifecycle.
React/rc-tree runtime не устанавливаются; лицензия сохранена в vendor/LICENSE.rc-tree.
CSS-рецепт извлекает 98 правил из закреплённого antd.css, исключая TreeSelect и
collapse motion. Иконки соответствуют @ant-design/icons-svg 4.6.0.

```svelte
<script lang="ts">
  import { Tree, type TreeKey, type TreeCheckedKeys } from 'antd-svelte';
  const nodes = [{key:'docs',title:'Документы',children:[{key:'intro',title:'Введение'}]}];
  let expanded = $state<TreeKey[]>(['docs']);
  let checked = $state<TreeKey[] | TreeCheckedKeys>([]);
</script>
<Tree treeData={nodes} aria-label="Документы" checkable expandedKeys={expanded}
  checkedKeys={checked} onExpand={keys => { expanded = keys; }}
  onCheck={keys => { checked = keys; }} />
```

TreeData — массив узлов со стабильным уникальным key (string/number/bigint), title
(string/number/Snippet<[TreeDataNode]>) и children. Ключи должны быть уникальны и
после String(key), как в upstream entity index. Поддержаны disabled,
disableCheckbox, checkable, selectable, isLeaf, icon и локальные class/style.
ExpandedKeys/selectedKeys/checkedKeys/loadedKeys — controlled props; default-пары
инициализируют внутреннее состояние. Владелец может отклонить callback. Массивы
ключей и treeData обновляются новым значением, как в исходном controlled API.

DefaultExpandParent=true раскрывает родителей начальных expanded keys до disabled
границы. AutoExpandParent=false по умолчанию; true повторяет раскрытие родителей
при изменении controlled keys. Чтобы разрешить сворачивание предка при сохранённом
ключе потомка, отключите autoExpandParent. DefaultExpandAll применяется только
при инициализации к узлам с детьми; данные, поступившие позже, сами по себе не
расширяют этот начальный набор.

Выбор строки независим от checkbox. Multiple переключает отдельные ключи без
обязательного Ctrl и не добавляет range selection. Selectable=false переводит
клик заголовка на отметку. Node.selectable перекрывает tree selectable. В обычном
checkable-режиме отметки распространяются вниз и вверх; disabled,
disableCheckbox и checkable=false останавливают conduction. Disabled-потомки
не мешают полноте отметки разрешённого родителя. Снятие отметки использует исходный
fill/clean algorithm; дети, добавленные в отмеченного родителя, получают отметку.
CheckStrictly=true разрывает связи и onCheck возвращает {checked,halfChecked}.
Без него onCheck возвращает массив и info.halfCheckedKeys/checkedNodesPositions.
CheckedKeys в strict режиме принимает также объект с halfChecked.

OnExpand(keys,{expanded,node,nativeEvent}), onSelect(keys,{event,selected,node,
selectedNodes,nativeEvent}), onCheck(keys,{event,checked,node,checkedNodes,...})
сохраняют отдельные события. Node включает исходные данные, pos и flags
expanded/selected/checked/halfChecked/loaded/loading/active. Mouse callback содержит
нативный event; keyboard callbacks соответствуют внутреннему пути rc-tree и могут
не иметь nativeEvent. Дополнительно поддержаны onClick/onDoubleClick/onRightClick
и onActiveChange. Состояние node в callback относится к узлу до действия.

LoadData(node) возвращает PromiseLike. Дети добавляются потребителем в treeData;
компонент их не выдумывает. Loading дедуплицируется по ключу; pointer switcher ждёт завершения загрузки,
но клавиатура позволяет свернуть pending-ветку. OnLoad(keys,{event:'load',
node}) вызывается до внутреннего обновления loadedKeys. При controlled loadedKeys
владелец принимает новый набор сам. Загрузка запускается и для изначально раскрытой
видимой незагруженной ветки. Узел с уже имеющимися детьми не загружается повторно;
isLeaf=true запрещает загрузку, isLeaf=false сохраняет switcher даже у пустой
загруженной ветки. Rejection снимает loading и сворачивает uncontrolled ветку,
не вызывая onLoad; повторное раскрытие позволяет retry. После 10 неудачных попыток
загрузка прекращается, ключ помечается загруженным без успешного onLoad. Отдельного
onError/публичного error-state в исходном Tree нет: обработка ошибки остаётся в
loadData потребителя. Результаты после unmount не меняют состояние и callbacks.

Клавиатура использует один tab stop на role=tree и aria-activedescendant. Up/Down
перемещаются циклически по видимым строкам, Home/End — к краям. Left сворачивает
либо переходит к родителю, Right раскрывает либо переходит к первому ребёнку;
эти действия не инвертируются в RTL, как в rc-tree. Enter раскрывает ветку либо
однократно выбирает/отмечает лист; Space переключает отметку, а без checkable —
выбор. Disabled-строки остаются в навигации. Disabled блокирует выбор/отметки,
но switcher допускает раскрытие мышью, как upstream; global disabled отключает
клавиатурную обработку. Native buttons имеют tabindex=-1; роли treeitem/checkbox
и level/posinset/setsize отражают логическое дерево. Bind:nativeElement даёт root;
bind:this предоставляет focus(options)/blur().

BlockNode, showLine и showLine={{showLeafIcon:true}}, showIcon, icon,
switcherIcon/switcherLoadingIcon, titleRender и filterTreeNode поддержаны.
Иконки и заголовки задаются snippets с node-аргументом; filterTreeNode подсвечивает
узел и не удаляет его из дерева. RU/EN подписи switcher берутся из Locale.tree;
темы, compact, RTL, ConfigProvider/Form disabled наследуют существующие контексты.
Height ограничивает native scroll viewport; виртуализация пока не применяется.
SSR рендерит видимые строки без загрузки и browser APIs.

`ConfigProvider.theme.components.Tree` подключён к общему механизму компонентной
темы: метрики title/switcher/indent, hover/selected colors, alias overrides,
global/component algorithms и custom cssVar prefix. Локальные CSS variables и
`style` сохраняют приоритет. Два DirectoryTree-only tokens объявляются как в
upstream, но отдельный DirectoryTree API ещё не реализован. Внутреннее дерево
TreeSelect использует тему Select/TreeSelect, независимо от `components.Tree`.
Отдельный UMD-замер проверяет одновременные конфликтующие настройки трёх компонентов.

Сохранён прежний native contract: `Tree.style` оформляет внешний корень. В React
этот prop относится к внутреннему `.ant-tree-list`; исходные замеры обоих слоёв
сохранены в [UMD-эталоне](tests/browser/fixtures/ant-design-tree-theme-reference.json).
Сверка видимого содержимого охватывает 14 тем / 112 наборов CSS-измерений, включая
checkbox, disabled/selected/active nodes, RTL и nested/reset/sibling scopes.
[Browser-проверки](tests/browser/tree-theme.spec.ts) также подтверждают сохранение
DOM, фокуса, active descendant, отметок и pending load при обновлении токенов;
[SSR-проверки](tests/package/tree-theme.ssr.test.ts) не запускают загрузку или
браузерные ресурсы. Декларации сверяются с официальным UMD отдельным
[unit-набором](src/lib/theme-tree-tokens-reference.test.ts).

DirectoryTree, drag/drop, virtual/scrollTo, expandAction, fieldNames, полный generic
node API, TreeNode children API, per-node switcherIcon, showLeafIcon snippet,
semantic/config API и collapse/appear анимации ещё не перенесены. Реестр
отделяет этот объём от полного React API Tree.

## Upload / UploadDragger

Upload переносит Ant Design 6.6.8 и AjaxUploader/request из @rc-component/upload
1.1.1. UploadDragger соответствует Upload.Dragger; UPLOAD_LIST_IGNORE — отдельный
экспорт аналога Upload.LIST_IGNORE. React и rc-upload runtime не устанавливаются.
Лицензия rc-upload сохранена в vendor/LICENSE.rc-upload; CSS-рецепт извлекает
82 правила из закреплённого antd.css, исключая неиспользуемые motion selectors.
Отдельный рецепт `upload-link-reset` добавляет 14 исходных общих правил ссылок
внутри Upload; цвета error rows сохраняют приоритет.
Иконки взяты из закреплённого @ant-design/icons-svg 4.6.0 с существующей лицензией.

```svelte
<script lang="ts">
  import { Upload, Button, UPLOAD_LIST_IGNORE, type UploadFile } from 'antd-svelte';
  let files = $state.raw<UploadFile[]>([]);
</script>
<Upload fileList={files} multiple action="/api/upload" name="attachment"
  beforeUpload={file => file.size > 10_000_000 ? UPLOAD_LIST_IGNORE : true}
  onChange={info => { files = info.fileList; }}>
  <Button>Выбрать файлы</Button>
</Upload>
```

FileList — controlled prop с onChange; defaultFileList задаёт внутренний список.
Элемент UploadFile имеет стабильный uid, name, optional status/percent/url/thumbUrl,
originFileObj/response/error/xhr. Статусы — uploading/done/error/removed. API типов
параметризован типом ответа: UploadProps<T>, UploadFile<T>, UploadRequestOptions<T>.
Передавайте uid для каждого элемента списка. Callback onChange({file,fileList,event?})
предлагает полный новый список; владелец может отклонить изменение. Progress/success/error
файла, уже исключённого владельцем из списка, не вызывают onChange.

BeforeUpload(file,batch) может быть асинхронным. Возврат false или rejected promise
останавливает отправку, но сохраняет файл без uploading-статуса. UPLOAD_LIST_IGNORE
исключает его и из списка. Blob/File заменяет отправляемое содержимое с исходным
uid; action/data получают исходный файл. Batch стартует после обработки всех
beforeUpload/action/data. Для совместимости с upstream onChange.file при false —
нативный File с uid, а элемент fileList содержит originFileObj; тип callback отражает
это различие. MaxCount=1 сохраняет последний файл; большее значение — первые N.
MaxCount ограничивает список и callbacks, но сам по себе не отменяет запросы.

Стандартный транспорт использует XHR и multipart FormData: name='file', method='post',
action='' по умолчанию; data может быть объектом или async callback, массивы
добавляются как key[]. Поддержаны headers/withCredentials и async action. Заголовок
X-Requested-With=XMLHttpRequest можно отключить значением null. 2xx означает успех,
JSON-ответ разбирается; HTTP/network errors передаются в состояние файла.
CustomRequest(options,{defaultRequest}) получает file/action/data/name как filename,
method/headers/withCredentials и onProgress/onSuccess/onError. Он может вызвать
предоставленный defaultRequest и вернуть {abort()}. Bind:this.abort(file|uid) либо
abort() отменяет активные запросы; unmount отменяет их автоматически.

Ручной запуск устроен как в upstream: beforeUpload={() => false}, контролируемый
список и отдельная кнопка потребителя, которая отправляет originFileObj через
свой транспорт и обновляет fileList. Компонент не добавляет прикладных endpoints,
очередей или нового метода submit. Галерея показывает локальную демонстрацию
такого сценария без сетевой отправки файлов.

OnRemove может вернуть false/Promise<false> для запрета удаления; после разрешения
запрос отменяется, onChange получает status='removed'. Preview/download доступны
через onPreview/onDownload; без callbacks ссылки открывают url. Disabled скрывает
remove по умолчанию и блокирует его даже при showRemoveIcon=true; preview/download
остаются доступны как в upstream. ShowUploadList принимает false или объект
showRemoveIcon/showDownloadIcon/showPreviewIcon (boolean либо predicate), extra —
Snippet<[UploadFile]>. ListType: text, picture, picture-card, picture-circle;
previewFile/isImageUrl настраивают thumbnail. По умолчанию thumbnails повторяют
исходный 200px canvas preview, включая GIF/SVG. Progress появляется через 300 ms.

UploadDragger принимает height и по умолчанию hasControlInside=false: его trigger
имеет role=button и открывает chooser клавиатурой. Обычный Upload по умолчанию
ожидает native control внутри children snippet; локальный disabled нужно передавать
и этому control. Form.disabled и ConfigProvider.componentDisabled наследуются компонентом;
явный disabled перекрывает контекст.
OpenFileDialogOnClick=false оставляет drop без открытия chooser. Multiple/accept/capture
передаются скрытому native input; native выбор обычно фильтрует сам браузер, drop
использует accept. Поддержан accept={format,filter:'native'|predicate}. В rc-upload
1.1.1 single drop выбирает первый исходный файл, не применяя accept-фильтр;
это поведение сохранено. Input сбрасывается после выбора для повторного файла.
Id удаляется при disabled/отсутствии children, чтобы label не открывал диалог.
Bind:nativeElement/inputElement дают DOM-элементы, без запуска транспорта при SSR.

`ConfigProvider.theme.components.Upload` применяет actionsColor/pictureCardSize,
aliases и algorithms к wrapper, списку и Dragger. ActionsColor задаёт цвет обычных
действий; в карточках сохраняются исходные белые иконки поверх затемнения.
Button, Progress и Tooltip получают свои component tokens. Style остаётся на
области выбора/drop; локальные CSS variables, включая другой cssVar.prefix,
перекрывают вычисленную тему именно на этой области.

Обновления темы сохраняют controller, запросы, fileList, native input и фокус.
Канонические классы иконок подключают исходные размеры/цвета действий;
обёртка Tooltip ошибки сохраняет полную высоту карточки. 16 тем официального UMD
и состояния списка — [upload-theme](./tests/browser/upload-theme.spec.ts),
`?fixture=upload-theme`; [SSR](./tests/package/upload-theme.ssr.test.ts) не запускает
загрузку и browser timers.

В общих с upstream стилях `pictureCardSize: 0` приводит к наложению карточек:
центр первой карточки может попасть на preview соседней. Исходное наблюдение
сохранено в `zero-metrics.interactions` [эталона](./tests/browser/fixtures/ant-design-upload-theme-reference.json).
Этот крайний случай требует отдельного решения.

Locale/upload из ConfigProvider, собственный locale, RU/EN, RTL и theme variables
поддержаны. Directory/pastable, itemRender/iconRender/custom action icons,
progress customization, linkProps, полный ref/config/semantic API и исходные
appear/exit/collapse анимации остаются отдельными пробелами реестра. Данный этап
не заявляет полного покрытия React Upload.

## Input

Расширение Input перенесено из
[woodger/ant-design@cf3e20c](https://github.com/woodger/ant-design/commit/cf3e20c829cdbcfa46232ea126606dbe853bbcd5).
Эталон исходной реализации — Ant Design 6.6.8 / @rc-component/input 1.3.1 (~1.3.1).
Стили находятся
в [vendor/antd.css](./src/lib/vendor/antd.css), [MIT-лицензия rc-input](./src/lib/vendor/LICENSE.rc-input)
сохранена. React runtime и новые dependencies не добавлены.

```svelte
<script lang="ts">
  import { Input } from 'antd-svelte';
  let value = $state('example');
</script>
<Input bind:value prefix="https://" suffix=".org" allowClear
  count={{ show: true, max: 24 }} variant="filled" aria-label="Адрес" />
```

Существующие string bind:value/defaultValue, onValueChange, native oninput/
onchange/onblur, атрибуты и FormItem associations сохраняются. Внешние изменения
не вызывают change callbacks; defaultValue фиксируется при создании. Native
name/required/maxlength/readonly остаются на реальном input, а class/style/hidden
относятся к самому внешнему элементу. ReadOnly/maxLength/autoComplete/autoFocus —
добавочные camel aliases; lowercase native attrs сохраняются. Size принимает
medium, htmlSize задаёт native size отдельно.

Prefix/suffix принимают scalar/Snippet. Без affixes и clear/count остаётся
один input. Prefix/suffix/clear/count добавляют ant-input-affix-wrapper.
Порядок suffix: clear → count → suffix content. Счётчик и очистка следуют
исходным useCount/resolveOnChange правилам; их логика находится в
input-count.engine.ts и input-event.dom.ts. Root class/semantic root styles не
попадают на вложенное поле. Click внутри affix wrapper фокусирует input.
Для внешней композиции используйте SpaceCompact/SpaceAddon.

AllowClear — boolean/{disabled,clearIcon}; непереданные поля наследуют
ConfigProvider.input.allowClear, explicit false выключает control. Default icon —
close-circle SVG, scalar/Snippet меняет его; explicit falsy icon использует '✖'.
Source line-height:0 рассчитан на SVG; текстовому icon задайте размеры/line-height.
Clear button остаётся смонтированной с hidden class при пустом/readonly/disabled
value. Mousedown предотвращает blur; clear фокусирует поле, вызывает
onValueChange(''), onChange(click), onClear, без искусственного native input.

ShowCount/count используют UTF-16 length по умолчанию и custom strategy;
count.show перекрывает showCount. MaxLength — native hard limit, count.max — soft
max/out-of-range; 0 отключает soft limit. Только count.exceedFormatter обрезает
пользовательское значение после завершения IME, сохраняя selection; внешнее value
не обрезается. Formatter получает {value,count,maxLength} и возвращает scalar либо
Snippet<[info]> через ()=>snippet. Счётчик не добавляет live region.

Новый onChange получает native Event proxy со стабильным клонированным input
в target/currentTarget и nativeEvent. Input event имеет type=change, очистка —
click. Selection setters делегируются настоящему input; email/type без selection
не вызывают неподдерживаемые setters. Существующий порядок onValueChange → oninput
сохранён, новый onChange находится между ними; native onchange по-прежнему
срабатывает при native commit. Неизменённый compositionend не вызывает повторный
onChange. Если exceedFormatter изменил результат, change
получает type=compositionend. OnCompositionStart/End и прежние native callbacks
доступны одновременно.

OnPressEnter срабатывает один раз до keyup, блокируется isComposing, сбрасывается
при blur/disabled. OnKeyDown/Up дополняют native handlers. Для type=password,
как upstream, value attribute удаляется отложенно при mount/change/focus/blur;
property value сохраняется, timers очищаются при unmount.

Variant: outlined/filled/borderless/underlined; explicit variant → Form.variant → ConfigProvider.input.variant → ConfigProvider.variant → outlined.
ClassNames/styles поддерживают
root/input/prefix/suffix/clear/count как object или callback({props}), где size и
disabled уже разрешены из контекстов. Root priority: context styles.root → context
style → local styles.root → local style. Без wrapper эти root styles идут после
styles.input. ConfigProvider.input задаёт allowClear/autoComplete/variant/class/
style/classNames/styles; nested config наследуется целиком либо явно заменяется.
Form/FormItem disabled, errors/reset, Compact, темы/compact density, RTL, locale
и reduced motion сохраняются.

Bind:inputElement даёт HTMLInputElement, bind:nativeElement — внешний input/span,
как upstream nativeElement. Bind:this предоставляет focus({cursor:'start'|'end'|
'all',preventScroll}), blur(), select(), setSelectionRange(start,end,direction).
Refs очищаются при unmount. SSR не вызывает callbacks или password timers.
Как в полном CSS эталона 6.6.8, native hidden остаётся на root, но authored
inline-block/inline-flex перекрывает его UA display:none; компонент не добавляет
отдельный скрывающий CSS override.

Галерея `/ant-design#inputs` сохраняет старые примеры и добавляет расширенный.
Fixture `?fixture=input-features` дополняет прежний Input/Select integration.
Unit/SSR и browser проверяют count/IME, focus/Enter, clear/event order, refs,
FormData/FormItem/Compact, variants/semantic styles, темы и RTL.

Input.Password, Input.Search и Input.OTP доступны как
InputPassword, InputSearch и InputOTP. Общие prefixCls,
arbitrary token engine остаются отдельными пробелами. Deprecated internal
classes/structures исключены из переноса. Согласованный string bind:value
сохраняется вместо React controlled rejection/broad value types; native DOM events
и именованные Svelte bindings заменяют SyntheticEvent/ref object. Общий аудит
семейства Input остаётся unreviewed.

## InputPassword (Input.Password)

Переключатель видимости перенесён из Password.tsx и его тестов Ant Design 6.6.8.
InputPassword использует существующий Input: bind:value, defaultValue, native
атрибуты и события, clear/count, affixes, FormItem, Compact и методы refs
сохраняют его контракт. Точные настройки описаны в
[исходных типах](./src/lib/input-password.types.ts).

```svelte
<script lang="ts">
  import { InputPassword } from 'antd-svelte';
  let password = $state('');
  let visible = $state(false);
</script>

<InputPassword bind:value={password} autoComplete="new-password"
  visibilityToggle={{ visible, onVisibleChange: next => { visible = next; } }}
  aria-label="Пароль" />
```

Без visibilityToggle.visible компонент хранит видимость сам. В controlled-режиме
callback запрашивает новое состояние, а внешний visible определяет результат;
обновление prop не вызывает callback. При снятии контроля сохраняется последнее
состояние. VisibilityToggle=false скрывает кнопку, сохраняя текущую видимость и
suffix wrapper. Type всегда определяется видимостью.

Как в upstream, action=hover переключает состояние на mouseover; mouseleave
ничего не меняет. Обрабатываются и всплывающие события от иконки: смена SVG под
указателем может вызвать дополнительные переключения. Это поведение подтверждено
в React-версии 6.6.8 и сохранено. Enter и Space переключают один раз, повторные keydown
игнорируются. Disabled блокирует переключение и исключает его из Tab-порядка;
readonly оставляет показ доступным. Mousedown/mouseup не уводят фокус и не меняют
каретку. Вместо React span с role=button используется native button type=button
с тем же поведением и видимым keyboard focus. Переключатель стоит перед suffix,
после Input clear/count. Иконки Eye/EyeInvisible взяты из @ant-design/icons-svg
4.6.0; MIT-лицензия сохранена в vendor. IconRender возвращает scalar либо Snippet;
пустой результат оставляет доступную кнопку.

ConfigProvider.inputPassword задаёт собственные iconRender, variant и semantic
оформление поверх ConfigProvider.input. Вложенный inputPassword заменяет объект
целиком. Подписи переключателя используют locale.global.show/hide; частичный
global наследует остальные поля. Explicit size добавляет класс ant-input-password
с суффиксом размера, а унаследованный размер меняет только Input, как в эталоне.

Скрытый пароль удаляет value attribute после mount/input/focus/blur и запроса
скрытия, не меняя property value. При показе attribute восстанавливается; timers
очищаются при unmount. Bind:inputElement/nativeElement и bind:this методы
focus/blur/select/setSelectionRange делегируются Input. SSR не запускает timers
или callbacks. Фикстура `?fixture=input-password`, source SSR и проверки публичного
пакета покрывают эти сценарии, темы, RTL, локаль и FormItem. Общие ограничения
Input для prefixCls, variant/token engine и React value/ref conventions сохраняются.

## InputSearch (Input.Search)

InputSearch переносит Search.tsx Ant Design 6.6.8: Input и кнопка являются
соседними элементами SpaceCompact. Стили Search уже входят в vendor/antd.css;
геометрия SearchOutlined взята из @ant-design/icons-svg 4.6.0 с сохранением MIT.
Публичный контракт находится в [исходных типах](./src/lib/input-search.types.ts).

```svelte
<script lang="ts">
  import { InputSearch } from 'antd-svelte';
  let query = $state('');
</script>

<InputSearch bind:value={query} allowClear enterButton="Найти"
  onSearch={(value, event, info) => console.log(value, info?.source)}
  aria-label="Поиск" />
```

Кнопка и Enter вызывают onSearch с текущим native value и source=input.
OnPressEnter вызывается перед поиском; IME, isComposing, повторный Enter и loading
не запускают поиск. Очистка вызывает onValueChange(''), onSearch с source=clear,
onChange(click), onClear, сохраняя Svelte/native события Input. Loading блокирует
кнопку и Enter, но не очистку. Click кнопки сохраняет фокус Input, если он уже
был в поле. Сам по себе ввод не вызывает onSearch.

Boolean enterButton показывает обычную или primary icon button; scalar задаёт
текст primary button. SearchIcon наследуется из inputSearch config, локальный
prop имеет приоритет, null/false скрывают иконку. Для boolean enterButton
доступное имя кнопки использует locale.searchText. Текстовые кнопки именуются
своим содержимым. Вместо React cloneElement пользовательская кнопка задаётся
snippet с InputSearchButtonContext:

```svelte
<script lang="ts">
  import { Button, InputSearch, type InputSearchButtonContext } from 'antd-svelte';
</script>

{#snippet searchButton(context: InputSearchButtonContext)}
  <Button {...context.getButtonProps({ class: 'custom-search' })}>Найти</Button>
{/snippet}
<InputSearch enterButton={searchButton} aria-label="Поиск" />
```

Snippet заменяет кнопку целиком. GetButtonProps сохраняет собственные
disabled/loading, добавляет size и search class, объединяет callbacks в порядке
«собственный → Search». GetNativeProps аналогично обслуживает native button,
сохраняя его class/type и блокируя его при loading. Onmousedown пользователя
получает событие до preventDefault Search. Semantic button styles Search
применяются к стандартной кнопке; пользовательская сохраняет собственные, как
в upstream. Rich content можно разместить внутри своей Button.

ConfigProvider.inputSearch поддерживает class/style, semantic slots, searchIcon
и variant; вложенный объект заменяется целиком. Общий Input config продолжает
действовать на поле. Как в исходнике, input.variant является fallback для поля,
но не для кнопки: без отдельного Search variant она сохраняет обычный Button
variant. Semantic root относится к Compact, а button содержит root/icon/content;
строка в button — сокращение для button.root.

Class/style/hidden и data-* передаются Compact root; id/name/ARIA/constraints
остаются на Input. RootClassName относится к внутреннему Input.
InputElement/nativeElement и методы
bind:this возвращают внутренний Input, не внешний Compact. String bind:value,
defaultValue, FormItem, RTL, Compact, темы и SSR сохраняют контракты Input.
Fixture `?fixture=input-search` проверяет поиск, IME, callbacks, пользовательские
кнопки, semantic/config приоритеты и геометрию. Общие ограничения Input для
prefixCls, token engine и React value/ref conventions сохраняются;
аудит всего семейства остаётся unreviewed.

## InputOTP (Input.OTP)

InputOTP переносит OTP/index.tsx и OTPInput.tsx Ant Design 6.6.8. Каждая ячейка
использует Input; группа сохраняет role=group, классы ant-otp и исходные labels
«OTP Input 1», «OTP Input 2» и далее. Точные Props и настройки находятся в
[исходных типах](./src/lib/input-otp.types.ts).

```svelte
<script lang="ts">
  import { InputOTP } from 'antd-svelte';
  let code = $state('');
</script>

<InputOTP value={code} onChange={next => { code = next; }}
  formatter={text => text.replace(/\D/g, '')} autoComplete="one-time-code"
  aria-label="Код подтверждения" />
```

По умолчанию есть шесть ячеек, type=text и любое текстовое содержимое. Каждая
ячейка — одна UTF-16 code unit, как в source split(''); цифры не фильтруются
без formatter. Native size=1 задаёт ширину, maxlength=1 не устанавливается:
вставка нескольких символов распределяет их по ячейкам и заменяет оставшийся
хвост. Formatter получает всю строку с пробелами на пустых позициях до обрезки
до length. Пустые промежуточные позиции сохраняются, пустой хвост удаляется.

OnInput вызывается для каждого native input с массивом ячеек; onChange следует
за ним только для полностью заполненного изменившегося кода. Очистка, неполный
код и повторное событие с прежним полным кодом не вызывают onChange. Как в
upstream, composing input обрабатывается сразу, без отдельного IME-буфера.
Изменение props не вызывает onInput/onChange.

Value синхронизируется при изменении prop. Неизменённый value не отклоняет
локальный draft; снятие контроля сохраняет текущие ячейки. Bind:value не добавлен:
для полного значения используйте onChange, для частичного — onInput. DefaultValue
фиксируется при создании и проходит formatter; внешний value formatter не
проходит. Сохранено SSR-поведение upstream: сервер использует defaultValue,
а value применяется после mount. Для начального SSR-кода можно задать оба значения.

Фокус не пропускает предыдущие пустые ячейки. ArrowLeft/ArrowRight переходят
между физическими индексами, в том числе в RTL; Backspace из пустой ячейки
возвращает к предыдущей. Ctrl/Meta+z блокируется, как в исходнике. Фокус, мышь
и клавиатура восстанавливают выделение через animation frame; все отложенные
выделения отменяются при unmount. AutoFocus и focus() выбирают первую ячейку,
blur() снимает фокус. Bind:nativeElement возвращает div группы.

Mask=true рисует •, строка — собственный символ, включая emoji; реальное value
остаётся в input. По умолчанию mask выбирает type=password, явный type имеет
приоритет. Separator принимает scalar или factory(index); factory может вернуть
Snippet<[number]>, например через () => snippet. Numeric 0 сохраняется,
false/null/undefined/пустая строка не создают separator; true оставляет пустую
обёртку, как source isReactRenderable.

ConfigProvider.otp задаёт class/style, semantic root/input/separator и variant.
Вложенный объект заменяется целиком. Variant наследуется из otp, затем input;
общий Input config продолжает действовать на ячейки. Clear, унаследованный из
Input config, не меняет OTP: source слушает native input, а не onChange(click).
Size группы наследуется из componentSize; Compact продолжает действовать на
внутренние Input. FormItem id, label и описание ошибки относятся к группе,
а не дублируются на каждой ячейке. Статус и disabled передаются ячейкам; reset
учитывает Form.resetKey, в том числе для неполного кода без onChange.

Стили извлекаются рецептом otp в vendor/otp.css: 16 правил, без keyframes,
с проверкой SHA-256 исходного npm-архива. Fixture `?fixture=input-otp`, engine,
SSR и проверки публичного пакета покрывают эти сценарии. Общий аудит Input
остаётся unreviewed; prefixCls, token engine и React dev
diagnostics, включая предупреждение о длинной маске, пока не перенесены.

## TextArea (Input.TextArea)

Отдельный экспорт TextArea соответствует React Input.TextArea. Базовый объём
включает bind:value/string, defaultValue, name, rows, cols, maxlength, minlength,
required, disabled, readonly, placeholder, autocomplete и остальные native
атрибуты textarea. Значение не обрезается программно до maxlength: как upstream,
ограничение применяется браузером при пользовательском вводе, но управляемое
значение может превышать его. DefaultValue фиксируется при создании, value имеет
приоритет; после редактирования value=undefined очищает поле, как у местного Input.

OnValueChange получает строку на каждом input, затем вызывается native oninput.
Onchange остаётся native change (при завершении редактирования), onselect,
onbeforeinput, composition и keyboard events передаются textarea. OnPressEnter
вызывается перед onkeydown, кроме Enter с isComposing=true; стандартная вставка
переноса строки сохраняется, если callback не вызвал preventDefault().
Bind:nativeElement даёт HTMLTextAreaElement для focus/blur/select/setSelectionRange
и чтения selectionStart/selectionEnd/selectionDirection.

Size и status=error|warning, Compact, RTL, темы, Form/FormItem disabled, name/id,
required, aria-invalid и описания ошибок наследуются из существующих контекстов.
Явные props имеют приоритет. Form.resetFields восстанавливает привязанное поле
через модель формы. Без allowClear/showCount/count.show поле остаётся одним native
textarea; autoSize сам по себе wrapper не добавляет. Счётчик и clear используют
исходные ant-input-affix-wrapper/ant-input-textarea-affix-wrapper.

```svelte
<script lang="ts">
  import { TextArea } from 'antd-svelte';
  let description = $state('');
</script>
<label for="description">Описание</label>
<TextArea id="description" name="description" rows={4} maxlength={2000} required bind:value={description} />
```

Расширенный объём следует Ant Design 6.6.8 / @rc-component/input 1.3.1 (~1.3.1):
изучены TextArea/BaseInput/ResizableTextArea, calculateNodeHeight, useCount,
useCountDisplay/useCountExceed, resolveOnChange, Ant wrapper/style/tests и
@rc-component/resize-observer 1.1.2. Используются существующие CSS Input/TextArea
из [vendor/antd.css](./src/lib/vendor/antd.css) и [лицензия rc-input](./src/lib/vendor/LICENSE.rc-input).
Новые npm dependencies не добавляются.

AutoSize=true измеряет значение либо placeholder; {minRows,maxRows} ограничивает
высоту. Измерение учитывает box-sizing, padding/border, шрифты, ширину и wrap.
При maxRows появляется vertical scroll; без превышения maxRows overflowY=hidden.
AutoSize устанавливает resize:none; при отключении возвращаются authored styles.
Один скрытый textarea на document повторяет исходное измерение; в Svelte он имеет
native tabIndex=-1 и удаляется после последнего потребителя. ResizeObserver
дедуплицирует floor/offset размеры, вызывает onResize({width,height}) и переносит
измерение в RAF. Frames/observer/mouseup listener и ref bindings очищаются.
Ручной resize:both при mousedown отмечает dirty wrapper; onResize также сохраняет
исходное правило height:auto для непустого wrapper после задания textarea.height.

ShowCount=true выводит UTF-16 length, включая две units на surrogate pair.
Native maxLength (либо прежний maxlength) остаётся ограничением браузера. Count.max
переопределяет отображаемый максимум, но сам по себе не обрезает value;
превышение добавляет ant-input-out-of-range без подмены Form validation.
Count.max=0 отключает soft range/clip. Count.strategy меняет подсчёт. Обрезание
включается только через count.exceedFormatter(value,{max}) и только при заданном
count.max, после завершения composition. Внешние значения не обрезаются;
selection сохраняется с native clamping. Count.show перекрывает showCount,
включая явно переданный show:undefined. ShowCount.formatter и count.show formatter
получают {value,count,maxLength}, возвращают string/number либо Snippet<[info]>;
для rich content используйте formatter:()=>snippet. Счётчик не добавляет live region.

AllowClear принимает boolean или {disabled,clearIcon}; icon — scalar/Snippet.
Непереданные icon/disabled наследуют ConfigProvider.textArea.allowClear. Явный
false отключает clear, а объект disabled=false перекрывает context disabled.
Как source, кнопка остаётся смонтированной с hidden class для пустого/disabled/
readonly значения. Pointerdown сохраняет focus. Очистка фокусирует textarea,
вызывает onValueChange(''), onChange с type=click, затем onClear; native oninput
искусственно не отправляется. Falsy explicit clearIcon использует исходный '✖';
для текстового icon задайте его размеры/line-height, поскольку Source button
использует line-height:0, рассчитанный на SVG.

Новый onChange получает объект с клонированным textarea target/currentTarget и
стабильным value, как resolveOnChange. При input его type=change, nativeEvent
содержит исходный DOM event; compositionend и clear сохраняют соответствующие
типы событий. Target.setSelectionRange делегирует настоящему textarea. Это native
Event proxy с делегированными DOM methods, а не React SyntheticEvent runtime.
Прежний порядок onValueChange → native oninput сохранён; onChange находится между
ними. Compositionend вызывает onChange, не дублируя legacy input callback, кроме
изменённого exceedFormatter значения. Camel callbacks onFocus/onBlur/onKeyDown/
onMouseDown/onCompositionStart/End дополняют прежние native handlers.

Variant поддерживает outlined/filled/borderless/underlined. Explicit variant имеет
приоритет над Form.variant, component config и общим variant; fallback — outlined.
ClassNames/styles принимают root/textarea/clear/
count либо callback({props}); props отражает текущий Svelte value. Context и local
semantic styles объединяются, root style идёт после соответствующих semantic root
styles. Root resize переносится в textarea; styles.textarea имеет приоритет над
этим resize. Без wrapper root styles, как source, идут после textarea styles.
ConfigProvider.textArea поддерживает allowClear/autoComplete/variant/class/style/
classNames/styles; явно заданный nested config заменяет родительский.

Bind:nativeElement по прежнему возвращает HTMLTextAreaElement. Новый rootElement
даёт textarea либо span-wrapper; bind:this предоставляет focus({cursor:'start'|
'end'|'all',preventScroll})/blur(). Native autocomplete/readonly и aliases
maxLength/readOnly/autoComplete/autoFocus сохранены на реальном control. SSR не
создаёт ResizeObserver/shadow и не вызывает resize/change callbacks.

Галерея `/ant-design#textarea` сохраняет старый пример и добавляет расширенный.
Fixture `?fixture=textarea-features` дополняет `?fixture=textarea`. Unit/SSR и browser
проверяют count/clear/IME, размер и cleanup, native refs/events/Form, темы и RTL.

Сохраняется согласованный строковый bind:value: он не заменяется React controlled
rejection. React broad value types, исходный ref shape resizableTextArea, prefixCls,
полный theme/token engine этим этапом
не добавлены; refs представлены именованными Svelte bindings. Полный аудит всего
семейства Input, включая прочие subcomponents, остаётся незавершённым.

## FloatButton, FloatButtonGroup и FloatButtonBackTop

FloatButton сохраняет native Button/href, type=default|primary, shape=circle|square,
icon и content. Текст, число,
boolean и Snippet заменяют ReactNode; число 0 не включает default icon. Без
renderable content/icon используется FileTextOutlined из закреплённого icons-svg.
Кнопка имеет размер 40px и fixed-положение: inline-end 24px, bottom 48px.
Размер стандартной иконки — fontSizeIcon × 1.5 = 18px. Shape группы имеет
приоритет над shape детей. Native htmlType/disabled/события сохраняют Button API.

Tooltip принимает scalar/Snippet либо props существующего Tooltip; 0 показывает
подсказку. Badge принимает props существующего Badge без status/text/title/children;
этот набор исключается и в runtime. Semantic classNames/styles root/icon/content
принимают объект или callback { props }, включая undefined result. Group context
сливается перед локальными slots, style кнопки имеет последний приоритет.

FloatButtonGroup принимает children Snippet либо items=[{ key, children: Snippet }].
Items создают отдельные Compact slots и имеют приоритет над children. Для opaque
Snippet геометрия квадратных краёв определяется CSS siblings, без точного
воспроизведения Compact edge classes. Circle использует Flex, square — Compact.
Trigger click/hover включает меню; без trigger показывается список без trigger.
Placement top/bottom/left/right остаётся физическим и при RTL. Open + onOpenChange
дают controlled mode: владелец может отклонить запрос; без open состояние внутреннее.
Disabled блокирует переключение меню, но сам по себе не отключает детей.
Клик вне группы закрывает меню, клик элемента сохраняет его открытым.
CloseIcon и semantic slots root/list/item/itemIcon/itemContent/trigger/triggerIcon/
triggerContent доступны локально и через ConfigProvider.floatButtonGroup.

FloatButtonBackTop принимает target={() => window|document|element|null},
visibilityHeight (400), duration (450ms), showProgress. На SSR виден только при
visibilityHeight=0, target не вызывается. После mount scroll обновляет видимость
и progress; resize обновляет только progress. Click запускает cubic scroll к 0
перед пользовательским callback. При reduced motion прокрутка мгновенная;
собственные RAF/listeners отменяются при unmount. NativeElement с bind доступен
у кнопки/FloatButtonBackTop, у Group указывает на div группы.

ConfigProvider.floatButton.backTopIcon задаёт иконку FloatButtonBackTop. Как в исходной 6.6.8,
FloatButton не потребляет объявленные в глобальном floatButton config class/style/
semantic slots; локальные props работают. Config вложенного provider наследуется
при undefined и заменяется целиком при заданном объекте.

`theme.components.FloatButton` применяет alias overrides и algorithms к кнопкам,
Group и FloatButtonBackTop. Собственных component tokens у закреплённого FloatButton нет:
размер задаёт controlHeightLG, иконку — fontSizeIcon, отступы — paddingXXS,
marginXXL/marginLG и padding группы. Button сохраняет свои component tokens;
его config style, semantic styles и локальный style имеют приоритет над темой.
Вложенные и соседние providers изолированы, поддержаны custom cssVar prefix,
реактивные изменения и возврат к legacy defaults.

Сохраняются прежние ограничения Button/Badge/Tooltip; произвольный prefixCls и
общий React z-index context ещё не перенесены. CSS-рецепт воспроизводит 42 правила;
глобальный fade адаптирован через WAAPI с исходными длительностями и reduced motion.
У FloatButtonBackTop fade меняет только opacity по linear-кривой; локальный
transform сохраняется во время появления и исчезновения. Промежуточные кадры
официального UMD сверяются в [browser](tests/browser/float-button-motion.spec.ts).
Wave наследуется через общий Button, включая FloatButtonBackTop и trigger группы.

```svelte
<FloatButton tooltip="Помощь" aria-label="Помощь" onclick={showHelp} />
<FloatButtonGroup shape="square" trigger="click" aria-label="Действия">
  <FloatButton content="?" aria-label="Поддержка" />
  <FloatButtonBackTop visibilityHeight={0} aria-label="К началу" />
</FloatButtonGroup>
```

## Timeline

Timeline использует общий renderer Steps с type=dot, как Ant Design 6.6.8.
По умолчанию orientation=vertical, variant=outlined, mode=start. Корень —
пассивный ol/li без кнопок выбора, current-step ARIA и локализованных статусов
Steps. Class/rootClassName, нативные атрибуты и bind:nativeElement относятся к ol.
Title и content допускают блоковые Snippet; input/links внутри content сохраняют
нативную клавиатуру. При keyed reverse сохраняются тот же DOM, value и фокус;
при unmount активный control освобождает фокус к соседнему доступному элементу.

```svelte
<Timeline titleSpan="80px" items={[
  { key: 'created', title: '09:00', content: 'Создано', color: 'green' },
  { key: 'processing', title: '09:30', content: 'Обработка' },
  { key: 'waiting', content: 'Ожидается подтверждение', loading: true }
]} />
```

Items поддерживают key/title/content/icon/loading/color/placement, class/style и
локальные semantic classNames/styles. Title/content/icon принимают текст, число,
boolean или Snippet. Ноль отображается; boolean создаёт присутствующий пустой
контент. React Timeline.Item был только JSX sugar без
собственного runtime; в Svelte данные задаются items, отдельный пустой компонент
не экспортируется. Для контроля сохранения state используйте стабильные key.

Mode=start/end/alternate; item.placement имеет приоритет над mode.
Alternate назначает сторону до reverse. Даже при mode=start/end
vertical использует двухколоночный layout, если есть хотя бы один truthy title;
число 0 само по себе этот layout не включает. TitleSpan — число долей из 24 либо
строка CSS (100px/25%); в mode=alternate игнорируется. Его вычисленная переменная
имеет приоритет над тем же ключом в styles.root/style, как в upstream.

Loading задаёт process и добавляет spinner только при falsy icon;
остальные элементы имеют finish. Ожидание показывается отдельным loading-элементом
в items. Reverse разворачивает весь массив событий.
В reverse линия наследует статус предыдущего события, иначе — следующего.
SVG LoadingOutlined перенесён точно из @ant-design/icons-svg 4.6.0 под уже
включённой MIT-лицензией; React-зависимости не добавлены.

Preset colors — blue/red/green/gray; произвольный CSS color задаёт переменную
item icon, item.style перекрывает её. ClassNames/styles имеют root/item/itemWrapper/
itemIcon/itemSection/itemHeader/itemTitle/itemContent/itemRail; принимают объект
или функцию от {props} с преобразованными items. Локальные item.classNames/styles
используют имена root/wrapper/icon/section/header/title/content/rail. Общие стили
перекрываются локальными, item.style — последний; корневой style перекрывает
styles.root до применения titleSpan. Tail/dot/spacing связаны с токенами темы,
включая dark/compact и RTL.

ConfigProvider.timeline задаёт общие class/style/classNames/styles. Классы config
и local накапливаются; root styles идут в порядке config.styles.root → config.style
→ local styles.root → local style, затем применяется titleSpan. Item-specific
styles сохраняют приоритет. Callbacks используют те же native props с разрешёнными
mode/orientation/variant, преобразованными items и прежним reverse=false.
Undefined наследует timeline-record, любой собственный объект, включая {}, заменяет его.
Обновление config/props сохраняет ol; соседний provider остаётся изолированным.
Сверка: [24 исходных случая и 4 обновления](./tests/browser/fixtures/ant-design-timeline-config-reference.json),
[браузер](./tests/browser/timeline-config.spec.ts),
[публичные типы и SSR](./tests/package/timeline-config.ssr.test.ts), `?fixture=timeline-config`.

Horizontal сохраняет поведение исходных Steps: ниже xs=576 он получает класс
ant-steps-vertical, но явный ant-timeline-horizontal остаётся. Это отличается от
согласованного v1-порога самостоятельного Steps (532px); базовые Steps не меняются.
SSR не измеряет DOM/viewport и оставляет объявленную ориентацию. Произвольный
глобальный ConfigProvider.prefixCls пока не перенесён.

Локальный prefixCls меняет root и Timeline item/state/color classes; пустая строка
восстанавливает ant-timeline. Steps остаётся в своём namespace, а CSS variables
Timeline/Steps и marker сохраняют прежние имена. Соседние показатели изолированы,
включая совпадение prefix с ant-timeline-item/ant-timeline-css-var. Обновление
prefix сохраняет ol, theme/semantics, titleSpan и назначение placement до reverse.
Рецепт timeline-prefix воспроизводит 43 исходных правила CSS data module;
fallback variables не перекрывают прежние adaptive theme defaults.
Сверка: [28 исходных случаев и 4 обновления](./tests/browser/fixtures/ant-design-timeline-prefix-reference.json),
[CSS и item classes](./src/lib/timeline-prefix.test.ts),
[браузер](./tests/browser/timeline-prefix.spec.ts),
[публичный пакет и SSR](./tests/package/timeline-prefix.ssr.test.ts), `?fixture=timeline-prefix`.

Source `theme.components.Timeline` подготавливает шесть defaults для tail/dot/spacing
и поддерживает aliases, отдельные algorithms, CSS prefix/hash и нули/undefined.
На общем корне aliases Timeline применяются после Steps, как в upstream;
размеры иконок Steps и размеры точек Timeline сохраняют отдельные переменные.
Styles.root/style перекрывают tokens, а titleSpan по-прежнему применяется последним.
Эталонные метрики обеих ориентаций и обновления темы проверяются также в
`?fixture=steps-theme`.

Фикстура — ?fixture=timeline, пример — /ant-design#timeline. Engine/SSR/Chromium
проверяют aliases, порядок/статусы, геометрию titleSpan, темы/RTL, сохранение поля
и фокуса, а также production hydration. Рецепт timeline воспроизводит 43 правила
из того же закреплённого CSS-архива; общие Steps не дублируются.

## Tag, CheckableTag и CheckableTagGroup

```svelte
<script lang="ts">
  import { CheckableTag, ConfigProvider, Tag } from 'antd-svelte';
  let checked = $state(false);
</script>

<Tag color="success" variant="outlined">Готово</Tag>
<Tag closeIcon closeLabel="Удалить обязательную метку"
  onClose={event => event.preventDefault()}>Обязательная метка</Tag>
<Tag href="#tag-help" closable>Ссылка с закрытием</Tag>
<CheckableTag {checked} onChange={value => { checked = value; }}>
  Показывать готовые задачи
</CheckableTag>

<ConfigProvider tag={{ variant: 'outlined', style: 'letter-spacing:1px' }}>
  <Tag color="#2db7f5" styles={{ root: 'font-weight:600' }}>CSS color</Tag>
</ConfigProvider>
```

Tag показывает метку с обязательным children Snippet. Icon и пользовательский
closeIcon принимают Snippet; closeIcon также принимает текст и числа.
Содержимое — короткая phrasing-разметка
без вложенных controls, кроме ссылки. Иконки декоративные, aria-hidden/inert.
Без непустого href корень — span и Tag не создаёт остановок Tab или live-region.
Именование через aria-label/aria-labelledby добавляет span роль group; переданный
role имеет приоритет. Непустой href выбирает native anchor с target и естественным
Tab/Enter. Disabled оставляет anchor, убирает href и добавляет aria-disabled.
Закрытие ссылки предотвращает навигацию; отмена закрытия сохраняет её содержимое.
У ссылки в children сохраняется собственный href; disabled Tag меняет её стиль
и pointer-events, как upstream.

HTMLAttributes, data-/aria-атрибуты и нативные события относятся к корню; локальный
dir имеет приоритет над context. Bind:nativeElement даёт текущий span/anchor,
обновляется при смене типа корня и очищается при закрытии/unmount. В SSR ref пуст.
Hydration сохраняет существующий DOM и фокус. Явные a/span branches избегают
повторной вставки корня, которая сбрасывает фокус дочерней кнопки.

OnClick/onclick получают нативный click корневого span; onclick имеет приоритет.
Callback или единственная прямая ссылка включают [Wave](./docs/reference/wave.md).
Закрытие сохраняет stopPropagation и не вызывает onClick метки.

Variant: filled (по умолчанию), outlined, solid. Прежний default class сохраняется;
semantic callbacks получают исходный undefined color, кроме default для solid.
Статусы — success/processing/error/default/warning. Предустановленные цвета:
blue/purple/cyan/green/magenta/pink/red/orange/yellow/volcano/geekblue/lime/gold.
Pink и magenta используют соответствующие токены Ant Design. Статусный цвет не добавляет
role=status и не запускает анимацию/объявление. TagColor, TagPresetColor,
TagStatusColor и TagVariant экспортируются через index.ts.

Color также принимает CSS-строки. Solid задаёт background-color; filled и outlined
вычисляют светлый фон через исходный FastColor/HSL с lightness 0.95, сохраняя alpha.
Outlined добавляет border-color. CSS variables используются как исходная строка
foreground/border; FastColor не вычисляет их значение. Disabled убирает рассчитанные
цвета, но сохраняет явно переданные styles/style.

Приоритет variant: локальный prop, ConfigProvider.tag.variant, затем filled.

ConfigProvider.tag наследуется при отсутствии; явный объект, включая {}, заменяет
родительский record. Поддерживаются class, style, variant, classNames, styles,
closable и closeIcon.
TagSlots/TagSemantic задают root, icon, content и close строками CSS или classes;
callback получает props с разрешёнными color, variant и disabled. Root styles:
рассчитанный CSS-цвет, context styles.root, context style, local styles.root, local style.
RootClassName дополняет class. Изменения shorthand/longhand повторяют style diff
upstream; CSS-строки сохраняют нативный приоритет !important.

Icon styles/classes применяются к существующей декоративной wrapper-границе Snippet,
close — к нативной кнопке. Content semantic slot действует при наличии icon, как
upstream; прежняя private content-обёртка и описание кнопки закрытия сохраняются.
CheckableTag читает только context class/style и локальный style имеет приоритет;
semantic настройки и variant Tag к нему не применяются.

Без local/context close config кнопка скрыта. CloseIcon=true включает default Icon
close; текст/число и Snippet заменяют изображение внутри той же нативной кнопки.
Пустая строка и 0 сохраняют control. Отсутствие props наследует context;
closable=false скрывает кнопку независимо от icon. CloseIcon=false/null скрывает её,
если closable не включён. Явный closable=true сохраняет inherited icon или default.

Closable принимает также object config с closeIcon и ARIA-атрибутами. В этом объекте
closeIcon=null убирает control, а boolean оставляет пустое изображение. Undefined
не стирает context field. Передаются только ARIA-атрибуты, как в useClosable;
disabled/afterClose этого объекта Tag не использует. Блокировкой управляет Tag.disabled.
CloseLabel имеет приоритет над closable['aria-label'], затем используется locale.closeText.
По умолчанию описание кнопки ссылается на содержимое метки; closable['aria-describedby']
может его заменить, поэтому одинаковое «Закрыть» сохраняет контекст.
Disabled наследует ConfigProvider.componentDisabled; false явно снимает его.
Disabled запрещает закрытие и callbacks, не удаляя содержимое.

OnClose получает нативный MouseEvent; event.preventDefault() синхронно отменяет
закрытие. Возвращаемое значение и Promise не ожидаются. Повторный вход из callback
не вызывает onClose ещё раз. Прямой DOM listener останавливает всплытие клика;
Enter и Space обрабатываются при keydown через кнопку type=button; repeat и уже
отменённое событие игнорируются. Форма не отправляется. Callback может удалить
весь компонент или выбрать фокус.

После принятого закрытия содержимое удаляется из DOM. Изменение props не
открывает тот же экземпляр заново: для восстановления нужен новый экземпляр/key.
Tag не изменяет коллекцию владельца; при удалении записи или отмене onClose
владелец синхронизирует свою модель. Фокус из закрытой/удалённой кнопки переходит
на следующий доступный control текущего dialog/документа, затем предыдущий.
При скрытии closeIcon механизм также восстанавливает фокус. Явный выбор
владельца сохраняется; закрытие не создаёт дополнительных объявлений.

CheckableTag — отдельный export с обязательным children и декоративным icon.
Это нативный button type=button с aria-pressed, а не поле формы. Checked по
умолчанию false и полностью управляется владельцем. OnChange сообщает !checked;
компонент не присваивает checked и не поддерживает bind:checked/defaultChecked.
Внешнее обновление checked не вызывает callback. При disabled остаются значение
и содержимое, но кнопка исключается из Tab и не меняет состояние.

CheckableTag поддерживает Enter/Space и естественный Tab; при удалении кнопки
фокус восстанавливается рядом, сохраняя выбор владельца. OnClick вызывается
после onChange; отмена click внутри него не отменяет уже отправленное значение.
OnKeyDown вызывается первым: preventDefault отменяет переключение. Space
переключает при keydown, игнорирует repeat и не вызывает onClick; нативный Enter
создаёт click. Lowercase onclick/onkeydown имеют приоритет над соответствующими
callbacks. Уже отменённый click не вызывает переключение или onClick.

Id/class/style, title, data-/aria-атрибуты и остальные HTMLAttributes относятся
к кнопке. Dir наследуется при отсутствии локального значения. Bind:nativeElement
даёт ту же кнопку при обновлениях и очищается при unmount; SSR не создаёт ref.
Type=button и aria-pressed остаются собственными атрибутами компонента. Выбранные
фильтры, их объединение и связь с Form/Table принадлежат владельцу; скрытых
полей FormData и автоматической интеграции с FormItem нет.

CheckableTagGroup — отдельный export, соответствующий Tag.CheckableTagGroup.
Options принимает строки, числа или records с value, label, className и style;
label также принимает Snippet. Значения сохраняют тип и должны быть уникальными
стабильными ключами. Группа без options пуста; children не подменяют options.

```svelte
<script lang="ts">
  import { CheckableTagGroup } from 'antd-svelte';

  let selected = $state<string[]>(['Books']);
</script>

<CheckableTagGroup multiple options={['Movies', 'Books', 'Music']}
  value={selected} onChange={next => { selected = next; }} />
```

Без multiple повторное нажатие выбранной метки возвращает null. В multiple
callback получает массив: добавление сохраняет порядок текущих значений,
удаление сохраняет остальные, включая значения вне options. Value полностью
управляется владельцем; отказ принять callback сохраняет checked. Без value
состояние хранится внутри, defaultValue читается только при создании. Смена
value на undefined сбрасывает внутреннее значение, как useControlledState upstream;
callback при внешнем обновлении не вызывается. Bind:value не поддерживается.

ClassNames/styles задают root/item объектом или callback с raw props группы.
Приоритет root styles: context styles.root, context style, local styles.root,
local style. Item получает context style CheckableTag, context styles.item,
local styles.item и option.style. Context class относится к группе и меткам;
local class/rootClassName — к группе, option.className — к метке. Общие callbacks
ConfigProvider.tag получают props текущего компонента; тип context остаётся Tag,
как upstream. Для типизированных group callbacks используйте локальные props.

Корень — div без автоматической group/radiogroup роли. Передаются id, role,
data-/aria-атрибуты; остальные HTML props отбрасываются, как upstream. Bind:nativeElement
даёт div после mount и очищается при unmount. Disabled группы передаётся меткам;
undefined наследует componentDisabled, false явно снимает блокировку. Class disabled
группы отражает локальный prop. Flex-wrap и gap используют исходный paddingXS.
Метками остаются native toggle-кнопки CheckableTag: Enter/Space, aria-pressed,
focus recovery и отсутствие FormData сохраняются. Это осознанная граница с React span.

Tag, CheckableTag и CheckableTagGroup принимают локальный prefixCls. Отсутствие
или пустая строка используют ant-tag; root/modifier/close classes следуют префиксу.
У группы меняются group/item classes, но вложенные CheckableTag сохраняют ant-tag,
как в закреплённом upstream. PrefixCls не передаётся HTML-атрибутом и не меняет
имена CSS variables. Приватные content/icon wrappers и native dark class сохраняются.

Для нестандартного prefix используется шаблон из 90 исходных CSS rules. Он
попадает в SSR head и обновляется вместе с props; смена prefix не заменяет root,
close control или элементы группы. Удаление/закрытие экземпляра освобождает его
stylesheet, сохраняя стили соседей. Стандартный prefix использует прежний vendor CSS
без дополнительного head style. Native wrapping, hit target, focus и dark/compact
theme сохраняются; источник semantic styles и component tokens не меняется.

Компоненты наследуют тему, primary, compact и RTL. Для тёмной темы Tag связывает
обычный цвет текста с токенами и адаптирует фон/границу preset/status меток
через color-mix и локальные токены палитры. Solid сохраняет исходный цвет;
обычный solid в тёмной теме использует светлый фон и тёмный текст.
Эта прежняя адаптация действует в native theme; source token/algorithm theme
использует исходные Tag aliases, component overrides и палитры алгоритма.
Текст переносится на узком экране; close control не сжимается. Reduced motion
отключает встроенные transitions; ресурсы пользовательского Snippet принадлежат
его владельцу. Новая локаль не нужна: closeText уже входит в ruRU/enUS.

Галерея `/ant-design#tag` переключает цвета и варианты, показывает отмену
закрытия и восстановление экземпляра. Модель меток обрезает пробелы, проверяет
дубликаты без учёта регистра и защищает обязательную метку. Повторное добавление
удалённой метки получает новый key. CheckableTag фильтрует отдельную Table по
объединению выбранных статусов; пустой выбор показывает все строки. Ядро Table
не изменяется. Введённые значения выводятся обычными Svelte bindings.

Drag-and-drop и внешняя анимация остаются ответственностью владельца.

## Badge

```svelte
<script lang="ts">
  import { Badge, Button } from 'antd-svelte';

  let unread = $state(120);
</script>

<Badge count={unread}>
  {#snippet children({ descriptionId })}
    <Button aria-describedby={descriptionId}>Уведомления</Button>
  {/snippet}
</Badge>
<Badge count={0} showZero size="small" />
<Badge status="processing" text="Сервис работает" />
```

Badge принимает count и необязательный children Snippet. Count может быть числом,
строкой, boolean/null или Snippet. Без children
индикатор остаётся в потоке. По умолчанию overflowCount=99, showZero=false,
dot=false и size=medium; размер не наследуется от componentSize. Значение выше
предела отображается как `99+`. Конечные отрицательные и дробные числа сохраняются;
NaN/Infinity считаются отсутствующим count. Отрицательный или нечисловой предел
заменяется на 99; конечный неотрицательный overflowCount, включая 0, допустим.
Входные значения владельца компонент не изменяет.

Строки сохраняют исходное написание, включая ведущие нули, отрицательные числа
и пробелы. Overflow использует числовое сравнение, как upstream: `'100'` даёт
`99+`, `'001'` остаётся `001`. Только точная строка `'0'` включает правило нуля;
`'00'` и `'0.0'` видимы. Числовые строки с целым значением выводятся исходными
символьными slots ScrollNumber. Пустая строка и false не
создают счётчик без text/dot; null означает отсутствие count. Boolean true
отображается как `true`, как в исходном ScrollNumber. Полные строки сохраняются
в title и доступном описании, независимо от overflow.

Целые числа и числовые строки прокручиваются по исходному алгоритму SingleNumber.
Направление следует изменению абсолютного count; переходы 9/0 и смена длины
сохраняют разряды по позиции справа. Знаки и нечисловые символы остаются статичными.
Быстрые изменения используют сохранённые previous value/count, как upstream;
неизменная цифра сама по себе не обновляет предыдущий count.
Transitionend завершает путь; если событие не пришло, работает fallback 1000 ms.
Таймер очищается при смене числового значения разряда и при его удалении. SSR выводит
начальные settled units без таймеров; browser mount не пересоздаёт их DOM.
Reduced motion отключает переходы. Прежний numeric offset без нового API меняется мгновенно;
это сохранённая native-граница внешнего ScrollNumber, независимо от движения цифр.
18 последовательностей и 68 кадров закреплены в
[UMD-эталонах](./tests/browser/fixtures/ant-design-badge-digit-motion-reference.json),
проверки — [engine](./src/lib/badge-digit.engine.test.ts),
[browser](./tests/browser/badge-digit-motion.spec.ts) и
[SSR](./tests/package/badge-digit-motion.ssr.test.ts), фикстура — `?fixture=badge-digit-motion`.

Появление и исчезновение следуют CSSMotion: начальный видимый count не анимируется,
последующие изменения проходят start/active, а повторный показ прерывает выход.
У индикатора на время выхода сохраняются последние видимые count, dot и title; явно заданный
title продолжает обновляться. Собственный animationend/transitionend завершает
анимацию, события внутренних цифр игнорируются. Fallback срабатывает через
1000 ms после active. Ранний end сохраняет предыдущую разметку до activated,
как в исходнике. Самостоятельный status обходит этот lifecycle.
`theme.token.motion=false` и reduced motion отключают новые анимации;
включение reduced motion завершает текущую. Удаление компонента отменяет RAF,
таймеры и слушатели. Description и descriptionId скрываются сразу, независимо
от сохраняемого декоративного индикатора. 17 последовательностей/87 кадров и SSR
закреплены в [UMD-эталонах](./tests/browser/fixtures/ant-design-badge-zoom-reference.json),
проверки — [browser](./tests/browser/badge-zoom.spec.ts) и
[SSR](./tests/package/badge-zoom.ssr.test.ts), фикстура — `?fixture=badge-zoom`.

```svelte
<script lang="ts">
  import { Badge, type BadgeCountContext } from 'antd-svelte';
</script>

{#snippet clock(attributes: BadgeCountContext)}<span {...attributes} aria-label="Ожидает ответа">◷</span>{/snippet}
<Badge count={clock}><a href="/messages">Сообщения</a></Badge>
```

Count Snippet получает BadgeCountContext с class/style. Примените их к своему
корневому элементу; при собственном оформлении объедините классы массивом,
а CSS-строку контекста поставьте перед собственной. Это явная
замена React.cloneElement: Svelte не анализирует и не клонирует непрозрачный
Snippet. Дополнительной обёртки нет; если атрибуты не применены, автоматического
позиционирования не будет. Style содержит offset, ConfigProvider.badge.style и
Badge.style; собственный style корня имеет приоритет. Dot не заменяет готовый
count точкой, как upstream.
Пустой Snippet остаётся заданным count и не выбирает status вместо себя.
Доступность и интерактивность принадлежат Snippet; Badge не скрывает его controls
и не добавляет общее описание «Есть обновления». Смена offset/темы сохраняет его
DOM, состояние и фокус. При скрытии count содержимое сохраняется на время выхода.
Классы zoom передаются через контекст; как у исходного custom count без DOM-ref
CSSMotion, завершение использует deadline. Кеш сохраняет ссылку на Snippet,
а его собственные реактивные зависимости продолжают обновляться.

Нулевой count скрыт, пока не включён showZero. Как в Ant Design 6.6.8,
dot с count=0 скрыт, а с showZero отображается число 0; без count dot виден.
Самостоятельный status виден и без count, и при скрытом нуле. При наличии
children для статусной точки нужен dot или отображаемый count/text. Видимый
числовой count имеет приоритет над оформлением status. Строка text='0' и число
text=0 участвуют в общем правиле нуля, в том числе при ненулевом count.
Snippet считается содержимым независимо от его результата.

Поддерживаются success, processing, default, error, warning и 13 preset цветов:
blue, purple, cyan, green, magenta, pink, red, orange, yellow, volcano, geekblue,
lime, gold. Также поддерживаются CSS-цвета, CSS variables и background gradients.
У обычного индикатора custom color задаёт background; у самостоятельной статусной
точки — background и color. Preset color имеет приоритет над status.
Text принимает string/number/boolean/null или Snippet. Число не становится count
или BadgeContext.count. True учитывается как присутствующее значение, но подпись
не выводит; false/null считаются пустыми. Text=0 выводится только с showZero.
Размеры Badge — small и medium.

Offset — readonly-пара [x, y] из number|string: y задаёт margin-top,
положительный x сдвигает от логического конца наружу, в RTL направление зеркально.
Неконечная числовая координата заменяется на 0 независимо от второй координаты.
Строковый x использует parseFloat: '10.5px' даёт 10.5, '1e2' — 100; строковый y
сохраняет CSS units, включая em, %, calc и var. Строка '20' не превращается в 20px.
У обычного индикатора и самостоятельного статуса raw offset задаётся отдельными
DOM-свойствами: невалидное новое значение оставляет прежнюю координату, как React.
У custom count offset остаётся частью CSS-строки BadgeCountContext.
Компонент наследует тему и RTL; native compact сохраняет собственные размеры Badge.

Source `theme.components.Badge` применяет исходные размеры count/dot/status,
шрифты и padding. Defaults пересчитываются из global/компонентных aliases и
algorithm; тень использует colorBorderBg. Числовые indicatorZIndex/textFontWeight
сериализуются с px, как в Ant Design 6.6.8; безразмерные значения задаются строками.
Настройки доступны при SSR, custom cssVar.prefix и реактивных обновлениях.
Подробности — [контекст темы](./docs/reference/theme-context.md).

Обычный числовой/строковый индикатор скрыт от screen reader. Рядом расположен скрытый
текст с полным значением, в том числе при `99+` и dot. Children получает
BadgeContext с нормализованным числовым count и descriptionId, которым владелец может
описать кнопку, ссылку или другой control. Для строки/Snippet count остаётся
undefined; Snippet также не получает автоматического descriptionId.
При скрытии индикатора descriptionId
становится undefined. Children остаётся в DOM при изменении count: его фокус,
состояние и нативные события сохраняются. Сам Badge не создаёт остановок Tab,
live-region или автоматических объявлений. Aria-label/aria-labelledby именуют
необязательную группу; aria-describedby относится к корню. Подписи полного
значения/статусов переводятся через locale.badge с частичным наследованием.
Title по умолчанию содержит полный count; false/null убирают нативную подсказку,
строка заменяет её. Class/style относятся к корню, offset — к индикатору;
для самостоятельного статуса offset применяется к корню, как в исходнике.

ConfigProvider.badge задаёт class/style и semantic classNames/styles. Class и
rootClassName относятся к корню. ClassNames и styles принимают object либо
callback({props}) с разрешёнными size, overflowCount, dot и showZero; slots —
root и indicator. Контекстные и локальные классы объединяются. Для обычного
индикатора порядок стилей: offset → context indicator → context style → local
indicator → custom color. Border-color создаёт inset shadow ScrollNumber,
перекрывая заданный box-shadow. У самостоятельного статуса context style относится
к root, цвет status text берётся из semantic root/context style, а custom color
перекрывает оба цвета точки. Custom count получает только legacy context style
и offset через BadgeCountContext; semantic indicator к нему не применяется,
как в исходном ScrollNumber. Пустой ConfigProvider.badge заменяет родительский config.

```svelte
<Badge count="12" color="#2db7f5"
  styles={{ root: 'margin-inline:8px', indicator: 'border-color:#fff' }} />
```

Badge.style по-прежнему применяется к корню и не переносится
на обычный индикатор; для него используйте styles.indicator. Для custom count
Badge.style остаётся частью BadgeCountContext. Прежний числовой layout без нового
API сохраняется; ConfigProvider.badge, semantic props, rootClassName и custom
CSS color, новые scalar text и строковый offset включают исходный layout. Bind:nativeElement предоставляет корневой
HTMLSpanElement и очищается при unmount. Нативные span attrs/events передаются
корню; onclick имеет приоритет над React-compatible onClick. Изменение props/config
сохраняет DOM, состояние, selection и фокус. 49 вариантов и реактивные обновления
закреплены в [UMD-эталонах](./tests/browser/fixtures/ant-design-badge-api-reference.json),
проверки — [browser](./tests/browser/badge-api.spec.ts) и
[SSR](./tests/package/badge-api.ssr.test.ts), фикстура — `?fixture=badge-api`.

Галерея `/ant-design#badge` показывает варианты и локальный список уведомлений
в Drawer. Непрочитанное количество вычисляется из сообщений. Чтение сохраняет
записи; фокус переходит на прочитанное сообщение или список после «Прочитать все».
После закрытия Drawer фокус возвращается к прежней кнопке даже при count=0.
Сброс создаёт исходные сообщения с новыми ключами. Сеть и persistence отсутствуют.

46 вариантов count закреплены в
[официальных UMD-снимках](./tests/browser/fixtures/ant-design-badge-count-reference.json),
проверки — [browser](./tests/browser/badge-count.spec.ts) и
[SSR](./tests/package/badge-count.ssr.test.ts), фикстура — `?fixture=badge-count`.
У прежнего числового режима без нового API сохранены native normalization, BadgeContext,
root style и оформление standalone/non-status text; эти границы отличаются от React.

58 вариантов text/offset/size и обратимые обновления закреплены в
[UMD-эталонах](./tests/browser/fixtures/ant-design-badge-values-reference.json),
проверки — [browser](./tests/browser/badge-values.spec.ts),
[engine](./src/lib/badge.engine.test.ts) и
[SSR](./tests/package/badge-values.ssr.test.ts), фикстура — `?fixture=badge-values`.

PrefixCls меняет классы Badge, status/text и zoom; пустая строка использует ant-badge.
Для локального префикса Badge выводит в head stylesheet из закреплённого CSS template.
Стили обновляются вместе с префиксом и удаляются при unmount; root, digits и caller
controls сохраняются. ScrollNumberPrefixCls меняет классы sup/custom count и разрядов,
с fallback ant-scroll-number. Как в исходнике, Badge CSS использует глобальный
ant-scroll-number: произвольный scrollNumberPrefixCls сам по себе не создаёт CSS
для новых классов. Эта связь влияет на standalone positioning, overflow и стили
разрядов. ConfigProvider.prefixCls пока не поддерживается общим движком.
31 вариант классов/styles/геометрии и шесть zoom-последовательностей/30 кадров
закреплены в [UMD-эталонах](./tests/browser/fixtures/ant-design-badge-prefix-reference.json)
и [motion-эталонах](./tests/browser/fixtures/ant-design-badge-prefix-motion-reference.json).
Проверки — [browser](./tests/browser/badge-prefix.spec.ts),
[motion](./tests/browser/badge-prefix-motion.spec.ts),
[SSR](./tests/package/badge-prefix.ssr.test.ts) и
[motion SSR](./tests/package/badge-prefix-motion.ssr.test.ts).
Фикстуры — `?fixture=badge-prefix` и `?fixture=badge-prefix-motion`.

Processing использует исходную
CSS-пульсацию, которая отключается при reduced motion. Экспортируются BadgeProps,
BadgeStatus, BadgeColor, BadgeSize, BadgeText, BadgeOffset, BadgeCount, BadgeCountContext,
BadgeContext, BadgeConfig, BadgeSlots, BadgeSemantic и BadgeLocale.

## BadgeRibbon

```svelte
<script lang="ts">
  import { BadgeRibbon, Card } from 'antd-svelte';
</script>

<BadgeRibbon text="Новинка" color="green" placement="start">
  <Card title="Материал">Содержимое карточки</Card>
</BadgeRibbon>
```

BadgeRibbon — отдельный Svelte export для Badge.Ribbon 6.6.8. Обёртка содержит
children, затем абсолютную ленту с text и декоративным уголком. Placement по
умолчанию end; start/end следуют RTL. Color принимает 13 preset colors или
произвольный CSS-цвет. Для preset лента и уголок используют палитру темы;
произвольный color задаёт background ленты и color уголка независимо от style.
Поэтому изменение фона через style не перекрашивает уголок.

Text и children принимают строку, число, null/boolean или Snippet; boolean не
выводится, 0 сохраняется. Snippets передаются без дополнительной обёртки и
сохраняют свои controls и события. Изменение placement/color/темы не пересоздаёт
их DOM, состояние и фокус. Собственных остановок Tab, live-region или
автоматического фокуса Ribbon не добавляет.

Class/style относятся к индикатору ленты, rootClassName — к обёртке.
ClassNames/styles принимают slots root/content/indicator либо callback
`({ props }) => slots`; props содержит разрешённый placement. CSS styles
задаются строками. ConfigProvider.ribbon наследует class/style/classNames/styles;
локальный объект настройки во вложенном provider заменяет родительский.
При первом выводе indicator действуют: color → context styles.indicator → context style →
local styles.indicator → local style. Остальные slots объединяют context и local.
Затем, как React, Ribbon меняет только изменившиеся CSS-свойства. Например,
обновление color переписывает background, не применяя заново неизменённый
background-color из semantic styles. То же правило действует при удалении свойств.
Настройки `theme.components.Badge` применяются также к Ribbon, включая aliases,
algorithm, compact/dark и custom cssVar.prefix.

`bind:nativeElement` возвращает div обёртки вместо React RibbonRef и очищается
при unmount. Локальный prefixCls меняет DOM-классы и shared reset; геометрия,
как в исходнике, привязана к глобальному prefix. Генерация стилей для другого
ConfigProvider.prefixCls пока не поддерживается общим движком.
44 эталона — [официальный UMD](./tests/browser/fixtures/ant-design-badge-ribbon-reference.json),
проверки — [browser](./tests/browser/badge-ribbon.spec.ts) и
[SSR](./tests/package/badge-ribbon.ssr.test.ts), фикстура — `?fixture=badge-ribbon`.

## Avatar

```svelte
<script lang="ts">
  import { Avatar, Badge, Image } from 'antd-svelte';
</script>

<Avatar src="/anna.jpg" alt="Анна Новикова">АН</Avatar>
<Avatar shape="square" size={48} alt="Дмитрий Орлов">ДО</Avatar>
<Badge count={3}><Avatar alt="Вера Смирнова" size="large">ВС</Avatar></Badge>
{#snippet photo()}<Image src="/anna.jpg" alt="Фото Анны" />{/snippet}
<Avatar src={photo} size={64} alt="Анна Новикова" />
```

Avatar отображает изображение, icon или инициалы участника. Src принимает строку
или Snippet; пустая строка и отсутствующий src выбирают fallback.
Изображение имеет приоритет над icon Snippet, затем children Snippet.
При ошибке загрузки строки src onError вызывается один раз
для текущего изображения; false сохраняет его и отменяет fallback. Остальные
результаты выбирают icon или children. Смена src/srcSet разрешает новую загрузку,
в том числе возврат к ранее ошибочному адресу. Изменение только обработчика
ошибки не повторяет загрузку. SrcSet сам по себе не включает режим изображения.
Поддерживаются нативные draggable и crossOrigin.

Src Snippet отображается напрямую, даже если он пуст, и имеет приоритет над
icon/children. Его DOM, атрибуты, события и интерактивность принадлежат вызывающему
коду: Avatar не передаёт внутрь srcSet, draggable, crossOrigin и onError.
В частности, Image сохраняет собственные fallback и preview. Изменение размера,
темы и атрибутов Avatar сохраняет состояние Snippet; смена вида src удаляет
прежнее содержимое. При SSR Snippet выводится без обращения к browser API.

Ошибка привязана к версии пары src/srcSet. Позднее событие старого изображения
игнорируется; обработчик может синхронно заменить src, и новый источник
сохраняется. После гидратации также проверяется уже завершившаяся ошибочная
загрузка, чтобы fallback работал с изображениями из SSR. Listeners удаляются
при замене изображения и unmount. Компонент не загружает изображения вручную
и не вводит таймеров или повторных сетевых запросов поверх нативного img.

Shape по умолчанию circle; доступен square. Размер наследуется от
ConfigProvider.componentSize. Именованные размеры
small/medium/large равны 24/32/40 px. Явный size переопределяет контекст;
числовой size принимает положительное конечное число, включая дробное.
Неположительное/неконечное число заменяется размером из контекста. Для числового
размера шрифт текста равен 18 px, иконки — size/2, как в исходнике.
Class/rootClassName/style относятся к корню. ConfigProvider.avatar задаёт class/style
для каждого Avatar; отсутствующий record наследуется, явный объект, включая {},
заменяет родительский целиком. Context style перекрывает числовые/адаптивные размеры,
локальный style — context style. AvatarGroup не применяет этот config к своему корню,
но его видимые, счётчик и скрытые аватары читают общий config.
Темы и RTL наследуются, native compact сохраняет собственные размеры Avatar.

Size также принимает карту `{ xs, sm, md, lg, xl, xxl, xxxl }` с числовыми значениями:
например, `<Avatar size={{ xs: 24, md: 40, xxl: 100 }}>АВ</Avatar>`.
Выбирается самый крупный совпавший breakpoint с заданным значением; пропуски и
undefined позволяют использовать меньший совпавший. Размер xxl сохраняется на
xxxl, если xxxl не задан. Если совпадений нет, inline-размеры снимаются и действуют
обычные Avatar tokens; componentSize не заменяет явно заданную карту. Значение 0
останавливает поиск, но не задаёт inline-геометрию, как upstream. Шрифт адаптивных
icon/children равен size/2; без них — 18px. Локальный style сохраняет приоритет.

Пороги берутся из source screen* tokens с исходной проверкой порядка границ.
Карта media queries фиксируется при подписке: как useBreakpoint 6.6.8, изменение
порогов темы начинает действовать после выхода из responsive mode и возврата в него.
SSR не обращается к window и оставляет карту без совпадений; после mount размеры
обновляются без пересоздания Avatar, изображения и фокусируемого владельца.
Подгонка текста пересчитывается, listeners очищаются при unmount.
Эталонные 20 вариантов и 274 набора измерений закреплены в
[UMD-снимках](./tests/browser/fixtures/ant-design-avatar-responsive-reference.json),
проверки — [browser](./tests/browser/avatar-responsive.spec.ts) и
[SSR](./tests/package/avatar-responsive.ssr.test.ts), фикстура — `?fixture=avatar-responsive`.

Source `theme.components.Avatar` подготавливает container/text/icon sizes по
исходным правилам, включая отдельный algorithm и aliases. При стандартном
compactAlgorithm именованные small/medium/large имеют 21/28/35px; числовой size
сохраняет собственные размеры и font-size. Локальный style остаётся последним.
Общие токены применяются также к AvatarGroup и аватарам в overflow.

Gap задаёт свободное место по краям текста, по умолчанию 4 px. Конечное
неотрицательное значение сохраняется, иначе используется 4. Длинный текст
уменьшается через transform без изменения содержимого; короткий не увеличивается.
Если gap занимает всю ширину или элемент скрыт, scale остаётся 1 до следующего
измерения. ResizeObserver следит за корнем и текстом: изменение размера,
шрифта, children и появление скрытого элемента пересчитывают масштаб. При замене
fallback или unmount observer отключается. На SSR инициалы видимы без измерения;
подгонка выполняется после mount. Собственной анимации нет.

Для строки src, icon и children Alt, aria-label или aria-labelledby задают
полное имя корню с role=img;
оно сохраняется при смене изображения на fallback. Aria-describedby описывает
этот корень. Внутренний img строки src и icon/children скрыты от screen reader,
icon/children также inert. Без имени или
с aria-hidden=true весь Avatar декоративный. Для действия оберните Avatar
нативной кнопкой/ссылкой, задайте ей имя и при необходимости скройте повторяющий
его Avatar. Без явно переданных props компонент не добавляет остановок Tab,
live-region, автоматического фокуса и root click handler. Title задаёт нативную подсказку.

HTMLAttributes, data-/aria-атрибуты и нативные события передаются корневому span.
OnClick/onclick получают нативный MouseEvent; onclick имеет приоритет. Уже
отменённый click также передаётся владельцу. Enter/Space не синтезируют click:
keyboard behavior принадлежит владельцу. Локальные dir/role имеют приоритет над
контекстом и автоматической ролью; согласованные правила именования сохраняются.
Bind:nativeElement даёт текущий span, сохраняется при обновлениях config/props/
содержимого и очищается при unmount. SSR не создаёт ref или browser resources.

Для src Snippet именованный корень имеет role=group и сохраняет доступность
вложенных изображений и controls. Без имени содержимое использует собственные
подписи. Явный aria-hidden=true скрывает такой Avatar и делает его inert.
Не оборачивайте интерактивный Snippet ещё одной кнопкой или ссылкой.
Эталонные 14 вариантов закреплены в
[UMD-снимках](./tests/browser/fixtures/ant-design-avatar-source-reference.json),
проверки — [browser](./tests/browser/avatar-source.spec.ts) и
[SSR](./tests/package/avatar-source.ssr.test.ts), фикстура — `?fixture=avatar-source`.

Галерея `/ant-design#avatar` переключает содержимое, форму, размер, gap и отмену
fallback. Отдельный список участников сочетает Avatar с Badge и профилем в
Drawer. Выбор фото/инициалов/ошибочного источника сохраняется после закрытия
профиля; сброс восстанавливает участников и не меняет предпросмотр. Пример
использует локальные data URL без внешней сети и persistence.

AvatarProps, AvatarShape, AvatarSize и AvatarConfig экспортируются через index.ts.
Локальный prefixCls меняет root/modifier/string classes; отсутствие и пустая строка
используют ant-avatar. Имена CSS variables, Image и anticon остаются общими.
Шаблон из 24 исходных правил ограничен текущим prefix и сохраняет шрифты/aliases
соседних стандартных Avatar. Смена prefix сохраняет root, img, text fit, src Snippet,
focus и ref; stylesheet живёт вместе с экземпляром и выводится также в SSR head.
Semantic classNames/styles исходный Avatar 6.6.8 не объявляет. Config/DOM/ref проверяются по
[UMD-эталонам](./tests/browser/fixtures/ant-design-avatar-api-reference.json),
[browser](./tests/browser/avatar-api.spec.ts) и
[SSR](./tests/package/avatar-api.ssr.test.ts); фикстура — `?fixture=avatar-api`.
Префиксы закреплены в
[UMD-эталонах](./tests/browser/fixtures/ant-design-avatar-prefix-reference.json),
[browser](./tests/browser/avatar-prefix.spec.ts) и
[SSR](./tests/package/avatar-prefix.ssr.test.ts); фикстура — `?fixture=avatar-prefix`.

## AvatarGroup

```svelte
<script lang="ts">
  import { AvatarGroup, type AvatarGroupItem } from 'antd-svelte';

  const members: AvatarGroupItem[] = [
    { key: 'anna', label: 'Анна Новикова', text: 'АН', src: '/anna.jpg' },
    { key: 'dmitry', label: 'Дмитрий Орлов', text: 'ДО' },
    { key: 'vera', label: 'Вера Смирнова', text: 'ВС', size: 'small' }
  ];
</script>

<AvatarGroup items={members} size="large" max={{ count: 2 }}
  aria-label="Команда проекта" />
```

AvatarGroup — отдельный Svelte export для Avatar.Group. Items принимает readonly
массив AvatarGroupItem с обязательными key и label. Key — строка или число;
первый повтор ключа сохраняется, следующие исключаются до применения лимита.
Число 0 и строка '0' различаются. Порядок владельца сохраняется, входной массив
и элементы не изменяются. Внутри видимой части и открытого списка элементы
сохраняют DOM и состояние Avatar при перестановке по key.
Key/label/text используются группой и не передаются в DOM аватаров. Остальные
DOM props и callbacks элемента относятся к его Avatar. Bind:nativeElement
задаётся на отдельном Avatar; items не создаёт binding для ref каждого элемента.

Class/rootClassName/style относятся к div группы. Bind:nativeElement даёт этот div
после mount и очищается при unmount. ConfigProvider.avatar class/style относятся
к аватарам, включая счётчик и открытый overflow; к корню группы они не применяются.
PrefixCls группы меняет group/RTL/popover classes, но не передаётся участникам и
счётчику. PrefixCls участника задаётся отдельно, как у исходных дочерних Avatar.
Обводка группы применяется к аватарам с совпадающим prefix. Native wrap, overlap,
список с подписями, кнопка +N и focus recovery сохраняются. Смена prefix обновляет
класс уже открытого popup и сохраняет его содержимое; стили снимаются при unmount.

Item поддерживает props Avatar и необязательный text для строковых инициалов.
Children Snippet имеет приоритет над text; затем действуют правила Avatar:
изображение → icon → содержимое. Label даёт Avatar полное имя по умолчанию
через alt; явные alt/ARIA props сохраняются. Size/shape элемента переопределяют
значения группы, затем используются defaults Avatar/ConfigProvider. Строковые
и числовые размеры, breakpoint-карты, fallback и подгонка текста работают как у Avatar.

Max.count ограничивает число видимых участников, а кнопка +N добавляется
отдельно: count=2 при пяти участниках даёт два Avatar и +3. Без лимита, при 0,
отрицательном или неконечном значении видны все. Положительная дробь усекается
до целого, но не ниже 1. При лимите не меньше числа уникальных участников
кнопка отсутствует. Max.style задаёт style Avatar внутри кнопки +N.

Без собственных triggers сохраняется нативный default hover/click.
При обновлении max кнопка и открытый список сохраняются, пока остаются
скрытые участники.

В исходнике overflow Avatar — span, которому браузер не передаёт фокус.
В Svelte сохранена нативная кнопка +N: focus trigger доступен с клавиатуры.
В raw source-замерах отдельно записан результат настоящего focus;
событие focusin отправляется отдельно для проверки обработчика Popover.

Max.popover принимает настройки текущего Svelte Popover, кроме children:
содержимое, видимость, callbacks, container getters, ARIA, classes/styles,
trigger, placement, arrow, autoAdjustOverflow и задержки
mouseEnterDelay/mouseLeaveDelay. Class/style относятся к wrapper Popover;
popupClass добавляется к group-popover class. По умолчанию используются
hover/click и top: нативная кнопка открывается кликом, Enter/Space или наведением.
Для клавиатуры при собственном trigger используйте click или focus. Popover
показывает именованный список скрытых участников с полными label; аватары
в этом списке декоративные, кроме src Snippet, сохраняющих собственную
доступность и controls; явный aria-hidden=true делает их декоративными.
Title заменяет заголовок списка, content — сам список. Наличие ключа с null,
false или undefined явно отключает соответствующий default; true оставляет
пустую секцию, 0 отображается. Snippets создаются после первого открытия,
без вызовов при SSR. Если собственного заголовка нет, сохраняется имя из locale;
иначе имя берётся из title или явных aria-label/aria-labelledby. Aria-describedby
и aria-busy передаются поверхности.

Вложенный max.popover.open — controlled prop с onOpenChange, как у исходной
группы: владелец принимает или отклоняет запрос. Без open состояние внутреннее;
defaultOpen читается один раз при создании overflow. Удаление controlled open
очищает внутреннее значение и не возвращает defaultOpen. Внешнее изменение open
не вызывает callback. Отклонённое закрытие сохраняет открытый popup и фокус;
отклонённое открытие позволяет повторить запрос следующим кликом.

```svelte
<script lang="ts">
  import { AvatarGroup } from 'antd-svelte';

  let open = $state(false);
  const members = [
    { key: 'anna', label: 'Анна', text: 'АН' },
    { key: 'vera', label: 'Вера', text: 'ВС' }
  ];
</script>

{#snippet details()}<input aria-label="Комментарий команды" value="Черновик" />{/snippet}

<AvatarGroup items={members} max={{
  count: 1,
  popover: {
    title: 'Команда',
    content: details,
    open,
    onOpenChange: next => { open = next; },
    destroyOnHidden: false
  }
}} />
```

DestroyOnHidden по умолчанию true: список и пользовательские snippets удаляются
при закрытии. False сохраняет их DOM и состояние после первого открытия;
сохраняющееся содержимое остаётся реактивным по правилам Svelte Popover.
Явный ключ destroyOnHidden=undefined снимает default группы; Popover сохраняет
содержимое. GetPopupContainer имеет те же
приоритеты и lifecycle, что у Popover; getter получает нативную кнопку +N.
Переход элемента между видимой частью и Popover создаёт новый Avatar.
Image preview внутри списка сохраняет открытый Popover: первый Escape закрывает
preview и возвращает фокус изображению, следующий — Popover с возвратом к +N.

Корень — именованная группа, собственных остановок Tab и live-region у неё нет.
Кнопка +N имеет type=button, доступное имя с полным количеством и ARIA-связь с
Popover после mount. Escape возвращает фокус кнопке. Если лимит/список убирает
кнопку или группа удалена, фокус восстанавливается на доступном соседнем control
в текущем dialog или документе. Явный выбор фокуса владельцем сохраняется.
Повторное появление overflow создаёт закрытый Popover. Кнопка раскрытия
не блокируется через componentDisabled, поскольку показывает информацию.

Подписи группы, списка и кнопки берутся из locale.avatarGroup с частичным
наследованием. Aria-label/aria-labelledby переопределяют имя группы,
aria-describedby описывает корень; id/class/style также относятся к корню.
Группа наследует темы, compact и RTL и переносит аватары на узком экране.
В native-темах сохраняются логическое перекрытие 8px и обводка под фон темы.
В source-темах Avatar groupOverlapping/groupBorderColor управляют перекрытием и
обводкой; groupSpace задаёт расстояние между строками существующего overflow-списка.
Панель Popover сбрасывает чужие alias overrides на значения provider, а скрытые
аватары получают собственные Avatar tokens.
Нативный Popover требует Popover API; собственных анимаций группа не добавляет.

Галерея `/ant-design#avatar-group` показывает добавление, удаление, перестановку,
лимит, размеры и форму команды. Имена выводятся обычными bindings; пустое имя
не добавляется. Новые и сброшенные участники получают свежие ключи. Фокус
сохраняется при перестановке и переходит к соседу после удаления. Внешней сети
и persistence нет. Экспортируются AvatarGroupProps, AvatarGroupItem,
AvatarGroupKey, AvatarGroupMax и AvatarGroupLocale. Произвольные компоненты вместо
Avatar и настройки исходного Popover, ещё отсутствующие в Svelte Popover,
пока не перенесены: в том числе motion и полная React.memo-заморозка opaque Snippet.
Id/forceRender/fresh/zIndex передаются; forceRender прогревает также скрытый
Snippet после mount, сохраняя ленивый SSR и последующий destroy/retain lifecycle.
Точный текущий тип max.popover производен от
[PopoverProps](./src/lib/popover.types.ts), а не дублирует отдельный список props.
Приоритеты aliases, count/style и trigger/placement проверяются по
[20 UMD-эталонам](./tests/browser/fixtures/ant-design-avatar-group-max-reference.json),
[SSR](./tests/package/avatar-group-max.ssr.test.ts) и
[браузерным сценариям](./tests/browser/avatar-group-max.spec.ts).
Содержимое, controlled/default state, destroy/retain и container getters проверяются по
[33 UMD-последовательностям](./tests/browser/fixtures/ant-design-avatar-group-popover-reference.json),
[SSR](./tests/package/avatar-group-popover.ssr.test.ts) и
[browser lifecycle](./tests/browser/avatar-group-popover.spec.ts).

## Image

Первый этап следует Ant Design 6.6.8 / @rc-component/image 1.10.0 (~1.10.0).
[MIT-лицензия rc-image](./src/lib/vendor/LICENSE.rc-image) сохранена; React runtime не
устанавливается. Геометрия перенесена в image-preview.engine.ts, browser
listeners/probes — в соответствующие DOM-модули. ImagePreviewGroup использует тот же
ImagePreview для групповой навигации.

```svelte
<script lang="ts">
  import { Image } from 'antd-svelte';
  let open = $state(false);
</script>
<Image src="/photo.jpg" alt="Фотография" width={240}
  preview={{ open, onOpenChange: next => { open = next; } }} />
```

Src/alt/width/height и native image attrs поддержаны. Числовые размеры задаются
в px, CSS-строки сохраняются. Class/style относятся к img; rootClassName и
styles.root — к обёртке. Bind:nativeElement и bind:imageElement дают native refs.
Preview по умолчанию true; false оставляет пассивное изображение. Интерактивная
обёртка — native button вместо React div role=button, поэтому не отправляет форму.
Enter/Space открывают preview, onKeyDown доступен; pointer opening вызывается до
onClick, как upstream. Image не наследует Form/ConfigProvider control disabled.

Fallback подставляется при ошибке исходного src; root сохраняет ant-image-error,
даже если fallback загрузился. Новый src сбрасывает ошибку. Source probe повторяет
useStatus; результаты старого src и события отсоединённого img игнорируются.
OnError/onLoad передают native event. Placeholder=true включает исходный фон img,
Snippet отображается до загрузки; без src Snippet показывается отдельно без preview.
Кешированный complete img обрабатывается после mount без зависания placeholder.

Preview config содержит src, open/onOpenChange/afterOpenChange, cover, closeIcon,
mask, focusTrap, movable, wheel, scaleStep/minScale/maxScale и onTransform.
Preview.src может отличаться от thumbnail. Open без onOpenChange остаётся под
контролем владельца; без open компонент хранит состояние сам. Программная смена
open не вызывает onOpenChange. Cover — boolean/Snippet/{coverNode,placement};
placement top/bottom/center. По runtime 6.6.8 default cover=true создаёт пустую
hover-поверхность. CloseIcon — boolean/null/Snippet; false/null скрывают кнопку.

Viewer — native dialog, SSR не открывает его. После первого открытия DOM остаётся
смонтированным. FocusTrap по умолчанию true; false допускает фокус вне viewer.
Escape закрывает верхний preview, фокус возвращается opener, scroll освобождается
при закрытии/unmount и остаётся заперт при открытом host Modal. Mask принимает
boolean/{enabled,blur,closable}; closable по умолчанию true. ClassNames.popup.root
на Image/ImagePreviewGroup и preview.zIndex применяются к viewer. AfterOpenChange
выполняется после native смены видимости; rc-motion fade timing пока отсутствует.

Default transform: x=y=rotate=0, scale=1, flipX=flipY=false. По умолчанию
minScale=1, maxScale=50, scaleStep=0.5. Toolbar zoom использует множитель 1+step;
wheel учитывает deltaY и ограничивает ratio, сохраняя точку под курсором.
Double click переключает zoom/scale=1; rotate меняется по 90°, flip инвертирует
соответствующую ось. Movable=false отключает drag/touch, wheel управляется отдельно.
Touch pinch допускает временный scale ниже min и восстанавливает его на отпускании.
Mouse rebound сохраняет source проверку изменения обеих координат.

OnTransform({transform,action}) сообщает изменения через RAF queue; close сбрасывает
transform, если он отличается от начального. Actions: zoomIn/zoomOut, rotateLeft/
rotateRight, flipX/flipY, wheel, doubleClick, move, dragRebound, touchZoom, reset/close.
ActionsRender(original,info) и imageRender(original,info) — Snippet: original можно
вызвать через @render, info содержит transform/image, а toolbar info также
current/total/actions. Reset доступен через info.actions.onReset. Native Pointer
Events/capture заменяют React window mouse/touch handlers с cleanup на unmount.

Темы, RTL, RU/EN accessible labels и reduced motion поддержаны. Рецепт image
извлекает 48 правил; progress wrapper и rc-motion исключены. Иконки перенесены из
Ant Design Icons SVG 4.6.0 с существующей MIT-лицензией. Галерея `/ant-design#image`,
фикстура `?fixture=image`.

ConfigProvider.theme.components.Image задаёт zIndexPopup, previewOperationSize,
previewOperationColor, previewOperationHoverColor, previewOperationColorDisabled
и progressAnimationDuration. Общая тема применяется к миниатюре и viewer, включая
ImagePreviewGroup; aliases, algorithms, cssVar prefix/key и вложенные providers
поддержаны. Preview.zIndex имеет приоритет над токеном, styles.root — над
переменными миниатюры. Смена темы сохраняет viewer, transforms, current и фокус.
ProgressAnimationDuration пока доступен только как CSS variable: placeholder.progress
и его анимация ещё не перенесены. Native dialog stack поверх Modal сохранён;
числовой React z-index context не добавляется.

Из semantic API пока перенесены styles.root у Image и classNames.popup.root у
Image/ImagePreviewGroup. Остальные slots, placeholder progress/render,
ConfigProvider.image/prefixCls, getContainer, icons/React info.icons wrappers и
исходные fade/appear/leave/mousePosition motion пока отсутствуют. Deprecated aliases
исключены из переноса. [Замер текущих полей оформления](./tools/fixtures/ant-design-image-current-styling-observation.json)
подтверждает styles.root и classNames.popup.root в закреплённом UMD; вложенный
preview.classNames не входит в текущий тип preview и игнорируется upstream.

## ImagePreviewGroup (Image.PreviewGroup)

ImagePreviewGroup соответствует React Image.PreviewGroup, отдельный Svelte export
относится к тому же семейству Image. Он предоставляет контекст дочерним Image и
общий viewer; своей DOM-обёртки вокруг children нет.

```svelte
<script lang="ts">
  import { Image, ImagePreviewGroup } from 'antd-svelte';
</script>
<ImagePreviewGroup>
  <Image src="/first.jpg" alt="Первое изображение" width={160} />
  <Image src="/second.jpg" alt="Второе изображение" width={160} />
</ImagePreviewGroup>
```

Без items список строится из зарегистрированных дочерних Image с preview=true.
Порядок соответствует созданию/регистрации, сохраняется при keyed DOM reorder;
обновление src не переставляет элемент. Одинаковые src различаются по id.
Image.preview=false исключает thumbnail из этого списка. Preview.src дочернего
Image регистрируется вместо thumbnail src; его собственный preview config и
onOpenChange не управляют групповым viewer.

Items принимает строки URL или объекты с src/alt и shared native image attrs.
Явный массив, включая пустой, имеет приоритет над регистрациями. При открытии
thumbnail ищется первое совпадение preview src, при отсутствии совпадения индекс 0.
Изображения items не создают thumbnails автоматически. Fallback группы применяется
к viewer; индивидуальный Image.fallback в registration data не входит.

Preview config поддерживает open/onOpenChange, current/onChange, countRender и
общие настройки viewer/transforms/render Snippets. Current — zero-based; по
умолчанию 0. Prev/next и физические Left/Right меняют индекс в пределах списка;
в RTL порядок индексов клавиатуры не меняется, иконки/логическое положение
переключателей адаптируются. OnChange(next,previous) относится к навигации;
thumbnail напрямую задаёт внутренний индекс и не вызывает onChange. Controlled
current остаётся у владельца. Navigation фиксирует previous до вызова callbacks,
даже если onTransform изменил props владельца.

OnOpenChange(open,{current}) вызывается при пользовательском изменении видимости.
Сохранена особенность rc-image 1.10.0: при открытии thumbnail callback получает
snapshot прежнего current, а viewer использует индекс нажатого изображения.
Внешняя смена open сама не вызывает этот callback. После закрытия программное
открытие uncontrolled current начинает с 0; новое открытие thumbnail сохраняет
его выбранный индекс. Внешнее изменение controlled current сохраняет transform,
пользовательская навигация сбрасывает его без scale transition.

CountRender(current,total) получает one-based current. Render info для
imageRender/actionsRender содержит zero-based current, total и actions;
info.actions.onActive(offset) принимает относительное смещение, как runtime
rc-image, а не абсолютный индекс. Refs/DOM и управление фокусом относятся к общему
viewer. После закрытия фокус возвращается thumbnail, открывшему группу.

Удаление images/items обновляет список, не ограничивая owner current автоматически:
владелец отвечает за допустимый индекс. Даже при пустом списке viewer можно закрыть.
Ещё одна особенность rc-image 1.10.0 сохранена: preview=false у Group снимает
настройки, но само по себе не отключает открытие из дочернего Image; отключение
конкретного thumbnail задаётся Image.preview=false.

Fixture — `?fixture=image-preview-group`, галерея — `/ant-design#image`.
SSR рендерит children без DOM registration и открытого viewer. Ограничения semantic/
config/container/icons и исходных motion общие с Image и перечислены выше.

## QRCode

QRCode переносит canvas/SVG и статусы Ant Design 6.6.8 с encoder из
@rc-component/qrcode 2.0.0 (~2.0.0). TypeScript-алгоритм Project Nayuki сохранён
с исходными таблицами, сегментацией, выбором версии/маски и Reed–Solomon.
Runtime React dependencies не добавлены. В пакет включены лицензии
[rc-qrcode](./src/lib/vendor/LICENSE.rc-qrcode),
[Nayuki](./src/lib/vendor/LICENSE.qrcodegen) и
[qrcode.react](./src/lib/vendor/LICENSE.qrcode-react).
Точные Props, status snippet и semantic/config — в
[исходных объявлениях](./src/lib/qrcode.types.ts).

```svelte
<script lang="ts">
  import { QRCode } from 'antd-svelte';
</script>

<QRCode
  value="https://ant.design"
  type="svg"
  size={180}
  marginSize={4}
  aria-label="Ссылка на Ant Design"
/>
```

Массив value задаёт отдельные сегменты, а не склеенную строку. Numeric,
alphanumeric и UTF-8 выбираются с исходными правилами; доступны версии 1–40 и
уровни L/M/Q/H. BoostLevel по умолчанию повышает коррекцию, если размер символа
не увеличивается. Пустая строка не создаёт DOM, пустой массив создаёт символ
без payload. Слишком длинное значение сохраняет RangeError `Data too long`,
незавершённая Unicode surrogate pair — URIError, без подмены данных.

Type по умолчанию canvas. SSR создаёт canvas shell размером size; отрисовка после
mount учитывает devicePixelRatio. SVG целиком готов при SSR. MarginSize задаётся
в модулях, округляется вниз и ограничивается снизу нулём; default 0 сохраняет
поведение Ant Design. Size управляет bitmap и fallback root width/height.
Только width/height обычного style передаются также рисунку; semantic root
dimensions не передаются ему. CSS-растяжение не увеличивает разрешение bitmap.

Icon принимает URL, iconSize — квадрат либо width/height, по умолчанию 40×40.
Размер 0 сохраняет fallback rc-qrcode к 10% от size. Изображение центрируется,
загружается с crossOrigin=anonymous и растягивается в указанный прямоугольник.
Canvas вырезает перекрытые модули только после успешной загрузки; SVG делает это
сразу. При отсутствии Path2D используется исходный fallback с отдельными rect:
он сохраняет модули под иконкой, как в закреплённом rc-qrcode. При отсутствии
2D context остаётся canvas shell. При ошибке загрузки canvas сохраняет все QR-модули.
PNG можно получить через nativeElement.querySelector('canvas').toDataURL();
чужой сервер изображения должен разрешать CORS, как в эталоне.

Status active оставляет рисунок без cover; expired показывает текст и refresh,
loading использует Spin, scanned — текст подтверждения. OnRefresh не меняет
status автоматически. Кнопка использует текущие Button/config/disabled правила
и сохраняет native type=button; её click всплывает до root. StatusRender —
snippet с status/locale/onRefresh, который целиком заменяет содержимое cover,
включая пустой результат. Locale.qrcode объединяется по полям; RU/EN подписи
взяты из закреплённых словарей Ant Design.

Role=img и aria-* относятся к canvas/SVG. Native id/title/data-* и обработчики
относятся к root; title не создаёт SVG title, children не выводится. Передавайте
aria-label или aria-labelledby для имени рисунка. Bind:nativeElement заменяет
React ref и очищается при пустом value или unmount; поздний load отсоединённого
изображения не перерисовывает старый canvas.

ConfigProvider.qrcode задаёт class/style/classNames/styles для root/cover;
nested config заменяет объект целиком. Semantic callbacks получают разрешённые
type/size/status/bordered/errorLevel/bgColor. Root style идёт после semantic
styles, затем записываются size или plain width/height. Color по умолчанию берётся
из глобального colorText token theme; component QRCode.colorText и style.color
не меняют модули. Явный color приоритетнее; при undefined global colorText действует
исходный fallback #000000. Native light/dark defaults сохранены. Bordered=false
оставляет прозрачную границу, убирает padding и radius. RTL наследуется.

В upstream QRCode не объявляет публичных собственных component tokens.
ConfigProvider.theme.components.QRCode поддерживает alias tokens и algorithms:
padding, border, radius, текст cover и прочие глобальные значения. Внутренний
background cover готовится из colorBgContainer с абсолютной alpha 0.96, включая
полупрозрачный исходный цвет. Theme variables идут перед semantic/user styles.
Global/component algorithms, cssVar.prefix и nested/reset/sibling scopes
сверяются с [UMD](./tests/browser/fixtures/ant-design-qrcode-theme-reference.json),
[SSR](./tests/package/qrcode-theme.ssr.test.ts) и
[browser](./tests/browser/qrcode-theme.spec.ts), `?fixture=qrcode-theme`.
Реактивная смена global colorText перерисовывает прежний canvas и обновляет
прежний SVG; cover/padding не сбрасывают фокус status snippet или refs.

CSS-рецепт qrcode воспроизводит все 11 правил с проверкой SHA-256. Fixture —
`?fixture=qrcode`; unit/SSR/package/browser проверяют матрицы, pixel centers,
quiet zone, иконку/CORS, statuses, refs, темы, стили и fallback. Матрицы сверяются
с [фиксированными результатами npm-пакета](./tests/package/qrcode-vectors.json),
включая все 40 версий, четыре уровня коррекции и восемь масок.

Локальный prefixCls меняет root/cover/expired/scanned/borderless classes; пустая
строка использует ant-qrcode. CSS module ограничен marker своего корня, namespace
токенов и классы Button/Spin сохраняются. Соседние QRCode не меняются, включая
совпадения prefix с cover/css-var/borderless. При смене prefix сохраняются root,
canvas/SVG, encoding, status, refs и доступная с клавиатуры кнопка refresh.
Fallback-переменная module не перекрывает адаптивный cover прежней light/dark темы.
Native RTL наследуется, исходное LTR-направление корня хранится в raw reference.
Сверка: [44 исходных случая и 4 обновления](./tests/browser/fixtures/ant-design-qrcode-prefix-reference.json),
[CSS boundary](./src/lib/qrcode-prefix.test.ts),
[браузер](./tests/browser/qrcode-prefix.spec.ts),
[публичный пакет и SSR](./tests/package/qrcode-prefix.ssr.test.ts), `?fixture=qrcode-prefix`.
Рецепт qrcode-prefix воспроизводит те же 11 правил CSS data module с проверкой SHA-256.
Глобальный ConfigProvider.prefixCls пока не перенесён.
React development warnings для пустого value и icon с уровнем L
пока не воспроизводятся; production-поведение этих случаев сохранено.

## BorderBeam

BorderBeam переносит декоративные слои Ant Design 6.6.8: BorderBeam/BorderBeamEffect,
useBorderSize, util и style. Изучены @ant-design/cssinjs 2.1.2 (^2.1.2) и
@rc-component/util 1.14.0 (^1.14.0). Компонент не создаёт обёртку: слои добавляются
непосредственно в контейнер и скрыты от accessibility tree.
Точные Props и defaults — в [исходных типах](./src/lib/border-beam.types.ts).

В Svelte target явно связывает контейнер с эффектом. Это заменяет клонирование
React child с составным ref; существующий ref вызывающего кода сохраняется.

```svelte
<script lang="ts">
  import { BorderBeam, Card } from 'antd-svelte';

  let container = $state<HTMLDivElement>();
</script>

<BorderBeam target={container} count={3} duration={12} color="#36cfc9">
  <Card bind:nativeElement={container} title="Workspace overview">
    Состояние задач и последних запусков
  </Card>
</BorderBeam>
```

Для нативного элемента используйте bind:this. Контейнер должен задавать
position:relative либо другой positioning context; BorderBeam не исправляет его
style. Отсутствующий target, SVG и обычный текст не получают декорацию. Содержимое
при этом отображается; собственных DOM nodes на SSR нет. Смена target и unmount
удаляют принадлежащие эффекту слои, не меняя controls и содержимое контейнера.

Count округляется вниз; неконечное число или число меньше 1 дают один луч.
Несколько лучей распределяются по циклу отрицательным animation-delay. Первый
луч сохраняет delay из style; остальные используют duration prop либо исходные
6 секунд, даже когда duration переопределена через CSS variable в style.

Градиент сохраняет порядок stops и масштабирует входные проценты 0–100 в видимые
0–70%, оставляя хвост прозрачным. Если последний stop не равен 100%, его цвет
добавляется в конец видимого участка. Пустой массив возвращает градиент темы.
Числовые size/lineWidth используют px; строки остаются CSS lengths.

Без outset четыре отступа измеряются по border-width один раз для каждого
target. Последующие изменения рамки того же узла не вызывают новый замер.
Radius наследуется через CSS и обновляется сразу, включая разные углы. Явный
outset задаётся числом в px либо строкой через calc(-1 * outset); числовое
отрицательное значение сохраняет исходное выражение `--2px` и не нормализуется.

ConfigProvider.borderBeam задаёт class/style слоёв. Вложенный config заменяется
целиком; локальный style идёт после контекстного, а переменные параметров —
после style. Theme light/dark и primary работают через CSS variables; disabled,
locale и направление не меняют декоративное поведение.

BorderBeam принимает alias overrides и algorithms из theme.components.BorderBeam;
собственных component tokens у него нет. Line width, primary gradient и typography
обновляются без пересоздания слоёв. Внешний target получает тему владельца эффекта,
включая CSS overrides его ConfigProvider, независимо от темы физического контейнера.
Context/local style и явные параметры сохраняют приоритет над вычисленной темой.
При удалении source theme возвращается прежнее наследование CSS от target.

CSS-рецепт border-beam сохраняет 10 правил и antBorderBeamMove с проверкой
SHA-256 архива. Слои видимы при поддержке mask-composite и offset-path:rect;
иначе применяется исходный CSS fallback display:none. Reduced motion скрывает
псевдоэлемент и отключает анимацию. Hover/pause настраиваются обычными CSS rules.
Эффект не заменяет focus ring или validation border.

Локальный prefixCls меняет классы слоёв и selectors, включая supports/media rules.
Пустое значение возвращает ant-border-beam; CSS variables --ant-border-beam-*
и keyframe сохраняют имена независимо от theme.cssVar.prefix. Смена префикса
сохраняет слои, контейнер, draft и фокус. Scoped stylesheet удаляется вместе
с эффектом либо при возврате к default prefix; глобальный ConfigProvider.prefixCls
пока не перенесён. Проверки — `?fixture=border-beam-prefix`.
Автоматический поиск host через React child/ref заменён описанным target API;
прикладные обёртки и runtime React dependencies не добавляются. Fixture
`?fixture=border-beam`, engine/SSR, package SSR и браузерные проверки принадлежат
библиотеке. Source aliases, scopes и reactive cleanup дополнительно проверяются
через `?fixture=border-beam-theme`; пример выше не требует изменения сайта-потребителя.

## Watermark

Watermark переносит Ant Design 6.6.8: index/useClips/useWatermark/context/utils,
useSingletonCache и leading RAF debounce. Изучен также
@rc-component/mutate-observer 2.0.1 (^2.0.1) и @rc-component/util 1.14.0
(^1.14.0); [лицензия observer](./src/lib/vendor/LICENSE.rc-mutate-observer) сохранена.
Используются native Canvas/MutationObserver/Image без React dependencies.

```svelte
<script lang="ts">
  import { Watermark } from 'antd-svelte';
</script>
<Watermark content={['Ant Design', { text: 'Svelte 5', font: { fontSize: 12 } }]}>
  <p>Содержимое страницы</p>
</Watermark>
```

Content принимает строку, WatermarkText {text,font} либо смешанный readonly массив.
Отсутствующий content даёт ноль строк; пустая строка остаётся отдельной строкой.
Font задаёт color (включая CanvasGradient/CanvasPattern), fontSize, fontWeight,
fontStyle, fontFamily и textAlign; построчный font накладывает только определённые
значения. FontSize конвертируется через Number, как source: числовые строки
поддержаны, единицы вроде '18px' не разбираются. Между строками FontGap=3.

Три Canvas повторяют исходные text/image, поворот и alternating clips. Размер
текста определяется measureText/fontBoundingBoxAscent/Descent; width/height
переопределяют измерение. Image имеет приоритет, использует crossOrigin=anonymous
и referrerPolicy=no-referrer. При ошибке рисуется content; image defaults 120x64
сохраняются и для fallback. DPR читается при отрисовке; отдельной подписки на его
изменение нет. Пустой рисунок не копирует нулевые Canvas. В DOM Canvas не остаются:
слой использует PNG data URL, background-repeat=repeat и floor(logical width).

Rotate=-22, gap=[100,100], offset=gap/2. Положительное смещение относительно
центра gap сдвигает и сужает слой; отрицательное меняет background-position.
Координаты физические и не переворачиваются в RTL. ZIndex по умолчанию равен
zIndexPopupBase-1, то есть 999 в стандартной теме. Слой absolute, занимает 100%,
не перехватывает pointer events и имеет visibility:visible!important.
Декоративный слой скрыт от accessibility tree, children/focus не подменяются.

Обёртка имеет position:relative/overflow:hidden. ConfigProvider.watermark
принимает class/style; class и rootClassName добавляются, style владельца идёт
после default/context. Вложенный явно заданный watermark config заменяет
родительский. Bind:nativeElement возвращает div. Как исходный WatermarkProps,
компонент не принимает произвольные HTML attrs/events; они остаются у children.
В source theme font defaults читают глобальные colorFill/fontSizeLG, а zIndex —
zIndexPopupBase - 1. Изменения aliases/seed/algorithm перерисовывают PNG без замены
слоя, контейнера, ref или содержимого. Явный font/zIndex и построчные overrides
имеют приоритет; CSS variables и components.Watermark на Canvas не влияют,
как в исходнике. Без source theme сохранены прежние CSS defaults и реактивные
light/dark/compact. Общий disabled не отключает рисунок.

MutationObserver следует исходному набору subtree/childList/style/class.
Изменение style/class слоя восстанавливает стили, снимает class/hidden;
самостоятельное изменение hidden не наблюдается до следующей наблюдаемой мутации.
Удалённый/перемещённый слой возвращается тем же DOM node с кэшированным PNG,
вызывая onRemove. Изменение только стилей не вызывает onRemove. На root
восстанавливаются лишь ожидаемые position/overflow, включая явные overrides;
прочие утраченные inline styles не восстанавливаются. При штатном unmount и
удалении панели onRemove не вызывается.

Сохранены особенности алгоритма кэша и scheduling Ant Design 6.6.8. Кэш хранит
последний набор параметров, исключая HTMLElement и top-level NaN из ключей.
Поэтому смена только image URL при неизменных геометрии/параметрах использует
прежний PNG; смена rotate/size/gap обновляет изображение. Незавершённые image
requests сохраняют исходный completion order: старый ответ с отличающейся
геометрией может временно заменить уже показанный новый рисунок; наблюдатель
может затем запустить актуальную отрисовку. Нативные paint-объекты без enumerable
полей также следуют исходному глубокому сравнению ключей кэша. Leading RAF throttle
выполняет первый вызов сразу и подавляет остальные до кадра без trailing-вызова;
внутрикадровые изменения могут ждать следующего независимого обновления.
Эти особенности не исправлены скрыто при переносе.

Inherit=true предоставляет контекст дочерним Modal/Drawer. Они регистрируют
соответственно .ant-modal-container и .ant-drawer-section; каждый получает
такой же рисунок, включая native dialog top layer. Регистрация следует
сохранённому lifecycle местных Modal/Drawer. Inherit=false не предоставляет
свой контекст; в nested Watermark остаётся доступен контекст внешнего Watermark.
Смена inherit пересоздаёт children branch, как условный Provider исходника.
Attachment панели снимает регистрацию при уничтожении без её восстановления.

SSR выводит только обёртку/children, без Canvas/Image/observer/callbacks.
После unmount отключаются observer, RAF и callbacks ожидающих изображений,
удаляются принадлежащие компоненту слои. Без 2D context остаются children; без
MutationObserver рисунок создаётся, но не восстанавливается после DOM mutation.
Watermark не имеет собственного CSS/component token/prefixCls API в upstream;
нового CSS-рецепта не требуется. Source global tokens, algorithms, zero/undefined,
cssVar prefix/key, priority и scopes проверяются через `?fixture=watermark-theme`
по замерам официального UMD, включая Canvas calls и повторяемый PNG.
Изменение темы обновляет унаследованные слои Modal/Drawer без потери фокуса.
Источник алгоритмов покрыт существующей
[MIT-лицензией Ant Design](./src/lib/vendor/LICENSE.ant-design).

Галерея — `/ant-design#watermark`, fixture — `?fixture=watermark`.
Unit/SSR проверяют geometry/fonts/draw calls и серверную границу; browser
проверяет реальные PNG pixels, восстановление DOM, image/cache, DPI и панели.


## Rate

Rate следует Ant Design 6.6.8 и @rc-component/rate 1.0.1 (~1.0.1).
Изучены wrapper, style, demo, tests и делегированные Rate/Star/util.
[MIT-лицензия rc-rate](./src/lib/vendor/LICENSE.rc-rate) включена в пакет;
React runtime и новые npm dependencies не добавляются.

```svelte
<script lang="ts">
  import { Rate } from 'antd-svelte';
  let value = $state(2.5);
</script>
<Rate aria-label="Оценка" {value} allowHalf
  tooltips={['Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']}
  onChange={next => { value = next; }} />
```

Value управляется владельцем через onChange; без value используется внутреннее
значение с defaultValue=0. Count=5 принимает целое неотрицательное число, как
new Array(count) в upstream. Значения и fractions владельца не округляются и
не ограничиваются count. Уменьшение count не меняет value. Native form reset
не сбрасывает внутренний выбор; собственное поле FormData не создаётся.

AllowHalf=false по умолчанию. При allowHalf половина определяется координатой
относительно исходного li, с обратной стороной в RTL; точный midpoint даёт полную
оценку. Hover показывает временный выбор без onChange. OnHoverChange получает
также undefined при выходе и перед публикацией клика. AllowClear=true очищает
повторный выбор до 0; этот же hover подавляется до другой позиции/выхода.
AllowClear=false повторно публикует то же value. Внешняя смена props не вызывает
callbacks. Смена controlled value на undefined очищает внутренний fallback,
как useControlledState зависимости; новое нажатие снова задаёт значение.

ArrowLeft/Right изменяют значение на 1 либо 0.5, направление обратное в RTL.
Фокус при этом не перемещается. Исходная арифметика сохраняется без clamp:
например, внешнее 4.8 при count=5 и allowHalf=true увеличивается до 5.3.
OnKeyDown вызывается после изменения; обработанная стрелка получает preventDefault.
Keyboard=false отключает стрелки; Enter на символе по-прежнему выбирает полное
значение и предотвращает дублирующий native click. Focus/blur callbacks следуют
всплывающему изменению фокуса.

Character — строка, число или Snippet<[RateCharacterInfo]>; snippet получает
index/count, временное отображаемое value, allowHalf/disabled/focused, prefixCls
и исходные onHover(event,index)/onClick(event,index). Он рендерится в двух слоях
звезды, как исходный character. CharacterRender —
Snippet<[Snippet,RateCharacterInfo]> с исходным star snippet; как rest override
Ant wrapper, он заменяет автоматическую Tooltip composition. Tooltips принимает
строки или поддерживаемые локальные TooltipProps без children. Tooltip использует
существующую обёртку с display:contents; отступы между stars сохранены.

Size принимает small/medium/large, наследует componentSize.
Disabled наследует общий disabled-контекст, включая Form; явный false имеет
приоритет. ConfigProvider.rate принимает class/style, локальные class/rootClassName
добавляются, style накладывается после контекстного. Вложенный явно заданный rate
config заменяет родительский. Light/dark, compact, RTL и reduced motion реактивны;
CSS variables --ant-rate-star-color/size/size-sm/size-lg/bg/hover-scale и
--ant-rate-line-width-focus допускают явный inline override.

ConfigProvider.theme.components.Rate применяет все шесть компонентных токенов
со строковым starHoverScale. LineWidthFocus подготавливается по исходному правилу
из lineWidth/lineWidthFocus. Поддержаны нули, undefined, global/component aliases
и algorithms, cssVar.prefix, вложенные/reset/sibling providers, hover/focus и
disabled. Переменные темы идут перед ConfigProvider.rate.style и локальным style;
смена темы сохраняет оценку, radio DOM, фокус, refs и callbacks.
Сверка: [UMD](./tests/browser/fixtures/ant-design-rate-theme-reference.json),
[SSR](./tests/package/rate-theme.ssr.test.ts),
[browser](./tests/browser/rate-theme.spec.ts), `?fixture=rate-theme`.

Массивы и CSSObject в starHoverScale пока не исполняются. Ant Design 6.6.8
не регистрирует для них CSS variable, поэтому его hover transform становится none.
Это наблюдение записано в реестре; native сохраняет прежний scale(1.1).
Пользовательские CSS variables/styles перекрывают этот fallback. Полный CSSObject
API, включая исходные _multi_value_/_skip_check_ markers, остаётся отдельным пробелом.

Bind:this предоставляет focus()/blur(), которые игнорируются при disabled;
bind:nativeElement возвращает ul. AutoFocus применяется только после mount,
SSR не обращается к DOM и не вызывает callbacks. Нативные button type=button
заменяют исходные div role=radio: дополнительно доступна активация Space, корневая
ul получает radiogroup и видимый focus. Исходные cumulative aria-checked,
aria-posinset/setsize и отдельные tab stops сохранены. Декоративные копии символов
скрыты от accessibility tree; имя кнопки — её one-based номер.

[vendor/rate.css](./src/lib/vendor/rate.css) содержит все 21 правило из закреплённого
npm-архива с проверкой SHA-256; рецепт rate адаптирует >div к >button, declarations
сохранены. Rate.svelte дополняет native reset styles, focus и reduced motion.
StarFilled SVG взят из Ant Design Icons SVG 4.6.0 с существующей MIT-лицензией.
Галерея — `/ant-design#rate`, fixture — `?fixture=rate`; unit/SSR и browser
сценарии проверяют значения, callbacks, геометрию, контексты и cleanup.

PrefixCls пока отсутствует; namespace ant-rate закреплён.
Полный upstream Tooltip API ограничен текущим публичным
Svelte Tooltip. Эти части не считаются покрытыми переносом Rate.


## Mentions

Первый этап следует Ant Design 6.6.8 / @rc-component/mentions 1.12.0 (~1.12.0).
Правила поиска/замены перенесены в mentions.engine.ts, autoSize следует
calculateNodeHeight из @rc-component/input 1.3.1. Лицензии
[rc-mentions](./src/lib/vendor/LICENSE.rc-mentions) и [rc-input](./src/lib/vendor/LICENSE.rc-input)
включены в пакет; React runtime не устанавливается.

```svelte
<script lang="ts">
  import { Mentions, getMentions } from 'antd-svelte';
  let value = $state('');
</script>
<Mentions {value} options={[{ value: 'alice', label: 'Alice' }]}
  onChange={next => { value = next; }} allowClear
  autoSize={{ minRows: 2, maxRows: 5 }} aria-label="Комментарий" />
<p>{getMentions(value).map(item => item.value).join(', ')}</p>
```

Value/defaultValue — полная строка textarea. Prefix по умолчанию '@', принимает
строку/массив; split по умолчанию один пробел. При поиске выбирается последнее
вхождение префикса перед selectionStart; при равных позициях сохраняется порядок
массива prefix. Default validateSearch проверяет только literal split, без
дополнительной обработки переносов строк. FilterOption ищет по option.value без
учёта регистра; false отключает фильтрацию, predicate получает исходный option.
Options содержит value, label string/number/Snippet, key/disabled/class/style.

Поиск запускается по keyup, как rc-mentions. Программная смена value сама его не
запускает. OnSearch(text,prefix) позволяет владельцу обновить options/loading;
сетевых запросов внутри нет. Loading показывает disabled spinner вместо выдачи
и блокирует выбор Enter. NotFoundContent заменяет локализованное пустое состояние.

Выбор вставляет prefix+value+split у каретки, добавляет split перед токеном при
необходимости, убирает совпадающий хвост без учёта регистра и сохраняет остальной
текст. OnChange(nextText) вызывается до onSelect(option,prefix), затем после DOM
update восстанавливаются focus/selection. Native selection offsets — UTF-16.
Callback получает исходный option data без React key suffix. Отдельный экспорт
getMentions(value,{prefix,split}) соответствует Mentions.getMentions: извлекает
непустые токены в начале разделённых split частей, без собственной разметки.

Up/Down обходят доступные options, Enter выбирает, Escape закрывает. IME Enter
не выбирает. OnPressEnter работает при закрытых подсказках; onKeyDown/onKeyUp и
нативные onkeydown/onkeyup доступны. OnFocus/onBlur учитывают переход в popup;
отложенный blur очищается при unmount. Readonly/disabled сохраняют native поведение.

Popup выравнивается после префикса и следует переносам/прокрутке textarea.
Placement top/bottom, RTL и viewport adjustment поддержаны; source gap=4 px.
Native popover сохраняет фокус textarea; textarea/listbox/option и
aria-activedescendant заменяют React DropdownMenu на rc-menu. Mirror скрыт от
accessibility tree. Общий popup-механизм сохраняет прежний default gap для остальных
компонентов; AutoComplete использует исходные 4 px, как SelectTrigger.

Локальный getPopupContainer выбирает HTMLElement или ShadowRoot. Как Ant Design,
Mentions не наследует ConfigProvider.getPopupContainer. Тип getter не требует
аргументов. Функция без параметров при открытии сначала получает undefined,
затем span префикса внутри ant-mentions-measure. Функция с параметром ждёт этот
DOM ref, как rc-trigger. Без getter сохраняется native размещение; на сервере
getter не вызывается. Стили ShadowRoot размещает потребитель.

PopupRender — Snippet со стандартным menu Snippet. Можно добавить обёртку или
заменить меню; клавиатура textarea продолжает выбирать из options. Пользовательское
содержимое сохраняет тему и локализацию, но не наследует status/feedback FormItem
и SpaceCompact, как исходный ContextIsolator. Фокус в стандартном меню удерживает
подсказки открытыми; переход в поле вне menu закрывает их по исходному blur.
Закрытие и смена DOM-контейнера создают popupRender заново; смена getter с тем же
контейнером сохраняет DOM/state, текст, фокус и выделение textarea.

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Mentions } from 'antd-svelte';
</script>
{#snippet popup(menu: Snippet)}
  <strong>Участники</strong>
  {@render menu()}
{/snippet}
<Mentions options={[{ value: 'alice', label: 'Alice' }]} popupRender={popup}
  getPopupContainer={() => document.body} aria-label="Комментарий" />
```

AutoSize принимает boolean/{minRows,maxRows}, измеряет содержимое с теми же
font/padding/box-sizing, что и textarea. Shadow node, ResizeObserver, frames и
listeners удаляются при unmount. OnResize получает {width,height}. Это API Mentions;
существующий TextArea этим этапом не расширяется. Rows по умолчанию 1.

AllowClear — boolean/{clearIcon,disabled}; очистка вызывает change(''), затем
onClear. Size/status/variant, native name/required/maxlength, FormItem/validation/
reset, Form/ConfigProvider disabled, locale/themes/compact density/RTL поддержаны.
Focus/blur и bind:nativeElement предоставляют текущий ref API. Текстовое поле
доступно через nativeElement.querySelector('textarea'); deprecated textarea ref удалён.
CSS-рецепт mentions извлекает 102 правила. Галерея `/ant-design#mentions`,
фикстура `?fixture=mentions`; SSR не измеряет DOM и не ставит таймеры.
24 эталона официального UMD для контейнеров и popupRender —
[mentions-popup](./tests/browser/mentions-popup.spec.ts), `?fixture=mentions-popup`.

`ConfigProvider.theme.components.Mentions` применяет shared Input tokens,
размеры списка, aliases и algorithms к textarea и popup. Подготавливаются 22
исходных CSS defaults, включая внутренние lineWidthFocus/itemPaddingVertical;
публичный список токенов остаётся в исходных типах. Темы Input/Select не подменяют
тему Mentions. Local style имеет приоритет; обновления сохраняют открытый popup,
draft, focus/caret и активный option. Native button reset не перекрывает исходные
hover/active цвета пунктов.
При нулевом inputFontSize подсказки сохраняются у префикса нулевого размера,
как в исходном компоненте.
16 тем официального UMD — [mentions-theme](./tests/browser/mentions-theme.spec.ts),
`?fixture=mentions-theme`; [SSR](./tests/package/mentions-theme.ssr.test.ts) сохраняет
native текст формы без popup, измеряющего textarea и timers.

Semantic classNames/styles, feedback suffix,
полный ConfigProvider.mentions API, prefixCls и
исходные rc-trigger motion пока отсутствуют.

## AutoComplete

Первый этап следует Ant Design 6.6.8 и @rc-component/select 1.10.1 (~1.10.1).
Combobox-логика находится в AutoComplete и его engine; существующие single/multiple
контракты Select сохранены. Как upstream, оформление переиспользует CSS Select
из vendor/antd.css; отдельного upstream style-модуля AutoComplete нет.
[MIT-лицензия rc-select](./src/lib/vendor/LICENSE.rc-select) включена в пакет.

```svelte
<script lang="ts">
  import { AutoComplete } from 'antd-svelte';
  let value = $state('');
  let search = $state('');
  let options = $derived(search ? [{ value: `${search}@example.com` }] : []);
</script>
<AutoComplete {value} {options} allowClear backfill
  onChange={next => { value = next ?? ''; }}
  showSearch={{ onSearch: next => { search = next; } }} aria-label="Email" />
```

Value/defaultValue — произвольная строка; совпадение с options не требуется.
Выбор показывает option.value, label — string/number/Snippet только в списке.
Options также принимает группы `{label, options}`; disabled пункты пропускаются.
OnChange(value,option) вызывается при изменении ввода/выборе, onSelect(value,option)
при каждом выборе, onSearch(text) при поисковом вводе, но не при выборе пункта.
Для свободного значения второй аргумент onChange — пустой объект, при очистке
списка значений — undefined; React option.props wrapper не переносится.

FilterOption по умолчанию false, как runtime combobox rc-select. True фильтрует
value без учёта регистра, без trim/Unicode folding. Совпавшая группа сохраняет
всех детей; иначе проверяются дети. Predicate получает исходный option/group.
ShowSearch object настраивает filterOption/onSearch; прежние top-level props удалены.
Класс popup задаётся через classNames.popup.root; popupClassName удалён.
Остальные semantic slots пока не перенесены.
Загрузку данных, debounce и защиту от старых ответов выполняет потребитель.

Open/defaultOpen задают controlled/uncontrolled popup. Без options и непустого
notFoundContent popup скрыт даже при open=true. SSR оставляет его закрытым до
mount, как rc-select useOpen. OnOpenChange получает запрос на смену открытого
состояния, включая отклонённый controlled open=false запрос.
PopupMatchSelectWidth — boolean/число, listHeight
по умолчанию 256; onPopupScroll передаёт native scroll event. Поверхность — native
popover с сохранением фокуса input, outside/Escape и cleanup.

GetPopupContainer получает корневой элемент Select, включая custom input/textarea.
Локальная функция перекрывает ConfigProvider.getPopupContainer; undefined наследует
provider. Getter выполняется в браузере после открытия. При переносе сохраняются
Select tokens, поиск, фокус и FormData. ShadowRoot требует собственных стилей.
Замена функции с тем же DOM-контейнером сохраняет поле и список.

Стрелки обходят доступные options, Enter/Tab выбирают активный пункт; IME Enter
не выбирает. Backfill меняет только видимый текст до подтверждения. По runtime
rc-select defaultActiveFirstOption=false, хотя таблица Ant Design указывает true;
для непустого текста отдельно активируется первое prefix match. Home/End остаются
у нативного input. AllowClear поддерживает boolean/{clearIcon}. Для непустого
текста rc-select выполняет два пути: onClear, change(undefined), change(''),
search(''); этот порядок сохранён. Обработчик controlled value обычно нормализует
undefined в пустую строку. OnInputKeyDown, onFocus/onBlur и focus/blur доступны.

Custom input задаётся `children(control)` Snippet:

```svelte
<AutoComplete options={[{ value: 'example' }]} aria-label="Подсказки">
  {#snippet children(control)}
    <textarea {...control.attributes} use:control.register rows="3"></textarea>
  {/snippet}
</AutoComplete>
```

Attributes/register связывают value, ARIA, события и native ref; собственные
class/style/rows сохраняются. InputElement и nativeElement доступны через bind.
Native name/required/disabled/readonly, FormItem/status/reset, размеры, variants,
Compact, темы и RTL поддержаны. Галерея `/ant-design#auto-complete`, фикстура
`?fixture=auto-complete`. При custom input его native constraints задаются на нём.

Source theme использует `components.Select` и общий Select token scope, как
upstream AutoComplete: размеры options/groups, отступы, цвета, clear и focus.
Custom Input сохраняет собственные `components.Input` и размеры; оболочка не
навязывает ему controlHeight Select. Токены доступны при SSR; смена темы
сохраняет native editor, option content, выделение, фокус, FormData и положение
открытого popup. Native-only темы сохраняют прежнее оформление.

Virtual/scrollTo, fieldNames, optionRender/popupRender, prefix/searchIcon,
остальной semantic/config API пока отсутствует. Deprecated dataSource/Option
и dropdown aliases исключены из переноса. Generic numeric/object values не входят в первый этап.

## Select

Без mode компонент сохраняет одиночный выбор и скалярный value. В
`mode="multiple"` value и callback используют массивы; варианты выбираются
из options, а выбранные элементы показываются с кнопками удаления.
`SelectProps<Value>` описывает прежний одиночный API,
`SelectProps<Value, 'multiple'>` — множественный. При использовании компонента
типы значений и callback выводятся из options и mode.

Variant поддерживает outlined/filled/borderless/underlined в single и multiple;
по умолчанию outlined. Явный variant имеет приоритет над настройками Form и provider. Смена оформления сохраняет DOM,
поисковый текст, выделение, фокус и выбранные значения формы. Классы и computed
styles сверены с официальным UMD 6.6.8 в
[браузерных проверках](./tests/browser/select-variants.spec.ts).
Общие [ConfigProvider.variant/Form.variant и Select config](./docs/reference/control-variants.md)
применяются после локальных props.

```svelte
<script lang="ts">
  import { Select } from 'antd-svelte';

  const options = [
    { value: 0, label: 'Разработка' },
    { value: 1, label: 'Дизайн' },
    { value: 2, label: 'Архив', disabled: true }
  ];
  let teams = $state<number[]>([0]);
</script>

<label for="teams">Команды</label>
<Select id="teams" mode="multiple" {options} bind:value={teams} name="teams" allowClear />
```

При source-настройках ConfigProvider Select применяет собственные tokens и aliases
к selector и dropdown: размеры tags/options, padding, цвета, focus border/outline,
стрелку и очистку. Поддерживаются component algorithm, custom CSS prefix, нули и
явный undefined. Смена темы сохраняет DOM поля/списка, ввод, выделение, фокус и
FormData. Native-only темы сохраняют прежнее оформление; style относится к внешней
обёртке. Подробности — в [описании темы](./docs/reference/theme-context.md#токены-select).

GetPopupContainer получает внутренний корень `.ant-select`. Локальная функция
перекрывает ConfigProvider.getPopupContainer; undefined наследует provider. Без
getter список сохраняет прежнее inline-размещение. При выбранном контейнере
используется native popover с шириной поля, обновлением положения, outside/Escape
и сохранением фокуса. Getter не вызывается при SSR и до первого открытия.
ShadowRoot требует собственных стилей; смена функции с тем же контейнером
сохраняет DOM списка, поиск и выделение. Закрытие Select удаляет его список;
AutoComplete сохраняет смонтированный popup до unmount. Проверки обоих компонентов —
[select-container](./tests/browser/select-container.spec.ts), `?fixture=select-container`;
32 сценария сверены с официальным UMD Ant Design 6.6.8.

Поиск по умолчанию выключен в одиночном режиме и включён в multiple;
`showSearch` переопределяет это. Нажатие варианта во множественном режиме
добавляет или удаляет его, очищает поисковый текст и сохраняет открытый список
и фокус в поле. Дубликаты выбранных значений убираются при отображении,
порядок первого появления и типы сохраняются: числовой `0` и строковый `"0"`
различаются. Массив владельца при этом не переписывается.

Удаление кнопкой или Backspace при пустом поиске снимает доступное выбранное
значение; Backspace выбирает последнее доступное. Disabled options нельзя
выбрать или удалить отдельно, включая уже выбранные. `allowClear` показывает
общую очистку всех значений. После пользовательского изменения callback
получает новый массив; изменение этого массива не меняет привязку. Внешние
обновления value/options не вызывают onValueChange. Если выбранный option
временно отсутствует, сохраняются последнее известное имя и disabled-состояние
в single и multiple. При появлении option берутся актуальные label/disabled. Для
значения, которого ещё не было в options, показывается String(value). Кэш содержит
только выбранные значения; он очищается при снятии выбора.

Для отдельного control `defaultValue` принимает readonly-массив и копируется
один раз. При привязке задавайте начальное значение у владельца, без defaultValue;
для очистки передавайте `[]`. Нативный reset формы в multiple восстанавливает
defaultValue, а при его отсутствии — пустой массив, обновляет привязку и закрывает
список без callbacks. Связь с внешней формой через атрибут form тоже учитывается.
Отменённый reset не изменяет Select; Form модели сбрасывает значения через
resetFields. Одиночный режим сохраняет прежнее управление сбросом владельцем.

С name или FormItem.name каждое выбранное значение создаёт отдельное поле
FormData под тем же именем. Используйте `new FormData(form).getAll('teams')`:
результат содержит строки, например `['0', '1']`. Пустой выбор даёт `[]`,
disabled control не передаёт значения. Поисковый текст в FormData не попадает.
Нативный required в multiple проверяет наличие выбранных значений, включая 0,
и не требует текста в поиске. Подпись удаления задаёт `locale.removeText`,
сообщение нативного required — `locale.selectRequiredText`.

В Form передавайте `value={form.values.teams}` и
`onValueChange={(value) => form.setFieldValue('teams', value)}`. Задайте тип
массива явно, например `createForm<{ teams: number[] }>({ initialValues: { teams: [] } })`.
`required` отклоняет пустой массив, min/max ограничивают количество элементов.
Галерея `/ant-design` содержит форму выбора от одной до трёх команд с отправкой
и сбросом. Режим tags пока не поддерживается.

### Удалённый поиск

Select принимает loading, notFoundContent и onPopupScroll. Поиск настраивается
через текущий API Ant Design 6.6.8: showSearch={{ searchValue, onSearch, filterOption }}.
Одноимённые deprecated top-level props удалены. Boolean showSearch включает
встроенный поиск. FilterOption=false
полностью отключает локальную фильтрацию, true сохраняет прежний поиск по label;
callback (search, option) позволяет собственную фильтрацию непустого запроса.

SearchValue управляет текстом поиска, onSearch получает пользовательский ввод.
Владелец может отклонить запрос, оставив searchValue прежним; внешняя замена текста
не вызывает onSearch. Без searchValue используется внутренний текст. Выбор,
закрытие и reset очищают внутренний поиск без onSearch; при управляемом поиске
владелец сам очищает searchValue, если это нужно. Поисковый текст не попадает в
FormData и не меняет выбранные value. OnSearch не имеет встроенного debounce.

Loading показывает spinner и aria-busy, сохраняя доступность уже выданных options.
При пустой выдаче по умолчанию выводится локализованный текст loading/empty;
notFoundContent заменяет его строкой, числом или Snippet, null убирает содержимое.
При отсутствии local notFoundContent используется ConfigProvider.renderEmpty('Select');
его falsy результат выбирает simple small Empty. Без callback сохраняется прежний
локализованный текст. Остальные правила — в [общем справочнике](./docs/reference/render-empty.md).
Ошибка не является отдельным upstream prop: используйте status="error" и
notFoundContent, при необходимости внешний alert и кнопку повтора. Фокус в controls
кастомного пустого содержимого сохраняет popup, выход наружу закрывает его.
Native input blur-callback остаётся нативным. Для кнопки
внутри popup предотвращайте pointerdown default, если нужно сохранить фокус поля;
дублируйте действие вне popup для последовательной клавиатурной навигации.
OnPopupScroll получает native scroll event с currentTarget=listbox; решение о
следующей странице и объединение options остаются у потребителя.

```svelte
<Select options={remote.options} bind:value
  showSearch={{ searchValue: remote.searchValue, onSearch: remote.search, filterOption: false }}
  loading={remote.loading} notFoundContent={emptyState}
  onPopupScroll={event => {
    const list = event.currentTarget;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 16) remote.more();
  }} />
```

Галерея /ant-design#select-remote использует отдельную
[presentation model](https://woodger.org/ant-design#select-remote)
с debounce, AbortSignal, защитой от поздних ответов
уже во время debounce, стабильным объединением страниц по value и повтором
последнего неудачного cursor. Dispose отменяет таймер/запрос. Источник демонстрационный,
сетевые API, таймеры и server-specific ошибки не входят в библиотечный Select.
Пока не перенесены остальные поля showSearch config, labelInValue, tags,
виртуализация, произвольный popupRender и общий полный rc-select API.

## Checkbox

```svelte
<script lang="ts">
  import { Checkbox } from 'antd-svelte';

  let checked = $state(false);
  let indeterminate = $state(true);
</script>

<Checkbox bind:checked bind:indeterminate name="notifications" value="enabled">
  Получать уведомления
</Checkbox>
```

`checked` поддерживает привязку и callback `onCheckedChange(checked)`.
Для отдельного control можно задать `defaultChecked`; с привязкой задавайте
начальное значение у владельца. Нативный reset формы возвращает `defaultChecked`
и обновляет привязку. Сброс и внешние обновления props не вызывают
`onCheckedChange`; нативный `onchange` также доступен.

`indeterminate` задаёт смешанное состояние, поддерживает привязку и сбрасывается
при пользовательском переключении. Оно не меняет `checked` и значение FormData.
Отмеченный checkbox передаёт `name=value` (по умолчанию value равен `on`),
неотмеченный или disabled checkbox не включается в FormData.

В FormItem передавайте `checked={form.values.accepted}` и
`onCheckedChange={(value) => form.setFieldValue('accepted', value)}`. Для модели
с boolean задайте тип явно: `createForm<{ accepted: boolean }>(...)`.
Чтобы требовать именно `true`, используйте
`validator: (value) => value === true ? undefined : 'Подтвердите согласие.'`.
Встроенное правило `required` проверяет наличие значения, и `false` считается
заданным значением. `form.resetFields()` возвращает значение из `initialValues`.

OnChange получает `{ target, nativeEvent, stopPropagation, preventDefault }` с
типизированными target.checked/value. Нативный onchange остаётся отдельным DOM
событием. Callback Checkbox вызывается до Group.onChange; прежний onCheckedChange
и сброс indeterminate при пользовательском переключении сохранены. NativeEvent —
DOM change, а не React MouseEvent. Label/input используют исходный click bubble
lock; наружу приходит один click на активацию подписи.

ConfigProvider.checkbox задаёт class/style и semantic root/icon/label, в том числе
для вариантов Group и вложенного provider. Локальные classNames/styles принимают
объекты или функции от фактических checked/indeterminate/disabled props. Приоритет
root style: config.styles.root, config.style, styles.root, style. Title относится
к внутреннему span, как в исходном Checkbox; class/rootClassName/style — к label.
PrefixCls меняет классы; CSS для произвольного префикса предоставляет потребитель.

Bind:inputElement и bind:nativeElement возвращают input и внутренний span;
bind:ref — `{ input, nativeElement, focus(options?), blur() }`. Ссылки очищаются при
unmount. Focus/blur есть и у bind:this. AutoFocus вызывает native focus один раз
при mount; lowercase autofocus сохраняет HTML-поведение. TabIndex — alias tabindex.
OnFocus/onBlur/onKeyDown/onKeyPress работают на input, onMouseEnter/onMouseLeave —
на label. Нативные lowercase handlers сохраняются.

## CheckboxGroup

CheckboxGroup переносит выбор нескольких флажков в одно поле с массивом.
`CheckboxGroupProps<Value>` и `CheckboxGroupOption<Value>` поддерживают
string, number и boolean. Options принимает примитивы или объекты
`{ value, label, disabled?, id?, title?, className?, style?, required?, onChange? }`;
подпись примитива получается через String. Label принимает строку, число или
snippet; style — CSS-строка. Nullish entries/values пропускаются.

```svelte
<script lang="ts">
  import { Checkbox, CheckboxGroup } from 'antd-svelte';

  const options = [
    { value: 'read', label: 'Просмотр' },
    { value: 'edit', label: 'Редактирование' },
    { value: 'archive', label: 'Архив', disabled: true }
  ];
  let permissions = $state<string[]>(['read']);
</script>

<CheckboxGroup {options} bind:value={permissions} name="permissions" aria-label="Права доступа" />
```

При options каждое пользовательское переключение обновляет bind:value и вызывает
`onValueChange(values)` с новым массивом в порядке options. Массив callback
не разделяется с привязкой. Повторяющиеся options показываются один раз;
первая подпись и disabled-состояние сохраняются. Числовой 0 и строковый "0",
boolean false и строковый "false" остаются разными значениями.

Внешние обновления value/options не переписывают массив владельца и не вызывают
callback. Временно отсутствующие варианты скрываются, а возвращённые снова
отображают выбранное состояние. При следующем пользовательском переключении
массив содержит только текущие options, без повторов, в их текущем порядке.

Группа наследует disabled из Form/FormItem и ConfigProvider; явный
`disabled={false}` переопределяет наследование. Disabled группы блокирует все
варианты, disabled option блокирует только соответствующий checkbox.
Уже выбранный disabled-вариант сохраняется в массиве.

Для отдельной группы defaultValue принимает readonly-массив и копируется один
раз. С bind:value задавайте начальное значение у владельца без defaultValue.
Нативный reset формы восстанавливает defaultValue или пустой массив, включая
привязку, без callbacks. Массив обновляется в следующей задаче после события
reset, чтобы учесть отмену события; отменённый reset сохраняет текущий выбор.
Внешняя форма через атрибут form поддерживается. В Form сбросом управляет
модель через resetFields.

Группа содержит нативные checkbox: Tab перемещает фокус, Space и нажатие подписи
переключают вариант. С name или FormItem.name отмеченные доступные варианты
попадают в FormData под одним именем. Читайте их через
`new FormData(form).getAll('permissions')`. Результат содержит строки в порядке
options; disabled, отсутствующие и невыбранные варианты исключаются.
Например, выбранные числовой 0 и boolean false передаются как `['0', 'false']`.

В Form используйте `value={form.values.permissions}` и
`onValueChange={(value) => form.setFieldValue('permissions', value)}`.
Правила required/min/max проверяют массив целиком. Required не назначается
каждому input, поэтому выбор всех вариантов не становится обязательным.
Имя поля, описание и ошибки передаются из FormItem; группа использует fieldset
и получает доступное имя из label FormItem либо aria-label/aria-labelledby.
При ошибке или нажатии подписи FormItem фокус переходит к первому доступному
варианту; пустая группа может получить фокус сама, без дополнительного шага Tab.

Галерея `/ant-design#checkbox` показывает форму выбора прав с общим флажком
«Все права», промежуточным состоянием, проверкой количества, отправкой и сбросом.
Общий выбор управляется владельцем через массив, как и в примере Ant Design.
Непустые нормализованные options имеют приоритет над children; пустые оставляют
snippet с вложенными Checkbox, включая Row/Col и другие контейнеры:

```svelte
<CheckboxGroup bind:value={permissions} name="permissions" aria-label="Права доступа">
  <Checkbox value="read">Просмотр</Checkbox>
  <Checkbox value="edit">Редактирование</Checkbox>
</CheckboxGroup>
```

Children регистрируют текущие значения и отменяют регистрацию при удалении или
смене value. Как upstream, их внутренний массив сохраняет порядок выбора и
временно отсутствующие значения. Bind:value отражает этот raw state; callbacks
получают только зарегистрированные значения. Поэтому вернувшийся child снова
показывает сохранённый выбор. OnChange(values) вызывается перед onValueChange,
массивы callbacks не разделяются с state. У options сохраняются описанные выше
сортировка и нормализация прежнего API. Getter/setter function binding позволяет
владельцу отклонять изменения; native checked восстанавливается по типизированным
значениям, не смешивая 0 и '0'.

SkipGroup оставляет Checkbox самостоятельным: его checked/name и callbacks не
входят в группу. Disabled внешнего native fieldset продолжает действовать.
Вложенные CheckboxGroup изолируют context; флажки выбора строк Table используют
skipGroup, как в upstream. Group.nativeElement — bindable fieldset; rootClassName,
prefixCls и явный role относятся к корню. PrefixCls передаётся в generated options,
а children задают собственный prefixCls.

Сохранены native fieldset/form/reset/required, принудительный disabled группы,
primitive values и deduplication options, bind:indeterminate и defaults. Они
отличаются от React state/ref conventions, child disabled override и controlled
indeterminate. Source Checkbox aliases и отдельные theme algorithms применяются
к Checkbox/CheckboxGroup; native-only темы сохраняют прежнее оформление.
Wave подключён; произвольный prefix CSS и React diagnostics/statics остаются
неперенесёнными. Типы —
[checkbox.types.ts](./src/lib/checkbox.types.ts) и
[checkbox-group.types.ts](./src/lib/checkbox-group.types.ts); проверки —
[browser](./tests/browser/checkbox-features.spec.ts),
[package SSR](./tests/package/checkbox-features.ssr.test.ts) и
[engine](./src/lib/checkbox-group.engine.test.ts). Изучены @rc-component/checkbox
2.0.0 и @rc-component/util 1.14.0; runtime React dependencies не добавлены.

## Radio и RadioGroup

Radio использует нативный input[type=radio], поддерживает bind:checked,
defaultChecked и `onCheckedChange(checked)`. Содержимое передаётся snippet,
как у Checkbox. Варианты с одинаковым непустым name в одной форме и одном
DOM-корне образуют нативную группу. Выбор одного снимает соседний; bind:checked
соседа тоже обновляется. Его callback при этом не вызывается: нативный change
получает выбранный radio. Внешнее обновление checked синхронизирует соседей без
callbacks. Нативный onchange также доступен. Без name отдельные Radio независимы.

Для общего типизированного значения используйте RadioGroup.
`RadioGroupProps<Value>` и `RadioOption<Value>` принимают string, number и
boolean. Options содержит примитивы или `{ value, label, disabled?, id?, title?,
className?, style?, required?, onChange? }`. Label принимает строку, число или
snippet; style остаётся CSS-строкой, как в остальных Svelte-компонентах.
Повторяющиеся значения отображаются один раз, с первой подписью и disabled.

```svelte
<script lang="ts">
  import { RadioGroup } from 'antd-svelte';

  const options = [
    { value: 0, label: 'Базовый' },
    { value: 1, label: 'Командный' },
    { value: 2, label: 'Архивный', disabled: true }
  ];
  let plan = $state<number | undefined>(0);
</script>

<RadioGroup {options} bind:value={plan} name="plan" aria-label="Тариф" orientation="vertical" />
```

Пользовательский выбор обновляет bind:value и вызывает onValueChange(value)
один раз, только при смене значения. Числовой 0 и boolean false остаются
полноценными выбранными значениями и отличаются от строк "0" и "false".
Для внешней очистки присвойте undefined. Изменение props не вызывает callbacks
и не переписывает значение владельца. Если выбранный вариант исчезает,
в группе нет отмеченного input; после возвращения option выбор восстанавливается.

Без name и FormItem.name RadioGroup назначает уникальное нативное имя,
чтобы соседние группы не снимали выбор друг друга. Это имя также используется
в FormData; для стабильного имени поля задавайте name явно. Одинаковое имя
в разных формах не объединяет варианты. Внутри одной формы для независимых
групп используйте разные имена.

Стрелки переключают нативный выбор и фокус, пропуская disabled options;
Space выбирает сфокусированный вариант, Tab выходит из группы. Orientation
по умолчанию horizontal; vertical располагает варианты столбцом. Boolean alias
vertical применяется, когда orientation не задан. Явный orientation имеет приоритет. Группа
наследует disabled из Form/FormItem и ConfigProvider. Явный disabled=false
переопределяет наследование, disabled группы блокирует все options.

Для отдельного Radio defaultChecked, а для RadioGroup defaultValue
фиксируются при создании. С привязкой задавайте начальное значение у владельца
без defaults. Нативный reset восстанавливает начальные значения и обновляет
привязки в следующей задаче после события, без callbacks. Отменённый reset
сохраняет текущий выбор. Атрибут form связывает controls с внешней формой.
Form сбрасывает значения через модель resetFields.

Выбранный доступный radio передаёт в FormData строку под своим name.
`new FormData(form).get('plan')` возвращает, например, '0' или 'false';
при отсутствии выбранного доступного варианта — null.
Required использует нативное правило группы: нужен один
выбранный вариант среди её input. Для пустого списка options используйте
правила Form, поскольку нативного input в такой группе нет.

В Form передавайте `value={form.values.plan}` и
`onValueChange={(value) => form.setFieldValue('plan', value)}`. Правило required
проверяет значение поля и принимает 0/false. Для отдельного Radio с boolean
используйте checked/onCheckedChange; если требуется именно true, задайте
custom validator, как в примере Checkbox.

RadioGroup получает из FormItem имя, подпись, required и описание ошибки.
Fieldset с ролью radiogroup сообщает required/invalid; отдельные Radio связаны
с описанием ошибки. Нажатие подписи FormItem и ошибка формы переводят фокус
к выбранному доступному варианту либо первому доступному. Пустая группа может
получить фокус сама, без дополнительного шага Tab.

Галерея `/ant-design#radio` показывает отдельные Radio для расположения
вариантов и форму с числовым тарифом, boolean-публикацией, отправкой и сбросом.
RadioGroup также принимает children со вложенными Radio и RadioButton.
Непустые options имеют приоритет, пустой массив оставляет children:

```svelte
<script lang="ts">
  import { RadioButton, RadioGroup } from 'antd-svelte';

  let mode = $state('month');
</script>

<RadioGroup bind:value={mode} name="mode" aria-label="Режим календаря" size="small">
  <RadioButton value="month">Месяц</RadioButton>
  <RadioButton value="year">Год</RadioButton>
</RadioGroup>
```

RadioButton соответствует React Radio.Button и добавляет только кнопочный
option context, без новой DOM-обёртки. Input остаётся radio: работают native
keyboard, name/FormData, required и существующий reset/bind контракт Radio.
`optionType="button"` у группы меняет все дочерние Radio; явный `optionType="default"`
перекрывает кнопочный контекст RadioButton. Без optionType каждый дочерний control
сохраняет собственный вид. Привязка value и checked использует прежний Svelte API.

`buttonStyle` выбирает outline (default) или solid. `size` наследует componentSize;
локальный small/medium/large имеет приоритет. Block растягивает группу и делит
ширину между вариантами; vertical сохраняет стыки и радиусы кнопок. Темы, primary,
compact и RTL используют текущие настройки библиотеки. Нативный fieldset и
существующий приоритет disabled группы сохранены.

`bind:nativeElement` у Radio/RadioButton возвращает внутренний span RcCheckbox,
bind:inputElement — input для focus()/blur(). Обе ссылки очищаются при unmount.
Bind:ref возвращает `{ input, nativeElement, focus(options?), blur() }`; focus/blur
доступны также через bind:this. У RadioGroup bind:nativeElement возвращает fieldset.
AutoFocus переводит фокус на input при mount; lowercase autofocus сохраняет нативное
поведение. TabIndex — alias нативного tabindex.
`rootClassName`, как class/style, относится к label. Точные объявления — в
[radio.types.ts](./src/lib/radio.types.ts). Изучены Radio/Group/RadioButton и
@rc-component/checkbox 2.0.0; runtime React dependency не добавлена.

Рецепт radio-button воспроизводит 67 правил эталона для кнопок, размеров,
vertical/block и Badge; прежний vendor/radio.css сохранён. Проверки —
`?fixture=radio-button`, SSR/public package и browser, включая существующие Radio.

ClassNames/styles у Radio и RadioButton задают root/icon/label объектом или
функцией от `{ props }`. Props содержат фактические checked, disabled, value и name;
checked учитывает локальное состояние Svelte. ConfigProvider.radio задаёт общие
class/style и semantic slots, в том числе для Radio из options и вложенного provider.
Приоритет root style: config.styles.root, config.style, styles.root, style.
Настройки применяются к каждому Radio, как в исходной реализации; Group сохраняет
собственные class/style. PrefixCls меняет имена классов; CSS для нового префикса
предоставляет потребитель. У Group он передаётся в options; children задают свой.

OnChange получает `{ target, nativeEvent, stopPropagation, preventDefault }`;
target.value сохраняет исходный тип. NativeEvent — DOM change, а не React MouseEvent.
Callback option/Radio вызывается до Group.onChange; Group.onChange — перед
onValueChange. Нативный onchange остаётся на input. Label/input clicks защищены от
повторного внешнего всплытия. OnClick/onFocus/onBlur/onKeyDown/onKeyPress работают
на input; onMouseEnter/onMouseLeave — на label. У Group onFocus/onBlur получают
всплывающие focusin/focusout дочерних controls. Для отклонения выбора владельцем
группы используйте function binding с getter/setter; native checked восстанавливается
по типизированным значениям, включая различие 0 и '0'.

Сохраняются прежние native fieldset, defaults/reset, required и disabled группы,
уникальные имена, примитивные типы и удаление повторных options. Эти границы
отличаются от React any-value/controlled-state и приоритета disabled дочернего Radio.
Source Radio tokens и отдельные theme algorithms применяются к Radio, RadioButton
и RadioGroup; native-only темы сохраняют прежнее оформление. Произвольный prefix CSS,
Wave подключён; React diagnostics/statics и вложенные Form NamePath остаются неперенесёнными.
Дополнительные сценарии — `?fixture=radio-features`,
[browser](./tests/browser/radio-features.spec.ts) и
[package SSR](./tests/package/radio-features.ssr.test.ts).

## Switch

Switch переключает boolean-состояние через `bind:checked` и
`onCheckedChange(checked)`. Отдельному control можно задать defaultChecked;
он фиксируется при создании. С привязкой задавайте начальное значение у
владельца без defaultChecked. Внешние изменения checked не вызывают callback.

```svelte
<script lang="ts">
  import { Switch } from 'antd-svelte';

  let notifications = $state(false);
</script>

<Switch id="notifications" bind:checked={notifications} name="notifications">
  {#snippet checkedChildren()}Вкл{/snippet}
  {#snippet unCheckedChildren()}Выкл{/snippet}
</Switch>
<label for="notifications">Уведомления</label>
```

Компонент использует button с type=button, role=switch и aria-checked.
Space, Enter, нажатие control или связанной подписи меняют состояние один раз
и не отправляют форму. Нативный onclick доступен; preventDefault в этом
обработчике отменяет переключение. Доступное имя задаётся через label,
FormItem или aria-label/aria-labelledby. Snippets checkedChildren и
unCheckedChildren предназначены для коротких подписей и декоративных иконок.
Они скрыты от accessibility tree, поэтому имя control не меняется вместе
с текстом состояния.

Размеры — medium и small. По умолчанию наследуется componentSize;
small включает малый размер, medium/large провайдера используют обычный.
Явный size переопределяет наследование. Disabled наследуется из Form/FormItem
и ConfigProvider, disabled=false переопределяет его. Loading показывает
индикатор, выставляет aria-busy и блокирует действия даже с disabled=false.
Существующее checked-состояние при блокировке сохраняется. Стили поддерживают
светлую/тёмную тему, основные цвета, RTL и prefers-reduced-motion.

С name или FormItem.name включённый доступный Switch передаёт `name=on` в
нативную FormData, как Checkbox. `new FormData(form).get('notifications')`
возвращает 'on' либо null; false, disabled и loading исключают поле.
Модель Form при этом хранит boolean, включая false. Атрибут form связывает
control с внешней формой. Нативный reset восстанавливает defaultChecked
и обновляет привязку в следующей задаче после события, без callbacks.
Отменённый reset сохраняет текущее состояние. При удалении Switch ожидающий
reset отменяется.

Для Form передавайте `checked={form.values.notifications}` и
`onCheckedChange={(value) => form.setFieldValue('notifications', value)}`.
FormItem передаёт id, имя, required, ошибки и описание кнопке. Ошибка формы
переводит фокус на Switch; blur отмечает поле touched. Reset формы использует
resetFields модели. Правило required считает false заданным значением;
для обязательного включения задайте custom validator:
`validator: (value) => value === true ? undefined : 'Включите настройку.'`.
Проверкой значения управляют правила Form.

Сохранение и ошибки остаются у владельца: Switch сообщает новое состояние,
а владелец задаёт checked и loading. Галерея `/ant-design#switch` содержит
пример асинхронного сохранения с [моделью состояния](https://woodger.org/ant-design#switch):
ожидание блокирует повторные запросы, успех подтверждает значение, ошибка
возвращает последнее сохранённое состояние, следующая попытка очищает ошибку.
При удалении примера запрос отменяется, поздний результат игнорируется.
Флажок ошибки в примере влияет только на следующее сохранение. Ниже показан
малый Switch с проверкой и сбросом Form.

Value/defaultValue — aliases checked/defaultChecked. Определённый checked имеет
приоритет над value; defaultChecked, включая false, — над defaultValue. Defaults
фиксируются при создании. Value поддерживает bind:value; задавайте начальный boolean
у владельца и используйте один способ привязки на протяжении жизни control.
Checked/value сохраняют существующие Svelte state conventions: для отклонения
пользовательского изменения используйте getter/setter function binding.

OnChange(checked, event) и onClick(checked, event) получают native MouseEvent либо
KeyboardEvent с button в currentTarget. При click сначала работает прежний native
onclick, способный отменить переключение, затем onCheckedChange, onChange и onClick.
ArrowLeft задаёт false, ArrowRight — true, в том числе в RTL. Повторная стрелка
вызывает onChange даже при том же состоянии, как rc-switch; onClick не вызывается.
OnKeyDown и native onkeydown работают после обработки стрелок. Внешние обновления
и reset не вызывают source callbacks. OnFocus/onBlur дополняют lowercase handlers.
Синтетические keydown используют keyCode 37/39: это native эквивалент which,
который React нормализует для rc-switch; одного key без кода недостаточно.

CheckedChildren/unCheckedChildren принимают string, number или snippet; ноль
сохраняется. ConfigProvider.switch задаёт class/style и semantic root/content/indicator,
которые наследуются вложенным provider. ClassNames/styles принимают объекты или
функции от props с resolved size/disabled. Content относится к обеим внутренним
подписям, indicator — к handle. Приоритет root style: config.styles.root, config.style,
styles.root, style. PrefixCls меняет классы, rootClassName относится к button;
CSS произвольного префикса предоставляет потребитель.

Bind:ref и bind:nativeElement возвращают native button и очищаются при unmount;
focus(options?)/blur() доступны и через bind:this. AutoFocus вызывает focus при
mount, tabIndex — alias tabindex. Lowercase autofocus сохраняет HTML-поведение.
Native form/reset/hidden field, отменяемый onclick, скрытые от accessibility tree
подписи и span handle сохраняют прежний Svelte контракт. React использует div handle
и controlled state/event/ref conventions. Source Switch tokens и отдельные theme
algorithms применяются к обоим размерам; native-only темы сохраняют прежнее
оформление. Wave подключён; произвольный prefix CSS и React diagnostics/statics пока не перенесены.

Изучены Ant Design 6.6.8, @rc-component/switch 1.0.3 и @rc-component/util 1.14.0.
Рецепт switch побайтно воспроизводит прежние 47 правил vendor CSS, включая reduced
motion; keyframes не добавляются. Типы — [switch.types.ts](./src/lib/switch.types.ts),
проверки — [browser](./tests/browser/switch-features.spec.ts) и
[package SSR](./tests/package/switch-features.ssr.test.ts).

## Pagination

```svelte
<script lang="ts">
  import { Pagination } from 'antd-svelte';

  let current = $state(1);
  let pageSize = $state(10);
</script>

<Pagination total={137} bind:current bind:pageSize>
  {#snippet showTotal(total, range)}{range[0]}–{range[1]} из {total}{/snippet}
</Pagination>
```

`total` по умолчанию равен 0. `current` и `pageSize` поддерживают привязку;
для отдельных controls доступны `defaultCurrent=1` и `defaultPageSize=10`.
Начальные значения читаются один раз. При привязке задавайте их у владельца.

Переход вызывает `onChange(page, pageSize)`. Повторное нажатие текущей страницы
не вызывает событие. Смена размера сначала вызывает
`onShowSizeChange(previousCurrent, pageSize)`, затем
`onChange(clampedCurrent, pageSize)`, сохраняя номер страницы в допустимых пределах.
Callback получает номера с учётом отображаемого диапазона.

Отображаемая страница ограничена диапазоном `1…ceil(total / pageSize)`.
Изменение props, включая уменьшение `total`, само не записывает исправленное
значение владельцу и не вызывает callbacks. Для пустой коллекции отображается
страница 1 и диапазон `[0, 0]`; `hideOnSinglePage` скрывает навигацию.
У пустой коллекции числовая кнопка отключена и не помечена active, как в upstream.
Дробные значения округляются вниз, total ограничен снизу нулём, current и
pageSize — единицей, все значения — сверху `Number.MAX_SAFE_INTEGER`.
Для NaN и бесконечных значений используются defaults 0, 1 и 10.
Список номеров и переходов содержит не более девяти элементов независимо от total.
Расчёт окон и jump boundaries перенесён из @rc-component/pagination 1.4.0:
при двух jump-кнопках между ними остаются три числовые кнопки, включая текущую.
`showLessItems` уменьшает buffer и шаг jump с 5 до 3; `showPrevNextJumpers` скрывает jumps.

Выбор размера автоматически показывается при `total > 50`; это меняется через
`showSizeChanger`. `pageSizeOptions` по умолчанию равен `[10, 20, 50, 100]`.
Допустимы положительные целые безопасные числа; дубликаты удаляются, варианты
сортируются, текущий размер добавляется в список. `showTotal` получает
нормализованный total и диапазон записей с нумерацией от 1.
На узком экране элементы переносятся на следующую строку, а выбор размера
остаётся доступным.

`simple=true` показывает редактируемый current/total. Enter и blur подтверждают ввод,
ArrowUp уменьшает страницу, ArrowDown увеличивает. Объект `{ readOnly: true }`
сохраняет counter без input. Для пустой коллекции simple counter равен 1/0,
как в закреплённой версии. Незавершённый ввод сохраняется при внешнем изменении
total/pageSize, пока отображаемая current не изменилась. Выбор размера сбрасывает
draft к отображаемой странице. `showQuickJumper=true` добавляет ввод цифр: Enter и blur
за пределами paging controls переходят на указанную страницу. Объект
`{ goButton: true }` добавляет подтверждение и отключает переход по blur.
Вместо true у goButton допустим текст/snippet. Quick jumper доступен и в simple mode.
Его кнопка сначала подтверждает simple input, затем значение quick jumper; blur
simple input сохраняет исходное поведение подтверждения. Для одной страницы
quick jumper и его кнопка скрыты. Вложенный в quick jumper React li заменён на span
с тем же классом, чтобы сохранить валидную HTML-структуру; подтверждение — native button.

`align` принимает start/center/end. `showTitle=false` убирает tooltip titles,
сохраняя доступные имена. `responsive` на XS добавляет legacy class mini при
отсутствии явного size. В CSS Ant Design 6.6.8 этот класс сам не меняет высоту:
её меняет size=small. Это поведение проверено на исходной React-сборке и сохранено.
`size` и ConfigProvider.componentSize по-прежнему задают реальные размеры.

`itemRender` — snippet с `(page, type, originalElement, info)`. OriginalElement
рисует готовый native button; info содержит disabled/active/label/title/onClick
для собственного native control. Это замена ReactNode и cloneElement/LI click.
`prevIcon/nextIcon/jumpPrevIcon/jumpNextIcon` принимают текст или декоративный snippet.
Стандартные jump/ellipsis icons перенесены из @ant-design/icons-svg 4.6.0
под существующей [MIT-лицензией](./src/lib/vendor/LICENSE.ant-design-icons).

`showSizeChanger` допускает boolean или поддержанные Select props. Собственный
onChange вызывается после onShowSizeChange и основного onChange Pagination.
Размер Pagination имеет приоритет над size из Select props.
`components.sizeChanger` получает snippet с value/disabled/class/options/onChange.
Не все расширенные React Select props уже существуют у Svelte Select.

ConfigProvider.pagination задаёт class/style, semantic classNames/styles,
showSizeChanger и totalBoundaryShowSizeChanger. Локальные настройки имеют приоритет.
Semantic callbacks получают исходные props и явный resolved size; внутренние
default values не подставляются вместо отсутствующих исходных props.
Semantic root соответствует native nav; прежний class остаётся на ul.
Root style перекрывает styles.root; classNames.item/styles.item относятся к страницам,
prev/next и simple counter, исключая jump controls, как в upstream.
`locale` принимает исходные snake_case aliases; locale.page задаёт suffix quick jumper.
Существующий config.locale.pagination.page остаётся доступным именем страницы.

Сохранены отличия прежнего Svelte API: bind:current/pageSize, нормализация чисел,
сортировка/удаление повторов размеров и доступный size changer на XS. Новые строковые
pageSizeOptions сначала преобразуются в числа. В React options могут сохранять
исходный порядок, а вся options area скрывается на XS. Quick jumper следует
исходному CSS и скрывается на XS. Для controlled compositing с отказом владельца
используйте functional bindings с getter и обработчики onChange.

Генерация CSS для произвольных prefixCls/selectPrefixCls и React-specific components/dev warnings
остаются в следующих этапах. `selectPrefixCls` доступен custom size changer info;
штатный Select сохраняет свои классы. Обычный disabled, навигация native кнопками,
возврат focus после отключения next и SSR без DOM/media/timers сохранены.

Source `theme.components.Pagination` использует 12 собственных defaults и общий
расчёт 18 Input defaults для quick jumper. Поддержаны component algorithms,
aliases, нули/undefined, runtime CSS lengths и CSS prefix/hash. Токены находятся
на native nav, styled ul наследует их, поэтому styles.root/style сохраняют
приоритет. Внутренний Select получает собственный scope; Input overrides
не подменяют quick jumper. MiniOptionsSizeChangerTop сериализуется, но исходный
CSS 6.6.8 его не использует.

Глобальный token.wireframe включает bordered, независимо от одноимённого
component override. Дополнительные правила перенесены из исходного
pagination/style/bordered.ts: в закреплённом dist/antd.css их нет. Цвета и padding
номеров применяются к сохранённым native buttons. Кнопки prev/next сохраняют
source line-height: normal, в том числе при неопределённой высоте item.
Метрики трёх размеров, disabled/simple и variants, hover/focus и обновления темы
проверяются с официальным UMD в `?fixture=pagination-theme`. Native-only темы,
bind API и согласованное поведение на XS сохраняются.

В теме без `cssVar` активный номер также получает primary-цвет, hover —
primary-hover, disabled — disabled-цвет. Переменные цветов состояний на
`styles.item` и inline-цвет custom `itemRender` сохраняют приоритет. Эти состояния
проверяет [регрессионный тест](./tests/browser/pagination-color.spec.ts)
в светлой и тёмной теме, LTR и RTL; существующая native-палитра `primary` сохраняется.

Проверки: [engine](./src/lib/pagination.engine.test.ts),
[SSR](./src/lib/pagination.ssr.test.ts),
[package](./tests/package/pagination.ssr.test.ts),
[browser](./tests/browser/pagination-features.spec.ts), прежние
[binding/normalization tests](./tests/browser/checkbox-pagination.spec.ts)
и `?fixture=pagination-features`. [CSS](./src/lib/vendor/pagination.css)
воспроизводится рецептом pagination: 115 правил, включая два media rules;
алгоритм страниц использует [MIT rc-pagination](./src/lib/vendor/LICENSE.rc-pagination).

## Table

```svelte
<script lang="ts">
  import { Table, type TableColumn, type TableKey, type TableSorter } from 'antd-svelte';

  interface Person { id: number; name: string; score: number }

  const people: Person[] = [
    { id: 0, name: 'Анна', score: 30 },
    { id: 1, name: 'Борис', score: 10 }
  ];
  const columns: TableColumn<Person>[] = [
    { key: 'name', title: 'Имя', render: personName },
    { key: 'score', title: 'Баллы', dataIndex: 'score', sorter: (left, right) => left.score - right.score }
  ];
  let current = $state(1);
  let pageSize = $state(10);
  let sorter = $state<TableSorter | null>(null);
  let selectedRowKeys = $state<TableKey[]>([]);
</script>

{#snippet personName(person: Person)}<strong>{person.name}</strong>{/snippet}

<Table
  dataSource={people}
  {columns}
  rowKey="id"
  caption="Участники"
  bind:current
  bind:pageSize
  bind:sorter
  bind:selectedRowKeys
  rowSelection
  scroll={{ x: 600 }}
/>
```

По умолчанию используется `mode="client"`: фильтрация, сортировка и разбиение
на страницы выполняются локально; переданный `total` в этом режиме игнорируется.
`dataSource` и `columns` принимают readonly-массивы. Каждая колонка имеет
уникальный строковый `key` и текстовый `title`. `dataIndex` выбирает одно поле
`keyof Row`; null/undefined отображаются пустой строкой, остальные значения —
через безопасное текстовое преобразование. `render(record, index)` заменяет
содержимое ячейки типизированным snippet; index начинается с 0 на текущей
странице. Колонка также принимает `width`, `align` и `className`. Поле `className`
дополняет классы заголовка и ячеек данных своей колонки; служебные selection/expand
колонки его не получают. Сортировка, selected/fixed classes и native semantics
сохраняются. Обновление класса не пересоздаёт ячейку или snippet editor.
8 состояний официального UMD сверяются в
[browser](tests/browser/table-column-classes.spec.ts), серверная разметка —
в [SSR](tests/package/table-column-classes.ssr.test.ts).
Fixture `?fixture=table-column-classes`.

`rowKey` задаёт поле или функцию получения ключа, по умолчанию используется
поле `key`. Ключ должен быть уникальной строкой или конечным числом; `0`
поддерживается. Отсутствующие/повторные ключи строк, повторные ключи колонок и
пустой список колонок вызывают явную ошибку. Позиции строк не используются как
идентификаторы выбора.

Сортировка задаётся через `sorter: { columnKey, order } | null` и поддерживает
привязку. Компаратор принадлежит `column.sorter`. Нажатие заголовка переключает
`ascend → descend → null`. Равные значения сохраняют порядок исходных записей
в обоих направлениях; входной массив не изменяется. После фильтрации сортируется
весь прошедший набор, затем выбирается текущая страница. Номер страницы при сортировке
сохраняется. Если колонка удалена или не имеет компаратора, отображается исходный
порядок прошедших фильтр записей без изменения состояния владельца.

Пагинация включена по умолчанию: `current=1`, `pageSize=10`; оба props
поддерживают привязку. `pagination={false}` показывает все записи.
Объект `pagination` передаёт настройки `showSizeChanger`, `pageSizeOptions`,
`hideOnSinglePage`, `showTotal` и `aria-label` существующему Pagination. В клиентском
режиме total равен количеству записей после фильтрации. При уменьшении набора отображаемая страница
ограничивается допустимым диапазоном; props владельца не переписываются.

`rowSelection` включает Checkbox-колонку; объект
`{ getCheckboxProps: (record) => ({ disabled, 'aria-label': ... }) }` позволяет
отключить отдельные строки и изменить их доступное имя. `selectedRowKeys`
поддерживает привязку. Выбор всех строк затрагивает только доступные строки
текущей страницы и сохраняет ключи с других страниц. Заголовок игнорирует
disabled-строки при расчёте checked/indeterminate и отключается, если доступных
строк нет. При выключенной пагинации выбор всех относится ко всему набору.
Выбранные ключи сохраняются после замены или удаления записей, пока владелец
или пользователь не изменит выбор.

`onChange({ action, pagination, sorter, currentDataSource, filters })` вызывается
при пользовательской сортировке, фильтрации или смене страницы/размера.
`action` равен `sort`, `filter` или `paginate`, pagination содержит
`{ current, pageSize, total }`, а currentDataSource в клиентском режиме — весь отфильтрованный и
отсортированный набор до разбиения на страницы. Filters передаётся при наличии
фильтруемых колонок.
`onSelectionChange(keys, records, { type })` вызывается отдельно; type равен
`single` или `all`. Records идут в порядке выбранных ключей и содержат только
записи, присутствующие в текущем dataSource, включая скрытые фильтром;
отсутствующие записи не кэшируются.
Внешние изменения props, данных и колонок не вызывают эти callbacks.

Для отдельных таблиц доступны начальные `defaultCurrent`, `defaultPageSize`,
`defaultSorter`, `defaultSelectedRowKeys`, которые читаются один раз. При
привязке задавайте начальные значения у владельца. Для сброса присвойте
`sorter=null`, `selectedRowKeys=[]` и нужную страницу.

`loading` выставляет aria-busy, показывает статус загрузки и блокирует
сортировку, выбор и пагинацию. `disabled` наследуется из ConfigProvider и может
быть явно переопределён. Интерактивное содержимое собственных snippets
отключает владелец. `empty` заменяет текст пустого состояния snippet.
Размер наследуется из `componentSize`; доступны `bordered`, `caption`,
`aria-label`, `class` и `style`. `scroll.x` задаёт минимальную ширину таблицы:
горизонтальная прокрутка остаётся внутри фокусируемого контейнера.

### Раскрываемые строки

`expandable` добавляет перед колонкой выбора отдельную колонку с кнопками
раскрытия. `expandedRowRender(record, index)` — типизированный snippet с
подробностями; index начинается с 0 среди строк данных текущей страницы.
`rowExpandable(record)` позволяет скрыть кнопку и подробности отдельных строк.
По умолчанию раскрытие доступно для каждой переданной записи.

```svelte
<script lang="ts">
  import { Button, Table, type TableColumn, type TableKey } from 'antd-svelte';

  interface Person { key: number; name: string; email: string; active: boolean }
  const people: Person[] = [
    { key: 0, name: 'Анна', email: 'anna@example.com', active: true },
    { key: 1, name: 'Борис', email: 'boris@example.com', active: false }
  ];
  const columns: TableColumn<Person>[] = [{ key: 'name', title: 'Имя', dataIndex: 'name', width: 200 }];
  let expanded = $state<TableKey[]>([0]);
</script>

{#snippet details(person: Person, index: number)}<p>{index + 1}. {person.name}: {person.email}</p>{/snippet}
<Button onclick={() => { expanded = []; }}>Свернуть все</Button>
<Table dataSource={people} {columns} caption="Участники"
  expandable={{ expandedRowRender: details, rowExpandable: (person) => person.active,
    fixed: true, expandedRowKeys: expanded, onExpandedRowsChange: next => { expanded = next; } }} />
```

`expandable.expandedRowKeys` управляется владельцем через
`expandable.onExpandedRowsChange`. Для локального состояния доступны
`expandable.defaultExpandedRowKeys`, которые читаются один раз. `[]` сворачивает все строки.
Раскрытие использует тот же rowKey, что и выбор; числовой `0` и строковый `"0"`
различаются. Ключи сохраняются при сортировке, фильтрации, смене страниц,
замене/удалении данных, выключении expandable и изменении rowExpandable.
Подробности отображаются только для доступных строк текущего dataSource и страницы;
кэша записей нет. Возвращённая запись с сохранённым ключом снова раскрывается.

Пользовательское переключение обновляет внутренние ключи и вызывает
`expandable.onExpand(expanded, record)`, затем `expandable.onExpandedRowsChange(keys)`.
Управляемые ключи обновляет владелец; callbacks сами не меняют его массив.
[Замер официального UMD](./tools/fixtures/ant-design-current-table-expansion-observation.json)
фиксирует отказ владельца, принятие новых ключей и порядок callbacks.
Keys содержит все раскрытые ключи, включая отсутствующие на текущей странице.
Внешние изменения props не вызывают эти callbacks. Раскрытие не меняет выбор
или пагинацию и не вызывает общий onChange. currentDataSource и total считают
только записи, строки подробностей в них не входят.

`expandable.columnWidth` принимает число или CSS-ширину; default без source-темы —
48px, в теме Ant Design ширина выводится из глобальных метрик.
`columnTitle` задаёт видимый заголовок; по умолчанию он только доступен скринридеру.
`fixed: true` закрепляет колонку у начала строки, включая RTL. Смещения и colspan
учитывают раскрытие, выбор и данные. При горизонтальной прокрутке содержимое
подробностей остаётся в ширине видимой области. Ширины колонок данных сохраняются.

Кнопка имеет type=button и aria-expanded; в раскрытом состоянии aria-controls
ссылается на существующий блок подробностей с уникальным ID. Enter и Space
переключают состояние и сохраняют фокус на кнопке. Loading и disabled блокируют
переключение, disabled наследуется из ConfigProvider. Подписи задаются через
`locale.table.expandColumn`, `expandRow`, `collapseRow`.

Snippet создаётся только для видимой раскрытой строки. Сворачивание, скрытие
фильтром, уход со страницы или запрет rowExpandable удаляют его из DOM и
сбрасывают локальное состояние controls. Данные, которые нужно сохранить,
держите у владельца. SSR сразу отображает переданные раскрытые строки.
Раскрытие нажатием на всю строку, forceRender и иерархические данные пока не
поддерживаются. Живой пример карточек участников доступен на `/ant-design`.

### Видимость заголовка колонок

`showHeader` по умолчанию true. False удаляет `thead`, сохраняя caption, title/footer,
данные, сортировку и выбор строк. Внешние изменения видимости не вызывают onChange.
Пустой title snippet сохраняет панель. Класс ant-table-no-header применяется
при отсутствии title и showHeader=false; в bordered-таблице CSS скругляет
верхние углы первой строки body по исходным правилам.

Без шапки ширины fixed columns берутся из первой обычной строки tbody и заново
измеряются после замены страницы или восстановления пустого набора. Закрепление
и expanded viewport работают в LTR/RTL. Скрытие шапки удаляет её открытый фильтр;
содержимое и фокус controls в остающихся body rows сохраняются.
Сравнение 48 состояний UMD: [browser](tests/browser/table-header.spec.ts),
[SSR](tests/package/table-header.ssr.test.ts), fixture `?fixture=table-header`.

### Видимость колонок

`TableColumn.hidden` по умолчанию false. True убирает col/header/body cells
колонки и её controls из DOM. Сортировка и активные фильтры этой колонки
продолжают обрабатывать данные, как InternalTable перед rc-table. Переданный
список columns остаётся непустым.

При отсутствии видимых колонок данных остаются selection/expand cells.
Без них таблица показывает одну пустую ячейку на запись и пустой заголовок;
colgroup в этом случае отсутствует. Empty и expanded cells получают актуальный
colSpan, минимум 1. Восстановление колонок сохраняет выбранные/раскрытые строки,
controls соседних ячеек и expanded editor, focus/selection и FormData.
Смена hidden не вызывает onChange; controls самой скрытой колонки удаляются.

14 случаев UMD: [browser](tests/browser/table-column-hidden.spec.ts),
[SSR](tests/package/table-column-hidden.ssr.test.ts), fixture `?fixture=table-column-hidden`.
Сравниваются видимый текст, структура и selection controls. Raw textContent,
checkbox counts и colspan attributes сохранены: native TableFilter сохраняет
закрытый popover в DOM, а colSpan=1 может быть явным атрибутом.

### Заголовки строк

`TableColumn.rowScope` принимает `'row'` или `'rowgroup'`: ячейки данных этой
колонки становятся `th` с соответствующим scope, как в Ant Design 6.6.8.
Без настройки используются `td`. Заголовки колонок, selection/expand cells и
строки раскрытого содержимого сохраняют свою семантику. RowScope не объединяет
записи. У заголовков строк используются headerBg/headerColor/fontWeightStrong;
выделение строки и rowHoverable сохраняют исходные цвета.

Fixed row headers используют source headerBg поверх прежней непрозрачной
подложки native sticky cells. Это отдельные CSS-слои; raw UMD computed CSS
сохранён без подмены значений. Row → rowgroup обновляет scope без замены ячейки,
editor, focus/selection или FormData. Добавление/снятие rowScope меняет тег и
пересоздаёт содержимое ячейки, как source React.

18 случаев UMD, DOM/CSS и controls: [browser](tests/browser/table-row-scope.spec.ts),
[SSR](tests/package/table-row-scope.ssr.test.ts), fixture `?fixture=table-row-scope`.

### Классы и подсветка строк

`rowClassName` принимает строку или `(record, index, indent) => string` и добавляет
классы к основным классам строки и selection. Index начинается с 0 на текущей
странице после filter/sort; indent у поддерживаемых плоских данных равен 0.
Изменение callback или его реактивных зависимостей обновляет классы без замены
строки и её controls.

`rowHoverable` по умолчанию true и управляет встроенной подсветкой при наведении.
В source-теме используются rowHoverBg/rowSelectedHoverBg; native-only темы
сохраняют прежние стили. False снимает подсветку сразу, включая курсор внутри
строки, и сохраняет выбранное состояние, сортировку, focus и keyboard controls.
Проп не блокирует обработку пользовательских событий строки или inputs.

В закреплённом UMD после true → false HoverContext сохраняет подсветку даже
после ухода курсора. Raw [наблюдение](tests/browser/fixtures/ant-design-table-hover-observation.json)
сохранено; native использует CSS guard и очищает paint сразу. Source classes
HoverContext записаны как диагностика, сравнение с native CSS :hover проверяет
цвета. Границы и текущие flat-row случаи покрывают
[browser](tests/browser/table-row-options.spec.ts) и
[SSR](tests/package/table-row-options.ssr.test.ts), fixture `?fixture=table-row-options`.

### Панели title и footer

`title` и `footer` принимают snippets с readonly-массивом записей текущей страницы.
В client mode он уже отфильтрован, отсортирован и ограничен пагинацией; без
пагинации передаётся весь обработанный набор. Server mode передаёт полученный
`dataSource` без повторного разбиения. Для пустого набора передаётся `[]`.

```svelte
<Table dataSource={people} {columns} caption="Участники">
  {#snippet title(currentPage)}На странице: {currentPage.length}{/snippet}
  {#snippet footer(currentPage)}Всего баллов на странице:
    {currentPage.reduce((sum, person) => sum + person.score, 0)}
  {/snippet}
</Table>
```

Панели находятся внутри `.ant-table` до и после scroll container. Caption
сохраняет нативную подпись таблицы. Переданный пустой snippet сохраняет панель
и её отступы; отсутствие snippet убирает панель. Footer использует footerBg и
footerColor, обе панели — padding/font текущего размера и border/radius темы.
Смена страницы, сортировки, фильтра, loading или темы сохраняет содержимое
остающихся snippets и не создаёт дополнительных onChange callbacks.
Source comparison: [browser](tests/browser/table-panels.spec.ts),
[SSR](tests/package/table-panels.ssr.test.ts), fixture `?fixture=table-panels`.

### Компонентная тема Table

`ConfigProvider.theme.components.Table` применяет исходные component tokens и
aliases к ячейкам, границам, сортировке, hover/selection, expand controls и фильтрам.
Поддержаны algorithms, custom cssVar prefix, вложенные provider и обновления
после mount. Local `style` сохраняет приоритет. Смена темы не пересоздаёт строки,
не меняет выбор/сортировку и не сбрасывает draft/focus в раскрытом snippet.

Native default size по-прежнему наследует `componentSize` (`medium` без настройки).
В теме Ant Design ширина selection column берётся из `selectionColumnWidth`,
а expand column — из исходной формулы `controlInteractiveSize + padding × 2`;
явный `expandable.columnWidth` имеет приоритет. Без source-темы обе колонки
сохраняют default 48px. Для fixed cells сохраняется непрозрачная подложка.

Summary, tree indentation и отдельная sticky scrollbar ещё не реализованы:
соответствующие declarations готовятся, но сами по себе не добавляют этот API.
Сравнение с эталоном, границы покрытия и наблюдение root style описаны в
[справочнике темы](docs/reference/theme-context.md#тема-table).

### Закрепление заголовка и колонок

`scroll.y` задаёт максимальную высоту прокручиваемой области вместе с caption
и заголовком. Число означает пиксели, строка — CSS-длину, например `"20rem"` или
`"calc(100vh - 240px)"`. Заголовок остаётся сверху при вертикальной прокрутке;
Pagination находится снаружи этой области. Без scroll.y высота не ограничена
и заголовок прокручивается вместе с таблицей.

`column.fixed` принимает `true` (то же, что `"start"`), `"start"`, `"end"` или
`false`. Start закрепляет колонку у начала строки, end — у конца; в RTL стороны
меняются автоматически. `rowSelection={{ fixed: true }}` закрепляет колонку
выбора у начала строки. По умолчанию колонки не закреплены.

```svelte
<script lang="ts">
  import { Table, type TableColumn } from 'antd-svelte';

  interface Person { key: number; name: string; team: string; tasks: number }
  const people: Person[] = Array.from({ length: 30 }, (_, index) => ({
    key: index, name: `Участник ${index + 1}`, team: 'Разработка', tasks: index
  }));
  const columns: TableColumn<Person>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name', width: 200, fixed: true },
    { key: 'team', title: 'Команда', dataIndex: 'team', width: '24rem' },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', width: 100, fixed: 'end' }
  ];
</script>

<Table dataSource={people} {columns} caption="Участники"
  rowSelection={{ fixed: true }} scroll={{ x: 1000, y: 320 }} pagination={false} />
```

Несколько колонок с одной стороны получают смещения по фактической ширине
ячеек, включая закреплённую колонку выбора. Ширина пересчитывается при resize,
изменении содержимого и состава колонок. Можно использовать числовые и CSS-ширины;
для предсказуемого макета задавайте width и scroll.x. Если суммарная ширина
закреплённых колонок не меньше ширины области, горизонтальное закрепление
временно отключается. Все колонки доступны через прокрутку, заголовок остаётся
закреплённым. При расширении области закрепление восстанавливается.

Используется одна нативная таблица с CSS sticky. Порядок фокуса и snippets
сохраняется; отступы прокрутки учитывают закреплённые области. Фильтры используют
верхний слой popover и обновляют положение при прокрутке и изменении ширин.
Закреплённые ячейки имеют непрозрачный фон с учётом темы, сортировки и выбора.
ResizeObserver отключается при изменении конфигурации и unmount.

SSR сохраняет полную разметку, данные и CSS-закрепление заголовка. Горизонтальное
закрепление активируется после измерения ширин в браузере; до гидратации
колонки доступны обычной прокруткой. Изменения layout не вызывают onChange или
onSelectionChange. Фильтрация, сортировка, выбор и пагинация сохраняют поведение
в обоих режимах данных. В галерее `/ant-design` переключатель находится в примере
Table с API.

### Фильтры колонок

В клиентском режиме в колонке задаются плоский список `filters: [{ text, value }]` и предикат
`onFilter(value, record)`. Значения — string, number или boolean; числовой `0`
и `false` сохраняют тип. Несколько выбранных значений одной колонки объединяются
через OR, фильтры разных колонок — через AND.

```svelte
<script lang="ts">
  import { Table, type TableColumn, type TableFilters } from 'antd-svelte';

  interface Person { key: number; name: string; active: boolean }

  const people: Person[] = [
    { key: 0, name: 'Анна', active: true },
    { key: 1, name: 'Борис', active: false }
  ];
  const columns: TableColumn<Person>[] = [
    { key: 'name', title: 'Имя', dataIndex: 'name' },
    {
      key: 'active', title: 'Статус', dataIndex: 'active', filterMultiple: false,
      filters: [{ text: 'Активен', value: true }, { text: 'Приостановлен', value: false }],
      onFilter: (value, person) => person.active === value
    }
  ];
  let filters = $state<TableFilters>({});
</script>

<Table dataSource={people} {columns} bind:filters caption="Участники" />
```

`filters` таблицы — объект, где ключ соответствует `column.key`, а значение
содержит массив выбранных значений. Для отдельной таблицы доступен `defaultFilters`,
который читается один раз; при привязке задавайте начальное состояние у владельца.
`filterMultiple` по умолчанию равен true и использует Checkbox; false включает
одиночный выбор нативными radio.

Пункты меню меняют черновик. «Применить» подтверждает его и закрывает меню;
«Сбросить» очищает черновик, после чего нужно нажать «Применить». Escape,
нажатие снаружи и уход фокуса отменяют неподтверждённые изменения. Повторное
открытие начинает с применённого состояния. Изменение применённых значений колонки,
вариантов, режима выбора, disabled/loading или удаление колонки закрывают
устаревшее меню.

Пользовательское применение изменившегося фильтра задаёт `current=1` и вызывает
один `onChange` с `action='filter'`. Неизменившийся набор значений не вызывает
callback и не сбрасывает страницу. Если настроены фильтруемые колонки,
`onChange` также получает `filters` с нормализованными активными критериями;
без таких колонок формат прежних событий сохраняется. В типе TableChange
поле filters опционально. В клиентском режиме `currentDataSource` содержит отфильтрованный и
отсортированный набор до пагинации, pagination.total — его длину.

Внешние изменения filters, dataSource и columns не вызывают callbacks и не
переписывают страницу владельца. Дубликаты значений удаляются; неизвестные
варианты, удалённые колонки и колонки без списка/предиката в клиентском режиме игнорируются при
отображении. В одиночном режиме используется первое допустимое значение.
Состояние владельца сохраняется, поэтому возвращённая колонка может снова
применить свой фильтр. Выбранные строки сохраняют ключи при скрытии фильтром;
«выбрать всё» затрагивает только доступные строки видимой страницы.

Меню использует нативный popover поверх прокручиваемой таблицы. Tab перемещает
фокус между controls, Space переключает Checkbox, стрелки меняют radio,
Enter на пункте подтверждает фильтр, Escape закрывает меню с возвратом к кнопке.
Меню остаётся в границах viewport и наследует тему, RTL и `locale.table`:
`filterTitle`, `filterApply`, `filterReset`.

### Серверный режим

`mode="server"` показывает переданную страницу `dataSource` целиком и в исходном
порядке. Table не фильтрует, не сортирует и не разрезает её повторно, даже если
переданы локальные `sorter`/`onFilter` или число строк отличается от pageSize.
Передавайте `total` из ответа API: он определяет диапазон Pagination. Если total
не указан, используется длина dataSource. Его нормализация совпадает с Pagination.
`pagination={false}` скрывает навигацию и сохраняет все переданные строки.

Для удалённой сортировки задавайте `column.sorter: true`; для фильтра достаточно
`column.filters` без `onFilter`. Значение `sorter: true` используется только в
серверном режиме; компаратор поддерживается в обоих режимах, но исполняется только
в клиентском. Правила нормализации фильтров, одиночного выбора и цикл сортировки
сохраняются. Сортировка сохраняет страницу, применение изменившегося фильтра
задаёт страницу 1.

`onChange` получает текущие `pagination`, `sorter`, `filters` и причину действия.
В серверном режиме `currentDataSource` содержит только переданную страницу,
а `pagination.total` — внешний total. Строки остаются прежними до замены
dataSource владельцем. Внешние обновления props не вызывают callback и не
переписывают состояние владельца, включая current при уменьшении total.
Владелец должен запросить допустимую страницу, если текущая больше нового
диапазона; Table сам запросов не выполняет.

`selectedRowKeys` сохраняет ключи между заменами страниц. `onSelectionChange`
передаёт все выбранные ключи, но records содержит только выбранные записи,
присутствующие в текущем dataSource. Кэш записей других страниц отсутствует.
Выбор всех действует на доступные строки загруженной страницы.

В приложении [пример удалённой таблицы](https://woodger.org/ant-design#server-table)
показывает полную связку. [Модель загрузки](https://woodger.org/ant-design#server-table)
принадлежит presentation и не входит в пакет UI. Её loader получает
`{ current, pageSize, sorter, filters }` и `AbortSignal`, возвращает
`Promise<{ rows, total }>`. Модель отменяет предыдущий запрос и игнорирует его
поздний ответ, даже если источник не поддерживает отмену. Во время загрузки строки
очищаются; ошибка доступна отдельно, retry повторяет последний запрос. При
уменьшении total модель запрашивает исправленную страницу перед публикацией строк.
На unmount вызывается dispose для отмены и блокировки поздних обновлений.

Минимальное подключение модели в этом приложении:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Table, type TableColumn } from 'antd-svelte';
  import { createRemoteTable } from '$lib/presentation/ant-design/remote-table.model.svelte';
  import { createMemberSource, type RemoteMember } from '$lib/presentation/ant-design/remote-members';

  const remote = createRemoteTable(createMemberSource().load);
  const columns: TableColumn<RemoteMember>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name', sorter: true },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', sorter: true }
  ];
  onMount(() => { void remote.load(); return remote.dispose; });
</script>

{#if remote.error}<p role="alert">{remote.error}</p><Button onclick={remote.retry}>Повторить</Button>{/if}
<Table mode="server" {columns} dataSource={remote.rows} total={remote.total}
  bind:current={remote.current} bind:pageSize={remote.pageSize}
  bind:sorter={remote.sorter} bind:filters={remote.filters}
  loading={remote.loading} onChange={remote.change} caption="Удалённые участники" />
```

Источник примера имитирует API в памяти с задержкой и управляемой ошибкой;
реального endpoint в проекте нет. Для своего API замените loader, передавайте
signal в fetch и возвращайте строки страницы вместе с общим количеством.
В примере загрузка начинается на onMount; SSR отображает пустую таблицу без запросов.

## Темы и локализация

ConfigProvider принимает `theme={{ mode, primary, compact }}`, где `mode` равен
`light` или `dark`, а `primary` — `blue`, `purple` или `green`.
`componentSize` равен `small`, `medium` или `large`. Обычный размер по умолчанию — `medium`;
устаревшие значения `middle` и `size="default"` удалены.
[Замеры исходника](docs/reference/current-size-observation.md) объясняют границы сравнения.
 Вложенный провайдер наследует
неуказанные настройки родителя. `componentDisabled` можно переопределить на
отдельном control.

ConfigProvider.variant и Form.variant задают общее оформление полей, Card и
внутренних controls Pagination. Локальные props сохраняют приоритет;
[общий справочник](./docs/reference/control-variants.md) описывает fallback Input,
вложенные контексты и component config.

Тёмная тема и компактный режим реализованы локальными CSS-переопределениями.
Spacing использует size map 6.6.8: compact size/SM=8, XS/XXS=4, LG/MD=16,
MS=12, XL=32, XXL=48px с padding/margin/content aliases. Каждый provider
разрешает aliases в собственном scope; явный compact=false восстанавливает
обычные интервалы, inline CSS variables сохраняют приоритет. Проверки геометрии
Card/Flex/Divider и вложенных provider — `tests/browser/theme.spec.ts`, `?fixture=theme`.

`compact: true` согласует fontSize/lineHeight/fontHeight и высоты controls с
compactAlgorithm, а Button/Input/TextArea/InputNumber получают рассчитанные
font/padding metrics при SSR. Для Input, Select, InputNumber и Button medium=28px,
large=35px. В small первые три имеют минимум 22px из-за строки и рамок,
Button — 21px, как в React 6.6.8. Native цвета сохраняются; пустой `token: {}`
для корректной геометрии не требуется. Браузерная сверка —
[compact-theme](./tests/browser/compact-theme.spec.ts), `?fixture=compact-theme`.

ConfigProvider также принимает source token/algorithm, наследование и настройки
hash/CSS variables. `theme.useToken()` возвращает реактивный объект с текущими
GlobalToken, Theme, hashId и transformed CSS-variable token. Глобальные переменные
передаются компонентам уже при SSR; native темы сохраняют прежние цвета,
а compact metrics описаны выше. Компонентные overrides подключены, в частности, к Button,
Input/TextArea (включая Password/Search/OTP), InputNumber, Space/SpaceAddon, Layout,
Radio/RadioButton/RadioGroup, Checkbox/CheckboxGroup, Switch, Avatar/AvatarGroup и Badge;
полное покрытие CSS-потребителей ещё переносится. Примеры и точная граница —
[в справочнике контекста темы](./docs/reference/theme-context.md).

ConfigProvider.wave управляет эффектом Button, Checkbox, Radio/RadioButton,
Switch, интерактивного Tag и Steps. Доступны disabled, showEffect с полным
GlobalToken и пять типов trigger. Настройки наследуются; явный record заменяет
родительский целиком. Targets, timing и Svelte boundaries описаны
[в справочнике Wave](./docs/reference/wave.md).

ConfigProvider.getPopupContainer задаёт `(trigger?: HTMLElement) => HTMLElement | ShadowRoot`.
Вложенный provider наследует функцию, когда его prop отсутствует или равен undefined;
theme.inherit=false не сбрасывает эту настройку. Она подключена к Tabs, ColorPicker,
Tooltip, Popover, Popconfirm, Dropdown, Slider, Tooltip внутри Typography,
Select, AutoComplete, TreeSelect, Cascader, Menu, Modal, Drawer, DatePicker, RangePicker, TimePicker
и TimeRangePicker;
остальные потребители исходного API ещё требуют переноса. Tour и Mentions используют
только собственный getPopupContainer, как Ant Design 6.6.8.
Функция вызывается только в браузере. Без выбранной функции сохраняется прежнее
native размещение компонента. Для ShadowRoot стили размещает потребитель;
стили document автоматически в него не переходят. Обновление функции с тем же
DOM-контейнером сохраняет popup, его state, фокус и выделение текста. Проверки —
[popup-container](./tests/browser/popup-container.spec.ts) и `?fixture=popup-container`;
30 сценариев наследования и приоритетов сверены с официальным UMD.
Для общих overlay-компонентов добавлены ещё 52 эталона:
[overlay-container](./tests/browser/overlay-container.spec.ts), `?fixture=overlay-container`.
В этой сверке default обозначает исходное native размещение без пользовательского
контейнера; DOM не переносится в body автоматически. ShadowRoot проверяется с
собственными стилями потребителя. При закрытии сохраняется прежний native lifecycle.
Select/AutoComplete добавляют 32 эталона в
[select-container](./tests/browser/select-container.spec.ts), `?fixture=select-container`.
TreeSelect/Cascader добавляют 40 эталонов в
[choice-container](./tests/browser/choice-container.spec.ts), `?fixture=choice-container`.

Статические defaultSeed, default/dark/compact algorithms и getDesignToken
работают без context и DOM. Их source-округления, overrides и ограничения описаны
[в справочнике design tokens](./docs/reference/design-tokens.md).

По умолчанию используется `ruRU`; `enUS` также экспортируется. `locale` принимает
частичное переопределение подписей кнопок и служебных сообщений. Вложенная группа
`locale.pagination`, `locale.table` и `locale.inputNumber` также объединяются с настройками родителя по отдельным
подписям. Тексты правил валидации задаются в `message` или возвращаются из validator.

## Формы и валидация

Создавайте модель в scope компонента или presentation model, чтобы разные формы
и SSR-запросы не разделяли состояние:

```svelte
<script lang="ts">
  import { Button, ConfigProvider, Form, FormItem, Input, createForm } from 'antd-svelte';

  const form = createForm({
    initialValues: { email: '' },
    rules: {
      email: [
        { required: true, message: 'Введите email.' },
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Проверьте email.' }
      ]
    }
  });
</script>

<ConfigProvider>
  <Form {form} onFinish={(values) => console.log(values.email)}>
    <FormItem name="email" label="Email">
      <Input
        type="email"
        value={form.values.email}
        onValueChange={(value) => form.setFieldValue('email', value)}
      />
    </FormItem>
    <Button type="primary" htmlType="submit" loading={form.isSubmitting}>Отправить</Button>
    <Button htmlType="reset">Сбросить</Button>
  </Form>
</ConfigProvider>
```

FormItem предоставляет label, status, required, description и обработчик blur.
Расположение подписи наследуется из `Form.layout`: `vertical` размещает её
над control, `horizontal` — рядом с ним на широком экране, `inline` располагает
поля в строке с переносом по доступной ширине. Прежний default остаётся vertical.
Локальный `FormItem.layout` (`horizontal` или `vertical`) имеет приоритет над Form;
undefined возвращает наследование. Переключение layout не пересоздаёт controls,
не меняет values/metadata и сохраняет фокус и выделение.

Form и FormItem принимают rootClassName; FormItem также принимает строковый style.
ConfigProvider.form.class/style оформляют native корень Form: классы config,
local class и rootClassName накапливаются, inline CSS идёт после component theme
в порядке config.style → local style. FormItem.style применяется к своему корню
после компонентных токенов. Component=false сохраняет контекст без native wrapper.
Undefined record наследуется, {} сбрасывает config; настройки и соседние поля
не теряют значения, metadata, фокус и выделение при обновлениях оформления.
Проверки: [12 эталонов](./tests/browser/fixtures/ant-design-form-root-reference.json),
[браузер](./tests/browser/form-root.spec.ts),
[публичные типы и SSR](./tests/package/form-root.ssr.test.ts), `?fixture=form-root`.
В том же артефакте записан неработающий ConfigProvider.form.variant исходника 6.6.8.

`Form.classNames/styles` и одноимённые поля ConfigProvider.form принимают объект
или callback для slots root, label, content, help, helpItem и extra. Root оформляет
сам Form, остальные slots — подпись, content и пояснения FormItem/ErrorList.
Классы config и local накапливаются. CSS root применяется в порядке component theme,
config.styles.root, config.style, local.styles.root, local style; остальные slots
объединяют config.styles и local.styles. CSS задаётся строками.

Callback получает native Form props с разрешёнными layout, disabled и requiredMark;
colon/labelAlign/labelWrap объединены с config и могут остаться undefined до
внутренних CSS defaults. Возврат undefined сохраняет предыдущий слой.
Вложенный Item наследует slots, вложенный Form применяет свои props/config.
Component=false сохраняет slots полей без DOM root. Обновления сохраняют controls,
фокус/выделение и metadata; прежний приоритет help и доступные сообщения сохранены.
Классы error/warning относятся к сообщениям, контейнер сохраняет role alert/status.

FormErrorList в FormList получает help/helpItem. Source без обёртки FormItem
наследует обычный цвет формы; это записано отдельно, native цвета standalone
ErrorList сохранены. Проверки: [16 эталонов и наблюдение](./tests/browser/fixtures/ant-design-form-semantic-reference.json),
[браузер](./tests/browser/form-semantic.spec.ts),
[публичные типы и SSR](./tests/package/form-semantic.ssr.test.ts), `?fixture=form-semantic`.

`Form.size` задаёт small, medium или large для формы и вложенных компонентов.
Undefined наследует ближайший Form/ConfigProvider; локальный размер control
и размер SpaceCompact сохраняют свой приоритет. Настройки соседей не меняются.
Small/large также задают исходную высоту подписей и control containers; component=false
передаёт размер без wrapper. Semantic callbacks получают разрешённый size:
undefined без явной настройки, medium при явном medium. Divider сохраняет различие
между размером по умолчанию и medium. Динамическая смена сохраняет control,
focus/selection, metadata и native FormData.
Сверка: [25 эталонов](./tests/browser/fixtures/ant-design-form-size-reference.json),
[браузер](./tests/browser/form-size.spec.ts),
[публичные типы и SSR](./tests/package/form-size.ssr.test.ts), `?fixture=form-size`.

`Form.disabled` передаётся всем дочерним Ant Design controls, включая компоненты
без FormItem. Undefined наследует ConfigProvider или внешний Form; false разрешает
controls поверх внешнего disabled=true. Вложенный ConfigProvider.componentDisabled
переопределяет Form для своего поддерева; локальный disabled компонента приоритетнее.
Переключение сохраняет DOM, значения, выделение текста и выбранные options.
Прежняя блокировка связанного control на время async onFinish сохраняется отдельно;
явный disabled=false компонента по-прежнему разрешает его.
Сверка: [12 эталонов](./tests/browser/fixtures/ant-design-form-disabled-reference.json),
[браузер](./tests/browser/form-disabled.spec.ts),
[публичный пакет и SSR](./tests/package/form-disabled.ssr.test.ts), `?fixture=form-disabled`.

`FormItem.validateStatus` принимает success, warning, error, validating и ''.
Явное значение меняет оформление поверх metadata; пустая строка отключает
автоматический визуальный статус. Без prop приоритет такой: текущая validation,
errors, warnings, затем success для touched-поля. Pristine-поле остаётся без статуса.
Metadata берётся по точному имени, без touched потомков. Прежние triggers/touched
модели сохранены. Настройка работает и у FormItem без name, без регистрации поля.

Статус не запускает validation и не удаляет errors/warnings. Сохранённая ошибка
остаётся доступной через aria-invalid и description даже при success/validating/'';
локальный status control сохраняет приоритет оформления. Input/Select по-прежнему
выставляют aria-invalid при visual error без ошибок модели; source его не задаёт.
Transfer получает ошибку и доступное описание на корне, как официальный компонент.
Обновления сохраняют DOM, draft, focus/selection; reset очищает автоматический статус.
HasFeedback/feedbackIcons пока не перенесены.
Сверка: [29 исходных состояний](./tests/browser/fixtures/ant-design-form-status-reference.json),
[браузер и доступность controls](./tests/browser/form-status.spec.ts),
[публичный пакет и SSR](./tests/package/form-status.ssr.test.ts), `?fixture=form-status`.

`useFormItemStatus()` — Svelte-аналог Form.Item.useStatus для собственных controls.
Вызывайте его при инициализации дочернего компонента FormItem и читайте поля
возвращённого объекта: status, errors и warnings обновляются через getters.
Destructuring сохраняет snapshot. Массивы сообщений доступны только для чтения.

```svelte
<script lang="ts">
  import { useFormItemStatus } from 'antd-svelte';
  const field = useFormItemStatus();
</script>

{#each field.errors as error}<p>{error}</p>{/each}
```

Pristine FormItem возвращает status='', вне FormItem status равен undefined.
Вложенный Item читает собственное состояние. Label/extra читают внешний контекст,
поскольку status provider окружает только controls. Вложенный Form сбрасывает
status в undefined и сохраняет errors/warnings ближайшего внешнего Item, как source.
InputOTP учитывает свой status, сохраняя родительские сообщения. Hook не меняет
value binding, ref или фокус control и работает при SSR.
Сверка: [14 исходных состояний](./tests/browser/fixtures/ant-design-form-use-status-reference.json),
[браузер](./tests/browser/form-use-status.spec.ts),
[публичные типы и SSR](./tests/package/form-use-status.ssr.test.ts), `?fixture=form-use-status`.

`FormItem.noStyle` убирает layout, label, help и extra, сохраняя field binding,
правила, ref и reset. Ошибки и предупреждения передаются ближайшему FormItem
с layout; help=false отключает эту передачу. Hidden сохраняет собственную
скрытую обёртку и при noStyle=true. Без оформленного родителя сообщения остаются
в metadata и useFormItemStatus, отдельного списка в DOM нет.

Родитель показывает собственные сообщения, затем сообщения noStyle-полей в порядке
первых metadata events. Одинаковые имена объединяются; строки FormList сохраняют
свои сообщения при перестановке. Статус и useFormItemStatus родителя описывают
только его собственное поле, как upstream. NoStyle наследует visual status родителя,
если у него нет своего статуса, errors/warnings, pending validation или touched.
Reset пересоздаёт control; прежние native focus/selection contracts сохраняются.

Две ошибки 6.6.8 не повторены: описание noStyle-control связано с реальным списком
родителя, а переключение noStyle/help и удаление поля сразу обновляют этот список.
Игнорируемые собственные help/extra не оставляют висячих aria-describedby.
Исходные наблюдения сохранены в
[20 raw-сценариях и transitions](./tests/browser/fixtures/ant-design-form-no-style-reference.json).
Проверки: [сбор сообщений](./src/lib/form-no-style.engine.test.ts),
[браузер и lifecycle](./tests/browser/form-no-style.spec.ts),
[публичный пакет и SSR](./tests/package/form-no-style.ssr.test.ts), `?fixture=form-no-style`.

`Form.colon`, `labelAlign` и `labelWrap` наследуют defaults из `ConfigProvider.form`.
При отсутствии настройки colon включён, labelAlign равен right, labelWrap — false.
Локальные FormItem.colon/labelAlign имеют приоритет над Form; true включает colon
и поверх Form.colon=false. Вертикальный layout сохраняет скрытый CSS colon.
Если colon добавляется, последний `:` или `：` с пробелами удаляется из текста
подписи, а исходный title сохраняется. При colon=false текст владельца остаётся целиком.
LabelWrap включает перенос в доступной ширине подписи; labelAlign использует
исходные логические start/end, включая RTL.

`FormConfig` содержит эти поля и requiredMark. Undefined record наследуется от внешнего
ConfigProvider, любой объект, включая {}, заменяет его целиком. Ближайший Form
применяет собственные props и config; вложенный Form сбрасывает настройки внешнего
Form к своим defaults. Изменения сохраняют control, focus/selection и metadata.
Сверка: [32 эталона](./tests/browser/fixtures/ant-design-form-labels-reference.json),
[браузер](./tests/browser/form-labels.spec.ts),
[публичные типы и SSR](./tests/package/form-labels.ssr.test.ts), `?fixture=form-labels`.

`Form.labelCol`/`wrapperCol` и одноимённые props FormItem принимают настройки Col:
span/offset/order/push/pull/flex, responsive размеры, class и строковый style.
Объект FormItem заменяет соответствующий объект Form целиком; {} сбрасывает его.
Внутренние Row/Col используют существующий Grid. Колонки сбрасываются для FormItem
внутри controls, остальные настройки и модель остаются реактивными. Локальные
колонки вложенного Item применяются заново; вложенный Form использует свои defaults.
Переключения сохраняют control, values/metadata и focus/selection.
Label принимает RenderEmptyContent; выравнивание null описано ниже.
Проверены приоритеты, сбросы, стили, скрытие span=0, RTL, три layouts и границы
576/768/992px: [42 эталона](./tests/browser/fixtures/ant-design-form-columns-reference.json),
[браузер](./tests/browser/form-columns.spec.ts),
[публичные типы и SSR](./tests/package/form-columns.ssr.test.ts), `?fixture=form-columns`.

`FormItem.label` можно опустить. Undefined, false и пустая строка не создают label;
строка из пробелов сохраняет контейнер, как upstream. Null также убирает label,
но добавляет wrapper offset из Form.labelCol для span меньше 24, включая 0.
Явные local labelCol/wrapperCol, даже {}, отключают этот расчёт. Существующий
offset, включая 0 и undefined, не заменяется; responsive offsets независимы.
Если видимой подписи нет, задайте control aria-label или aria-labelledby.
Вставка и удаление подписи сохраняют input, metadata, value, focus/selection,
native required и validation.

У 6.6.8 есть две ошибки расчёта null-label offset: числовой responsive label span
игнорируется, а числовой wrapper span может потеряться. Они сохранены в
[42 raw-эталонах](./tests/browser/fixtures/ant-design-form-label-presence-reference.json).
В Svelte числовой shorthand сохраняет span/offset и совпадает с эквивалентными
исходными настройками `{ span }`. Проверки: [engine](./src/lib/form-columns.engine.test.ts),
[браузер](./tests/browser/form-label-presence.spec.ts),
[публичные типы и SSR](./tests/package/form-label-presence.ssr.test.ts),
`?fixture=form-label-presence`.

Label также принимает числа, вложенные массивы и Svelte snippets. Числовой 0
отображается; true, пустой массив и пустой opaque snippet сохраняют контейнер.
Colon удаляется только из строкового label, title также задаётся только для строки.
RequiredMark snippet получает исходный content после обработки colon и required;
существующие строковые snippets остаются типосовместимыми для строковых label.
При новых типах содержимого renderer принимает RenderEmptyContent.
ResetFields пересоздаёт content подписи вместе с выбранным control, сбрасывая
локальное состояние вложенных компонентов, как upstream.

RadioGroup, CheckboxGroup, InputOTP, Slider и стандартный trigger ColorPicker
получают доступное имя из rich label через aria-labelledby. Snippet обновляет имя без замены
controls; явные aria-label/aria-labelledby и handle labels сохраняют приоритет.
Сверка: [42 эталона и reset](./tests/browser/fixtures/ant-design-form-rich-labels-reference.json),
[браузер](./tests/browser/form-rich-labels.spec.ts),
[публичные типы и SSR](./tests/package/form-rich-labels.ssr.test.ts), `?fixture=form-rich-labels`.

`Form.requiredMark` наследует ConfigProvider.form.requiredMark, затем true.
False скрывает звёздочку, 'optional' помечает необязательные поля, Svelte snippet
получает `(label, { required })` и целиком заменяет содержимое label. Label передаётся
после обработки colon; title и native association сохраняются. Это только
оформление: required controls, правила validation и FormData не меняются.
Настройки ближайшего Form сбрасывают внешний Form, сохраняя provider defaults.
Текст optional берётся из Locale.Form.optional: ruRU — «(необязательно)»,
enUS — «(optional)». Эта группа заменяется целиком вложенным locale.Form;
пустая строка и отсутствующий optional используют английский fallback, как в upstream.
Сверка: [18 эталонов](./tests/browser/fixtures/ant-design-form-required-mark-reference.json),
[браузер](./tests/browser/form-required-mark.spec.ts),
[публичные типы и SSR](./tests/package/form-required-mark.ssr.test.ts),
`?fixture=form-required-mark`.

`FormItem.tooltip` принимает текст, число, массив, Svelte snippet или Tooltip options.
Form.tooltip и ConfigProvider.form.tooltip задают defaults; сами по себе они не
показывают значок. Options объединяются по свойствам: config → Form → Item.
Пустой объект Item включает унаследованный title; undefined/null/false/'' убирают
значок. Вложенный Form сбрасывает внешние локальные options к props/config.
Icon задаётся snippet; без него используется children, затем QuestionCircleOutlined.
При custom requiredMark renderer получает составную подпись вместе с подсказкой.

Сохранены исходные отступы, hover/click settings и tabindex=-1 значка: Tab ведёт к
control, клик по значку не фокусирует поле. Popup по умолчанию находится в body,
getPopupContainer сохраняет local/global приоритет. Обновления сохраняют control,
focus/selection, metadata и native FormData; общие native Tooltip contracts сохраняются.
Две неточности 6.6.8 не повторены: массивы выводятся как содержимое, а декоративный
SVG не добавляет «question-circle» к доступному имени поля. Raw source и эквивалентный
title-array сохранены в [31 эталоне и наблюдениях](./tests/browser/fixtures/ant-design-form-tooltip-reference.json).
Для RTL матрица использует одинаковый DOM dir; raw замер только с ConfigProvider.direction
также сохранён. SVG взят из закреплённого UMD, [лицензия Ant Design Icons](./src/lib/vendor/LICENSE.ant-design-icons).
Проверки: [нормализация](./src/lib/form-tooltip.engine.test.ts),
[браузер](./tests/browser/form-tooltip.spec.ts),
[публичные типы и SSR](./tests/package/form-tooltip.ssr.test.ts), `?fixture=form-tooltip`.

Значением владеет модель: обновляйте его явно через `setFieldValue` или
`setFieldsValue`. `FormItem.name` принимает буквальный string/number либо массив
сегментов: `['users', 0, 'name']`. Строка `"user.name"` остаётся отдельным ключом.
Поля могут отсутствовать в initialValues; числовой сегмент отсутствующего
контейнера создаёт массив, строковый `"0"` — объект. Native name вложенного control
собирается через `_`; при необходимости задайте ему собственный name.
Состояние `values` и ошибки предназначены для чтения.
Модель можно хранить в `$state` и заменять во время жизни Form; регистрация полей
переключается на новый экземпляр, поздние проверки прежней модели изолированы.

`FormItem` без name служит строкой layout: label, help/extra, колонки и настройки
Form сохраняются, но rules/initialValue не регистрируются в модели. Required управляет отметкой
подписи; required/name/id/ARIA самого control задаёт его владелец. Для связи подписи
используйте FormItem.htmlFor вместе с id control либо его явное доступное имя.
В этом режиме getFieldsValue/getFieldInstance не получают binding строки,
а reset модели сохраняет локальные черновик, DOM, фокус и выделение control.
При переходе между name и его отсутствием control пересоздаётся, как в исходнике;
переход между двумя заданными именами сохраняет прежний native lifecycle.
Согласованные Svelte id/name/FormData и label association именованных полей сохранены.
Сверка: [восемь эталонов и переходы](./tests/browser/fixtures/ant-design-form-nameless-reference.json),
[браузер](./tests/browser/form-nameless.spec.ts),
[публичные типы и SSR](./tests/package/form-nameless.ssr.test.ts), `?fixture=form-nameless`.

`FormItem.initialValue` заполняет отсутствующее значение перед render control,
включая SSR. Значение модели приоритетнее, в том числе null, false, 0 и '';
undefined позволяет применить local default. Поздний mount сохраняет уже записанное
значение. Начальные значения не меняют touched, но участвуют в dirty validation.
Привязка value/onValueChange к модели остаётся явной.

Изменение initialValue не перезаписывает текущий draft. Reset использует текущий prop,
при этом исходное initialValues модели имеет приоритет по точному пути. Plain containers
копируются, Date/Dayjs и другие непрозрачные значения сохраняют identity.
Если несколько bindings задают initialValue одному пути, первый mount заполняет store,
а reset не выбирает между конфликтующими defaults. При перекрывающихся parent/child
путях defaults следуют порядку mount, как source; порядок проекции values/refs сохранён.

В FormList задавайте начальный массив через initialValue списка или initialValues модели.
Локальный initialValue поля списка применяется при создании control, но не восстанавливается
при reset только этого поля. Полный reset списка пересоздаёт строки и применяет defaults
заново. Намеренно пустое значение и пропущенный ключ различаются как в модели.
Сверка: [22 случая и lifecycle](./tests/browser/fixtures/ant-design-form-initial-reference.json),
[браузер](./tests/browser/form-initial.spec.ts),
[модель](./src/lib/form-initial-value.test.ts),
[публичные типы и SSR](./tests/package/form-initial.ssr.test.ts), `?fixture=form-initial`.

`theme.components.Form` настраивает Form и каждый FormItem: цвет и размер подписи,
required mark, высоту, отступы colon и полей, vertical padding/margin.
Поддержаны aliases/algorithms, custom cssVar prefix и вложенные темы. LabelHeight
также задаёт vertical height, пока не передан отдельный verticalLabelHeight.
Внутренний Row сохраняет общий alias scope исходных Row/Col, а собственные Form
tokens наследуются. Локальный style относится к нативному form; значения,
validation, submit/reset, фокус и native attributes сохраняются при смене темы.
Сверка с Ant Design — [form-theme](./tests/browser/form-theme.spec.ts),
`?fixture=form-theme`. Для inline `inlineItemMarginBottom` задаёт нижний отступ,
общий margin — промежуток между полями; compact и нулевые значения поддержаны.
Inline, локальные overrides и мобильный перенос проверены на 36 случаях LTR/RTL
по [эталонным метрикам](./tests/browser/fixtures/ant-design-form-layout-reference.json):
[браузер](./tests/browser/form-layout.spec.ts),
[SSR и публичные props](./tests/package/form-layout.ssr.test.ts), `?fixture=form-layout`.
Component=false по-прежнему передаёт контекст без native form и layout-wrapper;
сам по себе контекст не создаёт flex-контейнер.

`FormItem.extra` задаёт постоянное пояснение, которое показывается вместе с
errors/warnings. Поддержаны строки, числа, массивы и Svelte snippets; 0 сохраняется.
Null/undefined/false/пустая строка убирают пояснение. True, пустой массив и opaque
snippet сохраняют контейнер, как текущая проверка renderability upstream.
Extra получает собственный id и добавляется к aria-describedby после сообщений;
существующие внешние описания встроенного control сохраняются.
Обновление extra или snippet сохраняет input, значение, фокус и выделение.
ResetFields пересоздаёт content extra вместе с label, tooltip и control выбранного
поля. Локальное состояние snippet сбрасывается; соседние поля сохраняют свои
компоненты, значения, фокус и выделение. Выборочный, повторный и полный reset
сверены с [эталоном](./tests/browser/fixtures/ant-design-form-explanation-reset-reference.json):
[браузер](./tests/browser/form-explanation-reset.spec.ts),
[SSR](./tests/package/form-explanation-reset.ssr.test.ts), `?fixture=form-explanation-reset`.
Прежний приоритет help сохранён: errors/warnings заменяют help, extra остаётся.
Четырнадцать случаев сверены с
[upstream](./tests/browser/fixtures/ant-design-form-extra-reference.json):
[браузер](./tests/browser/form-extra.spec.ts),
[SSR](./tests/package/form-extra.ssr.test.ts), `?fixture=form-extra`.

Controls внутри label, extra и tooltip подписи наследуют disabled/size/variant Form,
но не binding текущего поля: id/name, required, status, ARIA ошибок и ref не копируются.
Blur и ввод вспомогательного control не меняют touched/value основного поля;
getFieldInstance возвращает основной control, а FormData не получает лишние значения
под его именем. Явные props вспомогательного control сохраняются.
Сверка: [семь эталонов](./tests/browser/fixtures/ant-design-form-slot-context-reference.json),
[браузер](./tests/browser/form-slot-context.spec.ts),
[SSR](./tests/package/form-slot-context.ssr.test.ts), `?fixture=form-slot-context`.

`FormItem.help` также принимает RenderEmptyContent: числа, вложенные массивы
и Svelte snippets. Undefined/null/false/'' скрывают пояснение; 0 отображается
и входит в aria-describedby. True и пустой массив сохраняют контейнер.
Semantic help/helpItem продолжают оформлять пояснение; reset выбранного поля
пересоздаёт его snippet, а обновление help сохраняет основной control и его фокус.
Controls внутри help изолированы от binding поля, как extra.

Сохранён прежний native приоритет: errors/warnings заменяют help. Source 6.6.8
отдаёт приоритет явно заданному help, включая false; raw наблюдения сохранены.
Help={0} входит в описание поля, как строковый '0'. Source 6.6.8 пропускает
связь для числового нуля; этот дефект не повторяется в Svelte.
Сверка: [15 эталонов и reset](./tests/browser/fixtures/ant-design-form-help-reference.json),
[браузер](./tests/browser/form-help.spec.ts),
[публичные типы и SSR](./tests/package/form-help.ssr.test.ts), `?fixture=form-help`.

`FormItem.hidden` скрывает весь блок поля через исходный CSS, сохраняя его control,
ref, значение, metadata и локальное состояние children. По умолчанию false.
Скрытое поле продолжает участвовать в validation, submit и native FormData;
ошибка required может блокировать отправку. Его controls исключаются из Tab
и accessibility tree; после показа доступное описание ошибки восстанавливается.
Обычное скрытие сохраняет DOM, а reset по-прежнему пересоздаёт children и ref.
Проверки: [эталон upstream](./tests/browser/fixtures/ant-design-form-hidden-reference.json),
[браузер](./tests/browser/form-hidden.spec.ts),
[SSR](./tests/package/form-hidden.ssr.test.ts), `?fixture=form-hidden`.

Модель хранит скаляры, вложенные plain objects, массивы и экземпляры классов.
`getFieldValue(name)` читает значение пути; `setFieldValue(name, value)` заменяет
его целиком. `setFieldsValue` рекурсивно объединяет plain objects и заменяет
массивы. `FormItem.rules` задаёт правила вложенного поля; при отсутствии локальных
rules используются прежние правила createForm верхнего уровня.
Правила модели действуют и без FormItem в DOM; локальные rules удаляются вместе
с их полем, а значение по-прежнему сохраняется.
Ошибки и touched модельных правил остаются у имени поля при переключении name.
В FormList локальная metadata следует за key строки.

`isFieldTouched(name)` учитывает также потомков пути, как upstream; строка с
точкой и числовой/строковый сегменты различаются. Пустой путь [] проверяет,
есть ли touched-поле в модели. Падение Ant Design 6.6.8 при таком запросе
сохранено в [наблюдении](./tests/browser/fixtures/ant-design-form-touched-paths-observation.json)
и не повторяется в Svelte. Запрос не создаёт поля и не меняет metadata.

`isFieldsTouched()` проверяет, есть ли touched-поле. `isFieldsTouched(true)`
проверяет все bindings; корни FormList сами не блокируют этот вариант проверки.
Список имён задаёт группы по префиксам: `isFieldsTouched(names, true)` требует
хотя бы одного touched-поля в каждой группе, как upstream. Это не проверка всех
потомков группы. Например, `isFieldsTouched([['user']], true)` станет true после
взаимодействия с одним полем внутри user; выбор обоих leaf paths требует оба.

В общий набор входят FormItem/FormList, поля с правилами createForm и явно
touched-поля модели. Корни initialValues без UI и правил не добавляют controls
в проверку allTouched. Прежние правила blur/submit и модели без UI сохраняются.
Пустой список имён возвращает false, а с allTouched=true — true. Вызов
`isFieldsTouched(undefined, true)` равен `isFieldsTouched(true)`; `[[]]`
выбирает модель как одну группу. Падения этих перегрузок Ant Design 6.6.8
сохранены в [raw reference](./tests/browser/fixtures/ant-design-form-aggregate-touched-observation.json).

`isFieldsValidating(names?)` проверяет, выполняется ли обычная validation хотя бы
одного выбранного поля. Без списка учитываются все поля модели; имена совпадают
точно, без выбора потомков. Пустой список не выбирает поля. ValidateOnly не
добавляет validating и не прерывает видимую проверку; поле без правил не получает
этот флаг. `isFieldValidating(name)` использует ту же проверку одного имени.
Группы, списки, reset/unmount и параллельные запросы сверены
[в браузере](./tests/browser/form-aggregate.spec.ts),
[через публичный пакет](./tests/package/form-aggregate.ssr.test.ts) и
[в модели](./src/lib/form-aggregate.test.ts).

`getFieldsValue()` возвращает проекцию известных bindings, а `getFieldsValue(true)`
без фильтра — весь текущий store, включая значения без UI. Список путей выбирает
соответствующие bindings и потомков: `getFieldsValue([['user']])` включает только
известные поля user. Если bindings под этим путём нет, читается само значение
store. Пустой список даёт `{}`, `[[]]` выбирает весь store. Строка с точкой
остаётся буквальным ключом, number/string segments различаются.
Bindings здесь — FormItem/FormList и поля с правилами createForm. Сам touched-флаг
не добавляет значение без binding в проекцию.

Фильтр передаётся вторым аргументом после списка/true либо через `{ filter }`.
Он получает FormFieldMeta с touched, validating, errors, warnings, name и validated;
для явно выбранного пути без binding приходит null. True с фильтром выбирает
bindings, а не все ключи store. Validated становится true после обычной validation
или изменения значения через setFieldsValue; validateOnly его не меняет.
Прежние touched/triggers модели и защита от устаревших результатов сохранены.

Как текущий код 6.6.8, метод проецирует поля строк FormList, затем заполняет
отсутствующий корень списка пустым массивом. Корни не передаются фильтру: даже
`getFieldsValue({ filter: () => false })` вернёт `{ people: [] }` для списка people.
Полный список со значениями без controls доступен через true без фильтра.
Это уточнение к описанию List в документации upstream подтверждено
[неизменённым UMD](./tests/browser/fixtures/ant-design-form-get-fields-value-observation.json).
UI-регистрации ожидают mount; при SSR полный store также читается через true.
Проверки: [браузер](./tests/browser/form-get-fields-value.spec.ts),
[публичный пакет](./tests/package/form-get-fields-value.ssr.test.ts),
[модель](./src/lib/form-get-fields-value.test.ts).

`setFields(entries)` применяет записи по порядку без запуска validation. Можно
передать value, errors, warnings, touched и validating; отсутствующие свойства
сохраняются. Например, для зарегистрированного поля:

```ts
form.setFields([{ name: ['user', 'name'], errors: ['Name is unavailable'], touched: true }]);
```

Пустой массив сообщений или явный undefined очищает errors/warnings. Value с
undefined записывает пустое значение; отсутствие value ничего не записывает.
Значения можно менять без UI, но metadata для пути без binding игнорируется
и не откладывается до будущего mount. Поля с правилами createForm работают также
без UI. Как в upstream, входной validated принимается, но не заменяет вычисляемый
флаг; явный validating=false делает validated=true без запуска правил.

Validation пропускает поля без rules: ручные errors/warnings/validating такого
поля сохраняются и сами по себе не блокируют validateFields/submit. Обычная
проверка поля с rules может заменить временно заданные сообщения; явный
validating заменяет её управление metadata. Для изменённого value сохранена
прежняя защита snapshot: старый validator не заменяет свежие сообщения.
Дефект 6.6.8 с поздней ошибкой для прежнего значения записан
[в raw reference](./tests/browser/fixtures/ant-design-form-set-fields-observation.json).
Там же сохранён undefined touched в metadata upstream; Svelte нормализует
явные undefined touched/validating в false, сохраняя булевый контракт.
Прежние правила setFieldValue/setFieldsValue/touchField и проекция errors остаются.
Проверки: [браузер](./tests/browser/form-set-fields.spec.ts),
[публичный пакет](./tests/package/form-set-fields.ssr.test.ts),
[модель](./src/lib/form-set-fields.test.ts).

Правила включают required, min/max/len, whitespace, pattern и синхронный либо
асинхронный `validator(value, values)`. Для строк min/max/len считают Unicode
code points, для чисел сравнивают значение, для массивов считают элементы.
Пустой массив считается пустым значением; массивы с 0 или false — непустыми.
Pattern проверяет скалярные значения; для проверки содержимого массива
используйте custom validator. Пустые необязательные значения пропускают прежние
встроенные проверки, но передаются в custom validator. Len также проверяет пустой
массив и пробелы в непустой строке; optional null/undefined/'' пропускаются.

`len` задаёт точную длину или число и имеет приоритет над min/max, включая len=0.
Pattern и custom validator продолжают применяться после успешной проверки длины.
Как и у min/max, текущий native API определяет строку, число и массив по значению;
в исходных числовых и массивных эталонах задан соответствующий type.
`whitespace: true` отклоняет непустую строку из одних пробелов, tab или newline,
сохраняя текст в модели. Пустая optional-строка допустима; required сохраняет
прежний native запрет пустых строк, пробелов и массивов. WarningOnly остаётся
неблокирующим. Сверка: [35 исходных сценариев](./tests/browser/fixtures/ant-design-form-constraints-reference.json),
[правила и модель](./src/lib/form-constraints.test.ts),
[браузер](./tests/browser/form-constraints.spec.ts),
[публичный пакет и SSR](./tests/package/form-constraints.ssr.test.ts), `?fixture=form-constraints`.

`ValidationRule.type` поддерживает string, number, integer, float, boolean, array,
object, date, regexp, method, any, enum, email, url, hex, tel и pattern;
union экспортируется как ValidationRuleType.
Явный type включает исходный выбор constraints. String проверяет длину/pattern/whitespace,
числовые типы и array — диапазон/len, date — timestamp после стандартного JS parsing.
Boolean/object/regexp/method/any не применяют range/pattern/whitespace.
RegExp принимает готовое выражение или значение, из которого можно создать RegExp;
object исключает массив, method означает функцию.

У явного string пробелы считаются содержимым, whitespace=true запрещает их отдельно.
У array диапазон проверяет и пустой массив; required запрещает его. Number считает
'' отсутствующим значением, integer/float проверяют его как неверный тип. Any
проверяет только отсутствие null/undefined при required. Custom validator заменяет
встроенные проверки явного type и получает значение после transform, до date/number
normalization. Возвращённые и преобразованные значения не заменяют store.
Правила без type сохраняют прежние native empty values и порядок constraints/validator.
Сообщения по умолчанию сохраняют native русский текст и первую ошибку правила;
общие шаблоны настраиваются через validateMessages.

Две классификации 6.6.8 исправлены: integer принимает 1e21, float его отклоняет;
source использует parseInt и ошибается на scientific notation. BigInt/Symbol
отклоняются числовыми/date правилами без исходных console/page errors.
Raw classifications и diagnostics сохранены в
[366 исходных случаях](./tests/browser/fixtures/ant-design-form-rule-types-reference.json).
Проверки: [правила и модель](./src/lib/form-rule-types.test.ts),
[браузер](./tests/browser/form-rule-types.spec.ts),
[публичный пакет и SSR](./tests/package/form-rule-types.ssr.test.ts), `?fixture=form-rule-types`.
Логика адаптирована из async-validator 6.0.0;
[MIT-лицензия](./src/lib/vendor/LICENSE.rc-async-validator) включена в пакет.

`type='enum'` проверяет enum через строгое сравнение без преобразования типов:
0 отличается от '0', NaN не совпадает с NaN. Массив выбора может быть readonly;
без type='enum' это свойство не добавляет constraint. Optional null/undefined
пропускаются, пустая строка проверяется как обычный элемент списка.

Pattern принимает строку или RegExp. У type='pattern' проверяется только required
и выражение; у string и implicit rules сохраняется прежний порядок constraints.
Переданный RegExp не меняет lastIndex, включая global flag. Ошибочная строка
выражения становится validation error без исходных console/page errors.

Email/hex/tel/url проверяют тип и формат, игнорируя range/pattern/whitespace.
Пределы source сохранены: email — 320 символов, tel — 32, URL — 2048; hex — 3 или
6 цифр с необязательным #. URL сохраняет схемы с //, адреса вида //example.com и www.example.com.
Четыре ошибки source исправлены: IPv6 требует скобки, порт допускает одну цифру
и проверяется стандартным URL parser. Адрес не нормализуется в store.
Raw source cases и diagnostics сохранены в
[188 исходных случаях](./tests/browser/fixtures/ant-design-form-rule-formats-reference.json).
Проверки: [правила](./src/lib/form-rule-formats.test.ts),
[браузер](./tests/browser/form-rule-formats.spec.ts),
[публичный пакет и SSR](./tests/package/form-rule-formats.ssr.test.ts), `?fixture=form-rule-formats`.
У rc-form 1.8.6 декларации уже runtime: type union содержит 15 значений без any/pattern,
pattern объявлен как RegExp. Документация Form отсылает к дополнительным типам
async-validator; неизменённый UMD принимает any/pattern и строковый pattern.
Svelte публикует проверенный runtime API; эта разница исходных типов записана в reference.

`FormRule` принимает объект ValidationRule или ValidationRuleFactory — чистую
функцию `(form) => rule`. Фабрики работают в createForm.rules и FormItem.rules.
Аргументом служит текущая native модель с getFieldValue/getFieldsValue и остальным
публичным API. Функция вычисляется заново перед каждой проверкой, до debounce;
возвращённые настройки фиксируются для этого запуска. Getters значений/errors/touched
сами по себе фабрики не запускают. IsFieldRequired и отметка required вычисляют их
отдельно, включая SSR; warningOnly не делает control обязательным.

```ts
const form = createForm({
  initialValues: { password: '', confirmation: '' },
  rules: {
    confirmation: [form => {
      const password = form.getFieldValue('password');
      return { validator: value => value === password ? undefined : 'Пароли различаются.' };
    }]
  }
});
```

Фабрика должна возвращать объект правила и не менять форму. Без ближайшего Form
локальная factory не используется для required; standalone Item сохраняет explicit
required и object rules. Исключение фабрики при validateFields отклоняет Promise
и снимает validating; следующий запрос может повторить проверку. Прежние native
validator(value, values), setters/touched, reset и правила без фабрик сохранены.
Сверка: [14 исходных состояний](./tests/browser/fixtures/ant-design-form-rule-factories-reference.json),
[модель и debounce](./src/lib/form-rule-factories.test.ts),
[браузер](./tests/browser/form-rule-factories.spec.ts),
[публичные типы и SSR](./tests/package/form-rule-factories.ssr.test.ts), `?fixture=form-rule-factories`.

`fields` задаёт правила дочерних значений при type='object' или 'array'. Каждый
ключ — буквальное имя свойства, в том числе 'a.b'; значение — объект правила
или readonly-массив объектов. DefaultField проверяет все существующие элементы
массива после fields, если родитель и explicit fields не дали ошибок. Для object
defaultField применяется к собственным ключам без переопределения в fields.
Необязательное отсутствующее родительское значение пропускает вложенную схему.
Ошибки и предупреждения записываются в родительское поле; отдельные bindings не создаются.

```ts
const form = createForm({
  initialValues: { profile: { name: '' } },
  rules: {
    profile: [{ type: 'object', fields: {
      name: { required: true, message: 'Введите имя.' }
    } }]
  }
});
```

Вложенный validator сохраняет native `(value, values)` с общим snapshot формы.
Parent transform применяется до дочерних правил и не заменяет store; схема
фиксируется перед асинхронным parent validator. ValidateFirst управляет списком
корневых правил, внутри одной схемы собираются все дочерние результаты. Вложенное
предупреждение не скрывает ошибку последующего корневого правила.
Fields сохраняет исходный порядок завершения child promises; defaultField массива —
порядок индексов. Корневой warningOnly переводит все сообщения своей схемы в warnings.

Исправлены подтверждённые ошибки source: вложенный warningOnly не блокирует submit,
defaultField проверяет существующие sparse positions и преобразованный массив,
required без type принимает числовой 0, поля читаются только из собственных данных.
Повтор пары schema/value в текущей ветви завершается ошибкой цикла; одинаковый
объект у независимых siblings допустим. Reset и устаревшие async results сохраняют
прежние guards модели. Сверка: [30 raw-состояний и diagnostics](./tests/browser/fixtures/ant-design-form-nested-rules-reference.json),
[правила и lifecycle](./src/lib/form-nested-rules.test.ts),
[браузер](./tests/browser/form-nested-rules.spec.ts),
[публичный пакет и SSR](./tests/package/form-nested-rules.ssr.test.ts), `?fixture=form-nested-rules`.

Строковые сообщения правил поддерживают `${label}`, `${name}` и параметры правила,
например `${min}` или `${enum}`. FormItem.messageVariables перекрывает эти значения
для текущего поля. Label берётся из строковой подписи, иначе из имени; name — полный
путь через точку. У вложенных правил name и параметры относятся к дочернему правилу,
label и явные messageVariables сохраняются от FormItem. Без FormItem подписью служит путь.

```svelte
<FormItem name="title" label="Заголовок"
  messageVariables={{ min: 'трёх' }}
  rules={[{ min: 3, message: '${label}: минимум ${min} символа.' }]}>
  <Input value={form.values.title}
    onValueChange={(value) => form.setFieldValue('title', value)} />
</FormItem>
```

Подстановка однократная: содержимое replacement не интерпретируется снова.
Backslash перед `${label}` сохраняет буквальный placeholder; в JS-строке его нужно
экранировать: `'\\${label}'`. Неизвестный ключ даёт текст undefined. Переменные
фиксируются до debounce/async validator; следующая проверка читает свежие props.
Это относится и к строковым результатам validator, но не к готовым errors/warnings
из setFields и не к ошибкам обработчика submit. Обычные сообщения и native defaults сохранены.

Исправлены исходные ошибки подписи имени 0, inherited constructor/toString и
родительского контекста вложенного object. Raw source behavior сохранён в
[22 исходных состояниях](./tests/browser/fixtures/ant-design-form-message-variables-reference.json).
Проверки: [модель и шаблоны](./src/lib/form-message-variables.test.ts),
[браузер](./tests/browser/form-message-variables.spec.ts),
[публичные типы и SSR](./tests/package/form-message-variables.ssr.test.ts),
`?fixture=form-message-variables`.

`Form.validateMessages` задаёт общие шаблоны required/enum/whitespace, types,
string/number/array len/min/max/range и pattern.mismatch. Те же настройки доступны
в ConfigProvider.form.validateMessages и locale.Form.defaultValidateMessages.
Rule.message приоритетнее Form, затем config и locale. Locale/config объединяют
вложенные группы; локальный Form заменяет переданную группу целиком, как source.
ConfigProvider.form сохраняет правило замены record: собственный {} или другой
form-record убирает родительские настройки Form. Отсутствующие шаблоны используют
прежние native русские сообщения; встроенные ruRU/enUS их не меняют.

```svelte
<Form {form} validateMessages={{ string: { min: '${label}: минимум ${min} символа.' } }}>
  <FormItem name="title" label="Заголовок" rules={[{ min: 3 }]}>
    <Input value={form.values.title}
      onValueChange={(value) => form.setFieldValue('title', value)} />
  </FormItem>
</Form>
```

ValidateMessage принимает строку или функцию, возвращающую строку. Шаблон
вычисляется только при ошибке соответствующего constraint. Source printf
`%s/%d/%j/%%` применяется до `${variables}`; аргументы функции/printf — путь поля,
затем соответствующие constraint values. Rule.message обрабатывает только `${}`.
Date, как source validator, использует types.date для неверной даты и number
для timestamp range; date.format/parse/invalid сохранены в типах без новых проверок.
Default перекрывает native fallback custom rejection без Error.message; готовые
строки validator и ручные ошибки metadata сохраняют прежний приоритет.

Настройки фиксируются перед debounce/async; изменение props действует при следующей
проверке и само не переписывает старые errors. Провайдер Form снимается при unmount
и замене модели. SSR не запускает validation, а standalone createForm без Form
сохраняет native defaults. Undefined вместо шаблона и исключение template callback
используют обычное сообщение без исходных console/page errors; поле остаётся invalid.
Raw failures и контексты сохранены в
[52 исходных случаях](./tests/browser/fixtures/ant-design-form-validate-messages-reference.json).
Проверки: [шаблоны и lifecycle](./src/lib/form-validate-messages.test.ts),
[браузерные scopes](./tests/browser/form-validate-messages.spec.ts),
[публичные типы и SSR](./tests/package/form-validate-messages.ssr.test.ts),
`?fixture=form-validate-messages`.

`ValidationRule.transform(value)` синхронно преобразует вход только для своего
правила, до required/min/max/pattern и validator. Другие правила получают исходное
значение. Возвращённый результат не записывается в модель, native FormData, submit payload или
reset defaults. Например, `{ transform: value => String(value).trim(), min: 3 }`
проверяет длину без крайних пробелов, сохраняя введённый текст.
Не изменяйте объект на месте: callbacks видят общий snapshot текущей проверки.
Plain containers скопированы; экземпляры классов сохраняют свою identity.

Исключение transform становится ошибкой правила: message имеет приоритет,
затем Error.message и обычный fallback; warningOnly сохраняет свой смысл.
В 6.6.8 такое исключение ошибочно даёт успешную validation. Raw наблюдение оставлено
для отдельного разбора; этот дефект не повторён. Сверка:
[15 исходных сценариев](./tests/browser/fixtures/ant-design-form-transform-reference.json),
[модель и правила](./src/lib/form-transform.test.ts),
[браузер](./tests/browser/form-transform.spec.ts),
[публичный пакет и SSR](./tests/package/form-transform.ssr.test.ts), `?fixture=form-transform`.

`FormItem.validateFirst` управляет правилами одного поля:

- `false` по умолчанию запускает правила параллельно и собирает все сообщения
  в порядке правил, независимо от порядка ответов;
- `true` проверяет последовательно и останавливается на первом сообщении;
- `"parallel"` запускает правила параллельно и возвращает первую завершившуюся
  ошибку, не ожидая остальные результаты. Если ошибок нет, проверка ждёт все
  блокирующие правила; первое предупреждение выбирается по порядку ответов.

Блокирующие правила идут перед warningOnly, как upstream; массив правил владельца
не изменяется. В последовательном режиме предупреждение останавливает оставшиеся
warning rules только после успешной проверки всех блокирующих правил.
Изменение validateFirst действует на следующий запрос без пересоздания control.
Поздние ответы после завершения проверки не меняют сообщения; reset, запись
и удаление поля сохраняют прежнюю защиту outOfDate. ValidateOnly использует
выбранный режим, сохраняя видимую metadata. Сигнатура validator(value, values),
тексты встроенных ошибок и native contracts сохранены.

В неизменённом Ant Design 6.6.8 ранний warning в parallel-режиме может разрешить
validateFields/submit до завершения блокирующего validator; поздняя ошибка теряется.
Это поведение записано в [raw reference](./tests/browser/fixtures/ant-design-form-validate-first-observation.json)
и не перенесено: предупреждение ждёт результат блокирующих правил.
Подтверждения: [браузер](./tests/browser/form-validate-first.spec.ts),
[публичный пакет](./tests/package/form-validate-first.ssr.test.ts),
[engine и модель](./src/lib/form-validate-first.test.ts).

`FormItem.validateDebounce` откладывает автоматическую validation на заданное число
миллисекунд; undefined/0 сохраняют немедленный запуск. Ожидание входит в validating.
Повторный запуск заменяет таймер, устаревшие значения не передаются validator.
Правила, validateFirst и задержка фиксируются для текущего запуска; изменения props
действуют на следующий. ValidateFields и submit обходят задержку; validateOnly
работает сразу и не отменяет ожидающую видимую проверку. Прежние blur/touched
triggers и повторная проверка touched-полей при записи сохраняются.
Reset, ручная замена value/validating и удаление поля отменяют отложенную работу.
Уже запущенные Promise сохраняют прежнюю защиту от устаревших ответов.

В Ant Design 6.6.8 таймер может запустить validator после unmount поля.
Это [наблюдение сохранено](./tests/browser/fixtures/ant-design-form-debounce-observation.json);
Svelte отменяет таймер и не запускает validator удалённого control. Артефакт содержит
35 состояний: calls, values, errors/warnings, touched/validating и явные проверки
с управляемым временем. Проверки: [модель](./src/lib/form-validate-debounce.test.ts),
[браузер](./tests/browser/form-validate-debounce.spec.ts),
[публичные типы и SSR](./tests/package/form-validate-debounce.ssr.test.ts),
`?fixture=form-validate-debounce`.

Plain objects и массивы копируются при создании модели, установке полей, в snapshot проверки
и при каждом reset. Defaults, snapshot и аргументы владельца не разделяют
изменяемые контейнеры. Значения модели изменяйте через setters.
Dayjs|null также поддержан: immutable экземпляр сохраняется без proxy, coercion
или сериализации; заменяйте его новым значением через setter.

`validateFields()` возвращает snapshot значений или отклоняется с
FormValidationError. Ошибка содержит `values`, `outOfDate` и `errorFields` с
массивами сегментов name и сообщениями errors. `getFieldError(name)` и
`getFieldsError(names?)` читают ошибки вложенных полей. Прежний `errors` сохраняет
проекцию верхнего уровня. Правило с `warningOnly: true` записывает сообщение
в warnings; оно не блокирует validateFields/submit и не делает поле обязательным.
`getFieldWarning(name)` читает предупреждения, `getFieldsError` возвращает оба
массива. При сборе всех сообщений errorFields включает также предупреждения ошибочного поля.
Новая проверка сразу очищает прежние warnings, включая ожидание async validator;
после ответа записывается новый результат. Этот lifecycle сверён с
[официальным UMD](./tests/browser/fixtures/ant-design-form-warning-lifecycle-observation.json).
FormItem показывает ошибки перед предупреждениями; error имеет приоритет над
warning. Предупреждение входит в доступное описание, но не выставляет aria-invalid.
Переданные в `validateFields(names)` пути выбирают проверяемые поля; snapshot
по-прежнему содержит всю модель. Upstream возвращает проекцию выбранных путей.
Устаревшие результаты не перезаписывают состояние после изменения или сброса
формы или удаления локального поля. После blur поле считается touched; изменение любого поля повторно
проверяет touched-поля, включая зависимые validators.

`validateFields(options)` и `validateFields(names, options)` принимают
`FormValidateOptions`. Все флаги по умолчанию false и могут сочетаться:

```ts
await form.validateFields([['users']], {
  recursive: true,
  dirty: true,
  validateOnly: true
});
```

`validateOnly` возвращает результат правил без изменения errors, warnings,
touched и validating. Уже показанные сообщения сохраняются; такая проверка
не делает нетронутое поле dirty. Фокус и значения controls не меняются.
`recursive` выбирает зарегистрированных потомков указанного пути, включая
само поле; пересекающиеся пути не запускают его правила повторно. Строка с
точкой остаётся буквальным именем, числовой и строковый сегменты различаются.

`dirty` выбирает touched, изменённые поля и поля, для которых уже запускалась
обычная проверка.
Как upstream, он включает поля с initialValues/initialValue, кроме undefined:
пустая строка, 0, false и null также считаются заданными начальными значениями.
`setFieldValue` делает известное поле dirty и при записи прежнего значения;
setFieldsValue — при изменении содержимого. Plain containers сравниваются по
собственным значениям, непрозрачные экземпляры — по identity. Reset очищает
историю dirty; заданные defaults продолжают участвовать в фильтрации.
Прежние правила touched модели сохраняются: запись сама не заменяет blur/submit.

Новый вызов validation помечает предыдущий Promise outOfDate, как upstream.
При этом validateOnly не отменяет видимую проверку: её собственные сообщения
и validating завершаются независимо от результата тихой проверки.
Защита snapshot после изменения, reset и удаления поля сохраняется и для validateOnly.

В Ant Design 6.6.8 вызов `validateFields(undefined, options)` игнорирует options
вопреки объявленной перегрузке. В Svelte второй аргумент применяется; наблюдение
сохранено в [raw reference](./tests/browser/fixtures/ant-design-form-validation-options-observation.json).
Фильтрация и параллельные запросы сверены с неизменённым UMD:
[браузер](./tests/browser/form-validation-options.spec.ts),
[публичный пакет](./tests/package/form-validation-options.ssr.test.ts) и
[модель](./src/lib/form-validation-options.test.ts).

`resetFields(names?)` восстанавливает начальные значения выбранных путей.
Без аргумента сбрасывается вся модель. `[]` ничего не меняет; `[[]]` восстанавливает
весь store, но не выбирает metadata именованных полей. Неизвестный путь получает
собственное значение undefined без создания binding.

Metadata выбирается точным именем: сброс `['user']` восстанавливает объект user,
но сохраняет touched/errors потомка `['user', 'name']`. Для очистки его состояния
передайте полный путь: `form.resetFields([['user', 'name']])`. Строка с точкой
и числовой/строковый сегменты различаются. Повтор одного пути не дублирует reset.

Содержимое выбранного FormItem пересоздаётся, включая локальное состояние
и cleanup компонентов. Это относится также к обычным полям при полном reset,
как гарантирует Ant Design. Соседние поля сохраняют DOM, черновики, фокус и выделение.
Для связанного native control сохраняется прежний контракт фокуса: после
пересоздания он восстанавливается, если владелец поля остался на странице
и пользователь не перевёл фокус. Это сохраняет работу с черновиком InputNumber
при программном reset; локальные элементы без field association не перехватывают фокус.
Сброс FormList пересоздаёт его строки; ключи списка сохраняются по исходным правилам.
Form initialValues имеют приоритет над текущим initialValue корневого списка.
Если несколько списков задают initialValue одного пути, reset не выбирает
произвольный default; наблюдение есть в [эталоне конфликта](./tests/browser/fixtures/ant-design-form-reset-conflicts-observation.json).

В неизменённом UMD 6.6.8 сброс родителя или другого typed alias может обновить
store без обновления вложенного input даже после завершения рендера. Этот дефект
сохранён в observations [raw reference](./tests/browser/fixtures/ant-design-form-reset-fields-observation.json);
Svelte показывает актуальное значение store. Защита от поздних результатов
validation сохраняется. Проверки: [браузер](./tests/browser/form-reset-fields.spec.ts),
[публичный пакет](./tests/package/form-reset-fields.ssr.test.ts),
[модель](./src/lib/form-reset-fields.test.ts).

`getFieldInstance(name)`, `focusField(name)` и `scrollToField(name, options?)`
работают с текущим UI binding. Встроенные Input, TextArea, InputNumber, Select,
Checkbox/Radio, Switch, Slider, OTP, pickers, Rate, Mentions, AutoComplete,
TreeSelect, Cascader и группы регистрируются автоматически. Когда компонент
публикует `bind:ref`, возвращается этот ref; иначе — стабильный handle с
nativeElement и поддержанными методами либо опубликованный native element.
Это Svelte refs: например, Slider фокусирует прежний native range input.

`Form.scrollToFirstError` прокручивает первую ошибку после onFinishFailed.
Настройка Form целиком заменяет ConfigProvider.form.scrollToFirstError;
undefined наследует config, false отключает прокрутку и фокус. True использует
if-needed/nearest без фокуса. Объект принимает FormScrollOptions, в том числе
block, behavior и focus:true. Прокрутка использует текущий ref поля.
Без настройки в обоих местах сохранён прежний native автофокус первой ошибки;
Ant Design в этом случае не переводит фокус. Это отличие также действует после
сброса config record через {}. Устаревшие validation, смена модели и unmount
не вызывают позднюю прокрутку, включая удаление формы в onFinishFailed.
Сверка: [15 эталонов](./tests/browser/fixtures/ant-design-form-scroll-first-reference.json),
[браузер](./tests/browser/form-scroll-first.spec.ts),
[публичные типы и SSR](./tests/package/form-scroll-first.ssr.test.ts), `?fixture=form-scroll-first`.

У пользовательского control исходный ref передаётся в `FormItem.controlRef`.
Он имеет приоритет над автоматической регистрацией и возвращается без обёртки.
Можно передать native element, Svelte `bind:this` с экспортированным focus
или объект с nativeElement/focus. Для native binding:

```svelte
<script lang="ts">
  import { Form, FormItem, Input, createForm } from 'antd-svelte';

  const form = createForm({ initialValues: { title: '' } });
  let controlRef = $state<HTMLInputElement>();
</script>

<Form {form}>
  <FormItem name="title" label="Title" {controlRef}>
    <Input value={form.values.title} onValueChange={(value) => form.setFieldValue('title', value)}
      bind:inputElement={controlRef} />
  </FormItem>
</Form>
<button onclick={() => form.scrollToField('title', { block: 'center', focus: true })}>
  Show title
</button>
```

До mount, после удаления и без binding getFieldInstance возвращает undefined.
Без ref фокус и прокрутка используют связанный id; для своего native markup
задайте htmlFor. Сначала ищется control внутри собственного FormItem, чтобы
соседняя форма с тем же явным id не перехватила фокус. Динамические refs, reset,
замена модели и keyed FormList обновляют регистрацию без хранения снятых controls.
GetFieldInstance — императивный запрос, не подписка на mount; generic Instance
задаёт ожидаемый вызывающей стороной тип и не выполняет runtime validation.

FocusField вызывает focus с исходным receiver. ScrollToField использует
nativeElement ref либо связанный control и по умолчанию if-needed/nearest.
Поддержаны block/inline, scrollMode, behavior auto/instant/smooth либо callback
actions, boundary element/predicate, skipOverflowHiddenElements и focus.
Callback управляет прокруткой самостоятельно; его Promise не ожидается.
Неизвестный путь ничего не делает. При SSR эти методы безопасны без UI.
CSS scroll-margin пока не участвует в расчёте: upstream дважды учитывает margins,
может обрезать control и смещает его при повторном вызове. Этот дефект и коллизии
underscore refs сохранены в [raw reference](./tests/browser/fixtures/ant-design-form-dom-observation.json),
в Svelte они не повторяются. Проверки:
[браузер](./tests/browser/form-dom.spec.ts),
[публичный пакет](./tests/package/form-dom.ssr.test.ts),
[регистрация модели](./src/lib/form-dom.test.ts).

`form.submit(onFinish)` блокирует повторную отправку и возвращает результат
`success`, `invalid`, `failed` или `busy`. Изменение значений во время проверки
делает результат устаревшим и предотвращает вызов onFinish. Уже начавшуюся
операцию onFinish модель не отменяет.

Компонент Form вызывает onFinish только после успешной проверки. Ошибки полей
передаются в onFinishFailed, ошибки onFinish — в onError и показываются общим
сообщением. Нативная браузерная проверка отключена через novalidate, чтобы
использовать единый набор правил. Серверная проверка данных остаётся
ответственностью приложения.

Семантика путей и merge сверена с неизменённым UMD Ant Design 6.6.8 и
@rc-component/form 1.8.6. Svelte-модель сохраняет прежнюю изоляцию копий;
upstream передаёт значения store без такой гарантии. Подтверждения —
[browser и raw reference](./tests/browser/form-paths.spec.ts),
[SSR](./tests/package/form-paths.ssr.test.ts) и [модель](./src/lib/form.model.test.ts).
Полный validation API, dependencies, field adapters и остальные
настройки Form ещё не перенесены; наличие методов чтения не означает полного RcForm API.

### FormList

`FormList` — Svelte-эквивалент Form.List. Он читает массив ближайшего Form,
не добавляет DOM-обёртку и передаёт в children поля, операции и ошибки списка:

```svelte
<Form {form}>
  <FormList name="users">
    {#snippet children(fields, { add, remove }, meta)}
      {#each fields as field (field.key)}
        <FormItem name={[field.name, 'name']} label="Имя" rules={[{ required: true }]}>
          <Input
            value={form.getFieldValue(['users', field.name, 'name']) ?? ''}
            onValueChange={(value) => form.setFieldValue(['users', field.name, 'name'], value)}
          />
        </FormItem>
        <button type="button" onclick={() => remove(field.name)}>Удалить</button>
      {/each}
      <div class="ant-form-item">
        <FormErrorList errors={meta.errors} warnings={meta.warnings} />
      </div>
      <button type="button" onclick={() => add({ name: '' })}>Добавить</button>
    {/snippet}
  </FormList>
</Form>
```

Модель примера создаётся как
`createForm<{ users: { name: string }[] }>({ initialValues: { users: [] } })`.
Импортируйте FormList вместе с Form, FormItem, FormErrorList, Input и createForm из пакета.
`field.name` — текущий индекс, `field.key` — устойчивый ключ строки. Используйте
key в each: при move и remove соседних строк сохраняются controls, фокус,
выделение и ошибки оставшихся строк. Новые строки получают новые ключи.
Внешняя замена массива сохраняет ключи по индексам, как upstream.
Для sparse arrays fields содержит только существующие позиции с исходными
индексами name: это сохраняет строки React map при рендеринге Svelte each.
Замена массива с пропущенными позициями сверена с
[raw reference](./tests/browser/fixtures/ant-design-form-sparse-list-observation.json).
Там же сохранено наблюдение: merge initialValues upstream превращает пустые
позиции массива объектов в undefined; createForm сохраняет holes. Это отличие
инициализации модели остаётся для общего аудита Form.
В отдельном замере nested setFieldValue увеличивает массив в store upstream,
но List не показывает новую строку до следующей операции; Svelte обновляет её сразу.

Имена FormItem и вложенного FormList считаются от ближайшего списка;
setFieldValue/getFieldValue используют полный путь от корня Form. Вложенный
независимый Form сбрасывает prefix. Начальный массив из Form имеет приоритет,
включая []; отсутствующий массив может получить initialValue списка. При reset
используется Form initialValues либо текущий initialValue списка; контролы строк
создаются заново и сохраняют регистрацию для последующей validation и submit.
Скрытие списка сохраняет его значения, но снимает локальные правила.

Add принимает defaultValue и insertIndex, без индекса добавляет в конец;
неверный индекс вставки также добавляет в конец. Remove принимает индекс или
массив индексов; повторы и отсутствующие индексы не удаляют лишние строки.
Move переносит строку и её key. Rules списка принимают только custom validators
с прежней Svelte-сигнатурой `(value, values)`. Ошибки приходят в meta.errors,
предупреждения warningOnly — в meta.warnings;
после remove/reset поздняя validation не возвращает ошибки удалённых controls.
`prefixCls` списка задаёт префикс вложенного FormErrorList, по умолчанию ant-form.
Он не меняет prefix соседних FormItem.
WarningOnly сверено с официальным UMD: [браузерные проверки и raw reference](./tests/browser/form-warnings.spec.ts),
[SSR](./tests/package/form-warnings.ssr.test.ts) и [модель](./src/lib/form-warnings.test.ts).

Отличие от Ant Design 6.6.8: move с дробным индексом игнорируется. В исходном
UMD `move(0.5, 1)` теряет первую строку и вставляет undefined; этот дефект
сохранён как отдельное наблюдение в [raw reference](./tests/browser/fixtures/ant-design-form-list-observation.json).
Остальные операции сверены [в браузере](./tests/browser/form-list.spec.ts),
вложенность и initialValue — также [через SSR](./tests/package/form-list.ssr.test.ts).
Логика ключей адаптирована из @rc-component/form 1.8.6; [MIT-лицензия](./src/lib/vendor/LICENSE.rc-form)
включена в пакет. React runtime не добавлен.

### FormErrorList

`FormErrorList` — Svelte-эквивалент Form.ErrorList. Передавайте errors и warnings
из FormList meta, как в примере выше. Класс ant-form-item у обёртки сохраняет
исходные explain styles; при custom prefix используется соответствующий
`<prefix>-item`. Компонент не регистрирует поле и не меняет значения формы.

Ошибки идут перед предупреждениями. Сообщения принимают строки, числа, вложенные
массивы и snippets; ReactNode заменён обычным Svelte content.
Любой help, кроме null/undefined, заменяет оба списка, включая false, 0 и ''.
`helpStatus` задаёт его status class, fieldId — id `${fieldId}_help`,
class добавляет класс контейнера. Без сообщений контейнер отсутствует.

Очистка errors/warnings задерживается на 10 ms, чтобы короткий промежуточный
пустой список не скрывал сообщения. Появление и удаление сохраняют opacity/height
motion с токенами Form, CSS easing и deadline 500 ms; motion=false и reduced motion
отключают анимацию. `onVisibleChanged` вызывается после появления/скрытия,
не вызывается для исходного пустого списка и после unmount.
Повторная вставка во время скрытия отменяет прежний callback.

Порядок leaving rows сверён с @rc-component/motion 1.3.3;
[MIT-лицензия](./src/lib/vendor/LICENSE.rc-motion) включена в пакет.
Повторяющиеся сообщения получают отдельные ключи, обычный текст сохраняет DOM
при перестановке. Подтверждённый дефект Ant Design 6.6.8 с текстом toString
не воспроизводится: после обновления upstream оставляет 7 сообщений вместо
переданных 5. Входы и результат сохранены в
[raw reference](./tests/browser/fixtures/ant-design-form-error-list-observation.json).

Темы, приоритет help, snippets, callbacks, отмена при unmount и изолированный
prefix проверяются [в браузере](./tests/browser/form-error-list.spec.ts),
рендер без таймеров — [через SSR](./tests/package/form-error-list.ssr.test.ts).
Общие classNames/styles Form, включая help/helpItem, ещё не перенесены.

## Клавиатура и фокус

Checkbox использует нативный input: нажатие подписи и Space переключают его,
смешанное состояние доступно через `aria-checked="mixed"`. FormItem передаёт
id, name, required, ошибки и описание самому input.
CheckboxGroup объединяет нативные input в именованный fieldset; FormItem
передаёт имя группы, описание и ошибки, а required проверяется правилом массива.
RadioGroup использует нативную группу input[type=radio], именованный radiogroup,
стрелки и Space. Tab сохраняет нативный порядок; FormItem направляет фокус к
выбранному доступному варианту или первому доступному.
Switch использует нативную кнопку с role=switch: Space и Enter переключают
состояние, ArrowLeft/ArrowRight задают false/true; disabled/loading исключают кнопку из Tab.
Имя остаётся постоянным,
а checked-состояние передаёт aria-checked.
InputNumber использует input с role=spinbutton: стрелки меняют число, Enter
завершает черновик. Кнопки увеличения и уменьшения сохраняют фокус в input.
Slider использует нативный range: стрелки, Home/End и PageUp/PageDown,
label и видимый фокус бегунка. Tab не добавляет отдельную остановку на дорожке.
Tooltip использует role=tooltip и aria-describedby основного дочернего control.
Поверхность не перехватывает фокус; Escape сохраняет текущий control.
Popover предоставляет именованный немодальный dialog с доступными кнопками и
полями. Trigger связан через aria-controls/aria-expanded; Escape возвращает
фокус из содержимого, Tab продолжает естественную навигацию.
Popconfirm использует тот же dialog с именем и описанием подтверждения.
Кнопки не отправляют окружающую форму. Во время Promise aria-busy сообщает
ожидание, а Escape потребляется до содержащего Modal без закрытия подтверждения.
Dropdown использует role=menu и нативные button/a с role=menuitem, один активный
tabindex и разделители. Стрелки и typeahead обходят доступные команды;
Escape закрывает меню раньше Modal, Tab сохраняет естественную навигацию.
Menu использует ul/li с role=menu/menuitem, native button для заголовков и
настоящие ссылки в label. Стрелки/Home/End обходят доступные пункты по режиму;
Enter раскрывает подменю, Escape возвращает фокус к родителю popup.
Tabs использует tablist, нативные button с role=tab и связанные tabpanel.
Aria-selected сообщает выбор; стрелки двигают фокус без активации. Скрытые
панели недоступны для Tab. More использует listbox с native options/close buttons;
его Escape закрывает popup раньше содержащего Modal. Фокус из portal учитывается
при скрытии внешней панели.
Collapse использует нативные кнопки внутри headings, aria-expanded/aria-controls
и обычную последовательность Tab. Extra отделён от кнопки заголовка, скрытое
содержимое недоступно для Tab. Именованные regions ограничены небольшими группами
и accordion; при скрытии или удалении сфокусированной панели фокус восстанавливается.
Drawer использует именованный модальный dialog, нативную кнопку закрытия и
естественный Tab. Фон inert, Escape закрывает верхнюю поверхность, закрытие
возвращает фокус opener. Во время анимации ухода модальность сохраняется.
Alert предоставляет alert/status, атомарное объявление и декоративные иконки.
Закрытие доступно нативной кнопкой, уход скрыт от accessibility tree;
фокус из удаляемого сообщения переходит к доступному соседнему control.
Message использует пассивные status/alert без остановок Tab и переноса фокуса.
Закрытие host dialog остаётся у Modal/Drawer; скрытые контексты приостанавливают
очередь и её таймеры.
Notification поддерживает интерактивные действия с обычным Tab и нативной
кнопкой закрытия. Фокус внутри приостанавливает таймер; при удалении controls
фокус восстанавливается в доступном соседнем control текущего контекста.
Progress предоставляет именованный progressbar со значением и локализованным
статусом. Он не меняет Tab/focus order и не создаёт собственные live-объявления.
Spin объявляет отдельный status и немедленно блокирует children через inert
и aria-busy. Временная парковка фокуса на wrapper не добавляет остановку Tab;
возврат учитывает замену controls, unmount и выбор пользователя.
Skeleton заменяет children декоративным каркасом и объявляет отдельный status.
Фокус из удаляемого содержимого остаётся на постоянной группе; после загрузки
Tab входит в новые controls. Автоматического фокуса в новые children нет.
Empty использует декоративное inert-изображение и обычные controls footer.
Live-region и автофокус отсутствуют; удаление сфокусированных действий
восстанавливает доступный фокус и сохраняет выбор владельца.
Result предоставляет нативный заголовок выбранного уровня, декоративную иконку
и обычные controls действий/подробностей. Он не объявляет итог автоматически;
восстановление фокуса при удалении действий использует общий механизм с Empty.
Steps использует именованный упорядоченный список и нативные кнопки выбора.
Aria-current обозначает текущий шаг, описание кнопки сообщает статус и content.
Фокус сохраняется при перестановке и восстанавливается при удалении/отключении;
live-region отсутствует, переходами и фокусом панели управляет владелец процесса.
Tag использует обычный текст и описанную нативную кнопку закрытия. OnClose может
отменить действие; удаление сохраняет доступный фокус. CheckableTag — управляемая
toggle-кнопка с aria-pressed и нативной клавиатурой. Оба компонента скрывают
декоративные иконки и не создают собственных live-region.
Badge сохраняет интерактивные children при изменениях и скрытии индикатора.
Полное значение доступно обычным текстом; descriptionId связывает его с control
владельца. Автоматических объявлений и дополнительных остановок Tab нет.
Avatar сохраняет полное имя при fallback и подгонке текста. Строка src и
icon/children без имени декоративны; icon/children inert. Src Snippet сохраняет
собственные controls; именованный корень — group, явный aria-hidden делает его inert.
AvatarGroup раскрывает скрытых участников нативной кнопкой в именованный
Popover. Удаление overflow/группы сохраняет доступный фокус и выбор владельца.

Pagination использует nav со списком нативных кнопок и `aria-current="page"`.
Tab перемещает фокус, Enter и Space выбирают страницу; недоступные переходы
пропускаются. При исчезновении сфокусированной кнопки перехода фокус возвращается
текущей странице. Имя навигации можно задать через `aria-label`.

Table сохраняет нативные table/thead/tbody/th/td и `scope="col"`. Имя задаётся
через caption или aria-label. Сортируемые заголовки содержат нативные кнопки;
Enter/Space меняют порядок, `aria-sort` сообщает активное направление.
Контейнер прокрутки доступен по Tab и прокручивается стрелками.

Select предоставляет combobox/listbox. Стрелки перемещают активный пункт,
пропуская disabled options; Home/End выбирают начало и конец открытого списка,
Enter подтверждает, Escape закрывает, Tab продолжает обычную навигацию.
В одиночном режиме без поиска поддерживаются набор текста и очистка клавишами
Backspace/Delete. В multiple Backspace при пустом поиске удаляет последний
доступный элемент; редактирование текста и IME сохраняют стандартное поведение.
Список получает aria-multiselectable; кнопки удаления доступны по Tab и Enter.
Метка задаётся через label с соответствующим id, FormItem или
aria-label. Нажатие на поле, стрелку или отступы открывает список. Popup
располагается под control в том же DOM-контейнере.

Modal открывается через `dialog.showModal()` после mount. Браузер управляет
модальностью, фокусом и inert-состоянием остальной страницы. Escape, фон и кнопка
закрытия вызывают onCancel и сбрасывают bind:open; confirmLoading блокирует
пользовательское закрытие. Если onOk задан, он управляет подтверждением и
закрытием; без onOk кнопка подтверждения закрывает окно. В SSR dialog остаётся
скрытым до гидратации. Для асинхронного подтверждения владелец управляет
confirmLoading, обрабатывает ошибки и сбрасывает open после успеха.

## Проверки и границы версии

Тесты рядом с модулем проверяют выбор и поиск, расчёт страниц и диапазонов,
порядок сортировки и выбора строк, правила валидации, конкурирующие
проверки, повторную отправку, сброс, изоляцию состояния и SSR реальных
компонентов. Из корня репозитория выполняются `npm run lint`,
`npm exec -- svelte-kit sync`,
`npm exec -- svelte-check --tsconfig ./tsconfig.json --tsgo`, `npm test`
и `npm run build`.

`npm run test:e2e` запускает Chromium-проверки галереи и отдельного стенда
компонентов из `e2e/fixtures`. Перед первым прогоном установите браузер командой
`npm exec -- playwright install chromium`. Типы тестов и стенда проверяются
отдельно через `npm exec -- svelte-check --tsconfig ./e2e/tsconfig.json --tsgo`.

Браузерные тесты проверяют внешние изменения значений, смешанное состояние и
нативный reset Checkbox, boolean-поля Form, переходы и смену размера Pagination,
CheckboxGroup, типы значений, порядок options, повторяющиеся поля FormData,
отмену reset, фокус группы и выбор всех прав,
Radio/RadioGroup, нативное снятие соседнего radio, независимые имена,
числовой ноль и boolean false, required, отмену reset, ориентацию и фокус ошибок,
Switch, snippets, loading, keyboard, FormData, reset, сохранение с откатом,
повторную попытку, поздние ответы после удаления и reduced motion,
InputNumber, промежуточный текст, курсор, IME, дробный шаг, precision, null/zero,
числовую валидацию, нативный reset, reset модели и FormData,
Slider, мышь и касание через протокол браузера, завершение и отмену действий,
дробный шаг, reverse/RTL, ориентацию, фокус, FormData, reset и связь с InputNumber,
сочетания фильтров, сортировки, страниц и выбора Table, loading и замену данных,
серверный total, сохранение ключей между страницами, отмену запросов, поздние ответы,
ошибки/retry и повторную загрузку допустимой страницы при уменьшении total,
геометрию закреплённых заголовков и колонок, resize, клавиатурный фокус и узкий экран,
раскрываемые строки, callbacks, сохранение ключей, жизненный цикл snippets и colspan,
клавиатуру Select, множественный выбор, повторяющиеся поля FormData, native reset,
массивы Form, snapshots и устаревшие результаты async validation,
очистку и числовой ноль, фокус и закрытие Modal, async validation, повторную
отправку, ошибки и reset Form, оба layout, темы, размеры, RTL, локаль, мобильный
viewport, SSR и гидратацию. Галерея проверяется на свежей production-сборке.
Console warnings/errors и необработанные ошибки браузера делают тест неуспешным.
Снимки светлой, тёмной и мобильной страницы сохраняются для визуального
просмотра; автоматического сравнения с эталонными изображениями пока нет.

Tooltip проверяется на задержки и отмену ожидающего показа, hover/focus, Escape
внутри Modal, сохранение описаний, 12 положений, переворот, обрезающие
контейнеры, прокрутку, resize, темы, RTL и узкий экран. Проверяются форматирование
подсказки Slider, слежение за бегунком и отсутствие числовых callbacks от закрытия.
Popover проверяется на ввод и действия в snippets, способы открытия и их
сочетания, естественный порядок Tab, возврат фокуса, изменения владельца,
сохранение ARIA, положения и переворот, прокрутку/resize, вложенный Tooltip,
Modal, темы/RTL, touch и узкий экран. Галерея проверяет сохранение и отмену
редактирования профиля.
Popconfirm проверяется на подтверждение/отмену и их callbacks, Promise/loading,
ошибки и повтор, внешнее закрытие, повторное открытие, disabled, удаление и
поздние результаты, события дочерних кнопок, Form, Modal, Tooltip, темы,
локаль, RTL, 12 положений и touch. Модель подтверждения проверяется
отдельно с управляемыми Promise; галерея удаляет и восстанавливает строку Table.
Dropdown проверяется на команды и порядок callbacks, клавиатуру/typeahead,
Tab/Escape, hover-задержки, defaults и внешнее управление, disabled, обновление
списка и восстановление фокуса, замену trigger и ARIA-атрибуты владельца.
Chromium проверяет шесть положений, переворот, clipping, прокрутку, Modal,
темы/RTL/reduced motion, touch и длинные подписи; галерея выполняет команды Table.
Tabs проверяется на выбор/defaults и callbacks, ручную клавиатурную активацию,
ленивое монтирование, сохранение локального state, forceRender, destroyOnHidden
и переопределения item. Browser-проверки покрывают ARIA-связи, фокус при
изменении items, четыре положения line/card, размеры, RTL, индикатор, прокрутку,
темы/reduced motion, touch, Modal и сохранение профиля в галерее.
Collapse проверяется на независимое раскрытие и accordion, порядок binding/callback,
defaults, неизвестные ключи, header/icon/disabled и переопределения item.
Unit/SSR/Chromium-проверки покрывают ленивое монтирование, сохранение state,
forceRender/destroyOnHidden, FormData, вложенность, ARIA, Enter/Space/Tab,
восстановление фокуса, перестановку items, Modal, размеры, RTL, темы, reduced motion,
мобильные длинные подписи и сохранение/сброс анкеты в галерее.
Drawer проверяется на binding/callbacks, четыре стороны и размеры, закрытие
кнопкой/Escape/фоном, pointer-drag, модальность и возврат фокуса, прокрутку,
ленивое содержимое, forceRender/destroyOnHidden и повторное открытие при уходе.
SSR/Chromium-проверки покрывают удаление, RTL/локаль, темы, reduced motion,
Select/Popover/Tooltip, Tabs/Collapse, стек с Modal и мобильное длинное содержимое.
Галерея проверяет валидацию, сохранение черновика, обновление строки Table и сброс.
Alert проверяется на типы, banner/defaults, outlined/filled, snippets и иконки,
callbacks и фактическое удаление DOM, disabled, Enter/Space/Tab, порядок фокуса,
отмену анимации при unmount/замене, reduced motion, локаль, RTL, темы, Modal/Drawer
и мобильные длинные сообщения. SSR защищает defaults, escaping, атрибуты
доступности и прежние outline-иконки. Галерея проверяет действие, закрытие,
повторный показ и сохранение query при retry удалённой Table.
Message проверяется на независимость экземпляров и SSR-запросов, пять типов,
ключи/обновления, duration, FIFO, callbacks, await и stale handles. Unit-проверки
управляют часами на границе holder; Chromium проверяет реальную видимость,
hover, удаление DOM после анимации, detach/замену, Modal/Drawer и вложенные
контексты, сохранение фокуса, темы/compact/RTL/reduced motion и мобильный перенос.
Галерея проверяет loading → success/error, повтор и отмену при сбросе.
Notification проверяется на четыре статуса и нейтральный open, snippets/actions,
изолированные очереди, ключи, defaults, duration=0/false, глобальный FIFO и
hover/focus-паузы. SSR защищает закрытый popover, escaping, шесть положений,
кнопку закрытия и доступные имена. Chromium проверяет геометрию и рост списков,
сохранение черновика при обновлении, фокус/клавиатуру, callbacks, unmount/замену,
анимации/reduced motion, темы/compact/RTL/локаль, Modal/Drawer и мобильный перенос.
Пример галереи проверяет реальное содержимое скачанного CSV, ошибки/retry и
отмену ожидающего экспорта при сбросе.
Progress проверяется на нормализацию, явные/автоматические статусы, размеры,
SVG-геометрию, форматирование/escaping и SSR без таймеров. Chromium проверяет
реальную дугу, цвета, RTL, локаль, reduced motion, фокус и независимые экземпляры,
Modal/Drawer, мобильное переполнение и SSR до гидратации. Модель экспорта
проверяет этапы, отмену, retry, сброс и unmount; галерея проверяет общие controls
line/circle, промежуточные проценты, отмену без позднего результата и CSV.
Spin проверяется на нормализацию delay, короткую загрузку, смену запроса,
отмену таймеров и SSR без них. Chromium проверяет немедленную блокировку,
сохранение DOM/черновика/локального состояния, парковку и возврат фокуса,
замену поля и unmount, snippets, размеры, локаль/темы/RTL/reduced motion,
Modal/Drawer и мобильный перенос. Галерея проверяет быстрый/медленный ответ,
ошибку/retry, отмену, сброс и SSR до гидратации; Table сохраняет прежний status.
Skeleton проверяется на расчёт конфигураций, нулевые/дробные/некорректные
размеры и ширины, число строк, SSR и отсутствие таймеров. Chromium проверяет
реальную геометрию, размонтирование/новое состояние children, парковку фокуса,
Tab, выбор снаружи, unmount, Modal/Drawer, темы/локаль/RTL/reduced motion и
мобильные ограничения. Галерея проверяет первую загрузку, обновление через Spin
с сохранением DOM и черновика, ошибку/retry, отмену, сброс и SSR до гидратации.
Empty проверяется на SSR default/simple, скрытые части, escaping, snippets,
footer и локальные ссылки SVG-паттернов. Chromium проверяет уникальность ID,
геометрию, локаль/темы/compact/RTL, inert custom image, сохранение действий,
unmount и замену controls, выбор владельца, Modal/Drawer и мобильный перенос.
Галерея проверяет создание первой записи, пустой поиск, сброс фильтра,
очистку и SSR до гидратации. Проверки Table защищают colspan, точное имя
пустой ячейки, локальные переводы, приоритет empty snippet и loading.
Result проверяется на SSR всех статусов, string/number исключения, приоритет
иллюстраций, snippets, escaping, уровень заголовка и отсутствие live-region.
Chromium проверяет иконки, Tab, inert, сохранение controls/черновика,
удаление действий/unmount, выбор владельца, Modal/Drawer, темы/compact/RTL
и мобильный перенос. Галерея проверяет валидацию, успех, ошибку, редактирование,
retry без потери полей, reset/unmount во время отправки и SSR до гидратации. Модель проверяется
с управляемыми таймерами на snapshot, duplicate start и отмену позднего ответа.
Steps проверяется на нормализацию индексов/ключей, приоритет статусов и SSR без
DOM/таймеров. Chromium проверяет управляемый выбор, нативную клавиатуру, passive
режим, status/snippets, disabled, удаление/перестановку/unmount, Modal/Drawer,
локаль/темы/compact/RTL/reduced motion и responsive/внутреннюю прокрутку.
Галерея проверяет валидацию переходов, сохранение полей, отправку/Result/retry,
reset/unmount, мобильную компоновку и SSR до гидратации. Модель проверяет
отмену pending validation/submission и защиту от позднего завершения.
Tag/CheckableTag проверяются на SSR snippets, ARIA, disabled, состояния и
отсутствие DOM/таймеров/callbacks. Chromium проверяет палитры/варианты, отмену,
защиту от повторного входа, остановку нативного всплытия, клавиатуру, unmount,
выбор владельца, locale/темы/RTL/reduced motion, Modal/Drawer и узкий экран.
Галерея проверяет добавление/дубликаты/защиту/удаление и повторное создание меток,
фильтры таблицы, сохранение фокуса, reset и SSR. Модель проверяет нормализацию,
стабильность и обновление key, повторное удаление и изоляцию экземпляров.
Badge проверяется на границы счётчика, ноль/dot, приоритет статусов, offsets и SSR.
Chromium проверяет полные описания, отсутствие live-region, стабильность DOM/фокуса,
нативную отправку формы, палитры, locale/темы/RTL/reduced motion и узкий экран.
Галерея проверяет Drawer, чтение без удаления, overflow, reset и SSR;
модель — вычисление количества, повторное чтение, новые ключи и изоляцию экземпляров.
Avatar проверяется на размеры/gap, масштаб текста, SSR snippets и доступное имя.
Chromium проверяет загрузку/fallback/onError, смену src/srcSet, поздние события,
подгонку после скрытия/изменения шрифта и размеров, очистку настоящего
ResizeObserver, нативную кнопку владельца, темы/compact/RTL и Modal/Drawer.
Отдельные source-эталоны проверяют src Snippet, владение атрибутами/ошибками,
сохранение состояния, Image preview, доступность и вложенный Popover.
Галерея проверяет начальное ошибочное изображение из SSR, профили участников,
сохранение/сброс, узкий экран и рендеринг до гидратации; модель — изоляцию и
обновление только выбранного участника.
AvatarGroup проверяется на ключи/лимиты и SSR без скрытых изображений и таймеров.
Chromium проверяет Enter/Space/Escape, hover/focus/click, ленивое содержимое,
сохранение DOM/ошибки изображения при перестановке, удаление overflow/unmount,
восстановление и выбор фокуса, наследование размеров/локали, темы/RTL и перенос.
Галерея проверяет управление командой, границы перемещения, reset, мобильный
Popover и SSR; модель — нормализацию имён, Unicode-инициалы и свежие ключи.

Эта версия покрывает перечисленное ядро. Древовидные/поисковые фильтры Table,
расширенные режимы DatePicker,
расширения Tree/TreeSelect/Upload/Menu, Select tags, полный Form API,
порталы, виртуализация и статические методы Modal пока отсутствуют. Совместимость
всего React API и визуальная идентичность всех состояний не заявлены.

## Локальные исходники Ant Design

[Реестр покрытия и инструменты переноса](./docs/reference/ant-design-porting/readme.md)
содержат сводку возможностей, рецепты CSS и отдельные маршруты браузерных фикстур.

Официальный React-репозиторий используется как эталон при переносе:
`.upstream/ant-design` от корня проекта. Это отдельный Git-клон, исключённый
из Git проекта через корневой `.gitignore`. Рабочая копия закреплена на
[Ant Design 6.6.8](https://github.com/ant-design/ant-design/tree/984592267de88fbf9cdaecc96a56629e721c709d),
commit `984592267de88fbf9cdaecc96a56629e721c709d`.

Для восстановления копии из корня проекта:

```sh
mkdir -p .upstream
git clone --depth 1 --single-branch --branch 6.6.8 https://github.com/ant-design/ant-design.git .upstream/ant-design
git -C .upstream/ant-design rev-parse HEAD
```

Клон содержит файлы релиза с сокращённой Git-историей. Для чтения исходников
установка зависимостей не требуется. Новую целевую версию выбираем отдельно
от переноса очередного компонента.

В `components/<component>/` доступны реализация и типы, `style/`, `demo/`,
`__tests__/` и документация `index.en-US.md`. Например, у Button основной файл —
`components/button/Button.tsx`, у Avatar — `components/avatar/Avatar.tsx`.
Общие механизмы находятся в `components/_util/`, токены и алгоритмы тем —
в `components/theme/`, переводы — в `components/locale/`.

Поиск в исключённой рабочей копии выполняется явно:

```sh
rg --files --hidden --no-ignore .upstream/ant-design/components/avatar
```

Перед переносом сверяем исходник, props, демо и граничные случаи в тестах;
затем реализуем Svelte API, документируем поддержанный объём и проверяем его
в наших unit/SSR/Chromium-тестах. Часть логики Ant Design делегирует пакетам
`@rc-component/*`; для неё также нужны исходники соответствующей версии пакета.
Стили в `vendor/` по-прежнему происходят из опубликованного npm-архива,
описанного ниже; checkout дополняет его исходниками и тестами.

## Источник и лицензия

Статический theme API использует algorithms/alias Ant Design 6.6.8,
палитры @ant-design/colors 8.0.1, семантику getComputedToken из cssinjs 2.1.2
и FastColor 3.0.1. Сохранены лицензии
[colors](./src/lib/vendor/LICENSE.ant-design-colors),
[cssinjs](./src/lib/vendor/LICENSE.cssinjs) и
[FastColor](./src/lib/vendor/LICENSE.fast-color).

Стили взяты из `dist/antd.css` официального
[пакета antd 6.6.8](https://registry.npmjs.org/antd/-/antd-6.6.8.tgz).
В [vendor/antd.css](./src/lib/vendor/antd.css) оставлены правила Button, Input, Select,
Checkbox, Pagination, Table, Modal, Form и связанные animations; глобальные токены
сохранены. В [vendor/radio.css](./src/lib/vendor/radio.css) добавлены обычные Radio и
RadioGroup из того же архива; [vendor/switch.css](./src/lib/vendor/switch.css) содержит
Switch вместе с правилами reduced motion.
Общий эффект Wave извлечён отдельно в [vendor/wave.css](./src/lib/vendor/wave.css);
рецепт wave сохраняет все восемь исходных правил без keyframes.
InputNumber outlined находится в [vendor/input-number.css](./src/lib/vendor/input-number.css),
адаптация тем и reduced motion — в theme.css и InputNumber.svelte.
[vendor/slider.css](./src/lib/vendor/slider.css) содержит Slider с одним бегунком из
того же архива; нативный control и reduced motion адаптированы в
[SliderSingle.svelte](./src/lib/SliderSingle.svelte).
[vendor/slider-prefix.css.js](./src/lib/vendor/slider-prefix.css.js) воспроизводится
рецептом slider-prefix из 54 правил того же архива. Runtime заменяет componentCls
и descendant resets; marker и CSS variable names сохраняются. Defaults ограничены
корнем, а native aliases восстанавливаются отдельным bridge после template.
[vendor/tooltip.css](./src/lib/vendor/tooltip.css) содержит базовые Tooltip и стрелку
из того же архива. Native popover, позиционирование и reduced motion реализованы
в TooltipPopup.svelte и popup.dom.ts; тёмная тема адаптирована в theme.css.
[vendor/popover.css](./src/lib/vendor/popover.css) содержит базовые Popover и стрелку
из того же архива. Общая DOM-логика поверхностей находится в popup.dom.ts;
расчёт положения переиспользует tooltip.engine.ts. Popover.svelte и popover.dom.ts
добавляют интерактивное содержимое, ARIA-связь и управление фокусом.
[vendor/popconfirm.css](./src/lib/vendor/popconfirm.css) содержит Popconfirm из того же
архива. Popconfirm.svelte использует Popover для поверхности и фокуса,
а popconfirm.model.svelte.ts связывает результат действия с текущим открытием.
[vendor/menu.css](./src/lib/vendor/menu.css) содержит 201 правило Menu из того же архива:
items, группы, подменю, три режима, light/dark/RTL и токены; collapse/slide/zoom
motion исключены. Рецепт menu воспроизводит файл; корни ограничены
:where(.ant-menu-css-var). Menu/MenuList/MenuSubMenu адаптируют Svelte snippets,
native buttons/links/popover и refs, menu.engine.ts — key paths/selection/навигацию.
Theme.css связывает цвета и геометрию с общей темой и compact.
[vendor/dropdown.css](./src/lib/vendor/dropdown.css) содержит базовое меню Dropdown,
команды, разделитель, danger/disabled, стрелку и токены из того же архива.
Dropdown.svelte добавляет нативные menu buttons и управление фокусом;
dropdown.engine.ts — навигацию и typeahead, popup.dom.ts — поверхность и выравнивание.
Корневые селекторы Dropdown ограничены :where(.ant-dropdown-css-var), чтобы
не менять существующие popover-фильтры Table с классом ant-dropdown.
[vendor/tabs.css](./src/lib/vendor/tabs.css) содержит line/card, расположения, индикатор
и токены Tabs из того же архива. Селекторы корня ограничены
:where(.ant-tabs-css-var), группы с общими declarations сохранены.
Tabs.svelte и tabs.engine.ts управляют выбором и фокусом, TabsPanel.svelte —
временем жизни содержимого; tabs.dom.ts измеряет индикатор и прокручивает заголовки.
[vendor/tabs-editable.css](./src/lib/vendor/tabs-editable.css) дополняет их 13
исходными правилами add/remove, размеров, focus и RTL. Рецепт tabs-editable
воспроизводит их из закреплённого архива; прежний tabs.css сохранён.
TabsEditIcon использует точные PlusOutlined/CloseOutlined из icons-svg 4.6.0
под существующей MIT-лицензией; их пути совпадают с официальным UMD Ant Design.
[vendor/tabs-layout.css](./src/lib/vendor/tabs-layout.css) содержит исходное
правило centered; рецепт tabs-layout сохраняет селекторы и declaration margin:auto.
[vendor/tabs-overflow.css](./src/lib/vendor/tabs-overflow.css) содержит 16 исходных
правил More/operations/listbox/remove/RTL без motion selectors. TabsOverflow.svelte
управляет popup, tabs-overflow.engine.ts повторяет visible range и навигацию rc-tabs,
tabs-overflow.dom.ts сохраняет native scroll и переносит тот же Add с заглушкой.
[vendor/tabs-overflow-motion.css](./src/lib/vendor/tabs-overflow-motion.css) добавляет
74 исходных slide-up/down rules и четыре keyframes. Общие phase selectors
ограничены :where(.ant-tabs-dropdown) без роста specificity; placement overrides и
повторные source groups сохранены.
Раздельные actions и touch повторяют @rc-component/trigger 3.10.1; его
[MIT-лицензия](./src/lib/vendor/LICENSE.rc-trigger) включена в пакет.
EllipsisOutlined взят из icons-svg 4.6.0; regexp is-mobile 5.0.0 сопровождается
[исходной MIT-лицензией](./src/lib/vendor/LICENSE.is-mobile).
[vendor/collapse.css](./src/lib/vendor/collapse.css) содержит 49 правил Collapse и его
токены из того же архива. Корневые селекторы ограничены
:where(.ant-collapse-css-var); React motion и правила ColorPicker исключены.
Collapse.svelte адаптирует заголовки к нативным кнопкам и управляет DOM-фокусом,
collapse.engine.ts — ключами и выбором доступного заголовка,
CollapsePanel.svelte — временем жизни содержимого. Темы и отступы кнопок
адаптированы в theme.css и scoped-стилях компонента.
[vendor/drawer.css](./src/lib/vendor/drawer.css) содержит 32 правила модального Drawer
и его токены из того же архива. Корневые селекторы ограничены
:where(.ant-drawer-css-var); React motion, resizable, skeleton и inline/pure
исключены. Drawer.svelte адаптирует нативный dialog и жизненный цикл содержимого;
drawer.dom.ts управляет модальностью и отменяемой Web Animations API-анимацией,
drawer.engine.ts — размерами, направлением ухода и длительностью.
[vendor/alert.css](./src/lib/vendor/alert.css) содержит 37 правил Alert из того же
архива: четыре статуса, outlined/filled, banner и токены. Корневые селекторы
ограничены :where(.ant-alert-css-var); React motion исключён. Alert.svelte
управляет закрытием, alert.dom.ts — отменяемой анимацией, notice.dom.ts — фокусом.
Scoped-стили адаптируют мобильные действия и размер кнопки закрытия.
[vendor/message.css](./src/lib/vendor/message.css) содержит 21 правило Message из того
же архива: базовую поверхность, верхнее положение, пять статусов и токены.
Корневые селекторы ограничены :where(.ant-message-css-var); React motion,
collapsing stack и остальные положения исключены. MessageHolder.svelte и
MessageNotice.svelte адаптируют нативный popover и обычный поток списка;
message.dom.ts предоставляет общий механизм notice.dom.ts для видимости
контекста и отменяемой Web Animations API-анимации. Theme.css связывает фон с
темой, иконки переиспользуют Icon.svelte.
[vendor/notification.css](./src/lib/vendor/notification.css) содержит 45 правил из того
же архива: шесть положений, статусы, описание, actions, кнопку закрытия и токены.
Корневые селекторы ограничены :where(.ant-notification-list); React motion,
stack, progress и pure-panel исключены. NotificationHolder.svelte и
NotificationNotice.svelte адаптируют нативную поверхность и обычный поток списков;
notice.dom.ts управляет видимостью, фокусом и анимацией. Иконки переиспользуют
существующий Icon.svelte и status-icons.ts.
[vendor/progress.css](./src/lib/vendor/progress.css) содержит 26 правил line/circle и
active keyframes из того же архива. Корневые селекторы ограничены
:where(.ant-progress-css-var); steps, success-сегмент и percentPosition исключены.
Progress.svelte адаптирует SVG, доступность, переполнение, RTL-анимацию и reduced
motion; progress.engine.ts нормализует значения/размеры и рассчитывает дугу.
Theme.css связывает цвет, фон и текст с токенами темы. Иконки переиспользуют
существующий Icon.svelte и лицензированные status-icons.ts.
[vendor/spin.css](./src/lib/vendor/spin.css) содержит 27 правил и два keyframes из того
же архива: standalone/embedded Spin, четыре точки, размеры и токены.
Корневые селекторы ограничены :where(.ant-spin-css-var); правила Listy,
fullscreen и percent исключены. Spin.svelte адаптирует доступность, inert,
перенос текста и reduced motion, spin.model.svelte.ts управляет ожиданием,
spin.dom.ts — парковкой/возвратом фокуса. Новые иконки и лицензии не добавлены.
[vendor/skeleton.css](./src/lib/vendor/skeleton.css) содержит 48 правил и один keyframe
из того же архива: составной Skeleton, пять primitives, active, round и block.
Корневые селекторы ограничены :where(.ant-skeleton-css-var). Рецепт skeleton-prefix
выводит CSS data module для локального prefix primitives с теми же 48 правилами.
Skeleton.svelte использует декоративный div для title, постоянную группу,
отдельный status, адаптивный flex-layout, пропорции аватара и reduced motion.
skeleton.engine.ts рассчитывает конфигурацию; skeleton.dom.ts сохраняет фокус
при замене children. Theme.css связывает градиент с fill-токенами темы.
Новые иконки и лицензии не добавлены.
[vendor/empty.css](./src/lib/vendor/empty.css) содержит все 15 правил default/simple/small
из того же архива. Корневые селекторы ограничены :where(.ant-empty-css-var).
Empty.svelte адаптирует snippets, локаль, inert-изображение, перенос текста и footer.
EmptyImage.svelte переносит геометрию es/empty/empty.js и es/empty/simple.js:
paths, ellipse, circle, viewBox и transforms сохранены. Native SVG patterns заменяют
getAsSolidColor, накладывая fill-токен на colorBgContainer с уникальными $props.id(),
без title. При явной source theme empty-image.engine.ts повторяет getAsSolidColor
из закреплённого исходника с локальным портом FastColor 3.0.1; SVG получает исходный title.
Рецепты empty/empty-prefix проверяют архив и воспроизводят CSS и local prefix template.
feedback.dom.ts управляет общим для Empty/Result focusin/MutationObserver
и восстановлением после tick.
SVG включены в исходники и покрываются существующей MIT-лицензией Ant Design.
[vendor/result.css](./src/lib/vendor/result.css) содержит все 20 правил Result из того
же архива; корни ограничены :where(.ant-result-css-var). Result.svelte добавляет
нативный заголовок, snippets, перенос текста/действий и мобильные ограничения.
ResultImage.svelte переносит геометрию и цвета es/result/unauthorized.js,
noFound.js и serverError.js: добавлены viewBox и декоративная семантика,
удалены SVG title. Новая лицензия для этих SVG не требуется.
[vendor/steps.css](./src/lib/vendor/steps.css) содержит все 147 правил Steps
из того же архива; воспроизводится рецептом steps. Варианты сохранены;
корни ограничены :where(.ant-steps-css-var), role-button selectors адаптированы
к классу интерактивного шага. Declarations сохранены. Steps.svelte адаптирует
структуру es/steps и нативные кнопки, локаль, responsive и reduced motion;
steps.dom.ts восстанавливает фокус шагов и использует общий feedback.dom.ts
при unmount. React/@rc-component зависимости не добавлены; ellipsis SVG
использует существующую MIT-лицензию icons.
[vendor/tag.css](./src/lib/vendor/tag.css) содержит 85 правил Tag/CheckableTag из того
же архива: ссылки, группа и селектор DatePicker исключены; корни ограничены
:where(.ant-tag-css-var). Declarations сохранены. Tag.svelte и CheckableTag.svelte
добавляют нативные buttons, snippets, перенос текста, тёмную тему, reduced motion
и восстановление фокуса через feedback.dom.ts. Listener закрытия использует
Svelte attachment с cleanup. Используется существующий Icon close; новые
зависимости, иконки и лицензии не добавлены.
[vendor/tag-links.css](./src/lib/vendor/tag-links.css) добавляет четыре исходных
правила ссылок Tag, а [vendor/tag-link-reset.css](./src/lib/vendor/tag-link-reset.css) —
два исходных набора общего link reset (14 правил), ограниченных marker Tag.
Преобразование сохраняет specificity a/псевдоклассов, focus-visible и порядок
исходного CSS; остальные ссылки документа этот reset не затрагивает.
[vendor/tag-group.css](./src/lib/vendor/tag-group.css) содержит одно исходное
правило CheckableTagGroup: flex, wrap и token gap; правило извлекается CSS-рецептом.
[vendor/tag-prefix.css.js](./src/lib/vendor/tag-prefix.css.js) — CSS data module
из того же архива: 90 правил Tag, CheckableTag/Group, preset/status и ссылок,
без DatePicker и keyframes. Runtime меняет component class selectors и shared
reset selectors, сохраняя marker ant-tag-css-var, anticon и имена CSS variables.
Scoped native styles используют стабильные markers для root/close и состояния цвета,
поэтому согласованные native behavior и themes работают с локальным prefixCls.
Runtime добавляет native font rule с прежней specificity; disabled close сохраняет
not-allowed, хотя исходный anticon[tabindex] показывает pointer.
[vendor/badge.css](./src/lib/vendor/badge.css) содержит 52 правила Badge и keyframes
antStatusProcessing из того же архива. Селекторы Radio/Space, ссылок и анимации
цифр/появления исключены; корни ограничены :where(.ant-badge-css-var), declarations
сохранены. Badge.svelte добавляет standalone-позиционирование без ScrollNumber,
описания, логические offsets, обводку под фон темы и reduced motion.
Новые зависимости, иконки и лицензии не добавлены.
[vendor/badge-custom-count.css](./src/lib/vendor/badge-custom-count.css) содержит
пять исходных правил готового count и antBadgeLoadingCircle;
[vendor/badge-count-digits.css](./src/lib/vendor/badge-count-digits.css) — три правила
ScrollNumber/SingleNumber slots. Селекторы и декларации извлечены
из того же архива; JS-план разрядов реализован в BadgeDigit/BadgeNumber.
[vendor/badge-zoom.css](./src/lib/vendor/badge-zoom.css) содержит четыре исходных
правила CSSMotion и четыре keyframes для обычного и самостоятельного Badge;
lifecycle реализован в Badge и badge-zoom.dom по @rc-component/motion 1.3.3.
[vendor/badge-prefix.css.js](./src/lib/vendor/badge-prefix.css.js) содержит portable
CSS template из того же архива: 59 правил и шесть keyframes для локального Badge prefix.
Селекторы Badge/common reset меняются в badge-prefix.engine; CSS-variable marker,
глобальные ScrollNumber/icon selectors и keyframe names сохраняются. Тела деклараций
не меняются; обычные vendor-файлы остаются прежними. ES-модуль генерируется рецептом
badge-prefix через тот же CSS CLI, без runtime import с Vite-specific ?raw.
[vendor/badge-ribbon.css](./src/lib/vendor/badge-ribbon.css) содержит 27 правил
Badge.Ribbon из того же архива: wrapper, indicator, content/corner, логические
placement, RTL и preset colors. Декларации сохранены; корни ограничены классами
.ant-ribbon-wrapper-css-var и .ant-ribbon-css-var.
[vendor/avatar.css](./src/lib/vendor/avatar.css) содержит 17 правил Avatar из того же
архива, включая display:block для Image. Group и anticon исключены,
declarations сохранены.
Корни ограничены :where(.ant-avatar-css-var), исходный класс токенов заменён
на .ant-avatar-css-var. Avatar.svelte добавляет Svelte snippets, доступное имя,
версию источника изображения и нативные listeners с cleanup; avatar.dom.ts
подгоняет текст через ResizeObserver без React/@rc-component зависимостей.
Существующая MIT-лицензия сохранена; новые зависимости и сторонние иконки не добавлены.
[vendor/avatar-group.css](./src/lib/vendor/avatar-group.css) содержит три исходных правила
Avatar.Group из того же архива: display, обводку и перекрытие. Declarations
сохранены. AvatarGroup.svelte адаптирует перенос и фон обводки; отдельный
AvatarGroupOverflow.svelte использует существующий Popover и ленивый список
с полными именами. Восстановление фокуса использует feedback.dom.ts.
Avatar сохраняет версию src/srcSet при обновлении spread props с теми же
значениями, Popover игнорирует blur после destroy. Новые зависимости не добавлены.
[vendor/avatar-prefix.css.js](./src/lib/vendor/avatar-prefix.css.js) содержит 24
исходных правила Avatar/Group, включая anticon и Popover. CSS-рецепт проверяет
архив и число правил; runtime меняет component selectors и ограничивает shared
reset/alias declarations текущим prefix через :is/:where с исходной specificity.
Marker, имена CSS variables и глобальные Image/anticon selectors сохраняются;
стили соседних стандартных Avatar не сбрасываются. Native text/icon wrappers,
group wrap/overflow и resource cleanup остаются в Svelte-компонентах.
Пять filled-иконок в [status-icons.ts](./src/lib/status-icons.ts) скопированы из
[Ant Design Icons](https://github.com/ant-design/ant-design-icons/tree/7f2516ac91226d2b41f93b35cb5197c8d94f7189/packages/icons-svg/svg/filled)
и подключены к существующему Icon.svelte с сохранением outline-иконок.
Их отдельная [MIT-лицензия](./src/lib/vendor/LICENSE.ant-design-icons) включена в пакет.
Селекторы
`.css-var-_R_0_` заменены на `:root`/`.ant-svelte-theme` и классы компонентов.
SHA-256 исходного архива записан в заголовке файла.

Компоненты и модели реализованы на Svelte. [theme.css](./src/lib/theme.css) связывает
статические токены компонентов с переключаемыми темами. Текст исходной
[лицензии MIT](./src/lib/vendor/LICENSE.ant-design) сохранён в пакете. Официальная
React-реализация развивается в [ant-design/ant-design](https://github.com/ant-design/ant-design).
