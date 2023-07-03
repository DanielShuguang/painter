import { Ellipse } from 'konva/lib/shapes/Ellipse'
import { BaseShape, DrawShapeType } from '../base'
import { Circle } from 'konva/lib/shapes/Circle'
import { KonvaEventObject } from 'konva/lib/Node'
import { getStagePosition } from '@/utils/position'

export class EllipseShape extends BaseShape {
  readonly type = DrawShapeType.Ellipse

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let startPos = { x: 0, y: 0 }
    let ellipse: Ellipse | null = null
    let startPoint: Circle | null = null

    stage?.on('click.drawEllipse', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (ellipse && startPoint) {
        this.eventList.forEach(fn => fn(ellipse!))
        ellipse = null
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
      ellipse = new Ellipse({
        ...this._options.nodeConfig,
        ...startPos,
        radiusX: 0,
        radiusY: 0
      })
      this.rootGroup?.add(startPoint).add(ellipse)
    })

    stage?.on('mousemove.drawEllipse', (e: KonvaEventObject<MouseEvent>) => {
      if (!ellipse || !startPoint) return

      const endPos = getStagePosition(e.evt, stage)
      const rectSize = {
        height: endPos.y - startPos.y,
        width: endPos.x - startPos.x
      }
      const height = rectSize.height / 2
      const width = rectSize.width / 2
      const ry = Math.pow(Math.pow(height, 2) + Math.pow(width, 2), 0.5)
      const rotateDeg = (Math.atan(rectSize.height / rectSize.width) / Math.PI) * 180 || 0

      ellipse
        .position({ x: startPos.x + width, y: startPos.y + height })
        .radius({ x: ry, y: ry / 2 })
        .rotation(rotateDeg)
    })

    const handler = (e: KeyboardEvent) => {
      if (!ellipse || !startPoint || e.key !== 'Escape') return

      ellipse.destroy()
      ellipse = null
      startPoint.destroy()
      startPoint = null
    }
    document.addEventListener('keydown', handler)
    this.disposeEvents.push(() => document.removeEventListener('keydown', handler))
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()

    stage?.off('click.drawEllipse')
    stage?.off('mousemove.drawEllipse')
  }
}
