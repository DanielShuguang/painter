import { DrawBase, DrawShapeType } from '../base'
import { getStagePosition } from '../../utils/position'
import { KonvaEventObject } from 'konva/lib/Node'
import { Rect } from 'konva/lib/shapes/Rect'

export class DrawRect extends DrawBase {
  readonly type = DrawShapeType.Rect

  protected mount() {
    let startPos = { x: 0, y: 0 }
    let rect: Rect | null = null
    const stage = this.rootGroup?.getStage()

    stage?.on('mousedown.drawRect', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (rect) {
        this.eventList.forEach(fn => fn(rect!))
        rect = null
        return
      }

      startPos = getStagePosition(e.evt)
      rect = new Rect({
        ...this._options.nodeConfig,
        ...startPos
      })
      this.rootGroup?.add(rect)
    })

    stage?.on('mousemove.drawRect', (e: KonvaEventObject<MouseEvent>) => {
      if (!rect) return

      const endPos = getStagePosition(e.evt)
      const size = {
        height: endPos.y - startPos.y,
        width: endPos.x - startPos.x
      }
      rect.size(size)
    })

    const handler = (e: KeyboardEvent) => {
      if (!rect || e.key !== 'Escape') return

      rect.destroy()
      rect = null
    }
    document.addEventListener('keydown', handler)
    this.disposeEvents.push(() => document.removeEventListener('keydown', handler))
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()

    stage?.off('mousedown.drawRect')
    stage?.off('mousemove.drawRect')
  }
}
