import { KonvaEventObject } from 'konva/lib/Node'
import { DrawBase, DrawOptions, DrawShapeType } from '../base'
import { getStagePosition } from '@/utils/position'
import { Vector2d } from 'konva/lib/types'
import { isEqual } from 'lodash-es'
import { Line, LineConfig } from 'konva/lib/shapes/Line'

export class DrawBrush extends DrawBase {
  readonly type = DrawShapeType.Brush
  protected _options: DrawOptions<LineConfig> = {
    brushWidth: 4,
    brushType: 'round',
    nodeConfig: { fill: '#000' }
  }

  protected mount() {
    const stage = this.rootGroup?.getStage()

    let lastPosition: Vector2d | null = null
    let line: Line | null = null
    let isDrawing = false

    stage?.on('mousedown.drawBrush', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      const position = getStagePosition(e.evt)
      lastPosition = position
      isDrawing = true
      line = new Line({
        ...this._options.nodeConfig,
        hitStrokeWidth: (this._options.brushWidth ?? 4) + 8,
        strokeWidth: this._options.brushWidth,
        points: [position.x, position.y],
        lineCap: this._options.brushType === 'round' ? 'round' : 'square',
        lineJoin: this._options.brushType === 'round' ? 'round' : 'bevel',
        tension: 1
      })

      this.rootGroup?.add(line)
    })

    stage?.on('mousemove.drawBrush', (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || !line) return

      const position = getStagePosition(e.evt)
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
