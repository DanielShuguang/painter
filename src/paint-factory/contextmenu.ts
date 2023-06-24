import { Vector2d } from 'konva/lib/types'
import { MenuOption } from 'naive-ui'
import { eventBus } from '@/utils/eventBus'
import { ContextmenuEvent } from '@/components/PaintBoard/composition'

export class ContextmenuService {
  private menuMap = new Map<string | symbol, MenuOption[]>()

  registerMenu(namespace: string, menus: MenuOption[]) {
    this.menuMap.set(namespace, menus)

    return this
  }

  toggleMenu(namespace: string | symbol, position: Vector2d) {
    const menus = this.menuMap.get(namespace)
    eventBus.emit(ContextmenuEvent, position, menus)

    return this
  }

  cleanMenu() {
    this.menuMap.clear()

    return this
  }
}
