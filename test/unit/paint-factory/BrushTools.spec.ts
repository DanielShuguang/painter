import { FactoryKey } from '@/components/Layout/composition'
import { DrawBrush, DrawShapeType, PaintFactory } from '@/paint-factory'
import { BrushTools } from '@/paint-factory/toolbars'
import { mount } from '@vue/test-utils'
import { NColorPicker, NInputNumber } from 'naive-ui'
import { nextTick } from 'vue'
import { addStage, triggerColorPicker } from '../test-utils'
import OperationMenuBar from '@/components/OperationMenuBar.vue'

describe('BrushTools test', () => {
  const { rootGroup } = addStage()
  const factory = new PaintFactory()
  const wrapper = mount(OperationMenuBar, {
    global: {
      provide: { [FactoryKey as symbol]: factory }
    }
  })
  factory.setRoot(rootGroup).active(DrawShapeType.Brush)

  it('active toolbar', async () => {
    factory.active(DrawShapeType.Text)
    await nextTick()
    expect(wrapper.findComponent(BrushTools).exists()).toBeFalsy()

    factory.active(DrawShapeType.Brush)
    await nextTick()
    expect(wrapper.findComponent(BrushTools).exists()).toBeTruthy()
  })

  it('change brush width', async () => {
    const inputNumber = wrapper.findComponent(NInputNumber)
    const shape = factory.currentShape as DrawBrush

    let brushWidth = 12
    inputNumber.vm.$emit('update:value', brushWidth)
    await nextTick()
    expect(shape.options().brushWidth).toBe(brushWidth)

    brushWidth = 30
    inputNumber.vm.$emit('update:value', brushWidth)
    await nextTick()
    expect(shape.options().brushWidth).toBe(brushWidth)
  })

  it('change brush color', async () => {
    const shape = factory.currentShape as DrawBrush
    const colorPicker = wrapper.findComponent(NColorPicker)

    let color = '#ccc'
    triggerColorPicker(colorPicker, color)
    await nextTick()
    expect(shape.options().nodeConfig.stroke).toContain(color)

    color = '#fff'
    triggerColorPicker(colorPicker, color)
    await nextTick()
    expect(shape.options().nodeConfig.stroke).toContain(color)
  })
})
