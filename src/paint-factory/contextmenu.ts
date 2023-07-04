import { Node } from 'konva/lib/Node'
import { Group } from 'konva/lib/Group'
import { eventBus } from '@/utils/eventBus'
import { ContextmenuEvent } from '@/components/PaintBoard/composition'
import { MenuOption } from 'naive-ui'
import { nanoid } from 'nanoid'
import { omit } from 'lodash-es'

export type ContextmenuOption = MenuOption & {
  selector: (node: Node) => boolean
}

export class ContextmenuService {
  private static instance?: ContextmenuService

  private menuMap = new Map<string, ContextmenuOption>()
  private rootGroup?: Group
  private isActive = true

  constructor() {
    if (!ContextmenuService.instance) {
      ContextmenuService.instance = this
    }
    return ContextmenuService.instance
  }

  activeMenus(group: Group) {
    this.rootGroup = group
    const stage = this.rootGroup.getStage()
    stage?.off('contextmenu').on('contextmenu', e => {
      if (!this.isActive) return

      const menuList: MenuOption[] = []

      this.menuMap.forEach(menu => {
        if (menu.selector(e.target)) {
          menuList.push(omit(menu, 'selector'))
        }
      })

      if (menuList.length) {
        eventBus.emit(ContextmenuEvent, e, menuList)
      }
    })
  }

  toggle(active: boolean) {
    this.isActive = active
  }

  registerMenu(menu: ContextmenuOption) {
    if (!menu.key?.toString() || !this.menuMap.has(menu.key.toString())) {
      this.menuMap.set(menu.key?.toString() ?? nanoid(), menu)
    }

    return this
  }

  unregisterMenu(key: string) {
    this.menuMap.delete(key)

    return this
  }

  cleanMenu() {
    this.menuMap.clear()

    return this
  }
}
