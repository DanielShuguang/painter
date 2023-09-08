import Layout from '@/components/Layout/Layout.vue'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import OperationMenuBar from '@/components/OperationMenuBar.vue'
import { CommonCommands, DrawShapeType, PaintFactory } from '@/paint-factory'
import { stageMouseClick, stageMouseMove } from '../test-utils'
import { Rect } from 'konva/lib/shapes/Rect'
import { eventBus } from '@/utils/eventBus'
import { CleanCacheEvent, UpdateCacheEvent } from '@/components/Layout/composition'

describe('Layout component test', () => {
  const factory = new PaintFactory()
  const wrapper = mount(
    <NDialogProvider>
      <NMessageProvider>
        <Layout />
      </NMessageProvider>
    </NDialogProvider>
  )
  const rootGroup = factory.getRoot()!
  const stage = rootGroup.getStage()!

  it('init stage', () => {
    expect(rootGroup).toBeTruthy()
    expect(stage).toBeTruthy()
  })

  it('split draggble', async () => {
    const splitEl = wrapper.find<HTMLDivElement>('.split-line')
    const operationBar = wrapper.findComponent(OperationMenuBar)

    expect(splitEl.element.style.left).toBe('200px')
    expect(operationBar.attributes('style')).toContain('width: 200px')

    await splitEl.trigger('pointerdown', { clientX: 0 } as PointerEventInit)
    dispatchEvent(new MouseEvent('pointermove', { clientX: 100 }))
    dispatchEvent(new MouseEvent('pointerup'))

    // 最小宽度为 200
    await nextTick()
    expect(splitEl.element.style.left).toBe('200px')
    expect(operationBar.attributes('style')).toContain('width: 200px')

    await splitEl.trigger('pointerdown', { clientX: 0 } as PointerEventInit)
    dispatchEvent(new MouseEvent('pointermove', { clientX: 300 }))
    dispatchEvent(new MouseEvent('pointerup'))

    await nextTick()
    expect(splitEl.element.style.left).toBe('300px')
    expect(operationBar.attributes('style')).toContain('width: 300px')

    await splitEl.trigger('dblclick')
    expect(splitEl.element.style.left).toBe('200px')
    expect(operationBar.attributes('style')).toContain('width: 200px')
  })

  it('painter cache', async () => {
    factory.active(DrawShapeType.Rect)

    expect(eventBus.exist(UpdateCacheEvent)).true
    expect(eventBus.exist(CleanCacheEvent)).true

    stageMouseClick(stage, { x: 100, y: 100 })
    stageMouseMove(stage, { x: 300, y: 300 })
    stageMouseClick(stage, { x: 300, y: 300 })
    await nextTick()
    expect(rootGroup.findOne('Rect')).instanceOf(Rect)

    dispatchEvent(new KeyboardEvent('keyup', { key: 'z', ctrlKey: true }))
    await nextTick()

    expect(rootGroup.findOne('Rect')).toBeFalsy()

    dispatchEvent(new KeyboardEvent('keyup', { key: 'y', ctrlKey: true }))
    await nextTick()
    expect(rootGroup.findOne('Rect')).instanceOf(Rect)

    stage.fire(CommonCommands.Delete, rootGroup.findOne('Rect'))
    await nextTick()
    expect(rootGroup.findOne('Rect')).toBeFalsy()

    const shapeCount = 25
    for (let i = 0; i < shapeCount; i++) {
      stageMouseClick(stage, { x: 100, y: 100 })
      stageMouseMove(stage, { x: 300, y: 300 })
      stageMouseClick(stage, { x: 300, y: 300 })
    }
    await nextTick()
    expect(rootGroup.find('Rect').length).toBe(shapeCount)

    for (let i = 0; i < shapeCount; i++) {
      dispatchEvent(new KeyboardEvent('keyup', { key: 'z', ctrlKey: true }))
    }
    await nextTick()
    // 撤回相同次数之后，因超过最大缓存数量，仍会存在图形
    expect(rootGroup.find('Rect').length).not.toBe(0)

    rootGroup.removeChildren()
    eventBus.emit(CleanCacheEvent, undefined)
    dispatchEvent(new KeyboardEvent('keyup', { key: 'z', ctrlKey: true }))
    await nextTick()
    expect(rootGroup.findOne('Rect')).toBeFalsy()
  })

  it('destroy', () => {
    const destroySpy = vi.spyOn(factory, 'destroy')
    wrapper.unmount()

    expect(destroySpy).toHaveBeenCalled()
    expect(factory.getRoot()).toBeFalsy()
  })
})
