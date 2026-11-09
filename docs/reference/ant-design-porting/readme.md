# Инструменты переноса Ant Design

> Type: Reference. Текущее устройство реестра, извлечения CSS и браузерных фикстур.

[Сводка покрытия](./status.md) строится из [registry.json](./registry.json).
Публичный API и поведение принадлежат [типам и документации компонентов](../../../readme.md).
Реестр фиксирует состояние аудита и согласованный объём; записи candidate
не означают, что реализация уже запланирована или авторизована.

## Проектные приоритеты

Очередь определена владельцем по потребностям приложений и задаёт порядок работ.
Перечисленные возможности определяют первые этапы, а не заменяют цель переноса
актуального API: поведение сверяется с закреплённым Ant Design и его зависимостями.

1. **TextArea / Input.TextArea**: native управляемое значение, name/rows/maxlength,
   required/disabled/readonly, ошибки, input и selection events.
2. **Удалённый Select**: управляемый search, callback, loading/error, отключение
   local filter, подгрузка и выбранные значения вне текущей выдачи. Сетевые запросы
   остаются у потребителя; сам Select уже существует.
3. **DatePicker с временем, затем RangePicker**: ввод/календарь, clear, ограничения,
   клавиатура, locale и формы. Режим Dayjs и точность повторяют upstream;
   прикладная UTC/ISO-сериализация не входит в компонентный контракт.
4. **Upload**: несколько файлов, controlled list, выбор/drop, ручной запуск,
   ошибки и удаление. Поведение отправки сверяется с upstream; прикладные
   серверные endpoints не входят в компонентный перенос.
5. **Tree, затем TreeSelect**: стабильные keys, раскрытие/выбор/клавиатура,
   lazy children, loading/error.
6. **Menu**: native links, selected item, horizontal/vertical, группы, подменю,
   keyboard navigation.
7. **Позже**: AutoComplete, Mentions и Image preview после основных форм и выбора.

## Реестр

Служебные команды объединены в `tools/cli.mjs`. `icore` установлен как
dev-зависимость и разбирает пути команд, позиционные аргументы и схемы опций;
проверки реестра и извлечение CSS выполняют собственные обработчики.

```sh
npm run cli -- --help
npm run cli -- registry --help
npm run cli -- css --help
```

Команды инструментов выполняются из корня репозитория библиотеки. Локальные
пути evidence, CSS output,
`.upstream` и `--archive=path` отсчитываются от корня репозитория.

Перенос актуального API Ant Design 6.6.8 выполняется автономно по поручению владельца:
порядок компонентов определяется зависимостями и готовностью эталона. Перед
реализацией candidate переводится в target с конкретным объёмом и evidence.
Результат каждого завершённого этапа сохраняется отдельным Git-коммитом после
релевантных проверок; промежуточное согласование готовых задач не требуется.
Существующие актуальные Svelte-контракты и согласованные адаптации сохраняются.
Deprecated API исключён из целевой библиотеки и удаляется, включая уже реализованные
компоненты, props, методы, значения и алиасы токенов. Удаляются также код совместимости,
отдельные стили, тесты, фикстуры и документация этого слоя; актуальные замены сохраняются.
Deprecated определяется по закреплённому Ant Design 6.6.8 и применимым зависимостям,
а не по возрасту API или наличию слова legacy во внутреннем имени.
V1-ready остаётся оценкой первого объёма, а не подтверждением полного переноса.
Итоговый отчёт должен отдельно учитывать весь API эталона, непокрытые возможности,
поведенческие отличия и фактически выполненные проверки. Push и публикация
не входят в этот workflow.

Явные ошибки upstream не воспроизводятся только ради совпадения с эталоном.
В `note` соответствующей feature записываются закреплённая версия и ревизия,
воспроизведение, наблюдаемая ошибка и выбранное поведение Svelte. Спорные случаи
отмечаются как наблюдения для отдельного разбора с владельцем; неожиданное
поведение само по себе не считается ошибкой. Существующие публичные контракты
не меняются без необходимости.

Одна карточка соответствует семейству каталога. Avatar и Avatar.Group учитываются
вместе с сопоставлением экспортов Avatar и AvatarGroup. Аналогично сгруппированы
Checkbox.Group, Radio.Group, Tag.CheckableTag и Form.Item. Фабрики createForm,
createMessage/createNotification учитываются в API, но не прибавляют компоненты.
Default exports из *.component обозначают Svelte component facades со статическим API
и считаются наравне с прямыми *.svelte exports.
Theme API и useToken учтены в семействе ConfigProvider и не добавляют Svelte-компонент.

Состав каталога 6.6.8 закреплён в данных: 73 позиции, включая Icon, Util и
deprecated List; внешние Pro Components не включены. Экспорты Row/Col относятся
к Grid, а deprecated BackTop не является отдельной позицией этого каталога.
Scope target обозначает уже принятый объём, candidate — область для решения,
excluded требует пояснения. Подробные пилотные карточки — Avatar, Select и DatePicker.
Для остальных записаны публичные экспорты, известные ограничения и unreviewed
для ещё не выполненного детального аудита. Это не утверждение о неработоспособности
существующих v1.

Общие поля upstream задают версию, Git revision, URL и SHA-256 npm-архива.
Карточка содержит upstreamPath, exports, известные dependencies,
ссылки evidence, priority и effort. UpstreamPackages хранит диапазон из package.json;
referenceVersion остаётся null, пока точная изученная версия зависимости не выбрана.
Пустой dependencies означает отсутствие записанных связей, а не доказанное
отсутствие любых импортов.

Features описывают функциональные блоки, а не повторяют TypeScript props:

| State | Значение |
| --- | --- |
| unreviewed | Детальный аудит не выполнен |
| missing | Возможность отсутствует в публичном переносе |
| partial | Есть реализация с указанными ограничениями |
| supported | Поддержанный объём проверен и связан с evidence |

RequiredForV1 отмечает критерии выбранного первого объёма. V1-ready вычисляется,
когда все эти критерии supported и reviewedRevision совпадает с целевой ревизией.
Будущие расширения продолжают отображаться как пробелы. Изменение эталонной
ревизии помечает ранее сверенные реализации needs-review. Отсутствие публичного
экспорта показывается отдельно как not-started.

```sh
npm run cli -- registry check
npm run cli -- registry check --upstream
npm run cli -- registry show avatar
npm run cli -- registry report
```

Check проверяет идентификаторы, состояния, зависимости и циклы, публичные экспорты,
существование локальных evidence и актуальность генерируемой сводки.
Обычный check работает без сети и без локального upstream; отсутствие клона
сообщается явно. С --upstream требуется чистый checkout заданной ревизии.
Report детерминированно перезаписывает только status.md; show выводит карточку.
Проверка ссылок на тесты не выполняет тесты и не подтверждает их прохождение.

## Извлечение CSS

[Рецепты](../../../tools/ant-design-css-recipes.json) воспроизводят существующие
vendor/avatar.css, avatar-group.css, badge.css, divider.css, flex.css, statistic.css,
segmented.css, grid.css, grid-responsive.css.js, layout.css, descriptions.css, card.css, breadcrumb.css,
space.css, space-compact.css, space-addon.css, input-number-compact.css, affix.css, anchor.css, steps.css, timeline.css, float-button.css, date-picker.css, menu.css, mentions.css, image.css, rate.css, otp.css, border-beam.css, masonry.css, splitter.css, qrcode.css, radio-button.css, calendar.css, transfer.css, pagination.css.
Рецепты spin и spin-prefix извлекают 35 правил Spin, включая fullscreen/percent;
первый сохраняет два keyframes, второй выводит локальный CSS prefix template.
Рецепты progress и progress-prefix извлекают 40 правил line/circle CSS, steps, success и
percentPosition; первый сохраняет один keyframe, второй выводит CSS data module.
Рецепты skeleton и skeleton-prefix извлекают 48 правил основного Skeleton и пяти primitives;
первый сохраняет один keyframe, второй выводит CSS data module для локального prefix.
Рецепты listy, typography, tour и carousel воспроизводят одноимённые vendor CSS.
Рецепт slider-range воспроизводит отдельный CSS диапазона; прежний slider.css
одиночного control не перезаписывается.
Рецепт slider-prefix выводит CSS data module из 54 правил для обоих режимов;
defaults ограничены корнем, shared marker и CSS variable names сохраняются.
Рецепт divider-prefix выводит аналогичный data module из 27 правил Divider;
defaults ограничены корнем, интеграция ColorPicker исключена.
Рецепт button-prefix выводит 113 правил Button, включая варианты, размеры,
loading и Compact. Deprecated ButtonGroup и token declarations исключены;
component defaults имеют нулевую specificity, чтобы сохранить legacy theme bridge.
Runtime разделяет local classes и общий namespace служебных переменных.
Рецепт float-button-prefix выводит 42 правила FloatButton/Group/BackTop. Runtime
сохраняет component tokens, разделяет local classes и global Button/progress
namespace; root selector сохраняет исходный приоритет FloatButton после Button
при любом порядке head styles. Существующий scoped WAAPI fade остаётся в Native.
Рецепт radio-prefix выводит 99 правил Radio/RadioButton/RadioGroup. Namespace
component tokens сохранён, Badge selectors используют общий prefix. Неэффективный
Source selector с button-wrapper исключён; defaultChecked wrapper observation
хранится raw и с public checked=true counterpart. В radio-button восстановлены
три пропущенных Group/Badge rules: vertical width/margin и z-index счётчика;
normal radio.css сохраняется.
Рецепт checkbox-prefix выводит 31 правило Checkbox/Group, включая hover media
query, mixed/disabled и интеграцию Row. Runtime сохраняет token markers и общий
namespace Row. Raw/fresh Inner measurements отдельно фиксируют Source cache
shared local class; native input/form/fieldset contracts не меняются.
Рецепт switch-prefix выводит 47 правил Switch в CSS module для local/shared
prefix. Runtime меняет root/state/handle/caption classes, сохраняя component
variables, внешний anticon namespace и прежний native max-width adapter.
Рецепт input-prefix выводит 142 правила Input/TextArea, включая textarea selectors,
resize/autoSize, affix, clear/count, variants/sizes и Compact. Deprecated Group и
семейства InputNumber/Search/OTP исключены; runtime сохраняет canonical token
variables/markers и ограничивает defaults владельцем. Password/Search/OTP имеют
отдельные prefix API и подключены отдельными рецептами.
Рецепт input-password-prefix выводит четыре исходных icon rules. Runtime независимо
адресует Input root и Password icon, исправляя Source предположение об общем имени;
raw и public paired-prefix counterpart сохранены в browser reference. Native toggle
reset, token variables и события не меняются.
Рецепт input-search-prefix выводит 16 правил Search. Runtime сохраняет component
variables, разделяет local Search и общий Button/private variable namespace.
Корень получает Input component tokens, включая small-button min-height. Source
Compact remount, empty content и shared-class cache observations хранятся raw и с
public/fresh counterparts; Native state/DOM и прежняя icon-only кнопка сохранены.
Рецепт input-otp-prefix выводит 16 правил OTP. Runtime передаёт owner prefix
wrappers/mask/input/separator; вложенный Input использует общий namespace.
Canonical variables/markers сохранены, Input tokens применяются к группе.
Source пропуск локального mask prefix записан raw/matched public ConfigProvider
замерами; native values/keyboard/ref/selection contracts не меняются.
Рецепт input-number-prefix выводит 124 исходных правила обоих modes, вариантов,
размеров, affixes/actions и Compact. Deprecated addons/token declarations исключены;
canonical component variables/marker и native geometry adapters сохранены.
Рецепт segmented-prefix выводит data module из 38 правил Segmented для локального
prefixCls; runtime сохраняет CSS variables/marker и ограничивает defaults корнем.
Рецепт flex-prefix выводит data module из 32 правил Flex без typography reset;
runtime ограничивает каждый selector собственным root.
Рецепт statistic-prefix выводит data module из 14 правил Statistic; runtime
сохраняет namespace токенов и изолирует alias prefixes marker своего корня.
Рецепт qrcode-prefix выводит 11 правил QRCode CSS data module; root/borderless
defaults ограничены marker, остальные namespace Button/Spin и токенов сохраняются.
Рецепт timeline-prefix выводит 43 правила Timeline поверх Steps dot; локальный
prefix меняет Timeline selectors, namespace Steps и токенов сохраняются.
Рецепт steps-prefix выводит 137 правил Steps, включая layouts и progress;
runtime изолирует root states, сохраняет token namespace и deprecated exclusions.
Col local/shared prefixes повторно используют 1027 rules grid-responsive без
дополнительной копии stylesheet. Runtime меняет Col classes и общий namespace
private Col/Grid variables; scope учитывает оба prefixes и media thresholds.
Native Form selectors сохраняют specificity и поддерживают span/breakpoint
attributes; FormItem display bridge сохраняет default layout. Source shared local
class private-flex cache записан raw/fresh; Form prefix/media подключены отдельно.
Рецепт form-prefix выводит 99 исходных rules без collapse motion. Canonical Form
CSS исключает parts с отдельным scope, сохраняя specificity; runtime подключает
local Form/Item classes, global Col/private Form/Grid namespaces и global screen*Max.
Col span/breakpoint metadata сохранены. Raw и fresh measurements отделяют Source
cache defects; store/validation/ref/focus и native ErrorList motion не меняются.
Рецепт rate-prefix выводит те же 21 правило Rate с native >button adapter;
runtime меняет root/state/part selectors и character prefix, сохраняя canonical
token marker/variables. Tooltip использует самостоятельный общий namespace.
Рецепт layout-prefix выводит 35 flat rules Layout/Sider; runtime выбирает свою
группу, сохраняет Menu namespace и ограничивает defaults/state selectors корнем.
Тот же template используется для Header/Content/Footer: выбираются selectors
своей роли, scoped defaults добавляются только standalone-секциям.
Рецепт color-picker извлекает trigger, palette, sliders, inputs, presets и compact.
Рецепт input-number-features извлекает variants, spinner, prefix/suffix и addon;
прежние outlined/compact файлы не перезаписываются.
Рецепт switch побайтно воспроизводит прежние 47 правил, включая reduced motion;
заменяется только исходный CSS-variable root selector.
Рецепт overlay-color сохраняет 65 исходных preset rules Tooltip и Popover
без преобразований; Popconfirm использует Popover classes. Inverse classes
в исходном CSS этих компонентов не имеют цветовой заливки. Собственный цвет
и native изоляция вложенного contrast принадлежат компонентам, не CSS-рецепту.
Рецепты tooltip-prefix, popover-prefix и popconfirm-prefix выводят CSS data modules:
58, 72 и 11 правил соответственно. Локальная подстановка меняет component classes,
сохраняя имена variables, markers и внешний Popover у Popconfirm. Motion/unique
исключены; viewport/focus adapters остаются в Svelte-компонентах.
Остальные текущие vendor-файлы
этим выпуском инструмента не перегенерируются. Новый компонент получает отдельный
проверенный рецепт: include/exclude для селекторов, replacements, keyframes,
ожидаемое число правил, заголовок происхождения и путь вывода. Необязательные
declarationReplacements меняют только тела обычных правил, сохраняя selectors
и keyframes; excludeAtRules исключает явно заданные at-rule scopes вместе с их
дочерними правилами. Steps исключает контейнеры deprecated descriptionMaxWidth;
его рецепт содержит 137 правил. Удаляемые token declarations перечислены в
соответствующих рецептах. Исходный vendor/antd.css пока не имеет полного рецепта;
из него удалены те же старые declarations, а disabled Button читает текущий
colorBorderDisabled с native fallback colorBorder.

```sh
npm run cli -- css --list
npm run cli -- css all --check --fetch
npm run cli -- css badge
npm run cli -- css all --check
```

Путь архива можно передать как `--archive=path` или `--archive path`.
`--list` используется отдельно от выбора рецепта и параметров извлечения.
Коды завершения: 0 при успехе, 1 при ошибке аргументов или выполнении.
JSON/CSS выводятся в stdout; диагностические сообщения и ход извлечения — в stderr.
Рецепт с format="module" выводит ES-модуль в vendor/*.css.js: default export
содержит тот же извлечённый CSS. Это позволяет библиотеке использовать CSS в runtime
без Vite-specific imports; hash, selector/keyframe checks и --check/--write сохраняются.

Без --check/--write выводится предварительный CSS или CSS-модуль в stdout.
При выборе all preview остаётся общим CSS, включая CSS из module-рецептов.
--check сверяет результат
с текущим vendor-файлом; --write явно записывает результат. Перед записью всех
выбранных файлов проверяются рецепты и извлечение. Получение npm-архива допускается
только с --fetch, через зафиксированный официальный URL. Кэш находится в
`.upstream/artifacts/antd-6.6.8.tgz`, исключён из Git и используется офлайн.
Для другого локального файла передайте --archive=path; SHA-256 проверяется всегда.
Установка пакетов не выполняется.

Разбор сохраняет тела деклараций, фильтрует части списков селекторов и сохраняет
области media/supports/container/layer. Явно перечисленные keyframes сохраняются;
appendRootKeyframes может переместить в конец только корневые keyframes, как
в существующем Badge. Селекторные преобразования перечисляются в рецепте.
Необязательный scope задаёт prelude внешнего @scope для выбранных правил;
expectedRules по-прежнему считает исходные style rules. Тела деклараций и вложенные
media/supports/container/layer сохраняются. Рецепт menu-theme-scope добавляет
ограниченные light/dark правила для вложенных native popover; обычный menu CSS
остаётся базовым оформлением. :where(:scope) в replacements сохраняет specificity.
Несовпадение хеша, потеря keyframes или неожиданное число правил завершаются
ошибкой. Инструмент читает только package/dist/antd.css из архива и не распаковывает
его содержимое на диск. Для произвольных иных at-rules потребуется расширить
поддерживаемый рецепт/разбор; автоматическое полное покрытие CSS-синтаксиса не заявлено.

## Интеграционные подтверждения

В schemaVersion 2 локальные evidence остаются путями относительно библиотеки.
Ссылки вида `integration:button` и `integration:button/compact-context` обозначают
стабильные контракты потребителя. Идентификатор должен относиться к существующему
семейству и, если указан, его функциональному блоку. Локальная проверка не читает
файлы другого репозитория и явно сообщает число таких контрактов.

Метаданные доступны через публичный вход `antd-svelte/porting/registry.json`.
Потребитель сопоставляет контракты со своими примерами, SSR/e2e тестами и модулями
фикстур в собственном manifest и проверяет их в своём репозитории. Переименование
его файлов не требует менять реестр библиотеки; стабильный идентификатор остаётся.

Компонентные SSR- и браузерные подтверждения записаны локальными путями
`tests/package` и `tests/browser`. Прикладные сценарии и каталог фикстур
потребителя остаются в его manifest. Состояния аудита,
requiredForV1 и известные пробелы при разделении не пересматриваются. Успешный
локальный check не подтверждает чужие файлы или выполнение тестов.

Наследование direction/locale у Select и Modal проверяется через
`?fixture=config-provider`: [фикстура](../../../tests/browser/fixtures/ConfigProviderFixtures.svelte)
использует те же BasicFixtures и createControls, что общая страница;
[сценарий](../../../tests/browser/config-provider.spec.ts) сохраняет проверки controls
и dialog. Перед массовыми DOM-операциями тесты ожидают mount ленивой фикстуры:
evaluateAll сам не ожидает появления элементов.

Общий Input/Select-набор открывает `?fixture=input-select`. Его
[фикстура](../../../tests/browser/fixtures/InputSelectFixtures.svelte) объединяет
BasicFixtures input/select/select-numeric с одной createControls; label/input IDs,
события и модель общие с прежней страницей. Root IDs имеют префикс для изоляции
каталога. [Сценарии](../../../tests/browser/input-select.spec.ts) сохраняют проверки
клавиатуры, поиска, disabled overrides, числового нуля и FormData.

Для полной проверки этапа нужны собственные проверки библиотеки и проверки
интеграции приложения с установленным пакетом. Компонентный браузерный стенд
принадлежит библиотеке; галерея и прикладные сценарии принадлежат потребителю.
Ни один из стендов не требуется для установки или сборки другого репозитория.

Deprecated Input/InputNumber addons исключены из runtime и CSS. В исходном
vendor/antd.css удалены 48 правил группировки, а из смешанных selectors удалены
только старые классы; текущие selectors и declarations сохранены. Рецепт
input-number-features исключает старый addon selector и содержит 64 правила.
