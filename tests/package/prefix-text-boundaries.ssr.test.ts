import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import * as UI from 'antd-svelte';

const content = createRawSnippet(() => ({ render: () => '<span>Content</span>' }));
const cases: Record<string, (prefixCls?: string) => ReturnType<typeof render>> = {
  Table: prefixCls => render(UI.Table<{ key: string }>, { props: {
    prefixCls, dataSource: [{ key: 'one' }],
    columns: [{ key: 'key', title: 'Key', dataIndex: 'key' }], pagination: false
  } }),
  Calendar: prefixCls => render(UI.Calendar, { props: { prefixCls } }),
  DatePicker: prefixCls => render(UI.DatePicker, { props: { prefixCls } }),
  RangePicker: prefixCls => render(UI.RangePicker, { props: { prefixCls } }),
  TimePicker: prefixCls => render(UI.TimePicker, { props: { prefixCls } }),
  TimeRangePicker: prefixCls => render(UI.TimeRangePicker, { props: { prefixCls } }),
  DatePickerOpen: prefixCls => render(UI.DatePicker, { props: { prefixCls, defaultOpen: true } }),
  RangePickerOpen: prefixCls => render(UI.RangePicker, { props: { prefixCls, defaultOpen: true } }),
  TimePickerOpen: prefixCls => render(UI.TimePicker, { props: { prefixCls, defaultOpen: true } }),
  TimeRangePickerOpen: prefixCls => render(UI.TimeRangePicker, {
    props: { prefixCls, defaultOpen: true }
  }),
  Affix: prefixCls => render(UI.Affix, { props: { prefixCls, children: content } }),
  Alert: prefixCls => render(UI.Alert, { props: { prefixCls, title: 'Alert' } }),
  Anchor: prefixCls => render(UI.Anchor, { props: {
    prefixCls, affix: false, items: [{ key: 'one', href: '#one', title: 'One' }]
  } }),
  Avatar: prefixCls => render(UI.Avatar, { props: { prefixCls, children: content } }),
  AvatarGroup: prefixCls => render(UI.AvatarGroup, { props: {
    prefixCls, items: [{ key: 'one', label: 'One', text: 'O' }]
  } }),
  Badge: prefixCls => render(UI.Badge, { props: { prefixCls, count: 1, children: content } }),
  BadgeRibbon: prefixCls => render(UI.BadgeRibbon, { props: {
    prefixCls, text: 'Ribbon', children: content
  } }),
  BorderBeam: prefixCls => render(UI.BorderBeam, { props: { prefixCls, children: content } }),
  Breadcrumb: prefixCls => render(UI.Breadcrumb, { props: {
    prefixCls, items: [{ title: 'One' }]
  } }),
  Card: prefixCls => render(UI.Card, { props: { prefixCls, children: content } }),
  Carousel: prefixCls => render(UI.Carousel, { props: {
    prefixCls, items: [{ children: 'One' }]
  } }),
  CheckableTagGroup: prefixCls => render(UI.CheckableTagGroup, { props: {
    prefixCls, options: ['One', 'Two']
  } }),
  CheckableTag: prefixCls => render(UI.CheckableTag, { props: {
    prefixCls, checked: true, children: content
  } }),
  Checkbox: prefixCls => render(UI.Checkbox, { props: { prefixCls, children: content } }),
  CheckboxGroup: prefixCls => render(UI.CheckboxGroup, { props: {
    prefixCls, options: ['One', 'Two']
  } }),
  Col: prefixCls => render(UI.Col, { props: { prefixCls, children: content } }),
  Collapse: prefixCls => render(UI.Collapse, { props: {
    prefixCls, items: [{ key: 'one', label: 'One', children: 'Body' }]
  } }),
  ConfigProvider: prefixCls => render(UI.ConfigProvider, { props: { prefixCls, children: content } }),
  Descriptions: prefixCls => render(UI.Descriptions, { props: {
    prefixCls, items: [{ key: 'one', label: 'One', children: 'Body' }]
  } }),
  FloatButton: prefixCls => render(UI.FloatButton, { props: { prefixCls } }),
  FloatButtonGroup: prefixCls => render(UI.FloatButtonGroup, { props: {
    prefixCls, children: content
  } }),
  InputNumber: prefixCls => render(UI.InputNumber, { props: { prefixCls } }),
  InputOTP: prefixCls => render(UI.InputOTP, { props: { prefixCls } }),
  InputPassword: prefixCls => render(UI.InputPassword, { props: { prefixCls } }),
  InputSearch: prefixCls => render(UI.InputSearch, { props: { prefixCls } }),
  Layout: prefixCls => render(UI.Layout, { props: { prefixCls, children: content } }),
  LayoutSider: prefixCls => render(UI.LayoutSider, { props: { prefixCls, children: content } }),
  LayoutHeader: prefixCls => render(UI.LayoutHeader, { props: { prefixCls, children: content } }),
  LayoutContent: prefixCls => render(UI.LayoutContent, { props: { prefixCls, children: content } }),
  LayoutFooter: prefixCls => render(UI.LayoutFooter, { props: { prefixCls, children: content } }),
  Masonry: prefixCls => render(UI.Masonry, { props: {
    prefixCls, items: [{ key: 'one', data: 'One' }], itemRender: content
  } }),
  QRCode: prefixCls => render(UI.QRCode, { props: { prefixCls, value: 'Content', type: 'svg' } }),
  Radio: prefixCls => render(UI.Radio, { props: { prefixCls, children: content } }),
  RadioGroup: prefixCls => render(UI.RadioGroup, { props: { prefixCls, options: ['One', 'Two'] } }),
  Row: prefixCls => render(UI.Row, { props: { prefixCls, children: content } }),
  Segmented: prefixCls => render(UI.Segmented, { props: { prefixCls, options: ['One', 'Two'] } }),
  Slider: prefixCls => render(UI.Slider, { props: { prefixCls } }),
  SliderRange: prefixCls => render(UI.Slider, { props: { prefixCls, range: true } }),
  Space: prefixCls => render(UI.Space, { props: { prefixCls, items: ['One', 'Two'] } }),
  SpaceCompact: prefixCls => render(UI.SpaceCompact, { props: { prefixCls, children: content } }),
  SpaceAddon: prefixCls => render(UI.SpaceAddon, { props: { prefixCls, children: content } }),
  Splitter: prefixCls => render(UI.Splitter, { props: {
    prefixCls, items: [{ children: content }, { children: content }]
  } }),
  Statistic: prefixCls => render(UI.Statistic, { props: { prefixCls, value: 42 } }),
  Steps: prefixCls => render(UI.Steps, { props: { prefixCls, items: [{ title: 'One' }] } }),
  Switch: prefixCls => render(UI.Switch, { props: { prefixCls } }),
  Tabs: prefixCls => render(UI.Tabs, { props: {
    prefixCls, items: [{ key: 'one', label: 'One', children: content }]
  } }),
  Tag: prefixCls => render(UI.Tag, { props: { prefixCls, children: content } }),
  Timeline: prefixCls => render(UI.Timeline, { props: { prefixCls, items: [{ title: 'One' }] } }),
  TypographyText: prefixCls => render(UI.TypographyText, { props: { prefixCls, children: 'Text' } }),
  TypographyParagraph: prefixCls => render(UI.TypographyParagraph, { props: {
    prefixCls, children: 'Text'
  } }),
  TypographyTitle: prefixCls => render(UI.TypographyTitle, { props: { prefixCls, children: 'Text' } }),
  TypographyLink: prefixCls => render(UI.TypographyLink, { props: {
    prefixCls, href: '#text', children: 'Text'
  } })
};

describe('Stylesheet-free native text boundaries', () => {
  for (const [name, renderCase] of Object.entries(cases)) {
    it.each([undefined, 'local'])(`keeps ${name} text inside its roots with prefix %s`, prefixCls => {
      const body = renderCase(prefixCls).body.replace(/<!--[\s\S]*?-->/g, '');

      expect(body, name).toMatch(/^</);
      expect(body, name).toMatch(/>$/);
    });
  }

  it('keeps FormErrorList messages inside the error root', () => {
    const body = render(UI.FormErrorList, { props: { errors: ['Error'] } })
      .body.replace(/<!--[\s\S]*?-->/g, '');

    expect(body).toMatch(/^</);
    expect(body).toMatch(/>$/);
  });
});
