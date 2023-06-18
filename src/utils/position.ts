export function getRelativePosition(ev: MouseEvent) {
  const dom = ev.target as HTMLElement
  const domRect = dom.getBoundingClientRect()
  const position = {
    x: Math.abs(ev.pageX - domRect.x),
    y: Math.abs(ev.pageY - domRect.y)
  }

  return position
}
