/** Native событие окончания CSS motion либо исходный deadline без DOM event. */
export type TabsMotionEvent = Event | { deadline: true; };

/** Имена фаз CSSMotion; string использует suffix appear/enter/leave и start/active. */
export type TabsMotionName = string | Partial<Record<
  'appear' | 'enter' | 'leave'
  | 'appearPrepare' | 'enterPrepare' | 'leavePrepare'
  | 'appearStart' | 'enterStart' | 'leaveStart'
  | 'appearActive' | 'enterActive' | 'leaveActive',
  string
>>;

type TabsMotionPrepare = (element: HTMLDivElement) => void | Promise<unknown>;
type TabsMotionStyle = (element: HTMLDivElement, event: null) => string | void;
type TabsMotionEnd = (element: HTMLDivElement, event: TabsMotionEvent) => boolean | void;

/**
 * Native CSSMotion для панели. Start/active возвращают CSS-строки и получают event=null.
 * Prepare работает и при выключенном motion; end=false откладывает завершение.
 * Prepare/start видят DOM с prepare classes; active читает start classes.
 * React children/internalRef не используются исходным TabPanelList.
 */
export interface TabsPaneMotion {
  motionName?: TabsMotionName;
  /** Собственное поле перекрывает active панели; undefined означает исходное true. */
  visible?: boolean;
  /** @defaultValue true */
  motionAppear?: boolean;
  /** @defaultValue true */
  motionEnter?: boolean;
  /** @defaultValue true */
  motionLeave?: boolean;
  motionLeaveImmediately?: boolean;
  /** Положительный timeout в ms после active; 0 не задаёт deadline. */
  motionDeadline?: number;
  /** Собственное поле перекрывает item.forceRender. */
  forceRender?: boolean;
  /** Собственное поле перекрывает native destroyOnHidden; undefined означает true. */
  removeOnLeave?: boolean;
  leavedClassName?: string;
  /** CSSMotion eventProps: стабильные className/style; остальные поля не читает TabPanelList. */
  eventProps?: { className?: string; style?: string; [key: string]: unknown; };
  onAppearPrepare?: TabsMotionPrepare;
  onEnterPrepare?: TabsMotionPrepare;
  onLeavePrepare?: TabsMotionPrepare;
  onAppearStart?: TabsMotionStyle;
  onEnterStart?: TabsMotionStyle;
  onLeaveStart?: TabsMotionStyle;
  onAppearActive?: TabsMotionStyle;
  onEnterActive?: TabsMotionStyle;
  onLeaveActive?: TabsMotionStyle;
  onAppearEnd?: TabsMotionEnd;
  onEnterEnd?: TabsMotionEnd;
  onLeaveEnd?: TabsMotionEnd;
  onVisibleChanged?: (visible: boolean) => void;
}

/** Настройки Tabs.animated; при tabPane=true Ant Design заменяет custom motion исходным switch. */
export interface TabsAnimatedConfig {
  inkBar?: boolean;
  tabPane?: boolean;
  /** Без tabPane включает собственный CSSMotion; tabPane=false сохраняет motion без body class. */
  tabPaneMotion?: TabsPaneMotion;
}
