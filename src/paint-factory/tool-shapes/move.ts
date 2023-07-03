import { KonvaEventObject } from 'konva/lib/Node'
import { BaseShape, DrawShapeType } from '../base'
import { Vector2d } from 'konva/lib/types'
import { getStagePosition } from '@/utils/position'

export class MoveShape extends BaseShape {
  readonly type = DrawShapeType.Move
  private initialPos?: Vector2d

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let isMoving = false
    let startPos: Vector2d | null = null
    let startRootPos: Vector2d | null = null

    stage?.on('mousedown', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || !this.rootGroup) return

      isMoving = true
      startPos = getStagePosition(e.evt, stage)
      startRootPos = this.rootGroup.position()
    })

    stage?.on('mousemove', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || !isMoving || !this.rootGroup || !startPos || !startRootPos) return

      const pos = getStagePosition(e.evt, stage)
      const offset = {
        x: pos.x - startPos.x,
        y: pos.y - startPos.y
      }
      const originPos = this.rootGroup.position()
      this.rootGroup.position({
        x: originPos.x + offset.x,
        y: originPos.y + offset.x
      })
    })

    stage?.on('mouseup', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || !this.rootGroup || !startPos || !startRootPos) return

      isMoving = false
      startPos = null
      startRootPos = null
    })

    this.initOriginPosition()
    this.positionResetEvent()
    this.changeMouseCursor()
  }

  protected unmount() {
    this.contextmenuService.toggle(true)
  }

  private changeMouseCursor() {
    const container = this.rootGroup?.getStage()?.container()

    if (container) {
      const originStyle = container.style.cursor
      container.style.cursor = 'pointer'

      this.disposeEvents.push(() => {
        container.style.cursor = originStyle
      })
    }
  }

  private initOriginPosition() {
    if (!this.initialPos) {
      this.initialPos = this.rootGroup?.position()
    }
  }

  private positionResetEvent() {
    this.rootGroup?.getStage()?.on('keyup', (e: KonvaEventObject<KeyboardEvent>) => {
      const evt = e.evt
      if (evt.ctrlKey && evt.key === 'r') {
        if (this.initialPos) {
          this.rootGroup?.position(this.initialPos)
        }
        evt.preventDefault()
      }
    })
  }
}
