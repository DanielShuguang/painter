import { EllipseShape, DrawOptions, DrawShapeType } from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'
import { RectConfig } from 'konva/lib/shapes/Rect'
import { Ellipse } from 'konva/lib/shapes/Ellipse'

describe('Draw ellipse shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new EllipseShape()

  it('init shape', () => {
    expect(shape.type).toBe(DrawShapeType.Ellipse)

    shape.setGroup(rootGroup).activate()

    expect(shape.isActive()).toBeTruthy()
  })

  it('shape options', () => {
    shape.options(<DrawOptions<RectConfig>>{ nodeConfig: { fill: 'red' } })

    expect(shape.options().nodeConfig.fill).toEqual('red')
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.click).toBeDefined()
    expect(events.mousemove).toBeDefined()

    const clickEvent = events.click.find(el => el.name === 'drawEllipse')
    expect(clickEvent).toBeDefined()
    expect(clickEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawEllipse')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')
  })

  it('draw shape', () => {
    const position = { x: 400 + (1400 - 400) / 2, y: 400 + (1400 - 400) / 2 }
    const rotateDeg = (Math.atan((1400 - 400) / (1400 - 400)) / Math.PI) * 180

    shape.drawListener(node => {
      expect(node).instanceOf(Ellipse)
    })

    stageMouseClick(stage, { x: 400, y: 400 })
    stageMouseMove(stage, { x: 1400, y: 1400 })
    stageMouseClick(stage, { x: 1400, y: 1400 })

    const ellipse = stage.findOne<Ellipse>('Ellipse')
    expect(ellipse.position()).toEqual(position)
    expect(ellipse.rotation()).toBe(rotateDeg)

    ellipse.destroy()
  })

  it('cancel drawing', () => {
    stageMouseClick(stage, { x: 400, y: 400 })

    let ellipse = stage.findOne<Ellipse>('Ellipse')
    expect(ellipse).toBeDefined()
    expect(ellipse.position()).toEqual({ x: 400, y: 400 })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    ellipse = stage.findOne<Ellipse>('Ellipse')
    expect(ellipse).toBeUndefined()
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
