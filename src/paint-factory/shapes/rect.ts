import { BaseShape, DrawShapeType } from '../base'
import { getRelativePosition } from '@/utils/position'
import { KonvaEventObject } from 'konva/lib/Node'
import { Rect } from 'konva/lib/shapes/Rect'

export class RectShape extends BaseShape {
  readonly type = DrawShapeType.Rect

  protected mount() {
    let startPos = { x: 0, y: 0 }
    let rect: Rect | null = null
    const stage = this.rootGroup?.getStage()

    stage?.on('click.drawRect', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (rect) {
        this.eventList.forEach(fn => fn(rect!))
        rect = null
        return
      }

      startPos = getRelativePosition(e.evt, stage, true)
      rect = new Rect({
        ...this._options.nodeConfig,
        ...startPos
      })
      this.rootGroup?.add(rect)
    })

    stage?.on('mousemove.drawRect', (e: KonvaEventObject<MouseEvent>) => {
      if (!rect) return

      const endPos = getRelativePosition(e.evt, stage, true)
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

    stage?.off('click.drawRect')
    stage?.off('mousemove.drawRect')
  }
}
