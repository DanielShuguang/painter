import { RootGroupId } from '@/components/PaintBoard/composition'
import { Stage } from 'konva/lib/Stage'
import { Vector2d } from 'konva/lib/types'

/**
 * 获取相对于 dom 的坐标信息
 * @param ev
 * @param stage 需要进行相对定位的 stage
 * @param inGroup 是否需要根据 group 的位置和缩放比例二次计算
 */
export function getRelativePosition(ev: MouseEvent, stage?: Stage | null, inGroup?: boolean) {
  const dom = ev.target as HTMLElement | null
  const domRect = dom?.getBoundingClientRect() || { x: 0, y: 0 }
  const position = {
    x: Math.abs(ev.pageX - domRect.x),
    y: Math.abs(ev.pageY - domRect.y)
  }

  const rootGroup = stage?.findOne(`#${RootGroupId}`)
  if (inGroup && rootGroup) {
    const rootPos = rootGroup.position()
    position.x -= rootPos.x
    position.y -= rootPos.y
  }

  return stage ? positionByScale(position, stage) : position
}

export function positionByScale(position: Vector2d, stage: Stage) {
  const scale = stage.findOne(`#${RootGroupId}`)?.scale() || { x: 1, y: 1 }

  if (scale.x === 1 && scale.y === 1) return position

  const size = stage.size()
  const newSize = {
    x: size.width * scale.x,
    y: size.height * scale.y
  }

  return {
    x: (position.x / newSize.x) * size.width,
    y: (position.y / newSize.y) * size.height
  }
}
