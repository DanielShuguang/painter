import { DrawShapeType, MoveCommands, MoveShape } from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'

describe('MoveShape test', () => {
  const { rootGroup, stage } = addStage()
  const shape = new MoveShape()
  shape.setGroup(rootGroup).activate()

  it('init shape', () => {
    expect(shape.type).toBe(DrawShapeType.Move)

    expect(shape.isActive()).toBeTruthy()
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.mousedown).toBeDefined()
    expect(events.mousemove).toBeDefined()
    expect(events.mouseup).toBeDefined()

    const mousedownEvent = events.mousedown.find(el => el.name === 'moveShape')
    expect(mousedownEvent).toBeDefined()
    expect(mousedownEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'moveShape')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')

    const mouseupEvent = events.mouseup.find(el => el.name === 'moveShape')
    expect(mouseupEvent).toBeDefined()
    expect(mouseupEvent?.handler).toBeTypeOf('function')
  })

  it('moving root', () => {
    let upFn = stageMouseClick(stage, { x: 10, y: 10 }, 'down')
    stageMouseMove(stage, { x: 210, y: 20 })
    upFn?.()

    expect(rootGroup.position()).toEqual({ x: 200, y: 10 })

    upFn = stageMouseClick(stage, { x: 10, y: 10 }, 'down')
    stageMouseMove(stage, { x: 50, y: 10 })
    upFn?.()

    expect(rootGroup.position()).toEqual({ x: 240, y: 10 })

    stage.fire(MoveCommands.ResetPosition)
    expect(rootGroup.position()).toEqual({ x: 0, y: 0 })
  })

  it('deactivate shape', () => {
    shape.deactivate()

    expect(shape.isActive()).toBeFalsy()

    const events = stage.eventListeners

    expect(events.mousedown).toBeUndefined()
    expect(events.mousemove).toBeUndefined()
    expect(events.mouseup).toBeUndefined()

    shape.destroy()
    expect(shape.listeners.length).toBe(0)
  })
})
