<script lang="ts">
  import { Checkbox, CheckboxGroup, Col, ConfigProvider, Row } from 'antd-svelte';
</script>

{#snippet rich()}<strong>Rich option</strong>{/snippet}

<ConfigProvider checkbox={{
  class: 'checkbox-context',
  style: 'color:red',
  classNames: { root: 'context-root', icon: 'context-icon', label: 'context-label' },
  styles: { root: 'color:blue', icon: 'outline:1px solid red', label: 'color:purple' }
}}>
  <Checkbox defaultChecked indeterminate
    classNames={info => ({ root: `local-${info.props.checked}-${info.props.indeterminate}` })}
    styles={{ root: 'color:green', icon: 'opacity:.5' }} style="color:orange">Semantic checkbox</Checkbox>
  <CheckboxGroup value={[false]} name="children" aria-label="Children group">
    <Row><Col span={12}><Checkbox value={false}>False child</Checkbox></Col>
      <Col span={12}><Checkbox value={0}>Zero child</Checkbox></Col></Row>
    <Checkbox skipGroup defaultChecked value="skip" name="independent">Skip child</Checkbox>
    <CheckboxGroup options={['nested']} defaultValue={['nested']} name="nested" />
  </CheckboxGroup>
  <CheckboxGroup options={[{
    value: 0,
    label: rich,
    id: 'rich-checkbox',
    title: 'Rich title',
    className: 'rich-class',
    style: 'color:green',
    required: true
  }]} value={[0]} />
</ConfigProvider>
