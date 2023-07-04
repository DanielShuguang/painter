import { KonvaEventObject } from 'konva/lib/Node'
import { BaseShape, CommandRegisterFn, DrawShapeType, MenuRegisterFn } from '../base'
import { Vector2d } from 'konva/lib/types'
import { getRelativePosition } from '@/utils/position'
import { isEqual } from 'lodash-es'

export enum MoveCommands {
  ResetPosition = 'move-common:reset-position'
}

export class MoveShape extends BaseShape {
  readonly type = DrawShapeType.Move
  private initialPos?: Vector2d

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let isMoving = false
    let startPos: Vector2d | null = null
    let startRootPos: Vector2d | null = null

    stage?.on('mousedown.moveShape', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || !this.rootGroup) return

      isMoving = true
      startPos = getRelativePosition(e.evt, stage, true)
      startRootPos = this.rootGroup.position()
    })

    stage?.on('mousemove.moveShape', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || !isMoving || !this.rootGroup || !startPos || !startRootPos) return

      const currentPos = getRelativePosition(e.evt, stage, true)
      const offset = {
        x: currentPos.x - startPos.x,
        y: currentPos.y - startPos.y
      }
      this.rootGroup.position({
        x: startRootPos.x + offset.x,
        y: startRootPos.y + offset.y
      })
    })

    stage?.on('mouseup.moveShape', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0 || !this.rootGroup || !startPos || !startRootPos) return

      isMoving = false
      startPos = null
      startRootPos = null
    })

    this.initOriginPosition()
    this.changeMouseCursor()
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()

    stage?.off('mousedown.moveShape').off('mousemove.moveShape').off('mouseup.moveShape')
  }

  private changeMouseCursor() {
    const container = this.rootGroup?.getStage()?.container()

    if (container) {
      const originStyle = container.style.cursor
      container.style.cursor = 'grab'

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

  protected registerMenus(reigister: MenuRegisterFn): void {
    reigister({
      key: MoveCommands.ResetPosition,
      label: '重置拖动',
      selector: () => this.isActive() && !isEqual(this.rootGroup?.position(), this.initialPos)
    })
  }

  protected registerCommands(reigister: CommandRegisterFn): void {
    reigister(MoveCommands.ResetPosition, () => {
      if (this.initialPos) {
        this.rootGroup?.position(this.initialPos)
      }
    })
  }
}
