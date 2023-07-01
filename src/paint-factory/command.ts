import { Group } from 'konva/lib/Group'
import { Node } from 'konva/lib/Node'

export class CommandService {
  private static instance?: CommandService

  private commands = new Map<string, Function>()
  private rootGroup?: Group
  /** 用来执行需要 stage 的任务 */
  protected lazyMissions = new Set<() => void>()

  constructor() {
    if (!CommandService.instance) {
      CommandService.instance = this
    }
    return CommandService.instance
  }

  activeCommands(group: Group) {
    this.rootGroup = group

    this.lazyMissions.forEach(fn => fn())
    this.lazyMissions.clear()

    return this
  }

  registerCommand(key: string, handler: (node: Node) => void) {
    if (this.commands.has(key)) return this

    const stage = this.rootGroup?.getStage()

    const mission = () => {
      this.commands.set(key, handler)
      this.rootGroup
        ?.getStage()
        ?.off(key)
        .on(key, (e: any) => handler(e))
    }

    if (stage) {
      mission()
    } else {
      this.lazyMissions.add(mission)
    }

    return this
  }

  cleanCommands() {
    this.commands.forEach((_, key) => this.rootGroup?.getStage()?.off(key))
    this.commands.clear()

    return this
  }
}
