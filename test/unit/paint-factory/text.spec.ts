import {
  DrawShapeType,
  TextShape,
  SaveTextEvent,
  ShowTextEditorEvent,
  textGroupName,
  textName,
  textRectName
} from '@/paint-factory'
import { eventBus } from '@/utils/eventBus'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'
import { Group } from 'konva/lib/Group'
import { Rect } from 'konva/lib/shapes/Rect'
import { Text } from 'konva/lib/shapes/Text'

describe('Draw text shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new TextShape()

  it('init shape', () => {
    expect(shape.type).to.equal(DrawShapeType.Text)

    shape.setGroup(rootGroup).activate()

    expect(shape.isActive()).toBeTruthy()
    expect(eventBus.exist(SaveTextEvent)).toBeTruthy()
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.click).toBeDefined()
    expect(events.mousemove).toBeDefined()

    const clickEvent = events.click.find(el => el.name === 'drawText')
    expect(clickEvent).toBeDefined()
    expect(clickEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawText')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')
  })

  it('draw shape', () => {
    eventBus.once(ShowTextEditorEvent, text => {
      expect(text.name()).toBe(textName)
    })

    shape.drawListener(node => {
      expect(node).instanceOf(Group)
    })

    stageMouseClick(stage, { x: 400, y: 400 })
    stageMouseMove(stage, { x: 1400, y: 1400 })
    stageMouseClick(stage, { x: 1400, y: 1400 })

    let group = stage.findOne<Group>(`.${textGroupName}`)
    let size = { height: 1000, width: 1000 }
    let position = { x: 400, y: 400 }
    expect(group.position()).toEqual(position)
    let rect = group.findOne(`.${textRectName}`)
    expect(rect).instanceOf(Rect)
    expect(rect.size()).toEqual(size)
    let text = group.findOne<Text>(`.${textName}`)
    expect(text).instanceOf(Text)
    expect(text.size()).toEqual(size)

    const content = 'hello world'
    eventBus.emit(SaveTextEvent, text.id(), content)
    expect(text.text()).toBe(content)

    group.destroy()

    stageMouseClick(stage, { x: 1400, y: 1400 })
    stageMouseMove(stage, { x: 400, y: 400 })
    stageMouseClick(stage, { x: 400, y: 400 })

    group = stage.findOne<Group>(`.${textGroupName}`)
    position = { x: 1400, y: 1400 }
    size = { height: -1000, width: -1000 }
    expect(group.position()).toEqual(position)
    rect = group.findOne(`.${textRectName}`)
    expect(rect).instanceOf(Rect)
    expect(rect.size()).toEqual(size)
    text = group.findOne<Text>(`.${textName}`)
    expect(text).instanceOf(Text)
    expect(text.size()).toEqual(size)

    group.destroy()
  })

  it('cancel drawing', () => {
    stageMouseClick(stage, { x: 400, y: 400 })

    let group = stage.findOne<Group>(`.${textGroupName}`)
    expect(group).toBeDefined()
    expect(group.position()).toEqual({ x: 400, y: 400 })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    group = stage.findOne<Group>(`.${textGroupName}`)
    expect(group).toBeUndefined()
  })

  it('deactivate shape', () => {
    shape.deactivate()

    expect(shape.isActive()).toBeFalsy()

    const events = stage.eventListeners

    expect(events.click).toBeUndefined()
    expect(events.mousemove).toBeUndefined()

    shape.destroy()

    expect(eventBus.exist(SaveTextEvent)).toBeFalsy()
  })
})
