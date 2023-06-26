import { Ellipse } from 'konva/lib/shapes/Ellipse'
import { DrawBase, DrawShapeType } from '../base'
import { Circle } from 'konva/lib/shapes/Circle'
import { KonvaEventObject } from 'konva/lib/Node'
import { getRelativePosition } from '@/utils/position'

export class DrawEllipse extends DrawBase {
  readonly type = DrawShapeType.Ellipse

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let startPos = { x: 0, y: 0 }
    let ellipse: Ellipse | null = null
    let startPoint: Circle | null = null

    stage?.on('mousedown.drawEllipse', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (ellipse && startPoint) {
        this.eventList.forEach(fn => fn(ellipse!))
        ellipse = null
        startPoint.destroy()
        startPoint = null
        return
      }

      startPos = getRelativePosition(e.evt)
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

      const endPos = getRelativePosition(e.evt)
      const rectSize = {
        height: endPos.y - startPos.y,
        width: endPos.x - startPos.x
      }
      const height = rectSize.height / 2
      const width = rectSize.width / 2
      const ry = Math.pow(Math.pow(height, 2) + Math.pow(width, 2), 0.5)
      const rotateDeg = (Math.atan(rectSize.height / rectSize.width) / Math.PI) * 180

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

    stage?.off('mousedown.drawEllipse')
    stage?.off('mousemove.drawEllipse')
  }
}