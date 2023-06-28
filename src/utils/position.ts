/**
 * 获取相对于 stage 的坐标信息
 * @param ev
 */
export function getStagePosition(ev: MouseEvent) {
  const dom = ev.target as HTMLElement | null
  const domRect = dom?.getBoundingClientRect() || { x: 0, y: 0 }
  const position = {
    x: Math.abs(ev.pageX - domRect.x),
    y: Math.abs(ev.pageY - domRect.y)
  }

  return position
}
