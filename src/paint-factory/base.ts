import Konva from 'konva'
import { Group } from 'konva/lib/Group'
import { Shape } from 'konva/lib/Shape'
import { merge } from 'lodash-es'

export interface DrawOptions {
  nodeConfig: Konva.NodeConfig
}

export enum DrawShapeType {
  Rect = 'rect',
  Line = 'line',
  Circle = 'circle',
  Text = 'text',
  Ellipse = 'ellipse',
  Curve = 'curve'
}

export abstract class DrawBase {
  protected _options: DrawOptions = {
    nodeConfig: { stroke: '#000' }
  }
  protected rootGroup?: Group
  protected _isActive = false
  protected eventList: Array<(shape: Shape | Group) => void> = []
  protected disposeEvents: Array<() => void> = []
  private commands = new Map<string, Function>()
  /** 用来执行需要 stage 的任务 */
  protected lazyMissions = new Set<() => void>()
  abstract readonly type: DrawShapeType

  constructor(opt?: DrawOptions) {
    this._options = merge(this._options, opt || {})
  }

  setGroup(group: Group) {
    this.rootGroup = group

    this.lazyMissions.forEach(fn => fn())

    return this
  }

  isActive() {
    return this._isActive
  }

  drawListener(handler: (node: Shape | Group) => void) {
    this.eventList.push(handler)

    return () => {
      const idx = this.eventList.indexOf(handler)
      this.eventList.splice(idx, 1)
    }
  }

  setOptions(options: DrawOptions) {
    this._options = merge({}, this._options, options || {})

    return this
  }

  getOptions() {
    return this._options
  }

  activate() {
    this._isActive = true
    this.mount()

    return this
  }

  protected registerCommands(key: string, handler: () => void) {
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

  deactivate() {
    this._isActive = false
    this.unmount()
    this.disposeEvents.forEach(fn => fn())

    return this
  }

  destroy() {
    this.deactivate()
    this.commands.forEach((_, key) => this.rootGroup?.getStage()?.off(key))
    this.commands.clear()
  }

  protected abstract mount(): void
  protected abstract unmount(): void
}
