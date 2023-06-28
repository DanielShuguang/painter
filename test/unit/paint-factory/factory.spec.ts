import { DrawCircle, DrawLine, DrawShapeType, PaintFactory } from '@/paint-factory'
import { addStage } from '../test-utils'

describe('Shape factory test', () => {
  const { rootGroup } = addStage()
  const factory = new PaintFactory()
  factory.setRoot(rootGroup)

  it('active shape', () => {
    expect(factory.currentShape).toBe(undefined)

    factory.active(DrawShapeType.Line)
    expect(factory.currentShape).instanceOf(DrawLine)

    factory.active(DrawShapeType.Circle)
    expect(factory.currentShape).instanceOf(DrawCircle)
  })
})
