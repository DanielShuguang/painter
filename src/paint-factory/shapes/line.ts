import { KonvaEventObject } from 'konva/lib/Node'
import { BaseShape, DrawOptions, DrawShapeType } from '../base'
import { getRelativePosition } from '@/utils/position'
import { Line } from 'konva/lib/shapes/Line'
import { LineConfig } from 'konva/lib/shapes/Line'

export class LineShape extends BaseShape {
  readonly type = DrawShapeType.Line
  protected _options: DrawOptions<LineConfig> = {
    colorKey: 'stroke',
    nodeConfig: { stroke: '#000', hitStrokeWidth: 10 }
  }

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let startPos = { x: 0, y: 0 }
    let line: Line | null = null

    stage?.on('click.drawLine', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (!line) {
        startPos = getRelativePosition(e.evt, stage, true)
        line = new Line({
          lineCap: 'round',
          lineJoin: 'round',
          ...this._options.nodeConfig,
          points: [startPos.x, startPos.y, startPos.x, startPos.y]
        })
        this.rootGroup?.add(line)
      } else {
        const oldPoints = line.points()
        oldPoints.push(...oldPoints.slice(-2))
        line.points(oldPoints)
      }
    })

    stage?.on('mousemove.drawLine', (e: KonvaEventObject<MouseEvent>) => {
      if (!line) return

      const endPos = getRelativePosition(e.evt, stage, true)
      const oldPoints = line.points()
      const len = oldPoints.length
      oldPoints[len - 2] = endPos.x
      oldPoints[len - 1] = endPos.y
      line.points(oldPoints)
    })

    const handler = (ev: KeyboardEvent) => {
      if (!['Escape', 'Enter'].includes(ev.key)) return

      this.finishDraw(line)
      line = null
    }
    document.addEventListener('keydown', handler)
    this.disposeEvents.push(() => document.removeEventListener('keydown', handler))
  }

  private finishDraw(line: Line | null) {
    if (!line) return

    const oldPoints = line.points()
    if (oldPoints.length > 4) {
      oldPoints.splice(oldPoints.length - 2, 2)
      line.points(oldPoints)
      this.eventList.forEach(fn => fn(line!))
    } else {
      line.destroy()
    }
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()
    stage?.off('click.drawLine')
    stage?.off('mousemove.drawLine')
  }
}
