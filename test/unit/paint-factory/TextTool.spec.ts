import { FactoryKey } from '@/components/Layout/composition'
import { PaintFactory, DrawShapeType, TextTools, DrawText } from '@/paint-factory'
import { mount } from '@vue/test-utils'
import { addStage, triggerColorPicker } from '../test-utils'
import OperationMenuBar from '@/components/OperationMenuBar.vue'
import { nextTick } from 'vue'
import { NColorPicker, NInputNumber, NSelect } from 'naive-ui'

describe('TextTools test', () => {
  const { rootGroup } = addStage()
  const factory = new PaintFactory()
  const wrapper = mount(OperationMenuBar, {
    global: {
      provide: { [FactoryKey as symbol]: factory }
    }
  })
  factory.setRoot(rootGroup)

  beforeEach(() => {
    factory.active(DrawShapeType.Text)
  })

  it('active toolbar', async () => {
    factory.active(DrawShapeType.Circle)
    await nextTick()
    expect(wrapper.findComponent(TextTools).exists()).toBeFalsy()

    factory.active(DrawShapeType.Text)
    await nextTick()
    expect(wrapper.findComponent(TextTools).exists()).toBeTruthy()
  })

  it('change font style ', async () => {
    const shape = factory.currentShape as DrawText
    const styleSelect = wrapper.findComponent(NSelect)

    expect(shape.options().nodeConfig.fontStyle).toBe('normal')

    let fontStyle = 'bold'
    styleSelect.vm.$emit('update:value', fontStyle)
    await nextTick()
    expect(shape.options().nodeConfig.fontStyle).toBe(fontStyle)

    fontStyle = 'italic'
    styleSelect.vm.$emit('update:value', fontStyle)
    await nextTick()
    expect(shape.options().nodeConfig.fontStyle).toBe(fontStyle)
  })

  it('change font size', async () => {
    const shape = factory.currentShape as DrawText
    const numInput = wrapper.findComponent(NInputNumber)

    expect(shape.options().nodeConfig.fontSize).toBe(12)

    let size = 15
    numInput.vm.$emit('update:value', size)
    await nextTick()
    expect(shape.options().nodeConfig.fontSize).toBe(size)

    size = 30
    numInput.vm.$emit('update:value', size)
    await nextTick()
    expect(shape.options().nodeConfig.fontSize).toBe(size)
  })

  it('change font color', async () => {
    const shape = factory.currentShape as DrawText
    const colorPicker = wrapper.findComponent(NColorPicker)

    let color = '#ccc'
    triggerColorPicker(colorPicker, color)
    await nextTick()
    expect(shape.options().nodeConfig.fill).toContain(color)

    color = '#fff'
    triggerColorPicker(colorPicker, color)
    await nextTick()
    expect(shape.options().nodeConfig.fill).toContain(color)
  })
})
