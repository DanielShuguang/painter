import { DrawCircle, DrawOptions, DrawShapeType } from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'
import { Circle, CircleConfig } from 'konva/lib/shapes/Circle'

describe('Draw circle shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new DrawCircle()

  it('init circle shape', () => {
    expect(shape.type).toBe(DrawShapeType.Circle)

    shape.setGroup(rootGroup).activate()

    shape.drawListener(() => console.log('This is a listener function'))
    const cancel = shape.drawListener(() => console.log('This is a listener function'))

    expect(shape.isActive()).toBeTruthy()
    expect(shape.listeners.length).toBe(2)
    expect(shape.listeners[0]).toBeTypeOf('function')

    cancel()
    expect(shape.listeners.length).toBe(1)

    shape.cleanListeners()
    expect(shape.listeners.length).toBe(0)
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

  it('draw shape', () => {
    const radius = Math.pow(Math.pow(1000, 2) * 2, 0.5) / 2
    const centerPosition = { x: 900, y: 900 }

    shape.drawListener(node => {
      expect(node).instanceOf(Circle)
      const circle = node as Circle
      expect(circle.radius()).toBe(radius)
      expect(circle.position()).toEqual(centerPosition)
    })

    stageMouseClick(stage, { x: 400, y: 400 })

    let circles = stage.find<Circle>('Circle')
    expect(circles.length).toBe(2)
    circles.forEach(c => expect(c.position()).toEqual({ x: 400, y: 400 }))

    stageMouseMove(stage, { x: 1400, y: 1400 })
    stageMouseClick(stage, { x: 1400, y: 1400 })
    circles = stage.find<Circle>('Circle')
    expect(circles.length).toBe(1)

    circles.forEach(c => c.destroy())
  })

  it('cancel drawing', () => {
    stage.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 400 }))

    let circles = stage.find<Circle>('Circle')
    expect(circles.length).toBe(2)
    circles.forEach(c => expect(c.position()).toEqual({ x: 400, y: 400 }))

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    circles = stage.find<Circle>('Circle')
    expect(circles.length).toBe(0)
  })

  it('deactivate shape', () => {
    shape.deactivate()

    expect(shape.isActive()).toBeFalsy()

    const events = stage.eventListeners

    expect(events.mousedown).toBeUndefined()
    expect(events.mousemove).toBeUndefined()

    shape.destroy()
    expect(shape.listeners.length).toBe(0)
  })
})
