import { Group } from 'konva/lib/Group'

export class CommandService {
  private commands = new Map<string, Function>()
  private rootGroup?: Group
  /** 用来执行需要 stage 的任务 */
  protected lazyMissions = new Set<() => void>()

  activeCommands(group: Group) {
    this.rootGroup = group

    this.lazyMissions.forEach(fn => fn())
    this.lazyMissions.clear()
  }

  registerCommand(key: string, handler: () => void) {
    const stage = this.rootGroup?.getStage()

    const mission = () => {
      this.commands.set(key, handler)
      this.rootGroup?.getStage()?.off(key).on(key, handler)
    }

    if (stage) {
      mission()
    } else {
      this.lazyMissions.add(mission)
    }
  }

  cleanCommands() {
    this.commands.forEach((_, key) => this.rootGroup?.getStage()?.off(key))
    this.commands.clear()
  }
}
