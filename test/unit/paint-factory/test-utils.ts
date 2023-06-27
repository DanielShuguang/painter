import { Group } from 'konva/lib/Group'
import { Layer } from 'konva/lib/Layer'
import { Stage } from 'konva/lib/Stage'

export function addStage() {
  const root = document.createElement('div')
  root.id = 'draw-root'
  document.body.appendChild(root)

  const stage = new Stage({ container: root })
  const layer = new Layer({ id: 'main-layer' })
  stage.add(layer)
  const rootGroup = new Group({ id: 'main-group' })
  layer.add(rootGroup)

  return { stage, layer, rootGroup }
}
