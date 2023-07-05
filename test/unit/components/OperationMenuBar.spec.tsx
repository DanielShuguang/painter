import { FactoryKey } from '@/components/Layout/composition'
import OperationMenuBar from '@/components/OperationMenuBar.vue'
import { PaintFactory } from '@/paint-factory'
import { mount } from '@vue/test-utils'
import { NMessageProvider } from 'naive-ui'

it('OperationMenuBar component test', async () => {
  const factory = new PaintFactory()

  const wrapper = mount(
    <NMessageProvider>
      <OperationMenuBar />
    </NMessageProvider>,
    {
      global: {
        provide: {
          [FactoryKey as symbol]: factory
        }
      }
    }
  )
  const shapeBtns = wrapper.findAll('.shape-icon')

  expect(shapeBtns.length).toBe(PaintFactory.shapeMap.size)

  expect(shapeBtns[0].classes()).toContain('is-active')

  for (const btn of shapeBtns.slice(1)) {
    expect(btn.classes()).not.toContain('is-active')
    await btn.trigger('click')
    expect(btn.classes()).toContain('is-active')
  }
})
