import { KonvaEventObject } from 'konva/lib/Node'
import { BaseShape, DrawOptions, DrawShapeType } from '../base'
import { getRelativePosition } from '@/utils/position'
import { Vector2d } from 'konva/lib/types'
import { isEqual } from 'lodash-es'
import { Line, LineConfig } from 'konva/lib/shapes/Line'

export class BrushShape extends BaseShape {
  readonly type = DrawShapeType.Brush
  protected _options: DrawOptions<LineConfig> = {
    brushWidth: 4,
    brushType: 'round',
    colorKey: 'stroke',
    nodeConfig: { stroke: '#000' }
  }

  protected mount() {
    const stage = this.rootGroup?.getStage()

    let lastPosition: Vector2d | null = null
    let line: Line | null = null
    let isDrawing = false

    stage?.on('mousedown.drawBrush', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      const position = getRelativePosition(e.evt, stage, true)
      lastPosition = position
      isDrawing = true
      line = new Line({
        ...this._options.nodeConfig,
        hitStrokeWidth: (this._options.brushWidth ?? 4) + 8,
        strokeWidth: this._options.brushWidth,
        points: [position.x, position.y],
        // 根据选择的笔刷类型进行绘制
        lineCap: this._options.brushType === 'round' ? 'round' : 'square',
        lineJoin: this._options.brushType === 'round' ? 'round' : 'bevel',
        tension: 1
      })

      this.rootGroup?.add(line)
    })

    stage?.on('mousemove.drawBrush', (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || !line) return

      const position = getRelativePosition(e.evt, stage, true)
      if (isEqual(position, lastPosition)) return

      lastPosition = position

      const oldPoints = line.points()
      oldPoints.push(position.x, position.y)
      line.points(oldPoints)
    })

    stage?.on('mouseup.drawBrush', () => {
      if (!line) return

      const points = line.points()
      if (points.length === 2) {
        line.points(points.concat(points))
      }

      this.eventList.forEach(fn => fn(line!))
      isDrawing = false
      lastPosition = null
      line = null
    })
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()

    stage?.off('mousedown.drawBrush').off('mouseup.drawBrush').off('mousemove.drawBrush')
  }
}
