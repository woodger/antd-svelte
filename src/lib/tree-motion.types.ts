/** CSS transition/animation event либо deadline исходного CSSMotion. */
export type TreeMotionEvent = Event | { deadline: true; };
export type TreeMotionName = string | Partial<Record<
  'appear' | 'enter' | 'leave'
  | 'appearPrepare' | 'enterPrepare' | 'leavePrepare'
  | 'appearStart' | 'enterStart' | 'leaveStart'
  | 'appearActive' | 'enterActive' | 'leaveActive',
  string
>>;

type TreeMotionPrepare = (element: HTMLDivElement) => void | Promise<unknown>;
type TreeMotionStyle = (element: HTMLDivElement, event: null) => string | void;
type TreeMotionEnd = (element: HTMLDivElement, event: TreeMotionEvent) => boolean | void;

/** Native CSSMotion группы: start/active возвращают CSS-строки; prepare можно ожидать. */
export interface TreeMotionConfig {
  motionName?: TreeMotionName;
  /** Собственное значение перекрывает видимость группы, как исходный CSSMotion spread. */
  visible?: boolean;
  /** Tree принудительно включает appear при раскрытии и выключает при сворачивании. */
  motionAppear?: boolean;
  motionEnter?: boolean;
  motionLeave?: boolean;
  motionLeaveImmediately?: boolean;
  motionDeadline?: number;
  forceRender?: boolean;
  removeOnLeave?: boolean;
  leavedClassName?: string;
  eventProps?: { className?: string; style?: string; [key: string]: unknown; };
  onAppearPrepare?: TreeMotionPrepare;
  onEnterPrepare?: TreeMotionPrepare;
  onLeavePrepare?: TreeMotionPrepare;
  onAppearStart?: TreeMotionStyle;
  onEnterStart?: TreeMotionStyle;
  onLeaveStart?: TreeMotionStyle;
  onAppearActive?: TreeMotionStyle;
  onEnterActive?: TreeMotionStyle;
  onLeaveActive?: TreeMotionStyle;
  onAppearEnd?: TreeMotionEnd;
  onEnterEnd?: TreeMotionEnd;
  onLeaveEnd?: TreeMotionEnd;
}
