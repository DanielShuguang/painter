import { BrushShape, DrawOptions, DrawShapeType } from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'
import { RectConfig } from 'konva/lib/shapes/Rect'
import { Line } from 'konva/lib/shapes/Line'

describe('Draw brush shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new BrushShape()

  it('init shape', () => {
    expect(shape.type).toBe(DrawShapeType.Brush)

    shape.setGroup(rootGroup).activate()

    expect(shape.isActive()).toBeTruthy()
  })

  it('shape options', () => {
    expect(Object.keys(shape.options())).toContain('brushWidth')
    expect(Object.keys(shape.options())).toContain('brushType')

    shape.options(<DrawOptions<RectConfig>>{ nodeConfig: { stroke: 'red' } })

    expect(shape.options().nodeConfig.stroke).toEqual('red')
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.mousedown).toBeDefined()
    expect(events.mousemove).toBeDefined()
    expect(events.mouseup).toBeDefined()

    const mousedownEvent = events.mousedown.find(el => el.name === 'drawBrush')
    expect(mousedownEvent).toBeDefined()
    expect(mousedownEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawBrush')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')

    const mouseupEvent = events.mouseup.find(el => el.name === 'drawBrush')
    expect(mouseupEvent).toBeDefined()
    expect(mouseupEvent?.handler).toBeTypeOf('function')
  })

  it('draw shape', () => {
    const points = [400, 400, 410, 410, 420, 420, 440, 440, 450, 450, 500, 500]

    shape.drawListener(node => {
      expect(node).instanceOf(Line)
    })

    const upFn = stageMouseClick(stage, { x: points[0], y: points[1] }, 'down')
    for (let i = 2; i < points.length; i += 2) {
      stageMouseMove(stage, { x: points[i], y: points[i + 1] })
    }
    upFn?.()

    const line1 = stage.findOne<Line>('Line')
    expect(line1.points()).toEqual(points)

    line1.destroy()

    const finish = stageMouseClick(stage, { x: 100, y: 100 }, 'down')
    finish?.()
    const line2 = stage.findOne<Line>('Line')
    expect(line2.points()).toEqual([100, 100, 100, 100])

    line2.destroy()
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
