import { FactoryKey } from '@/components/Layout/composition'
import PaintBoard from '@/components/PaintBoard/PaintBoard.vue'
import { DrawShapeType, PaintFactory } from '@/paint-factory'
import { mount } from '@vue/test-utils'
import { Group } from 'konva/lib/Group'
import { stageMouseClick, stageMouseMove, wait } from '../test-utils'
import { nextTick } from 'vue'
import { Stage } from 'konva/lib/Stage'
import { Text } from 'konva/lib/shapes/Text'

const factory = new PaintFactory()

describe('PaintBoard component test', () => {
  const wrapper = mount(PaintBoard, {
    global: {
      provide: {
        [FactoryKey as symbol]: factory
      }
    }
  })
  const stage = factory.getRoot()?.getStage()!

  it('init factory', () => {
    expect(factory.getRoot()).instanceOf(Group)
  })

  it('text editor', async () => {
    factory.active(DrawShapeType.Text)

    drawTextShape(stage)
    await wait(0)

    let textarea = wrapper.find<HTMLTextAreaElement>('.canvas-input')
    expect(textarea.element).instanceOf(HTMLTextAreaElement)

    const content = 'this is a text'

    await textarea.setValue(content)
    await textarea.trigger('keyup', { key: 'Escape' } as KeyboardEventInit)

    await nextTick()

    textarea = wrapper.find<HTMLTextAreaElement>('.canvas-input')
    expect(textarea.exists()).toBeFalsy()
    let text = factory.getRoot()?.findOne<Text>('Text')
    expect(text?.text()).not.toBe(content)
    text?.destroy()

    drawTextShape(stage)
    await wait(0)

    textarea = wrapper.find<HTMLTextAreaElement>('.canvas-input')
    await textarea.setValue(content)
    await textarea.trigger('keyup', { key: 'Enter', ctrlKey: true } as KeyboardEventInit)

    await nextTick()

    textarea = wrapper.find<HTMLTextAreaElement>('.canvas-input')
    expect(textarea.exists()).toBeFalsy()
    text = factory.getRoot()?.findOne<Text>('Text')
    expect(text?.text()).toBe(content)
  })
})

function drawTextShape(stage: Stage) {
  stageMouseClick(stage, { x: 100, y: 150 })
  stageMouseMove(stage, { x: 300, y: 450 })
  stageMouseClick(stage, { x: 300, y: 450 })
}
