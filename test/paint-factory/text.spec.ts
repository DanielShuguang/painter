import { describe, it, expect } from 'vitest'
import { DrawShapeType, DrawText } from '../../src/paint-factory'
import { Stage } from 'konva/lib/Stage'
import { Layer } from 'konva/lib/Layer'
import { Group } from 'konva/lib/Group'

describe('Draw text shape', () => {
  const root = document.createElement('div')
  root.id = 'draw-root'
  document.body.appendChild(root)

  const stage = new Stage({ container: root })
  const layer = new Layer({ id: 'main-layer' })
  stage.add(layer)
  const rootGroup = new Group({ id: 'main-group' })
  layer.add(rootGroup)

  const shape = new DrawText()

  it('init text shape', () => {
    expect(shape.type).to.equal(DrawShapeType.Text)

    shape.setGroup(rootGroup)

    shape.activate()

    expect(shape.isActive()).toBeTruthy()
  })
})
