import { DrawRect, DrawOptions, DrawShapeType } from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove } from '../test-utils'
import { Rect, RectConfig } from 'konva/lib/shapes/Rect'

describe('Draw rect shape', () => {
  const { rootGroup, stage } = addStage()
  const shape = new DrawRect()

  it('init shape', () => {
    expect(shape.type).toBe(DrawShapeType.Rect)

    shape.setGroup(rootGroup).activate()

    expect(shape.isActive()).toBeTruthy()
  })

  it('shape options', () => {
    expect(shape.options().colorKey).toEqual('stroke')

    shape.options(<DrawOptions<RectConfig>>{ nodeConfig: { fill: 'red' } })

    expect(shape.options().nodeConfig.fill).toEqual('red')
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.click).toBeDefined()
    expect(events.mousemove).toBeDefined()

    const clickEvent = events.click.find(el => el.name === 'drawRect')
    expect(clickEvent).toBeDefined()
    expect(clickEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawRect')
    expect(mousemoveEvent).toBeDefined()
    expect(mousemoveEvent?.handler).toBeTypeOf('function')
  })

  it('draw shape', () => {
    let size = { height: 1000, width: 1000 }
    let position = { x: 400, y: 400 }

    shape.drawListener(node => {
      expect(node).instanceOf(Rect)
    })

    stageMouseClick(stage, { x: 400, y: 400 })

    let rect = stage.findOne<Rect>('Rect')
    expect(rect.position()).toEqual(position)

    stageMouseMove(stage, { x: 1400, y: 1400 })
    stageMouseClick(stage, { x: 1400, y: 1400 })

    expect(rect.position()).toEqual(position)
    expect(rect.size()).toEqual(size)

    rect.destroy()

    size = { height: -1000, width: -1000 }
    position = { x: 1400, y: 1400 }
    stageMouseClick(stage, { x: 1400, y: 1400 })

    rect = stage.findOne<Rect>('Rect')
    expect(rect.position()).toEqual(position)

    stageMouseMove(stage, { x: 400, y: 400 })
    stageMouseClick(stage, { x: 400, y: 400 })

    expect(rect.position()).toEqual(position)
    expect(rect.size()).toEqual(size)

    rect.destroy()
  })

  it('cancel drawing', () => {
    stageMouseClick(stage, { x: 400, y: 400 })

    let rect = stage.findOne<Rect>('Rect')
    expect(rect).toBeDefined()
    expect(rect.position()).toEqual({ x: 400, y: 400 })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    rect = stage.findOne<Rect>('Rect')
    expect(rect).toBeUndefined()
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
