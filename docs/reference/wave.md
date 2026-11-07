# Эффект Wave

> Type: Reference. Поведение Wave закреплённого Ant Design 6.6.8 в Svelte.

Wave добавляет декоративную волну при взаимодействии с Button, Checkbox, Radio,
RadioButton, Switch, интерактивным Tag и Steps с onChange. Нативные controls,
callbacks, формы и порядок фокуса сохраняются. Эффект не создаёт DOM при SSR.

Настройки задаются через ConfigProvider.wave. Точные типы —
[WaveConfig и WaveEffectInfo](../../src/lib/wave.types.ts).

```svelte
<script lang="ts">
  import { Button, ConfigProvider } from 'antd-svelte';
</script>

<ConfigProvider wave={{ triggerType: 'pointerdown' }}>
  <Button type="primary">Действие</Button>
</ConfigProvider>
```

## Настройки и события

По умолчанию используется click. Также поддерживаются mousedown, mouseup,
pointerdown и pointerup. Listener работает в capture-фазе, а несколько событий
одного animation frame дают один эффект с последним событием. Изменение настроек
применяется реактивно; disabled=true отключает только волну, сохраняя callbacks control.

Provider без wave наследует родительский record. Явный объект заменяет его целиком:
wave={} возвращает стандартный эффект и click даже внутри provider с showEffect.

showEffect(element, info) заменяет стандартную волну. Element — выбранный target,
info содержит полный текущий GlobalToken, component, className/hashId, colorSource
и нативный MouseEvent/PointerEvent. Это не React SyntheticEvent; currentTarget
после отложенного вызова имеет обычную нативную семантику. Пользовательский эффект
сам очищает свои ресурсы.

## Правила компонентов

| Компонент | Target и условия |
| --- | --- |
| Button | Native button; href и variants text/link исключены, loading/disabled блокируют волну |
| Checkbox | Внутренний ant-wave-target; стандартный эффект только после включения |
| Radio | Внутренний ant-wave-target; быстрый эффект |
| RadioButton | Вся label-кнопка; обычный эффект |
| Switch | Native button; disabled/loading блокируют волну |
| Tag | Корень при onClick/onclick или единственном прямом anchor в children |
| Steps | Item icon с ant-wave-target, иначе item root; нужен общий onChange и доступный item |

Для Checkbox фильтр checked принадлежит стандартному эффекту: showEffect получает
также выключение. Steps filled передаёт colorSource=color. У CheckableTag нет Wave,
как в upstream. Закрытие Tag сохраняет stopPropagation и не вызывает его onClick.
Непрозрачный Svelte snippet Tag проверяется по отрендеренным прямым children;
React children.type в Svelte отсутствует.
FloatButton, FloatButtonBackTop и trigger FloatButtonGroup наследуют Wave через общий Button;
их info.component равен Button, как в source composition.
Кнопки подтверждения DatePicker/RangePicker и TimePicker/TimeRangePicker также
используют общий Button и получают его Wave, сохраняя native picker lifecycle.
Изменение variant Button или удаление handler/ссылки Tag отключает Wave и очищает
ожидающий либо активный эффект, сохраняя нативный корень Svelte control.

Скрытая цель события, disabled/aria-disabled и leaving roots не запускают волну.
Исходное исключение для utility-классов с disabled: сохраняется.

## Геометрия, цвет и очистка

Цвет берётся из colorSource, затем border-top-color, border-color и background-color.
Исключения для белого и прозрачного повторяют исходный predicate без нормализации
цвета; без подходящего значения CSS использует наследуемый colorPrimary.
Border radius, border offsets и размеры
читаются после действия; ResizeObserver следит за изменением target.

Обычная волна использует box-shadow 0.4s и opacity 2s; быстрые Checkbox/Radio —
motionDurationSlow. Как в официальном UMD, token.motion=false обнуляет длительность
быстрой волны, а фиксированные длительности обычной остаются. Отдельного Wave
override для prefers-reduced-motion в закреплённом CSS нет; wave.disabled управляет
полным отключением эффекта.

Start и active разделены двумя RAF. Завершение собственного opacity transition
удаляет волну; box-shadow и события дочерних элементов этого не делают. Исходный
deadline 5000ms удаляет эффект, если transitionend не пришёл. При unmount очищаются
pending RAF, timers, observers и holder DOM. Повторные эффекты имеют независимый lifecycle.

## Источник и проверки

Перенесены [wave/](https://github.com/ant-design/ant-design/tree/984592267de88fbf9cdaecc96a56629e721c709d/components/_util/wave),
точки подключения шести source families и timing из @rc-component/motion 1.3.3.
Цвета и поведение сверялись также с официальным antd.min.js; React/runtime dependencies
в пакет не добавлены. CSS извлекается рецептом wave из проверенного npm-архива:
[vendor/wave.css](../../src/lib/vendor/wave.css), восемь правил без keyframes.

- [Выбор цвета](../../src/lib/wave.engine.test.ts).
- [SSR публичного пакета](../../tests/package/wave.ssr.test.ts).
- [События, геометрия и lifecycle в Chromium](../../tests/browser/wave.spec.ts),
  маршрут ?fixture=wave.

Лицензии: [Ant Design](../../src/lib/vendor/LICENSE.ant-design),
[rc-util](../../src/lib/vendor/LICENSE.rc-util),
[rc-motion](../../src/lib/vendor/LICENSE.rc-motion).
