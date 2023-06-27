import { describe, it, expect } from 'vitest'
import { DrawShapeType, DrawText, SaveTextEvent } from '@/paint-factory'
import { eventBus } from '@/utils/eventBus'
import { initTestStage } from './common'

describe('Draw text shape', () => {
  const { rootGroup, stage } = initTestStage()
  const shape = new DrawText()

  it('init text shape', () => {
    expect(shape.type).to.equal(DrawShapeType.Text)

    shape.setGroup(rootGroup)

    shape.activate()

    expect(shape.isActive()).toBeTruthy()
    expect(eventBus.exist(SaveTextEvent)).toBeTruthy()
  })

  it('shape events', () => {
    const events = stage.eventListeners

    expect(events.mousedown).toBeDefined()
    expect(events.mousemove).toBeDefined()

    const mousedownEvent = events.mousedown.find(el => el.name === 'drawText')
    expect(mousedownEvent).toBeDefined()
    expect(mousedownEvent?.handler).toBeTypeOf('function')

    const mousemoveEvent = events.mousemove.find(el => el.name === 'drawText')
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

    expect(eventBus.exist(SaveTextEvent)).toBeFalsy()
  })
})
