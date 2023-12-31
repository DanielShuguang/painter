import { KonvaEventObject } from 'konva/lib/Node'
import { BaseShape, DrawShapeType } from '../base'
import { getRelativePosition } from '@/utils/position'
import { Circle } from 'konva/lib/shapes/Circle'
import { isString } from 'lodash-es'

export class CircleShape extends BaseShape {
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

      startPos = getRelativePosition(e.evt, stage, true)
      const fillColor = this._options.nodeConfig.stroke
      startPoint = new Circle({
        ...startPos,
        fill: isString(fillColor) ? fillColor : '#000',
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

      // 圆形的坐标起始点为圆心，因此需要根据半径和初始坐标进行计算得出实际的圆心坐标
      const endPos = getRelativePosition(e.evt, stage, true)
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
