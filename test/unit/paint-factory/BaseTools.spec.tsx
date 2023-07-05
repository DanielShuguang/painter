import { FactoryKey } from '@/components/Layout/composition'
import { PaintFactory, DrawShapeType, BaseTools } from '@/paint-factory'
import { mount } from '@vue/test-utils'
import { addStage } from '../test-utils'
import OperationMenuBar from '@/components/OperationMenuBar.vue'
import { nextTick } from 'vue'
import { NInputNumber, NMessageProvider } from 'naive-ui'

describe('BaseTools test', () => {
  const { rootGroup } = addStage()
  const factory = new PaintFactory()
  const wrapper = mount(
    <NMessageProvider>
      <OperationMenuBar />
    </NMessageProvider>,
    {
      global: {
        provide: { [FactoryKey as symbol]: factory }
      }
    }
  )
  factory.setRoot(rootGroup)

  beforeEach(() => {
    factory.active(DrawShapeType.Rect)
  })

  it('active toolbar', async () => {
    expect(wrapper.findComponent(BaseTools).exists()).toBeTruthy()
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(2)

    factory.active(DrawShapeType.Text)
    await nextTick()
    expect(wrapper.findComponent(BaseTools).exists()).toBeFalsy()

    factory.active(DrawShapeType.Line)
    await nextTick()
    expect(wrapper.findComponent(BaseTools).exists()).toBeTruthy()
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(2)

    factory.active(DrawShapeType.Circle)
    await nextTick()
    expect(wrapper.findComponent(BaseTools).exists()).toBeTruthy()
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(2)

    factory.active(DrawShapeType.Brush)
    await nextTick()
    expect(wrapper.findComponent(BaseTools).exists()).toBeFalsy()
  })

  it('change stroke width', async () => {
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(2)

    const strokeWidth = 10
    wrapper.findComponent(NInputNumber).vm.$emit('update:value', strokeWidth)
    await nextTick()
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(strokeWidth)

    factory.active(DrawShapeType.Ellipse)
    await nextTick()
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(2)

    wrapper.findComponent(NInputNumber).vm.$emit('update:value', strokeWidth)

    await nextTick()
    expect(factory.currentShape?.options().nodeConfig.strokeWidth).toBe(strokeWidth)
  })
})
