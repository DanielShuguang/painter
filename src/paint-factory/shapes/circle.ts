import { KonvaEventObject } from 'konva/lib/Node'
import { DrawBase, DrawShapeType } from '../base'
import { getStagePosition } from '@/utils/position'
import { Circle } from 'konva/lib/shapes/Circle'

export class DrawCircle extends DrawBase {
  readonly type = DrawShapeType.Circle

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let startPos = { x: 0, y: 0 }
    let circle: Circle | null = null
    let startPoint: Circle | null = null

    stage?.on('click.drawCircle', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (circle && startPoint) {
        this.eventList.forEach(fn => fn(circle!))
        circle = null
        startPoint.destroy()
        startPoint = null
        return
      }

      startPos = getStagePosition(e.evt, stage)
      startPoint = new Circle({
        ...startPos,
        fill: '#000',
        radius: 3
      })
      circle = new Circle({
        ...this._options.nodeConfig,
        ...startPos
      })
      this.rootGroup?.add(startPoint).add(circle)
    })

    stage?.on('mousemove.drawCircle', (e: KonvaEventObject<MouseEvent>) => {
      if (!circle || !startPoint) return

      const endPos = getStagePosition(e.evt, stage)
      const rectSize = {
        height: endPos.y - startPos.y,
        width: endPos.x - startPos.x
      }
      const height = rectSize.height / 2
      const width = rectSize.width / 2
      const r = Math.pow(Math.pow(height, 2) + Math.pow(width, 2), 0.5)

      circle.position({ x: startPos.x + width, y: startPos.y + height }).radius(r)
    })

    const handler = (e: KeyboardEvent) => {
      if (!circle || !startPoint || e.key !== 'Escape') return

      circle.destroy()
      circle = null
      startPoint.destroy()
      startPoint = null
    }
    document.addEventListener('keydown', handler)
    this.disposeEvents.push(() => document.removeEventListener('keydown', handler))
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()

    stage?.off('click.drawCircle')
    stage?.off('mousemove.drawCircle')
  }
}
