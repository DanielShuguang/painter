import { KonvaEventObject } from 'konva/lib/Node'
import { DrawBase, DrawOptions, DrawShapeType } from '..'
import { getStagePosition } from '@/utils/position'
import { Line } from 'konva/lib/shapes/Line'
import { LineConfig } from 'konva/lib/shapes/Line'

export class DrawLine extends DrawBase {
  readonly type = DrawShapeType.Line
  protected _options: DrawOptions<LineConfig> = {
    nodeConfig: { stroke: '#000', hitStrokeWidth: 10 }
  }

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let startPos = { x: 0, y: 0 }
    let line: Line | null = null

    stage?.on('mousedown.drawLine', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (!line) {
        startPos = getStagePosition(e.evt)
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

      const endPos = getStagePosition(e.evt)
      const oldPoints = line.points()
      const len = oldPoints.length
      oldPoints[len - 2] = endPos.x
      oldPoints[len - 1] = endPos.y
      line.points(oldPoints)
    })

    stage?.on('contextmenu.drawLine', () => {
      this.finishDraw(line)
      line = null
    })
    const handler = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return

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
    stage?.off('mousedown.drawLine')
    stage?.off('mousemove.drawLine')
    stage?.off('contextmenu.drawLine')
  }
}
