<script lang="ts">
  import type { SelectConfig } from './select.types';
  import type { TreeSelectConfig } from './tree-select.types';
  import type { DatePickerConfig } from './date-picker.types';
  import type { CardConfig, CardMetaConfig } from './card.types';
  import type { MentionsComponentConfig } from './mentions.types';
  import type { FloatButtonConfig, FloatButtonGroupConfig } from './float-button.types';
  import type { ButtonConfig } from './button.types';
  import type { TabsConfig } from './tabs.types';
  import type { BadgeRibbonConfig } from './badge-ribbon.types';
  import type { BadgeConfig } from './badge.types';
  import type { TagConfig } from './tag.types';
  import type { AvatarConfig } from './avatar.types';
  import type { TooltipConfig } from './tooltip.types';
  import type { PopoverConfig } from './popover.types';
  import type { PopconfirmConfig } from './popconfirm.types';
  import type { RateConfig } from './rate.types';
  import type { WatermarkConfig } from './watermark.types';
  import type { AffixConfig } from './affix.types';
  import type { BorderBeamConfig } from './border-beam.types';
  import type { MasonryConfig } from './masonry.types';
  import type { SplitterConfig } from './splitter.types';
  import type { QRCodeConfig } from './qrcode.types';
  import type { CalendarConfig } from './calendar.types';
  import type { TimePickerConfig } from './time-picker.types';
  import type { CascaderConfig } from './cascader.types';
  import type { TransferConfig } from './transfer.types';
  import type { PaginationComponentConfig } from './pagination.types';
  import type { ListConfig } from './list.types';
  import type { ListyConfig } from './listy.types';
  import type { TypographyConfig } from './typography.types';
  import type { TourConfig } from './tour.types';
  import type { CarouselConfig } from './carousel.types';
  import type { SliderConfig } from './slider-range.types';
  import type { DividerConfig } from './divider.types';
  import type { FlexConfig } from './flex.types';
  import type { SpinConfig } from './spin.types';
  import type { ProgressConfig } from './progress.types';
  import type { SkeletonConfig } from './skeleton.types';
  import type { EmptyConfig } from './empty.types';
  import type { ResultConfig } from './result.types';
  import type { AlertConfig } from './alert.types';
  import type { CollapseConfig } from './collapse.types';
  import type { SegmentedConfig } from './segmented.types';
  import type { SpaceConfig } from './space.types';
  import type { ColorPickerConfig } from './color-picker.types';
  import type { InputNumberConfig } from './input-number.types';
  import type { RadioConfig } from './radio.types';
  import type { CheckboxConfig } from './checkbox.types';
  import type { SwitchConfig } from './switch.types';
  import type { WaveConfig } from './wave.types';
  import type { GetPopupContainer, GetTargetContainer, RenderEmptyHandler } from './types';
  import type { RangePickerConfig } from './range-picker.types';
  import type { InputConfig } from './input.types';
  import type { InputPasswordConfig } from './input-password.types';
  import type { InputSearchConfig } from './input-search.types';
  import type { InputOTPConfig } from './input-otp.types';
  import type { TextAreaConfig } from './textarea.types';
  import type { Snippet } from 'svelte';
  import { provideConfig, useConfig, type ConfigContext } from './config-context';
  import { provideDesignTokens, useDesignTokenContext } from './theme-context.svelte';
  import { getGridMediaCss, getGridMediaScope } from './grid-style.engine';
  import ThemeScopeStyle from './ThemeScopeStyle.svelte';
  import type { ComponentSize, Variant, Locale, ThemeConfig } from './types';
  import './styles.css';

  /** Наследуемые настройки темы, локали и компонентов для дочернего дерева Svelte. */
  export interface ConfigProviderProps {
    children: Snippet;
    /** Частично переопределяет родительскую тему; остальные поля наследуются. */
    theme?: ThemeConfig;
    /** Общее оформление полей и Card; локальные props, Form и component config имеют приоритет. */
    variant?: Variant;
    select?: SelectConfig;
    treeSelect?: TreeSelectConfig;
    datePicker?: DatePickerConfig;
    card?: CardConfig;
    cardMeta?: CardMetaConfig;
    mentions?: MentionsComponentConfig;
    button?: ButtonConfig;
    tabs?: TabsConfig;
    ribbon?: BadgeRibbonConfig;
    badge?: BadgeConfig;
    tag?: TagConfig;
    avatar?: AvatarConfig;
    tooltip?: TooltipConfig;
    popover?: PopoverConfig;
    popconfirm?: PopconfirmConfig;
    rate?: RateConfig;
    watermark?: WatermarkConfig;
    affix?: AffixConfig;
    borderBeam?: BorderBeamConfig;
    masonry?: MasonryConfig;
    splitter?: SplitterConfig;
    qrcode?: QRCodeConfig;
    calendar?: CalendarConfig;
    timePicker?: TimePickerConfig;
    cascader?: CascaderConfig;
    transfer?: TransferConfig;
    pagination?: PaginationComponentConfig;
    list?: ListConfig;
    listy?: ListyConfig;
    typography?: TypographyConfig;
    tour?: TourConfig;
    carousel?: CarouselConfig;
    slider?: SliderConfig;
    divider?: DividerConfig;
    flex?: FlexConfig;
    spin?: SpinConfig;
    progress?: ProgressConfig;
    skeleton?: SkeletonConfig;
    empty?: EmptyConfig;
    result?: ResultConfig;
    alert?: AlertConfig;
    collapse?: CollapseConfig;
    segmented?: SegmentedConfig;
    space?: SpaceConfig;
    colorPicker?: ColorPickerConfig;
    inputNumber?: InputNumberConfig;
    radio?: RadioConfig;
    checkbox?: CheckboxConfig;
    switch?: SwitchConfig;
    wave?: WaveConfig;
    /** Наследуемый virtual; пока используется Listy. Без него Listy рендерит raw mode. */
    virtual?: boolean;
    /** Producer callback пустого состояния; пока используется List. Наследуется от родителя. */
    renderEmpty?: RenderEmptyHandler;
    /**
     * Наследуемый контейнер popup. Undefined сохраняет родительскую функцию.
     * Используется Tabs, ColorPicker и общими Tooltip/Popover/Dropdown с их потребителями.
     * Tour читает только локальную настройку, как upstream; остальные families ещё переносятся.
     * Функция вызывается только в браузере; ShadowRoot не получает стили из document автоматически.
     */
    getPopupContainer?: GetPopupContainer;
    /** Общий scroll target Affix/Anchor; локальные параметры компонентов имеют приоритет. */
    getTargetContainer?: GetTargetContainer;
    rangePicker?: RangePickerConfig;
    textArea?: TextAreaConfig;
    input?: InputConfig;
    inputPassword?: InputPasswordConfig;
    inputSearch?: InputSearchConfig;
    otp?: InputOTPConfig;
    floatButton?: FloatButtonConfig;
    floatButtonGroup?: FloatButtonGroupConfig;
    /** Наследуемый размер controls; локальный size и Compact имеют приоритет. */
    componentSize?: ComponentSize;
    /** Наследуемое disabled для controls; явное локальное значение уточняет его. */
    componentDisabled?: boolean;
    direction?: 'ltr' | 'rtl';
    /** Частичный словарь с наследованием родительской локали и её подразделов. */
    locale?: Partial<Locale>;
    class?: string;
    style?: string;
  }

  let {
    children,
    theme,
    variant,
    select,
    treeSelect,
    datePicker,
    card,
    cardMeta,
    mentions,
    button,
    tabs,
    ribbon,
    badge,
    tag,
    avatar,
    tooltip,
    popover,
    popconfirm,
    rate,
    watermark,
    affix,
    borderBeam,
    masonry,
    splitter,
    qrcode,
    calendar,
    timePicker,
    cascader,
    transfer,
    pagination,
    list,
    listy,
    typography,
    tour,
    carousel,
    slider,
    divider,
    flex,
    spin,
    progress,
    skeleton,
    empty,
    result,
    alert,
    collapse,
    segmented,
    space,
    colorPicker,
    inputNumber,
    radio,
    checkbox,
    switch: switchConfig,
    wave,
    virtual,
    renderEmpty,
    getPopupContainer,
    getTargetContainer,
    rangePicker,
    textArea,
    input,
    inputPassword,
    inputSearch,
    otp,
    floatButton,
    floatButtonGroup,
    componentSize,
    componentDisabled,
    direction,
    locale,
    class: className = '',
    style
  }: ConfigProviderProps = $props();

  const parent = useConfig();
  const parentDesignTokens = useDesignTokenContext();
  const themeId = $props.id();
  let element = $state<HTMLDivElement>();
  const designTokens = provideDesignTokens(() => theme, themeId, () => element);
  let gridMediaScope = $derived(designTokens.enabled
    ? getGridMediaScope(designTokens.state.token) : undefined);
  let parentGridMediaScope = $derived(parentDesignTokens.enabled
    ? getGridMediaScope(parentDesignTokens.state.token) : undefined);
  let gridMediaCss = $derived(gridMediaScope && gridMediaScope !== parentGridMediaScope
    ? getGridMediaCss(designTokens.state.token) : undefined);
  const config: ConfigContext = {
    get variant() {
      return variant ?? parent.variant;
    },
    get select() {
      return select ?? parent.select;
    },
    get treeSelect() {
      return treeSelect ?? parent.treeSelect;
    },
    get datePicker() {
      return datePicker ?? parent.datePicker;
    },
    get card() {
      return card ?? parent.card;
    },
    get cardMeta() {
      return cardMeta ?? parent.cardMeta;
    },
    get mentions() {
      return mentions ?? parent.mentions;
    },
    get tabs() {
      return tabs ?? parent.tabs;
    },
    get ribbon() {
      return ribbon ?? parent.ribbon;
    },
    get badge() {
      return badge ?? parent.badge;
    },
    get tag() {
      return tag ?? parent.tag;
    },
    get avatar() {
      return avatar ?? parent.avatar;
    },
    get tooltip() {
      return tooltip ?? parent.tooltip;
    },
    get popover() {
      return popover ?? parent.popover;
    },
    get popconfirm() {
      return popconfirm ?? parent.popconfirm;
    },
    get button() {
      return button ?? parent.button;
    },
    get rate() {
      return rate ?? parent.rate;
    },
    get watermark() {
      return watermark ?? parent.watermark;
    },
    get affix() {
      return affix ?? parent.affix;
    },
    get borderBeam() {
      return borderBeam ?? parent.borderBeam;
    },
    get masonry() {
      return masonry ?? parent.masonry;
    },
    get splitter() {
      return splitter ?? parent.splitter;
    },
    get qrcode() {
      return qrcode ?? parent.qrcode;
    },
    get calendar() {
      return calendar ?? parent.calendar;
    },
    get timePicker() {
      return timePicker ?? parent.timePicker;
    },
    get cascader() {
      return cascader ?? parent.cascader;
    },
    get transfer() {
      return transfer ?? parent.transfer;
    },
    get pagination() {
      return pagination ?? parent.pagination;
    },
    get list() {
      return list ?? parent.list;
    },
    get listy() {
      return listy ?? parent.listy;
    },
    get typography() {
      return typography ?? parent.typography;
    },
    get tour() {
      return tour ?? parent.tour;
    },
    get carousel() {
      return carousel ?? parent.carousel;
    },
    get slider() {
      return slider ?? parent.slider;
    },
    get divider() {
      return divider ?? parent.divider;
    },
    get flex() {
      return flex ?? parent.flex;
    },
    get spin() {
      return spin ?? parent.spin;
    },
    get progress() {
      return progress ?? parent.progress;
    },
    get skeleton() {
      return skeleton ?? parent.skeleton;
    },
    get empty() {
      return empty ?? parent.empty;
    },
    get result() {
      return result ?? parent.result;
    },
    get collapse() {
      return collapse ?? parent.collapse;
    },
    get segmented() {
      return segmented ?? parent.segmented;
    },
    get space() {
      return space ?? parent.space;
    },
    get alert() {
      return alert ?? parent.alert;
    },
    get colorPicker() {
      return colorPicker ?? parent.colorPicker;
    },
    get inputNumber() {
      return inputNumber ?? parent.inputNumber;
    },
    get radio() {
      return radio ?? parent.radio;
    },
    get checkbox() {
      return checkbox ?? parent.checkbox;
    },
    get switch() {
      return switchConfig ?? parent.switch;
    },
    get wave() {
      return wave ?? parent.wave;
    },
    get virtual() {
      return virtual ?? parent.virtual;
    },
    get renderEmpty() {
      return renderEmpty ?? parent.renderEmpty;
    },
    get getPopupContainer() {
      return getPopupContainer || parent.getPopupContainer;
    },
    get getTargetContainer() {
      return getTargetContainer ?? parent.getTargetContainer;
    },
    get rangePicker() {
      return rangePicker ?? parent.rangePicker;
    },
    get input() {
      return input ?? parent.input;
    },
    get inputPassword() {
      return inputPassword ?? parent.inputPassword;
    },
    get inputSearch() {
      return inputSearch ?? parent.inputSearch;
    },
    get otp() {
      return otp ?? parent.otp;
    },
    get textArea() {
      return textArea ?? parent.textArea;
    },
    get floatButton() {
      return floatButton ?? parent.floatButton;
    },
    get floatButtonGroup() {
      return floatButtonGroup ?? parent.floatButtonGroup;
    },
    get componentSize() {
      return componentSize ?? parent.componentSize;
    },
    get explicitComponentSize() {
      return componentSize ?? parent.explicitComponentSize;
    },
    get componentDisabled() {
      return componentDisabled ?? parent.componentDisabled;
    },
    get direction() {
      return direction ?? parent.direction;
    },
    get theme() {
      return designTokens.config;
    },
    get themeStyle() {
      return designTokens.style;
    },
    get locale() {
      return {
        ...parent.locale,
        ...locale,
        typography: {
          ...parent.locale.typography,
          ...parent.locale.Text,
          ...locale?.typography,
          ...locale?.Text
        },
        Text: {
          ...parent.locale.typography,
          ...parent.locale.Text,
          ...locale?.typography,
          ...locale?.Text
        },
        global: { ...parent.locale.global, ...locale?.global },
        colorPicker: {
          ...parent.locale.colorPicker, ...parent.locale.ColorPicker,
          ...locale?.colorPicker, ...locale?.ColorPicker
        },
        ColorPicker: {
          ...parent.locale.colorPicker, ...parent.locale.ColorPicker,
          ...locale?.colorPicker, ...locale?.ColorPicker
        },
        tour: { ...parent.locale.tour, ...parent.locale.Tour, ...locale?.tour, ...locale?.Tour },
        Tour: { ...parent.locale.tour, ...parent.locale.Tour, ...locale?.tour, ...locale?.Tour },
        carousel: {
          ...parent.locale.carousel,
          ...parent.locale.Carousel,
          ...locale?.carousel,
          ...locale?.Carousel
        },
        Carousel: {
          ...parent.locale.carousel,
          ...parent.locale.Carousel,
          ...locale?.carousel,
          ...locale?.Carousel
        },
        pagination: { ...parent.locale.pagination, ...locale?.pagination },
        table: { ...parent.locale.table, ...locale?.table },
        inputNumber: { ...parent.locale.inputNumber, ...locale?.inputNumber },
        steps: { ...parent.locale.steps, ...locale?.steps },
        badge: { ...parent.locale.badge, ...locale?.badge },
        avatarGroup: { ...parent.locale.avatarGroup, ...locale?.avatarGroup },
        layout: { ...parent.locale.layout, ...locale?.layout },
        qrcode: { ...parent.locale.qrcode, ...locale?.qrcode },
        transfer: { ...parent.locale.transfer, ...locale?.transfer }
      };
    }
  };

  provideConfig(config);
</script>

{#if designTokens.enabled && theme}
  <ThemeScopeStyle css={designTokens.state.scopeCSS} scope={designTokens.state.key} />
{/if}
{#if gridMediaCss && gridMediaScope}
  <ThemeScopeStyle css={gridMediaCss} scope={gridMediaScope} />
{/if}

<div
  bind:this={element}
  class={[
    'ant-svelte-theme',
    designTokens.enabled && designTokens.state.key,
    designTokens.enabled && designTokens.state.hashId,
    className
  ]}
  data-ant-theme={config.theme.mode}
  data-ant-primary={config.theme.primary}
  data-ant-compact={config.theme.compact || undefined}
  dir={config.direction}
  style={[designTokens.style, style].filter(Boolean).join(';') || undefined}
>
  {@render children()}
</div>
