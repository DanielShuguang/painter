import { DrawOptions, DrawShapeType, DrawLine } from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'
import { RectConfig } from 'konva/lib/shapes/Rect'
import { Line } from 'konva/lib/shapes/Line'
import { Stage } from 'konva/lib/Stage'

describe('Draw line shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new DrawLine()

  it('init line shape', () => {
    expect(shape.type).toBe(DrawShapeType.Line)

    shape.setGroup(rootGroup).activate()

    expect(shape.isActive()).toBeTruthy()
  })

  it('shape options', () => {
    expect(shape.options()).toEqual(<DrawOptions>{
      nodeConfig: { stroke: '#000', hitStrokeWidth: 10 }
    })

    shape.options(<DrawOptions<RectConfig>>{
      nodeConfig: { fill: 'red' }
    })

    expect(shape.options().nodeConfig.fill).toEqual('red')
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.click).toBeDefined()
    expect(events.mousemove).toBeDefined()

    const clickEvent = events.click.find(el => el.name === 'drawLine')
    expect(clickEvent).toBeDefined()
    expect(clickEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawLine')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')
  })

  it('draw shape', () => {
    const points = [100, 100, 300, 300, 1000, 1000]

    shape.drawListener(node => {
      expect(node).instanceOf(Line)
    })

    drawLineShape(stage)
    const line1 = stage.findOne<Line>('Line')
    expect(line1.points()).toEqual([...points, 1000, 1000])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(line1.points()).toEqual(points)

    line1.destroy()

    drawLineShape(stage)
    const line2 = stage.findOne<Line>('Line')
    expect(line2.points()).toEqual([...points, 1000, 1000])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(line2.points()).toEqual(points)

    line2.destroy()
  })

  it('deactivate shape', () => {
    shape.deactivate()

    expect(shape.isActive()).toBeFalsy()

    const events = stage.eventListeners

    expect(events.click).toBeUndefined()
    expect(events.mousemove).toBeUndefined()

    shape.destroy()
    expect(shape.listeners.length).toBe(0)
  })
})

function drawLineShape(stage: Stage) {
  stageMouseClick(stage, { x: 100, y: 100 })
  stageMouseMove(stage, { x: 300, y: 300 })
  stageMouseClick(stage, { x: 300, y: 300 })
  stageMouseMove(stage, { x: 1000, y: 1000 })
  stageMouseClick(stage, { x: 1000, y: 1000 })
}
