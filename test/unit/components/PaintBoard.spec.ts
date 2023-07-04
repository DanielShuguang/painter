import { FactoryKey } from '@/components/Layout/composition'
import PaintBoard from '@/components/PaintBoard/PaintBoard.vue'
import { CommonCommands, DrawShapeType, PaintFactory } from '@/paint-factory'
import { mount } from '@vue/test-utils'
import { Group } from 'konva/lib/Group'
import { nodeContextmenu, stageMouseClick, stageMouseMove, wait } from '../test-utils'
import { nextTick } from 'vue'
import { Stage } from 'konva/lib/Stage'
import { Text } from 'konva/lib/shapes/Text'
import { MenuOption, NMenu } from 'naive-ui'
import { ContextmenuService } from '@/paint-factory/contextmenu'

describe('PaintBoard component test', () => {
  const factory = new PaintFactory()
  const contextService = new ContextmenuService()
  const wrapper = mount(PaintBoard, {
    global: {
      provide: {
        [FactoryKey as symbol]: factory
      }
    }
  })
  const rootGroup = factory.getRoot()!
  const stage = rootGroup.getStage()!

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
    text?.destroy()
  })

  it('trigger contextmenu', async () => {
    stage.dispatchEvent(new MouseEvent('contextmenu', { clientX: 100, clientY: 100 }))
    await nextTick()
    expect(document.querySelector('.contextmenu-modal')).toBeTruthy()
    expect(document.querySelectorAll('.n-menu-item').length).toBe(1)

    dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(document.querySelector('.contextmenu-modal')).toBeFalsy()

    drawTextShape(stage)
    await nextTick()
    const text = stage.findOne<Text>('Text')
    nodeContextmenu(stage, text)
    await nextTick()
    expect(document.querySelector('.contextmenu-modal')).toBeTruthy()
    expect(document.querySelectorAll('.n-menu-item').length).toBe(2)

    const menuEl = wrapper.findComponent(NMenu)
    const options = menuEl.props().options as MenuOption[]
    const deleteOpt = options.find(el => el.key === CommonCommands.Delete)
    expect(deleteOpt).toBeTruthy()

    let hasRun = false
    const handle = () => (hasRun = true)
    stage.on(CommonCommands.Delete, handle)

    menuEl.getCurrentComponent().emit('update-value', CommonCommands.Delete, deleteOpt)
    await nextTick()
    expect(hasRun).toBeTruthy()
    expect(document.querySelector('.contextmenu-modal')).toBeFalsy()
    stage.off(CommonCommands.Delete, handle)

    contextService.unregisterMenu(CommonCommands.Delete)
    nodeContextmenu(stage, text)
    await nextTick()

    expect(document.querySelectorAll('.n-menu-item').length).toBe(1)
    dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    contextService.toggle(false)
    nodeContextmenu(stage, text)
    await nextTick()
    expect(document.querySelector('.contextmenu-modal')).toBeFalsy()
    expect(document.querySelectorAll('.n-menu-item').length).toBe(0)

    contextService.toggle(true)
    nodeContextmenu(stage, text)
    await nextTick()
    expect(document.querySelector('.contextmenu-modal')).toBeTruthy()
    expect(document.querySelectorAll('.n-menu-item').length).toBe(1)

    text.destroy()
  })
})

function drawTextShape(stage: Stage) {
  stageMouseClick(stage, { x: 100, y: 150 })
  stageMouseMove(stage, { x: 300, y: 450 })
  stageMouseClick(stage, { x: 300, y: 450 })
}
