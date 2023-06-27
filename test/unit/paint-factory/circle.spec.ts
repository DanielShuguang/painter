import { DrawCircle, DrawOptions, DrawShapeType } from '@/paint-factory'
import { addStage } from './test-utils'
import { CircleConfig } from 'konva/lib/shapes/Circle'

describe('Draw circle shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new DrawCircle()

  it('init circle shape', () => {
    expect(shape.type).toBe(DrawShapeType.Circle)

    shape.setGroup(rootGroup).activate()

    expect(shape.isActive()).toBeTruthy()
  })

  it('shape options', () => {
    expect(shape.options()).toEqual(<DrawOptions>{ nodeConfig: { stroke: '#000' } })

    shape.options(<DrawOptions<CircleConfig>>{ nodeConfig: { fill: 'red' } })

    expect(shape.options().nodeConfig.fill).toEqual('red')
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.mousedown).toBeDefined()
    expect(events.mousemove).toBeDefined()

    const mousedownEvent = events.mousedown.find(el => el.name === 'drawCircle')
    expect(mousedownEvent).toBeDefined()
    expect(mousedownEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawCircle')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')
  })

  it('deactivate shape', () => {
    shape.deactivate()

    expect(shape.isActive()).toBeFalsy()

    const events = stage.eventListeners

    expect(events.mousedown).toBeUndefined()
    expect(events.mousemove).toBeUndefined()

    shape.destroy()
  })
})
