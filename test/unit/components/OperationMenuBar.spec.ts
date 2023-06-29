import { FactoryKey } from '@/components/Layout/composition'
import OperationMenuBar from '@/components/OperationMenuBar.vue'
import { DrawShapeType, PaintFactory } from '@/paint-factory'
import { mount } from '@vue/test-utils'
import { NColorPicker } from 'naive-ui'
import { nextTick } from 'vue'

describe('OperationMenuBar component test', () => {
  const factory = new PaintFactory()

  const wrapper = mount(OperationMenuBar, {
    global: {
      provide: {
        [FactoryKey as symbol]: factory
      }
    }
  })

  it('shape buttons', async () => {
    const shapeBtns = wrapper.findAll('.shape-icon')

    expect(shapeBtns.length).toBe(PaintFactory.shapeMap.size)

    expect(shapeBtns[0].classes()).toContain('is-active')

    for (const btn of shapeBtns.slice(1)) {
      expect(btn.classes()).not.toContain('is-active')
      await btn.trigger('click')
      expect(btn.classes()).toContain('is-active')
    }
  })

  it('color picker', async () => {
    let color = '#ccc'

    factory.active(DrawShapeType.Circle)
    const picker = wrapper.findComponent(NColorPicker)
    picker.getCurrentComponent().emit('update:value', color)
    picker.getCurrentComponent().emit('complete', color)
    await nextTick()
    expect(factory.currentShape?.options().nodeConfig.stroke).toContain(color)

    color = '#fff'
    factory.active(DrawShapeType.Text)
    picker.getCurrentComponent().emit('update:value', color)
    picker.getCurrentComponent().emit('complete', color)
    expect(factory.currentShape?.options().nodeConfig.stroke).toContain(color)
  })
})
